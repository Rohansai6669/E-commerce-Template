'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { normalizeProduct, UnifiedProduct } from '../product-adapter';
import { ConfigurableProductCard } from '../configurable-product-card';

export type CatalogProduct = any;

export interface ProductCardContextValue {
  product: UnifiedProduct;
}

export const ProductCardContext = React.createContext<ProductCardContextValue | null>(null);

export function useProductCard() {
  const context = React.useContext(ProductCardContext);
  if (!context) {
    throw new Error('ProductCard compound components must be rendered inside a <ProductCard> container');
  }
  return context;
}

export interface ProductCardProps extends React.HTMLAttributes<HTMLDivElement> {
  product: any;
}

/**
 * Unified container for e-commerce product cards.
 * Can be used as a standalone component <ProductCard product={product} />
 * or as a compound container <ProductCard product={product}>{children}</ProductCard>.
 */
export function ProductCard({ product: rawProduct, className, children, ...props }: ProductCardProps) {
  const product = normalizeProduct(rawProduct);

  if (!children) {
    return <ConfigurableProductCard product={product} className={className} />;
  }

  return (
    <ProductCardContext.Provider value={{ product }}>
      <div
        className={cn(
          'group relative rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-card text-card-foreground overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full',
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ProductCardContext.Provider>
  );
}

export default ProductCard;
