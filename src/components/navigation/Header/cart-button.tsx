'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/components/commerce/cart-context';
import { MiniCart } from '@/components/storefront/cart/mini-cart/mini-cart';
import { cn } from '@/core/utils/cn';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export interface CartButtonProps {
  badgeBgColor?: string;
  badgeTextColor?: string;
  className?: string;
}

/**
 * Presentational Cart link button displaying item count alerts with customizable badge styling.
 */
export function CartButton({ badgeBgColor, badgeTextColor, className }: CartButtonProps) {
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const { items } = useCart();
  const [isOpen, setIsOpen] = React.useState(false);

  const itemCount = isClient ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          'relative rounded-full h-9 w-9 border-border bg-background hover:bg-accent text-foreground cursor-pointer',
          className
        )}
        aria-label={`Open shopping cart drawer with ${itemCount} items`}
      >
        <Icon name="ShoppingBag" className="h-4 w-4" />
        {itemCount > 0 && (
          <span
            style={{
              backgroundColor: badgeBgColor || undefined,
              color: badgeTextColor || undefined,
            }}
            className={cn(
              'absolute -top-1.5 -right-1.5 flex min-w-4 h-4 px-1 items-center justify-center rounded-full text-[9px] font-bold leading-none pointer-events-none shadow-xs z-10',
              !badgeBgColor && 'bg-primary text-primary-foreground'
            )}
          >
            {itemCount > 99 ? '99+' : itemCount}
          </span>
        )}
      </Button>

      <MiniCart isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
export default CartButton;
