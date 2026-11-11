import * as React from 'react';
import { searchService } from '@/core/search/search.service';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/commerce/product-card';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { EmptyState } from '@/components/feedback/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * Dedicated storefront Search Results Page.
 * Renders products matching search query parameter "q".
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 12;

  const data = await searchService.searchProducts(q, page, limit);
  const totalPages = Math.ceil(data.total / limit);

  const breadcrumbs = [
    { label: 'Shop All', href: '/products' },
    { label: `Search: "${q}"`, href: `/search?q=${encodeURIComponent(q)}` },
  ];

  return (
    <Container className="py-8">
      <Stack gap="6">
        <Breadcrumb items={breadcrumbs} />

        <div className="flex flex-col gap-2">
          <Heading level={1} className="text-3xl font-extrabold text-slate-100 tracking-tight">
            Search Results
          </Heading>
          <Text className="text-sm text-slate-400">
            {data.total > 0
              ? `Found ${data.total} products matching "${data.q}"`
              : `No products matching "${data.q}"`}
          </Text>
        </div>

        {data.items.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No Results Found"
            description="Try checking for spelling errors or adjusting your query terms."
            actionLabel="Browse All Products"
            actionHref="/products"
          />
        ) : (
          <>
            <ProductGrid cols="1" colsSm="2" colsMd="3" colsLg="4" gap="6">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
                    <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-xs text-slate-400 font-semibold mx-2">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
                    <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
