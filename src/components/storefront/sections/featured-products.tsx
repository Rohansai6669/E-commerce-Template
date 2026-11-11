'use client';

import * as React from 'react';
import { ConfigurableProductCard } from '@/components/commerce/configurable-product-card';
import { ProductGrid } from '../product-grid';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Stack } from '@/components/layout/stack';
import { Heading, Text } from '@/components/ui/typography';
import { type ProductCardModel } from '@/core/product/product.types';

export interface FeaturedProductsProps {
  products: ProductCardModel[];
}

/**
 * Featured catalog cards section.
 */
export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <Section>
      <Container>
        <Stack gap="8">
          <Stack gap="2">
            <Heading level={2} className="text-xl md:text-2xl font-bold tracking-tight font-heading">
              Featured Products
            </Heading>
            <Text className="text-sm text-muted-foreground">
              Discover our latest and highest rated items selected just for you.
            </Text>
          </Stack>

          <ProductGrid cols="1" colsSm="2" colsMd="3" colsLg="4" gap="6">
            {products.map((p) => (
              <ConfigurableProductCard
                key={p.id}
                product={{
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
                  compareAtPrice: p.compareAtPrice ? (typeof p.compareAtPrice === 'string' ? parseFloat(p.compareAtPrice) : p.compareAtPrice) : undefined,
                  category: p.categoryName ?? undefined,
                  rating: p.rating ?? undefined,
                  reviewCount: p.reviewsCount,
                  images: p.imageUrl ? [p.imageUrl] : [],
                  badges: p.isNew ? ['NEW'] : [],
                  inStock: p.quantity > 0,
                }}
              />
            ))}
          </ProductGrid>
        </Stack>
      </Container>
    </Section>
  );
}
export default FeaturedProducts;
