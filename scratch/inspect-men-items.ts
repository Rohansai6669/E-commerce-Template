import { db } from '../src/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '../src/lib/db/schema/catalog/navigation';
import { eq } from 'drizzle-orm';

async function main() {
  const [menMenu] = await db.select().from(navigationMenus).where(eq(navigationMenus.slug, 'men-main-menu'));
  if (!menMenu) {
    console.log('men-main-menu not found');
    process.exit(1);
  }
  console.log('Men menu id:', menMenu.id);

  const items = await db.select().from(navigationItems).where(eq(navigationItems.menuId, menMenu.id));
  console.log('Men menu items total:', items.length);
  for (const item of items) {
    if (!item.parentId) {
      console.log(`Parent: id=${item.id}, label=${item.label}, imageUrl=${item.imageUrl}`);
    }
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

