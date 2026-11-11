'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { type ColumnDef } from './data-table-types';

interface DataTableBodyProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  selectable?: boolean;
  selectedKeys: Set<string>;
  onSelectRow: (key: string, item: T) => void;
  getItemKey: (item: T, index: number) => string;
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  isLoading?: boolean;
  storeMode?: 'standalone' | 'marketplace';
}

export function DataTableBody<T>({
  columns,
  data,
  selectable = true,
  selectedKeys,
  onSelectRow,
  getItemKey,
  emptyStateMessage = 'No records found.',
  emptyStateAction,
  isLoading = false,
  storeMode = 'standalone',
}: DataTableBodyProps<T>) {
  const visibleColumns = columns.filter(
    (col) => !col.requiresMarketplace || storeMode === 'marketplace'
  );
  const totalCols = visibleColumns.length + (selectable ? 1 : 0);

  if (isLoading) {
    return (
      <tbody className="divide-y divide-slate-100 bg-white">
        {Array.from({ length: 5 }).map((_, rIdx) => (
          <tr key={rIdx} className="animate-pulse">
            {selectable && (
              <td className="py-4 px-4 text-center">
                <div className="h-4 w-4 rounded bg-slate-200 mx-auto" />
              </td>
            )}
            {visibleColumns.map((_, cIdx) => (
              <td key={cIdx} className="py-4 px-6">
                <div className="h-4 rounded bg-slate-150 w-3/4" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    );
  }

  return (
    <tbody className="divide-y divide-slate-100 text-sm bg-white">
      {data.map((item, rowIdx) => {
        const key = getItemKey(item, rowIdx);
        const isSelected = selectedKeys.has(key);

        return (
          <tr
            key={key}
            className={cn(
              "transition-colors",
              isSelected ? "bg-slate-100/60 font-medium" : "hover:bg-slate-50/40"
            )}
          >
            {selectable && (
              <td className="py-4 px-4 text-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelectRow(key, item)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950"
                  suppressHydrationWarning
                />
              </td>
            )}
            {visibleColumns.map((col, colIdx) => (
              <td key={colIdx} className={cn("py-4 px-6 text-slate-700 font-sans", col.className)}>
                {col.cell(item, rowIdx)}
              </td>
            ))}
          </tr>
        );
      })}

      {data.length === 0 && (
        <tr>
          <td colSpan={totalCols} className="py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-3 max-w-sm mx-auto">
              <span className="text-sm text-slate-500 font-sans font-medium">{emptyStateMessage}</span>
              {emptyStateAction && (
                <div className="mt-1">{emptyStateAction}</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </tbody>
  );
}
