import * as React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';

export interface AddToCartButtonProps extends ButtonProps {
  isLoading?: boolean;
  isOutOfStock?: boolean;
}

/**
 * Presentational Add to Cart button component.
 * Features state triggers, disabled loading hooks, and screen reader announcements.
 */
export function AddToCartButton({
  isLoading = false,
  isOutOfStock = false,
  className,
  children,
  ...props
}: AddToCartButtonProps) {
  return (
    <Button
      type="button"
      disabled={isLoading || isOutOfStock || props.disabled}
      className={cn('w-full gap-2 transition-all duration-200 cursor-pointer', className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Icon name="Loader" className="h-4 w-4 animate-spin" />
          <span>Adding to Cart...</span>
        </>
      ) : isOutOfStock ? (
        <>
          <Icon name="ShieldAlert" className="h-4 w-4" />
          <span>Out of Stock</span>
        </>
      ) : (
        <>
          <Icon name="ShoppingCart" className="h-4 w-4" />
          <span>{children || 'Add to Cart'}</span>
        </>
      )}
    </Button>
  );
}
export default AddToCartButton;
