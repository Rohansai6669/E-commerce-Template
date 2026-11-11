import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeletal loading block matching the unified ProductCard layout framework.
 */
export function LoadingProductCard() {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs flex flex-col h-full space-y-3 p-0">
      <div className="relative w-full aspect-[3/4] bg-muted/60 overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="p-4 pt-1 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3 rounded-md" />
          <Skeleton className="h-4 w-4/5 rounded-md" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <div className="space-y-2 pt-1">
          <Skeleton className="h-3 w-1/4 rounded-md" />
          <Skeleton className="h-5 w-2/5 rounded-md" />
        </div>
      </div>
    </div>
  );
}

export default LoadingProductCard;
