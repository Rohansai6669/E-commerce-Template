import * as React from 'react';
import { Icon } from '@/components/ui/icon';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/core/utils/cn';

export interface WishlistButtonProps extends Omit<ButtonProps, 'onClick'> {
  isFavorited: boolean;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isLoading?: boolean;
}

/**
 * Presentational wishlist toggle button.
 * Accessible with focus outlines and dynamic labels.
 */
export function WishlistButton({
  isFavorited,
  onClick,
  isLoading = false,
  className,
  ...props
}: WishlistButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onClick}
      disabled={isLoading || props.disabled}
      className={cn(
        'rounded-full bg-background/85 backdrop-blur-sm border-border hover:bg-background transition-all duration-250 shadow-sm cursor-pointer',
        isFavorited ? 'text-rose-500 hover:text-rose-600' : 'text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label={isFavorited ? 'Remove this item from wishlist' : 'Add this item to wishlist'}
      {...props}
    >
      {isLoading ? (
        <Icon name="Loader" className="h-4 w-4 animate-spin" />
      ) : (
        <Icon
          name="Heart"
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isFavorited ? 'fill-rose-500 stroke-rose-500 scale-105' : 'fill-transparent'
          )}
        />
      )}
    </Button>
  );
}
export default WishlistButton;
