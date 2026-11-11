'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { useProductCard } from './product-card';
import { cn } from '@/core/utils/cn';

export interface ProductCardRatingProps {
  className?: string;
  showReviewCount?: boolean;
}

export function ProductCardRating({ className, showReviewCount = true }: ProductCardRatingProps) {
  const { product } = useProductCard();
  if (product.rating === undefined || product.rating === null) return null;

  return (
    <div className={cn('flex items-center gap-1.5 text-xs pt-0.5', className)}>
      <div className="flex items-center text-amber-400">
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      </div>
      <span className="font-bold text-xs text-foreground">{product.rating}</span>
      {showReviewCount && product.reviewCount !== undefined && (
        <span className="text-muted-foreground font-normal text-[11px]">
          ({product.reviewCount})
        </span>
      )}
    </div>
  );
}

export default ProductCardRating;
