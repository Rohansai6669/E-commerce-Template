import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/core/utils/cn';

const stockBadgeVariants = cva(
  'inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        inStock: 'bg-stock-in/10 text-stock-in',
        lowStock: 'bg-stock-low/10 text-stock-low',
        outOfStock: 'bg-stock-out/10 text-stock-out',
        preOrder: 'bg-accent text-accent-foreground border border-border',
      },
    },
    defaultVariants: {
      variant: 'inStock',
    },
  }
);

export interface StockBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  quantity?: number;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
}

/**
 * Stock availability badge mapping count parameters to design tokens.
 * Supports inventory counts, threshold triggers, and pre-orders.
 */
export function StockBadge({
  quantity,
  lowStockThreshold = 5,
  allowBackorder = false,
  className,
  ...props
}: StockBadgeProps) {
  let label = 'In Stock';
  let variant: VariantProps<typeof stockBadgeVariants>['variant'] = 'inStock';

  if (quantity === undefined) {
    label = 'In Stock';
    variant = 'inStock';
  } else if (quantity <= 0) {
    if (allowBackorder) {
      label = 'Pre-Order';
      variant = 'preOrder';
    } else {
      label = 'Out of Stock';
      variant = 'outOfStock';
    }
  } else if (quantity <= lowStockThreshold) {
    label = `Only ${quantity} left`;
    variant = 'lowStock';
  } else {
    label = 'In Stock';
    variant = 'inStock';
  }

  return (
    <span className={cn(stockBadgeVariants({ variant }), className)} {...props}>
      {label}
    </span>
  );
}
export default StockBadge;
