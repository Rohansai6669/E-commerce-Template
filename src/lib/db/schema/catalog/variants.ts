import { pgTable, uuid, text, integer, decimal, boolean, primaryKey, unique, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';

export const globalAttributes = pgTable('global_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(), // e.g., 'Size', 'Color'
  displayType: text('display_type').default('text').notNull(), // 'text', 'color', 'image'
  sortOrder: integer('sort_order').default(0).notNull(),
  status: text('status').default('active').notNull(), // 'active', 'archived'
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const globalAttributeValues = pgTable('global_attribute_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  attributeId: uuid('attribute_id').references(() => globalAttributes.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(), // e.g., 'XL', 'Black'
  colorHex: text('color_hex'), // e.g., '#000000'
  imageUrl: text('image_url'), // swatch image URL
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => {
  return {
    uniqueVal: unique('unique_global_attribute_value').on(table.attributeId, table.value),
  };
});

export const productAttributes = pgTable('product_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  attributeId: uuid('attribute_id').references(() => globalAttributes.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
  return {
    uniqueProdAttr: unique('unique_product_attribute').on(table.productId, table.attributeId),
  };
});

export const productAttributeValues = pgTable('product_attribute_values', {
  id: uuid('id').defaultRandom().primaryKey(),
  productAttributeId: uuid('product_attribute_id').references(() => productAttributes.id, { onDelete: 'cascade' }).notNull(),
  attributeValueId: uuid('attribute_value_id').references(() => globalAttributeValues.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
  return {
    uniqueProdAttrVal: unique('unique_product_attribute_value').on(table.productAttributeId, table.attributeValueId),
  };
});

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  sku: text('sku').unique().notNull(),
  barcode: text('barcode'),
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  weight: decimal('weight', { precision: 8, scale: 2 }), // e.g. weight in kg
  status: text('status').default('active').notNull(), // 'active', 'draft', 'archived'
  imageUrl: text('image_url'),
  trackInventory: boolean('track_inventory').default(true).notNull(),
  stock: integer('stock').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const variantAttributeValues = pgTable('variant_attribute_values', {
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  attributeValueId: uuid('attribute_value_id').references(() => globalAttributeValues.id, { onDelete: 'cascade' }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.variantId, table.attributeValueId], name: 'pk_variant_attribute_values' }),
  };
});
