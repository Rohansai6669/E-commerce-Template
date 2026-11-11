'use client';

import * as React from 'react';
import { RecentlyViewedService } from '@/core/product/recently-viewed.service';
import { getProductsBySlugsAction } from '@/app/actions/products';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';
import { Icon } from '@/components/ui/icon';
import { ConfigurableProductCard } from '@/components/commerce/configurable-product-card';
import { Stack } from '@/components/layout/stack';

/**
 * RecentlyViewedSection fetches product details dynamically on client mount.
 */
export function RecentlyViewedSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecentlyViewed = async () => {
      const slugs = RecentlyViewedService.get();
      if (slugs.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        const fetched = await getProductsBySlugsAction(slugs);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fetchedList = fetched as any[];
        
        // Sort according to local storage order
        const sorted = slugs
          .map((slug) => fetchedList.find((f) => f?.product?.slug === slug))
          .filter(Boolean);

        setProducts(sorted);
      } catch (err) {
        console.warn('Failed to load recently viewed products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, []);

  if (isLoading) {
    return (
      <Container className="py-8 border-t border-border mt-12 w-full">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-muted rounded" />
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Container className="py-8 border-t border-border mt-12 w-full">
      <div className="flex flex-row items-center justify-between gap-4 mb-6">
        <div>
          <Heading level={2} className="text-base sm:text-lg font-bold tracking-tight font-heading">
            Recently Viewed
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
            Products you recently browsed.
          </Text>
        </div>
        <button
          onClick={() => {
            RecentlyViewedService.clear();
            setProducts([]);
          }}
          className="text-xs font-bold text-muted-foreground hover:text-destructive transition-colors cursor-pointer flex items-center gap-1"
        >
          <Icon name="Trash2" className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-4 sm:gap-6 items-stretch w-full">
        {products.map((item) => (
          <div
            key={item.product.id}
            className="w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] min-w-[150px] max-w-[280px]"
          >
            <ConfigurableProductCard
              product={{
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                price:
                  typeof item.product.price === 'string'
                    ? parseFloat(item.product.price)
                    : item.product.price,
                compareAtPrice: item.product.compareAtPrice
                  ? typeof item.product.compareAtPrice === 'string'
                    ? parseFloat(item.product.compareAtPrice)
                    : item.product.compareAtPrice
                  : undefined,
                category: item.product.categoryName ?? undefined,
                rating: item.product.rating ?? undefined,
                reviewCount: item.product.reviewsCount,
                images: item.product.imageUrl ? [item.product.imageUrl] : [],
                badges: item.product.isNew ? ['NEW'] : [],
                inStock: item.product.quantity > 0,
              }}
            />
          </div>
        ))}
      </div>
    </Container>
  );
}
export default RecentlyViewedSection;
