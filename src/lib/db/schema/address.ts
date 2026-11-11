import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { boolean as booleanPolyfill } from 'drizzle-orm/pg-core';
import { profiles } from './auth';

/**
 * Customer address table for saved shipping address cards.
 */
export const customerAddresses = pgTable('customer_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  profileId: uuid('profile_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  phone: text('phone').notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  state: text('state').notNull(),
  postalCode: text('postal_code').notNull(),
  country: text('country').notNull(),
  isDefault: booleanPolyfill('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export type CustomerAddressSchemaType = typeof customerAddresses.$inferSelect;
export type NewCustomerAddressSchemaType = typeof customerAddresses.$inferInsert;
