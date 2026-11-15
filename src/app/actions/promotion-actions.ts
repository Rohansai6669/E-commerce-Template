'use server';

import { db } from '@/lib/db';
import { salesCampaigns, promotionOffers } from '@/lib/db/schema/catalog/promotions';
import { eq, inArray, sql, desc } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentProfile } from '@/core/auth/session';

/**
 * Ensures caller is an Admin or Staff with local dev fallback.
 */
async function enforceAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        role: 'admin' as const,
        isDevFallback: true,
      };
    }
    throw new Error('Unauthorized: Admin access required.');
  }
  return profile;
}

// ==========================================
// SALES CAMPAIGNS CRUD
// ==========================================

/**
 * Creates a platform sales campaign.
 */
export async function createCampaignAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

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

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Create campaign action failed:', err);
    return { success: false, error: err.message || 'Failed to create sales campaign.' };
  }
}

/**
 * Updates an existing sales campaign.
 */
export async function updateCampaignAction(
  campaignId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = formData.get('discountValue') as string;
    const startsAtStr = formData.get('startsAt') as string;
    const endsAtStr = formData.get('endsAt') as string;
    const priorityStr = formData.get('priority') as string;
    const status = formData.get('status') as string;

    if (!name || !discountType || !discountValue) {
      return { success: false, error: 'Name, discount type, and value are required.' };
    }

    const updatePayload: Record<string, any> = {
      name: name.trim(),
      description: description ? description.trim() : null,
      discountType,
      discountValue,
      updatedAt: new Date(),
    };

    if (startsAtStr) updatePayload.startsAt = new Date(startsAtStr);
    if (endsAtStr) updatePayload.endsAt = new Date(endsAtStr);
    if (priorityStr) updatePayload.priority = parseInt(priorityStr);
    if (status) updatePayload.status = status;

    await db
      .update(salesCampaigns)
      .set(updatePayload)
      .where(eq(salesCampaigns.id, campaignId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update campaign action failed:', err);
    return { success: false, error: err.message || 'Failed to update campaign.' };
  }
}

/**
 * Toggles a campaign's active status between 'active' and 'paused'.
 */
export async function toggleCampaignStatusAction(
  campaignId: string,
  currentStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    const newStatus = currentStatus === 'active' ? 'ended' : 'active';
    await db
      .update(salesCampaigns)
      .set({
        status: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(salesCampaigns.id, campaignId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Toggle campaign status action failed:', err);
    return { success: false, error: err.message || 'Failed to toggle campaign status.' };
  }
}

/**
 * Soft deletes a campaign.
 */
export async function deleteCampaignAction(campaignId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    await db
      .update(salesCampaigns)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(salesCampaigns.id, campaignId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Delete campaign action failed:', err);
    return { success: false, error: err.message || 'Failed to delete campaign.' };
  }
}

/**
 * Bulk soft deletes multiple campaigns at once.
 */
export async function bulkDeleteCampaignsAction(
  campaignIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await enforceAdmin();

    if (!campaignIds || campaignIds.length === 0) {
      return { success: true, count: 0 };
    }

    const chunkSize = 100;
    for (let i = 0; i < campaignIds.length; i += chunkSize) {
      const chunk = campaignIds.slice(i, i + chunkSize);
      await db
        .update(salesCampaigns)
        .set({ deletedAt: new Date() })
        .where(inArray(salesCampaigns.id, chunk));
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true, count: campaignIds.length };
  } catch (err: any) {
    console.error('Bulk delete campaigns action failed:', err);
    return { success: false, error: err.message || 'Failed to bulk delete campaigns.' };
  }
}

/**
 * Automatically cleans up duplicate campaigns, preserving only the most recent entry per name.
 */
export async function cleanupDuplicateCampaignsAction(): Promise<{
  success: boolean;
  removedCount?: number;
  error?: string;
}> {
  try {
    await enforceAdmin();

    const allCampaigns = await db
      .select({ id: salesCampaigns.id, name: salesCampaigns.name, createdAt: salesCampaigns.createdAt })
      .from(salesCampaigns)
      .where(sql`${salesCampaigns.deletedAt} IS NULL`)
      .orderBy(desc(salesCampaigns.createdAt));

    const seenNames = new Set<string>();
    const duplicateIds: string[] = [];

    for (const c of allCampaigns) {
      const normalizedName = c.name.trim().toLowerCase();
      if (seenNames.has(normalizedName)) {
        duplicateIds.push(c.id);
      } else {
        seenNames.add(normalizedName);
      }
    }

    if (duplicateIds.length > 0) {
      const chunkSize = 100;
      for (let i = 0; i < duplicateIds.length; i += chunkSize) {
        const chunk = duplicateIds.slice(i, i + chunkSize);
        await db
          .update(salesCampaigns)
          .set({ deletedAt: new Date() })
          .where(inArray(salesCampaigns.id, chunk));
      }
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true, removedCount: duplicateIds.length };
  } catch (err: any) {
    console.error('Cleanup duplicate campaigns failed:', err);
    return { success: false, error: err.message || 'Failed to clean up duplicate campaigns.' };
  }
}

// ==========================================
// PROMOTION OFFERS CRUD
// ==========================================

/**
 * Creates a promotional offer targeting specific or all products.
 */
export async function createOfferAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    const title = formData.get('title') as string;
    const productId = formData.get('productId') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = formData.get('discountValue') as string;
    const priorityStr = formData.get('priority') as string;
    const status = (formData.get('status') as any) || 'active';

    if (!title || !discountType || !discountValue) {
      return { success: false, error: 'Title, discount type, and discount value are required.' };
    }

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

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Create offer action failed:', err);
    return { success: false, error: err.message || 'Failed to create promotion offer.' };
  }
}

/**
 * Updates an existing promotional offer.
 */
export async function updateOfferAction(
  offerId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    const title = formData.get('title') as string;
    const productId = formData.get('productId') as string;
    const discountType = formData.get('discountType') as 'percentage' | 'fixed';
    const discountValue = formData.get('discountValue') as string;
    const priorityStr = formData.get('priority') as string;
    const status = formData.get('status') as string;

    if (!title || !discountType || !discountValue) {
      return { success: false, error: 'Title, discount type, and discount value are required.' };
    }

    const updatePayload: Record<string, any> = {
      title: title.trim(),
      productId: productId && productId.trim() ? productId.trim() : null,
      discountType,
      discountValue,
      updatedAt: new Date(),
    };

    if (priorityStr) updatePayload.priority = parseInt(priorityStr);
    if (status) updatePayload.status = status;

    await db
      .update(promotionOffers)
      .set(updatePayload)
      .where(eq(promotionOffers.id, offerId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Update offer action failed:', err);
    return { success: false, error: err.message || 'Failed to update offer.' };
  }
}

/**
 * Toggles an offer's active status between 'active' and 'paused'.
 */
export async function toggleOfferStatusAction(
  offerId: string,
  currentStatus: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await db
      .update(promotionOffers)
      .set({
        status: newStatus as any,
        updatedAt: new Date(),
      })
      .where(eq(promotionOffers.id, offerId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Toggle offer status failed:', err);
    return { success: false, error: err.message || 'Failed to toggle offer status.' };
  }
}

/**
 * Soft deletes a promotional offer.
 */
export async function deleteOfferAction(offerId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdmin();

    await db
      .update(promotionOffers)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(promotionOffers.id, offerId));

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    console.error('Delete offer action failed:', err);
    return { success: false, error: err.message || 'Failed to delete offer.' };
  }
}

/**
 * Bulk soft deletes multiple offers at once.
 */
export async function bulkDeleteOffersAction(
  offerIds: string[]
): Promise<{ success: boolean; count?: number; error?: string }> {
  try {
    await enforceAdmin();

    if (!offerIds || offerIds.length === 0) {
      return { success: true, count: 0 };
    }

    const chunkSize = 100;
    for (let i = 0; i < offerIds.length; i += chunkSize) {
      const chunk = offerIds.slice(i, i + chunkSize);
      await db
        .update(promotionOffers)
        .set({ deletedAt: new Date() })
        .where(inArray(promotionOffers.id, chunk));
    }

    revalidatePath('/admin/promotions');
    revalidatePath('/');
    return { success: true, count: offerIds.length };
  } catch (err: any) {
    console.error('Bulk delete offers action failed:', err);
    return { success: false, error: err.message || 'Failed to bulk delete offers.' };
  }
}
