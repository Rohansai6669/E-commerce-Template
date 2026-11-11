'use client';

import * as React from 'react';
import { updateOrderStatusAction } from '@/app/actions/admin-actions';
import { toast } from 'sonner';

export interface OrderStatusSelectorProps {
  orderId: string;
  initialStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
}

/**
 * Dropdown selector to change order status in real time.
 */
export function OrderStatusSelector({ orderId, initialStatus }: OrderStatusSelectorProps) {
  const [status, setStatus] = React.useState(initialStatus);
  const [isPending, startTransition] = React.useTransition();

  const handleStatusChange = (newStatus: typeof initialStatus) => {
    setStatus(newStatus);
    startTransition(async () => {
      const res = await updateOrderStatusAction(orderId, newStatus);
      if (res.success) {
        toast.success(`Order status updated to ${newStatus}.`);
      } else {
        toast.error(res.error || 'Failed to update order status.');
        setStatus(initialStatus); // Revert state on error
      }
    });
  };

  const options = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'] as const;

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => handleStatusChange(e.target.value as any)}
      className="px-2 py-1 text-xs bg-slate-900 border border-slate-800 rounded text-slate-200 focus:outline-none focus:border-primary disabled:opacity-50 font-semibold uppercase cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-slate-950 text-slate-100">
          {opt}
        </option>
      ))}
    </select>
  );
}
export default OrderStatusSelector;
