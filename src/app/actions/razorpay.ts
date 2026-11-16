'use server';

import { checkoutService } from '@/core/checkout/checkout.service';
import { orderRepository } from '@/core/order/order.repository';
import { OrderMapper } from '@/core/order/order.mapper';
import { razorpayAdapter } from '@/core/payment/razorpay.adapter';
import { type CartItem, type Coupon } from '@/core/cart/cart.types';
import { type CheckoutAddress, type ShippingMethod } from '@/core/checkout/checkout.types';
import { type CreateOrderParams, type PlacedOrder } from '@/core/order/order.types';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { payments } from '@/lib/db/schema/payment';
import { orders } from '@/lib/db/schema/order';
import { inArray, eq, or, sql } from 'drizzle-orm';
import { couponService } from '@/core/coupon/coupon.service';
import { logger } from '@/core/logger';
import { getCurrentUser } from '@/core/auth/session';

/**
 * Creates a Razorpay checkout order with authoritative server totals.
 * Prepares the transaction so the client can launch the official Razorpay modal.
 * Pre-persists a pending order record for automatic webhook reconciliation in case of sudden drops.
 */
export async function createRazorpayOrderAction(params: {
  items: CartItem[];
  shippingMethod: ShippingMethod;
  coupon: Coupon | null;
  address?: CheckoutAddress;
  orderNotes?: string;
}): Promise<{
  success: boolean;
  razorpayOrderId?: string;
  amount?: number; // in paise
  currency?: string;
  keyId?: string;
  error?: string;
}> {
  if (!params.items || params.items.length === 0) {
    return { success: false, error: 'Your cart is empty.' };
  }

  // 1. Authoritative Server-Side Price & Catalog Verification
  const productIds = Array.from(new Set(params.items.map((i) => i.productId)));
  const variantIds = Array.from(
    new Set(params.items.map((i) => i.variantId).filter(Boolean) as string[])
  );

  const [dbProducts, dbVariants] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length > 0
      ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds))
      : Promise.resolve([]),
  ]);

  const verifiedItems: CartItem[] = [];
  for (const item of params.items) {
    const dbProd = dbProducts.find((p) => p.id === item.productId);
    if (!dbProd || dbProd.status === 'archived' || dbProd.deletedAt) {
      return { success: false, error: `Product "${item.name}" is no longer available in the catalog.` };
    }

    let authoritativePrice = parseFloat(dbProd.price);

    if (item.variantId) {
      const dbVar = dbVariants.find((v) => v.id === item.variantId);
      if (!dbVar || dbVar.status === 'archived') {
        return { success: false, error: `The selected option for "${item.name}" is no longer available.` };
      }
      if (dbVar.price) {
        authoritativePrice = parseFloat(dbVar.price);
      }
    }

    verifiedItems.push({
      ...item,
      price: authoritativePrice,
    });
  }

  // 2. Validate inventory
  const inventoryResults = checkoutService.validateInventory(verifiedItems);
  const unavailable = inventoryResults.filter((r) => !r.isAvailable);
  if (unavailable.length > 0) {
    const names = unavailable.map((u) => {
      const item = verifiedItems.find((i) => i.productId === u.productId);
      return item?.name ?? u.productId;
    });
    return {
      success: false,
      error: `The following items are no longer available in the requested quantity: ${names.join(', ')}`,
    };
  }

  // 3. Authoritative Coupon Verification
  let serverVerifiedCoupon: Coupon | null = null;
  if (params.coupon?.code) {
    const couponRes = await couponService.validateCouponDetailed(
      params.coupon.code,
      verifiedItems.map((i) => ({ productId: i.productId, variantId: i.variantId, name: i.name }))
    );
    if (couponRes.valid && couponRes.coupon) {
      serverVerifiedCoupon = couponRes.coupon;
    } else {
      return {
        success: false,
        error: couponRes.error || `Coupon "${params.coupon.code}" is not eligible for this order.`,
      };
    }
  }

  // 4. Calculate authoritative order totals
  const totals = checkoutService.calculateOrderTotals(
    verifiedItems,
    params.shippingMethod,
    serverVerifiedCoupon
  );

  try {
    const receipt = `rcpt_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
    const rzpOrder = await razorpayAdapter.createOrder({
      amount: totals.total,
      currency: 'INR',
      receipt,
      notes: {
        itemCount: String(verifiedItems.length),
        shippingCarrier: params.shippingMethod.carrier,
      },
    });

    // 5. Pre-persist pending order record for seamless webhook reconciliation in case of sudden drops
    if (params.address) {
      try {
        const createParams: CreateOrderParams & { idempotencyKey: string } = {
          items: verifiedItems,
          address: params.address,
          shippingMethod: params.shippingMethod,
          paymentMethod: {
            type: 'razorpay',
            razorpayOrderId: rzpOrder.id,
          },
          couponCode: serverVerifiedCoupon?.code ?? null,
          orderNotes: params.orderNotes || '',
          subtotal: totals.subtotal,
          discount: totals.discount,
          shipping: totals.shipping,
          tax: totals.tax,
          total: totals.total,
          guestEmail: params.address.email,
          profileId: (await getCurrentUser())?.id ?? null,
          idempotencyKey: rzpOrder.id,
        };

        const dbOrder = await orderRepository.create(createParams);

        // Pre-insert pending payment record
        await db.insert(payments).values({
          orderId: dbOrder.id,
          provider: 'razorpay',
          transactionId: rzpOrder.id,
          amount: totals.total.toFixed(2),
          status: 'pending',
          currency: 'INR',
          providerPayload: {
            razorpayOrderId: rzpOrder.id,
          },
          providerResponse: {},
        });
      } catch (preCreateErr) {
        logger.warn('Failed to pre-create pending order record', { error: preCreateErr });
      }
    }

    return {
      success: true,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount, // in paise
      currency: rzpOrder.currency,
      keyId: razorpayAdapter.getKeyId(),
    };
  } catch (err: any) {
    logger.error('Failed to create Razorpay order', { error: err });
    return {
      success: false,
      error: err?.message || 'Could not initiate Razorpay payment. Please try again.',
    };
  }
}

/**
 * Verifies cryptographic Razorpay payment signature and persists the confirmed order.
 */
export async function verifyAndPlaceRazorpayOrderAction(params: {
  items: CartItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  coupon: Coupon | null;
  orderNotes: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<{ success: boolean; order?: PlacedOrder; error?: string }> {
  // 1. Cryptographic HMAC SHA256 Signature Verification
  const isValid = razorpayAdapter.verifySignature({
    razorpayOrderId: params.razorpayOrderId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
  });

  if (!isValid) {
    logger.error('Razorpay signature verification failed', {
      orderId: params.razorpayOrderId,
      paymentId: params.razorpayPaymentId,
    });
    return {
      success: false,
      error: 'Payment verification failed: cryptographic signature mismatch.',
    };
  }

  // 2. Authoritative Price & Line Items Verification
  const productIds = Array.from(new Set(params.items.map((i) => i.productId)));
  const variantIds = Array.from(
    new Set(params.items.map((i) => i.variantId).filter(Boolean) as string[])
  );

  const [dbProducts, dbVariants] = await Promise.all([
    db.select().from(products).where(inArray(products.id, productIds)),
    variantIds.length > 0
      ? db.select().from(productVariants).where(inArray(productVariants.id, variantIds))
      : Promise.resolve([]),
  ]);

  const verifiedItems: CartItem[] = [];
  for (const item of params.items) {
    const dbProd = dbProducts.find((p) => p.id === item.productId);
    if (!dbProd || dbProd.status === 'archived' || dbProd.deletedAt) {
      return { success: false, error: `Product "${item.name}" is no longer available.` };
    }

    let authoritativePrice = parseFloat(dbProd.price);

    if (item.variantId) {
      const dbVar = dbVariants.find((v) => v.id === item.variantId);
      if (!dbVar || dbVar.status === 'archived') {
        return { success: false, error: `Selected variant for "${item.name}" is no longer available.` };
      }
      if (dbVar.price) {
        authoritativePrice = parseFloat(dbVar.price);
      }
    }

    verifiedItems.push({
      ...item,
      price: authoritativePrice,
    });
  }

  // 3. Authoritative Coupon Verification
  let serverVerifiedCoupon: Coupon | null = null;
  if (params.coupon?.code) {
    const couponRes = await couponService.validateCouponDetailed(
      params.coupon.code,
      verifiedItems.map((i) => ({ productId: i.productId, variantId: i.variantId, name: i.name }))
    );
    if (couponRes.valid && couponRes.coupon) {
      serverVerifiedCoupon = couponRes.coupon;
    }
  }

  const totals = checkoutService.calculateOrderTotals(
    verifiedItems,
    params.shippingMethod,
    serverVerifiedCoupon
  );

  const createParams: CreateOrderParams = {
    items: verifiedItems,
    address: params.address,
    shippingMethod: params.shippingMethod,
    paymentMethod: {
      type: 'razorpay',
      razorpayPaymentId: params.razorpayPaymentId,
      razorpayOrderId: params.razorpayOrderId,
      razorpaySignature: params.razorpaySignature,
    },
    couponCode: serverVerifiedCoupon?.code ?? null,
    orderNotes: params.orderNotes,
    subtotal: totals.subtotal,
    discount: totals.discount,
    shipping: totals.shipping,
    tax: totals.tax,
    total: totals.total,
    guestEmail: params.address.email,
    profileId: (await getCurrentUser())?.id ?? null,
  };

  try {
    // 4. Check if order was already pre-created by idempotencyKey: params.razorpayOrderId
    const existingOrder = await db.query.orders.findFirst({
      where: eq(orders.idempotencyKey, params.razorpayOrderId),
    });

    let orderId: string;
    let orderNumber: string;

    if (existingOrder) {
      orderId = existingOrder.id;
      orderNumber = existingOrder.orderNumber!;
      // Update existing pending order to 'processing'
      await db
        .update(orders)
        .set({ status: 'processing', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    } else {
      // 4b. Persist new order in database with idempotency protection
      const dbResult = await orderRepository.create({
        ...createParams,
        idempotencyKey: params.razorpayOrderId,
      });
      orderId = dbResult.id;
      orderNumber = dbResult.orderNumber;
      await db
        .update(orders)
        .set({ status: 'processing', updatedAt: new Date() })
        .where(eq(orders.id, orderId));
    }

    // 5. Update or insert payment in payments audit table
    const existingPayment = await db
      .select()
      .from(payments)
      .where(
        or(
          eq(payments.transactionId, params.razorpayPaymentId),
          eq(payments.transactionId, params.razorpayOrderId),
          sql`${payments.providerPayload}->>'razorpayOrderId' = ${params.razorpayOrderId}`
        )
      )
      .limit(1);

    if (existingPayment.length > 0) {
      await db
        .update(payments)
        .set({
          transactionId: params.razorpayPaymentId,
          status: 'succeeded',
          capturedAt: new Date(),
          providerPayload: {
            razorpayOrderId: params.razorpayOrderId,
            razorpayPaymentId: params.razorpayPaymentId,
          },
          providerResponse: {
            status: 'captured',
            signatureVerified: true,
          },
          updatedAt: new Date(),
        })
        .where(eq(payments.id, existingPayment[0].id));
    } else {
      await db.insert(payments).values({
        orderId,
        provider: 'razorpay',
        transactionId: params.razorpayPaymentId,
        amount: totals.total.toFixed(2),
        status: 'succeeded',
        currency: 'INR',
        providerPayload: {
          razorpayOrderId: params.razorpayOrderId,
          razorpayPaymentId: params.razorpayPaymentId,
        },
        providerResponse: {
          status: 'captured',
          signatureVerified: true,
        },
        capturedAt: new Date(),
      });
    }

    const placedOrder = OrderMapper.toPlacedOrder(createParams, { id: orderId, orderNumber });
    placedOrder.status = 'processing';

    return { success: true, order: placedOrder };
  } catch (err) {
    logger.error('Failed to persist confirmed Razorpay order', { error: err });
    return {
      success: false,
      error: 'An unexpected error occurred while saving your order. Please contact support.',
    };
  }
}
