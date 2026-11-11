import { pgTable, uuid, decimal, timestamp, text } from 'drizzle-orm/pg-core';
import { suppliers } from './suppliers';
import { supplierLedgerReferenceTypeEnum } from '../enums';

export const supplierLedger = pgTable('supplier_ledger', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  credit: decimal('credit', { precision: 12, scale: 2 }).default('0.00').notNull(),
  debit: decimal('debit', { precision: 12, scale: 2 }).default('0.00').notNull(),
  referenceType: supplierLedgerReferenceTypeEnum('reference_type').notNull(),
  referenceId: text('reference_id').notNull(), // Links to order item UUID, payout UUID, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
