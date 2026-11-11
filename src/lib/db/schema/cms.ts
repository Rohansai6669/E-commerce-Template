import { pgTable, uuid, text, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from './helpers';

export const cmsPages = pgTable('cms_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  status: text('status', { enum: ['draft', 'published'] }).default('published').notNull(),
  seoTitle: text('seo_title'),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  ...auditColumns,
});

export const cmsPageSections = pgTable('cms_page_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  pageId: uuid('page_id').references(() => cmsPages.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  displayOrder: integer('display_order').default(1).notNull(),
  config: jsonb('config').notNull(),
  ...auditColumns,
});

export const cmsTableConfigs = pgTable('cms_table_configs', {
  id: text('id').primaryKey(), // e.g. 'admin-orders-table'
  name: text('name').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  config: jsonb('config').notNull(),
  ...auditColumns,
});

export const cmsSiteSettings = pgTable('cms_site_settings', {
  key: text('key').primaryKey(), // e.g. 'announcement_bar', 'design_tokens'
  value: jsonb('value').notNull(),
  ...auditColumns,
});
