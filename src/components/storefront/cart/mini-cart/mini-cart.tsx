'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useCart } from '@/components/commerce/cart-context';
import { MiniCartHeader } from './mini-cart-header';
import { MiniCartEmpty } from './mini-cart-empty';
import { MiniCartItems } from './mini-cart-items';
import { MiniCartFooter } from './mini-cart-footer';
import { cn } from '@/core/utils/cn';

export interface MiniCartProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-over Cart preview Drawer using Radix UI Dialog primitives.
 */
export function MiniCart({ isOpen, onOpenChange }: MiniCartProps) {
  const { items, summary, updateQuantity, removeItem, isHydrated } = useCart();
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const handleClose = () => onOpenChange(false);

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay backdrop */}
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[1030] bg-black/60 transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        {/* Sliding Panel */}
        <DialogPrimitive.Content
          className={cn(
            'fixed inset-y-0 right-0 z-[1040] w-full max-w-md bg-card shadow-2xl flex flex-col focus:outline-none border-l border-border transition-all duration-300 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right'
          )}
        >
          <DialogPrimitive.Title className="sr-only">Shopping Cart Drawer</DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">Lists your selected items and subtotals</DialogPrimitive.Description>
          
          <MiniCartHeader itemCount={itemCount} onClose={handleClose} />

          {!isHydrated || items.length === 0 ? (
            <MiniCartEmpty onClose={handleClose} />
          ) : (
            <>
              <MiniCartItems
                items={items}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                onClose={handleClose}
              />
              <MiniCartFooter summary={summary} onClose={handleClose} />
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export default MiniCart;
