import { db } from '../src/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '../src/lib/db/schema/catalog/navigation';
import { categories } from '../src/lib/db/schema/catalog/categories';

async function main() {
  const menus = await db.select().from(navigationMenus);
  console.log('Menus:', menus);
  const items = await db.select().from(navigationItems);
  console.log('Items count:', items.length);
  if (items.length > 0) {
    console.log('Sample items:', items.slice(0, 5));
  }
  const promos = await db.select().from(navigationPromotions);
  console.log('Promos:', promos);
  const cats = await db.select().from(categories);
  console.log('Categories count:', cats.length);
  if (cats.length > 0) {
    console.log('Sample categories:', cats.slice(0, 5));
  }
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

