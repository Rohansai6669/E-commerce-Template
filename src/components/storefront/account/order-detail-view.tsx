'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { OrderPresenter } from '@/core/order/order.presenter';

export interface OrderDetailViewProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  order: any; // DB detailed order record
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_TIMELINE: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'We have received your order request.' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Your order is being reviewed and verified.' },
  { status: 'processing', label: 'Processing', desc: 'Items are being packaged at our facility.' },
  { status: 'shipped', label: 'Shipped', desc: 'Your package is on the way to your destination.' },
  { status: 'delivered', label: 'Delivered', desc: 'Package has been delivered successfully.' },
];

/**
 * Detailed order invoice status tracking view.
 */
export function OrderDetailView({ order }: OrderDetailViewProps) {
  const orderNumber = order.shippingAddress?.orderNumber || order.id.slice(0, 8).toUpperCase();
  const activeStatusIndex = STATUS_TIMELINE.findIndex((t) => t.status === order.status);

  return (
    <Stack gap="5" className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Heading level={2} className="text-base font-bold tracking-tight font-heading">
            Order Detail
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
            Tracking updates for invoice {OrderPresenter.formatOrderNumber(orderNumber)}.
          </Text>
        </div>
        <Button asChild variant="outline" size="sm" className="font-bold text-xs uppercase cursor-pointer shrink-0 sm:self-start">
          <Link href="/account/orders">
            <Icon name="ArrowLeft" className="h-4 w-4 mr-1.5" />
            Back to Orders
          </Link>
        </Button>
      </div>

      {/* Progress Timeline card */}
      {order.status !== 'cancelled' && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 border-b border-border bg-muted/10">
            <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
              Tracking Status
            </Heading>
          </CardHeader>
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
              {STATUS_TIMELINE.map((step, idx) => {
                const isPassed = idx <= activeStatusIndex;
                const isCurrent = idx === activeStatusIndex;

                return (
                  <div key={step.status} className="flex flex-1 flex-row md:flex-col gap-3 items-start relative w-full last:after:hidden">
                    {/* Connecting line */}
                    {idx < STATUS_TIMELINE.length - 1 && (
                      <div className={`hidden md:block absolute left-5 top-4 w-full h-0.5 -z-10 ${
                        idx < activeStatusIndex ? 'bg-primary' : 'bg-muted'
                      }`} />
                    )}

                    <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold ${
                      isPassed
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-muted bg-background text-muted-foreground'
                    }`}>
                      {isPassed && !isCurrent ? (
                        <Icon name="Check" className="h-4 w-4" />
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <Text className={`text-xs font-bold ${isPassed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.label}
                      </Text>
                      <Text className="text-[10px] text-muted-foreground mt-0.5 max-w-[140px] leading-tight hidden md:block">
                        {step.desc}
                      </Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Banner */}
      {order.status === 'cancelled' && (
        <Card className="border-destructive/20 bg-destructive/5 text-destructive p-4 flex gap-3 items-center">
          <Icon name="AlertTriangle" className="h-5 w-5 shrink-0" />
          <div>
            <Text className="text-xs font-bold">This order has been cancelled.</Text>
            <Text className="text-[10px] text-muted-foreground/80 mt-0.5">Please contact customer support for help.</Text>
          </div>
        </Card>
      )}

      {/* Invoice details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start w-full">
        {/* Left column: Address & payment */}
        <Stack gap="5" className="h-full justify-between">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 border-b border-border bg-muted/10">
              <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
                Shipping Address
              </Heading>
            </CardHeader>
            <CardContent className="p-4">
              <Text className="text-xs font-bold text-foreground">
                {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              </Text>
              <Text className="text-xs text-muted-foreground mt-1.5 whitespace-pre-line leading-relaxed">
                {order.shippingAddress?.addressLine1}
                {order.shippingAddress?.addressLine2 ? `\n${order.shippingAddress.addressLine2}` : ''}
                {`\n${order.shippingAddress?.city}, ${order.shippingAddress?.state} ${order.shippingAddress?.postalCode}`}
                {`\n${order.shippingAddress?.country}`}
              </Text>
              <Text className="text-xs text-muted-foreground mt-2 font-mono">
                {order.shippingAddress?.phone}
              </Text>
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 border-b border-border bg-muted/10">
              <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
                Order Summary
              </Heading>
            </CardHeader>
            <CardContent className="p-4 flex flex-col gap-2.5">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Placed On</span>
                <span className="text-foreground">{OrderPresenter.formatOrderDate(order.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Shipping Provider</span>
                <span className="text-foreground">{order.shippingMethod?.name || 'Standard Carrier'}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-muted-foreground">Status Updates</span>
                <span className="text-foreground uppercase text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {OrderPresenter.formatStatus(order.status)}
                </span>
              </div>
            </CardContent>
          </Card>
        </Stack>

        {/* Right column: Items & breakdown */}
        <Stack gap="5">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 border-b border-border bg-muted/10">
              <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
                Items Purchased
              </Heading>
            </CardHeader>
            <CardContent className="p-4 divide-y divide-border/60">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="h-10 w-8 bg-muted rounded border border-border shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <Icon name="Package" className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text className="text-xs font-semibold text-foreground line-clamp-1">{item.name}</Text>
                    <Text className="text-[10px] text-muted-foreground">Qty: {item.quantity}</Text>
                  </div>
                  <Text className="text-xs font-bold text-foreground shrink-0">
                    {OrderPresenter.formatCurrency(parseFloat(item.price) * item.quantity)}
                  </Text>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 border-b border-border bg-muted/10">
              <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
                Pricing
              </Heading>
            </CardHeader>
            <CardContent className="p-4">
              <Stack gap="2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{OrderPresenter.formatCurrency(parseFloat(order.subtotal))}</span>
                </div>
                {parseFloat(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-xs font-semibold text-emerald-600">
                    <span>Discount</span>
                    <span>-{OrderPresenter.formatCurrency(parseFloat(order.discountAmount))}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>
                    {parseFloat(order.shippingAmount) === 0 ? 'Free' : OrderPresenter.formatCurrency(parseFloat(order.shippingAmount))}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{OrderPresenter.formatCurrency(parseFloat(order.taxAmount))}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm font-extrabold">
                  <span className="font-heading">Total Amount</span>
                  <span className="font-heading font-extrabold">{OrderPresenter.formatCurrency(parseFloat(order.totalAmount))}</span>
                </div>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </div>
    </Stack>
  );
}
export default OrderDetailView;
