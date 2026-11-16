import * as React from 'react';
import { parseProductFilters } from '@/core/storefront/filters';
import { getCachedProducts, getCachedFilterFacets } from '@/core/performance/cache';
import { ProductMapper } from '@/core/product/product.mapper';
import { ProductsCatalogView } from './products-catalog-view';
import { Container } from '@/components/layout/container';
import { getBreadcrumbsSchema } from '@/core/seo/jsonld';

export interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * Server-rendered Product Listing Page (PLP) catalog browser.
 * Features luxury editorial typography matching Lexido Atelier design language.
 */
export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const filters = parseProductFilters(resolvedSearchParams);

  // Load catalog queries and dynamic database facet counts in parallel
  const [productsData, facets] = await Promise.all([
    getCachedProducts(filters),
    getCachedFilterFacets(),
  ]);

  const mappedProducts = productsData.items.map((row) => {
    const model = ProductMapper.toProductCardModel(row);
    return {
      id: model.id,
      name: model.name,
      slug: model.slug,
      price: typeof model.price === 'string' ? parseFloat(model.price) : model.price,
      compareAtPrice: model.compareAtPrice ? (typeof model.compareAtPrice === 'string' ? parseFloat(model.compareAtPrice) : model.compareAtPrice) : undefined,
      category: model.categoryName ?? undefined,
      rating: model.rating ?? undefined,
      reviewCount: model.reviewsCount,
      images: model.imageUrl ? [model.imageUrl] : [],
      badges: model.isNew ? ['NEW'] : [],
      inStock: model.quantity > 0,
      attributes: model.attributes || [],
    };
  });

  const total = productsData.total;
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const totalPages = Math.ceil(total / limit);

  // Dynamic breadcrumbs
  const breadcrumbs = [{ label: 'Shop All', href: '/products' }];
  if (filters.gender) {
    breadcrumbs.push({ label: `${filters.gender.toUpperCase()}`, href: `/products?gender=${filters.gender}` });
  }
  if (filters.collection) {
    breadcrumbs.push({ label: `${filters.collection.toUpperCase()}`, href: `/products?collection=${filters.collection}` });
  }
  if (filters.category) {
    breadcrumbs.push({ label: filters.category.toUpperCase(), href: `/products?category=${filters.category}` });
  }

  const breadcrumbJsonLd = getBreadcrumbsSchema(breadcrumbs);

  // Dynamic catalog hero title & description
  const heroEyebrow = 'LEXIDO • EDITORIAL';

  const rawTitle = filters.category || filters.gender || filters.collection || 'ALL COLLECTIONS';
  const heroTitle = rawTitle.toUpperCase();

  const heroDescription =
    filters.category?.toLowerCase() === 'men' || filters.gender?.toLowerCase() === 'men'
      ? 'Minimalist luxury menswear. Clean silhouettes, premium textiles, crafted in India.'
      : filters.category?.toLowerCase() === 'women' || filters.gender?.toLowerCase() === 'women'
      ? 'Minimalist luxury womenswear. Clean silhouettes, premium textiles, crafted in India.'
      : filters.category
      ? `Explore our signature ${filters.category} range crafted with luxury fabrications and contemporary tailoring.`
      : filters.collection
      ? `Curated ${filters.collection} capsule with precision tailoring and timeless craftsmanship.`
      : 'Minimalist luxury apparel. Clean silhouettes, premium textiles, crafted in India.';

  return (
    <div className="w-full bg-background min-h-screen font-sans select-none">
      {/* Dynamic SEO breadcrumbs list schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Main Luxury Catalog Container */}
      <Container className="pt-8 sm:pt-14 pb-16 max-w-[1600px] mx-auto">
        {/* Top Eyebrow, Title & Subtitle - Exact match to Lexido Editorial */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase font-mono">
            {heroEyebrow}
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-heading tracking-tighter uppercase text-neutral-950 dark:text-white leading-[0.9] mt-1 mb-2">
            {heroTitle}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-2xl">
            {heroDescription}
          </p>
        </div>

        {/* Catalog Body: Tabs, Sort, Count & Products/Empty State */}
        <div className="mt-8 sm:mt-10">
          <ProductsCatalogView
            products={mappedProducts}
            facets={facets}
            total={total}
            page={page}
            limit={limit}
            totalPages={totalPages}
            filters={filters}
          />
        </div>
      </Container>
    </div>
  );
}
