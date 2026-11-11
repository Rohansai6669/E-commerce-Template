'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { type FilterFacets } from '@/core/product/product.types';
import { serializeProductFilters } from '@/core/storefront/filters';
import { ConfigurableProductCard, type ProductData } from '@/components/commerce/configurable-product-card';
import { CategoryPills } from './category-pills';
import { FilterSidebar } from './filter-sidebar';
import { SortToolbar } from './sort-toolbar';
import { ActiveFilters } from './active-filters';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';

interface ProductsCatalogViewProps {
  products: ProductData[];
  facets: FilterFacets;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: any;
}

export function ProductsCatalogView({
  products,
  facets,
  total,
  page,
  limit,
  totalPages,
  filters,
}: ProductsCatalogViewProps) {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'grid-2' | 'grid-1'>('grid-2');

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile drawer is open
  React.useEffect(() => {
    if (isMobileFilterOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isMobileFilterOpen]);

  // Compute active filter count
  const activeFilterCount = React.useMemo(() => {
    let count = 0;
    if (searchParams.get('category')) count++;
    if (searchParams.get('gender')) count++;
    if (searchParams.get('collection')) count++;
    if (searchParams.get('brand')) count++;
    if (searchParams.get('edition')) count++;
    if (searchParams.get('festival')) count++;
    if (searchParams.get('availability')) count++;
    if (searchParams.get('min') || searchParams.get('max')) count++;
    if (searchParams.get('search')) count++;
    return count;
  }, [searchParams]);

  // Mobile Slide-Over Drawer Portal
  const mobileDrawer =
    mounted && isMobileFilterOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[9990] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileFilterOpen(false)}
            />

            {/* Slide-over panel */}
            <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-950 shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
              <FilterSidebar
                facets={facets}
                isMobile={true}
                onClose={() => setIsMobileFilterOpen(false)}
              />
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* 1. Category Quick-Pills Carousel */}
      <CategoryPills categories={facets.categories} totalProducts={facets.totalProducts} />

      {/* 2. Responsive Sort & Mobile Filter Bar */}
      <SortToolbar
        total={total}
        count={products.length}
        activeFilterCount={activeFilterCount}
        onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* 3. Active Filters Dismissible Pills */}
      <ActiveFilters />

      {/* 4. Main Body: Desktop Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
        {/* Desktop Sticky Sidebar (< lg is hidden) */}
        <FilterSidebar facets={facets} isMobile={false} className="hidden lg:block" />

        {/* Product Catalog Grid Container */}
        <div className="flex-1 w-full flex flex-col gap-8">
          {products.length === 0 ? (
            <div className="py-8">
              <EmptyState
                icon="Inbox"
                title="No Products Found"
                description="We couldn't find any products matching your active filters. Try resetting your filter criteria."
                actionLabel="Reset All Filters"
                actionHref="/products"
              />
            </div>
          ) : (
            <>
              {/* Product Grid: 2-column or 1-column on mobile, 3-column on desktop */}
              <div
                className={cn(
                  'grid w-full',
                  viewMode === 'grid-2'
                    ? 'grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3'
                    : 'grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 sm:gap-6'
                )}
              >
                {products.map((product) => (
                  <ConfigurableProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination Stepper controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4 pb-8 select-none">
                  {page > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="cursor-pointer h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Link
                        href={`/products?${new URLSearchParams(
                          serializeProductFilters({ ...filters, page: page - 1 })
                        ).toString()}`}
                      >
                        Previous
                      </Link>
                    </Button>
                  )}

                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest px-4 font-heading">
                    Page <span className="text-slate-950 dark:text-white font-extrabold">{page}</span> of{' '}
                    <span className="text-slate-950 dark:text-white font-extrabold">{totalPages}</span>
                  </span>

                  {page < totalPages && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="cursor-pointer h-10 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
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

      {/* 5. Mobile Filter Drawer Portal */}
      {mobileDrawer}
    </div>
  );
}

export default ProductsCatalogView;

