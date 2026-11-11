import { timestamp } from 'drizzle-orm/pg-core';

/**
 * Reusable audit columns to maintain consistency across tables.
 */
export const auditColumns = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
};
