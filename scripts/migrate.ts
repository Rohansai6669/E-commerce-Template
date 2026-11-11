import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function main() {
  // Load environment variables from .env / .env.local
  loadEnvConfig(process.cwd());

  console.log('⏳ Running database migrations...');

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is missing.');
    process.exit(1);
  }

  // Environment safety check
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && process.env.CONFIRM_MIGRATE !== 'true') {
    console.error('⚠️ WARNING: Attempting to run migrations on PRODUCTION. Set CONFIRM_MIGRATE=true to proceed.');
    process.exit(1);
  }

  // Create a temporary connection for migrations
  const migrationClient = postgres(databaseUrl, { max: 1 });
  const db = drizzle(migrationClient);

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully!');
    await migrationClient.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await migrationClient.end();
    process.exit(1);
  }
}

main();
