'use server';

import { db } from '@/lib/db';
import { tickets, ticketMessages, ticketEvents } from '@/lib/db/schema/support/tickets';
import { profiles } from '@/lib/db/schema/auth';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Ensures caller is an Admin or Staff.
 * In development mode, falls back to dev admin profile if unauthenticated.
 */
async function enforceStaffAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@lexido.in',
        role: 'admin' as const,
        name: 'Store Administrator',
        fullName: 'Store Administrator',
        isDevFallback: true,
      };
    }
    throw new Error('Unauthorized: Administrative access is required.');
  }
  return profile;
}

/**
 * Returns a valid actor ID for nullable audit logging, ensuring foreign key safety for dev fallback actors.
 */
function getSafeActorId(actor?: { id?: string; isDevFallback?: boolean } | null): string | null {
  if (!actor || !actor.id || (actor as any).isDevFallback || actor.id === '00000000-0000-0000-0000-000000000000') {
    return null;
  }
  return actor.id;
}

/**
 * Resolves a non-null actor ID for strictly foreign-keyed tables, reusing an existing profile if running dev fallback.
 */
async function getRequiredActorId(actor: any, tx?: any): Promise<string> {
  let actorId = actor.id;
  if (actor.isDevFallback || actorId === '00000000-0000-0000-0000-000000000000') {
    const client = tx || db;
    const [existing] = await client.select({ id: profiles.id }).from(profiles).limit(1);
    if (existing) {
      actorId = existing.id;
    }
  }
  return actorId;
}

/**
 * Updates status of a support ticket.
 */
export async function updateTicketStatusAction(
  ticketId: string,
  status: 'open' | 'in-progress' | 'pending-customer' | 'closed'
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceStaffAuthorization();

    await db.transaction(async (tx) => {
      const [ticket] = await tx.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
      if (!ticket) throw new Error('Ticket not found.');

      // Update status
      await tx.update(tickets).set({ status }).where(eq(tickets.id, ticketId));

      const effectiveActorId = await getRequiredActorId(actor, tx);

      // Append Ticket Event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'status_changed',
        eventDetails: { oldStatus: ticket.status, newStatus: status },
        triggeredBy: effectiveActorId,
      });

      // Audit logs
      await tx.insert(auditLogs).values({
        actorId: getSafeActorId(actor),
        entity: 'ticket',
        entityId: ticketId,
        action: 'status_changed',
        newValue: { status },
      });
    });

    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath('/admin/tickets');
    return { success: true };
  } catch (err: any) {
    console.error('Update ticket status failed:', err);
    return { success: false, error: err.message || 'Failed to update ticket status.' };
  }
}

/**
 * Assigns a ticket to a staff member.
 */
export async function assignTicketAction(
  ticketId: string,
  assignedToProfileId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceStaffAuthorization();

    await db.transaction(async (tx) => {
      // Update assignee
      await tx.update(tickets).set({ assignedTo: assignedToProfileId }).where(eq(tickets.id, ticketId));

      const effectiveActorId = await getRequiredActorId(actor, tx);

      // Append Ticket Event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'assigned',
        eventDetails: { assigneeId: assignedToProfileId },
        triggeredBy: effectiveActorId,
      });

      // Audit logs
      await tx.insert(auditLogs).values({
        actorId: getSafeActorId(actor),
        entity: 'ticket',
        entityId: ticketId,
        action: 'assigned',
        newValue: { assignedTo: assignedToProfileId },
      });
    });

    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath('/admin/tickets');
    return { success: true };
  } catch (err: any) {
    console.error('Assign ticket failed:', err);
    return { success: false, error: err.message || 'Failed to update ticket assignment.' };
  }
}

/**
 * Appends a staff reply message to the ticket conversation.
 */
export async function replyToTicketAction(
  ticketId: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceStaffAuthorization();

    if (!message.trim()) {
      return { success: false, error: 'Reply message cannot be empty.' };
    }

    await db.transaction(async (tx) => {
      const effectiveActorId = await getRequiredActorId(actor, tx);

      // 1. Insert message
      await tx.insert(ticketMessages).values({
        ticketId,
        senderId: effectiveActorId,
        message,
        attachments: [],
      });

      // 2. Append event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'supplier_replied', // Representing platform/admin reply
        eventDetails: { length: message.length },
        triggeredBy: effectiveActorId,
      });
    });

    revalidatePath(`/admin/tickets/${ticketId}`);
    revalidatePath('/admin/tickets');
    return { success: true };
  } catch (err: any) {
    console.error('Reply to ticket failed:', err);
    return { success: false, error: err.message || 'Failed to add reply message.' };
  }
}
