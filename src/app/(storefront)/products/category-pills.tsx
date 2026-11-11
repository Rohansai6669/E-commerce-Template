'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/core/utils/cn';
import { type FacetOption } from '@/core/product/product.types';

interface CategoryPillsProps {
  categories: FacetOption[];
  totalProducts: number;
}

/**
 * Sleek, horizontal scrolling category pill carousel for instant 1-tap filtering.
 * Features luxury styling with high-contrast active states and smooth touch momentum scrolling.
 */
export function CategoryPills({ categories, totalProducts }: CategoryPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category')?.toLowerCase();

  const handleSelect = (categoryValue: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryValue) {
      params.set('category', categoryValue);
    } else {
      params.delete('category');
    }
    params.delete('page'); // Reset to page 1 on category change
    router.push(`/products?${params.toString()}`);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full relative">
      {/* Scrollable pill container with hidden scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-0.5 scrollbar-none touch-pan-x -mx-1 sm:mx-0">
        {/* All Products Pill */}
        <button
          type="button"
          onClick={() => handleSelect(null)}
          className={cn(
            'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 select-none border',
            !activeCategory
              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-950 dark:hover:border-slate-200 hover:text-slate-950 dark:hover:text-white'
          )}
        >
          <span>All Pieces</span>
          <span
            className={cn(
              'text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums',
              !activeCategory
                ? 'bg-slate-800 text-slate-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            )}
          >
            {totalProducts}
          </span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.value.toLowerCase();
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleSelect(isActive ? null : cat.value)}
              className={cn(
                'inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 select-none border',
                isActive
                  ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-950 dark:hover:border-slate-200 hover:text-slate-950 dark:hover:text-white'
              )}
            >
              <span>{cat.label}</span>
              <span
                className={cn(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums',
                  isActive
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                )}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

