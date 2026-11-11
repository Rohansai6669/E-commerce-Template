'use server';

import { db } from '@/lib/db';
import { coupons } from '@/lib/db/schema/marketing';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new discount coupon supporting target product, category, or collection restrictions.
 */
export async function createCouponAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const code = formData.get('code') as string;
  const discountType = formData.get('discountType') as 'percentage' | 'fixed';
  const discountValue = formData.get('discountValue') as string;
  const minOrderValue = formData.get('minOrderValue') as string;
  const maxDiscountValue = formData.get('maxDiscountValue') as string;
  const usageLimit = formData.get('usageLimit') as string;
  const targetProductIdsStr = formData.get('targetProductIds') as string;
  const targetCategoryIdsStr = formData.get('targetCategoryIds') as string;
  const targetCollectionIdsStr = formData.get('targetCollectionIds') as string;

  if (!code || !discountType || !discountValue) {
    return { success: false, error: 'Code, type and value are required.' };
  }

  try {
    const targetProductIds = targetProductIdsStr
      ? targetProductIdsStr.split(',').map((id) => id.trim()).filter(Boolean)
      : [];

    const targetCategoryIds = targetCategoryIdsStr
      ? targetCategoryIdsStr.split(',').map((id) => id.trim()).filter(Boolean)
      : [];

    const targetCollectionIds = targetCollectionIdsStr
      ? targetCollectionIdsStr.split(',').map((id) => id.trim()).filter(Boolean)
      : [];

    const metadata: Record<string, any> = {};
    if (targetProductIds.length > 0) metadata.targetProductIds = targetProductIds;
    if (targetCategoryIds.length > 0) metadata.targetCategoryIds = targetCategoryIds;
    if (targetCollectionIds.length > 0) metadata.targetCollectionIds = targetCollectionIds;

    await db.insert(coupons).values({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      minOrderValue: minOrderValue ? minOrderValue : null,
      maxDiscountValue: maxDiscountValue ? maxDiscountValue : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      isActive: true,
      metadata,
    });

    console.log(`[Coupon Created] ${code}`);
    revalidatePath('/admin/coupons');
    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (err) {
    console.error('Create coupon action failed:', err);
    return { success: false, error: 'Failed to create coupon (code must be unique).' };
  }
}

/**
 * Toggles a coupon's active status.
 */
export async function toggleCouponAction(id: string, currentlyActive: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(coupons)
      .set({
        isActive: !currentlyActive,
        updatedAt: new Date(),
      })
      .where(eq(coupons.id, id));

    console.log(`[Coupon Toggled] ID: ${id}, New State: ${!currentlyActive}`);
    revalidatePath('/admin/coupons');
    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (err) {
    console.error('Toggle coupon action failed:', err);
    return { success: false, error: 'Failed to toggle coupon.' };
  }
}

/**
 * Soft deletes a coupon to preserve historical orders reference integrity.
 */
export async function deleteCouponAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(coupons)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(coupons.id, id));

    console.log(`[Coupon Soft-Deleted] ID: ${id}`);
    revalidatePath('/admin/coupons');
    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (err) {
    console.error('Delete coupon action failed:', err);
    return { success: false, error: 'Failed to delete coupon.' };
  }
}
