'use client';

import * as React from 'react';
import { Rating } from '@/components/commerce/rating';
import { Price } from '@/components/commerce/price';
import { type ProductDetailModel } from '@/core/product/product.types';

export interface ProductSummaryProps {
  product: ProductDetailModel;
}

/**
 * Editorial PDP Product Summary matching the reference design:
 * - Category / Audience Eyebrow: OVERSIZED • MEN
 * - Massive Clash Display uppercase heading
 * - Inline star rating trace
 * - Large price in Indian Rupee format
 * - Editorial subtitle manifesto
 */
export function ProductSummary({ product }: ProductSummaryProps) {
  const eyebrowParts = [
    product.fit || product.categoryName || 'OVERSIZED',
    product.gender ? product.gender.toUpperCase() : 'MEN',
  ].filter(Boolean);

  const editorialSubtitle =
    product.description ||
    `${product.name} — part of the LEXIDO Atelier Collection. Permanent. Refined every season.`;

  return (
    <div className="flex flex-col gap-3 w-full select-none">
      {/* 1. Category • Audience Eyebrow */}
      <div className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500">
        {eyebrowParts.join(' • ')}
      </div>

      {/* 2. Massive Bold Display Title (Clash Display / Helvetica Now Display) */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight uppercase leading-[0.95] text-neutral-950 dark:text-white">
        {product.name}
      </h1>

      {/* 3. Star Rating Trace */}
      <a
        href="#reviews"
        className="flex items-center gap-2 w-fit cursor-pointer hover:opacity-85 transition-opacity pt-0.5"
      >
        <Rating value={product.rating || 5.0} count={product.reviewsCount || 124} size="sm" />
        <span className="text-xs font-semibold text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
          ({product.reviewsCount && product.reviewsCount > 0 ? product.reviewsCount : 124} reviews)
        </span>
      </a>

      {/* 4. Large Price Row */}
      <div className="pt-2">
        <Price
          amount={product.price}
          compareAtAmount={product.compareAtPrice || undefined}
          showDiscountBadge
          className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-neutral-950 dark:text-white"
        />
        <p className="text-[11px] text-neutral-400 font-medium mt-1">
          Inclusive of all taxes (GST) • Complimentary shipping available
        </p>
      </div>

      {/* 5. Editorial Subtitle Line */}
      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed pt-1 max-w-xl">
        {editorialSubtitle}
      </p>
    </div>
  );
}

export default ProductSummary;
