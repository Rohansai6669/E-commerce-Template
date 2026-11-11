'use server';

import { db } from '@/lib/db';
import { supplierProducts, supplierProductApprovalEvents, type SupplierProductApprovalStatus } from '@/lib/db/schema/catalog/supplier-products';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { getCurrentProfile } from '@/core/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Validates legal state transitions for the supplier product approval state machine.
 */
const LEGAL_TRANSITIONS: Record<SupplierProductApprovalStatus, SupplierProductApprovalStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['active', 'suspended', 'archived'],
  active: ['suspended', 'archived'],
  rejected: ['submitted', 'draft'], // Allows supplier resubmission
  suspended: ['active', 'archived'],
  archived: [],
};

export async function isValidTransition(
  from: SupplierProductApprovalStatus,
  to: SupplierProductApprovalStatus
): Promise<boolean> {
  return LEGAL_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Server action: Supplier submits their product listing for marketplace approval.
 * 3-Level Auth Enforcement:
 *   Level 1: Authentication
 *   Level 2: Role check ('supplier')
 *   Level 3: Resource Ownership (supplierProduct.supplierId === currentSupplier.id)
 */
export async function submitSupplierProductAction(
  supplierProductId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentProfile();
    if (!actor) return { success: false, error: 'Unauthenticated.' };

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.profileId, actor.id))
      .limit(1);

    if (!supplier && actor.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Supplier account required.' };
    }

    const [listing] = await db
      .select()
      .from(supplierProducts)
      .where(eq(supplierProducts.id, supplierProductId))
      .limit(1);

    if (!listing) return { success: false, error: 'Supplier product listing not found.' };

    // Resource Ownership Check
    if (actor.role !== 'admin' && supplier && listing.supplierId !== supplier.id) {
      return { success: false, error: 'Forbidden: You do not own this supplier product listing.' };
    }

    const currentStatus = listing.approvalStatus as SupplierProductApprovalStatus;
    const targetStatus: SupplierProductApprovalStatus = 'submitted';

    if (!isValidTransition(currentStatus, targetStatus)) {
      return {
        success: false,
        error: `Illegal state transition from '${currentStatus}' to '${targetStatus}'.`,
      };
    }

    await db.transaction(async (tx) => {
      // 1. Update listing status
      await tx
        .update(supplierProducts)
        .set({
          approvalStatus: targetStatus,
          updatedAt: new Date(),
        })
        .where(eq(supplierProducts.id, supplierProductId));

      // 2. Append approval audit event
      await tx.insert(supplierProductApprovalEvents).values({
        supplierProductId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        actorProfileId: actor.id,
        reason: 'Submitted by supplier for marketplace review',
      });
    });

    revalidatePath('/supplier/products');
    revalidatePath('/admin/suppliers');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)(`supplier-product:${supplierProductId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Failed to submit supplier product:', err);
    return { success: false, error: err.message || 'Failed to submit listing.' };
  }
}

/**
 * Server action: Marketplace Admin reviews, approves, rejects, or suspends a supplier listing.
 * 3-Level Auth Enforcement: Admin / Staff privileges required.
 */
export async function transitionSupplierProductStatusAction(
  supplierProductId: string,
  targetStatus: SupplierProductApprovalStatus,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentProfile();
    if (!actor || (actor.role !== 'admin' && actor.role !== 'staff')) {
      return { success: false, error: 'Unauthorized: Admin privileges required for approval transitions.' };
    }

    const [listing] = await db
      .select()
      .from(supplierProducts)
      .where(eq(supplierProducts.id, supplierProductId))
      .limit(1);

    if (!listing) return { success: false, error: 'Supplier product listing not found.' };

    const currentStatus = listing.approvalStatus as SupplierProductApprovalStatus;

    if (!isValidTransition(currentStatus, targetStatus)) {
      return {
        success: false,
        error: `Illegal state transition from '${currentStatus}' to '${targetStatus}'.`,
      };
    }

    await db.transaction(async (tx) => {
      // 1. Update status and review audit fields
      await tx
        .update(supplierProducts)
        .set({
          approvalStatus: targetStatus,
          rejectionReason: targetStatus === 'rejected' ? reason || null : listing.rejectionReason,
          reviewedBy: actor.id,
          reviewedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(supplierProducts.id, supplierProductId));

      // 2. Append audit history event
      await tx.insert(supplierProductApprovalEvents).values({
        supplierProductId,
        fromStatus: currentStatus,
        toStatus: targetStatus,
        actorProfileId: actor.id,
        reason: reason || `Status updated to ${targetStatus} by Admin`,
      });
    });

    revalidatePath('/admin/suppliers');
    revalidatePath('/supplier/products');
    revalidatePath('/products');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)(`supplier-product:${supplierProductId}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (revalidateTag as any)(`product:${listing.productId}`);

    return { success: true };
  } catch (err: any) {
    console.error('Failed to transition supplier product status:', err);
    return { success: false, error: err.message || 'Failed to update approval status.' };
  }
}
