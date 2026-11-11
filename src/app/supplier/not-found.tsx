import React from 'react';
import Link from 'next/link';
import { Truck, LayoutDashboard, Home } from 'lucide-react';

export default function SupplierNotFound() {
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Truck className="h-8 w-8" />
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight mb-2">404</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2">Supplier Resource Not Found</h2>
        <p className="text-muted-foreground text-sm mb-6">
          The requested supplier inventory page, product catalog, or order details page could not be located.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/supplier"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Supplier Dashboard
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
