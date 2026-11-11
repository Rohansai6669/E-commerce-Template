'use client';

import React, { useEffect } from 'react';
import { ShoppingBag, RefreshCw, Home, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export default function StorefrontError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error('Storefront Error caught:', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof unstable_retry === 'function') {
      unstable_retry();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-lg w-full rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">We couldn&apos;t load this page</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Your cart, account, and preferences are safe. Please try refreshing the page or head back to shopping.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>

          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Home className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
