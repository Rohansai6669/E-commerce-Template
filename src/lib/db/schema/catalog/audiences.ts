import { pgTable, uuid, text, primaryKey } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { products } from './products';

export const audiences = pgTable('audiences', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  ...auditColumns,
});

export const productAudiences = pgTable(
  'product_audiences',
  {
    storeId: uuid('store_id'),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    audienceId: uuid('audience_id')
      .notNull()
      .references(() => audiences.id, { onDelete: 'cascade' }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.audienceId] }),
  })
);

export type Audience = typeof audiences.$inferSelect;
export type NewAudience = typeof audiences.$inferInsert;
