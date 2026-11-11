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
    <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in duration-200">
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-heading mr-1">
        Active:
      </span>

      {activeSearch && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Search: &ldquo;{activeSearch}&rdquo;</span>
          <button
            type="button"
            onClick={() => removeParam('search')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove search filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeGender && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Audience: {formatText(activeGender)}</span>
          <button
            type="button"
            onClick={() => removeParam('gender')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove audience filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeCategory && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Category: {formatText(activeCategory)}</span>
          <button
            type="button"
            onClick={() => removeParam('category')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove category filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeCollection && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Collection: {formatText(activeCollection)}</span>
          <button
            type="button"
            onClick={() => removeParam('collection')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove collection filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeAvailability && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>In Stock Only</span>
          <button
            type="button"
            onClick={() => removeParam('availability')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove availability filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {(activeMin || activeMax) && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>
            Price: {activeMin ? `₹${activeMin}` : '₹0'} – {activeMax ? `₹${activeMax}` : 'Any'}
          </span>
          <button
            type="button"
            onClick={removePrice}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove price filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeBrand && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Brand: {formatText(activeBrand)}</span>
          <button
            type="button"
            onClick={() => removeParam('brand')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove brand filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeEdition && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Edition: {formatText(activeEdition)}</span>
          <button
            type="button"
            onClick={() => removeParam('edition')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove edition filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {activeFestival && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs">
          <span>Festival: {formatText(activeFestival)}</span>
          <button
            type="button"
            onClick={() => removeParam('festival')}
            className="text-slate-400 hover:text-white dark:hover:text-slate-900 transition cursor-pointer"
            aria-label="Remove festival filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}

      {/* Clear All Text Button */}
      <button
        type="button"
        onClick={clearAll}
        className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1 py-1 px-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
}

export default ActiveFilters;
