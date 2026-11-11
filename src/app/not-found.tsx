import React from 'react';
import Link from 'next/link';
import { FileQuestion, Home, ShoppingBag, ShoppingCart } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FileQuestion className="h-8 w-8" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2">Page Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The page you are looking for doesn&apos;t exist or has been moved to another URL.
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ShoppingBag className="h-4 w-4" />
            Shop
          </Link>

          <Link
            href="/cart"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
}
