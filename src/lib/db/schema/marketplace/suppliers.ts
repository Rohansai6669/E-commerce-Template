import { pgTable, uuid, text, decimal, boolean, jsonb, timestamp, integer } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { supplierStatusEnum, supplierAddressTypeEnum, supplierDocumentTypeEnum } from '../enums';
import { profiles } from '../auth';

export const suppliers = pgTable('suppliers', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('10.00').notNull(), // default 10%
  status: supplierStatusEnum('status').default('pending').notNull(),
  ...auditColumns,
});

export const supplierAddresses = pgTable('supplier_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  type: supplierAddressTypeEnum('type').default('pickup').notNull(),
  contactName: text('contact_name').notNull(),
  phone: text('phone').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supplierDocuments = pgTable('supplier_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  type: supplierDocumentTypeEnum('type').notNull(),
  fileUrl: text('file_url').notNull(),
  verified: boolean('verified').default(false).notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const supplierSettings = pgTable('supplier_settings', {
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).primaryKey(),
  autoAcceptOrders: boolean('auto_accept_orders').default(false).notNull(),
  autoApproveReturns: boolean('auto_approve_returns').default(false).notNull(),
  autoPublishProducts: boolean('auto_publish_products').default(false).notNull(),
  allowBackorders: boolean('allow_backorders').default(false).notNull(),
  defaultCourier: text('default_courier'),
  paymentTerms: text('payment_terms'),
  fulfillmentSLA: integer('fulfillment_sla').default(48).notNull(), // default SLA in hours
  minimumOrderValue: decimal('minimum_order_value', { precision: 12, scale: 2 }).default('0.00').notNull(),
  maximumLeadTime: integer('maximum_lead_time').default(7).notNull(), // in days
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
