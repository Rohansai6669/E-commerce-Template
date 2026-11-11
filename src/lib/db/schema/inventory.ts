import { pgTable, uuid, integer, timestamp, unique, text, boolean } from 'drizzle-orm/pg-core';
import { products } from './catalog/products';
import { productVariants } from './catalog/variants';
import { inventoryMovementTypeEnum } from './enums';
import { profiles } from './auth';

export const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(5).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueInv: unique('unique_product_variant_inventory').on(table.productId, table.variantId),
  };
});

export const inventoryMovements = pgTable('inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: uuid('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }).notNull(),
  type: inventoryMovementTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  referenceId: text('reference_id'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryReservations = pgTable('inventory_reservations', {
  id: uuid('id').defaultRandom().primaryKey(),
  inventoryId: uuid('inventory_id').references(() => inventory.id, { onDelete: 'cascade' }).notNull(),
  quantity: integer('quantity').notNull(),
  sessionId: text('session_id'),
  profileId: uuid('profile_id').references(() => profiles.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
