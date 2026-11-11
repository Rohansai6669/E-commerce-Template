import { pgTable, uuid, text, decimal, boolean, timestamp, unique, primaryKey, index, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { products } from './products';
import { brands } from './brands';
import { suppliers } from '../marketplace/suppliers';
import { profiles } from '../auth';

export type SupplierProductApprovalStatus = 
  | 'draft' 
  | 'submitted' 
  | 'under_review' 
  | 'approved' 
  | 'active' 
  | 'rejected' 
  | 'suspended' 
  | 'archived';

export const supplierProducts = pgTable('supplier_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  
  // Supplier Approval State Machine Fields
  approvalStatus: text('approval_status', { 
    enum: ['draft', 'submitted', 'under_review', 'approved', 'active', 'rejected', 'suspended', 'archived'] 
  }).default('draft').notNull(),
  rejectionReason: text('rejection_reason'),
  reviewedBy: uuid('reviewed_by').references(() => profiles.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueProductSupplier: unique('unique_product_supplier').on(table.productId, table.supplierId),
    supplierStatusIdx: index('idx_supplier_products_supplier_status').on(table.supplierId, table.approvalStatus),
  };
});

/**
 * Audit History Timeline Events for Supplier Product Approvals
 */
export const supplierProductApprovalEvents = pgTable('supplier_product_approval_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierProductId: uuid('supplier_product_id').references(() => supplierProducts.id, { onDelete: 'cascade' }).notNull(),
  fromStatus: text('from_status').notNull(),
  toStatus: text('to_status').notNull(),
  actorProfileId: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'restrict' }).notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
});

export const supplierBrandPermissions = pgTable('supplier_brand_permissions', {
  supplierId: uuid('supplier_id').references(() => suppliers.id, { onDelete: 'cascade' }).notNull(),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'cascade' }).notNull(),
  approvedBy: uuid('approved_by').references(() => profiles.id, { onDelete: 'set null' }),
  approvedAt: timestamp('approved_at', { withTimezone: true }).defaultNow().notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.supplierId, table.brandId], name: 'pk_supplier_brand_permissions' }),
    brandSupplierIdx: index('idx_supplier_brand_perm_brand_supplier').on(table.brandId, table.supplierId),
    supplierBrandIdx: index('idx_supplier_brand_perm_supplier_brand').on(table.supplierId, table.brandId),
  };
});
