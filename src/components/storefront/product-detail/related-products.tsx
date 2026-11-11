'use client';

import * as React from 'react';
import { ProductCard } from '@/components/commerce/product-card';
import { ProductGrid } from '../product-grid';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { type ProductCardModel } from '@/core/product/product.types';

export interface RelatedProductsProps {
  products: ProductCardModel[];
}

/**
 * recommendations grid recommended under the same category context.
 */
export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <Stack gap="5" className="w-full">
      <Stack gap="2">
        <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
          Recommended Products
        </Heading>
        <Text className="text-xs sm:text-sm text-muted-foreground font-sans">
          Customers who viewed this item also checked these matches.
        </Text>
      </Stack>

      <div className="flex flex-wrap gap-4 sm:gap-6 items-stretch w-full">
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] min-w-[150px] max-w-[320px] flex-1"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </Stack>
  );
}
export default RelatedProducts;
