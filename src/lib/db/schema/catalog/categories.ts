import { pgTable, uuid, text, boolean, foreignKey } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  parentId: uuid('parent_id'),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  ...auditColumns,
}, (table) => {
  return {
    parentReference: foreignKey({
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: 'fk_categories_parent',
    }).onDelete('set null'),
  };
});
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
