import { pgTable, uuid, text, boolean, primaryKey, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { products } from './products';
import { categories } from './categories';

export const productCategories = pgTable(
  'product_categories',
  {
    storeId: uuid('store_id'),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.categoryId] }),
  })
);

export type ProductCategory = typeof productCategories.$inferSelect;
