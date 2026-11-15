'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/core/utils/cn';

/**
 * Filter badge pill container with dismissible chips for all active parameters.
 * Luxury styling matching Lexido brand standards.
 */
export function ActiveFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category');
  const activeBrand = searchParams.get('brand');
  const activeGender = searchParams.get('gender');
  const activeCollection = searchParams.get('collection');
  const activeEdition = searchParams.get('edition');
  const activeFestival = searchParams.get('festival');
  const activeAvailability = searchParams.get('availability');
  const activeMin = searchParams.get('min');
  const activeMax = searchParams.get('max');
  const activeSearch = searchParams.get('search');

  const hasFilters = Boolean(
    activeCategory ||
      activeBrand ||
      activeGender ||
      activeCollection ||
      activeEdition ||
      activeFestival ||
      activeAvailability ||
      activeMin ||
      activeMax ||
      activeSearch
  );

  if (!hasFilters) return null;

  const removeParam = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const removePrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('min');
    params.delete('max');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    router.push('/products');
  };

  const formatText = (str: string) => {
    return str
      .split(/[-_ ]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-200">
      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-neutral-400 font-mono mr-1">
        FILTERS:
      </span>

      {activeSearch && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>Search: &ldquo;{activeSearch}&rdquo;</span>
          <button
            type="button"
            onClick={() => removeParam('search')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove search filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeGender && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>{formatText(activeGender)}</span>
          <button
            type="button"
            onClick={() => removeParam('gender')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove audience filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeCategory && activeCategory !== 'all' && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>{formatText(activeCategory)}</span>
          <button
            type="button"
            onClick={() => removeParam('category')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove category filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeCollection && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>{formatText(activeCollection)}</span>
          <button
            type="button"
            onClick={() => removeParam('collection')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove collection filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeAvailability && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>In Stock</span>
          <button
            type="button"
            onClick={() => removeParam('availability')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove availability filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {(activeMin || activeMax) && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>
            {activeMin ? `₹${activeMin}` : '₹0'} – {activeMax ? `₹${activeMax}` : 'Any'}
          </span>
          <button
            type="button"
            onClick={removePrice}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove price filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeBrand && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>Brand: {formatText(activeBrand)}</span>
          <button
            type="button"
            onClick={() => removeParam('brand')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove brand filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeEdition && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>{formatText(activeEdition)}</span>
          <button
            type="button"
            onClick={() => removeParam('edition')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove edition filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {activeFestival && (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-none">
          <span>{formatText(activeFestival)}</span>
          <button
            type="button"
            onClick={() => removeParam('festival')}
            className="text-neutral-400 hover:text-white dark:hover:text-black transition cursor-pointer"
            aria-label="Remove festival filter"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      )}

      {/* Clear All Text Button */}
      <button
        type="button"
        onClick={clearAll}
        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white underline cursor-pointer ml-1 py-1 px-1 transition"
      >
        <RotateCcw className="w-3 h-3" />
        <span>CLEAR ALL</span>
      </button>
    </div>
  );
}

export default ActiveFilters;
