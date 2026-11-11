'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { type CartSummary, type Coupon, type CartItem } from '@/core/cart/cart.types';
import { CartPresenter } from '@/core/cart/cart.presenter';
import { validateCouponDetailedAction } from '@/app/actions/coupon';
import { toast } from 'sonner';

export interface CartSummaryProps {
  summary: CartSummary;
  coupon: Coupon | null;
  items?: CartItem[];
  applyCoupon: (coupon: Coupon) => void;
  removeCoupon: () => void;
}

/**
 * Renders the checkout summary card including progress shipping bars and promotional coupons.
 */
export function CartSummaryComponent({
  summary,
  coupon,
  items = [],
  applyCoupon,
  removeCoupon,
}: CartSummaryProps) {
  const [promoCode, setPromoCode] = React.useState('');
  const [isChecking, startTransition] = React.useTransition();
  const shippingProgress = CartPresenter.getShippingProgress(summary.subtotal);
  const shippingMessage = CartPresenter.formatShippingMessage(shippingProgress);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    startTransition(async () => {
      const res = await validateCouponDetailedAction(
        promoCode,
        items.map((i) => ({ productId: i.productId, variantId: i.variantId, name: i.name }))
      );

      if (res.valid && res.coupon) {
        applyCoupon(res.coupon);
        setPromoCode('');
        toast.success(`Coupon "${res.coupon.code}" applied successfully!`);
      } else {
        toast.error(res.error || 'Invalid or expired promo code.');
      }
    });
  };

  return (
    <Stack gap="5" className="w-full">
      {/* 1. Free Shipping gauge */}
      <Card className="border-border bg-card shadow-xs">
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Icon
              name={shippingProgress.isFree ? 'Sparkles' : 'Truck'}
              className={`h-4 w-4 ${shippingProgress.isFree ? 'text-yellow-500' : 'text-primary'}`}
            />
            <Text className="text-xs font-bold text-foreground leading-none">
              {shippingMessage}
            </Text>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
            <div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                shippingProgress.isFree ? 'bg-emerald-500' : 'bg-primary'
              }`}
              style={{ width: `${shippingProgress.percentage}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 2. Pricing details breakdown */}
      <Card className="border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="p-4 bg-muted/10 border-b border-border">
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Order Summary
          </Heading>
        </CardHeader>
        
        <CardContent className="p-4.5 flex flex-col gap-4">
          <div className="flex justify-between items-center text-sm font-semibold">
            <div>
              <span className="text-muted-foreground block">Items Subtotal</span>
              <span className="text-[10px] text-muted-foreground font-normal">All taxes included</span>
            </div>
            <span className="text-foreground">{summary.formattedSubtotal}</span>
          </div>

          {coupon && (
            <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs space-y-1">
              <div className="flex justify-between items-center font-bold text-emerald-700 dark:text-emerald-400">
                <span>Coupon Applied ({coupon.code})</span>
                <span className="font-mono text-sm">-{summary.formattedDiscount}</span>
              </div>
              {summary.discountBreakdown?.description && (
                <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400/80">
                  {summary.discountBreakdown.description}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-semibold">
            <span className="text-muted-foreground">Shipping</span>
            <span className="text-foreground">{summary.formattedShipping}</span>
          </div>

          {/* Tax Breakdown (Included in Price) */}
          {summary.isTaxInclusive && summary.taxBreakdown ? (
            <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 text-xs space-y-1.5">
              <div className="flex justify-between items-center font-medium text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="font-semibold text-foreground">Estimated GST (18%)</span>
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    Included
                  </span>
                </span>
                <span className="font-semibold text-foreground font-mono">
                  {summary.taxBreakdown.formattedTaxAmount}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <div>CGST (9%): <span className="font-mono text-foreground">{summary.taxBreakdown.formattedCgst}</span></div>
                <div className="text-right">SGST (9%): <span className="font-mono text-foreground">{summary.taxBreakdown.formattedSgst}</span></div>
              </div>
              <div className="text-[10px] text-muted-foreground/80 flex justify-between pt-0.5">
                <span>Taxable Base Value:</span>
                <span className="font-mono">{summary.taxBreakdown.formattedTaxableBase}</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-muted-foreground">Sales Tax</span>
              <span className="text-foreground">{summary.formattedTax}</span>
            </div>
          )}

          <div className="border-t border-border pt-4 mt-1">
            <div className="flex justify-between items-center text-base font-extrabold">
              <span className="text-foreground font-heading">Total Payable</span>
              <span className="text-foreground font-heading text-lg font-mono">{summary.formattedTotal}</span>
            </div>
            <span className="text-[11px] text-muted-foreground block text-right font-normal mt-0.5">
              Price includes all applicable taxes &amp; GST
            </span>
          </div>
        </CardContent>

        {/* Promo code inputs */}
        <CardContent className="px-4.5 pb-4.5 pt-0 border-b border-border flex flex-col gap-2.5">
          <Heading level={4} className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-heading">
            Promo Code
          </Heading>
          {coupon ? (
            <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded text-xs font-semibold text-emerald-800">
              <span>Promo {coupon.code} active</span>
              <button
                onClick={removeCoupon}
                className="text-[10px] uppercase font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
              >
                Remove
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <Input
                type="text"
                placeholder="SAVE10, SAVE20..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="h-9 text-xs border-border"
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 font-semibold text-xs cursor-pointer border-border"
              >
                Apply
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="p-4 bg-muted/5">
          <Button className="w-full font-bold text-xs uppercase cursor-pointer" asChild>
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </CardFooter>
      </Card>
    </Stack>
  );
}
export default CartSummaryComponent;
