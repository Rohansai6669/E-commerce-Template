import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function alterTable() {
  const { db } = await import('../src/lib/db');
  const { sql } = await import('drizzle-orm');

  console.log('Altering orders table to ensure order_number column & unique constraint exist...');
  await db.execute(sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;`);
  console.log('✓ ALTER TABLE orders succeeded.');
}

alterTable().catch((err) => {
  console.error('Alter failed:', err);
  process.exit(1);
});
