import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema/order';
import { coupons, couponRedemptions } from '@/lib/db/schema/marketing';
import { products } from '@/lib/db/schema/catalog/products';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { inventory } from '@/lib/db/schema/inventory';
import { supplierProductVariants } from '@/lib/db/schema/catalog/supplier-product-variants';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import { type CreateOrderParams } from './order.types';
import crypto from 'crypto';
import { supplierStockService } from '@/lib/services/supplier-stock-service';
import { supplierRoutingService } from '@/lib/services/supplier-routing-service';
import { consignmentRoutingService, type ConsignmentItemPlan } from '@/lib/services/consignment-routing-service';
import { getStoreModeServer } from '@/core/config/store-mode.server';
import { couponService } from '@/core/coupon/coupon.service';

/**
 * Generates a human-readable, cryptographically unique order number: ORD-YYMM-XXXXX.
 */
function generateOrderNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const token = crypto.randomBytes(3).toString('hex').toUpperCase().slice(0, 5);
  return `ORD-${yy}${mm}-${token}`;
}

/**
 * OrderRepository abstracts database access for order persistence.
 */
export class OrderRepository {
  /**
   * Creates a new order with line items in a single transaction.
   * Handles idempotency, global candidate locking, supplier routing with failover,
   * atomic stock reservation, and split consignment financial snapshots.
   */
  async create(params: CreateOrderParams & { idempotencyKey?: string }): Promise<{ id: string; orderNumber: string }> {
    let attempts = 0;
    let orderNumber = generateOrderNumber();

    const checkoutRequestHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(params))
      .digest('hex');

    const reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minute payment reservation window

    while (attempts < 3) {
      try {
        const result = await db.transaction(async (tx) => {
          // 0. Resolve Coupon ID and analyze attribute eligibility if promo code applied
          let matchedCouponId: string | null = null;
          if (params.couponCode) {
            const validation = await couponService.validateCouponDetailed(
              params.couponCode,
              params.items.map((i) => ({ productId: i.productId, variantId: i.variantId, name: i.name }))
            );

            if (validation.valid && validation.coupon) {
              const [c] = await tx
                .select({ id: coupons.id })
                .from(coupons)
                .where(eq(coupons.code, validation.coupon.code))
                .limit(1);
              if (c) {
                matchedCouponId = c.id;
              }
            } else {
              console.warn(`Coupon "${params.couponCode}" rejected during checkout: ${validation.error}`);
            }
          }

          // 1. Idempotency Check & Atomic Insertion
          let order: { id: string; orderNumber: string | null } | undefined;

          if (params.idempotencyKey) {
            const [inserted] = await tx
              .insert(orders)
              .values({
                orderNumber,
                idempotencyKey: params.idempotencyKey,
                checkoutRequestHash,
                reservationExpiresAt,
                profileId: params.profileId ?? null,
                couponId: matchedCouponId,
                status: 'pending',
                subtotal: params.subtotal.toFixed(2),
                taxAmount: params.tax.toFixed(2),
                shippingAmount: params.shipping.toFixed(2),
                discountAmount: params.discount.toFixed(2),
                totalAmount: params.total.toFixed(2),
                shippingAddress: params.address,
                billingAddress: params.address,
              })
              .onConflictDoNothing({ target: orders.idempotencyKey })
              .returning({ id: orders.id, orderNumber: orders.orderNumber });

            order = inserted;

            if (!order) {
              // Existing order collision — retrieve existing record
              const existing = await tx.query.orders.findFirst({
                where: eq(orders.idempotencyKey, params.idempotencyKey),
              });

              if (existing) {
                if (existing.checkoutRequestHash !== checkoutRequestHash) {
                  throw new Error('IDEMPOTENCY_KEY_REUSE: Idempotency key reused with different checkout parameters.');
                }
                return { id: existing.id, orderNumber: existing.orderNumber || orderNumber };
              }
            }
          }

          if (!order) {
            const [newOrder] = await tx
              .insert(orders)
              .values({
                orderNumber,
                idempotencyKey: params.idempotencyKey,
                checkoutRequestHash,
                reservationExpiresAt,
                profileId: params.profileId ?? null,
                couponId: matchedCouponId,
                status: 'pending',
                subtotal: params.subtotal.toFixed(2),
                taxAmount: params.tax.toFixed(2),
                shippingAmount: params.shipping.toFixed(2),
                discountAmount: params.discount.toFixed(2),
                totalAmount: params.total.toFixed(2),
                shippingAddress: params.address,
                billingAddress: params.address,
              })
              .returning({ id: orders.id, orderNumber: orders.orderNumber });

            order = newOrder;
          }

          // Record coupon redemption & atomically increment usage with concurrency guard
          if (matchedCouponId && order) {
            const [updatedCoupon] = await tx
              .update(coupons)
              .set({
                usedCount: sql`${coupons.usedCount} + 1`,
                updatedAt: new Date(),
              })
              .where(
                and(
                  eq(coupons.id, matchedCouponId),
                  or(
                    sql`${coupons.usageLimit} IS NULL`,
                    sql`${coupons.usedCount} < ${coupons.usageLimit}`
                  )
                )
              )
              .returning({ id: coupons.id });

            if (!updatedCoupon) {
              throw new Error('COUPON_USAGE_LIMIT_EXCEEDED: This coupon code has reached its maximum global redemption limit.');
            }

            await tx.insert(couponRedemptions).values({
              couponId: matchedCouponId,
              orderId: order.id,
              profileId: null,
            });
          }

          // 2. Insert line items into order_items table with permanent snapshots
          const createdOrderItems = [];
          if (params.items.length > 0) {
            // Pre-fetch actual variant SKUs and authoritative cost prices for exact historical receipt & margin tracking
            const variantIds = params.items.map((i) => i.variantId).filter(Boolean) as string[];
            const productIds = Array.from(new Set(params.items.map((i) => i.productId)));

            const [vRows, pRows] = await Promise.all([
              variantIds.length > 0
                ? tx
                    .select({ id: productVariants.id, sku: productVariants.sku, costPrice: productVariants.costPrice })
                    .from(productVariants)
                    .where(inArray(productVariants.id, variantIds))
                : Promise.resolve([]),
              tx
                .select({ id: products.id, costPrice: products.costPrice })
                .from(products)
                .where(inArray(products.id, productIds)),
            ]);

            const variantSkuMap = new Map<string, string>();
            const variantCostMap = new Map<string, string | null>();
            vRows.forEach((r) => {
              variantSkuMap.set(r.id, r.sku);
              variantCostMap.set(r.id, r.costPrice);
            });

            const productCostMap = new Map<string, string | null>();
            pRows.forEach((r) => productCostMap.set(r.id, r.costPrice));

            const insertedItems = await tx
              .insert(orderItems)
              .values(
                params.items.map((item) => {
                  const optionsSummary =
                    item.options && Object.keys(item.options).length > 0
                      ? Object.entries(item.options)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(', ')
                      : '';
                  const snapshotName = optionsSummary
                    ? `${item.name} (${optionsSummary})`
                    : item.name;
                  const itemSku =
                    (item.variantId && variantSkuMap.get(item.variantId)) ||
                    item.productId;

                  // Snapshot authoritative cost price: prefer variant cost, then base product cost
                  const resolvedCost =
                    (item.variantId && variantCostMap.get(item.variantId)) ||
                    productCostMap.get(item.productId) ||
                    (item.price * 0.5).toFixed(2);

                  return {
                    orderId: order!.id,
                    productId: item.productId,
                    variantId: item.variantId,
                    name: snapshotName,
                    sku: itemSku,
                    price: item.price.toFixed(2),
                    costPrice: resolvedCost ? Number(resolvedCost).toFixed(2) : null,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                  };
                })
              )
              .returning();
            createdOrderItems.push(...insertedItems);
          }

          // 3. Check operating mode: Standalone Direct Inventory vs. Marketplace Multi-Supplier Routing
          const storeMode = await getStoreModeServer();

          if (storeMode === 'standalone') {
            // Direct central inventory deduction for standalone mode
            for (let i = 0; i < params.items.length; i++) {
              const cartItem = params.items[i];
              await tx
                .update(inventory)
                .set({
                  quantity: sql`${inventory.quantity} - ${cartItem.quantity}`,
                  updatedAt: new Date(),
                })
                .where(
                  cartItem.variantId
                    ? eq(inventory.variantId, cartItem.variantId)
                    : eq(inventory.productId, cartItem.productId)
                );
            }
          } else {
            // Routing & Consignment Split for Marketplace Mode
            const candidateSPVIds: string[] = [];
            const itemPlans: ConsignmentItemPlan[] = [];

            for (let i = 0; i < params.items.length; i++) {
              const cartItem = params.items[i];
              const orderItem = createdOrderItems[i];

              if (cartItem.variantId) {
                // Find brandId for product
                const product = await tx.query.products.findFirst({
                  where: eq(products.id, cartItem.productId),
                });
                const brandId = product?.brandId || 'default';

                // Fetch candidate SPV IDs for deterministic locking
                const candidateSPVs = await tx
                  .select({ id: supplierProductVariants.id })
                  .from(supplierProductVariants)
                  .innerJoin(supplierProducts, eq(supplierProductVariants.supplierProductId, supplierProducts.id))
                  .where(eq(supplierProductVariants.variantId, cartItem.variantId));

                candidateSPVIds.push(...candidateSPVs.map((c) => c.id));
              }
            }

            // Lock candidate inventory rows deterministically (SELECT FOR UPDATE)
            if (candidateSPVIds.length > 0) {
              await supplierStockService.lockGlobalCandidateRows(candidateSPVIds, tx);
            }

            // Perform Candidate Failover & Reservation
            for (let i = 0; i < params.items.length; i++) {
              const cartItem = params.items[i];
              const orderItem = createdOrderItems[i];

              if (cartItem.variantId) {
                const product = await tx.query.products.findFirst({
                  where: eq(products.id, cartItem.productId),
                });
                const brandId = product?.brandId || 'default';

                const candidates = await supplierRoutingService.rankSupplierCandidates(
                  cartItem.variantId,
                  brandId,
                  cartItem.quantity,
                  tx
                );

                if (candidates.length > 0) {
                  const winningSupplier = await supplierStockService.reserveStockWithFallback(
                    candidates,
                    cartItem.quantity,
                    order.id,
                    tx
                  );

                  itemPlans.push({
                    orderItemId: orderItem.id,
                    variantId: cartItem.variantId,
                    quantity: cartItem.quantity,
                    unitSellingPrice: cartItem.price,
                    grossAmount: cartItem.price * cartItem.quantity,
                    discountAmount: 0,
                    shippingAmount: 0,
                    selectedSupplier: winningSupplier,
                  });
                }
              }
            }

            // Create consignments with complete financial item snapshots
            if (itemPlans.length > 0) {
              await consignmentRoutingService.createConsignmentsForOrder(order.id, itemPlans, tx);
            }
          }

          return { id: order.id, orderNumber: order.orderNumber || orderNumber };
        });

        return result;
      } catch (err: any) {
        if (err?.message?.includes('IDEMPOTENCY_KEY_REUSE')) {
          throw err;
        }

        // Narrow check: Only retry if 23505 is specifically caused by order_number constraint violation
        const isOrderNumberCollision =
          err?.code === '23505' &&
          (err?.constraint === 'orders_order_number_unique' ||
            err?.detail?.includes('order_number') ||
            err?.message?.includes('order_number'));

        if (isOrderNumberCollision && attempts < 2) {
          attempts++;
          orderNumber = generateOrderNumber();
          continue;
        }

        throw err;
      }
    }

    throw new Error('Failed to generate a unique order number after maximum retries.');
  }

  /**
   * Fetches an order by its database ID.
   */
  async findById(id: string) {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
    });
    return order ?? null;
  }

  /**
   * Fetches all orders associated with a customer profile, ordered by newest first.
   */
  async getOrdersByProfileId(profileId: string) {
    const rows = await db.query.orders.findMany({
      where: eq(orders.profileId, profileId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
    return rows;
  }

  /**
   * Fetches detailed order details including items, for a specific customer profile.
   * Asserts ownership to verify access.
   */
  async getOrderDetailById(id: string, profileId: string) {
    const row = await db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.profileId, profileId)),
      with: {
        items: true,
        shippingMethod: true,
      },
    });
    return row ?? null;
  }

  /**
   * Finds an order matching the orderNumber and customer email (supporting column & JSONB fallback).
   */
  async findForTracking(orderNumber: string, email: string) {
    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanEmail = email.trim().toLowerCase();

    const [row] = await db
      .select()
      .from(orders)
      .where(
        and(
          or(
            sql`UPPER(${orders.orderNumber}) = ${cleanNum}`,
            sql`UPPER(${orders.shippingAddress}->>'orderNumber') = ${cleanNum}`
          ),
          sql`lower(${orders.shippingAddress}->>'email') = ${cleanEmail}`
        )
      )
      .limit(1);
    return row ?? null;
  }

  /**
   * Fetches all orders in the system, ordered by newest first (for admin/staff use).
   */
  async getAllOrders() {
    const rows = await db.query.orders.findMany({
      limit: 50,
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
    return rows;
  }

  /**
   * Updates status of an order by ID.
   */
  async updateStatus(id: string, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded') {
    const [updated] = await db
      .update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return updated ?? null;
  }
}

export const orderRepository = new OrderRepository();
export default orderRepository;
