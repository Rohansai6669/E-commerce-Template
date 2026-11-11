import { pgTable, uuid, integer, text, timestamp, boolean, unique, index } from 'drizzle-orm/pg-core';
import { products } from './catalog/products';
import { profiles } from './auth';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden';

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  isVerifiedPurchase: boolean('is_verified_purchase').default(false).notNull(),
  
  // Review Governance & Moderation Fields
  status: text('status', { enum: ['pending', 'approved', 'rejected', 'hidden'] }).default('approved').notNull(),
  moderatedAt: timestamp('moderated_at', { withTimezone: true }),
  moderatedBy: uuid('moderated_by').references(() => profiles.id, { onDelete: 'set null' }),
  moderationReason: text('moderation_reason'),
  
  // Soft Delete Audit Fields
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedBy: uuid('deleted_by').references(() => profiles.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueUserReview: unique('unique_review_per_user').on(table.productId, table.profileId),
    prodStatusIdx: index('idx_reviews_product_status').on(table.productId, table.status),
  };
});

export type Review = typeof reviews.$inferSelect;
export type NewReview = typeof reviews.$inferInsert;
