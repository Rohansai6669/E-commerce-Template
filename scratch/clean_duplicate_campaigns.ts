import fs from 'fs';
import path from 'path';

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
  const { inArray, notInArray, eq } = await import('drizzle-orm');

  const rows = await db.select().from(salesCampaigns);
  console.log('Current count before cleanup:', rows.length);

  // Group by campaign name, keep the first ID for each unique name
  const keepIds: string[] = [];
  const seenNames = new Set<string>();

  for (const r of rows) {
    if (!seenNames.has(r.name)) {
      seenNames.add(r.name);
      keepIds.push(r.id);
    }
  }

  console.log('Keeping IDs:', keepIds);

  if (keepIds.length > 0 && rows.length > keepIds.length) {
    const deleteIds = rows.filter(r => !keepIds.includes(r.id)).map(r => r.id);
    console.log('Deleting duplicate IDs count:', deleteIds.length);
    
    await db.delete(salesCampaigns).where(inArray(salesCampaigns.id, deleteIds));
  }

  const updatedRows = await db.select().from(salesCampaigns);
  console.log('Updated count after cleanup:', updatedRows.length);
  console.log('Remaining campaigns:', updatedRows.map(r => `${r.id}: ${r.name}`));
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
