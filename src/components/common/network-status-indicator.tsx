'use client';

import React, { useState, useEffect } from 'react';
import { useSupabase } from '@/providers/SupabaseProvider';
import { WifiOff, AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';

export function NetworkStatusIndicator() {
  const { isBrowserOffline, isSupabaseUnreachable, isOffline, retryConnection } = useSupabase();
  const [dismissed, setDismissed] = useState(false);
  const [showRestored, setShowRestored] = useState(false);
  const [prevOffline, setPrevOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  // Monitor offline to online transition
  useEffect(() => {
    if (prevOffline && !isOffline) {
      setShowRestored(true);
      setDismissed(false);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
    setPrevOffline(isOffline);
  }, [isOffline, prevOffline]);

  // Reset dismissal state when offline status changes
  useEffect(() => {
    if (isOffline) {
      setDismissed(false);
    }
  }, [isOffline]);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await retryConnection();
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOffline && !showRestored) return null;
  if (dismissed && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {showRestored ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/90 p-3.5 text-emerald-200 shadow-xl backdrop-blur-md">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm font-medium">
            Connection restored. System is back online.
          </div>
          <button
            onClick={() => setShowRestored(false)}
            className="text-emerald-400 hover:text-emerald-100 p-1 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : isBrowserOffline ? (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-950/90 p-3.5 text-amber-200 shadow-xl backdrop-blur-md">
          <WifiOff className="h-5 w-5 text-amber-400 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-semibold block">You&apos;re offline</span>
            <span className="text-amber-300/80">Changes will sync when your connection returns.</span>
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="p-1.5 text-amber-300 hover:text-amber-100 hover:bg-amber-900/50 rounded-md transition-colors disabled:opacity-50"
            title="Retry connection"
          >
            <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-amber-400 hover:text-amber-100 p-1 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : isSupabaseUnreachable ? (
        <div className="flex items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-950/90 p-3.5 text-rose-200 shadow-xl backdrop-blur-md">
          <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-semibold block">Database endpoint unreachable</span>
            <span className="text-rose-300/80">Supabase API is temporarily unavailable.</span>
          </div>
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-rose-900/60 hover:bg-rose-800/80 text-rose-100 rounded border border-rose-500/30 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            Retry
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-rose-400 hover:text-rose-100 p-1 rounded-md transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
