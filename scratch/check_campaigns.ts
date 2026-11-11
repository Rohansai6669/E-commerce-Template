import fs from 'fs';
import path from 'path';

// Parse .env manually BEFORE loading DB module
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const { db } = await import('../src/lib/db');
  const { salesCampaigns } = await import('../src/lib/db/schema/catalog/promotions');
  
  const rows = await db.select().from(salesCampaigns);
  console.log('Total sales_campaigns count:', rows.length);
  console.log('Campaign Names:', rows.map(r => `${r.id}: ${r.name}`));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
