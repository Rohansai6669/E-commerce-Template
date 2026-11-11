import { db } from '@/lib/db';
import { categories, type Category } from '@/lib/db/schema/catalog/categories';
import { productRepository } from '../product/product.repository';
import { ProductMapper } from '../product/product.mapper';
import { type ProductCardModel } from '../product/product.types';
import { eq, and, sql } from 'drizzle-orm';

export interface CategoryCatalog {
  category: Category;
  items: ProductCardModel[];
  total: number;
  breadcrumbs: Array<{ label: string; href: string }>;
}

/**
 * CategoryService orchestrates metadata, breadcrumbs and paginated catalog products
 * for category-specific storefront catalog routes.
 */
export class CategoryService {
  /**
   * Fetches active category details by its unique slug identifier.
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.slug, slug),
          eq(categories.isActive, true),
          sql`${categories.deletedAt} IS NULL`
        )
      )
      .limit(1);
    return row ?? null;
  }

  /**
   * Resolves products catalog and page breadcrumbs for a category landing page.
   */
  async getCategoryCatalog(slug: string, page = 1, limit = 12): Promise<CategoryCatalog | null> {
    const category = await this.getCategoryBySlug(slug);
    if (!category) return null;

    const data = await productRepository.getProducts({
      category: slug,
      limit,
      page,
    });

    const items = data.items.map((row) => ProductMapper.toProductCardModel(row));

    const breadcrumbs = [
      { label: 'Shop All', href: '/products' },
      { label: category.name, href: `/category/${category.slug}` },
    ];

    return {
      category,
      items,
      total: data.total,
      breadcrumbs,
    };
  }

  /**
   * Retrieves all active storefront category taxonomies.
   */
  async getActiveCategories(): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.isActive, true),
          sql`${categories.deletedAt} IS NULL`
        )
      );
  }
}

export const categoryService = new CategoryService();
export default categoryService;
