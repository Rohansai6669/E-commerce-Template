'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';

interface NoImageFallbackProps {
  className?: string;
  compact?: boolean;
  message?: string;
  subMessage?: string;
}

/**
 * High-fidelity, luxury branded placeholder for products awaiting editorial photography.
 * Minimalist, elegant monochrome aesthetic with subtle brand watermark.
 * Never displays tacky or unfinished "NO IMAGE FOUND" error text to customers.
 */
export function NoImageFallback({
  className,
  compact = false,
}: NoImageFallbackProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400 p-2 select-none',
          className
        )}
      >
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-neutral-400 font-mono">
          LEXIDO
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400 p-6 select-none relative overflow-hidden transition-all duration-300',
        className
      )}
    >
      {/* Subtle geometric luxury watermark */}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none font-black text-8xl tracking-tighter">
        LX
      </div>

      <div className="flex flex-col items-center gap-1.5 text-center relative z-10">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400 font-mono">
          LEXIDO
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500 font-sans">
          ATELIER COLLECTION
        </span>
      </div>
    </div>
  );
}

export default NoImageFallback;
