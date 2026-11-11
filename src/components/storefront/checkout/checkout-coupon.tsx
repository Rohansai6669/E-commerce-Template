'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Tag, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import { type Coupon, type CartItem } from '@/core/cart/cart.types';
import { validateCouponDetailedAction } from '@/app/actions/coupon';
import { toast } from 'sonner';

export interface CheckoutCouponProps {
  coupon: Coupon | null;
  items: CartItem[];
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
  className?: string;
  compact?: boolean;
}

/**
 * Dedicated checkout coupon application form.
 * Supports attribute validation, uppercase auto-formatting, and instant feedback.
 */
export function CheckoutCoupon({
  coupon,
  items,
  onApplyCoupon,
  onRemoveCoupon,
  className = '',
  compact = false,
}: CheckoutCouponProps) {
  const [promoCode, setPromoCode] = React.useState('');
  const [isApplying, startTransition] = React.useTransition();
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) {
      setErrorMsg('Please enter a coupon code.');
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await validateCouponDetailedAction(
          cleanCode,
          items.map((i) => ({ productId: i.productId, variantId: i.variantId, name: i.name }))
        );

        if (res.valid && res.coupon) {
          onApplyCoupon(res.coupon);
          setPromoCode('');
          setErrorMsg(null);
          toast.success(`Coupon "${res.coupon.code}" applied! You received a discount.`);
        } else {
          const err = res.error || 'Invalid or expired coupon code.';
          setErrorMsg(err);
          toast.error(err);
        }
      } catch (err: any) {
        const errText = err?.message || 'Failed to validate coupon code.';
        setErrorMsg(errText);
        toast.error(errText);
      }
    });
  };

  const handleRemove = () => {
    if (coupon) {
      const code = coupon.code;
      onRemoveCoupon();
      setErrorMsg(null);
      toast.info(`Coupon "${code}" removed.`);
    }
  };

  if (compact) {
    return (
      <div className={`space-y-2.5 ${className}`}>
        {coupon ? (
          <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 tracking-wide font-mono">
                  {coupon.code}
                </span>
                <span className="text-[11px] text-emerald-700/80 dark:text-emerald-300/80 block">
                  {coupon.type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} flat discount`} applied
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
            >
              <X className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter promo code (e.g. SAVE10)"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg(null);
                }}
                disabled={isApplying}
                className="h-9 text-xs uppercase font-mono tracking-wider border-border"
              />
            </div>
            <Button
              type="submit"
              disabled={isApplying || !promoCode.trim()}
              className="h-9 px-4 font-bold text-xs uppercase cursor-pointer shrink-0"
            >
              {isApplying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  <span>Applying...</span>
                </>
              ) : (
                <span>Apply</span>
              )}
            </Button>
          </form>
        )}
        {errorMsg && (
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium pl-1">
            {errorMsg}
          </p>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-border bg-card shadow-sm ${className}`}>
      <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-primary shrink-0" />
          <Heading level={3} className="text-sm font-bold uppercase tracking-wider font-heading">
            Promo Code &amp; Discounts
          </Heading>
        </div>
        {coupon && (
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            Active
          </span>
        )}
      </CardHeader>

      <CardContent className="p-4">
        {coupon ? (
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-foreground font-mono tracking-wide">
                    {coupon.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                  </span>
                </div>
                <Text className="text-xs text-muted-foreground mt-0.5">
                  Coupon successfully applied to your eligible order items.
                </Text>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="font-bold text-xs uppercase cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 border-red-200 dark:border-red-900/60"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <form onSubmit={handleApply} className="flex gap-2.5">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Enter code (e.g. SAVE10, FESTIVE)"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isApplying}
                  className="h-10 text-xs uppercase font-mono tracking-wider border-border"
                />
              </div>
              <Button
                type="submit"
                disabled={isApplying || !promoCode.trim()}
                className="h-10 px-5 font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <span>Apply Code</span>
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </Button>
            </form>

            {errorMsg ? (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                {errorMsg}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Have a voucher or promotional gift code? Enter it above to apply your discount.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CheckoutCoupon;

