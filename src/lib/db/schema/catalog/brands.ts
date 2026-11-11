import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';

export const brands = pgTable('brands', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logoUrl: text('logo_url'),
  description: text('description'),
  ...auditColumns,
});
export type Brand = typeof brands.$inferSelect;
export type NewBrand = typeof brands.$inferInsert;
