'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { type FilterFacets, type ProductSort } from '@/core/product/product.types';
import { serializeProductFilters } from '@/core/storefront/filters';
import { ConfigurableProductCard, type ProductData } from '@/components/commerce/configurable-product-card';
import { FilterSidebar } from './filter-sidebar';
import { ActiveFilters } from './active-filters';
import { Button } from '@/components/ui/button';
import { ChevronDown, SlidersHorizontal, Check, Package } from 'lucide-react';
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

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: 'NEWEST', value: 'latest' },
  { label: 'PRICE: LOW TO HIGH', value: 'price-asc' },
  { label: 'PRICE: HIGH TO LOW', value: 'price-desc' },
  { label: 'CUSTOMER RATING', value: 'rating-desc' },
  { label: 'POPULARITY', value: 'popular' },
];

export function ProductsCatalogView({
  products,
  facets,
  total,
  page,
  limit,
  totalPages,
  filters,
}: ProductsCatalogViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = React.useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const [isSortOpen, setIsSortOpen] = React.useState(false);
  const sortRef = React.useRef<HTMLDivElement>(null);

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

  // Click outside to close sort dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    if (isSortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isSortOpen]);

  // Active filter count
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

  const activeCategory = searchParams.get('category')?.toLowerCase();
  const activeGender = searchParams.get('gender')?.toLowerCase();
  const currentSort = (searchParams.get('sort') as ProductSort) || 'latest';
  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === currentSort)?.label || 'NEWEST';

  // Handle Sort Change
  const handleSortChange = (value: ProductSort) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    setIsSortOpen(false);
    router.push(`/products?${params.toString()}`);
  };

  // Handle Category Tab Selection
  const handleCategoryTabSelect = (catSlug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug) {
      params.set('category', catSlug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  // Pre-filter category tabs: exclude gender tokens if already on a gender page
  const categoryTabs = React.useMemo(() => {
    const defaultCategories = [
      { label: 'T-Shirts', value: 't-shirts' },
      { label: 'Hoodies', value: 'hoodies' },
      { label: 'Denim', value: 'denim' },
      { label: 'Outerwear', value: 'outerwear' },
      { label: 'Accessories', value: 'accessories' },
    ];

    if (!facets.categories || facets.categories.length === 0) {
      return defaultCategories;
    }

    const filtered = facets.categories.filter((c) => {
      const v = c.value.toLowerCase();
      return v !== 'men' && v !== 'women' && v !== 'kids';
    });

    return filtered.length > 0 ? filtered : defaultCategories;
  }, [facets.categories]);

  // Is "All" tab active? (Active when no subcategory is selected, or category is 'men'/'women')
  const isAllActive =
    !activeCategory ||
    (activeCategory === 'men' && activeGender === 'men') ||
    activeCategory === 'men' ||
    activeCategory === 'all';

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
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMobileFilterOpen(false)}
            />
            <div className="relative w-full max-w-md h-full bg-white dark:bg-neutral-950 shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
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
    <div className="w-full flex flex-col">
      {/* 1. Sleek Horizontal Category Tabs & Sort Line (Matches Reference Image) */}
      <div className="w-full border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
        {/* Left: Category Navigation Tabs */}
        <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none touch-pan-x">
          {/* ALL Tab */}
          <button
            type="button"
            onClick={() => handleCategoryTabSelect(null)}
            className={cn(
              'pb-3 text-xs sm:text-sm uppercase tracking-wider font-bold transition-colors cursor-pointer select-none whitespace-nowrap',
              isAllActive
                ? 'border-b-2 border-black dark:border-white text-neutral-950 dark:text-white -mb-[1px]'
                : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white'
            )}
          >
            All
          </button>

          {/* Subcategory Tabs */}
          {categoryTabs.map((tab) => {
            const isActive = !isAllActive && activeCategory === tab.value.toLowerCase();
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleCategoryTabSelect(tab.value)}
                className={cn(
                  'pb-3 text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap',
                  isActive
                    ? 'border-b-2 border-black dark:border-white font-bold text-neutral-950 dark:text-white -mb-[1px]'
                    : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white font-medium'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Right: Sort Dropdown & Filter Drawer Button */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0 relative" ref={sortRef}>
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="inline-flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-950 dark:text-white hover:text-neutral-600 transition-colors cursor-pointer select-none"
            >
              <span>{activeSortLabel}</span>
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', isSortOpen && 'rotate-180')} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1.5 z-50 rounded-none animate-in fade-in slide-in-from-top-2 duration-150">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSortChange(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors',
                      currentSort === opt.value
                        ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                    )}
                  >
                    <span>{opt.label}</span>
                    {currentSort === opt.value && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="inline-flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer select-none transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">FILTERS</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 2. Pieces Count & Active Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 sm:py-4">
        <div className="text-xs font-bold font-mono tracking-widest uppercase text-neutral-500">
          {total} {total === 1 ? 'PIECE' : 'PIECES'}
        </div>
        <ActiveFilters />
      </div>

      {/* 3. Catalog Products or Empty State */}
      {products.length === 0 ? (
        /* Empty State Box matching reference image pixel-for-pixel */
        <div className="w-full flex justify-center py-6 sm:py-12">
          <div className="w-full max-w-lg border border-dashed border-neutral-300 dark:border-neutral-800 p-8 sm:p-14 text-center flex flex-col items-center justify-center bg-white dark:bg-neutral-950/40 rounded-none shadow-none">
            <div className="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 flex items-center justify-center text-neutral-600 dark:text-neutral-300 mb-6">
              <Package className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight font-heading text-neutral-950 dark:text-white mb-2">
              NO PRODUCTS IN THIS CATEGORY
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mb-6 leading-relaxed">
              New silhouettes for this collection are arriving soon. Browse our complete catalog in the meantime.
            </p>
            <Link
              href="/products"
              className="px-8 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold tracking-widest uppercase rounded-none transition-all shadow-sm inline-flex items-center justify-center cursor-pointer"
            >
              Explore All Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Product Grid */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full pt-2">
            {products.map((product) => (
              <ConfigurableProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Stepper Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-10 pb-8 select-none">
              {page > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer h-10 px-5 rounded-none border-neutral-300 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900"
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

              <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest px-4 font-mono">
                Page <span className="text-neutral-950 dark:text-white font-extrabold">{page}</span> of{' '}
                <span className="text-neutral-950 dark:text-white font-extrabold">{totalPages}</span>
              </span>

              {page < totalPages && (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="cursor-pointer h-10 px-5 rounded-none border-neutral-300 dark:border-neutral-800 text-xs font-bold uppercase tracking-wider hover:bg-neutral-100 dark:hover:bg-neutral-900"
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

      {/* 4. Slide-Over Filter Drawer */}
      {mobileDrawer}
    </div>
  );
}

export default ProductsCatalogView;

