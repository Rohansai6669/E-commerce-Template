import { pgTable, uuid, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import { profiles } from './auth';
import { products } from './catalog/products';

export const wishlistItems = pgTable('wishlist_items', {
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.profileId, table.productId], name: 'pk_wishlist_items' }),
  };
});
