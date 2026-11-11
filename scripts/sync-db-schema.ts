import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function main() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  console.log('⏳ Synchronizing database schema extensions...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // 1. Add supplier to user_role enum if not present
    console.log('Adding supplier to user_role enum...');
    try {
      await sql`ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'supplier'`;
    } catch (e: any) {
      console.log('Enum value supplier check completed:', e?.message || e);
    }

    // 2. Add profile_id to suppliers table if not present
    console.log('Adding profile_id column to suppliers table...');
    await sql`
      ALTER TABLE public.suppliers 
      ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    `;

    // 3. Create media_files table if not present
    console.log('Creating media_files table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.media_files (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        url TEXT NOT NULL,
        folder TEXT NOT NULL DEFAULT 'general',
        mime_type TEXT NOT NULL DEFAULT 'image/jpeg',
        size_bytes INTEGER NOT NULL DEFAULT 0,
        alt_text TEXT,
        width INTEGER,
        height INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 4. Create supplier_invitations table if not present
    console.log('Creating supplier_invitations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS public.supplier_invitations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        supplier_name TEXT NOT NULL,
        token TEXT UNIQUE NOT NULL,
        commission_rate TEXT NOT NULL DEFAULT '10.00',
        status TEXT NOT NULL DEFAULT 'pending',
        brand_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
        invited_by UUID,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    console.log('✅ Database schema synchronized successfully!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema synchronization failed:', err);
    await sql.end();
    process.exit(1);
  }
}

main();
