import * as React from 'react';
import { searchService } from '@/core/search/search.service';
import { ProductGrid } from '@/components/storefront/product-grid';
import { ProductCard } from '@/components/commerce/product-card';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}

const POPULAR_CATEGORIES = [
  { label: 'MEN', href: '/men' },
  { label: 'WOMEN', href: '/women' },
  { label: 'ALL PRODUCTS', href: '/products' },
  { label: 'HOODIES', href: '/products?category=hoodies' },
  { label: 'DENIM', href: '/products?category=denim' },
  { label: 'GYM WEAR', href: '/products?category=gymwear' },
  { label: 'STREET WEAR', href: '/products?category=streetwear' },
];

/**
 * Dedicated storefront Search Results Page.
 * Balanced desktop and mobile layouts that avoid barren horizontal voids,
 * with crisp minimalist typography and contextual exploration paths.
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
    <Container className="py-8 sm:py-12 max-w-7xl mx-auto">
      <Stack gap="8">
        <Breadcrumb items={breadcrumbs} />

        {/* Minimalist Header */}
        <div className="flex flex-col gap-1.5 sm:gap-2 border-b border-border pb-6">
          <span className="text-[11px] font-bold tracking-[0.25em] text-neutral-500 uppercase font-mono">
            LEXIDO • SEARCH
          </span>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-heading tracking-tight uppercase text-foreground leading-none">
            Search Results
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono tracking-wide uppercase mt-1">
            {data.total > 0
              ? `Found ${data.total} ${data.total === 1 ? 'product' : 'products'} matching "${data.q}"`
              : `No products matching "${data.q}"`}
          </p>
        </div>

        {data.items.length === 0 ? (
          <EmptyState
            icon="Search"
            title="No Results Found"
            description="Try checking for spelling errors or exploring our curated categories below."
            actionLabel="Browse All Products"
            actionHref="/products"
          />
        ) : (
          <div className="space-y-12">
            {/* Product Grid: 4-col max on desktop for elegant proportion */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 w-full">
              {data.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-4 select-none">
                {page > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer h-10 px-5 rounded-none border-border text-xs font-bold uppercase tracking-wider hover:bg-muted"
                  >
                    <Link href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}>
                      Previous
                    </Link>
                  </Button>
                )}
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-4 font-mono">
                  Page <span className="text-foreground font-extrabold">{page}</span> of{' '}
                  <span className="text-foreground font-extrabold">{totalPages}</span>
                </span>
                {page < totalPages && (
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="cursor-pointer h-10 px-5 rounded-none border-border text-xs font-bold uppercase tracking-wider hover:bg-muted"
                  >
                    <Link href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}>
                      Next
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {/* Contextual Exploration Shelves when results are sparse */}
            {data.items.length < 4 && (
              <div className="pt-8 border-t border-border mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-foreground" />
                    <span className="text-xs font-bold uppercase tracking-widest text-foreground font-heading">
                      Explore Popular Collections
                    </span>
                  </div>
                  <Link
                    href="/products"
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors uppercase tracking-wider"
                  >
                    <span>View all products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {POPULAR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="px-4 py-2.5 rounded-none border border-border bg-card hover:bg-foreground hover:text-background text-xs font-bold uppercase tracking-wider transition-all duration-200"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Stack>
    </Container>
  );
}
