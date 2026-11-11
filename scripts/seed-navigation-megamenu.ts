import { db } from '../src/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '../src/lib/db/schema/catalog/navigation';
import { eq, and } from 'drizzle-orm';

async function seedNavigationMegamenu() {
  console.log('Seeding rich navigation categories, subcategories, and promotional cards...');

  // 1. Find Men Navigation Menu
  const [menMenu] = await db.select().from(navigationMenus).where(eq(navigationMenus.slug, 'men-main-menu'));
  if (!menMenu) {
    throw new Error('men-main-menu not found');
  }

  // Update parent categories with images
  const parentUpdates: Record<string, { imageUrl: string; subcategories: Array<{ label: string; url: string; col: number }> }> = {
    'STREETWEAR': {
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
      subcategories: [], // Already has 17 items
    },
    'GYM WEAR': {
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Signature Gym Set', url: '/products?category=gymwear', col: 1 },
        { label: 'Surge Training Joggers', url: '/products?category=gymwear', col: 1 },
        { label: 'Iron Stringer Tank', url: '/products?category=gymwear', col: 1 },
        { label: 'Apex Dry-Fit Tee', url: '/products?category=gymwear', col: 1 },
        { label: 'Drop Armhole Tanks', url: '/products?category=gymwear', col: 1 },
        { label: 'Velocity Compression Top', url: '/products?category=gymwear', col: 2 },
        { label: 'Heavyweight Fleece Shorts', url: '/products?category=gymwear', col: 2 },
        { label: 'Seamless Base Layers', url: '/products?category=gymwear', col: 2 },
        { label: 'Lifting Straps & Wraps', url: '/products?category=gymwear', col: 2 },
        { label: 'Performance Zip Jackets', url: '/products?category=gymwear', col: 2 },
      ],
    },
    'OLD MONEY': {
      imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Oxford Cotton Shirts', url: '/products?category=old-money', col: 1 },
        { label: 'Cashmere Crewnecks', url: '/products?category=old-money', col: 1 },
        { label: 'Cable Knit Sweaters', url: '/products?category=old-money', col: 1 },
        { label: 'French Linen Trousers', url: '/products?category=old-money', col: 1 },
        { label: 'Double-Breasted Blazers', url: '/products?category=old-money', col: 1 },
        { label: 'Tailored Pleated Chinos', url: '/products?category=old-money', col: 2 },
        { label: 'Italian Suede Loafers', url: '/products?category=old-money', col: 2 },
        { label: 'Classic Trench Coats', url: '/products?category=old-money', col: 2 },
        { label: 'Mulberry Silk Ties', url: '/products?category=old-money', col: 2 },
        { label: 'Leather Driving Gloves', url: '/products?category=old-money', col: 2 },
      ],
    },
    'CASUAL': {
      imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Everyday Crewneck Tees', url: '/products?category=casual', col: 1 },
        { label: 'Pique Polo Shirts', url: '/products?category=casual', col: 1 },
        { label: 'Washed Denim Overshirts', url: '/products?category=casual', col: 1 },
        { label: 'Waffle Long Sleeve Tops', url: '/products?category=casual', col: 1 },
        { label: 'Relaxed Fit Chinos', url: '/products?category=casual', col: 2 },
        { label: 'Straight Leg Denim Jeans', url: '/products?category=casual', col: 2 },
        { label: 'Casual Field Jackets', url: '/products?category=casual', col: 2 },
        { label: 'Minimalist Canvas Sneakers', url: '/products?category=casual', col: 2 },
      ],
    },
    'FORMAL': {
      imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Structured Two-Piece Suits', url: '/products?category=formal', col: 1 },
        { label: 'French Cuff Dress Shirts', url: '/products?category=formal', col: 1 },
        { label: 'Sartorial Tuxedo Jackets', url: '/products?category=formal', col: 1 },
        { label: 'Slim Fit Tuxedo Trousers', url: '/products?category=formal', col: 1 },
        { label: 'Pure Wool Dress Trousers', url: '/products?category=formal', col: 2 },
        { label: 'Handcrafted Oxford Shoes', url: '/products?category=formal', col: 2 },
        { label: 'Silk Bow Ties & Cummerbunds', url: '/products?category=formal', col: 2 },
        { label: 'Engraved Silver Cufflinks', url: '/products?category=formal', col: 2 },
      ],
    },
    'WINTER COLLECTION': {
      imageUrl: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Heavy Down Puffer Jackets', url: '/products?category=winter', col: 1 },
        { label: 'Cashmere Wool Overcoats', url: '/products?category=winter', col: 1 },
        { label: 'Thermal Merino Base Layers', url: '/products?category=winter', col: 1 },
        { label: 'Sherpa-Lined Corduroy Jackets', url: '/products?category=winter', col: 1 },
        { label: 'Fleece Lined Joggers', url: '/products?category=winter', col: 2 },
        { label: 'Ribbed Cashmere Beanies', url: '/products?category=winter', col: 2 },
        { label: 'Heavyweight Wool Scarves', url: '/products?category=winter', col: 2 },
        { label: 'Insulated Arctic Parkas', url: '/products?category=winter', col: 2 },
      ],
    },
    "MEN'S ACCESSORIES": {
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop',
      subcategories: [
        { label: 'Full-Grain Leather Duffle Bags', url: '/products?category=accessories', col: 1 },
        { label: 'Minimalist Automatic Watches', url: '/products?category=accessories', col: 1 },
        { label: '925 Sterling Silver Chains', url: '/products?category=accessories', col: 1 },
        { label: 'Polarized Aviator Sunglasses', url: '/products?category=accessories', col: 1 },
        { label: 'Structured Wool Snapbacks', url: '/products?category=accessories', col: 2 },
        { label: 'Full Grain Italian Belts', url: '/products?category=accessories', col: 2 },
        { label: 'RFID Blocking Cardholders', url: '/products?category=accessories', col: 2 },
        { label: 'Atelier Leather Wallets', url: '/products?category=accessories', col: 2 },
      ],
    },
  };

  const existingItems = await db.select().from(navigationItems).where(eq(navigationItems.menuId, menMenu.id));

  for (const item of existingItems) {
    if (!item.parentId && parentUpdates[item.label]) {
      const config = parentUpdates[item.label];
      // Update parent image
      await db
        .update(navigationItems)
        .set({ imageUrl: config.imageUrl })
        .where(eq(navigationItems.id, item.id));

      console.log(`Updated parent ${item.label} with banner image`);

      // Check if it already has subcategories
      const currentSubs = existingItems.filter((i) => i.parentId === item.id);
      if (currentSubs.length === 0 && config.subcategories.length > 0) {
        let order = 1;
        for (const sub of config.subcategories) {
          await db.insert(navigationItems).values({
            menuId: menMenu.id,
            parentId: item.id,
            label: sub.label,
            itemType: 'category',
            url: sub.url,
            columnNumber: sub.col,
            sortOrder: order++,
            isActive: true,
          });
        }
        console.log(`Added ${config.subcategories.length} subcategories to ${item.label}`);
      }
    }
  }

  console.log('✅ Navigation Megamenu database seeding complete!');
  process.exit(0);
}

seedNavigationMegamenu().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

