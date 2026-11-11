import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const supplierInvitations = pgTable('supplier_invitations', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull(),
  supplierName: text('supplier_name').notNull(),
  token: text('token').unique().notNull(),
  commissionRate: text('commission_rate').default('10.00').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'accepted' | 'expired'
  brandIds: jsonb('brand_ids').default([]).notNull(),
  invitedBy: uuid('invited_by'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type SupplierInvitation = typeof supplierInvitations.$inferSelect;
export type NewSupplierInvitation = typeof supplierInvitations.$inferInsert;
