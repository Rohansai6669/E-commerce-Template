import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const mediaFiles = pgTable('media_files', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  url: text('url').notNull(),
  folder: text('folder').default('general').notNull(), // 'products' | 'brands' | 'suppliers' | 'banners' | 'documents' | 'general'
  mimeType: text('mime_type').default('image/jpeg').notNull(),
  sizeBytes: integer('size_bytes').default(0).notNull(),
  altText: text('alt_text'),
  width: integer('width'),
  height: integer('height'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type NewMediaFile = typeof mediaFiles.$inferInsert;
