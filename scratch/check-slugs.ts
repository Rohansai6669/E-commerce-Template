import { db } from '../src/lib/db';
import { navigationMenus } from '../src/lib/db/schema/catalog/navigation';

async function main() {
  const allMenus = await db.select().from(navigationMenus);
  for (const m of allMenus) {
    console.log(`id=${m.id}, name="${m.name}", slug="${m.slug}"`);
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

