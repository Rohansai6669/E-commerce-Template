import { pgTable, uuid, text, jsonb, timestamp, boolean, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { notificationTypeEnum } from './enums';
import { profiles } from './auth';

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'cascade' }).notNull(),
  type: notificationTypeEnum('type').default('system').notNull(),
  priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('low').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  data: jsonb('data').default({}).notNull(),
  readAt: timestamp('read_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    profileIndex: index('idx_notifications_profile').on(table.profileId),
    unreadActiveIndex: index('idx_notifications_unread_active')
      .on(table.profileId)
      .where(sql`read_at IS NULL AND is_deleted = false`),
  };
});
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
