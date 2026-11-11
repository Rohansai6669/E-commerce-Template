import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

async function fixNotesColumn() {
  const { db } = await import('../src/lib/db');
  const { sql } = await import('drizzle-orm');

  console.log('Altering supplier_inventory_movements notes column to TEXT...');
  await db.execute(sql`ALTER TABLE supplier_inventory_movements ALTER COLUMN notes TYPE TEXT USING notes::text;`);
  console.log('✓ ALTER TABLE supplier_inventory_movements notes TYPE TEXT succeeded.');
}

fixNotesColumn().catch((err) => {
  console.error('Fix failed:', err);
  process.exit(1);
});
