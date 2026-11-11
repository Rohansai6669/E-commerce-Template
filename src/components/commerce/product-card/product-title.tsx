'use client';

import * as React from 'react';
import Link from 'next/link';
import { useProductCard } from './product-card';
import { cn } from '@/core/utils/cn';

export interface ProductCardTitleProps extends React.HTMLAttributes<HTMLDivElement> {
  showCategory?: boolean;
}

export function ProductCardTitle({ className, showCategory = true, ...props }: ProductCardTitleProps) {
  const { product } = useProductCard();

  return (
    <div className={cn('space-y-1', className)} {...props}>
      {showCategory && product.category && (
        <p className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          {product.category}
        </p>
      )}
      <Link
        href={`/products/${product.slug}`}
        className="text-xs sm:text-sm font-semibold tracking-tight text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug block font-sans"
      >
        {product.name}
      </Link>
    </div>
  );
}

export default ProductCardTitle;
