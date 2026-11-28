'use server';

import { checkoutService } from '@/core/checkout/checkout.service';
import { orderRepository } from '@/core/order/order.repository';
import { OrderMapper } from '@/core/order/order.mapper';
import { getPaymentAdapter } from '@/core/payment/payment.factory';
import { type CartItem, type Coupon } from '@/core/cart/cart.types';
import { type CheckoutAddress, type ShippingMethod, type PaymentMethod } from '@/core/checkout/checkout.types';
import { type CreateOrderParams, type PlacedOrder } from '@/core/order/order.types';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { payments } from '@/lib/db/schema/payment';
import { inArray } from 'drizzle-orm';
import { couponService } from '@/core/coupon/coupon.service';
import { getCurrentUser } from '@/core/auth/session';
import { getLogisticsConfig } from '@/lib/shipping/logistics-manager';

/**
 * Server action to process and persist an order.
 * Safe from browser bundler node-specific module compilation issues.
 */
export async function placeOrderAction(params: {
  items: CartItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  coupon: Coupon | null;
  orderNotes: string;
}): Promise<{ success: boolean; order?: PlacedOrder; error?: string }> {
  if (!params.items || params.items.length === 0) {
    return { success: false, error: 'Your cart is empty.' };
  }

  // 1. Authoritative Server-Side Price & Catalog Status Verification (Never trust client prices)
  const productIds = Array.from(new Set(params.items.map((i) => i.productId)));
  const variantIds = Array.from(new Set(params.items.map((i) => i.variantId).filter(Boolean) as string[]));

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
      price: authoritativePrice, // STRICT SERVER OVERWRITE
    });
  }

  // 2. Validate inventory availability against authoritative items
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

  // 3. Authoritative Coupon Verification & Attribute Analysis
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
        error: couponRes.error || `Coupon "${params.coupon.code}" is not eligible for your current order.`,
      };
    }
  }

  // 3.5. Authoritative Logistics & COD Availability Verification
  const logisticsConfig = await getLogisticsConfig();
  if (params.paymentMethod.type === 'cod' && !logisticsConfig.enableCod) {
    return {
      success: false,
      error: 'Cash on Delivery is currently disabled by the store. Please choose an online payment method.',
    };
  }

  // 4. Recompute totals with authoritative prices, coupon, and store logistics rules
  const totals = checkoutService.calculateOrderTotals(
    verifiedItems,
    params.shippingMethod,
    serverVerifiedCoupon,
    logisticsConfig
  );

  // 5. Build order create parameters
  const createParams: CreateOrderParams = {
    items: verifiedItems,
    address: params.address,
    shippingMethod: params.shippingMethod,
    paymentMethod: params.paymentMethod,
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
    // 4. Persist order in the database (transactional write)
    const dbResult = await orderRepository.create(createParams);

    // 5. Process payment via configured adapter
    const paymentAdapter = getPaymentAdapter();
    const paymentResult = await paymentAdapter.processPayment({
      orderId: dbResult.id,
      amount: totals.total,
      currency: 'INR',
      paymentType: params.paymentMethod.type,
      customerEmail: params.address.email,
    });

    if (!paymentResult.success) {
      return {
        success: false,
        error: paymentResult.error ?? 'Payment processing failed. Please try again.',
      };
    }

    // Record in payments audit table
    await db
      .insert(payments)
      .values({
        orderId: dbResult.id,
        provider: params.paymentMethod.type,
        transactionId: paymentResult.transactionId,
        amount: totals.total.toFixed(2),
        status: params.paymentMethod.type === 'cod' ? 'pending' : 'succeeded',
        currency: 'INR',
        providerPayload: { paymentType: params.paymentMethod.type },
        providerResponse: { success: true, transactionId: paymentResult.transactionId },
        capturedAt: params.paymentMethod.type === 'cod' ? null : new Date(),
      })
      .catch((err) => console.error('Failed to audit payment record:', err));

    // 6. Map to the final PlacedOrder view model
    const order = OrderMapper.toPlacedOrder(createParams, dbResult);

    return { success: true, order };
  } catch (err) {
    console.error('Failed to place order:', err);
    return {
      success: false,
      error: 'An unexpected error occurred while placing your order. Please try again.',
    };
  }
}

import { rateLimiter } from '@/core/security/rate-limit';
import { securityConfig } from '@/core/config/security';
import { headers } from 'next/headers';
import { shiprocketClient } from '@/lib/shipping/shiprocket';
import { orders } from '@/lib/db/schema/order';
import { eq } from 'drizzle-orm';

/**
 * Public guest and customer order tracking action.
 * Synchronizes in real time with Shiprocket courier telemetry when an AWB is present.
 * Leverages RateLimiter boundaries to prevent enumeration lookups.
 */
export async function trackOrderAction(
  orderNumber: string,
  emailOrPhone: string
): Promise<{
  success: boolean;
  status?: string;
  createdAt?: Date;
  orderNumber?: string | null;
  destinationCity?: string | null;
  awb?: string | null;
  courierName?: string | null;
  trackingUrl?: string | null;
  estimatedDelivery?: string | null;
  latestScan?: { status: string; location: string; activity: string; timestamp: string } | null;
  activities?: Array<{ date: string; status: string; activity: string; location: string }>;
  error?: string;
}> {
  if (!orderNumber || !emailOrPhone) {
    return { success: false, error: 'Order reference / AWB and billing email or phone are required.' };
  }

  try {
    const reqHeaders = await headers();
    const ip = reqHeaders.get('x-forwarded-for') || '127.0.0.1';

    // Apply rate limiter check
    const rateCheck = await rateLimiter.isRateLimited(
      `track-order:${ip}`,
      securityConfig.rateLimit.guestTracking.limit,
      securityConfig.rateLimit.guestTracking.windowMs
    );

    if (rateCheck.success) {
      return {
        success: false,
        error: 'Too many tracking attempts. Please try again in a few minutes.',
      };
    }

    const order = await orderRepository.findForTracking(orderNumber, emailOrPhone);
    if (!order) {
      // Generic error response to mitigate information leakage
      return {
        success: false,
        error: 'No order found matching the provided reference and email / phone.',
      };
    }

    const currentAddr = (order.shippingAddress || {}) as Record<string, any>;
    let tracking = (currentAddr.tracking || {}) as Record<string, any>;
    let currentStatus = order.status;

    // Real-time synchronization with Shiprocket if AWB exists
    if (tracking.awb) {
      try {
        const liveTracking = await shiprocketClient.trackAwb(tracking.awb);
        if (liveTracking.success) {
          const rawStatus = (liveTracking.currentStatus || '').toUpperCase();
          let newOrderStatus = order.status;

          if (rawStatus.includes('DELIVERED')) {
            newOrderStatus = 'delivered';
          } else if (
            rawStatus.includes('IN TRANSIT') ||
            rawStatus.includes('OUT FOR DELIVERY') ||
            rawStatus.includes('PICKED UP') ||
            rawStatus.includes('SHIPPED') ||
            rawStatus.includes('AWB ASSIGNED')
          ) {
            newOrderStatus = 'shipped';
          } else if (rawStatus.includes('CANCELED') || rawStatus.includes('CANCELLED')) {
            newOrderStatus = 'cancelled';
          }

          const liveActivities = liveTracking.activities || [];
          const latestActivity = liveActivities[0];

          const updatedTracking = {
            ...tracking,
            shippingProvider: 'shiprocket',
            courierName: liveTracking.courierName || tracking.courierName,
            trackingUrl: liveTracking.trackingUrl || tracking.trackingUrl,
            estimatedDelivery: liveTracking.etd || tracking.estimatedDelivery,
            lastStatus: liveTracking.currentStatus || tracking.lastStatus,
            activities: liveActivities.length > 0 ? liveActivities : tracking.activities || [],
            latestScan: latestActivity
              ? {
                  status: latestActivity.status,
                  location: latestActivity.location,
                  activity: latestActivity.activity,
                  timestamp: latestActivity.date || new Date().toISOString(),
                }
              : tracking.latestScan,
            syncedAt: new Date().toISOString(),
          };

          // Cache updated tracking & status back to PostgreSQL database
          await db
            .update(orders)
            .set({
              status: newOrderStatus,
              shippingAddress: {
                ...currentAddr,
                tracking: updatedTracking,
              },
              updatedAt: new Date(),
            })
            .where(eq(orders.id, order.id))
            .catch((err) => console.warn('Failed to cache live Shiprocket tracking in DB:', err));

          tracking = updatedTracking;
          currentStatus = newOrderStatus;
        }
      } catch (syncErr) {
        console.warn('[Shiprocket Tracking Sync Warning]:', syncErr);
      }
    }

    return {
      success: true,
      status: currentStatus,
      createdAt: order.createdAt,
      orderNumber: order.orderNumber,
      destinationCity: currentAddr.city || null,
      awb: tracking?.awb || null,
      courierName: tracking?.courierName || null,
      trackingUrl: tracking?.trackingUrl || null,
      estimatedDelivery: tracking?.estimatedDelivery || null,
      latestScan: tracking?.latestScan || null,
      activities: tracking?.activities || [],
    };
  } catch (err) {
    console.error('Track order action failure:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}
