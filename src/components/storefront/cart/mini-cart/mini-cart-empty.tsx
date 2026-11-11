import * as React from 'react';
import { EmptyState } from '@/components/feedback/empty-state';
import { Button } from '@/components/ui/button';

export interface MiniCartEmptyProps {
  onClose: () => void;
}

/**
 * Renders empty catalog warnings inside the sliding drawer.
 */
export function MiniCartEmpty({ onClose }: MiniCartEmptyProps) {
  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4">
      <EmptyState
        title="Your cart is empty"
        description="Add items to your cart to start shopping."
        icon="ShoppingBag"
      >
        <Button
          onClick={onClose}
          className="mt-4 font-semibold text-xs cursor-pointer"
          size="sm"
        >
          Continue Shopping
        </Button>
      </EmptyState>
    </div>
  );
}
export default MiniCartEmpty;
