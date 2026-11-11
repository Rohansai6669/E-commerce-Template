'use server';

import { db } from '@/lib/db';
import { tickets, ticketMessages, ticketEvents } from '@/lib/db/schema/support/tickets';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Ensures caller is an Admin or Staff.
 */
async function enforceStaffAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    throw new Error('Unauthorized: Administrative access is required.');
  }
  return profile;
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

      // Append Ticket Event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'status_changed',
        eventDetails: { oldStatus: ticket.status, newStatus: status },
        triggeredBy: actor.id,
      });

      // Audit logs
      await tx.insert(auditLogs).values({
        actorId: actor.id,
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

      // Append Ticket Event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'assigned',
        eventDetails: { assigneeId: assignedToProfileId },
        triggeredBy: actor.id,
      });

      // Audit logs
      await tx.insert(auditLogs).values({
        actorId: actor.id,
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
      // 1. Insert message
      await tx.insert(ticketMessages).values({
        ticketId,
        senderId: actor.id,
        message,
        attachments: [],
      });

      // 2. Append event
      await tx.insert(ticketEvents).values({
        ticketId,
        eventType: 'supplier_replied', // Representing platform/admin reply
        eventDetails: { length: message.length },
        triggeredBy: actor.id,
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
