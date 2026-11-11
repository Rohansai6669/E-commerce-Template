import React from 'react';
import { ProductCardSkeleton } from '@/components/common/loading-skeletons';

export default function StorefrontLoading() {
  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="h-48 sm:h-64 w-full rounded-2xl bg-muted" />

      {/* Title & Filter Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 w-full sm:w-1/3">
          <div className="h-6 w-3/4 rounded bg-muted" />
          <div className="h-4 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
