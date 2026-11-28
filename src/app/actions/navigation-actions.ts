'use server';

import { db } from '@/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '@/lib/db/schema/catalog/navigation';
import { categories } from '@/lib/db/schema/catalog/categories';
import { eq, and, asc, isNull, inArray, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getOrSetCached } from '@/core/performance/cache';

export interface DbMegamenuCollection {
  id: string;
  name: string;
  href: string;
  subitems: Array<{ label: string; href: string; columnNumber?: number }>;
  featured: {
    title: string;
    imageUrl: string;
    href: string;
    actionLabel?: string;
  };
}

/**
 * Resolves a category's cover image from explicit DB field or curated aesthetic fallback.
 */
function resolveCuratedCategoryImage(labelOrSlug: string, explicitUrl?: string | null): string {
  if (explicitUrl && explicitUrl.trim() !== '') return explicitUrl.trim();

  const term = labelOrSlug.toLowerCase();
  if (term.includes('street')) return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('gym') || term.includes('athletic') || term.includes('sport')) return 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('old money') || term.includes('polo') || term.includes('heritage')) return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('casual') || term.includes('t-shirt') || term.includes('tee')) return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('formal') || term.includes('suit') || term.includes('blazer')) return 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('winter') || term.includes('coat') || term.includes('jacket')) return 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('access') || term.includes('watch') || term.includes('bag')) return 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('hoodie') || term.includes('sweat')) return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=1200&auto=format&fit=crop';
  if (term.includes('denim') || term.includes('jean')) return 'https://images.unsplash.com/photo-1542272604-780c96856592?q=80&w=1200&auto=format&fit=crop';

  return 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop';
}

/**
 * Fetches database-backed mega menu collections, items, and promotions for a specific audience or menu.
 * Driven directly by the 3-Tier Category Taxonomy from Admin (/admin/categories):
 * Tier 1 (Root Category: Men/Women/Kids) -> Tier 2 (Subcategories) -> Tier 3 (Child Categories).
 */
export async function getStorefrontNavigationAction(categoryOrSlug: string = 'MEN'): Promise<DbMegamenuCollection[]> {
  const cleanPattern = categoryOrSlug.toLowerCase().trim();
  const cacheKey = `storefront_nav_${cleanPattern}`;

  return getOrSetCached(cacheKey, 60 * 1000, ['categories', 'navigation'], async () => {
    try {
      if (!db) return [];

      // Query active catalog categories from the 3-tier taxonomy tree
      const dbCategories = await db
        .select()
        .from(categories)
        .where(and(eq(categories.isActive, true), sql`${categories.deletedAt} IS NULL`))
        .orderBy(asc(categories.name));

      // 1. Primary source of truth: 3-Tier Categories Taxonomy
      if (dbCategories.length > 0) {
        // Find parent audience or root category (e.g. 'men', 'women', 'kids')
        const audienceParent = dbCategories.find(
          (c) =>
            !c.parentId &&
            (c.slug.toLowerCase() === cleanPattern ||
              c.name.toLowerCase() === cleanPattern ||
              c.name.toLowerCase().includes(cleanPattern) ||
              cleanPattern.includes(c.slug.toLowerCase()))
        );

        if (audienceParent) {
          // Find Tier 2 subcategories belonging to this root category
          const subcategories = dbCategories.filter((c) => c.parentId === audienceParent.id);

          if (subcategories.length > 0) {
            const audiencePrefix = `/${audienceParent.slug}`;

            return subcategories.map((subcat) => {
              // Find Tier 3 child categories belonging to this Tier 2 subcategory
              const childCategories = dbCategories.filter((c) => c.parentId === subcat.id);
              const subcatHref = `${audiencePrefix}/${subcat.slug}`;
              const categoryImage = subcat.imageUrl || resolveCuratedCategoryImage(subcat.name, subcat.imageUrl);

              return {
                id: subcat.id,
                name: subcat.name.toUpperCase(),
                href: subcatHref,
                subitems:
                  childCategories.length > 0
                    ? childCategories.map((child, idx) => ({
                        label: child.name,
                        href: `${subcatHref}/${child.slug}`,
                        columnNumber: (idx % 2) + 1,
                      }))
                    : [
                        { label: 'Shop All ' + subcat.name, href: subcatHref, columnNumber: 1 },
                        { label: 'New Arrivals', href: `${subcatHref}?sort=newest`, columnNumber: 1 },
                        { label: 'Bestsellers', href: `${subcatHref}?sort=popular`, columnNumber: 2 },
                      ],
                featured: {
                  title: `DISCOVER ${subcat.name.toUpperCase()}`,
                  imageUrl: categoryImage,
                  href: subcatHref,
                  actionLabel: 'SHOP THE EDIT',
                },
              };
            });
          }
        }
      }

      // 2. Secondary fallback: check navigationMenus / navigationItems for custom menus
      const allMenus = await db
        .select()
        .from(navigationMenus)
        .where(eq(navigationMenus.isActive, true))
        .orderBy(asc(navigationMenus.name));

      if (allMenus.length > 0) {
        const targetMenu =
          allMenus.find((m) => m.slug.toLowerCase() === cleanPattern || m.id === cleanPattern) ||
          allMenus.find((m) => m.slug.toLowerCase().startsWith(`${cleanPattern}-`) || m.slug.toLowerCase().endsWith(`-${cleanPattern}`)) ||
          allMenus.find((m) => {
            const words = m.name.toLowerCase().split(/\s+/);
            return words.includes(cleanPattern);
          }) ||
          allMenus[0];

        if (targetMenu) {
          const items = await db
            .select()
            .from(navigationItems)
            .where(and(eq(navigationItems.menuId, targetMenu.id), eq(navigationItems.isActive, true)))
            .orderBy(asc(navigationItems.sortOrder));

          const [promo] = await db
            .select()
            .from(navigationPromotions)
            .where(and(eq(navigationPromotions.menuId, targetMenu.id), eq(navigationPromotions.isActive, true)))
            .limit(1);

          const rootParents = items.filter((i) => !i.parentId);

          if (rootParents.length > 0) {
            const defaultFeatured = promo
              ? {
                  title: promo.title,
                  imageUrl: promo.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
                  href: promo.targetUrl || '/products',
                  actionLabel: promo.actionLabel || 'SHOP THE EDIT',
                }
              : {
                  title: 'DISCOVER ' + targetMenu.name.toUpperCase(),
                  imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop',
                  href: '/products',
                  actionLabel: 'SHOP THE EDIT',
                };

            const result: DbMegamenuCollection[] = [];
            for (const parent of rootParents) {
              const children = items.filter((i) => i.parentId === parent.id);

              const matchedCategory = dbCategories.find(
                (c) =>
                  c.name.toLowerCase() === parent.label.toLowerCase() ||
                  c.slug.toLowerCase() === parent.label.toLowerCase().replace(/\s+/g, '-') ||
                  (parent.url && parent.url.includes(c.slug))
              );

              const categoryImage = resolveCuratedCategoryImage(
                parent.label,
                parent.imageUrl || matchedCategory?.imageUrl || (promo?.imageUrl ? defaultFeatured.imageUrl : null)
              );

              const categoryFeatured = {
                title: `DISCOVER ${parent.label.toUpperCase()}`,
                imageUrl: categoryImage,
                href: parent.url || `/${cleanPattern}/${parent.label.toLowerCase().replace(/\s+/g, '-')}`,
                actionLabel: 'SHOP THE EDIT',
              };

              result.push({
                id: parent.id,
                name: parent.label,
                href: parent.url || `/${cleanPattern}/${parent.label.toLowerCase().replace(/\s+/g, '-')}`,
                subitems: children.map((c, idx) => ({
                  label: c.label,
                  href: c.url || `/${cleanPattern}/${parent.label.toLowerCase().replace(/\s+/g, '-')}/${c.label.toLowerCase().replace(/\s+/g, '-')}`,
                  columnNumber: c.columnNumber || (idx % 2) + 1,
                })),
                featured: categoryFeatured,
              });
            }

            if (result.length > 0) return result;
          }
        }
      }

      return [];
    } catch (err) {
      console.warn('getStorefrontNavigationAction DB error:', err);
      return [];
    }
  });
}

/**
 * Returns dynamic top-level navigation links from the database root categories (Tier 1).
 * High-speed cached with 60s TTL.
 */
export async function getStorefrontNavLinksAction(): Promise<
  Array<{ id: string; label: string; href: string; hasMega: boolean }>
> {
  return getOrSetCached('storefront_nav_links_root', 60 * 1000, ['categories', 'navigation'], async () => {
    try {
      if (!db) return [];

      const rootCategories = await db
        .select()
        .from(categories)
        .where(and(eq(categories.isActive, true), isNull(categories.parentId), sql`${categories.deletedAt} IS NULL`))
        .orderBy(asc(categories.name));

      if (rootCategories.length === 0) return [];

      // Check which root categories have subcategories to activate hasMega dropdown
      const allSubs = await db
        .select({ parentId: categories.parentId })
        .from(categories)
        .where(
          and(
            eq(categories.isActive, true),
            sql`${categories.parentId} IS NOT NULL`,
            sql`${categories.deletedAt} IS NULL`
          )
        );

      const parentIdsWithChildren = new Set(allSubs.map((s) => s.parentId));

      const standardOrder = ['men', 'women', 'kids'];
      const sorted = [...rootCategories].sort((a, b) => {
        const idxA = standardOrder.indexOf(a.slug.toLowerCase());
        const idxB = standardOrder.indexOf(b.slug.toLowerCase());
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.name.localeCompare(b.name);
      });

      return sorted.map((cat) => ({
        id: `nav-${cat.slug}`,
        label: cat.name.toUpperCase(),
        href: `/${cat.slug}`,
        hasMega: parentIdsWithChildren.has(cat.id),
      }));
    } catch (err) {
      console.warn('getStorefrontNavLinksAction error:', err);
      return [];
    }
  });
}

/**
 * Returns all menus and their configured items for admin management.
 */
export async function getAllNavigationDataAction() {
  try {
    if (!db) return { menus: [], items: [], promos: [] };

    const [menus, items, promos] = await Promise.all([
      db.select().from(navigationMenus).orderBy(asc(navigationMenus.name)),
      db.select().from(navigationItems).orderBy(asc(navigationItems.sortOrder)),
      db.select().from(navigationPromotions),
    ]);

    return { menus, items, promos };
  } catch (err) {
    console.error('getAllNavigationDataAction error:', err);
    return { menus: [], items: [], promos: [] };
  }
}

/**
 * Creates a new top-level navigation menu (e.g. "Collections", "Categories", "Men").
 */
export async function createNavigationMenuAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  if (!name) return { success: false, error: 'Menu name is required.' };

  const finalSlug = (slug || name).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    await db.insert(navigationMenus).values({
      name: name.trim(),
      slug: finalSlug,
      location: 'main',
      isActive: true,
    });

    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Create navigation menu error:', err);
    return { success: false, error: 'Failed to create navigation menu (duplicate slug or DB error).' };
  }
}

/**
 * Deletes a navigation menu and its associated items.
 */
export async function deleteNavigationMenuAction(menuId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(navigationMenus).where(eq(navigationMenus.id, menuId));
    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Delete navigation menu error:', err);
    return { success: false, error: 'Failed to delete navigation menu.' };
  }
}

/**
 * Creates a new navigation category or subcategory item.
 */
export async function createNavigationItemAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const menuId = formData.get('menuId') as string;
  const parentId = formData.get('parentId') as string;
  const label = formData.get('label') as string;
  const url = formData.get('url') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const columnNumberStr = formData.get('columnNumber') as string;
  const sortOrderStr = formData.get('sortOrder') as string;

  if (!menuId || !label || !url) {
    return { success: false, error: 'Menu ID, Label, and URL are required.' };
  }

  try {
    const columnNumber = columnNumberStr ? parseInt(columnNumberStr) : null;
    const sortOrder = sortOrderStr ? parseInt(sortOrderStr) : 0;

    await db.insert(navigationItems).values({
      menuId,
      parentId: parentId && parentId.trim() ? parentId.trim() : null,
      label: label.trim(),
      itemType: 'category',
      url: url.trim(),
      imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
      columnNumber: columnNumber as any,
      sortOrder,
      isActive: true,
    });

    console.log(`[Navigation Item Created] ${label}`);
    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Create navigation item error:', err);
    return { success: false, error: 'Failed to create navigation item.' };
  }
}

/**
 * Updates an existing navigation item.
 */
export async function updateNavigationItemAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const itemId = formData.get('itemId') as string;
  const label = formData.get('label') as string;
  const url = formData.get('url') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const columnNumberStr = formData.get('columnNumber') as string;
  const sortOrderStr = formData.get('sortOrder') as string;

  if (!itemId || !label || !url) {
    return { success: false, error: 'Item ID, Label, and URL are required.' };
  }

  try {
    const columnNumber = columnNumberStr ? parseInt(columnNumberStr) : null;
    const sortOrder = sortOrderStr ? parseInt(sortOrderStr) : 0;

    await db
      .update(navigationItems)
      .set({
        label: label.trim(),
        url: url.trim(),
        imageUrl: imageUrl && imageUrl.trim() ? imageUrl.trim() : null,
        columnNumber: columnNumber as any,
        sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(navigationItems.id, itemId));

    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Update navigation item error:', err);
    return { success: false, error: 'Failed to update navigation item.' };
  }
}

/**
 * Updates promotional hero card content for a menu.
 */
export async function updateNavigationPromotionAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const promoId = formData.get('promoId') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const targetUrl = formData.get('targetUrl') as string;
  const actionLabel = formData.get('actionLabel') as string;

  if (!promoId || !title || !imageUrl) {
    return { success: false, error: 'Promo ID, Title, and Image URL are required.' };
  }

  try {
    await db
      .update(navigationPromotions)
      .set({
        title: title.trim(),
        description: description ? description.trim() : null,
        imageUrl: imageUrl.trim(),
        targetUrl: targetUrl ? targetUrl.trim() : null,
        actionLabel: actionLabel ? actionLabel.trim() : null,
        updatedAt: new Date(),
      })
      .where(eq(navigationPromotions.id, promoId));

    console.log(`[Navigation Promotion Updated] ID: ${promoId}`);
    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Update navigation promotion error:', err);
    return { success: false, error: 'Failed to update promotional card.' };
  }
}

/**
 * Deletes a navigation item and any child subcategories it contains.
 */
export async function deleteNavigationItemAction(itemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete any children first
    await db.delete(navigationItems).where(eq(navigationItems.parentId, itemId));
    // Delete the item itself
    await db.delete(navigationItems).where(eq(navigationItems.id, itemId));

    revalidatePath('/admin/navigation');
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.error('Delete navigation item error:', err);
    return { success: false, error: 'Failed to delete navigation item.' };
  }
}
