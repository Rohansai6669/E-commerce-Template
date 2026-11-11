import { db } from '@/lib/db';
import { supplierInventory, supplierInventoryMovements } from '@/lib/db/schema/marketplace/supplier-inventory';
import { orders } from '@/lib/db/schema/order';
import { eq, and, sql, lt, inArray } from 'drizzle-orm';
import { CandidateSupplierScore } from './supplier-routing-service';

export class SupplierStockService {
  /**
   * Deduplicates and sorts all candidate SPV IDs deterministically ASC,
   * then executes SELECT ... FOR UPDATE row locks to prevent deadlocks.
   */
  async lockGlobalCandidateRows(candidateSPVIds: string[], client: any = db) {
    if (candidateSPVIds.length === 0) return;

    const sortedIds = Array.from(new Set(candidateSPVIds)).sort();

    await client
      .select({ id: supplierInventory.id })
      .from(supplierInventory)
      .where(inArray(supplierInventory.supplierProductVariantId, sortedIds))
      .orderBy(supplierInventory.supplierProductVariantId)
      .for('update');
  }

  /**
   * Attempts atomic reservation across ranked candidate suppliers.
   * Derives movement ledger fields directly from the RETURNING mutation state.
   */
  async reserveStockWithFallback(
    candidates: CandidateSupplierScore[],
    quantity: number,
    orderId: string,
    client: any = db
  ): Promise<CandidateSupplierScore> {
    for (const candidate of candidates) {
      const [updated] = await client
        .update(supplierInventory)
        .set({
          available: sql`${supplierInventory.available} - ${quantity}`,
          reserved: sql`${supplierInventory.reserved} + ${quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(supplierInventory.supplierProductVariantId, candidate.supplierProductVariantId),
            gte(supplierInventory.available, quantity)
          )
        )
        .returning({
          id: supplierInventory.id,
          available: supplierInventory.available,
          reserved: supplierInventory.reserved,
        });

      if (updated) {
        const afterAvailable = updated.available;
        const beforeAvailable = afterAvailable + quantity;
        const afterReserved = updated.reserved;
        const beforeReserved = afterReserved - quantity;

        // Log auditable movement ledger
        await client.insert(supplierInventoryMovements).values({
          supplierInventoryId: updated.id,
          reason: 'SALE',
          movementType: 'RESERVE',
          quantity,
          beforeAvailable,
          afterAvailable,
          beforeReserved,
          afterReserved,
          referenceType: 'ORDER',
          referenceId: orderId,
          notes: `Stock reserved for order ${orderId}`,
        });

        return candidate;
      }
    }

    throw new Error('INSUFFICIENT_STOCK: No authorized candidate supplier had sufficient available stock.');
  }

  /**
   * Atomically returns reserved stock to available stock (WHERE reserved >= quantity).
   */
  async releaseReservedStock(
    supplierProductVariantId: string,
    quantity: number,
    orderId: string,
    client: any = db
  ) {
    const [updated] = await client
      .update(supplierInventory)
      .set({
        available: sql`${supplierInventory.available} + ${quantity}`,
        reserved: sql`${supplierInventory.reserved} - ${quantity}`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(supplierInventory.supplierProductVariantId, supplierProductVariantId),
          gte(supplierInventory.reserved, quantity)
        )
      )
      .returning({
        id: supplierInventory.id,
        available: supplierInventory.available,
        reserved: supplierInventory.reserved,
      });

    if (!updated) {
      throw new Error(`RELEASE_FAILED: Reserved stock underflow or inventory row missing for variant ${supplierProductVariantId}`);
    }

    const afterAvailable = updated.available;
    const beforeAvailable = afterAvailable - quantity;
    const afterReserved = updated.reserved;
    const beforeReserved = afterReserved + quantity;

    await client.insert(supplierInventoryMovements).values({
      supplierInventoryId: updated.id,
      reason: 'CANCEL',
      movementType: 'RELEASE_RESERVATION',
      quantity,
      beforeAvailable,
      afterAvailable,
      beforeReserved,
      afterReserved,
      referenceType: 'ORDER',
      referenceId: orderId,
      notes: `Stock released from cancelled order ${orderId}`,
    });

    return updated;
  }

  /**
   * Periodic expiry worker: Finds expired pending orders, conditionally cancels the order
   * (WHERE status = 'pending' AND reservation_expires_at < NOW() RETURNING id),
   * and releases stock ONLY if 1 row was returned by the state transition.
   */
  async expirePendingReservations(client: any = db) {
    const now = new Date();

    const expiredOrders = await client
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.status, 'pending'), lt(orders.reservationExpiresAt, now)));

    let cancelledCount = 0;

    for (const expOrder of expiredOrders) {
      const [cancelled] = await client
        .update(orders)
        .set({ status: 'cancelled', updatedAt: now })
        .where(
          and(
            eq(orders.id, expOrder.id),
            eq(orders.status, 'pending'),
            lt(orders.reservationExpiresAt, now)
          )
        )
        .returning({ id: orders.id });

      if (cancelled) {
        cancelledCount++;

        // Fetch exact reservation movements recorded for this order
        const movements = await client
          .select({
            supplierInventoryId: supplierInventoryMovements.supplierInventoryId,
            quantity: supplierInventoryMovements.quantity,
            supplierProductVariantId: supplierInventory.supplierProductVariantId,
          })
          .from(supplierInventoryMovements)
          .innerJoin(supplierInventory, eq(supplierInventoryMovements.supplierInventoryId, supplierInventory.id))
          .where(
            and(
              eq(supplierInventoryMovements.referenceType, 'ORDER'),
              eq(supplierInventoryMovements.referenceId, cancelled.id),
              eq(supplierInventoryMovements.movementType, 'RESERVE')
            )
          );

        for (const mov of movements) {
          await this.releaseReservedStock(mov.supplierProductVariantId, mov.quantity, cancelled.id, client);
        }
      }
    }

    return cancelledCount;
  }
}

import { gte } from 'drizzle-orm';
export const supplierStockService = new SupplierStockService();
