import { pgTable, uuid, text, decimal, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { paymentStatusEnum } from './enums';
import { orders } from './order';

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  provider: text('provider').notNull(), // 'stripe', 'razorpay', 'cod'
  transactionId: text('transaction_id').unique(), // Payment gateway transaction reference ID
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').default('pending').notNull(),
  idempotencyKey: text('idempotency_key').unique(),
  currency: text('currency').default('USD').notNull(),
  providerFee: decimal('provider_fee', { precision: 12, scale: 2 }),
  providerPayload: jsonb('provider_payload').default({}).notNull(),
  providerResponse: jsonb('provider_response').default({}).notNull(),
  capturedAt: timestamp('captured_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
