import { pgTable, uuid, text, decimal, timestamp, integer, unique } from 'drizzle-orm/pg-core';
import { orders, orderItems } from '../order';
import { suppliers } from './suppliers';
import { supplierProductVariants } from '../catalog/supplier-product-variants';
import { orderStatusEnum } from '../enums';

export const supplierOrders = pgTable('supplier_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  
  // Financial sub-totals
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),

  // Shipping provider integration attributes
  shippingProvider: text('shipping_provider'), // e.g. 'shiprocket'
  providerShipmentId: text('provider_shipment_id'),
  awb: text('awb'),
  trackingUrl: text('tracking_url'),
  courierCode: text('courier_code'),
  pickupReference: text('pickup_reference'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueOrderSupplier: unique('unique_order_supplier').on(table.orderId, table.supplierId),
  };
});

export const supplierOrderItems = pgTable('supplier_order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierOrderId: uuid('supplier_order_id').references(() => supplierOrders.id, { onDelete: 'cascade' }).notNull(),
  orderItemId: uuid('order_item_id').references(() => orderItems.id, { onDelete: 'cascade' }),
  supplierProductVariantId: uuid('supplier_product_variant_id').references(() => supplierProductVariants.id, { onDelete: 'restrict' }).notNull(),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  unitCostPrice: decimal('unit_cost_price', { precision: 12, scale: 2 }).notNull(),
  unitSellingPrice: decimal('unit_selling_price', { precision: 12, scale: 2 }).notNull(),
  grossAmount: decimal('gross_amount', { precision: 12, scale: 2 }).notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),

  // Commission Snapshot & Accounting margins per item
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  commissionAmount: decimal('commission_amount', { precision: 12, scale: 2 }).notNull(),
  platformFee: decimal('platform_fee', { precision: 12, scale: 2 }).default('0.00').notNull(),
  paymentGatewayFee: decimal('payment_gateway_fee', { precision: 12, scale: 2 }).default('0.00').notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  netPayout: decimal('net_payout', { precision: 12, scale: 2 }).notNull(),
}, (table) => {
  return {
    uniqueConsignmentOrderItem: unique('unique_consignment_order_item').on(table.supplierOrderId, table.orderItemId),
  };
});
