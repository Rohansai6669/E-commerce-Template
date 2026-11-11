'use client';

import * as React from 'react';
import { useProductCard } from './product-card';
import { cn } from '@/core/utils/cn';

export interface ProductCardBadgesProps {
  className?: string;
}

export function ProductCardBadges({ className }: ProductCardBadgesProps) {
  const { product } = useProductCard();

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  return (
    <div className={cn('absolute top-3 left-3 flex flex-col gap-1.5 z-10 pointer-events-none', className)}>
      {!product.inStock && (
        <span className="rounded-md bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
          Sold Out
        </span>
      )}
      {product.inStock && discountPercent && (
        <span className="rounded-md bg-destructive px-2 py-0.5 text-[10px] font-bold text-destructive-foreground uppercase tracking-wider shadow-sm">
          -{discountPercent}%
        </span>
      )}
      {product.inStock &&
        product.badges?.map((badge, i) => (
          <span
            key={i}
            className="rounded-md bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm"
          >
            {badge}
          </span>
        ))}
    </div>
  );
}

export default ProductCardBadges;
