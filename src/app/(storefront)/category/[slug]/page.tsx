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

        <div className="flex flex-col gap-2">
          <Heading level={1} className="text-3xl font-extrabold text-slate-100 tracking-tight capitalize">
            {catalog.category.name}
          </Heading>
          {catalog.category.description && (
            <Text className="text-sm text-slate-400">
              {catalog.category.description}
            </Text>
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
            <ProductGrid cols="1" colsSm="2" colsMd="3" colsLg="4" gap="6">
              {catalog.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ProductGrid>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                {page > 1 && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
                    <Link href={`/category/${resolvedParams.slug}?page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-xs text-slate-400 font-semibold mx-2">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Button variant="outline" size="sm" asChild className="cursor-pointer">
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
