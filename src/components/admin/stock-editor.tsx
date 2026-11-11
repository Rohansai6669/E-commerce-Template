'use client';

import * as React from 'react';
import { updateProductStockAction } from '@/app/actions/admin-actions';
import { toast } from 'sonner';

export interface StockEditorProps {
  productId: string;
  initialQuantity: number;
}

/**
 * Client Component handling inline stock quantity adjustments.
 */
export function StockEditor({ productId, initialQuantity }: StockEditorProps) {
  const [quantity, setQuantity] = React.useState(initialQuantity);
  const [isPending, startTransition] = React.useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      const res = await updateProductStockAction(productId, quantity);
      if (res.success) {
        toast.success('Stock inventory updated successfully.');
      } else {
        toast.error(res.error || 'Failed to update stock.');
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min="0"
        value={quantity}
        disabled={isPending}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
        className="w-20 px-2 py-1 text-sm bg-slate-900 border border-slate-800 rounded text-slate-100 text-center focus:outline-none focus:border-primary disabled:opacity-50"
      />
      <button
        type="button"
        disabled={isPending || quantity === initialQuantity}
        onClick={handleUpdate}
        className="px-3 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed select-none"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
}
export default StockEditor;
