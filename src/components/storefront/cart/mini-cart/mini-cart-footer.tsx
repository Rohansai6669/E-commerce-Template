'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { type CartSummary } from '@/core/cart/cart.types';

export interface MiniCartFooterProps {
  summary: CartSummary;
  onClose: () => void;
}

/**
 * Slide-over drawer footer rendering calculated subtotals and action links.
 */
export function MiniCartFooter({ summary, onClose }: MiniCartFooterProps) {
  return (
    <div className="border-t border-border p-4 bg-card flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm select-none">
        <span className="font-semibold text-muted-foreground">Subtotal</span>
        <span className="font-bold text-foreground">{summary.formattedSubtotal}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-normal select-none">
        All taxes included in product prices. Shipping calculated at checkout.
      </p>

      <div className="flex flex-col gap-2 mt-1">
        <Button
          variant="outline"
          className="w-full font-semibold text-xs cursor-pointer border-border"
          asChild
          onClick={onClose}
        >
          <Link href="/cart">View Cart</Link>
        </Button>
        <Button
          className="w-full font-semibold text-xs cursor-pointer"
          asChild
          onClick={onClose}
        >
          <Link href="/checkout">Checkout</Link>
        </Button>
      </div>
    </div>
  );
}
export default MiniCartFooter;
