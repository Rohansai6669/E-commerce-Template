'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { type PlacedOrder } from '@/core/order/order.types';
import { OrderPresenter } from '@/core/order/order.presenter';
import { CheckoutPresenter } from '@/core/checkout/checkout.presenter';
import { CartPresenter } from '@/core/cart/cart.presenter';

export interface OrderConfirmationProps {
  order: PlacedOrder;
}

/**
 * Order confirmation step with order details, estimated delivery, and next actions.
 */
export function OrderConfirmation({ order }: OrderConfirmationProps) {
  return (
    <Stack gap="6" className="max-w-2xl mx-auto">
      {/* Success banner */}
      <div className="text-center py-6">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 mb-4">
          <Icon name="CheckCircle" className="h-8 w-8 text-emerald-500" />
        </div>
        <Heading level={1} className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
          Order Confirmed!
        </Heading>
        <Text className="text-sm text-muted-foreground mt-2">
          Thank you for your purchase. Your order {OrderPresenter.formatOrderNumber(order.orderNumber)} has been placed successfully.
        </Text>
      </div>

      {/* Order details */}
      <Card className="border-border bg-card shadow-sm">
        <CardContent className="p-5">
          <Stack gap="4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Number</Text>
                <Text className="text-sm font-extrabold text-foreground mt-0.5">{OrderPresenter.formatOrderNumber(order.orderNumber)}</Text>
              </div>
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Order Date</Text>
                <Text className="text-sm font-semibold text-foreground mt-0.5">{OrderPresenter.formatOrderDate(order.placedAt)}</Text>
              </div>
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Estimated Delivery</Text>
                <Text className="text-sm font-semibold text-foreground mt-0.5">{OrderPresenter.formatEstimatedDelivery(order.estimatedDelivery)}</Text>
              </div>
              <div>
                <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Payment</Text>
                <Text className="text-sm font-semibold text-foreground mt-0.5">{CheckoutPresenter.formatPaymentSummary(order.paymentMethod)}</Text>
              </div>
            </div>

            <Separator />

            {/* Order timeline placeholder */}
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <div className="w-px h-6 bg-muted-foreground/20" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
                <div className="w-px h-6 bg-muted-foreground/20" />
                <div className="h-3 w-3 rounded-full bg-muted-foreground/20" />
              </div>
              <div className="flex flex-col gap-3.5">
                <Text className="text-xs font-bold text-foreground">Order Placed</Text>
                <Text className="text-xs text-muted-foreground">Processing</Text>
                <Text className="text-xs text-muted-foreground">Delivered</Text>
              </div>
            </div>

            <Separator />

            {/* Shipping address */}
            <div>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Shipping To</Text>
              <Text className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                {CheckoutPresenter.formatAddress(order.address)}
              </Text>
            </div>

            <Separator />

            {/* Items */}
            <div>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Items ({order.items.length})</Text>
              <div className="divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
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
                      {CartPresenter.formatCurrency(item.price * item.quantity)}
                    </Text>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing totals */}
            <Stack gap="2">
              <div className="flex justify-between text-xs font-semibold">
                <div>
                  <span className="text-muted-foreground block">Items Subtotal</span>
                  <span className="text-[10px] text-muted-foreground font-normal">All taxes included</span>
                </div>
                <span>{OrderPresenter.formatCurrency(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-xs font-semibold text-emerald-600">
                  <span>Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>-{OrderPresenter.formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : OrderPresenter.formatCurrency(order.shipping)}</span>
              </div>
              
              {/* Included Tax Breakdown */}
              {order.tax > 0 && (
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span>GST (18%)</span>
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Included in Subtotal
                      </span>
                    </span>
                    <span className="font-semibold text-foreground font-mono">
                      {OrderPresenter.formatCurrency(order.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-0.5">
                    <span>CGST (9%): {OrderPresenter.formatCurrency(order.tax / 2)}</span>
                    <span>SGST (9%): {OrderPresenter.formatCurrency(order.tax / 2)}</span>
                  </div>
                </div>
              )}

              <Separator />
              <div>
                <div className="flex justify-between text-sm font-extrabold">
                  <span className="font-heading">Total Paid</span>
                  <span className="font-heading text-base font-mono">{OrderPresenter.formatCurrency(order.total)}</span>
                </div>
                <span className="text-[10px] text-muted-foreground block text-right font-normal mt-0.5">
                  Inclusive of all taxes &amp; GST
                </span>
              </div>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button asChild className="w-full sm:w-auto font-bold text-xs uppercase cursor-pointer">
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline" className="w-full sm:w-auto font-bold text-xs uppercase cursor-pointer">
          <Link href="mailto:support@storefront.com">Contact Support</Link>
        </Button>
      </div>
    </Stack>
  );
}
export default OrderConfirmation;
