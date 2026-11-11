import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { profiles } from '../src/lib/db/schema/auth';
import { eq } from 'drizzle-orm';
import { loadEnvConfig } from '@next/env';

async function main() {
  // Load environment variables
  loadEnvConfig(process.cwd());

  const email = process.argv[2];
  if (!email) {
    console.error('❌ Please specify an email address. Example: npm run set-admin user@example.com');
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in environment variables');
    process.exit(1);
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log(`⏳ Elevating user with email "${email}" to Admin role...`);

  try {
    const updated = await db
      .update(profiles)
      .set({ role: 'admin' })
      .where(eq(profiles.email, email))
      .returning();

    if (updated.length === 0) {
      console.error(`❌ No user profile found for email "${email}". Make sure the user has registered first.`);
      await client.end();
      process.exit(1);
    }

    console.log(`✅ Success! User "${email}" has been elevated to Admin.`);
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to elevate user:', error);
    await client.end();
    process.exit(1);
  }
}

main();
