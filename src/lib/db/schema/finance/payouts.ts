import { pgTable, uuid, decimal, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { suppliers } from '../marketplace/suppliers';

export const supplierPayouts = pgTable('supplier_payouts', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  referenceNumber: text('reference_number').notNull(), // banking payout reference
  bankDetails: jsonb('bank_details').default({}).notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }).defaultNow().notNull(),
});
