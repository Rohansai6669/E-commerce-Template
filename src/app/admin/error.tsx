'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, LayoutDashboard, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Admin Portal Error caught:', error);
  }, [error]);

  const handleRetry = () => {
    if (typeof unstable_retry === 'function') {
      unstable_retry();
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-lg w-full rounded-2xl border border-destructive/20 bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight mb-2">Admin Portal Unavailable</h2>
        <p className="text-muted-foreground text-sm mb-6">
          An error occurred while accessing administrative resources or processing dashboard data.
        </p>

        {error.digest && (
          <p className="text-xs text-muted-foreground mb-4 font-mono">
            Error Digest: {error.digest}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow hover:bg-destructive/90 transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Connection
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin Dashboard
          </Link>
        </div>

        {/* Diagnostic Toggle */}
        <div className="border-t border-border pt-4 text-left">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {showDetails ? 'Hide diagnostic logs' : 'Show diagnostic logs'}
          </button>

          {showDetails && (
            <div className="mt-3 rounded-lg bg-muted p-3 text-xs font-mono text-muted-foreground overflow-x-auto border border-border">
              <p className="font-semibold text-foreground mb-1">{error.name}: {error.message}</p>
              {error.stack && (
                <pre className="text-[11px] leading-relaxed whitespace-pre-wrap opacity-80 max-h-48 overflow-y-auto">
                  {error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
