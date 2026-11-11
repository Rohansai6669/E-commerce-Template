'use client';

import * as React from 'react';
import Link from 'next/link';
import { ProductImage } from '@/components/commerce/product-image';
import { QuantitySelector } from '@/components/commerce/quantity-selector';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/typography';
import { CartPresenter } from '@/core/cart/cart.presenter';
import { type CartItem } from '@/core/cart/cart.types';

export interface MiniCartItemsProps {
  items: CartItem[];
  updateQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  onClose: () => void;
}

/**
 * Scrollable list rendering each product row in the Mini Cart.
 */
export function MiniCartItems({ items, updateQuantity, removeItem, onClose }: MiniCartItemsProps) {
  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border px-4">
      {items.map((item) => {
        const optionString = Object.entries(item.options)
          .map(([key, val]) => `${key}: ${val}`)
          .join(', ');

        return (
          <div key={item.key} className="flex gap-4 py-4 items-start">
            {/* Aspect bounding card photo preview */}
            <Link
              href={`/products/${item.slug}`}
              onClick={onClose}
              className="relative h-16 w-14 shrink-0 rounded border border-border bg-card overflow-hidden cursor-pointer"
            >
              <ProductImage src={item.imageUrl} alt={item.name} ratio="4/5" />
            </Link>

            {/* Title options and deletes details */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div className="flex items-start justify-between gap-1.5">
                <div>
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={onClose}
                    className="font-bold text-xs hover:text-primary transition-colors line-clamp-1 cursor-pointer"
                  >
                    {item.name}
                  </Link>
                  {optionString && (
                    <Text className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                      {optionString}
                    </Text>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.key)}
                  className="rounded-full h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                  aria-label="Remove item"
                >
                  <Icon name="Trash2" className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* Price total calculation and quantity change stepper */}
              <div className="flex items-center justify-between mt-3.5 gap-2">
                <QuantitySelector
                  value={item.quantity}
                  onValueChange={(val) => updateQuantity(item.key, val)}
                  min={1}
                  max={item.stockLimit}
                />
                <span className="text-xs font-bold text-foreground">
                  {CartPresenter.formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
export default MiniCartItems;
