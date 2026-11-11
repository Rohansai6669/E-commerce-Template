import React from 'react';
import { DashboardStatsSkeleton, TableRowSkeleton } from '@/components/common/loading-skeletons';

export default function SupplierLoading() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded bg-muted" />
          <div className="h-4 w-28 rounded bg-muted" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-muted" />
      </div>

      <DashboardStatsSkeleton />

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="h-5 w-40 rounded bg-muted" />
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {Array.from({ length: 4 }).map((_, i) => (
                <th key={i} className="p-3">
                  <div className="h-4 w-16 rounded bg-muted" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={4} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
