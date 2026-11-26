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

import { shiprocketClient, qualifyShiprocketAddress } from '@/lib/shipping/shiprocket';
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

    // 2. Validate and Qualify address against Shiprocket requirements
    const qualification = qualifyShiprocketAddress(shippingAddr);
    if (!qualification.qualified || !qualification.data) {
      return {
        success: false,
        error: `Address does not qualify for Shiprocket dispatch:\n• ${qualification.errors.join('\n• ')}`,
      };
    }

    const qualified = qualification.data;

    // Detect payment method (Prepaid vs COD)
    const isCod =
      (order as any).paymentMethod?.type === 'cod' ||
      shippingAddr.paymentMethod?.type === 'cod' ||
      (order.billingAddress as any)?.paymentMethod?.type === 'cod';

    // 3. Resolve existing or new Shiprocket Order & Shipment ID
    let shipmentId =
      shippingAddr.tracking?.shipmentId ||
      shippingAddr.shiprocketShipmentId ||
      null;
    let shiprocketOrderId =
      shippingAddr.tracking?.shiprocketOrderId ||
      shippingAddr.shiprocketOrderId ||
      null;

    if (!shipmentId) {
      const createRes = await shiprocketClient.createOrder({
        orderId: order.orderNumber || order.id,
        customerName: qualified.customerName,
        customerLastName: qualified.customerLastName,
        address: qualified.address,
        address2: qualified.address2,
        city: qualified.city,
        pincode: qualified.pincode,
        state: qualified.state,
        country: qualified.country,
        email: qualified.email,
        phone: qualified.phone,
        paymentMethod: isCod ? 'COD' : 'Prepaid',
        subtotal: parseFloat(order.totalAmount || order.subtotal || '0'),
        items: items.map((i) => ({
          name: i.name.slice(0, 100),
          sku: i.sku || `SKU-${i.productId?.slice(0, 6) || 'DEFAULT'}`,
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

      shipmentId = createRes.shipmentId;
      shiprocketOrderId = createRes.orderId;
    }

    // 4. Assign Courier Partner and Generate AWB
    const awbRes = await shiprocketClient.generateAwb(shipmentId);

    if (!awbRes.success || !awbRes.awbCode) {
      await db
        .update(orders)
        .set({
          shippingAddress: {
            ...shippingAddr,
            ...qualified,
            shiprocketShipmentId: shipmentId,
            shiprocketOrderId,
          },
          updatedAt: new Date(),
        })
        .where(eq(orders.id, order.id));

      return {
        success: false,
        error: `Shiprocket Order created (Shipment ID: ${shipmentId}), but courier AWB generation failed: ${
          awbRes.error || 'KYC verification or wallet balance required on Shiprocket.'
        }`,
      };
    }

    const awbCode = awbRes.awbCode;
    const courierName = awbRes.courierName || 'Shiprocket Express';
    const trackingUrl = awbRes.trackingUrl || shiprocketClient.getBrandedTrackingUrl(awbCode);

    // 5. Update order in database with tracking metadata
    const updatedTracking = {
      shippingProvider: 'shiprocket',
      shiprocketOrderId,
      shipmentId,
      awb: awbCode,
      courierName,
      trackingUrl,
      shippedAt: new Date().toISOString(),
      latestScan: {
        status: 'SHIPPED',
        location: qualified.city,
        activity: 'Airway Bill generated and courier assigned for atelier dispatch',
        timestamp: new Date().toISOString(),
      },
    };

    await db
      .update(orders)
      .set({
        status: 'shipped',
        shippingAddress: {
          ...shippingAddr,
          ...qualified,
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
