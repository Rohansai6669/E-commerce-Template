import { pgTable, uuid, integer, timestamp, unique, text } from 'drizzle-orm/pg-core';
import { supplierProductVariants } from '../catalog/supplier-product-variants';
import { inventoryMovementReasonEnum } from '../enums';

export const supplierInventory = pgTable('supplier_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierProductVariantId: uuid('supplier_product_variant_id').references(() => supplierProductVariants.id, { onDelete: 'cascade' }).notNull(),
  warehouseId: uuid('warehouse_id'), // Reserved for multiple warehouse allocations
  available: integer('available').default(0).notNull(),
  reserved: integer('reserved').default(0).notNull(),
  damaged: integer('damaged').default(0).notNull(),
  incoming: integer('incoming').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => {
  return {
    uniqueSupplierInv: unique('unique_supplier_variant_inventory').on(table.supplierProductVariantId, table.warehouseId),
  };
});

export const supplierInventoryMovements = pgTable('supplier_inventory_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  supplierInventoryId: uuid('supplier_inventory_id').references(() => supplierInventory.id, { onDelete: 'cascade' }).notNull(),
  reason: inventoryMovementReasonEnum('reason').notNull(),
  movementType: text('movement_type').notNull(), // 'RESERVE', 'RELEASE_RESERVATION', 'FULFILL', 'ADJUSTMENT'
  quantity: integer('quantity').notNull(), // positive or negative
  beforeAvailable: integer('before_available').notNull(),
  afterAvailable: integer('after_available').notNull(),
  beforeReserved: integer('before_reserved').notNull(),
  afterReserved: integer('after_reserved').notNull(),
  referenceType: text('reference_type'), // 'ORDER', 'RETURN', 'MANUAL'
  referenceId: text('reference_id'), // Order ID, Return ID, etc.
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
