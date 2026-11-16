'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Textarea } from '@/components/forms/textarea';
import { FormField } from '@/components/forms/form-field';
import { Icon } from '@/components/ui/icon';
import { Separator } from '@/components/ui/separator';
import { type CartItem, type Coupon } from '@/core/cart/cart.types';
import { type CheckoutAddress, type ShippingMethod, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { CheckoutPresenter } from '@/core/checkout/checkout.presenter';
import { CartPresenter } from '@/core/cart/cart.presenter';
import { CheckoutCoupon } from './checkout-coupon';
import { CheckCircle2, MapPin, Truck, FileText } from 'lucide-react';

export interface ReviewOrderProps {
  items: CartItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  coupon: Coupon | null;
  totals: CheckoutTotals;
  orderNotes: string;
  onOrderNotesChange: (notes: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  onEditAddress: () => void;
  onEditShipping: () => void;
  onApplyCoupon?: (coupon: Coupon) => void;
  onRemoveCoupon?: () => void;
}

/**
 * Order review step displaying full summary before payment.
 */
export function ReviewOrder({
  items,
  address,
  shippingMethod,
  coupon,
  totals,
  orderNotes,
  onOrderNotesChange,
  onSubmit,
  onBack,
  onEditAddress,
  onEditShipping,
  onApplyCoupon,
  onRemoveCoupon,
}: ReviewOrderProps) {
  return (
    <Stack gap="5">
      {/* Address summary */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
              Shipping Address
            </Heading>
          </div>
          <button
            type="button"
            onClick={onEditAddress}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </CardHeader>
        <CardContent className="p-4">
          <Text className="text-sm font-semibold text-foreground">
            {address.firstName} {address.lastName}
          </Text>
          <Text className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed mt-1">
            {CheckoutPresenter.formatAddress(address)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-2 font-mono">
            {address.email} · {address.phone}
          </Text>
        </CardContent>
      </Card>

      {/* Shipping summary */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
              Shipping Method
            </Heading>
          </div>
          <button
            type="button"
            onClick={onEditShipping}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <Text className="text-sm font-bold text-foreground">{shippingMethod.name}</Text>
            <Text className="text-xs text-muted-foreground">
              {shippingMethod.carrier} · {CheckoutPresenter.formatShippingEstimate(shippingMethod)}
            </Text>
          </div>
          <Text className="text-sm font-extrabold text-foreground font-mono">
            {CheckoutPresenter.formatShippingPrice(shippingMethod)}
          </Text>
        </CardContent>
      </Card>

      {/* Order notes */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-muted/10 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Delivery Instructions &amp; Notes
          </Heading>
        </CardHeader>
        <CardContent className="p-4">
          <FormField description="Optional special instructions for delivery or packaging.">
            <Textarea
              placeholder="e.g. Leave package with security guard, call before delivery..."
              value={orderNotes}
              onChange={(e) => onOrderNotesChange(e.target.value)}
              rows={3}
            />
          </FormField>
        </CardContent>
      </Card>

      {/* Mobile-only Items & Pricing fallback (when sidebar is not visible) */}
      <div className="lg:hidden space-y-4">
        {/* Items summary */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="p-4 border-b border-border bg-muted/10">
            <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
              Items ({items.length})
            </Heading>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-border">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-12 w-10 bg-muted rounded border border-border shrink-0 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <Icon name="Package" className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-foreground line-clamp-1">{item.name}</Text>
                  <Text className="text-xs text-muted-foreground">Qty: {item.quantity}</Text>
                </div>
                <Text className="text-sm font-bold text-foreground shrink-0 font-mono">
                  {CartPresenter.formatCurrency(item.price * item.quantity)}
                </Text>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Promo Code & Discounts Section */}
        {onApplyCoupon && onRemoveCoupon && (
          <CheckoutCoupon
            coupon={coupon}
            items={items}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />
        )}

        {/* Pricing breakdown */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader className="p-4 border-b border-border bg-muted/10">
            <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
              Order Total
            </Heading>
          </CardHeader>
          <CardContent className="p-4">
            <Stack gap="3">
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Items Subtotal</span>
                <span className="text-foreground font-mono">{totals.formattedSubtotal}</span>
              </div>

              {coupon && (
                <div className="p-2.5 rounded-none bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs flex justify-between items-center text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Coupon ({coupon.code})</span>
                  <span className="font-mono">-{totals.formattedDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Shipping ({shippingMethod.name})</span>
                <span className="text-foreground font-mono">{totals.formattedShipping}</span>
              </div>

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Taxes &amp; GST (18%)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-medium">Included in price</span>
              </div>

              <Separator />
              <div className="flex justify-between text-base font-extrabold">
                <span className="text-foreground font-heading">Total Payable</span>
                <span className="text-foreground font-heading text-lg font-mono">{totals.formattedTotal}</span>
              </div>
            </Stack>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="font-bold text-xs uppercase cursor-pointer"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="font-bold text-xs uppercase cursor-pointer bg-slate-950 hover:bg-slate-800 text-white"
        >
          Continue to Payment
        </Button>
      </div>
    </Stack>
  );
}
export default ReviewOrder;
