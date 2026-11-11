'use server';

import { db } from '@/lib/db';
import { returns } from '@/lib/db/schema/support/returns';
import { supplierLedger } from '@/lib/db/schema/marketplace/supplier-ledger';
import { supplierOrders } from '@/lib/db/schema/marketplace/supplier-orders';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Ensures caller is an Admin or Staff.
 */
async function enforceAdminAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    throw new Error('Unauthorized: Administrative access is required.');
  }
  return profile;
}

/**
 * Moderates customer returns and QC inspection notes.
 * Employs a database transaction to log debits in supplier ledger.
 */
export async function moderateReturnQCAction(params: {
  returnId: string;
  status: 'requested' | 'approved' | 'item_received' | 'qc_passed' | 'qc_failed' | 'refunded' | 'rejected';
  qcResult?: 'pass' | 'fail';
  inspectionNotes?: string;
  refundAmount?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();
    const { returnId, status, qcResult, inspectionNotes, refundAmount = 0 } = params;

    return await db.transaction(async (tx) => {
      // 1. Fetch current return request
      const [ret] = await tx.select().from(returns).where(eq(returns.id, returnId)).limit(1);
      if (!ret) throw new Error('Return request not found.');

      // State machine validation
      const validTransitions: Record<string, string[]> = {
        requested: ['approved', 'rejected'],
        approved: ['item_received', 'rejected'],
        item_received: ['qc_passed', 'qc_failed'],
        qc_passed: ['refunded'],
        qc_failed: ['rejected', 'refunded'], // Depending on policy
      };

      const allowed = validTransitions[ret.status];
      if (allowed && !allowed.includes(status) && status !== ret.status) {
        return { success: false, error: `Invalid transition from state "${ret.status}" to "${status}".` };
      }

      // 2. Perform updates
      await tx
        .update(returns)
        .set({
          status,
          qcResult: qcResult || null,
          inspectionNotes: inspectionNotes || null,
          refundAmount: refundAmount.toFixed(2),
          approvedBy: actor.id,
        })
        .where(eq(returns.id, returnId));

      // 3. Ledger adjustments for refunded returns
      if (status === 'refunded' && ret.status !== 'refunded') {
        if (ret.supplierOrderId) {
          const [subOrder] = await tx
            .select()
            .from(supplierOrders)
            .where(eq(supplierOrders.id, ret.supplierOrderId))
            .limit(1);

          if (subOrder) {
            // Append Debit line item to ledger
            await tx.insert(supplierLedger).values({
              supplierId: subOrder.supplierId,
              debit: refundAmount.toFixed(2),
              credit: '0.00',
              referenceType: 'refund',
              referenceId: returnId,
            });

            // Adjust supplier sub-order status
            await tx
              .update(supplierOrders)
              .set({ status: 'refunded' })
              .where(eq(supplierOrders.id, ret.supplierOrderId));
          }
        }
      }

      // 4. Record audit trace log
      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'return',
        entityId: returnId,
        action: 'status_changed',
        oldValue: { status: ret.status, qcResult: ret.qcResult },
        newValue: { status, qcResult },
      });

      revalidatePath('/admin');
      revalidatePath('/admin/returns');
      revalidatePath(`/admin/returns/${returnId}`);
      revalidatePath('/account/orders');

      return { success: true };
    });
  } catch (err: any) {
    console.error('moderateReturnQCAction failed:', err);
    return { success: false, error: err.message || 'Failed to complete return moderation.' };
  }
}
