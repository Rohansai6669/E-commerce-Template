import { pgTable, uuid, text, decimal, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { orderStatusEnum } from './enums';
import { profiles } from './auth';
import { coupons } from './marketing';
import { products } from './catalog/products';
import { productVariants } from './catalog/variants';

export const shippingMethods = pgTable('shipping_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(), // Multi-currency mapping
  estimatedDelivery: text('estimated_delivery'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Polyfill boolean if missing, using custom mapping
import { boolean } from 'drizzle-orm/pg-core';

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').unique(),
  idempotencyKey: text('idempotency_key').unique(),
  checkoutRequestHash: text('checkout_request_hash'),
  reservationExpiresAt: timestamp('reservation_expires_at', { withTimezone: true }),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').default('pending').notNull(),
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  shippingAmount: decimal('shipping_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(), // Core currency mapping
  couponId: uuid('coupon_id').references(() => coupons.id, { onDelete: 'set null' }),
  shippingAddress: jsonb('shipping_address').notNull(), // Snapshotted address details
  billingAddress: jsonb('billing_address'), // Snapshotted billing address details
  shippingMethodId: uuid('shipping_method_id').references(() => shippingMethods.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderStatusHistory = pgTable('order_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  status: orderStatusEnum('status').notNull(),
  changedBy: uuid('changed_by').references(() => profiles.id, { onDelete: 'set null' }),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'set null' }),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'set null' }),
  name: text('name').notNull(), // Snapshot product name
  sku: text('sku').notNull(), // Snapshot SKU
  price: decimal('price', { precision: 12, scale: 2 }).notNull(), // Snapshot selling price
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }), // Snapshot unit cost price for frozen historical profit calculations
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  discountAmount: decimal('discount_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  imageUrl: text('image_url'), // Snapshot image URL
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
