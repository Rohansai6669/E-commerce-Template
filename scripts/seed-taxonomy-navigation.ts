import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';
import { eq } from 'drizzle-orm';
import { audiences, productAudiences } from '../src/lib/db/schema/catalog/audiences';
import { categories } from '../src/lib/db/schema/catalog/categories';
import { collections, collectionProducts } from '../src/lib/db/schema/catalog/collections';
import { navigationMenus, navigationItems, navigationPromotions } from '../src/lib/db/schema/catalog/navigation';
import { productCategories } from '../src/lib/db/schema/catalog/product-taxonomy';
import { products } from '../src/lib/db/schema/catalog/products';

async function seedTaxonomyAndNavigation() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in environment variables');
  }

  const client = postgres(databaseUrl, { max: 1 });
  const db = drizzle(client);

  console.log('🌱 Seeding PostgreSQL Database with LEXIDO Taxonomy, Collections, Audiences, & Mega Menu Navigation...');

  try {
    // 1. Seed Audiences
    console.log('1. Seeding Audiences...');
    const audienceDefs = [
      { name: 'Men', slug: 'men' },
      { name: 'Women', slug: 'women' },
      { name: 'Kids', slug: 'kids' },
      { name: 'Unisex', slug: 'unisex' },
    ];

    const insertedAudiences = [];
    for (const a of audienceDefs) {
      const [row] = await db.insert(audiences).values(a).onConflictDoNothing().returning();
      if (row) insertedAudiences.push(row);
    }
    const allAudiences = await db.select().from(audiences);
    const menAud = allAudiences.find((a) => a.slug === 'men');
    const womenAud = allAudiences.find((a) => a.slug === 'women');
    const kidsAud = allAudiences.find((a) => a.slug === 'kids');

    // 2. Seed Collections
    console.log('2. Seeding Merchandising Collections...');
    const collectionDefs = [
      { name: 'Streetwear Edit', slug: 'streetwear', description: 'Engineered oversized fits, 450 GSM cottons & atelier finish.', imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop' },
      { name: 'Gym Wear & Athletics', slug: 'gymwear', description: 'Heavyweight cottons & engineered compression wear.', imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop' },
      { name: 'Old Money Luxury', slug: 'old-money', description: 'Minimalist tailoring, pleated trousers & knitwear.', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop' },
      { name: 'Winter Drop', slug: 'winter', description: 'Heavyweight hoodies, puffer jackets & wool coats.', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop' },
      { name: 'Casual Essentials', slug: 'casual', description: 'Everyday relaxed silhouettes and organic cotton basics.', imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop' },
      { name: 'Formal Tailoring', slug: 'formal', description: 'Architectural blazers and tailored trousers.', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
      { name: 'New Arrivals', slug: 'new-arrivals', description: 'The latest drops and limited seasonal releases.', imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop' },
      { name: 'Best Sellers', slug: 'best-sellers', description: 'Our most sought-after signature pieces.', imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop' },
    ];

    for (const c of collectionDefs) {
      await db.insert(collections).values(c).onConflictDoNothing();
    }
    const allCollections = await db.select().from(collections);
    const streetwearCol = allCollections.find((c) => c.slug === 'streetwear');
    const gymwearCol = allCollections.find((c) => c.slug === 'gymwear');
    const oldMoneyCol = allCollections.find((c) => c.slug === 'old-money');
    const winterCol = allCollections.find((c) => c.slug === 'winter');

    // 3. Seed Hierarchical Categories
    console.log('3. Seeding Categories & Subcategories...');
    const mainCategories = [
      { name: 'Streetwear', slug: 'streetwear', description: 'Urban elevated streetwear and oversized silhouettes.' },
      { name: 'Gym Wear', slug: 'gymwear', description: 'High-performance activewear and gym apparel.' },
      { name: 'Old Money', slug: 'old-money', description: 'Tailored minimalist classics and fine knitwear.' },
      { name: 'Casual', slug: 'casual', description: 'Effortless everyday apparel.' },
      { name: 'Formal', slug: 'formal', description: 'Architectural formal suits and blazers.' },
      { name: 'Winter Collection', slug: 'winter-collection', description: 'Insulated outerwear and thermal fleeces.' },
      { name: "Men's Accessories", slug: 'mens-accessories', description: 'Leather belts, caps, socks & luxury wallets.' },
      { name: "Women's Accessories", slug: 'womens-accessories', description: 'Leather bags, jewelry, and silk scarves.' },
      { name: 'Baby Kit (0–2Y)', slug: 'baby-kit', description: 'Hypoallergenic newborn organic kits and rompers.' },
      { name: 'Boys (3–12Y)', slug: 'boys', description: 'Durable apparel for young boys.' },
      { name: 'Girls (3–12Y)', slug: 'girls', description: 'Comfortable dresses and active sets for girls.' },
      { name: "Kids' Accessories", slug: 'kids-accessories', description: 'Beanies, mittens, booties and soft caps.' },
    ];

    for (const cat of mainCategories) {
      await db.insert(categories).values(cat).onConflictDoNothing();
    }
    let allCategories = await db.select().from(categories);
    const streetwearCat = allCategories.find((c) => c.slug === 'streetwear');
    const gymwearCat = allCategories.find((c) => c.slug === 'gymwear');
    const babyKitCat = allCategories.find((c) => c.slug === 'baby-kit');

    // Seed Child Categories under Streetwear
    const streetwearChildDefs = [
      { name: 'Oversized T-Shirts', slug: 'oversized-t-shirts', parentId: streetwearCat?.id },
      { name: 'Graphic T-Shirts', slug: 'graphic-t-shirts', parentId: streetwearCat?.id },
      { name: 'Heavyweight T-Shirts', slug: 'heavyweight-t-shirts', parentId: streetwearCat?.id },
      { name: 'Long Sleeve T-Shirts', slug: 'long-sleeve-t-shirts', parentId: streetwearCat?.id },
      { name: 'Oversized Hoodies', slug: 'oversized-hoodies', parentId: streetwearCat?.id },
      { name: 'Zip Hoodies', slug: 'zip-hoodies', parentId: streetwearCat?.id },
      { name: 'Sweatshirts', slug: 'sweatshirts', parentId: streetwearCat?.id },
      { name: 'Baggy Jeans', slug: 'baggy-jeans', parentId: streetwearCat?.id },
      { name: 'Wide-Leg Jeans', slug: 'wide-leg-jeans', parentId: streetwearCat?.id },
      { name: 'Cargo Pants', slug: 'cargo-pants', parentId: streetwearCat?.id },
      { name: 'Utility Pants', slug: 'utility-pants', parentId: streetwearCat?.id },
      { name: 'Joggers', slug: 'joggers', parentId: streetwearCat?.id },
      { name: 'Denim Jackets', slug: 'denim-jackets', parentId: streetwearCat?.id },
      { name: 'Bomber Jackets', slug: 'bomber-jackets', parentId: streetwearCat?.id },
      { name: 'Varsity Jackets', slug: 'varsity-jackets', parentId: streetwearCat?.id },
      { name: 'Overshirts', slug: 'overshirts', parentId: streetwearCat?.id },
      { name: 'Shorts', slug: 'shorts', parentId: streetwearCat?.id },
    ];

    for (const child of streetwearChildDefs) {
      await db.insert(categories).values(child).onConflictDoNothing();
    }

    // Seed Child Categories under Baby Kit
    const babyKitChildDefs = [
      { name: 'Onesies & Rompers', slug: 'onesies-rompers', parentId: babyKitCat?.id },
      { name: 'Sleep Suits', slug: 'sleep-suits', parentId: babyKitCat?.id },
      { name: 'Baby Tees', slug: 'baby-tees', parentId: babyKitCat?.id },
      { name: 'Booties & Caps', slug: 'booties-caps', parentId: babyKitCat?.id },
      { name: 'Bibs & Mittens', slug: 'bibs-mittens', parentId: babyKitCat?.id },
    ];

    for (const child of babyKitChildDefs) {
      await db.insert(categories).values(child).onConflictDoNothing();
    }

    allCategories = await db.select().from(categories);

    // 4. Seed Navigation Menus, Items, & Promotions
    console.log('4. Seeding Navigation Menus & Items...');

    // Clear existing menu navigation to avoid duplicates on re-run
    await db.delete(navigationItems);
    await db.delete(navigationPromotions);
    await db.delete(navigationMenus);

    // Create Navigation Menus
    const [menMenu] = await db
      .insert(navigationMenus)
      .values({ name: 'Men Navigation Menu', slug: 'men-main-menu', location: 'main' })
      .returning();

    const [womenMenu] = await db
      .insert(navigationMenus)
      .values({ name: 'Women Navigation Menu', slug: 'women-main-menu', location: 'main' })
      .returning();

    const [kidsMenu] = await db
      .insert(navigationMenus)
      .values({ name: 'Kids Navigation Menu', slug: 'kids-main-menu', location: 'main' })
      .returning();

    // MEN MENU ITEMS
    // Left-side Category / Style Navigation Items (parent_id = null)
    const leftCategories = [
      { label: 'STREETWEAR', slug: 'streetwear', sortOrder: 1 },
      { label: 'GYM WEAR', slug: 'gymwear', sortOrder: 2 },
      { label: 'OLD MONEY', slug: 'old-money', sortOrder: 3 },
      { label: 'CASUAL', slug: 'casual', sortOrder: 4 },
      { label: 'FORMAL', slug: 'formal', sortOrder: 5 },
      { label: 'WINTER COLLECTION', slug: 'winter-collection', sortOrder: 6 },
      { label: "MEN'S ACCESSORIES", slug: 'mens-accessories', sortOrder: 7 },
    ];

    for (const catItem of leftCategories) {
      const match = allCategories.find((c) => c.slug === catItem.slug);
      const [parentItem] = await db
        .insert(navigationItems)
        .values({
          menuId: menMenu.id,
          label: catItem.label,
          itemType: 'category',
          categoryId: match?.id || null,
          url: `/men/${catItem.slug}`,
          sortOrder: catItem.sortOrder,
        })
        .returning();

      // For STREETWEAR, seed the 2-column middle product links matching screenshot!
      if (catItem.slug === 'streetwear' && parentItem) {
        // Column 1 Items
        const col1Items = [
          { label: 'Oversized T-Shirts', slug: 'oversized-t-shirts', sortOrder: 1 },
          { label: 'Graphic T-Shirts', slug: 'graphic-t-shirts', sortOrder: 2 },
          { label: 'Oversized Hoodies', slug: 'oversized-hoodies', sortOrder: 3 },
          { label: 'Zip Hoodies', slug: 'zip-hoodies', sortOrder: 4 },
          { label: 'Wide-Leg Jeans', slug: 'wide-leg-jeans', sortOrder: 5 },
          { label: 'Utility Pants', slug: 'utility-pants', sortOrder: 6 },
          { label: 'Denim Jackets', slug: 'denim-jackets', sortOrder: 7 },
          { label: 'Varsity Jackets', slug: 'varsity-jackets', sortOrder: 8 },
          { label: 'Shorts', slug: 'shorts', sortOrder: 9 },
        ];

        for (const item of col1Items) {
          const cat = allCategories.find((c) => c.slug === item.slug);
          await db.insert(navigationItems).values({
            menuId: menMenu.id,
            parentId: parentItem.id,
            label: item.label,
            itemType: 'category',
            categoryId: cat?.id || null,
            url: `/men/streetwear/${item.slug}`,
            sortOrder: item.sortOrder,
            columnNumber: 1,
          });
        }

        // Column 2 Items
        const col2Items = [
          { label: 'Heavyweight T-Shirts', slug: 'heavyweight-t-shirts', sortOrder: 1 },
          { label: 'Long Sleeve T-Shirts', slug: 'long-sleeve-t-shirts', sortOrder: 2 },
          { label: 'Sweatshirts', slug: 'sweatshirts', sortOrder: 3 },
          { label: 'Baggy Jeans', slug: 'baggy-jeans', sortOrder: 4 },
          { label: 'Cargo Pants', slug: 'cargo-pants', sortOrder: 5 },
          { label: 'Joggers', slug: 'joggers', sortOrder: 6 },
          { label: 'Bomber Jackets', slug: 'bomber-jackets', sortOrder: 7 },
          { label: 'Overshirts', slug: 'overshirts', sortOrder: 8 },
        ];

        for (const item of col2Items) {
          const cat = allCategories.find((c) => c.slug === item.slug);
          await db.insert(navigationItems).values({
            menuId: menMenu.id,
            parentId: parentItem.id,
            label: item.label,
            itemType: 'category',
            categoryId: cat?.id || null,
            url: `/men/streetwear/${item.slug}`,
            sortOrder: item.sortOrder,
            columnNumber: 2,
          });
        }
      }
    }

    // Navigation Promotion Card for Men Menu
    await db.insert(navigationPromotions).values({
      menuId: menMenu.id,
      title: 'DISCOVER STREETWEAR',
      description: 'Engineered oversized fits, 450 GSM cottons & atelier finish.',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      targetUrl: '/collections/streetwear',
      actionLabel: 'SHOP THE EDIT',
    });

    // WOMEN MENU ITEMS
    const womenLeftCategories = [
      { label: 'STREETWEAR', slug: 'streetwear', sortOrder: 1 },
      { label: 'GYM WEAR', slug: 'gymwear', sortOrder: 2 },
      { label: 'OLD MONEY', slug: 'old-money', sortOrder: 3 },
      { label: 'DRESSES & SUITS', slug: 'dresses', sortOrder: 4 },
      { label: 'TOPS & BLOUSES', slug: 'tops', sortOrder: 5 },
      { label: 'WINTER COLLECTION', slug: 'winter-collection', sortOrder: 6 },
      { label: "WOMEN'S ACCESSORIES", slug: 'womens-accessories', sortOrder: 7 },
    ];

    for (const catItem of womenLeftCategories) {
      const match = allCategories.find((c) => c.slug === catItem.slug);
      await db.insert(navigationItems).values({
        menuId: womenMenu.id,
        label: catItem.label,
        itemType: 'category',
        categoryId: match?.id || null,
        url: `/women/${catItem.slug}`,
        sortOrder: catItem.sortOrder,
      });
    }

    await db.insert(navigationPromotions).values({
      menuId: womenMenu.id,
      title: 'MINIMALIST SILHOUETTES',
      description: 'Tailored oversized coats, organic silk & signature cropped cuts.',
      imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
      targetUrl: '/audience/women',
      actionLabel: 'SHOP WOMEN',
    });

    // KIDS MENU ITEMS
    const kidsLeftCategories = [
      { label: 'BABY KIT (0–2Y)', slug: 'baby-kit', sortOrder: 1 },
      { label: 'BOYS (3–12Y)', slug: 'boys', sortOrder: 2 },
      { label: 'GIRLS (3–12Y)', slug: 'girls', sortOrder: 3 },
      { label: 'WINTER WEAR', slug: 'winter-collection', sortOrder: 4 },
      { label: "KIDS' ACCESSORIES", slug: 'kids-accessories', sortOrder: 5 },
    ];

    for (const catItem of kidsLeftCategories) {
      const match = allCategories.find((c) => c.slug === catItem.slug);
      const [parentItem] = await db
        .insert(navigationItems)
        .values({
          menuId: kidsMenu.id,
          label: catItem.label,
          itemType: 'category',
          categoryId: match?.id || null,
          url: `/kids/${catItem.slug}`,
          sortOrder: catItem.sortOrder,
        })
        .returning();

      if (catItem.slug === 'baby-kit' && parentItem) {
        const babyItems = [
          { label: 'Onesies & Rompers', slug: 'onesies-rompers', sortOrder: 1, col: 1 },
          { label: 'Sleep Suits', slug: 'sleep-suits', sortOrder: 2, col: 1 },
          { label: 'Baby Tees', slug: 'baby-tees', sortOrder: 3, col: 1 },
          { label: 'Booties & Caps', slug: 'booties-caps', sortOrder: 1, col: 2 },
          { label: 'Bibs & Mittens', slug: 'bibs-mittens', sortOrder: 2, col: 2 },
        ];

        for (const item of babyItems) {
          const cat = allCategories.find((c) => c.slug === item.slug);
          await db.insert(navigationItems).values({
            menuId: kidsMenu.id,
            parentId: parentItem.id,
            label: item.label,
            itemType: 'category',
            categoryId: cat?.id || null,
            url: `/kids/baby-kit/${item.slug}`,
            sortOrder: item.sortOrder,
            columnNumber: item.col,
          });
        }
      }
    }

    await db.insert(navigationPromotions).values({
      menuId: kidsMenu.id,
      title: 'JUNIOR ESSENTIALS',
      description: 'Durable organic cotton apparel & newborn nursery gifts.',
      imageUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?q=80&w=800&auto=format&fit=crop',
      targetUrl: '/audience/kids',
      actionLabel: 'EXPLORE KIDS',
    });

    // 5. Seed Canonical Products & Assign to Categories, Collections, & Audiences
    console.log('5. Seeding Canonical Products & Target Mappings...');
    const productsToSeed = [
      {
        name: 'PARTNER BOXY TEE',
        slug: 'partner-boxy-tee',
        description: '450 GSM heavyweight cotton boxy tee with drop shoulder silhouette.',
        price: '1799.00',
        status: 'active' as const,
        sku: 'LEX-BOX-01',
        gender: 'men',
        fit: 'Oversized',
        categorySlug: 'oversized-t-shirts',
        collectionSlug: 'streetwear',
        audienceSlug: 'men',
      },
      {
        name: 'PARTNER DENIM WIDE',
        slug: 'partner-denim-wide',
        description: 'Japanese selvedge wide-leg denim trousers in vintage wash.',
        price: '4299.00',
        compareAtPrice: '4999.00',
        status: 'active' as const,
        sku: 'LEX-DNM-01',
        gender: 'men',
        fit: 'Relaxed',
        categorySlug: 'wide-leg-jeans',
        collectionSlug: 'streetwear',
        audienceSlug: 'men',
      },
      {
        name: '450 GSM BLACK HOODIE',
        slug: '450-gsm-black-hoodie',
        description: 'Ultra-heavyweight French terry pullover hoodie in noir black.',
        price: '3499.00',
        status: 'active' as const,
        sku: 'LEX-HD-01',
        gender: 'men',
        fit: 'Oversized',
        categorySlug: 'oversized-hoodies',
        collectionSlug: 'winter',
        audienceSlug: 'men',
      },
      {
        name: 'SIGNATURE GYM SET',
        slug: 'signature-gym-set',
        description: 'Engineered moisture wicking training compression top and shorts.',
        price: '4999.00',
        status: 'active' as const,
        sku: 'LEX-GYM-01',
        gender: 'men',
        fit: 'Athletic',
        categorySlug: 'gymwear',
        collectionSlug: 'gymwear',
        audienceSlug: 'men',
      },
      {
        name: 'ORGANIC BABY ROMPER',
        slug: 'organic-baby-romper',
        description: '100% hypoallergenic organic cotton sleep romper with snap buttons.',
        price: '1299.00',
        status: 'active' as const,
        sku: 'LEX-KID-01',
        gender: 'kids',
        fit: 'Comfort',
        categorySlug: 'onesies-rompers',
        collectionSlug: 'casual',
        audienceSlug: 'kids',
      },
    ];

    for (const p of productsToSeed) {
      const catMatch = allCategories.find((c) => c.slug === p.categorySlug);
      const [insertedProduct] = await db
        .insert(products)
        .values({
          categoryId: catMatch?.id || null,
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          status: p.status,
          sku: p.sku,
          gender: p.gender,
          fit: p.fit,
        })
        .onConflictDoNothing()
        .returning();

      const prodRecord = insertedProduct || (await db.select().from(products).where(eq(products.slug, p.slug)).limit(1))[0];

      if (prodRecord) {
        // Map to product_categories
        if (catMatch) {
          await db.insert(productCategories).values({
            productId: prodRecord.id,
            categoryId: catMatch.id,
            isPrimary: true,
          }).onConflictDoNothing();
        }

        // Map to collection_products
        const colMatch = allCollections.find((c) => c.slug === p.collectionSlug);
        if (colMatch) {
          await db.insert(collectionProducts).values({
            collectionId: colMatch.id,
            productId: prodRecord.id,
            sortOrder: 1,
          }).onConflictDoNothing();
        }

        // Map to product_audiences
        const audMatch = allAudiences.find((a) => a.slug === p.audienceSlug);
        if (audMatch) {
          await db.insert(productAudiences).values({
            productId: prodRecord.id,
            audienceId: audMatch.id,
          }).onConflictDoNothing();
        }
      }
    }

    console.log('🎉 Successfully Seeded Database Taxonomy, Collections, Audiences, & Mega Menu Navigation!');
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Failed:', err);
    await client.end();
    process.exit(1);
  }
}

seedTaxonomyAndNavigation();
