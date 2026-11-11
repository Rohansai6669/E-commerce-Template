import { pgTable, text, boolean, jsonb, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userRoleEnum } from './enums';

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users(id) in Supabase
  email: text('email'),
  username: text('username').unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  phone: text('phone'),
  role: userRoleEnum('role').default('customer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  metadata: jsonb('metadata').default({}).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
});
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
