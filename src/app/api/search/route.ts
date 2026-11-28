import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productImages } from '@/lib/db/schema/catalog/images';
import {
  productAttributes,
  productAttributeValues,
  globalAttributes,
  globalAttributeValues,
  productVariants,
  variantAttributeValues,
} from '@/lib/db/schema/catalog/variants';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { audiences, productAudiences } from '@/lib/db/schema/catalog/audiences';
import { eq, or, ilike, and, sql } from 'drizzle-orm';

export interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  categoryName: string | null;
  brandName?: string | null;
  image: string | null;
}

export interface SearchCategoryResult {
  id: string;
  name: string;
  slug: string;
}

export interface QuickSearchResponse {
  products: SearchProductResult[];
  categories: SearchCategoryResult[];
  total: number;
  q: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  if (!q || q.length < 2) {
    return NextResponse.json(
      { products: [], categories: [], total: 0, q: '' },
      { headers: { 'Cache-Control': 'public, s-maxage=300' } }
    );
  }

  const pattern = `%${q}%`;

  try {
    // 1. Fetch top matching products across name, description, material, fit, pattern, occasion, season, tags, attributes, categories, and brands
    const productResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        categoryName: categories.name,
        brandName: brands.name,
        image: sql<string | null>`(
          SELECT url FROM ${productImages}
          WHERE ${productImages.productId} = ${products.id}
          ORDER BY ${productImages.isPrimary} DESC, ${productImages.sortOrder} ASC
          LIMIT 1
        )`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(brands, eq(products.brandId, brands.id))
      .where(
        and(
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active'),
          or(
            ilike(products.name, pattern),
            ilike(products.description, pattern),
            ilike(products.slug, pattern),
            ilike(products.sku, pattern),
            ilike(products.material, pattern),
            ilike(products.fit, pattern),
            ilike(products.pattern, pattern),
            ilike(products.occasion, pattern),
            ilike(products.season, pattern),
            ilike(products.collection, pattern),
            ilike(products.gender, pattern),
            ilike(categories.name, pattern),
            ilike(categories.slug, pattern),
            ilike(brands.name, pattern),
            ilike(brands.slug, pattern),
            sql`cast(${products.metadata} as text) ILIKE ${pattern}`,
            sql`exists (
              select 1 from ${productCategories}
              inner join ${categories} as sub_cat on sub_cat.id = ${productCategories.categoryId}
              where ${productCategories.productId} = ${products.id} and (
                sub_cat.name ILIKE ${pattern} or sub_cat.slug ILIKE ${pattern}
              )
            )`,
            sql`exists (
              select 1 from ${productAttributeValues} pav
              join ${globalAttributeValues} gav on gav.id = pav.attribute_value_id
              join ${productAttributes} pa on pa.id = pav.product_attribute_id
              left join ${globalAttributes} ga on ga.id = gav.attribute_id
              where pa.product_id = ${products.id} and (
                gav.value ILIKE ${pattern} or ga.name ILIKE ${pattern}
              )
            )`,
            sql`exists (
              select 1 from ${variantAttributeValues} vav
              join ${globalAttributeValues} gav on gav.id = vav.attribute_value_id
              join ${productVariants} pv on pv.id = vav.variant_id
              left join ${globalAttributes} ga on ga.id = gav.attribute_id
              where pv.product_id = ${products.id} and (
                gav.value ILIKE ${pattern} or ga.name ILIKE ${pattern}
              )
            )`,
            sql`exists (
              select 1 from ${productAudiences}
              inner join ${audiences} on ${audiences.id} = ${productAudiences.audienceId}
              where ${productAudiences.productId} = ${products.id} and (
                ${audiences.name} ILIKE ${pattern} or ${audiences.slug} ILIKE ${pattern}
              )
            )`
          )
        )
      )
      .limit(6);

    // 2. Fetch top matching categories (limit 4)
    const categoryResults = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(
        and(
          sql`${categories.deletedAt} IS NULL`,
          eq(categories.isActive, true),
          or(ilike(categories.name, pattern), ilike(categories.slug, pattern))
        )
      )
      .limit(4);

    return NextResponse.json(
      {
        products: productResults,
        categories: categoryResults,
        total: productResults.length,
        q,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('[Search API Error]:', error);
    return NextResponse.json(
      { products: [], categories: [], total: 0, q, error: 'Search failed' },
      { status: 500 }
    );
  }
}
