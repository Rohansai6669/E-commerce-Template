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
        suppressHydrationWarning
        className={cn(
          'group relative bg-transparent text-foreground overflow-hidden flex flex-col h-full rounded-none transition-all duration-300',
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
