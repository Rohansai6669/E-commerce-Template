import fs from 'fs';
import path from 'path';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function seedCmsHomepage() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL missing in environment');
    process.exit(1);
  }

  const sql = postgres(databaseUrl, { max: 1 });
  const storagePath = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');

  if (!fs.existsSync(storagePath)) {
    console.error('❌ cms-storage.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(storagePath, 'utf-8');
  const data = JSON.parse(raw);
  const homepageConfig = data['/'];

  if (!homepageConfig) {
    console.error('❌ Homepage configuration missing in cms-storage.json');
    process.exit(1);
  }

  console.log('🔄 Syncing full homepage layout configuration to PostgreSQL DB cms_site_settings...');

  try {
    await sql`
      INSERT INTO cms_site_settings (key, value, updated_at)
      VALUES ('page_config_/', ${sql.json(homepageConfig)}, NOW())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = NOW();
    `;

    console.log('✅ Synchronized CMS Homepage Page Config to PostgreSQL Database!');
    await sql.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ CMS Homepage DB Sync error:', err);
    await sql.end();
    process.exit(1);
  }
}

seedCmsHomepage();
