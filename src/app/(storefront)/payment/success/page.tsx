import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Successful | Lexido',
  description: 'Your payment was authorized and your order is being processed.',
};

interface PaymentSuccessPageProps {
  searchParams: Promise<{
    order_id?: string;
    order_number?: string;
    payment_id?: string;
  }>;
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order_number || params.order_id || 'CONFIRMED';
  const paymentId = params.payment_id;

  return (
    <Container className="py-16 max-w-2xl mx-auto">
      <Card className="border-border bg-card shadow-sm text-center overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-9 h-9 stroke-[2.2]" />
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Payment Successful!
          </Heading>
          <Text className="text-sm text-muted-foreground mt-2 max-w-md">
            Thank you for your purchase. Your payment was verified and your order has been received.
          </Text>
        </CardHeader>

        <CardContent className="p-8 pt-2 space-y-6">
          <div className="p-4 rounded-none bg-muted/30 border border-border/80 text-left space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Order Reference:</span>
              <span className="font-mono font-bold text-foreground">{orderNumber}</span>
            </div>
            {paymentId && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-muted-foreground">{paymentId}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Payment Status:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                Authorized &amp; Captured
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>A confirmation receipt has been sent to your email address.</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="outline" className="w-full sm:w-auto font-bold text-xs uppercase cursor-pointer">
              <Link href="/account/orders">View My Orders</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-white cursor-pointer">
              <Link href="/products" className="flex items-center gap-1.5">
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

