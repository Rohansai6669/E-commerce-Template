import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { ticketPriorityEnum, ticketStatusEnum, ticketEventTypeEnum } from '../enums';
import { profiles } from '../auth';
import { orders } from '../order';

export const tickets = pgTable('tickets', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'set null' }),
  subject: text('subject').notNull(),
  priority: ticketPriorityEnum('priority').default('low').notNull(),
  status: ticketStatusEnum('status').default('open').notNull(),
  assignedTo: uuid('assigned_to').references(() => profiles.id, { onDelete: 'set null' }),
  ...auditColumns,
});

export const ticketMessages = pgTable('ticket_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }).notNull(),
  senderId: uuid('sender_id').references(() => profiles.id, { onDelete: 'restrict' }).notNull(),
  message: text('message').notNull(),
  attachments: jsonb('attachments').default([]).notNull(), // array of media URLs
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const ticketEvents = pgTable('ticket_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  ticketId: uuid('ticket_id').references(() => tickets.id, { onDelete: 'cascade' }).notNull(),
  eventType: ticketEventTypeEnum('event_type').notNull(),
  eventDetails: jsonb('event_details').default({}).notNull(),
  triggeredBy: uuid('triggered_by').references(() => profiles.id, { onDelete: 'restrict' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
