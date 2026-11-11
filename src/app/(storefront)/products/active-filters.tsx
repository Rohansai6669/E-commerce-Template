'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';

/**
 * Filter badge pill container with dismissible chips for all active parameters.
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
  const activeMaterial = searchParams.get('material');
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
      activeMaterial ||
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
    <div className="flex flex-wrap items-center gap-2">
      {activeSearch && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Search: &quot;{activeSearch}&quot;</span>
          <button
            onClick={() => removeParam('search')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear search filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeGender && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Audience: {formatText(activeGender)}</span>
          <button
            onClick={() => removeParam('gender')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear audience filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeCategory && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Category: {formatText(activeCategory)}</span>
          <button
            onClick={() => removeParam('category')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear category filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeCollection && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Collection: {formatText(activeCollection)}</span>
          <button
            onClick={() => removeParam('collection')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear collection filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeFestival && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Festival: {formatText(activeFestival)}</span>
          <button
            onClick={() => removeParam('festival')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear festival filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeEdition && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Edition: {formatText(activeEdition)}</span>
          <button
            onClick={() => removeParam('edition')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear edition filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeMaterial && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Material: {formatText(activeMaterial)}</span>
          <button
            onClick={() => removeParam('material')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear material filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeAvailability === 'in-stock' && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>In Stock Only</span>
          <button
            onClick={() => removeParam('availability')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear stock filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {activeBrand && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>Brand: {formatText(activeBrand)}</span>
          <button
            onClick={() => removeParam('brand')}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear brand filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      {(activeMin || activeMax) && (
        <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs">
          <span>
            Price:{' '}
            {activeMin && activeMax
              ? `₹${activeMin} - ₹${activeMax}`
              : activeMin
              ? `>= ₹${activeMin}`
              : `<= ₹${activeMax}`}
          </span>
          <button
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete('min');
              params.delete('max');
              params.delete('page');
              router.push(`/products?${params.toString()}`);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            aria-label="Clear price filter"
          >
            <Icon name="X" className="h-3 w-3" />
          </button>
        </Badge>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={clearAll}
        className="h-7 text-xs font-semibold px-2 cursor-pointer text-muted-foreground hover:text-foreground"
      >
        Clear All
      </Button>
    </div>
  );
}

export default ActiveFilters;
