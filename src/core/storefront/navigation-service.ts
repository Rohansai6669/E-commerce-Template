import { db } from '@/lib/db';
import { navigationMenus, navigationItems, navigationPromotions } from '@/lib/db/schema/catalog/navigation';
import { eq, and, asc } from 'drizzle-orm';
import { navigationConfig, type NavigationSection, type NavigationGroup, type NavigationItem } from './navigation';

export class NavigationService {
  /**
   * Fetches active storefront navigation sections from database.
   * If DB has active navigation configuration, constructs dynamic multi-column tree.
   * Fallbacks gracefully to navigationConfig if DB tables are empty.
   */
  async getStorefrontNavigation(): Promise<NavigationSection[]> {
    try {
      if (!db) return navigationConfig;

      const activeMenus = await db
        .select()
        .from(navigationMenus)
        .where(eq(navigationMenus.isActive, true))
        .orderBy(asc(navigationMenus.name));

      if (activeMenus.length === 0) return navigationConfig;

      const sections: NavigationSection[] = [];

      for (const menu of activeMenus) {
        // Fetch root level items (parentId IS NULL)
        const rootItems = await db
          .select()
          .from(navigationItems)
          .where(and(eq(navigationItems.menuId, menu.id), eq(navigationItems.isActive, true)))
          .orderBy(asc(navigationItems.sortOrder));

        const parentItems = rootItems.filter((i) => !i.parentId);
        const childItems = rootItems.filter((i) => i.parentId !== null);

        // Fetch promo card for this menu
        const [promo] = await db
          .select()
          .from(navigationPromotions)
          .where(and(eq(navigationPromotions.menuId, menu.id), eq(navigationPromotions.isActive, true)))
          .limit(1);

        const groups: NavigationGroup[] = [];

        // Group 1: Left-hand Categories / Styles
        if (parentItems.length > 0) {
          groups.push({
            title: 'CATEGORIES & STYLES',
            items: parentItems.map((p) => ({
              label: p.label,
              href: p.url || '#',
              columnNumber: p.columnNumber || undefined,
            })),
          });
        }

        // Group 2: Column 1 Subcategory Links
        const col1Children = childItems.filter((c) => c.columnNumber === 1);
        if (col1Children.length > 0) {
          groups.push({
            title: 'POPULAR CATEGORIES',
            items: col1Children.map((c) => ({
              label: c.label,
              href: c.url || '#',
              columnNumber: 1,
            })),
          });
        }

        // Group 3: Column 2 Subcategory Links
        const col2Children = childItems.filter((c) => c.columnNumber === 2);
        if (col2Children.length > 0) {
          groups.push({
            title: 'MORE STYLES',
            items: col2Children.map((c) => ({
              label: c.label,
              href: c.url || '#',
              columnNumber: 2,
            })),
          });
        }

        let sectionLabel = 'MEN';
        if (menu.slug.includes('women')) sectionLabel = 'WOMEN';
        if (menu.slug.includes('kids')) sectionLabel = 'KIDS';

        sections.push({
          label: sectionLabel,
          href: `/${sectionLabel.toLowerCase()}`,
          groups: groups.length > 0 ? groups : undefined,
          featured: promo
            ? {
                title: promo.title,
                description: promo.description || '',
                imageUrl: promo.imageUrl || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
                href: promo.targetUrl || '/collections/streetwear',
                actionLabel: promo.actionLabel || 'SHOP THE EDIT',
              }
            : undefined,
        });
      }

      // Add default SHOP ALL section
      sections.push({
        label: 'SHOP ALL',
        href: '/products',
      });

      return sections;
    } catch (err) {
      console.warn('NavigationService DB fetch error, using static fallback:', err);
      return navigationConfig;
    }
  }
}

export const navigationService = new NavigationService();
