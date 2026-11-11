import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Home, ShoppingCart } from 'lucide-react';

export default function StorefrontNotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-lg w-full rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="h-8 w-8" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Product or Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          The product, category, or page you&apos;re looking for is no longer available or may have moved.
        </p>

        <div className="mb-6 rounded-xl bg-muted/60 p-4 text-left border border-border">
          <h4 className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Looking for something specific?
          </h4>
          <p className="text-xs text-muted-foreground">
            Try browsing our featured catalog or return to the main store.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop Products
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
