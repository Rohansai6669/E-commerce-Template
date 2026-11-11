import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function main() {
  loadEnvConfig(process.cwd());
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    console.log('Dropping conflicting catalog tables for clean slate...');
    await sql`DROP TABLE IF EXISTS product_variant_options CASCADE;`;
    await sql`DROP TABLE IF EXISTS product_option_values CASCADE;`;
    await sql`DROP TABLE IF EXISTS product_options CASCADE;`;
    await sql`DROP TABLE IF EXISTS variant_attribute_values CASCADE;`;
    await sql`DROP TABLE IF EXISTS product_attribute_values CASCADE;`;
    await sql`DROP TABLE IF EXISTS product_attributes CASCADE;`;
    await sql`DROP TABLE IF EXISTS global_attribute_values CASCADE;`;
    await sql`DROP TABLE IF EXISTS global_attributes CASCADE;`;
    await sql`DROP TABLE IF EXISTS product_variants CASCADE;`;
    console.log('✅ Catalog variant tables dropped successfully.');
  } catch (error) {
    console.error('❌ Clean operation failed:', error);
  } finally {
    await sql.end();
  }
}

main();
