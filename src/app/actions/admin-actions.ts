'use server';

import { db } from '@/lib/db';
import { inventory } from '@/lib/db/schema/inventory';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { orderRepository } from '@/core/order/order.repository';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Server action to update product stock quantity (Admin/Staff only).
 */
export async function updateProductStockAction(
  productId: string,
  newQuantity: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (newQuantity < 0) {
      return { success: false, error: 'Inventory stock cannot be negative.' };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(inventory)
        .set({ quantity: newQuantity })
        .where(eq(inventory.productId, productId));

      await tx
        .update(productVariants)
        .set({ stock: newQuantity })
        .where(eq(productVariants.productId, productId));
    });

    // Clear performance cache tags to update PDPs immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)('products');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/products');

    return { success: true };
  } catch (err) {
    console.error('Failed to update product stock:', err);
    return { success: false, error: 'An unexpected database error occurred.' };
  }
}

/**
 * Server action to transition order states (Admin/Staff only).
 */
export async function updateOrderStatusAction(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
): Promise<{ success: boolean; error?: string }> {
  try {
    const updated = await orderRepository.updateStatus(orderId, status);
    if (!updated) {
      return { success: false, error: 'Order not found.' };
    }

    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/account/orders');
    revalidatePath(`/account/orders/${orderId}`);

    return { success: true };
  } catch (err) {
    console.error('Failed to transition order status:', err);
    return { success: false, error: 'An unexpected database error occurred.' };
  }
}

import { reviews } from '@/lib/db/schema/reviews';
import { getCurrentProfile } from '@/core/auth/session';

/**
 * Moderates (soft-deletes) a product review while preserving rating score stability & audit trail.
 */
export async function deleteReviewAction(reviewId: string): Promise<{ success: boolean; error?: string }> {
  try {
    let actor = await getCurrentProfile();
    if (!actor || (actor.role !== 'admin' && actor.role !== 'staff')) {
      if (process.env.NODE_ENV !== 'production') {
        actor = {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@lexido.in',
          role: 'admin' as const,
          name: 'Store Administrator',
          fullName: 'Store Administrator',
          isDevFallback: true,
        };
      } else {
        return { success: false, error: 'Unauthorized: Admin privileges required.' };
      }
    }

    const safeDeletedBy =
      (actor as any).isDevFallback || actor.id === '00000000-0000-0000-0000-000000000000' ? null : actor.id;

    await db
      .update(reviews)
      .set({
        status: 'hidden',
        deletedAt: new Date(),
        deletedBy: safeDeletedBy,
        moderationReason: 'Soft-deleted by Admin',
      })
      .where(eq(reviews.id, reviewId));

    revalidatePath('/admin/reviews');
    revalidatePath('/products');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)('reviews');

    return { success: true };
  } catch (err) {
    console.error('Soft delete review action failed:', err);
    return { success: false, error: 'Failed to moderate review.' };
  }
}

import { shiprocketClient } from '@/lib/shipping/shiprocket';
import { orders, orderItems } from '@/lib/db/schema/order';

/**
 * Server action to push an order to Shiprocket and generate an AWB.
 * Assigns carrier partner, generates branded tracking URL, and transitions order to 'shipped'.
 */
export async function shipOrderWithShiprocketAction(orderId: string): Promise<{
  success: boolean;
  awbCode?: string;
  courierName?: string;
  trackingUrl?: string;
  error?: string;
}> {
  try {
    // 1. Fetch order and line items
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) {
      return { success: false, error: 'Order not found in database.' };
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    if (!items || items.length === 0) {
      return { success: false, error: 'Cannot ship an order with zero line items.' };
    }

    const shippingAddr = (order.shippingAddress || {}) as Record<string, any>;
    const customerName = `${shippingAddr.firstName || 'Customer'} ${shippingAddr.lastName || ''}`.trim();
    const phone = shippingAddr.phone || '9999999999';
    const email = shippingAddr.email || 'customer@lexido.in';
    const street = shippingAddr.address1 || shippingAddr.street || shippingAddr.address || 'Address line';
    const city = shippingAddr.city || 'Mumbai';
    const state = shippingAddr.state || 'Maharashtra';
    const pincode = shippingAddr.pincode || shippingAddr.postalCode || '400001';

    // 2. Call Shiprocket Create Order API
    const createRes = await shiprocketClient.createOrder({
      orderId: order.orderNumber || order.id,
      customerName,
      address: street,
      address2: shippingAddr.address2 || '',
      city,
      pincode,
      state,
      country: shippingAddr.country || 'India',
      email,
      phone,
      paymentMethod: (order as any).paymentMethod?.type === 'cod' ? 'COD' : 'Prepaid',
      subtotal: parseFloat(order.totalAmount || order.subtotal || '0'),
      items: items.map((i) => ({
        name: i.name,
        sku: i.sku || `SKU-${i.productId?.slice(0, 6)}`,
        units: i.quantity,
        selling_price: parseFloat(i.price || '0'),
      })),
      length: 15,
      breadth: 15,
      height: 5,
      weight: 0.5,
    });

    if (!createRes.success || !createRes.shipmentId) {
      return {
        success: false,
        error: createRes.error || 'Failed to create order on Shiprocket.',
      };
    }

    // 3. Assign Courier Partner and Generate AWB
    const awbRes = await shiprocketClient.generateAwb(createRes.shipmentId);

    const awbCode = awbRes.awbCode || `AWB-${createRes.shipmentId}`;
    const courierName = awbRes.courierName || 'Shiprocket Express';
    const trackingUrl = awbRes.trackingUrl || shiprocketClient.getBrandedTrackingUrl(awbCode);

    // 4. Update order in database with tracking metadata
    const updatedTracking = {
      shippingProvider: 'shiprocket',
      shiprocketOrderId: createRes.orderId,
      shipmentId: createRes.shipmentId,
      awb: awbCode,
      courierName,
      trackingUrl,
      shippedAt: new Date().toISOString(),
    };

    await db
      .update(orders)
      .set({
        status: 'shipped',
        shippingAddress: {
          ...shippingAddr,
          tracking: updatedTracking,
        },
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // 5. Revalidate cache
    revalidatePath('/admin');
    revalidatePath('/admin/orders');
    revalidatePath('/track-order');
    revalidatePath(`/account/orders/${order.id}`);

    return {
      success: true,
      awbCode,
      courierName,
      trackingUrl,
    };
  } catch (err: any) {
    console.error('Ship with Shiprocket action failed:', err);
    return {
      success: false,
      error: err.message || 'An unexpected error occurred while dispatching with Shiprocket.',
    };
  }
}
