'use client';

import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      router.back();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [router]);

  const handleRetry = () => {
    setIsRetrying(true);
    if (typeof window !== 'undefined' && navigator.onLine) {
      router.back();
    } else {
      setTimeout(() => setIsRetrying(false), 1000);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 my-auto">
      <div className="max-w-md w-full rounded-2xl border border-amber-500/20 bg-card p-8 shadow-xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <WifiOff className="h-8 w-8" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-2">You&apos;re Offline</h1>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          We can&apos;t connect to the internet right now. Please check your Wi-Fi or mobile data connection.
          We&apos;ll reconnect automatically when you&apos;re back online.
        </p>

        <button
          onClick={handleRetry}
          disabled={isRetrying}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Checking connection...' : 'Try again'}
        </button>
      </div>
    </div>
  );
}
