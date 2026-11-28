'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { type CartItem, type Coupon } from '@/core/cart/cart.types';
import { type ShippingMethod, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { CartPresenter } from '@/core/cart/cart.presenter';
import { CheckoutCoupon } from './checkout-coupon';
import { ShieldCheck, Truck, RotateCcw, Package, Tag } from 'lucide-react';
import { UpiLogo, VisaLogo, MastercardLogo, RuPayLogo, RazorpayIcon } from './payment-logos';

export interface CheckoutOrderSummaryProps {
  items: CartItem[];
  totals: CheckoutTotals | null;
  coupon: Coupon | null;
  shippingMethod: ShippingMethod | null;
  onApplyCoupon?: (coupon: Coupon) => void;
  onRemoveCoupon?: () => void;
  className?: string;
  hideCoupon?: boolean;
}

/**
 * Modern sticky order summary sidebar for checkout.
 * Displays item thumbnails, line-by-line pricing, promo codes, and trust badges.
 */
export function CheckoutOrderSummary({
  items,
  totals,
  coupon,
  shippingMethod,
  onApplyCoupon,
  onRemoveCoupon,
  className = '',
  hideCoupon = false,
}: CheckoutOrderSummaryProps) {
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Card className={`border-border bg-card shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <CardHeader className="p-4 sm:p-5 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
        <div>
          <Heading level={2} className="text-sm sm:text-base font-bold uppercase tracking-wider font-heading">
            Order Summary
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
          </Text>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {itemCount} {itemCount === 1 ? 'pc' : 'pcs'}
        </span>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-5">
        {/* Item List */}
        <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div key={item.key} className="flex items-center gap-3">
              {/* Thumbnail with Quantity Pill */}
              <div className="relative h-14 w-12 bg-muted rounded-none border border-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground" />
                )}
                <span className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-bold h-4 w-4 rounded-none flex items-center justify-center shadow-xs">
                  {item.quantity}
                </span>
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 min-w-0">
                <Text className="text-xs font-bold text-foreground truncate leading-tight">
                  {item.name}
                </Text>
                {item.options && Object.keys(item.options).length > 0 ? (
                  <Text className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {Object.entries(item.options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(' · ')}
                  </Text>
                ) : (
                  <Text className="text-[11px] text-muted-foreground mt-0.5">
                    Qty: {item.quantity}
                  </Text>
                )}
              </div>

              {/* Price */}
              <div className="text-right shrink-0">
                <span className="text-xs font-extrabold text-foreground font-mono">
                  {CartPresenter.formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Coupon Code Input */}
        {!hideCoupon && onApplyCoupon && onRemoveCoupon && (
          <div className="pt-2 border-t border-border/60">
            <CheckoutCoupon
              coupon={coupon}
              items={items}
              onApplyCoupon={onApplyCoupon}
              onRemoveCoupon={onRemoveCoupon}
              compact
            />
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="pt-2 border-t border-border/60 space-y-2.5 text-xs">
          {/* Subtotal */}
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-semibold text-foreground font-mono">
              {totals ? totals.formattedSubtotal : CartPresenter.formatCurrency(subtotal)}
            </span>
          </div>

          {/* Discount if applied */}
          {coupon && totals && totals.discount > 0 && (
            <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>Discount ({coupon.code})</span>
              </span>
              <span className="font-mono">-{totals.formattedDiscount}</span>
            </div>
          )}

          {/* Shipping */}
          <div className="flex justify-between items-center text-muted-foreground">
            <span>Shipping</span>
            {shippingMethod ? (
              <span className="font-semibold text-foreground font-mono">
                {shippingMethod.price === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                ) : (
                  `₹${shippingMethod.price.toFixed(2)}`
                )}
              </span>
            ) : totals ? (
              <span className="font-semibold text-foreground font-mono">
                {totals.shipping === 0 ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</span>
                ) : (
                  totals.formattedShipping
                )}
              </span>
            ) : (
              <span className="text-[11px] italic text-muted-foreground">
                Calculated at next step
              </span>
            )}
          </div>

          {/* Taxes */}
          <div className="flex justify-between items-center text-[11px] text-muted-foreground">
            <span>Taxes & GST (18%)</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">
              Included in price
            </span>
          </div>

          <Separator className="my-2" />

          {/* Total Payable */}
          <div className="flex justify-between items-baseline pt-0.5">
            <div>
              <span className="text-sm font-extrabold text-foreground uppercase tracking-wider font-heading block">
                Total
              </span>
              <span className="text-[10px] text-muted-foreground">
                Including all applicable taxes
              </span>
            </div>
            <span className="text-lg font-black text-foreground font-mono tracking-tight">
              {totals
                ? totals.formattedTotal
                : CartPresenter.formatCurrency(
                    subtotal + (shippingMethod?.price ?? 0)
                  )}
            </span>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-4 border-t border-border/60 grid grid-cols-3 gap-2 text-center text-[10px] text-muted-foreground">
          <div className="flex flex-col items-center gap-1 p-2 rounded-none bg-muted/20">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium leading-tight">256-Bit SSL Secure</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-none bg-muted/20">
            <Truck className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium leading-tight">Express Delivery</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-none bg-muted/20">
            <RotateCcw className="w-4 h-4 text-primary shrink-0" />
            <span className="font-medium leading-tight">Easy Returns</span>
          </div>
        </div>

        {/* Accepted Payment Partner Logos */}
        <div className="pt-2 flex items-center justify-center flex-wrap gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
          <div className="h-5 px-1.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs" title="UPI">
            <UpiLogo className="h-2.5 w-auto" />
          </div>
          <div className="h-5 px-1.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs" title="Visa">
            <VisaLogo className="h-2.5 w-auto" />
          </div>
          <div className="h-5 px-1.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs" title="Mastercard">
            <MastercardLogo className="h-3 w-auto" />
          </div>
          <div className="h-5 px-1.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs" title="RuPay">
            <RuPayLogo className="h-2.5 w-auto" />
          </div>
          <div className="h-5 px-1.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center gap-1 shadow-2xs" title="Razorpay Secure">
            <RazorpayIcon className="w-3 h-3" />
            <span className="text-[9px] font-bold text-foreground">Razorpay</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CheckoutOrderSummary;
