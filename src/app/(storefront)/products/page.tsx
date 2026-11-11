import * as React from 'react';
import { parseProductFilters } from '@/core/storefront/filters';
import { getCachedProducts, getCachedFilterFacets } from '@/core/performance/cache';
import { ProductMapper } from '@/core/product/product.mapper';
import { ProductsCatalogView } from './products-catalog-view';
import { Container } from '@/components/layout/container';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { getBreadcrumbsSchema } from '@/core/seo/jsonld';
import { Sparkles } from 'lucide-react';

export interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * Server-rendered Product Listing Page (PLP) catalog browser.
 * Features luxury editorial typography, mobile-first responsive drawers,
 * and high-performance server-cached database facets.
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
  if (filters.edition) {
    breadcrumbs.push({ label: `${filters.edition}`, href: `/products?edition=${filters.edition}` });
  }
  if (filters.festival) {
    breadcrumbs.push({ label: `${filters.festival}`, href: `/products?festival=${filters.festival}` });
  }

  const breadcrumbJsonLd = getBreadcrumbsSchema(breadcrumbs);

  // Dynamic catalog hero title & description
  const heroTitle = filters.category
    ? filters.category.toUpperCase()
    : filters.gender
    ? `${filters.gender.toUpperCase()} COLLECTION`
    : filters.collection
    ? `${filters.collection.toUpperCase()} CAPSULE`
    : 'ALL COLLECTIONS';

  const heroDescription = filters.category
    ? `Explore our signature ${filters.category} range crafted with luxury fabrications and contemporary tailoring.`
    : filters.gender
    ? `Curated ${filters.gender} sartorial essentials, oversized silhouettes, and refined accessories.`
    : 'Contemporary luxury silhouettes, premium materials, and precision tailoring for the modern wardrobe.';

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Dynamic SEO breadcrumbs list schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Catalog Hero Banner */}
      <div className="w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
        <Container className="py-6 sm:py-10">
          <div className="flex flex-col gap-2">
            <Breadcrumb items={breadcrumbs} />

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-slate-950 text-white dark:bg-white dark:text-slate-950 uppercase tracking-widest flex items-center gap-1.5 shadow-2xs">
                    <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400" /> LEXIDO ATELIER
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-950 dark:text-white uppercase font-heading leading-tight">
                  {heroTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                  {heroDescription}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Catalog View Container */}
      <Container className="py-6 sm:py-8">
        <ProductsCatalogView
          products={mappedProducts}
          facets={facets}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          filters={filters}
        />
      </Container>
    </div>
  );
}
