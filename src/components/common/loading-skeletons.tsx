import React from 'react';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-4 animate-pulse">
      <div className="h-48 w-full rounded-xl bg-muted" />
      <div className="space-y-2">
        <div className="h-3 w-1/3 rounded bg-muted" />
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="h-5 w-1/4 rounded bg-muted" />
        <div className="h-8 w-20 rounded-lg bg-muted" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="animate-pulse border-b border-border/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="p-4">
          <div className="h-4 w-full rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-card p-6 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="h-3 w-1/2 rounded bg-muted" />
            <div className="h-8 w-8 rounded-full bg-muted" />
          </div>
          <div className="h-7 w-3/4 rounded bg-muted" />
          <div className="h-3 w-1/3 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
