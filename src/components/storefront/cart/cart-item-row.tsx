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

export interface CartItemRowProps {
  item: CartItem;
  updateQuantity: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
}

/**
 * Renders an item row inside the full Cart details page listing.
 */
export function CartItemRow({ item, updateQuantity, removeItem }: CartItemRowProps) {
  const optionString = Object.entries(item.options)
    .map(([key, val]) => `${key}: ${val}`)
    .join(', ');

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-5 border-b border-border last:border-0">
      <div className="flex gap-4 items-start w-full sm:w-auto">
        {/* Visual frame preview */}
        <Link
          href={`/products/${item.slug}`}
          className="relative h-20 w-16 shrink-0 rounded border border-border bg-card overflow-hidden cursor-pointer"
        >
          <ProductImage src={item.imageUrl} alt={item.name} ratio="4/5" />
        </Link>

        {/* Product title details */}
        <div className="min-w-0 flex-1">
          <Link
            href={`/products/${item.slug}`}
            className="font-bold text-sm sm:text-base hover:text-primary transition-colors line-clamp-2 cursor-pointer"
          >
            {item.name}
          </Link>
          {optionString && (
            <Text className="text-xs font-semibold text-muted-foreground mt-1.5">
              {optionString}
            </Text>
          )}
          <span className="inline-block sm:hidden text-sm font-semibold mt-2 text-foreground">
            {CartPresenter.formatCurrency(item.price)}
          </span>
        </div>
      </div>

      {/* Steppers, subtotals, and actions */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 pl-20 sm:pl-0">
        <span className="hidden sm:inline text-sm font-bold text-foreground w-20 text-center select-none">
          {CartPresenter.formatCurrency(item.price)}
        </span>

        <QuantitySelector
          value={item.quantity}
          onValueChange={(val) => updateQuantity(item.key, val)}
          min={1}
          max={item.stockLimit}
        />

        <span className="text-sm font-extrabold text-foreground w-24 text-right">
          {CartPresenter.formatCurrency(item.price * item.quantity)}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeItem(item.key)}
          className="rounded-full h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
          aria-label="Remove item"
        >
          <Icon name="Trash2" className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
export default CartItemRow;
