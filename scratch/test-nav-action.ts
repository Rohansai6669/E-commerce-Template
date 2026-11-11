import { getStorefrontNavigationAction } from '../src/app/actions/navigation-actions';

async function main() {
  const data = await getStorefrontNavigationAction('MEN');
  console.log('Loaded collections count:', data.length);
  for (const c of data) {
    const col1 = c.subitems.filter(s => s.columnNumber === 1);
    const col2 = c.subitems.filter(s => s.columnNumber === 2);
    console.log(`- ${c.name}: ${c.subitems.length} subcategories (Col 1: ${col1.length}, Col 2: ${col2.length}) | Promo: "${c.featured?.title}"`);
  }
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });

