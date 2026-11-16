import * as React from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { XCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Cancelled | Lexido',
  description: 'Your payment process was cancelled. No charges were made.',
};

export default function PaymentCancelledPage() {
  return (
    <Container className="py-16 max-w-2xl mx-auto">
      <Card className="border-border bg-card shadow-sm text-center overflow-hidden">
        <CardHeader className="p-8 pb-4 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <XCircle className="w-9 h-9 stroke-[2.2]" />
          </div>
          <Heading level={1} className="text-2xl sm:text-3xl font-extrabold tracking-tight font-heading">
            Payment Cancelled
          </Heading>
          <Text className="text-sm text-muted-foreground mt-2 max-w-md">
            You closed the payment window. No charges were made to your bank account or card.
          </Text>
        </CardHeader>

        <CardContent className="p-8 pt-2 space-y-6">
          <p className="text-xs text-muted-foreground">
            All your selected items and shipping details have been preserved in your shopping cart.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild variant="outline" className="w-full sm:w-auto font-bold text-xs uppercase cursor-pointer">
              <Link href="/products">Browse Catalog</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider bg-slate-950 hover:bg-slate-800 text-white cursor-pointer">
              <Link href="/checkout" className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Resume Checkout</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}

