import { pgTable, uuid, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { profiles } from './auth';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  actorId: uuid('actor_id').references(() => profiles.id, { onDelete: 'set null' }),
  entity: text('entity').notNull(), // e.g. 'supplier', 'product', 'ticket', 'return'
  entityId: text('entity_id').notNull(), // UUID of the resource
  action: text('action').notNull(), // e.g. 'create', 'status_changed', 'assigned'
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
