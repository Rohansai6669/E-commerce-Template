import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Failed | Lexido',
  description: 'Payment was not completed. You can retry with another method or choose COD.',
};

interface PaymentFailedPageProps {
  searchParams: Promise<{
    reason?: string;
    order_id?: string;
  }>;
}

export default async function PaymentFailedPage({ searchParams }: PaymentFailedPageProps) {
  const params = await searchParams;
  const reason = params.reason || 'The card or bank payment could not be processed.';

  return (
    <Container className="py-16 max-w-2xl mx-auto">
      <Card className="border-border bg-card shadow-sm text-center overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
            <AlertCircle className="w-9 h-9 stroke-[2.2]" />
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Payment Not Completed
          </Heading>
          <Text className="text-sm text-muted-foreground mt-2 max-w-md">
            No funds were charged to your account. Your cart items have been saved.
          </Text>
        </CardHeader>

        <CardContent className="p-8 pt-2 space-y-6">
          <div className="p-4 rounded-none bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 block mb-1">
              Gateway Response
            </span>
            <p className="text-xs text-rose-600 dark:text-rose-300 leading-relaxed">
              {reason}
            </p>
          </div>

          <p className="text-xs text-muted-foreground">
            You can try again using UPI, NetBanking, a different debit/credit card, or choose Cash on Delivery.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="outline" className="w-full sm:w-auto font-bold text-xs uppercase cursor-pointer">
              <Link href="/cart">Return to Bag</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-white cursor-pointer">
              <Link href="/checkout" className="flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Checkout</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

