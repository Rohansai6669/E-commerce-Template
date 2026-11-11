'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { OrderPresenter } from '@/core/order/order.presenter';

export interface OrdersListProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  orders: any[]; // DB order schema type
}

/**
 * Customer order history list table.
 */
export function OrdersList({ orders }: OrdersListProps) {
  if (orders.length === 0) {
    return (
      <Card className="border-border bg-card shadow-xs text-center py-12 w-full">
        <CardContent className="flex flex-col items-center justify-center">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-4">
            <Icon name="Package" className="h-6 w-6" />
          </div>
          <Heading level={3} className="text-sm font-bold text-foreground">No orders placed yet.</Heading>
          <Text className="text-xs text-muted-foreground mt-1 max-w-xs">
            Once you complete a purchase, your order history records will appear here.
          </Text>
          <Button asChild size="sm" className="mt-4 font-semibold text-xs cursor-pointer">
            <Link href="/products">Browse Products</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card shadow-xs overflow-hidden w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/80 bg-muted/20">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5">Order ID</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5">Date</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-3.5 text-right">Total</TableHead>
              <TableHead className="py-3.5"><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/60">
            {orders.map((order) => {
              const statusClass: Record<string, string> = {
                pending: 'bg-yellow-500/10 text-yellow-600',
                processing: 'bg-blue-500/10 text-blue-600',
                shipped: 'bg-indigo-500/10 text-indigo-600',
                delivered: 'bg-emerald-500/10 text-emerald-600',
                cancelled: 'bg-destructive/10 text-destructive',
              };

              return (
                <TableRow key={order.id} className="hover:bg-muted/10">
                  <TableCell className="py-3 text-xs font-extrabold text-foreground font-mono">
                    #{order.shippingAddress?.orderNumber || order.id.slice(0, 8).toUpperCase()}
                  </TableCell>
                  <TableCell className="py-3 text-xs font-semibold text-muted-foreground font-sans">
                    {OrderPresenter.formatOrderDate(order.createdAt)}
                  </TableCell>
                  <TableCell className="py-3">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                      statusClass[order.status] || 'bg-muted text-muted-foreground'
                    }`}>
                      {OrderPresenter.formatStatus(order.status)}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 text-xs font-extrabold text-foreground text-right font-mono">
                    {OrderPresenter.formatCurrency(parseFloat(order.totalAmount))}
                  </TableCell>
                  <TableCell className="py-3 text-right">
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center justify-end gap-1.5 cursor-pointer"
                    >
                      <span>Details</span>
                      <Icon name="ArrowRight" className="h-3.5 w-3.5" />
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
export default OrdersList;
