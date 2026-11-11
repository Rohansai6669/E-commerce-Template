'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Heading } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { type FilterFacets } from '@/core/product/product.types';

export interface FilterSidebarProps {
  facets: FilterFacets;
  categories?: Array<{ id: string; name: string; slug: string }>;
  brands?: Array<{ id: string; name: string; slug: string }>;
}

/**
 * Responsive, database-driven sidebar panel for filtering products.
 * Uses real PostgreSQL facet counts for categories, audience/gender,
 * collections, universal attributes (festival, edition, material),
 * availability, and price boundaries.
 */
export function FilterSidebar({ facets }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get('category');
  const activeBrand = searchParams.get('brand');
  const activeGender = searchParams.get('gender')?.toLowerCase();
  const activeCollection = searchParams.get('collection')?.toLowerCase();
  const activeEdition = searchParams.get('edition')?.toLowerCase();
  const activeFestival = searchParams.get('festival')?.toLowerCase();
  const activeMaterial = searchParams.get('material')?.toLowerCase();
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
      activeMaterial ||
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

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice && Number(minPrice) >= 0) params.set('min', minPrice);
    else params.delete('min');

    if (maxPrice && Number(maxPrice) >= 0) params.set('max', maxPrice);
    else params.delete('max');

    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push('/products');
  };

  return (
    <Stack gap="5" className="w-full lg:w-64 shrink-0 border border-border bg-card p-5 rounded-lg shadow-sm">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="SlidersHorizontal" className="h-4 w-4 text-primary" />
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider text-foreground font-heading">
            Filters
          </Heading>
        </div>
        {hasAnyFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[11px] font-semibold text-primary hover:underline cursor-pointer transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Availability / In Stock */}
      <Stack gap="2">
        <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
          Availability
        </Heading>
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center justify-between text-xs font-medium cursor-pointer text-foreground/90 hover:text-foreground">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={activeAvailability === 'in-stock'}
                onChange={(e) => updateParam('availability', e.target.checked ? 'in-stock' : null)}
                className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
              />
              <span>In Stock Only</span>
            </div>
            <span className="text-[11px] text-muted-foreground tabular-nums">({facets.inStockCount})</span>
          </label>
        </div>
      </Stack>

      {/* Target Audience / Gender */}
      {facets.genders.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Audience
          </Heading>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateParam('gender', null)}
              className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                !activeGender ? 'text-primary font-bold' : 'text-foreground/80'
              }`}
            >
              <span>All Audiences</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">({facets.totalProducts})</span>
            </button>
            {facets.genders.map((g) => (
              <button
                key={g.value}
                onClick={() => updateParam('gender', activeGender === g.value ? null : g.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeGender === g.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span>{g.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">({g.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {/* Categories */}
      {facets.categories.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Categories
          </Heading>
          <div className="flex flex-col gap-1 max-h-56 overflow-y-auto pr-1">
            <button
              onClick={() => updateParam('category', null)}
              className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                !activeCategory ? 'text-primary font-bold' : 'text-foreground/80'
              }`}
            >
              <span>All Categories</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">({facets.totalProducts})</span>
            </button>
            {facets.categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => updateParam('category', activeCategory === cat.value ? null : cat.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeCategory === cat.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span className="truncate pr-1">{cat.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">({cat.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {/* Collections */}
      {facets.collections.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Collections
          </Heading>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => updateParam('collection', null)}
              className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                !activeCollection ? 'text-primary font-bold' : 'text-foreground/80'
              }`}
            >
              <span>All Collections</span>
            </button>
            {facets.collections.map((col) => (
              <button
                key={col.value}
                onClick={() => updateParam('collection', activeCollection === col.value ? null : col.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeCollection === col.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span className="truncate pr-1">{col.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">({col.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {/* Festivals (Universal Attribute) */}
      {facets.festivals.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Festival
          </Heading>
          <div className="flex flex-col gap-1">
            {facets.festivals.map((fest) => (
              <button
                key={fest.value}
                onClick={() => updateParam('festival', activeFestival === fest.value ? null : fest.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeFestival === fest.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span>{fest.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">({fest.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {/* Editions (Universal Attribute) */}
      {facets.editions.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Edition
          </Heading>
          <div className="flex flex-col gap-1">
            {facets.editions.map((ed) => (
              <button
                key={ed.value}
                onClick={() => updateParam('edition', activeEdition === ed.value ? null : ed.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeEdition === ed.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span>{ed.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">({ed.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}

      {/* Price Range */}
      <Stack gap="2" className="pt-2 border-t border-border/60">
        <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
          Price Range
        </Heading>
        <form onSubmit={handlePriceApply} className="flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="relative w-full">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
              <Input
                type="number"
                placeholder={facets.priceRange.min ? String(facets.priceRange.min) : 'Min'}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-8 pl-6 text-xs rounded"
              />
            </div>
            <span className="text-muted-foreground/60 text-xs">-</span>
            <div className="relative w-full">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
              <Input
                type="number"
                placeholder={facets.priceRange.max ? String(facets.priceRange.max) : 'Max'}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-8 pl-6 text-xs rounded"
              />
            </div>
          </div>
          <Button type="submit" size="sm" variant="outline" className="h-8 w-full font-semibold cursor-pointer text-xs">
            Apply Price
          </Button>
        </form>
      </Stack>

      {/* Brands */}
      {facets.brands.length > 0 && (
        <Stack gap="2" className="pt-2 border-t border-border/60">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Brands
          </Heading>
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => updateParam('brand', null)}
              className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                !activeBrand ? 'text-primary font-bold' : 'text-foreground/80'
              }`}
            >
              <span>All Brands</span>
            </button>
            {facets.brands.map((b) => (
              <button
                key={b.value}
                onClick={() => updateParam('brand', activeBrand === b.value ? null : b.value)}
                className={`flex items-center justify-between text-left text-xs font-medium py-1 transition-colors hover:text-primary cursor-pointer ${
                  activeBrand === b.value ? 'text-primary font-bold' : 'text-foreground/80'
                }`}
              >
                <span>{b.label}</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">({b.count})</span>
              </button>
            ))}
          </div>
        </Stack>
      )}
    </Stack>
  );
}

export default FilterSidebar;
