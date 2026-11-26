'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { AdminOrderDetailView } from './admin-order-detail-view';
import { ShoppingBag } from 'lucide-react';

interface OrderDetailSheetProps {
  order: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeSuppliers?: { id: string; name: string; status: string }[];
  mappedLinks?: { id: string; productId: string; supplierId: string }[];
  onStatusChange?: (orderId: string, currentStatus: string, newStatus: string) => void;
  onShiprocketDispatch?: (orderId: string) => void;
  isShipping?: boolean;
  isPending?: boolean;
}

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  activeSuppliers,
  mappedLinks,
  onStatusChange,
  onShiprocketDispatch,
  isShipping,
  isPending,
}: OrderDetailSheetProps) {
  if (!order) return null;

  const orderNumber =
    order.orderNumber ||
    order.shippingAddress?.orderNumber ||
    `LX${new Date(order.createdAt).getTime().toString().slice(-10)}`;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[95vw] sm:max-w-2xl border-l border-slate-200 bg-white p-0 flex flex-col h-full shadow-2xl z-[1150]"
      >
        {/* Sticky Header Layout */}
        <div className="p-6 border-b border-slate-100 flex-shrink-0 bg-white">
          <SheetHeader className="mb-0">
            <SheetTitle className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2 font-heading uppercase">
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              <span>Order Details - {orderNumber}</span>
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500 font-sans">
              Comprehensive order items, customer coordinates, logistics dispatch, and financial profit breakdown.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          <AdminOrderDetailView
            order={order}
            activeSuppliers={activeSuppliers}
            mappedLinks={mappedLinks}
            onStatusChange={onStatusChange}
            onShiprocketDispatch={onShiprocketDispatch}
            isShipping={isShipping}
            isPending={isPending}
            onClose={() => onOpenChange(false)}
            isDrawer={true}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
export default OrderDetailSheet;
