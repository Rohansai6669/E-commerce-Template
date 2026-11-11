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
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Shipping Address
          </Heading>
          <button
            onClick={onEditAddress}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </CardHeader>
        <CardContent className="p-4">
          <Text className="text-sm text-foreground whitespace-pre-line leading-relaxed">
            {CheckoutPresenter.formatAddress(address)}
          </Text>
          <Text className="text-xs text-muted-foreground mt-2">{address.email} · {address.phone}</Text>
        </CardContent>
      </Card>

      {/* Shipping summary */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Shipping Method
          </Heading>
          <button
            onClick={onEditShipping}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
          >
            Edit
          </button>
        </CardHeader>
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <Text className="text-sm font-bold text-foreground">{shippingMethod.name}</Text>
            <Text className="text-xs text-muted-foreground">{shippingMethod.carrier} · {CheckoutPresenter.formatShippingEstimate(shippingMethod)}</Text>
          </div>
          <Text className="text-sm font-extrabold text-foreground">
            {CheckoutPresenter.formatShippingPrice(shippingMethod)}
          </Text>
        </CardContent>
      </Card>

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
              <Text className="text-sm font-bold text-foreground shrink-0">
                {CartPresenter.formatCurrency(item.price * item.quantity)}
              </Text>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order notes */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="p-4 border-b border-border bg-muted/10">
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Order Notes
          </Heading>
        </CardHeader>
        <CardContent className="p-4">
          <FormField description="Add any special instructions for your order.">
            <Textarea
              placeholder="Leave a note for us..."
              value={orderNotes}
              onChange={(e) => onOrderNotesChange(e.target.value)}
              rows={3}
            />
          </FormField>
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
              <div>
                <span className="text-muted-foreground block">Items Subtotal</span>
                <span className="text-[10px] text-muted-foreground font-normal">All taxes included</span>
              </div>
              <span className="text-foreground">{totals.formattedSubtotal}</span>
            </div>

            {coupon && (
              <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Coupon Applied ({coupon.code})</span>
                  <span className="font-mono text-sm">-{totals.formattedDiscount}</span>
                </div>
                {totals.discountBreakdown?.description && (
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80">
                    {totals.discountBreakdown.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold">
              <span className="text-muted-foreground">Shipping ({shippingMethod.name})</span>
              <span className="text-foreground">{totals.formattedShipping}</span>
            </div>

            {/* Detailed Tax Breakdown (Included in Price) */}
            {totals.isTaxInclusive && totals.taxBreakdown ? (
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1.5">
                <div className="flex justify-between items-center font-medium text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="font-semibold text-foreground">Estimated GST (18%)</span>
                    <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      Included in Price
                    </span>
                  </span>
                  <span className="font-semibold text-foreground font-mono">
                    {totals.taxBreakdown.formattedTaxAmount}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div>CGST (9%): <span className="font-mono text-foreground">{totals.taxBreakdown.formattedCgst}</span></div>
                  <div className="text-right">SGST (9%): <span className="font-mono text-foreground">{totals.taxBreakdown.formattedSgst}</span></div>
                </div>
                <div className="text-[10px] text-muted-foreground/80 flex justify-between pt-0.5">
                  <span>Taxable Base Value:</span>
                  <span className="font-mono">{totals.taxBreakdown.formattedTaxableBase}</span>
                </div>
              </div>
            ) : (
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-muted-foreground">Tax</span>
                <span className="text-foreground">{totals.formattedTax}</span>
              </div>
            )}

            <Separator />
            <div>
              <div className="flex justify-between text-base font-extrabold">
                <span className="text-foreground font-heading">Total Payable</span>
                <span className="text-foreground font-heading text-lg font-mono">{totals.formattedTotal}</span>
              </div>
              <span className="text-[11px] text-muted-foreground block text-right font-normal mt-0.5">
                Price includes all applicable taxes &amp; GST
              </span>
            </div>
          </Stack>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
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
          className="font-bold text-xs uppercase cursor-pointer"
        >
          Continue to Payment
        </Button>
      </div>
    </Stack>
  );
}
export default ReviewOrder;
