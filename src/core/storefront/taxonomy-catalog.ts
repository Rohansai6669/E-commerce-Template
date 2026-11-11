import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { collections } from '@/lib/db/schema/catalog/collections';
import { audiences } from '@/lib/db/schema/catalog/audiences';
import { products } from '@/lib/db/schema/catalog/products';
import { collectionProducts } from '@/lib/db/schema/catalog/collections';
import { productAudiences } from '@/lib/db/schema/catalog/audiences';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productImages } from '@/lib/db/schema/catalog/images';
import { eq, and, or, sql, desc, asc } from 'drizzle-orm';
import { type ProductData } from '@/components/commerce/configurable-product-card';

export interface TaxonomyPageMeta {
  title: string;
  subtitle?: string;
  type: 'category' | 'collection' | 'audience';
  breadcrumb: string;
  description: string;
  subtags: string[];
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}

/**
 * Fetches all active collections with live product counts for the /collections index page.
 */
export async function fetchCollectionsList(): Promise<CollectionSummary[]> {
  try {
    const rows = await db
      .select({
        id: collections.id,
        name: collections.name,
        slug: collections.slug,
        description: collections.description,
        imageUrl: collections.imageUrl,
        productCount: sql<number>`cast(count(distinct ${products.id}) as integer)`,
      })
      .from(collections)
      .leftJoin(
        collectionProducts,
        eq(collectionProducts.collectionId, collections.id)
      )
      .leftJoin(
        products,
        and(
          eq(products.id, collectionProducts.productId),
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active')
        )
      )
      .where(and(sql`${collections.deletedAt} IS NULL`, eq(collections.isActive, true)))
      .groupBy(collections.id, collections.name, collections.slug, collections.description, collections.imageUrl)
      .orderBy(desc(sql`count(distinct ${products.id})`), asc(collections.name));

    return rows;
  } catch (err) {
    console.error('fetchCollectionsList query error:', err);
    return [];
  }
}

/**
 * Fetches products for a specific collection slug from the database.
 * Never falls back to mock items.
 */
export async function fetchCollectionProducts(
  collectionSlug: string,
  sort: string = 'newest'
): Promise<{ items: ProductData[]; meta: TaxonomyPageMeta }> {
  const slugLower = collectionSlug.toLowerCase();
  const formattedTitle = slugLower.replace(/-/g, ' ').toUpperCase();

  let meta: TaxonomyPageMeta = {
    title: `${formattedTitle} COLLECTION`,
    type: 'collection',
    breadcrumb: `LEXIDO · EDITORIAL · ${formattedTitle}`,
    description: `Curated ${formattedTitle} collection — elevated luxury streetwear and activewear.`,
    subtags: ['All'],
  };

  try {
    if (db) {
      const [matchedCollection] = await db
        .select()
        .from(collections)
        .where(eq(collections.slug, slugLower))
        .limit(1);

      if (matchedCollection) {
        meta.title = matchedCollection.name.toUpperCase();
        if (matchedCollection.description) {
          meta.description = matchedCollection.description;
        }
      }

      let orderByClause = desc(products.createdAt);
      if (sort === 'price-low') orderByClause = asc(products.price);
      if (sort === 'price-high') orderByClause = desc(products.price);

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
        .where(
          and(
            sql`${products.deletedAt} IS NULL`,
            eq(products.status, 'active'),
            or(
              eq(products.collection, slugLower),
              matchedCollection
                ? sql`exists (
                    select 1 from ${collectionProducts}
                    where ${collectionProducts.productId} = ${products.id} and ${collectionProducts.collectionId} = ${matchedCollection.id}
                  )`
                : sql`false`
            )
          )
        )
        .orderBy(orderByClause)
        .limit(48);

      const items: ProductData[] = dbProducts.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        slug: p.product.slug,
        price: Number(p.product.price),
        compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
        category: p.category?.name || meta.title,
        rating: 5.0,
        reviewCount: 0,
        images: p.primaryImage
          ? [p.primaryImage]
          : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'],
        badges: ['COLLECTION'],
        inStock: true,
      }));

      // Extract distinct category names as real subtags
      const categoryTags = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
      if (categoryTags.length > 0) {
        meta.subtags = ['All', ...categoryTags];
      }

      return { items, meta };
    }
  } catch (err) {
    console.error('fetchCollectionProducts DB error:', err);
  }

  return { items: [], meta };
}

/**
 * Fetches products for a specific audience (e.g. men, women, kids) from the database.
 * Never falls back to mock items.
 */
export async function fetchAudienceProducts(
  audienceSlug: string,
  sort: string = 'newest'
): Promise<{ items: ProductData[]; meta: TaxonomyPageMeta }> {
  const slugLower = audienceSlug.toLowerCase();
  const formattedTitle = slugLower.toUpperCase();

  let meta: TaxonomyPageMeta = {
    title: `${formattedTitle}'S CATALOGUE`,
    type: 'audience',
    breadcrumb: `LEXIDO · AUDIENCE · ${formattedTitle}`,
    description: `Browse tailored ${formattedTitle} apparel, engineered cuts, and seasonal drops.`,
    subtags: ['All'],
  };

  try {
    if (db) {
      const [matchedAudience] = await db
        .select()
        .from(audiences)
        .where(eq(audiences.slug, slugLower))
        .limit(1);

      if (matchedAudience) {
        meta.title = matchedAudience.name.toUpperCase();
      }

      let orderByClause = desc(products.createdAt);
      if (sort === 'price-low') orderByClause = asc(products.price);
      if (sort === 'price-high') orderByClause = desc(products.price);

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
        .where(
          and(
            sql`${products.deletedAt} IS NULL`,
            eq(products.status, 'active'),
            or(
              eq(products.gender, slugLower),
              matchedAudience
                ? sql`exists (
                    select 1 from ${productAudiences}
                    where ${productAudiences.productId} = ${products.id} and ${productAudiences.audienceId} = ${matchedAudience.id}
                  )`
                : sql`false`
            )
          )
        )
        .orderBy(orderByClause)
        .limit(48);

      const items: ProductData[] = dbProducts.map((p) => ({
        id: p.product.id,
        name: p.product.name,
        slug: p.product.slug,
        price: Number(p.product.price),
        compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
        category: p.category?.name || meta.title,
        rating: 5.0,
        reviewCount: 0,
        images: p.primaryImage
          ? [p.primaryImage]
          : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'],
        badges: [],
        inStock: true,
      }));

      // Extract distinct category names as real subtags
      const categoryTags = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
      if (categoryTags.length > 0) {
        meta.subtags = ['All', ...categoryTags];
      }

      return { items, meta };
    }
  } catch (err) {
    console.error('fetchAudienceProducts DB error:', err);
  }

  return { items: [], meta };
}
