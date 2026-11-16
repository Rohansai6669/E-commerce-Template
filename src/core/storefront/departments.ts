import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { audiences, productAudiences } from '@/lib/db/schema/catalog/audiences';
import { productImages } from '@/lib/db/schema/catalog/images';
import { eq, and, or, sql, desc, asc, inArray } from 'drizzle-orm';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { type CategoryPageMeta } from './category-catalog';

export interface DepartmentConfig {
  slug: string;
  label: string;
  title: string;
  subtitle: string;
  description: string;
  breadcrumb: string;
  heroImage?: string;
  genderMatch: string[];
  metaTitle: string;
  metaDescription: string;
}

/**
 * Centralized, easily configurable department registry.
 * Add or modify top-level department routes (/men, /women, /kids, etc.) here.
 */
export const DEPARTMENTS: Record<string, DepartmentConfig> = {
  men: {
    slug: 'men',
    label: 'MEN',
    title: "MEN'S COLLECTION",
    subtitle: 'Tailored silhouettes, contemporary streetwear & engineered textiles',
    description: 'Explore the full Lexido Men collection — elevated tailoring, clean silhouettes, organic cotton essentials, and seasonal drops.',
    breadcrumb: 'LEXIDO · EDITORIAL · MEN',
    heroImage: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=1200&auto=format&fit=crop',
    genderMatch: ['men', 'male', 'unisex'],
    metaTitle: "Men's Collection | Minimalist Luxury Apparel | Lexido",
    metaDescription: "Shop elevated Men's apparel, contemporary streetwear, luxury outerwear, and organic essentials crafted in India.",
  },
  women: {
    slug: 'women',
    label: 'WOMEN',
    title: "WOMEN'S COLLECTION",
    subtitle: 'Refined tailoring, effortless drapes & modern luxury essentials',
    description: 'Explore the full Lexido Women collection — contemporary shapes, quiet luxury knitwear, premium textiles, and timeless silhouettes.',
    breadcrumb: 'LEXIDO · EDITORIAL · WOMEN',
    heroImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200&auto=format&fit=crop',
    genderMatch: ['women', 'female', 'unisex'],
    metaTitle: "Women's Collection | Minimalist Luxury Apparel | Lexido",
    metaDescription: "Discover refined Women's fashion, effortless dresses, luxury tailoring, and seasonal capsule drops.",
  },
  kids: {
    slug: 'kids',
    label: 'KIDS',
    title: "KIDS' COLLECTION",
    subtitle: 'Premium organic cottons, soft textures & durable play-ready essentials',
    description: 'Explore the Lexido Kids collection — thoughtful cuts, durable organic fabrics, and hypoallergenic textiles crafted for movement.',
    breadcrumb: 'LEXIDO · EDITORIAL · KIDS',
    genderMatch: ['kids', 'unisex'],
    metaTitle: "Kids' Collection | Organic Apparel & Essentials | Lexido",
    metaDescription: "Premium organic cotton clothing and comfort-engineered apparel for children.",
  },
  unisex: {
    slug: 'unisex',
    label: 'UNISEX',
    title: 'GENDERLESS ATELIER',
    subtitle: 'Universal silhouettes, relaxed proportions & inclusive tailoring',
    description: 'Timeless oversized fits, minimalist hoodies, relaxed denim, and unisex statement pieces designed for all bodies.',
    breadcrumb: 'LEXIDO · EDITORIAL · UNISEX',
    genderMatch: ['unisex'],
    metaTitle: 'Unisex Collection | Genderless Luxury Essentials | Lexido',
    metaDescription: 'Shop versatile unisex apparel, oversized silhouettes, and minimalist streetwear.',
  },
};

/**
 * Returns configuration for a department slug, with fallback for custom audience slugs.
 */
export function getDepartmentConfig(slug: string): DepartmentConfig {
  const normalized = slug.trim().toLowerCase();
  if (DEPARTMENTS[normalized]) {
    return DEPARTMENTS[normalized];
  }

  const formatted = normalized.toUpperCase();
  return {
    slug: normalized,
    label: formatted,
    title: `${formatted} COLLECTION`,
    subtitle: `Curated ${formatted} apparel and seasonal essentials`,
    description: `Discover contemporary ${formatted} pieces crafted with luxury textiles and clean silhouettes.`,
    breadcrumb: `LEXIDO · EDITORIAL · ${formatted}`,
    genderMatch: [normalized, 'unisex'],
    metaTitle: `${formatted} Collection | Lexido`,
    metaDescription: `Shop the curated ${formatted} catalog on Lexido.`,
  };
}

/**
 * Authoritative server query fetching products matching department criteria with live filters.
 */
export async function fetchDepartmentProducts(
  departmentSlug: string,
  sort: string = 'newest'
): Promise<{ items: ProductData[]; meta: CategoryPageMeta }> {
  const config = getDepartmentConfig(departmentSlug);

  const meta: CategoryPageMeta & {
    breadcrumbs?: Array<{ label: string; href?: string }>;
    heroImage?: string | null;
    subtitle?: string;
  } = {
    title: config.title,
    breadcrumb: config.breadcrumb,
    description: config.description,
    subtitle: config.subtitle,
    heroImage: config.heroImage || null,
    breadcrumbs: [
      { label: 'Shop All', href: '/products' },
      { label: config.label },
    ],
    subtags: ['All'],
  };

  try {
    if (db) {
      // Find matching audience record in DB if present
      const [matchedAudience] = await db
        .select()
        .from(audiences)
        .where(eq(audiences.slug, config.slug))
        .limit(1);

      let orderByClause = desc(products.createdAt);
      if (sort === 'price-low') orderByClause = asc(products.price);
      if (sort === 'price-high') orderByClause = desc(products.price);

      // Build audience / gender matching criteria
      const genderConditions = config.genderMatch.map((g) => eq(sql`lower(${products.gender})`, g));

      const audienceMatchClause = matchedAudience
        ? sql`exists (
            select 1 from ${productAudiences}
            where ${productAudiences.productId} = ${products.id} and ${productAudiences.audienceId} = ${matchedAudience.id}
          )`
        : sql`false`;

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
            or(...genderConditions, audienceMatchClause)
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
        category: p.category?.name || config.label,
        rating: 5.0,
        reviewCount: 0,
        images: p.primaryImage
          ? [p.primaryImage]
          : [config.heroImage || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'],
        badges: [],
        inStock: true,
      }));

      // Extract distinct category names as interactive filter subtags with stacked URLs
      const categoryTags = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
      if (categoryTags.length > 0) {
        meta.subtags = [
          { label: `All ${config.label}`, href: `/${config.slug}` },
          ...categoryTags.map((cat) => ({
            label: cat,
            href: `/${config.slug}/${cat.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            slug: cat.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          })),
        ] as any;
      }

      return { items, meta };
    }
  } catch (err) {
    console.error(`fetchDepartmentProducts error for ${departmentSlug}:`, err);
  }

  return { items: [], meta };
}

