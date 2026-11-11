import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function addUniqueConstraint() {
  const { db } = await import('../src/lib/db');
  const { sql } = await import('drizzle-orm');

  console.log('Adding UNIQUE constraint orders_order_number_unique to orders(order_number)...');
  await db.execute(sql`
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'orders_order_number_unique'
      ) THEN
        ALTER TABLE orders ADD CONSTRAINT orders_order_number_unique UNIQUE (order_number);
      END IF;
    END $$;
  `);
  console.log('✓ UNIQUE constraint orders_order_number_unique applied successfully.');
}

addUniqueConstraint().catch((err) => {
  console.error('Constraint application failed:', err);
  process.exit(1);
});
