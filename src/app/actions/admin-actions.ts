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
    const actor = await getCurrentProfile();
    if (!actor || (actor.role !== 'admin' && actor.role !== 'staff')) {
      return { success: false, error: 'Unauthorized: Admin privileges required.' };
    }

    await db
      .update(reviews)
      .set({
        status: 'hidden',
        deletedAt: new Date(),
        deletedBy: actor.id,
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
