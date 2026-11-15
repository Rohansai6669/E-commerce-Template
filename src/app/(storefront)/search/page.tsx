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

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase font-mono">
            LEXIDO • SEARCH
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tighter uppercase text-neutral-950 dark:text-white leading-[0.9] mt-1 mb-2">
            Search Results
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-mono tracking-wide uppercase">
            {data.total > 0
              ? `Found ${data.total} ${data.total === 1 ? 'product' : 'products'} matching "${data.q}"`
              : `No products matching "${data.q}"`}
          </p>
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
            <ProductGrid cols="2" colsSm="2" colsMd="3" colsLg="4" className="xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full gap-3 sm:gap-6 pt-2">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 select-none">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer h-10 px-5 rounded-none border-neutral-300 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 font-mono">
                  Page <span className="text-neutral-950 dark:text-white font-extrabold">{page}</span> of{' '}
                  <span className="text-neutral-950 dark:text-white font-extrabold">{totalPages}</span>
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer h-10 px-5 rounded-none border-neutral-300 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900">
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
