import { pgTable, uuid, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from '../helpers';
import { profiles } from '../auth';
import { products } from './products';

/**
 * Platform Sales Campaigns (e.g. "Summer Fashion Sale", "Black Friday")
 */
export const salesCampaigns = pgTable('sales_campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  discountType: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  status: text('status', { enum: ['draft', 'scheduled', 'active', 'ended', 'archived'] }).default('draft').notNull(),
  priority: integer('priority').default(100).notNull(), // Higher integer = higher priority
  isStackable: boolean('is_stackable').default(false).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  ...auditColumns,
});

/**
 * Platform or Supplier-Owned Specific Offers (e.g. 20% off Nike Evening Dresses)
 */
export const promotionOffers = pgTable('promotion_offers', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  ownerType: text('owner_type', { enum: ['platform', 'supplier'] }).default('platform').notNull(),
  ownerId: uuid('owner_id').references(() => profiles.id, { onDelete: 'set null' }),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }),
  discountType: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  priority: integer('priority').default(50).notNull(),
  isStackable: boolean('is_stackable').default(false).notNull(),
  status: text('status', { enum: ['draft', 'active', 'paused', 'expired'] }).default('active').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }),
  endsAt: timestamp('ends_at', { withTimezone: true }),
  ...auditColumns,
});

/**
 * Audit Events Timeline for Promotion and Discount Changes
 */
export const promotionEvents = pgTable('promotion_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: text('entity_type', { enum: ['campaign', 'offer', 'coupon'] }).notNull(),
  entityId: uuid('entity_id').notNull(),
  actorProfileId: uuid('actor_profile_id').references(() => profiles.id, { onDelete: 'restrict' }).notNull(),
  action: text('action').notNull(), // 'created', 'updated_status', 'discount_changed'
  fromStatus: text('from_status'),
  toStatus: text('to_status'),
  reason: text('reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
});
