import { pgTable, uuid, text, boolean, integer, primaryKey } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { products } from './products';

export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  ...auditColumns,
});

export const collectionProducts = pgTable(
  'collection_products',
  {
    storeId: uuid('store_id'),
    collectionId: uuid('collection_id')
      .notNull()
      .references(() => collections.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.collectionId, table.productId] }),
  })
);

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;
