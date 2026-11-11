import { pgTable, uuid, text, boolean, integer, smallint } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { categories } from './categories';
import { collections } from './collections';

export const navigationMenus = pgTable('navigation_menus', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id'),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  location: text('location').default('main').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  ...auditColumns,
});

export const navigationItems = pgTable('navigation_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id'),
  menuId: uuid('menu_id')
    .notNull()
    .references(() => navigationMenus.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id'),
  label: text('label').notNull(),
  itemType: text('item_type').notNull(), // 'category' | 'collection' | 'audience' | 'custom_link'
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  collectionId: uuid('collection_id').references(() => collections.id, { onDelete: 'set null' }),
  url: text('url'),
  imageUrl: text('image_url'),
  sortOrder: integer('sort_order').default(0).notNull(),
  columnNumber: smallint('column_number'),
  isActive: boolean('is_active').default(true).notNull(),
  ...auditColumns,
});

export const navigationPromotions = pgTable('navigation_promotions', {
  id: uuid('id').defaultRandom().primaryKey(),
  storeId: uuid('store_id'),
  menuId: uuid('menu_id').references(() => navigationMenus.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  targetUrl: text('target_url'),
  actionLabel: text('action_label'),
  isActive: boolean('is_active').default(true).notNull(),
  ...auditColumns,
});

export type NavigationMenu = typeof navigationMenus.$inferSelect;
export type NavigationItem = typeof navigationItems.$inferSelect;
export type NavigationPromotion = typeof navigationPromotions.$inferSelect;
