'use client';

import * as React from 'react';
import { RadioCard } from '@/components/forms/radio-card';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type PaymentMethod, type CheckoutTotals } from '@/core/checkout/checkout.types';
import { PAYMENT_TYPES } from '@/core/checkout/checkout.constants';
import { ShieldCheck, Lock, CheckCircle2, Landmark, Wallet } from 'lucide-react';
import { type Coupon, type CartItem } from '@/core/cart/cart.types';
import {
  RazorpayIcon,
  UpiLogo,
  GooglePayLogo,
  PhonePeLogo,
  PaytmLogo,
  VisaLogo,
  MastercardLogo,
  RuPayLogo,
} from './payment-logos';

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
 * Displays official payment brand logos (UPI, GPay, PhonePe, Paytm, Visa, Mastercard, RuPay).
 */
export function PaymentMethodForm({
  defaultValue,
  totals,
  onSubmit,
  onBack,
  isProcessing = false,
}: PaymentMethodFormProps) {
  const [paymentType, setPaymentType] = React.useState<'razorpay' | 'cod' | 'card'>(
    (defaultValue?.type as any) ?? 'razorpay'
  );

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
            All transactions are secure and 256-bit SSL encrypted.
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
          <RadioCard
            name="payment-type"
            options={options}
            value={paymentType}
            onChange={(val) => setPaymentType(val as any)}
          />

          {/* RAZORPAY PAYMENT DETAILS CARD */}
          {(paymentType === 'razorpay' || paymentType === 'card') && (
            <Card className="border-border bg-muted/10 overflow-hidden shadow-2xs">
              <CardContent className="p-4 space-y-3.5">
                {/* Razorpay Brand Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-sm bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center shrink-0 shadow-2xs">
                      <RazorpayIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-extrabold text-foreground font-heading">
                        Razorpay Secure Checkout
                      </h4>
                      <p className="text-[11px] text-muted-foreground">
                        India&apos;s leading RBI-authorized payment gateway
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" /> 256-Bit SSL
                  </span>
                </div>

                {/* Accepted Payment Methods Logos Container */}
                <div className="p-3.5 bg-background border border-border/80 rounded-none space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Accepted Payment Methods
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      Zero convenience fee
                    </span>
                  </div>

                  {/* Logos Group Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* UPI & Instant Apps */}
                    <div className="p-2.5 rounded-none border border-border bg-card/60 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        UPI Apps (Instant 0% Fee)
                      </span>
                      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                        <div
                          className="h-7 px-2 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="UPI"
                        >
                          <UpiLogo className="h-3.5 w-auto" />
                        </div>
                        <div
                          className="h-7 px-2 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="Google Pay"
                        >
                          <GooglePayLogo className="h-3.5 w-auto" />
                        </div>
                        <div
                          className="h-7 px-2 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="PhonePe"
                        >
                          <PhonePeLogo className="h-3.5 w-auto" />
                        </div>
                        <div
                          className="h-7 px-2 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="Paytm"
                        >
                          <PaytmLogo className="h-3.5 w-auto" />
                        </div>
                      </div>
                    </div>

                    {/* Cards */}
                    <div className="p-2.5 rounded-none border border-border bg-card/60 flex flex-col justify-between gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Credit &amp; Debit Cards
                      </span>
                      <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
                        <div
                          className="h-7 px-2.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="Visa"
                        >
                          <VisaLogo className="h-3 w-auto" />
                        </div>
                        <div
                          className="h-7 px-2.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="Mastercard"
                        >
                          <MastercardLogo className="h-4 w-auto" />
                        </div>
                        <div
                          className="h-7 px-2.5 bg-white dark:bg-muted/80 rounded border border-border/80 flex items-center shadow-2xs"
                          title="RuPay"
                        >
                          <RuPayLogo className="h-3 w-auto" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* NetBanking & Wallets row */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Landmark className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>
                        NetBanking via <strong>50+ Indian Banks</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>Paytm, Mobikwik &amp; Wallets</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 border border-border/50">
                  <Lock className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>
                    After clicking &ldquo;Pay with Razorpay&rdquo;, a secure payment window will open to complete your transaction safely.
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
                  <RazorpayIcon className="w-3.5 h-3.5 fill-white" />
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
