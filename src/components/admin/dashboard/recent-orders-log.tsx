import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface OrderItem {
  id: string;
  totalAmount: string;
  status: string;
  createdAt: Date;
  shippingAddress: any;
}

interface RecentOrdersLogProps {
  orders: OrderItem[];
}

export function RecentOrdersLog({ orders }: RecentOrdersLogProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-heading">
            Recent Orders
          </h3>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline"
          >
            View all orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-sm text-slate-450 py-6 text-center select-none">
            No orders have been submitted yet.
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.slice(0, 8).map((order) => {
              const orderNum = order.shippingAddress?.orderNumber || order.id.slice(0, 12).toUpperCase();
              const formattedDate = new Date(order.createdAt).toLocaleDateString();
              const formattedPrice = parseFloat(order.totalAmount).toLocaleString('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              });

              return (
                <div
                  key={order.id}
                  className="flex justify-between items-center text-sm border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-slate-900 font-mono">
                      {orderNum}
                    </span>
                    <span className="text-xs text-slate-450">
                      {order.shippingAddress?.email || 'customer@lexido.demo'} • {formattedDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={cn(
                        "px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider",
                        order.status === 'delivered' || order.status === 'confirmed'
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {order.status || 'CONFIRMED'}
                    </span>
                    <span className="font-bold text-slate-950">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { cn } from '@/core/utils/cn';
