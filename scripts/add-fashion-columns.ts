import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function main() {
  loadEnvConfig(process.cwd());
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL missing in environment');
    process.exit(1);
  }

  console.log('⏳ Connecting to database to apply fashion catalog columns...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // Add fashion specification columns to products table
    await sql`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS gender text,
      ADD COLUMN IF NOT EXISTS material text,
      ADD COLUMN IF NOT EXISTS fit text,
      ADD COLUMN IF NOT EXISTS pattern text,
      ADD COLUMN IF NOT EXISTS season text,
      ADD COLUMN IF NOT EXISTS collection text,
      ADD COLUMN IF NOT EXISTS occasion text,
      ADD COLUMN IF NOT EXISTS care_instructions text,
      ADD COLUMN IF NOT EXISTS country_of_origin text,
      ADD COLUMN IF NOT EXISTS size_chart jsonb DEFAULT '{}'::jsonb;
    `;
    console.log('✅ Fashion columns added to `products` table!');

    // Add variant_id to product_images table if missing
    await sql`
      ALTER TABLE product_images
      ADD COLUMN IF NOT EXISTS variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL;
    `;
    console.log('✅ Variant FK added to `product_images` table!');

    await sql.end();
    console.log('🎉 Database migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    await sql.end();
    process.exit(1);
  }
}

main();
