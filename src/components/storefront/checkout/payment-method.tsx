'use client';

import * as React from 'react';
import { RadioCard } from '@/components/forms/radio-card';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type PaymentMethod, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { PAYMENT_TYPES } from '@/core/checkout/checkout.constants';
import { ShieldCheck, Lock, Sparkles, CheckCircle2, Zap, AlertCircle, Copy, Check, Tag } from 'lucide-react';
import { type Coupon, type CartItem } from '@/core/cart/cart.types';
import { CheckoutCoupon } from './checkout-coupon';

export interface PaymentMethodFormProps {
  defaultValue?: PaymentMethod | null;
  totals?: CheckoutTotals | null;
  coupon?: Coupon | null;
  items?: CartItem[];
  onApplyCoupon?: (coupon: Coupon) => void;
  onRemoveCoupon?: () => void;
  onSubmit: (method: PaymentMethod) => void;
  onBack: () => void;
  isProcessing?: boolean;
}

/**
 * Modern Payment Method selection form supporting Razorpay Payment Gateway & COD.
 */
export function PaymentMethodForm({
  defaultValue,
  totals,
  coupon,
  items,
  onApplyCoupon,
  onRemoveCoupon,
  onSubmit,
  onBack,
  isProcessing = false,
}: PaymentMethodFormProps) {
  const [paymentType, setPaymentType] = React.useState<'razorpay' | 'cod' | 'card'>(
    (defaultValue?.type as any) ?? 'razorpay'
  );
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const isTestMode = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_test_');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const options = PAYMENT_TYPES.map((pt) => ({
    value: pt.type,
    label: pt.label,
    description: pt.description,
    icon: pt.icon,
  }));

  const handleSubmit = () => {
    if (paymentType === 'razorpay' || paymentType === 'card') {
      onSubmit({ type: 'razorpay' });
    } else {
      onSubmit({ type: 'cod' });
    }
  };

  const formattedTotal = totals ? `₹${totals.total.toFixed(2)}` : '';

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="p-5 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
        <div>
          <Heading level={2} className="text-base font-bold tracking-tight font-heading">
            Select Payment Method
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Choose your preferred secure payment method.
          </Text>
        </div>
        {totals && (
          <div className="text-right">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Total Payable
            </span>
            <span className="text-lg font-extrabold text-foreground font-mono">
              {formattedTotal}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-5">
        <Stack gap="5">
          {/* Optional Promo Code at Payment Step */}
          {onApplyCoupon && onRemoveCoupon && items && (
            <div className="p-3.5 rounded-lg border border-border/80 bg-muted/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-2">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Have a Promo Code or Gift Voucher?</span>
              </div>
              <CheckoutCoupon
                coupon={coupon ?? null}
                items={items}
                onApplyCoupon={onApplyCoupon}
                onRemoveCoupon={onRemoveCoupon}
                compact
              />
            </div>
          )}

          <RadioCard
            name="payment-type"
            options={options}
            value={paymentType}
            onChange={(val) => setPaymentType(val as any)}
          />

          {/* RAZORPAY PAYMENT DETAILS CARD */}
          {(paymentType === 'razorpay' || paymentType === 'card') && (
            <Card className="border-indigo-100 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50 dark:from-indigo-950/20 dark:via-background dark:to-background overflow-hidden shadow-2xs">
              <CardContent className="p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                      <Zap className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">
                        Razorpay Secure Checkout
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        India&apos;s leading RBI-authorized payment gateway
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" /> 256-Bit SSL
                  </span>
                </div>

                {/* Supported Payment Channels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-border/50 text-[11px]">
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-center">
                    <span className="font-extrabold text-foreground block">UPI / QR</span>
                    <span className="text-[10px] text-muted-foreground">GPay, PhonePe, Paytm</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-center">
                    <span className="font-extrabold text-foreground block">Cards</span>
                    <span className="text-[10px] text-muted-foreground">Visa, Master, RuPay</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-center">
                    <span className="font-extrabold text-foreground block">Netbanking</span>
                    <span className="text-[10px] text-muted-foreground">50+ Indian Banks</span>
                  </div>
                  <div className="p-2 rounded-lg bg-background/80 border border-border/60 text-center">
                    <span className="font-extrabold text-foreground block">Wallets & PayLater</span>
                    <span className="text-[10px] text-muted-foreground">Multiple providers</span>
                  </div>
                </div>

                {/* Test Mode Helper Banner */}
                {isTestMode && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wide text-amber-700 dark:text-amber-300">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Razorpay Sandbox Test Mode</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground dark:text-amber-200/80">
                      Indian Razorpay accounts block foreign/international BIN cards with <span className="font-semibold text-rose-600 dark:text-rose-400">&ldquo;International cards are not supported&rdquo;</span>. Use these verified Indian Domestic sandbox instruments:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-background/90 border border-border flex items-center justify-between">
                        <div>
                          <span className="font-semibold block text-foreground">RuPay Domestic</span>
                          <span className="font-mono text-[10px] text-muted-foreground">6527 6589 0000 1005</span>
                          <span className="text-[9px] text-muted-foreground block">Exp: Any | CVV: 123</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('6527658900001005', 'rupay')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
                          title="Copy RuPay number"
                        >
                          {copiedKey === 'rupay' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-background/90 border border-border flex items-center justify-between">
                        <div>
                          <span className="font-semibold block text-foreground">Visa Domestic</span>
                          <span className="font-mono text-[10px] text-muted-foreground">4100 2800 0000 1007</span>
                          <span className="text-[9px] text-muted-foreground block">Exp: Any | CVV: 123</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('4100280000001007', 'visa')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
                          title="Copy Visa number"
                        >
                          {copiedKey === 'visa' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="p-2 rounded bg-background/90 border border-border flex items-center justify-between">
                        <div>
                          <span className="font-semibold block text-foreground">UPI (Instant)</span>
                          <span className="font-mono text-[10px] text-muted-foreground">success@razorpay</span>
                          <span className="text-[9px] text-muted-foreground block">Simulated OTP: any 4+ digits</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard('success@razorpay', 'upi')}
                          className="p-1 rounded hover:bg-muted text-muted-foreground transition"
                          title="Copy UPI ID"
                        >
                          {copiedKey === 'upi' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/40 p-2.5 rounded-lg">
                  <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    Clicking &ldquo;Pay with Razorpay&rdquo; opens the secure checkout popup window to complete your payment.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* COD DETAILS CARD */}
          {paymentType === 'cod' && (
            <Card className="border-border bg-muted/10">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold text-foreground">
                    Cash on Delivery Available
                  </span>
                </div>
                <Text className="text-xs text-muted-foreground">
                  You can pay with cash or via delivery agent UPI QR code when your shipment arrives at your doorstep.
                </Text>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="font-bold text-xs uppercase cursor-pointer"
            >
              Back to Review
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isProcessing}
              className="font-extrabold text-xs uppercase tracking-wider px-6 py-2.5 bg-slate-950 hover:bg-slate-800 text-white cursor-pointer shadow-md transition flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : paymentType === 'razorpay' || paymentType === 'card' ? (
                <>
                  <span>Pay with Razorpay {formattedTotal ? `(${formattedTotal})` : ''}</span>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </>
              ) : (
                <>
                  <span>Place Order (Cash on Delivery)</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </>
              )}
            </Button>
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default PaymentMethodForm;
