'use server';

import { db } from '@/lib/db';
import { salesCampaigns, promotionOffers } from '@/lib/db/schema/catalog/promotions';
import { revalidatePath } from 'next/cache';

/**
 * Creates a platform sales campaign (e.g., "Dussehra Special Sale", "Summer Fashion").
 * Supports targetProductIds, targetCategoryIds, and targetCollectionIds for targeted eligibility restrictions.
 */
export async function createCampaignAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const discountType = formData.get('discountType') as 'percentage' | 'fixed';
  const discountValue = formData.get('discountValue') as string;
  const startsAtStr = formData.get('startsAt') as string;
  const endsAtStr = formData.get('endsAt') as string;
  const priorityStr = formData.get('priority') as string;
  const targetProductIdsStr = formData.get('targetProductIds') as string;
  const targetCategoryIdsStr = formData.get('targetCategoryIds') as string;
  const targetCollectionIdsStr = formData.get('targetCollectionIds') as string;
  const status = (formData.get('status') as any) || 'active';

  if (!name || !discountType || !discountValue || !startsAtStr || !endsAtStr) {
    return { success: false, error: 'Name, discount type, value, and validity dates are required.' };
  }

  try {
    const startsAt = new Date(startsAtStr);
    const endsAt = new Date(endsAtStr);
    const priority = priorityStr ? parseInt(priorityStr) : 100;

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

    await db.insert(salesCampaigns).values({
      name: name.trim(),
      description: description ? description.trim() : null,
      discountType,
      discountValue,
      startsAt,
      endsAt,
      status,
      priority,
      isStackable: false,
      metadata,
    });

    console.log(`[Campaign Created] ${name}`);
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Create campaign action failed:', err);
    return { success: false, error: 'Failed to create sales campaign.' };
  }
}

/**
 * Creates a promotional offer targeting specific or all products.
 */
export async function createOfferAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const title = formData.get('title') as string;
  const productId = formData.get('productId') as string;
  const discountType = formData.get('discountType') as 'percentage' | 'fixed';
  const discountValue = formData.get('discountValue') as string;
  const priorityStr = formData.get('priority') as string;
  const status = (formData.get('status') as any) || 'active';

  if (!title || !discountType || !discountValue) {
    return { success: false, error: 'Title, discount type, and discount value are required.' };
  }

  try {
    const priority = priorityStr ? parseInt(priorityStr) : 50;

    await db.insert(promotionOffers).values({
      title: title.trim(),
      ownerType: 'platform',
      productId: productId && productId.trim() ? productId.trim() : null,
      discountType,
      discountValue,
      priority,
      isStackable: false,
      status,
    });

    console.log(`[Offer Created] ${title}`);
    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Create offer action failed:', err);
    return { success: false, error: 'Failed to create promotion offer.' };
  }
}
