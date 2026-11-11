'use client';

import * as React from 'react';
import { ImageOff } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface NoImageFallbackProps {
  className?: string;
  compact?: boolean;
  message?: string;
  subMessage?: string;
}

/**
 * High-fidelity, luxury branded "No Image Found" placeholder.
 * Displays when a product has no uploaded image or when image loading fails.
 */
export function NoImageFallback({
  className,
  compact = false,
  message = 'No Image Found',
  subMessage = 'Image not available',
}: NoImageFallbackProps) {
  if (compact) {
    return (
      <div
        className={cn(
          'w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 p-2 select-none',
          className
        )}
      >
        <ImageOff className="w-5 h-5 text-slate-400 dark:text-slate-500 stroke-[1.5]" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1">
          No Image
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-50/90 to-slate-100/90 dark:from-slate-900/80 dark:to-slate-950/80 border border-dashed border-slate-200 dark:border-slate-800 p-6 select-none text-center',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center shadow-xs mb-2.5">
        <ImageOff className="w-6 h-6 text-slate-400 dark:text-slate-400 stroke-[1.5]" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 font-heading">
        {message}
      </span>
      {subMessage && (
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
          {subMessage}
        </span>
      )}
    </div>
  );
}
export default NoImageFallback;

