import * as React from 'react';
import { notFound } from 'next/navigation';
import { categoryService } from '@/core/category/category.service';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/commerce/product-card';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { EmptyState } from '@/components/feedback/empty-state';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

/**
 * Dynamic Storefront Category Catalog Browser.
 * Lists products assigned to category slug taxonomy.
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const limit = 12;

  const catalog = await categoryService.getCategoryCatalog(resolvedParams.slug, page, limit);
  if (!catalog) {
    notFound();
  }

  const totalPages = Math.ceil(catalog.total / limit);

  return (
    <Container className="py-8">
      <Stack gap="6">
        <Breadcrumb items={catalog.breadcrumbs} />

        <div className="flex flex-col gap-1.5 sm:gap-2">
          <span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase font-mono">
            LEXIDO • CATEGORY
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-heading tracking-tighter uppercase text-neutral-950 dark:text-white leading-[0.9] mt-1 mb-2">
            {catalog.category.name}
          </h1>
          {catalog.category.description && (
            <p className="text-xs sm:text-sm md:text-base text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed max-w-2xl">
              {catalog.category.description}
            </p>
          )}
        </div>

        {catalog.items.length === 0 ? (
          <EmptyState
            icon="Inbox"
            title="Category Empty"
            description="We haven't added any products to this category yet."
            actionLabel="Back to Shop All"
            actionHref="/products"
          />
        ) : (
          <>
            <ProductGrid cols="2" colsSm="2" colsMd="3" colsLg="4" className="xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 w-full gap-3 sm:gap-6 pt-2">
              {catalog.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8 select-none">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer h-10 px-5 rounded-none border-neutral-300 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <Link href={`/category/${resolvedParams.slug}?page=${page - 1}`}>
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
                    <Link href={`/category/${resolvedParams.slug}?page=${page + 1}`}>
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
