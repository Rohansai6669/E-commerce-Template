import { pgTable, uuid, text, decimal, jsonb, customType } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { productStatusEnum } from '../enums';
import { categories } from './categories';
import { brands } from './brands';

const tsvector = customType<{ data: string }>({
  dataType() {
    return 'tsvector';
  },
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  /** Primary category reference. Multi-category associations are managed via productCategories junction table. */
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  brandId: uuid('brand_id').references(() => brands.id, { onDelete: 'set null' }),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  /** Master base price (displayed in catalog cards before variant selection). */
  price: decimal('price', { precision: 12, scale: 2 }).notNull(),
  /** Master MSRP / original price for calculating discount badges. */
  compareAtPrice: decimal('compare_at_price', { precision: 12, scale: 2 }),
  /** Unit acquisition / production cost price for profit and margin calculation. */
  costPrice: decimal('cost_price', { precision: 12, scale: 2 }),
  /** Master SKU (parent product identifier; individual SKUs reside on productVariants). */
  sku: text('sku').unique(),
  barcode: text('barcode'),
  status: productStatusEnum('status').default('draft').notNull(),
  
  // Fashion Specification Attributes
  gender: text('gender'), // 'men' | 'women' | 'unisex' | 'kids' | 'boys' | 'girls'
  material: text('material'), // Fabric composition (e.g. '100% Organic Cotton')
  fit: text('fit'), // Silhouette ('Slim Fit', 'Oversized', 'Tailored', 'Regular Fit')
  pattern: text('pattern'), // Surface design ('Solid', 'Striped', 'Floral', 'Plaid')
  season: text('season'), // Collection period ('Spring/Summer 2026', 'Autumn/Winter 2026', 'All-Season')
  collection: text('collection'), // Capsule line ('Resort 2026', 'Essentials')
  occasion: text('occasion'), // Context ('Casual', 'Formal', 'Workwear', 'Athleisure', 'Party')
  careInstructions: text('care_instructions'), // Laundering guide ('Dry clean only', 'Machine wash cold')
  countryOfOrigin: text('country_of_origin'), // Manufacturing origin ('India', 'Italy', 'Portugal')
  sizeChart: jsonb('size_chart').default({}).notNull(), // Size guide measurement matrix

  metadata: jsonb('metadata').default({}).notNull(),
  searchVector: tsvector('search_vector'),
  ...auditColumns,
});
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
