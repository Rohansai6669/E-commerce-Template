'use client';

import * as React from 'react';
import { useProductCard } from './product-card';
import { formatPrice } from '@/core/pricing/format-price';
import { cn } from '@/core/utils/cn';

export interface ProductCardPriceProps {
  className?: string;
  showCompareAt?: boolean;
}

export function ProductCardPrice({ className, showCompareAt = true }: ProductCardPriceProps) {
  const { product } = useProductCard();

  return (
    <div className={cn('flex items-baseline gap-2 pt-0.5', className)}>
      <span className="text-sm sm:text-base font-bold text-foreground tracking-tight">
        {formatPrice(product.price)}
      </span>
      {showCompareAt && product.compareAtPrice && product.compareAtPrice > product.price && (
        <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
          {formatPrice(product.compareAtPrice)}
        </span>
      )}
    </div>
  );
}

export default ProductCardPrice;
