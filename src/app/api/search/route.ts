import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/db/schema/catalog/products';
import { categories } from '@/lib/db/schema/catalog/categories';
import { productImages } from '@/lib/db/schema/catalog/images';
import { eq, or, ilike, and, sql } from 'drizzle-orm';

export interface SearchProductResult {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice: string | null;
  categoryName: string | null;
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
    // 1. Fetch top matching products (lightweight, limit 6 for fast <20ms query)
    const productResults = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        categoryName: categories.name,
        image: sql<string | null>`(
          SELECT url FROM ${productImages}
          WHERE ${productImages.productId} = ${products.id}
          ORDER BY ${productImages.isPrimary} DESC, ${productImages.sortOrder} ASC
          LIMIT 1
        )`,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          sql`${products.deletedAt} IS NULL`,
          eq(products.status, 'active'),
          or(
            ilike(products.name, pattern),
            ilike(products.description, pattern),
            ilike(products.slug, pattern)
          )
        )
      )
      .limit(6);

    // 2. Fetch top matching categories (limit 3)
    const categoryResults = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
      })
      .from(categories)
      .where(or(ilike(categories.name, pattern), ilike(categories.slug, pattern)))
      .limit(3);

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

