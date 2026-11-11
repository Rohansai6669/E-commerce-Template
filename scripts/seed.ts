import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { categories } from '../src/lib/db/schema/catalog/categories';
import { brands } from '../src/lib/db/schema/catalog/brands';
import { shippingMethods } from '../src/lib/db/schema/order';
import { coupons } from '../src/lib/db/schema/marketing';
import { products } from '../src/lib/db/schema/catalog/products';
import { globalAttributes, globalAttributeValues } from '../src/lib/db/schema/catalog/variants';

import { loadEnvConfig } from '@next/env';

async function main() {
  // Load environment variables
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log('🌱 Seeding database with initial catalog, shipping, and promotional mock data...');

  try {
    // 0. Seed Reusable Global Attributes & Swatch Options
    const existingAttrs = await db.select().from(globalAttributes);
    if (existingAttrs.length === 0) {
      console.log('Seeding Default Reusable Attributes and Units...');
      
      const [sizeAttr] = await db.insert(globalAttributes).values({
        name: 'Size',
        displayType: 'text',
        sortOrder: 1,
        status: 'active',
      }).returning();

      await db.insert(globalAttributeValues).values([
        { attributeId: sizeAttr.id, value: 'XS', sortOrder: 1 },
        { attributeId: sizeAttr.id, value: 'S', sortOrder: 2 },
        { attributeId: sizeAttr.id, value: 'M', sortOrder: 3 },
        { attributeId: sizeAttr.id, value: 'L', sortOrder: 4 },
        { attributeId: sizeAttr.id, value: 'XL', sortOrder: 5 },
        { attributeId: sizeAttr.id, value: 'XXL', sortOrder: 6 },
      ]);

      const [colorAttr] = await db.insert(globalAttributes).values({
        name: 'Color',
        displayType: 'color',
        sortOrder: 2,
        status: 'active',
      }).returning();

      await db.insert(globalAttributeValues).values([
        { attributeId: colorAttr.id, value: 'Black', colorHex: '#000000', sortOrder: 1 },
        { attributeId: colorAttr.id, value: 'White', colorHex: '#FFFFFF', sortOrder: 2 },
        { attributeId: colorAttr.id, value: 'Red', colorHex: '#EF4444', sortOrder: 3 },
        { attributeId: colorAttr.id, value: 'Blue', colorHex: '#3B82F6', sortOrder: 4 },
        { attributeId: colorAttr.id, value: 'Green', colorHex: '#10B981', sortOrder: 5 },
        { attributeId: colorAttr.id, value: 'Grey', colorHex: '#6B7280', sortOrder: 6 },
      ]);

      const [materialAttr] = await db.insert(globalAttributes).values({
        name: 'Material',
        displayType: 'text',
        sortOrder: 3,
        status: 'active',
      }).returning();

      await db.insert(globalAttributeValues).values([
        { attributeId: materialAttr.id, value: 'Cotton', sortOrder: 1 },
        { attributeId: materialAttr.id, value: 'Silk', sortOrder: 2 },
        { attributeId: materialAttr.id, value: 'Polyester', sortOrder: 3 },
        { attributeId: materialAttr.id, value: 'Wool', sortOrder: 4 },
        { attributeId: materialAttr.id, value: 'Linen', sortOrder: 5 },
        { attributeId: materialAttr.id, value: 'Leather', sortOrder: 6 },
      ]);

      const [weightAttr] = await db.insert(globalAttributes).values({
        name: 'Weight',
        displayType: 'text',
        sortOrder: 4,
        status: 'active',
      }).returning();

      await db.insert(globalAttributeValues).values([
        { attributeId: weightAttr.id, value: '100g', sortOrder: 1 },
        { attributeId: weightAttr.id, value: '250g', sortOrder: 2 },
        { attributeId: weightAttr.id, value: '500g', sortOrder: 3 },
        { attributeId: weightAttr.id, value: '1kg', sortOrder: 4 },
        { attributeId: weightAttr.id, value: '2kg', sortOrder: 5 },
      ]);
    } else {
      console.log('Global attributes already exist, skipping default attributes seed.');
    }

    // 1. Seed Categories & Subcategories
    let insertedCategories = await db.select().from(categories);
    let menCat = insertedCategories.find((c) => c.slug === 'men');
    let womenCat = insertedCategories.find((c) => c.slug === 'women');
    let kidsCat = insertedCategories.find((c) => c.slug === 'kids');

    if (!menCat || !womenCat || !kidsCat) {
      console.log('Seeding Main Parent Categories (Men, Women, Kids)...');
      const newParents = await db
        .insert(categories)
        .values([
          { name: 'Men', slug: 'men', description: 'Minimalist luxury menswear. Clean silhouettes, premium textiles, crafted in India.' },
          { name: 'Women', slug: 'women', description: 'Architectural womenswear designed for effortless elegance and timeless style.' },
          { name: 'Kids', slug: 'kids', description: 'Thoughtfully engineered junior apparel crafted with organic hypoallergenic fabrics.' },
        ])
        .onConflictDoNothing()
        .returning();

      insertedCategories = await db.select().from(categories);
      menCat = insertedCategories.find((c) => c.slug === 'men');
      womenCat = insertedCategories.find((c) => c.slug === 'women');
      kidsCat = insertedCategories.find((c) => c.slug === 'kids');
    }

    // Seed Subcategories under Parents
    const subcatList = [
      { name: 'Gym Wear', slug: 'gymwear', parentId: menCat?.id, description: 'Premium Gym Wear — heavyweight cottons, structured silhouettes, atelier finish.' },
      { name: 'T-Shirts & Tees', slug: 't-shirts', parentId: menCat?.id, description: 'Heavyweight organic cotton tees cut with oversized, drop-shoulder silhouettes.' },
      { name: 'Hoodies & Sweatshirts', slug: 'hoodies', parentId: menCat?.id, description: 'French terry fleece hoodies, double-walled hoods, and vintage wash pullovers.' },
      { name: 'Denim & Trousers', slug: 'denim', parentId: menCat?.id, description: 'Japanese selvedge denim, cargo trousers, and relaxed tailored pants.' },
      { name: 'Outerwear & Jackets', slug: 'outerwear', parentId: menCat?.id, description: 'Architectural coats, bomber jackets, and water-repellent windbreakers.' },
      { name: 'Dresses & Suits', slug: 'dresses', parentId: womenCat?.id, description: 'Minimalist slip dresses, tailored blazer suits, and silk evening gowns.' },
      { name: 'Tops & Blouses', slug: 'tops', parentId: womenCat?.id, description: 'Silk blouses, cropped ribbed tees, and asymmetric knit tops.' },
      { name: 'Activewear & Gym', slug: 'activewear', parentId: womenCat?.id, description: 'Sculpting seamless leggings, high-impact sports bras, and ribbed gym sets.' },
      { name: 'Kids Footwear', slug: 'shoes', parentId: kidsCat?.id, description: 'Durable minimalist sneakers, leather boots, and easy slip-ons for active kids.' },
      { name: 'Kids Outerwear', slug: 'jackets', parentId: kidsCat?.id, description: 'Padded puffer jackets, cozy hoodies, and windbreakers for young explorers.' },
    ];

    for (const sub of subcatList) {
      if (!insertedCategories.some((c) => c.slug === sub.slug)) {
        await db.insert(categories).values(sub).onConflictDoNothing();
      }
    }
    insertedCategories = await db.select().from(categories);

    // 2. Seed Brands
    let insertedBrands = await db.select().from(brands);
    if (insertedBrands.length === 0) {
      console.log('Seeding Brands...');
      insertedBrands = await db.insert(brands).values([
        { name: 'LEXIDO ATHLETICS', slug: 'lexido-athletics', description: 'Standard quality brand' },
        { name: 'LEXIDO ORIGINALS', slug: 'lexido-originals', description: 'Premium quality brand' },
      ]).returning();
    } else {
      console.log('Brands already exist, skipping brands seed.');
    }

    // 3. Seed Shipping Methods
    const existingShipping = await db.select().from(shippingMethods);
    if (existingShipping.length === 0) {
      console.log('Seeding Shipping Methods...');
      await db.insert(shippingMethods).values([
        { name: 'Standard Shipping', price: '99.00', currency: 'INR', estimatedDelivery: '3-5 business days' },
        { name: 'Express Courier', price: '199.00', currency: 'INR', estimatedDelivery: '1-2 business days' },
      ]);
    } else {
      console.log('Shipping methods already exist, skipping shipping seed.');
    }

    // 4. Seed Coupons
    const existingCoupons = await db.select().from(coupons);
    if (existingCoupons.length === 0) {
      console.log('Seeding Coupons...');
      await db.insert(coupons).values([
        { code: 'WELCOME10', discountType: 'percentage', discountValue: '10.00', usageLimit: 100, perUserLimit: 1 },
        { code: 'FLAT150', discountType: 'fixed', discountValue: '150.00', currency: 'INR', usageLimit: 50, perUserLimit: 1 },
      ]);
    } else {
      console.log('Coupons already exist, skipping coupons seed.');
    }

    // 5. Seed Gymwear & Category Products
    const gymwearCat = insertedCategories.find((c) => c.slug === 'gymwear') || insertedCategories[0];
    const brandId = insertedBrands[0]?.id;

    const demoProductsToSeed = [
      {
        categoryId: gymwearCat.id,
        brandId,
        name: 'SIGNATURE GYM SET',
        slug: 'signature-gym-set',
        description: 'Heavyweight organic cotton training set with structured fit.',
        price: '4999.00',
        status: 'active' as const,
        sku: 'GYM-001',
        gender: 'men',
        fit: 'Oversized',
      },
      {
        categoryId: gymwearCat.id,
        brandId,
        name: 'SURGE TRAINING JOGGERS',
        slug: 'surge-training-joggers',
        description: 'Engineered breathability joggers with zip pockets.',
        price: '2199.00',
        status: 'active' as const,
        sku: 'GYM-002',
        gender: 'men',
        fit: 'Oversized',
      },
      {
        categoryId: gymwearCat.id,
        brandId,
        name: 'IRON STRINGER TANK',
        slug: 'iron-stringer-tank',
        description: 'Deep cut stringer tank engineered for uninhibited movement.',
        price: '3299.00',
        status: 'active' as const,
        sku: 'GYM-003',
        gender: 'men',
        fit: 'Oversized',
      },
      {
        categoryId: gymwearCat.id,
        brandId,
        name: 'APEX DRY-FIT TEE',
        slug: 'apex-dry-fit-tee',
        description: 'Ultra-lightweight moisture wicking performance tee.',
        price: '1499.00',
        status: 'active' as const,
        sku: 'GYM-004',
        gender: 'men',
        fit: 'Oversized',
      },
      {
        categoryId: gymwearCat.id,
        brandId,
        name: 'VELOCITY COMPRESSION TEE',
        slug: 'velocity-compression-tee',
        description: 'High compression full-sleeve support top for maximum stamina.',
        price: '1799.00',
        status: 'active' as const,
        sku: 'GYM-005',
        gender: 'men',
        fit: 'Oversized',
      },
    ];

    for (const prod of demoProductsToSeed) {
      await db.insert(products).values(prod).onConflictDoNothing();
    }

    console.log('✅ Seeding completed successfully!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await client.end();
    process.exit(1);
  }
}

main();
