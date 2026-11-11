import { pgTable, uuid, text, decimal, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { returnStatusEnum, returnQcResultEnum } from '../enums';
import { orders, orderItems } from '../order';
import { supplierOrders } from '../marketplace/supplier-orders';
import { profiles } from '../auth';

export const returns = pgTable('returns', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  supplierOrderId: uuid('supplier_order_id').references(() => supplierOrders.id, { onDelete: 'cascade' }),
  status: returnStatusEnum('status').default('requested').notNull(),
  reason: text('reason').notNull(),
  refundAmount: decimal('refund_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),

  // QC parameters
  qcResult: returnQcResultEnum('qc_result'),
  images: jsonb('images').default([]).notNull(), // QC snapshots
  inspectionNotes: text('inspection_notes'),
  approvedBy: uuid('approved_by').references(() => profiles.id, { onDelete: 'set null' }),

  ...auditColumns,
});

export const returnItems = pgTable('return_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  returnId: uuid('return_id').references(() => returns.id, { onDelete: 'cascade' }).notNull(),
  orderItemId: uuid('order_item_id').references(() => orderItems.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  condition: text('condition'), // e.g. 'damaged', 'unopened'
});
