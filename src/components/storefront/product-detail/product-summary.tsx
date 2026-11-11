import * as React from 'react';
import { Rating } from '@/components/commerce/rating';
import { Price } from '@/components/commerce/price';
import { Heading } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Separator } from '@/components/ui/separator';
import { type ProductDetailModel } from '@/core/product/product.types';

export interface ProductSummaryProps {
  product: ProductDetailModel;
}

/**
 * Summarizes product branding tags, titles, average stars, and promotional rates.
 */
export function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <Stack gap="4">
      {/* Brand & Category identifiers */}
      {(product.brandName || product.categoryName) && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {product.brandName && <span>{product.brandName}</span>}
          {product.brandName && product.categoryName && <span className="text-muted-foreground/30">•</span>}
          {product.categoryName && <span>{product.categoryName}</span>}
        </div>
      )}

      {/* Main product heading */}
      <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-heading">
        {product.name}
      </Heading>

      {/* Review trigger anchors */}
      {product.rating !== null && (
        <a href="#reviews" className="flex items-center gap-2 w-fit cursor-pointer hover:opacity-85 transition-opacity">
          <Rating value={product.rating} count={product.reviewsCount} size="sm" />
          <span className="text-xs font-semibold text-primary underline">
            View all reviews
          </span>
        </a>
      )}

      <Separator />

      {/* Formatting rates comparison details */}
      <div>
        <Price
          amount={product.price}
          compareAtAmount={product.compareAtPrice || undefined}
          showDiscountBadge
          className="text-2xl font-bold"
        />
        <p className="text-[11px] text-muted-foreground font-medium mt-1">
          Inclusive of all taxes (GST)
        </p>
      </div>
    </Stack>
  );
}
export default ProductSummary;
