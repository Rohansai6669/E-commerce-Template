import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productImages } from '@/lib/db/schema/catalog/images';
import { eq, and, or, sql, desc, asc } from 'drizzle-orm';
import { type ProductData } from '@/components/commerce/configurable-product-card';

export interface CategoryPageMeta {
  title: string;
  breadcrumb: string;
  description: string;
  subtags: string[];
}

/**
 * Fetches products for a category or subcategory directly from PostgreSQL.
 * Never falls back to mock items.
 */
export async function fetchCategoryProducts(
  categorySlug: string,
  subcategorySlug?: string,
  sort: string = 'newest'
): Promise<{ items: ProductData[]; meta: CategoryPageMeta }> {
  const catKey = categorySlug.toLowerCase();
  const subKey = subcategorySlug ? subcategorySlug.toLowerCase() : undefined;

  let pageTitle = subKey
    ? subKey.replace(/-/g, ' ').toUpperCase()
    : `${catKey.toUpperCase()} COLLECTION`;
  let breadcrumb = subKey
    ? `${catKey.toUpperCase()} · COLLECTION`
    : `LEXIDO · EDITORIAL`;
  let pageDesc = `Explore our premium ${catKey} ${subKey || ''} collection — engineered silhouettes, atelier finish.`;
  let subtags: string[] = ['All'];

  try {
    if (db) {
      // 1. Fetch category definition from DB
      const targetSlug = subKey || catKey;
      const dbCategories = await db
        .select()
        .from(categories)
        .where(eq(categories.slug, targetSlug))
        .limit(1);

      let targetCatId: string | undefined;

      if (dbCategories.length > 0) {
        const catRecord = dbCategories[0];
        targetCatId = catRecord.id;
        if (catRecord.name) {
          pageTitle = catRecord.name.toUpperCase();
        }
        if (catRecord.description) {
          pageDesc = catRecord.description;
        }

        // Fetch real child categories for subcategory pills
        const childCats = await db
          .select({ name: categories.name, slug: categories.slug })
          .from(categories)
          .where(
            and(
              eq(categories.parentId, catRecord.id),
              sql`${categories.deletedAt} IS NULL`,
              eq(categories.isActive, true)
            )
          )
          .orderBy(asc(categories.name));

        if (childCats.length > 0) {
          subtags = ['All', ...childCats.map((c) => c.name)];
        }
      }

      // 2. Query products from DB matching category/subcategory
      const conditions = [
        sql`${products.deletedAt} IS NULL`,
        eq(products.status, 'active'),
      ];

      // Add gender filter if matching audience slug
      if (['men', 'women', 'kids'].includes(catKey)) {
        conditions.push(eq(products.gender, catKey));
      }

      // Add category filter if category was found
      if (targetCatId) {
        const catCondition = or(
          eq(products.categoryId, targetCatId),
          sql`exists (
            select 1 from ${productCategories}
            where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${targetCatId}
          )`
        );
        if (catCondition) {
          conditions.push(catCondition);
        }
      }

      let orderByClause = desc(products.createdAt);
      if (sort === 'price-low') {
        orderByClause = asc(products.price);
      } else if (sort === 'price-high') {
        orderByClause = desc(products.price);
      }

      const dbProducts = await db
        .select({
          product: products,
          category: categories,
          brand: brands,
          primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
        })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .leftJoin(brands, eq(products.brandId, brands.id))
        .where(and(...conditions))
        .orderBy(orderByClause)
        .limit(48);

      const mappedItems: ProductData[] = dbProducts.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        slug: p.product.slug,
        price: Number(p.product.price),
        compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
        category: p.category?.name || pageTitle,
        rating: 5.0,
        reviewCount: 0,
        images: p.primaryImage
          ? [p.primaryImage]
          : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'],
        badges: [],
        inStock: true,
      }));

      // If subtags didn't get child categories, dynamically pull from product category names
      if (subtags.length <= 1 && mappedItems.length > 0) {
        const itemCategories = Array.from(
          new Set(mappedItems.map((i) => i.category).filter(Boolean))
        ) as string[];
        if (itemCategories.length > 0) {
          subtags = ['All', ...itemCategories];
        }
      }

      return {
        items: mappedItems,
        meta: { title: pageTitle, breadcrumb, description: pageDesc, subtags },
      };
    }
  } catch (dbErr) {
    console.error('fetchCategoryProducts DB query error:', dbErr);
  }

  return {
    items: [],
    meta: {
      title: pageTitle,
      breadcrumb,
      description: pageDesc,
      subtags,
    },
  };
}
