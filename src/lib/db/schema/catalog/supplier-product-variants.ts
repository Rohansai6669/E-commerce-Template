import { pgTable, uuid, text, decimal, boolean, timestamp, unique, integer } from 'drizzle-orm/pg-core';
import { supplierProducts } from './supplier-products';
import { productVariants } from './variants';

export const supplierProductVariants = pgTable('supplier_product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierProductId: uuid('supplier_product_id').references(() => supplierProducts.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  supplierSku: text('supplier_sku').unique().notNull(),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }).notNull(),
  sellingPrice: decimal('selling_price', { precision: 12, scale: 2 }).notNull(),
  leadTime: integer('lead_time').default(3).notNull(), // lead time in days to ship
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueSupplierVariant: unique('unique_supplier_product_variant').on(table.supplierProductId, table.variantId),
  };
});
