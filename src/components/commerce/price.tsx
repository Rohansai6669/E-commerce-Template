import * as React from 'react';
import { formatPrice, type FormatPriceOptions } from '@/core/pricing/format-price';
import { calculateDiscountPercentage } from '@/core/pricing/calculate-discount';
import { cn } from '@/core/utils/cn';

export interface PriceProps extends React.HTMLAttributes<HTMLDivElement> {
  amount: number | string;
  compareAtAmount?: number | string; // Original non-discounted base price
  options?: FormatPriceOptions;
  showDiscountBadge?: boolean;
}

/**
 * Price renderer presenting formatted currencies.
 * Generates strikethroughs and percentage discount tags while maintaining WCAG reader semantics.
 */
export function Price({
  amount,
  compareAtAmount,
  options,
  showDiscountBadge = false,
  className,
  ...props
}: PriceProps) {
  const isSale = !!(
    compareAtAmount &&
    parseFloat(compareAtAmount.toString()) > parseFloat(amount.toString())
  );

  const formattedPrice = formatPrice(amount, options);
  const formattedComparePrice = isSale ? formatPrice(compareAtAmount, options) : null;
  const discountPercent = isSale ? calculateDiscountPercentage(compareAtAmount, amount) : 0;

  return (
    <div className={cn('flex items-center gap-1.5 font-sans', className)} {...props}>
      {isSale ? (
        <>
          <span className="sr-only">Sale Price:</span>
          <span className="font-semibold text-sale">{formattedPrice}</span>

          <span className="sr-only">Original Price was:</span>
          <span className="text-sm text-muted-foreground line-through decoration-muted-foreground/60">
            {formattedComparePrice}
          </span>

          {showDiscountBadge && discountPercent > 0 && (
            <span className="rounded bg-sale/10 px-1.5 py-0.5 text-xs font-semibold text-sale animate-pulse">
              -{discountPercent}%
            </span>
          )}
        </>
      ) : (
        <>
          <span className="sr-only">Price:</span>
          <span className="font-semibold text-price">{formattedPrice}</span>
        </>
      )}
    </div>
  );
}
export default Price;
