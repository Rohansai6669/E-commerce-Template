'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConfigurableProductCard, type ProductData } from '@/components/commerce/configurable-product-card';
import { type CategoryPageMeta } from '@/core/storefront/category-catalog';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';

interface CategoryViewClientProps {
  category: string;
  subcategory?: string;
  meta: CategoryPageMeta;
  initialItems: ProductData[];
}

export function CategoryViewClient({
  category,
  subcategory,
  meta,
  initialItems,
}: CategoryViewClientProps) {
  const [activeTag, setActiveTag] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Filter items based on active subtag pill selection
  let displayedItems = [...initialItems];

  if (activeTag !== 'All') {
    const cleanTag = activeTag.toLowerCase();
    displayedItems = displayedItems.filter(
      (item) =>
        item.name.toLowerCase().includes(cleanTag) ||
        (item.category && item.category.toLowerCase().includes(cleanTag))
    );
  }

  // Sort items
  if (sortBy === 'price-low') {
    displayedItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price-high') {
    displayedItems.sort((a, b) => b.price - a.price);
  }

  return (
    <div className="w-full bg-background min-h-screen pt-8 pb-20 px-4 sm:px-8 lg:px-12 max-w-[1600px] mx-auto">
      {/* Category Header */}
      <div className="mb-10">
        <p className="text-[11px] font-bold tracking-[0.25em] text-muted-foreground uppercase mb-2">
          {meta.breadcrumb}
        </p>
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground font-heading uppercase leading-none mb-3">
          {meta.title}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl font-normal leading-relaxed">
          {meta.description}
        </p>
      </div>

      {/* Subtags & Sort Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4 mb-8">
        {/* Horizontal Subtag Pills */}
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-1 text-xs font-semibold">
          {meta.subtags.map((tag) => {
            const isActive = activeTag === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`whitespace-nowrap transition-colors cursor-pointer pb-0.5 ${
                  isActive
                    ? 'text-foreground font-bold border-b-2 border-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-transparent text-xs font-bold uppercase tracking-wider text-foreground border-none outline-none cursor-pointer pr-2"
          >
            <option value="newest">NEWEST</option>
            <option value="price-low">PRICE: LOW TO HIGH</option>
            <option value="price-high">PRICE: HIGH TO LOW</option>
          </select>
        </div>
      </div>

      {/* Product Count Display */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
          {displayedItems.length} {displayedItems.length === 1 ? 'PIECE' : 'PIECES'}
        </p>
        {activeTag !== 'All' && (
          <button
            onClick={() => setActiveTag('All')}
            className="text-xs text-primary hover:underline font-semibold cursor-pointer"
          >
            Reset tag filter
          </button>
        )}
      </div>

      {/* Products Grid or Genuine Empty State */}
      {displayedItems.length === 0 ? (
        <EmptyState
          icon="Package"
          title={initialItems.length === 0 ? 'No Products in this Category' : `No Products Found for "${activeTag}"`}
          description={
            initialItems.length === 0
              ? 'New silhouettes for this collection are arriving soon. Browse our complete catalog in the meantime.'
              : `None of the items in this view match "${activeTag}". Try selecting another tag or clearing the filter.`
          }
          actionLabel={initialItems.length === 0 ? 'Explore All Products' : 'Show All Items in this Category'}
          actionHref={initialItems.length === 0 ? '/products' : undefined}
          onActionClick={initialItems.length > 0 ? () => setActiveTag('All') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedItems.map((product) => (
            <ConfigurableProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryViewClient;
