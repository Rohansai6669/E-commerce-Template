import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function main() {
  loadEnvConfig(process.cwd());
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL missing in environment');
    process.exit(1);
  }

  console.log('⏳ Connecting to database to check and update `profiles` table schema...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // Check existing columns in profiles
    const existingCols = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'profiles';
    `;
    console.log('Current `profiles` columns in Postgres:', existingCols.map((c) => c.column_name));

    // Ensure all Drizzle schema columns exist on the profiles table
    await sql`
      ALTER TABLE profiles
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS username text,
      ADD COLUMN IF NOT EXISTS full_name text,
      ADD COLUMN IF NOT EXISTS avatar_url text,
      ADD COLUMN IF NOT EXISTS phone text,
      ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true NOT NULL,
      ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
      ADD COLUMN IF NOT EXISTS created_at timestamp with time zone DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now() NOT NULL,
      ADD COLUMN IF NOT EXISTS last_seen_at timestamp with time zone;
    `;

    console.log('✅ Physical `profiles` table schema verified and updated!');

    // Check if userRoleEnum exists, or create role column safely if missing
    try {
      await sql`
        ALTER TABLE profiles
        ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer' NOT NULL;
      `;
    } catch (e) {
      console.log('Role column check note:', e);
    }

    await sql.end();
    console.log('🎉 Schema sync complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema check failed:', err);
    await sql.end();
    process.exit(1);
  }
}

main();
