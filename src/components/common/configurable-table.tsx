'use client';

import React, { useState } from 'react';
import { TableConfig, TableColumnConfig } from '@/types/cms';
import { Eye, Edit2, Trash2, CheckCircle2, ArrowUpDown } from 'lucide-react';

export interface ConfigurableTableProps<T extends Record<string, any>> {
  config: TableConfig;
  data: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onApprove?: (item: T) => void;
  isLoading?: boolean;
}

export function ConfigurableTable<T extends Record<string, any>>({
  config,
  data,
  onView,
  onEdit,
  onDelete,
  onApprove,
  isLoading = false,
}: ConfigurableTableProps<T>) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  if (!config.enabled) return null;

  const visibleColumns = [...config.columns]
    .filter((col) => col.visible)
    .sort((a, b) => a.order - b.order);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortField) return 0;
    const valA = a[sortField];
    const valB = b[sortField];
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const renderCellContent = (col: TableColumnConfig, item: T) => {
    const rawValue = item[col.field];

    if (col.type === 'ACTION') {
      return (
        <div className="flex items-center justify-end gap-2">
          {config.actions.view && onView && (
            <button
              onClick={() => onView(item)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="View details"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          {config.actions.edit && onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          {config.actions.approve && onApprove && (
            <button
              onClick={() => onApprove(item)}
              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-500/10 transition-colors cursor-pointer"
              title="Approve"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          {config.actions.delete && onDelete && (
            <button
              onClick={() => onDelete(item)}
              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      );
    }

    if (col.type === 'CURRENCY') {
      const num = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue || 0);
      return <span className="font-semibold text-foreground">${num.toFixed(2)}</span>;
    }

    if (col.type === 'STATUS' || col.type === 'BADGE') {
      const statusStr = String(rawValue || '').toUpperCase();
      const statusColor =
        statusStr === 'COMPLETED' || statusStr === 'ACTIVE' || statusStr === 'DELIVERED'
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          : statusStr === 'PENDING' || statusStr === 'PROCESSING'
          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          : 'bg-muted text-muted-foreground border-border';

      return (
        <span className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusColor}`}>
          {statusStr}
        </span>
      );
    }

    if (col.type === 'DATE' || col.type === 'DATETIME') {
      return (
        <span className="text-xs text-muted-foreground">
          {new Date(rawValue).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      );
    }

    if (col.type === 'USER') {
      return (
        <div className="font-medium text-foreground text-xs">
          {rawValue || 'Guest Customer'}
        </div>
      );
    }

    return <span className="text-xs text-foreground">{String(rawValue ?? '')}</span>;
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {visibleColumns.map((col) => (
                <th
                  key={col.id}
                  className={`p-4 ${!col.mobileVisible ? 'hidden sm:table-cell' : ''}`}
                  style={{ width: col.width }}
                >
                  <div className={`flex items-center gap-1.5 justify-${col.alignment === 'right' ? 'end' : col.alignment === 'center' ? 'center' : 'start'}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <button
                        onClick={() => handleSort(col.field)}
                        className="hover:text-foreground transition-colors p-0.5 rounded cursor-pointer"
                        title="Sort"
                      >
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-xs">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {visibleColumns.map((col) => (
                    <td key={col.id} className="p-4">
                      <div className="h-4 w-3/4 rounded bg-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length} className="p-8 text-center text-muted-foreground text-xs">
                  No table data available.
                </td>
              </tr>
            ) : (
              sortedData.map((item, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-muted/30 transition-colors">
                  {visibleColumns.map((col) => (
                    <td
                      key={col.id}
                      className={`p-4 ${!col.mobileVisible ? 'hidden sm:table-cell' : ''} text-${col.alignment}`}
                    >
                      {renderCellContent(col, item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
