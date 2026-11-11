'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Reusable inline error component for expected API/data fetch failures
 * (e.g. Products API, Categories API, Reviews API, Orders API) that should
 * NOT trigger Next.js route-level error boundaries.
 */
export function ErrorState({
  title = 'Unable to load data',
  description = 'We couldn\'t retrieve the requested data right now. Please try again.',
  onRetry,
  isRetrying = false,
  compact = false,
  className = '',
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className={`flex items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-xs text-destructive ${className}`}>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{title}: {description}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1 font-medium underline underline-offset-2 hover:opacity-80 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center my-4 ${className}`}>
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <Inbox className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-5 leading-relaxed">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Retrying...' : 'Try again'}
        </button>
      )}
    </div>
  );
}
