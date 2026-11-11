'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useCart } from '@/components/commerce/cart-context';
import { MiniCart } from '@/components/storefront/cart/mini-cart/mini-cart';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * Presentational Cart link button displaying item count alerts.
 */
export function CartButton() {
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
        className="relative rounded-full h-9 w-9 border-border bg-background hover:bg-accent text-foreground cursor-pointer"
        aria-label={`Open shopping cart drawer with ${itemCount} items`}
      >
        <Icon name="ShoppingBag" className="h-4 w-4" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {itemCount}
          </span>
        )}
      </Button>

      <MiniCart isOpen={isOpen} onOpenChange={setIsOpen} />
    </>
  );
}
export default CartButton;
