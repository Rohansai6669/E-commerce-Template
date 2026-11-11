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

      <ProductGrid cols="1" colsSm="2" colsMd="4" gap="6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ProductGrid>
    </Stack>
  );
}
export default RelatedProducts;
