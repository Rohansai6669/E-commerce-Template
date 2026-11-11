import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function alterMarketplaceSchema() {
  const { db } = await import('../src/lib/db');
  const { sql } = await import('drizzle-orm');

  console.log('--- APPLYING DDL ALTERATIONS FOR ORDER IDENTITIES, INVENTORY & CONSIGNMENT SCHEMAS ---');

  await db.execute(sql`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT UNIQUE;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_request_hash TEXT;
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS reservation_expires_at TIMESTAMPTZ;
  `);

  await db.execute(sql`
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS movement_type TEXT DEFAULT 'RESERVE';
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS before_available INT DEFAULT 0;
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS after_available INT DEFAULT 0;
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS before_reserved INT DEFAULT 0;
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS after_reserved INT DEFAULT 0;
    ALTER TABLE supplier_inventory_movements ADD COLUMN IF NOT EXISTS reference_type TEXT;
  `);

  await db.execute(sql`
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE;
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS unit_cost_price DECIMAL(12,2) DEFAULT '0.00';
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS unit_selling_price DECIMAL(12,2) DEFAULT '0.00';
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS gross_amount DECIMAL(12,2) DEFAULT '0.00';
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12,2) DEFAULT '0.00';
    ALTER TABLE supplier_order_items ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(12,2) DEFAULT '0.00';
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_order_supplier') THEN
        ALTER TABLE supplier_orders ADD CONSTRAINT unique_order_supplier UNIQUE (order_id, supplier_id);
      END IF;
    END $$;
  `);

  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_consignment_order_item') THEN
        ALTER TABLE supplier_order_items ADD CONSTRAINT unique_consignment_order_item UNIQUE (supplier_order_id, order_item_id);
      END IF;
    END $$;
  `);

  console.log('✓ DDL Alterations executed cleanly.');
}

alterMarketplaceSchema().catch((err) => {
  console.error('Schema alteration failed:', err);
  process.exit(1);
});
