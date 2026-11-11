import * as React from 'react';
import { parseProductFilters, serializeProductFilters } from '@/core/storefront/filters';
import { getCachedProducts, getCachedFilterFacets } from '@/core/performance/cache';
import { ProductMapper } from '@/core/product/product.mapper';
import { FilterSidebar } from './filter-sidebar';
import { SortToolbar } from './sort-toolbar';
import { ActiveFilters } from './active-filters';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ConfigurableProductCard } from '@/components/commerce/configurable-product-card';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { EmptyState } from '@/components/feedback/empty-state';
import { Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { getBreadcrumbsSchema } from '@/core/seo/jsonld';
import Link from 'next/link';

export interface ProductsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * Server-rendered Product Listing Page (PLP) catalog browser.
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

  const breadcrumbs = [{ label: 'Shop All', href: '/products' }];
  if (filters.gender) {
    breadcrumbs.push({ label: `Audience: ${filters.gender.toUpperCase()}`, href: `/products?gender=${filters.gender}` });
  }
  if (filters.collection) {
    breadcrumbs.push({ label: `Collection: ${filters.collection.toUpperCase()}`, href: `/products?collection=${filters.collection}` });
  }
  if (filters.category) {
    breadcrumbs.push({ label: filters.category, href: `/products?category=${filters.category}` });
  }
  if (filters.edition) {
    breadcrumbs.push({ label: `Edition: ${filters.edition}`, href: `/products?edition=${filters.edition}` });
  }
  if (filters.festival) {
    breadcrumbs.push({ label: `Festival: ${filters.festival}`, href: `/products?festival=${filters.festival}` });
  }

  const breadcrumbJsonLd = getBreadcrumbsSchema(breadcrumbs);

  return (
    <Container className="py-8">
      {/* Dynamic SEO breadcrumbs list schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Stack gap="6">
        <Breadcrumb items={breadcrumbs} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <FilterSidebar facets={facets} />

          <div className="flex-1 flex flex-col gap-5 w-full">
            <SortToolbar total={total} count={mappedProducts.length} />
            <ActiveFilters />

            {mappedProducts.length === 0 ? (
              <EmptyState
                icon="Inbox"
                title="No Products Found"
                description="We couldn't find any products matching your active filters. Try resetting your search constraints."
                actionLabel="Reset All Filters"
                actionHref="/products"
              />
            ) : (
              <>
                <ProductGrid cols="1" colsSm="2" colsMd="3" colsLg="3" gap="6">
                  {mappedProducts.map((product) => (
                    <ConfigurableProductCard key={product.id} product={product} />
                  ))}
                </ProductGrid>

                {/* Pagination Stepper controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    {page > 1 && (
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <Link
                          href={`/products?${new URLSearchParams(
                            serializeProductFilters({ ...filters, page: page - 1 })
                          ).toString()}`}
                        >
                          Previous
                        </Link>
                      </Button>
                    )}

                    <Text className="text-xs text-muted-foreground font-semibold px-4 select-none">
                      Page {page} of {totalPages}
                    </Text>

                    {page < totalPages && (
                      <Button variant="outline" size="sm" asChild className="cursor-pointer">
                        <Link
                          href={`/products?${new URLSearchParams(
                            serializeProductFilters({ ...filters, page: page + 1 })
                          ).toString()}`}
                        >
                          Next
                        </Link>
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </Stack>
    </Container>
  );
}
