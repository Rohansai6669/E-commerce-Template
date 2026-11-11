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

  // 4. Recompute totals with authoritative prices and server-verified coupon
  const totals = checkoutService.calculateOrderTotals(
    verifiedItems,
    params.shippingMethod,
    serverVerifiedCoupon
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

/**
 * Public guest order tracking action.
 * Leverages RateLimiter boundaries to prevent enumeration lookups.
 */
export async function trackOrderAction(
  orderNumber: string,
  email: string
): Promise<{ success: boolean; status?: string; createdAt?: Date; error?: string }> {
  if (!orderNumber || !email) {
    return { success: false, error: 'Order number and billing email address are required.' };
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

    const order = await orderRepository.findForTracking(orderNumber, email);
    if (!order) {
      // Generic error response to mitigate information leakage
      return {
        success: false,
        error: 'No order found matching the provided reference and email.',
      };
    }

    return {
      success: true,
      status: order.status,
      createdAt: order.createdAt,
    };
  } catch (err) {
    console.error('Track order action failure:', err);
    return { success: false, error: 'An unexpected error occurred. Please try again later.' };
  }
}

import { rateLimiter } from '@/core/security/rate-limit';
import { securityConfig } from '@/core/config/security';
import { headers } from 'next/headers';
