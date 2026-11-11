import React from 'react';
import { DashboardStatsSkeleton, TableRowSkeleton } from '@/components/common/loading-skeletons';

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded bg-muted" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-muted" />
      </div>

      {/* Stats Cards */}
      <DashboardStatsSkeleton />

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <div className="h-5 w-36 rounded bg-muted" />
          <div className="h-9 w-24 rounded-lg bg-muted" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <th key={i} className="p-4">
                  <div className="h-4 w-20 rounded bg-muted" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRowSkeleton key={i} cols={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
