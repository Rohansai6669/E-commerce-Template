'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Text } from '@/components/ui/typography';
import { type ProductSort } from '@/core/product/product.types';

export interface SortToolbarProps {
  total: number;
  count: number;
}

/**
 * Toolbar controlling catalog count summaries and sorting parameters.
 */
export function SortToolbar({ total, count }: SortToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeSort = (searchParams.get('sort') as ProductSort) || 'latest';

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-md border border-border">
      <Text className="text-xs text-muted-foreground">
        Showing <span className="font-semibold text-foreground">{count}</span> of{' '}
        <span className="font-semibold text-foreground">{total}</span> products
      </Text>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-select" className="text-xs text-muted-foreground shrink-0 select-none">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={activeSort}
          onChange={handleSortChange}
          className="text-xs font-semibold bg-background border border-border rounded px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer text-foreground"
        >
          <option value="latest">Latest Arrivals</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Customer Rating</option>
          <option value="popular">Popularity</option>
        </select>
      </div>
    </div>
  );
}
export default SortToolbar;
