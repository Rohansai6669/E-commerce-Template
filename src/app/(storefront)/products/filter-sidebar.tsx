'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { type FilterFacets } from '@/core/product/product.types';
import {
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/core/utils/cn';

export interface FilterSidebarProps {
  facets: FilterFacets;
  isMobile?: boolean;
  onClose?: () => void;
  className?: string;
}

const PRICE_PRESETS = [
  { label: 'Under ₹2,000', min: '0', max: '2000' },
  { label: '₹2,000 – ₹5,000', min: '2000', max: '5000' },
  { label: '₹5,000 – ₹10,000', min: '5000', max: '10000' },
  { label: 'Over ₹10,000', min: '10000', max: '' },
];

/**
 * Filter Section Accordion Component with collapsible toggle.
 */
function FilterAccordion({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-left group cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-100 font-heading">
            {title}
          </span>
          {count !== undefined && count > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-slate-400 transition-transform duration-200 group-hover:text-slate-900 dark:group-hover:text-white',
            isOpen && 'rotate-180 text-slate-900 dark:text-white'
          )}
        />
      </button>

      {isOpen && <div className="pt-2 animate-in fade-in duration-150">{children}</div>}
    </div>
  );
}

/**
 * Responsive, database-driven sidebar and drawer panel for filtering catalog products.
 * Supports both desktop sticky sidebar and mobile slide-over bottom sheet.
 */
export function FilterSidebar({
  facets,
  isMobile = false,
  onClose,
  className,
}: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category')?.toLowerCase();
  const activeBrand = searchParams.get('brand')?.toLowerCase();
  const activeGender = searchParams.get('gender')?.toLowerCase();
  const activeCollection = searchParams.get('collection')?.toLowerCase();
  const activeEdition = searchParams.get('edition')?.toLowerCase();
  const activeFestival = searchParams.get('festival')?.toLowerCase();
  const activeAvailability = searchParams.get('availability');
  const activeMin = searchParams.get('min') || '';
  const activeMax = searchParams.get('max') || '';

  const [minPrice, setMinPrice] = React.useState(activeMin);
  const [maxPrice, setMaxPrice] = React.useState(activeMax);

  // Sync state if URL changes externally
  React.useEffect(() => {
    setMinPrice(activeMin);
    setMaxPrice(activeMax);
  }, [activeMin, activeMax]);

  const hasAnyFilters = Boolean(
    activeCategory ||
      activeBrand ||
      activeGender ||
      activeCollection ||
      activeEdition ||
      activeFestival ||
      activeAvailability ||
      activeMin ||
      activeMax
  );

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset pagination
    router.push(`/products?${params.toString()}`);
  };

  const handlePriceApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice && Number(minPrice) >= 0) params.set('min', minPrice);
    else params.delete('min');

    if (maxPrice && Number(maxPrice) >= 0) params.set('max', maxPrice);
    else params.delete('max');

    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const applyPresetPrice = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
    const params = new URLSearchParams(searchParams.toString());
    if (min) params.set('min', min);
    else params.delete('min');
    if (max) params.set('max', max);
    else params.delete('max');
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    router.push('/products');
  };

  const filterContent = (
    <div className="flex flex-col gap-4">
      {/* 1. Availability */}
      <FilterAccordion title="Availability" defaultOpen={true}>
        <label className="flex items-center justify-between text-xs font-semibold py-1.5 cursor-pointer text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition select-none">
          <div className="flex items-center gap-2.5">
            <input
              type="checkbox"
              checked={activeAvailability === 'in-stock'}
              onChange={(e) => updateParam('availability', e.target.checked ? 'in-stock' : null)}
              className="rounded-md border-slate-300 dark:border-slate-700 text-slate-950 focus:ring-slate-950 h-4 w-4 cursor-pointer accent-slate-950"
            />
            <span>In Stock Only</span>
          </div>
          <span className="text-[11px] text-slate-400 font-bold tabular-nums">
            ({facets.inStockCount})
          </span>
        </label>
      </FilterAccordion>

      {/* 2. Target Audience / Gender */}
      {facets.genders.length > 0 && (
        <FilterAccordion title="Audience" count={facets.genders.length} defaultOpen={true}>
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => updateParam('gender', null)}
              className={cn(
                'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                !activeGender
                  ? 'bg-slate-950 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              )}
            >
              <span>All Audiences</span>
              <span className="text-[10px] tabular-nums font-bold">({facets.totalProducts})</span>
            </button>
            {facets.genders.map((g) => {
              const isSelected = activeGender === g.value.toLowerCase();
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => updateParam('gender', isSelected ? null : g.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span>{g.label}</span>
                  <span className="text-[10px] tabular-nums font-bold">({g.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 3. Categories */}
      {facets.categories.length > 0 && (
        <FilterAccordion title="Categories" count={facets.categories.length} defaultOpen={true}>
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1 scrollbar-none">
            <button
              type="button"
              onClick={() => updateParam('category', null)}
              className={cn(
                'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                !activeCategory
                  ? 'bg-slate-950 text-white font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
              )}
            >
              <span>All Categories</span>
              <span className="text-[10px] tabular-nums font-bold">({facets.totalProducts})</span>
            </button>
            {facets.categories.map((cat) => {
              const isSelected = activeCategory === cat.value.toLowerCase();
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => updateParam('category', isSelected ? null : cat.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span className="truncate pr-1">{cat.label}</span>
                  <span className="text-[10px] tabular-nums font-bold shrink-0">({cat.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 4. Price Range & Quick Presets */}
      <FilterAccordion title="Price Range" defaultOpen={true}>
        <div className="flex flex-col gap-3">
          {/* Quick Preset Buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {PRICE_PRESETS.map((preset) => {
              const isPresetActive = activeMin === preset.min && activeMax === preset.max;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    isPresetActive
                      ? applyPresetPrice('', '')
                      : applyPresetPrice(preset.min, preset.max)
                  }
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-[11px] font-bold tracking-tight text-center transition cursor-pointer border',
                    isPresetActive
                      ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                      : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-950'
                  )}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Custom Min / Max Inputs */}
          <form onSubmit={handlePriceApply} className="flex flex-col gap-2 pt-1">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="h-8 pl-6 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-semibold"
                />
              </div>
              <span className="text-slate-400 text-xs font-bold">–</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="h-8 pl-6 text-xs rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-semibold"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-2xs"
            >
              Apply Price
            </button>
          </form>
        </div>
      </FilterAccordion>

      {/* 5. Collections */}
      {facets.collections.length > 0 && (
        <FilterAccordion title="Collections" count={facets.collections.length} defaultOpen={false}>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-none">
            {facets.collections.map((col) => {
              const isSelected = activeCollection === col.value.toLowerCase();
              return (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => updateParam('collection', isSelected ? null : col.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span className="truncate pr-1">{col.label}</span>
                  <span className="text-[10px] tabular-nums font-bold">({col.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 6. Editions & Festivals */}
      {facets.editions.length > 0 && (
        <FilterAccordion title="Edition" count={facets.editions.length} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {facets.editions.map((ed) => {
              const isSelected = activeEdition === ed.value.toLowerCase();
              return (
                <button
                  key={ed.value}
                  type="button"
                  onClick={() => updateParam('edition', isSelected ? null : ed.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span>{ed.label}</span>
                  <span className="text-[10px] tabular-nums font-bold">({ed.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {facets.festivals.length > 0 && (
        <FilterAccordion title="Festival" count={facets.festivals.length} defaultOpen={false}>
          <div className="flex flex-col gap-1">
            {facets.festivals.map((fest) => {
              const isSelected = activeFestival === fest.value.toLowerCase();
              return (
                <button
                  key={fest.value}
                  type="button"
                  onClick={() => updateParam('festival', isSelected ? null : fest.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span>{fest.label}</span>
                  <span className="text-[10px] tabular-nums font-bold">({fest.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* 7. Brands */}
      {facets.brands.length > 0 && (
        <FilterAccordion title="Brands" count={facets.brands.length} defaultOpen={false}>
          <div className="flex flex-col gap-1 max-h-44 overflow-y-auto pr-1 scrollbar-none">
            {facets.brands.map((b) => {
              const isSelected = activeBrand === b.value.toLowerCase();
              return (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => updateParam('brand', isSelected ? null : b.value)}
                  className={cn(
                    'flex items-center justify-between text-left text-xs font-semibold py-1.5 px-2 rounded-lg transition cursor-pointer',
                    isSelected
                      ? 'bg-slate-950 text-white font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900'
                  )}
                >
                  <span>{b.label}</span>
                  <span className="text-[10px] tabular-nums font-bold">({b.count})</span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}
    </div>
  );

  // If Mobile Drawer Mode
  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-slate-950 dark:text-white" />
            <h3 className="text-base font-extrabold uppercase tracking-wider font-heading">
              Filters & Refinements
            </h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
              aria-label="Close filters"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{filterContent}</div>

        {/* Sticky Drawer Footer */}
        <div className="border-t border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md shrink-0 flex items-center gap-3">
          {hasAnyFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer"
            >
              Clear All
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-md text-center"
          >
            Show {facets.totalProducts} Pieces
          </button>
        </div>
      </div>
    );
  }

  // Desktop Sticky Sidebar Mode
  return (
    <aside
      className={cn(
        'w-full lg:w-72 shrink-0 border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-card p-5 rounded-2xl shadow-xs self-start sticky top-24 space-y-4',
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-slate-950 dark:text-white" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-950 dark:text-slate-100 font-heading">
            Refine Catalog
          </h3>
        </div>
        {hasAnyFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {filterContent}
    </aside>
  );
}

export default FilterSidebar;
