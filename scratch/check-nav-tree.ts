import { db } from '../src/lib/db';
import { navigationItems } from '../src/lib/db/schema/catalog/navigation';
import { isNull, eq } from 'drizzle-orm';

async function main() {
  const parents = await db.select().from(navigationItems).where(isNull(navigationItems.parentId));
  console.log('Top/Parent items:');
  for (const p of parents) {
    const children = await db.select().from(navigationItems).where(eq(navigationItems.parentId, p.id));
    console.log(`- [${p.menuId}] ${p.label} (${p.url}) -> ${children.length} children`);
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

