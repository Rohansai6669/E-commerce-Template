'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { type ProductSort } from '@/core/product/product.types';
import {
  SlidersHorizontal,
  Grid2X2,
  Square,
  ArrowUpDown,
  Check,
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

export interface SortToolbarProps {
  total: number;
  count: number;
  activeFilterCount?: number;
  onOpenMobileFilters?: () => void;
  viewMode?: 'grid-2' | 'grid-1';
  onViewModeChange?: (mode: 'grid-2' | 'grid-1') => void;
}

const SORT_OPTIONS: { label: string; value: ProductSort }[] = [
  { label: 'Latest Arrivals', value: 'latest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Customer Rating', value: 'rating-desc' },
  { label: 'Popularity', value: 'popular' },
];

/**
 * Responsive catalog sort and toolbar control.
 * On mobile: Provides filter slide-over trigger button, active filter badge,
 * layout density switch (2-col vs 1-col), and sort selector.
 */
export function SortToolbar({
  total,
  count,
  activeFilterCount = 0,
  onOpenMobileFilters,
  viewMode = 'grid-2',
  onViewModeChange,
}: SortToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSort = (searchParams.get('sort') as ProductSort) || 'latest';

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-5 sm:py-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-card shadow-xs">
      {/* Left: Mobile Filter Button + Product Count */}
      <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
        {/* Mobile Filter Button (< lg) */}
        {onOpenMobileFilters && (
          <button
            type="button"
            onClick={onOpenMobileFilters}
            className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950 text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs active:scale-95 transition"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-heading">
          Showing <span className="text-slate-950 dark:text-white font-extrabold">{count}</span> of{' '}
          <span className="text-slate-950 dark:text-white font-extrabold">{total}</span> pieces
        </div>
      </div>

      {/* Right: View Mode Toggle & Sort Dropdown */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
        {/* Mobile / Desktop Grid View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => onViewModeChange('grid-2')}
              title="2-Column Compact Grid"
              className={cn(
                'p-1.5 rounded-lg transition cursor-pointer',
                viewMode === 'grid-2'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('grid-1')}
              title="1-Column Editorial Large Card"
              className={cn(
                'p-1.5 rounded-lg transition cursor-pointer',
                viewMode === 'grid-1'
                  ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              )}
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sort Select */}
        <div className="relative flex items-center gap-2">
          <label htmlFor="sort-select" className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-slate-400 select-none">
            Sort:
          </label>
          <div className="relative">
            <select
              id="sort-select"
              value={activeSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-xs font-bold uppercase tracking-wider pl-3 pr-8 py-2 rounded-xl outline-none cursor-pointer focus:border-slate-950 dark:focus:border-slate-200 shadow-2xs"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SortToolbar;
