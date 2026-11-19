'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConfigurableProductCard, type ProductData } from '@/components/commerce/configurable-product-card';
import { type CategoryPageMeta } from '@/core/storefront/category-catalog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Breadcrumb, type BreadcrumbItem } from '@/components/navigation/Breadcrumb/breadcrumb';
import { SlidersHorizontal, ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/core/utils/cn';

export type SubtagItem = string | { label: string; href?: string; slug?: string };

interface CategoryViewClientProps {
  category: string;
  subcategory?: string;
  child?: string;
  breadcrumbs?: BreadcrumbItem[];
  meta: CategoryPageMeta & {
    breadcrumbs?: BreadcrumbItem[];
    heroImage?: string | null;
    subtitle?: string;
    subtags?: SubtagItem[];
  };
  initialItems: ProductData[];
  heroImage?: string | null;
  subtitle?: string;
}

const SORT_OPTIONS = [
  { label: 'NEWEST', value: 'newest' },
  { label: 'PRICE: LOW TO HIGH', value: 'price-low' },
  { label: 'PRICE: HIGH TO LOW', value: 'price-high' },
];

const PRICE_PRESETS = [
  { label: 'Under ₹2,000', min: 0, max: 2000 },
  { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
  { label: '₹5,000 – ₹10,000', min: 5000, max: 10000 },
  { label: 'Over ₹10,000', min: 10000, max: Infinity },
];

function isAllTag(tag: string | null | undefined): boolean {
  if (!tag) return true;
  const lower = tag.trim().toLowerCase();
  return lower === 'all' || lower.startsWith('all ') || lower.startsWith('all-') || lower.startsWith('all_');
}

export function CategoryViewClient({
  category,
  subcategory,
  child,
  breadcrumbs,
  meta,
  initialItems,
  heroImage,
  subtitle,
}: CategoryViewClientProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when mobile filter drawer is open
  useEffect(() => {
    if (isFilterDrawerOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isFilterDrawerOpen]);

  // Click outside to close sort dropdown
  useEffect(() => {
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

  const resolvedBreadcrumbs = breadcrumbs || meta.breadcrumbs;
  const resolvedSubtitle = subtitle || meta.subtitle;

  // Normalize subtags list
  const rawSubtags = meta.subtags || ['All'];
  const normalizedSubtags: Array<{ label: string; href?: string; slug?: string }> = rawSubtags.map((item) =>
    typeof item === 'string' ? { label: item } : item
  );

  // Active filter count calculation
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (!isAllTag(activeTag)) count++;
    if (selectedPriceFilter) count++;
    if (inStockOnly) count++;
    return count;
  }, [activeTag, selectedPriceFilter, inStockOnly]);

  const activeSortLabel =
    SORT_OPTIONS.find((s) => s.value === sortBy)?.label || 'NEWEST';

  // Filter & Sort items
  let displayedItems = useMemo(() => {
    let items = [...initialItems];

    // 1. Tag filter
    if (!isAllTag(activeTag)) {
      const cleanTag = activeTag.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(cleanTag) ||
          (item.category && item.category.toLowerCase().includes(cleanTag))
      );
    }

    // 2. Price filter
    if (selectedPriceFilter) {
      const preset = PRICE_PRESETS.find((p) => p.label === selectedPriceFilter);
      if (preset) {
        items = items.filter((item) => item.price >= preset.min && item.price <= preset.max);
      }
    }

    // 3. In stock filter
    if (inStockOnly) {
      items = items.filter((item) => item.stock === undefined || item.stock > 0);
    }

    // 4. Sort
    if (sortBy === 'price-low') {
      items.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      items.sort((a, b) => b.price - a.price);
    } else {
      items.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    }

    return items;
  }, [initialItems, activeTag, selectedPriceFilter, inStockOnly, sortBy]);

  const handleClearAllFilters = () => {
    setActiveTag('All');
    setSelectedPriceFilter(null);
    setInStockOnly(false);
  };

  // Filter Drawer Modal Portal
  const filterDrawerPortal =
    mounted && isFilterDrawerOpen
      ? createPortal(
          <div
            className="fixed inset-0 z-[9990] flex justify-end"
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
              onClick={() => setIsFilterDrawerOpen(false)}
            />

            {/* Slide-over Sheet */}
            <div className="relative w-full max-w-md bg-white dark:bg-neutral-950 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-black dark:text-white" />
                  <span className="text-sm font-black uppercase tracking-wider text-black dark:text-white font-heading">
                    FILTERS & REFINEMENTS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* 1. Price Range Preset Filters */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-3">
                    PRICE RANGE
                  </h4>
                  <div className="space-y-2">
                    {PRICE_PRESETS.map((preset) => {
                      const isSelected = selectedPriceFilter === preset.label;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setSelectedPriceFilter(isSelected ? null : preset.label);
                          }}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all cursor-pointer',
                            isSelected
                              ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                          )}
                        >
                          <span>{preset.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Sort Selection */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-3">
                    SORT ORDER
                  </h4>
                  <div className="space-y-2">
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSortBy(opt.value)}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all cursor-pointer',
                            isSelected
                              ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold'
                              : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                          )}
                        >
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Availability Filter */}
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-black dark:text-white mb-3">
                    AVAILABILITY
                  </h4>
                  <button
                    type="button"
                    onClick={() => setInStockOnly(!inStockOnly)}
                    className={cn(
                      'w-full text-left px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between border transition-all cursor-pointer',
                      inStockOnly
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black font-extrabold'
                        : 'border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                    )}
                  >
                    <span>In Stock Only</span>
                    {inStockOnly && <Check className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 p-5 flex items-center gap-3 bg-neutral-50 dark:bg-neutral-900/50">
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white border border-neutral-300 dark:border-neutral-700 cursor-pointer"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 py-3 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:opacity-90 cursor-pointer"
                >
                  Apply Filters ({displayedItems.length})
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="w-full bg-background min-h-screen">
      <div className="pt-6 sm:pt-8 pb-20 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
        {/* Interactive Breadcrumb Bar */}
        {resolvedBreadcrumbs && resolvedBreadcrumbs.length > 0 && (
          <div className="mb-6">
            <Breadcrumb items={resolvedBreadcrumbs} />
          </div>
        )}

        {/* Clean Editorial Category Header (No Overlays) */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-heading uppercase leading-none mb-3">
            {meta.title}
          </h1>
          {resolvedSubtitle && (
            <p className="text-xs sm:text-sm font-medium text-foreground/80 mb-2 max-w-2xl">
              {resolvedSubtitle}
            </p>
          )}
          {meta.description && (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
              {meta.description}
            </p>
          )}
        </div>

        {/* 1. Sleek Horizontal Category Tabs & Sort Line (Matches Reference UI Exactly) */}
        <div className="w-full border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-4">
          {/* Left: Category Navigation Tabs */}
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none touch-pan-x">
            {normalizedSubtags.map((tag) => {
              const tagIsAll = isAllTag(tag.label);
              const activeIsAll = isAllTag(activeTag);
              const isCurrentPath = tag.href ? pathname === tag.href : false;
              const isChildMatch = Boolean(child && tag.slug && child.toLowerCase() === tag.slug.toLowerCase());

              const isSelected = isChildMatch
                ? true
                : !child && tagIsAll && activeIsAll
                ? true
                : !activeIsAll && activeTag.toLowerCase() === tag.label.toLowerCase();

              const tabClass = cn(
                'pb-3 text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer select-none whitespace-nowrap',
                isSelected
                  ? 'border-b-2 border-black dark:border-white font-bold text-neutral-950 dark:text-white -mb-[1px]'
                  : 'text-neutral-500 hover:text-neutral-950 dark:hover:text-white font-medium'
              );

              // If tag is an "All" variant
              if (tagIsAll) {
                // If currently on a child route, clicking "All..." navigates back to base category
                if (tag.href && pathname && pathname !== tag.href) {
                  return (
                    <Link
                      key={tag.label}
                      href={tag.href}
                      onClick={() => setActiveTag('All')}
                      className={tabClass}
                    >
                      {tag.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={tag.label}
                    type="button"
                    suppressHydrationWarning
                    onClick={() => setActiveTag('All')}
                    className={tabClass}
                  >
                    {tag.label}
                  </button>
                );
              }

              // If subtag has a distinct navigation link, link it for deep stacking
              if (tag.href && !isCurrentPath) {
                return (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className={tabClass}
                  >
                    {tag.label}
                  </Link>
                );
              }

              return (
                <button
                  key={tag.label}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setActiveTag(tag.label)}
                  className={tabClass}
                >
                  {tag.label}
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
                suppressHydrationWarning
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
                      suppressHydrationWarning
                      onClick={() => {
                        setSortBy(opt.value);
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer transition-colors',
                        sortBy === opt.value
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      )}
                    >
                      <span>{opt.label}</span>
                      {sortBy === opt.value && <Check className="w-3.5 h-3.5 text-black dark:text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter Drawer Trigger */}
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white cursor-pointer select-none transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">FILTERS</span>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-bold rounded-none">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2. Pieces Count & Active Filters Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 sm:py-4 mb-4">
          <div className="text-xs font-bold font-mono tracking-widest uppercase text-neutral-500">
            {displayedItems.length} {displayedItems.length === 1 ? 'PIECE' : 'PIECES'}
          </div>

          {/* Active Filters Chip Strip */}
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {!isAllTag(activeTag) && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-2.5 py-1">
                  {activeTag}
                  <button
                    type="button"
                    onClick={() => setActiveTag('All')}
                    className="hover:opacity-70 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedPriceFilter && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-2.5 py-1">
                  {selectedPriceFilter}
                  <button
                    type="button"
                    onClick={() => setSelectedPriceFilter(null)}
                    className="hover:opacity-70 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 px-2.5 py-1">
                  In Stock
                  <button
                    type="button"
                    onClick={() => setInStockOnly(false)}
                    className="hover:opacity-70 ml-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 hover:text-black dark:hover:text-white underline ml-2 cursor-pointer"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* 3. Products Grid or Genuine Empty State */}
        {displayedItems.length === 0 ? (
          <EmptyState
            icon="Package"
            title={initialItems.length === 0 || isAllTag(activeTag) ? 'No Products in this Category' : `No Products Found for "${activeTag}"`}
            description={
              initialItems.length === 0 || isAllTag(activeTag)
                ? 'New silhouettes for this collection are arriving soon. Browse our complete catalog in the meantime.'
                : `None of the items in this view match your active filters. Try selecting another tag or clearing the filter.`
            }
            actionLabel={initialItems.length === 0 ? 'Explore All Products' : 'Clear All Filters'}
            actionHref={initialItems.length === 0 ? '/products' : undefined}
            onActionClick={initialItems.length > 0 ? handleClearAllFilters : undefined}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {displayedItems.map((product) => (
              <ConfigurableProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Filter Drawer */}
      {filterDrawerPortal}
    </div>
  );
}

export default CategoryViewClient;
