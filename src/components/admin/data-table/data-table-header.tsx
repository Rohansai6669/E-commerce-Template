'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { type ColumnDef, type SortingState } from './data-table-types';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

interface DataTableHeaderProps<T> {
  columns: ColumnDef<T>[];
  sorting: SortingState;
  onSortChange: (columnId: string) => void;
  selectable?: boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
  storeMode?: 'standalone' | 'marketplace';
}

export function DataTableHeader<T>({
  columns,
  sorting,
  onSortChange,
  selectable = true,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  storeMode = 'standalone',
}: DataTableHeaderProps<T>) {
  const visibleColumns = columns.filter(
    (col) => !col.requiresMarketplace || storeMode === 'marketplace'
  );

  return (
    <thead>
      <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none bg-slate-50/70">
        {selectable && (
          <th className="py-3.5 px-4 w-10 text-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={onSelectAll}
              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 cursor-pointer accent-slate-950"
              suppressHydrationWarning
            />
          </th>
        )}
        {visibleColumns.map((col, idx) => {
          const colId = col.id || col.sortKey || (typeof col.header === 'string' ? col.header.toLowerCase().replace(/\s+/g, '_') : String(idx));
          const isSorted = sorting.columnId === colId;
          const sortDirection = isSorted ? sorting.direction : null;
          const isSortable = col.sortable !== false && (!!col.sortKey || !!col.sortValue || !!col.id || typeof col.header === 'string');

          return (
            <th
              key={colId || idx}
              className={cn("py-3.5 px-6 font-bold", col.headerClassName || col.className)}
            >
              {isSortable ? (
                <button
                  type="button"
                  onClick={() => onSortChange(colId)}
                  className="inline-flex items-center gap-1.5 hover:text-slate-800 transition cursor-pointer select-none group"
                >
                  <span>{col.header}</span>
                  {sortDirection === 'asc' && (
                    <ArrowUp className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  {sortDirection === 'desc' && (
                    <ArrowDown className="w-3.5 h-3.5 text-slate-950" />
                  )}
                  {!sortDirection && (
                    <ArrowUpDown className="w-3 h-3 text-slate-350 group-hover:text-slate-600 transition" />
                  )}
                </button>
              ) : (
                <span>{col.header}</span>
              )}
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
