import { pgTable, uuid, text, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { products } from './products';
import { productVariants } from './variants';

/**
 * Structured Product Media Metadata (Cloudflare R2 storage integration)
 */
export const productMedia = pgTable('product_media', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  storageKey: text('storage_key').notNull(),
  cdnUrl: text('cdn_url').notNull(),
  altText: text('alt_text'),
  sortOrder: integer('sort_order').default(0).notNull(),
  mediaType: text('media_type', { enum: ['image', 'video', 'size_chart'] }).default('image').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  width: integer('width'),
  height: integer('height'),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type ProductMedia = typeof productMedia.$inferSelect;
export type NewProductMedia = typeof productMedia.$inferInsert;
