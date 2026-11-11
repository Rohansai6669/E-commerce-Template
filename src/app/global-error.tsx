'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    console.error('Global Error Boundary caught:', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof unstable_retry === 'function') {
      unstable_retry();
    } else {
      reset();
    }
  };

  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex items-center justify-center bg-background text-foreground p-6 antialiased font-sans">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertOctagon className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm mb-6">
            We couldn&apos;t load the application. Critical layout error detected.
          </p>

          {error.digest && (
            <div className="mb-6 rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground border border-border text-left overflow-x-auto">
              <span className="font-semibold block text-foreground mb-1">Error Digest:</span>
              <code>{error.digest}</code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>

            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Return Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
