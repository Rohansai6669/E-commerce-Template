import { pgTable, uuid, text, decimal, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { auditColumns } from './helpers';
import { profiles } from './auth';

export const coupons = pgTable('coupons', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').unique().notNull(),
  discountType: text('discount_type', { enum: ['percentage', 'fixed'] }).notNull(),
  discountValue: decimal('discount_value', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(), // Multi-currency constraint support
  minOrderValue: decimal('min_order_value', { precision: 12, scale: 2 }),
  maxDiscountValue: decimal('max_discount_value', { precision: 12, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  perUserLimit: integer('per_user_limit'),
  startDate: timestamp('start_date', { withTimezone: true }),
  endDate: timestamp('end_date', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  ...auditColumns,
});

export const couponRedemptions = pgTable('coupon_redemptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  couponId: uuid('coupon_id').references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  orderId: uuid('order_id').notNull(), // Managed dynamic references to order IDs
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
