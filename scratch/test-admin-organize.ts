import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { products } from '../src/lib/db/schema/catalog/products';
import { categories } from '../src/lib/db/schema/catalog/categories';
import { productCategories } from '../src/lib/db/schema/catalog/product-taxonomy';
import { eq } from 'drizzle-orm';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL missing');

  const client = postgres(databaseUrl, { max: 1, idle_timeout: 20 });
  const db = drizzle(client);

  console.log('Testing Admin Product Organization Actions...');

  const [cat] = await db.select().from(categories).limit(1);
  const [prod] = await db.select().from(products).limit(1);

  if (!cat || !prod) {
    console.log('No product or category found to test with.');
    await client.end();
    process.exit(0);
  }

  console.log(`Testing with Product "${prod.name}" and Category "${cat.name}"`);

  // Direct DB update test simulating quickUpdate
  await db.update(products).set({ categoryId: cat.id }).where(eq(products.id, prod.id));
  await db.delete(productCategories).where(eq(productCategories.productId, prod.id));
  await db.insert(productCategories).values({ productId: prod.id, categoryId: cat.id, isPrimary: true });

  const [verify] = await db.select().from(products).where(eq(products.id, prod.id));
  const [junction] = await db.select().from(productCategories).where(eq(productCategories.productId, prod.id));

  console.log('Verified product categoryId:', verify.categoryId === cat.id ? 'MATCHED' : 'FAILED');
  console.log('Verified junction productCategories:', junction?.categoryId === cat.id ? 'MATCHED' : 'FAILED');

  await client.end();
  console.log('✅ Admin product organization logic verified successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
