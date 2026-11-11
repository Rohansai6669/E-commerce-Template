'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface DataTablePaginationProps {
  page: number;
  pageSize: 10 | 25 | 50 | 100;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: 10 | 25 | 50 | 100) => void;
}

export function DataTablePagination({
  page,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const startRecord = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const endRecord = Math.min(totalRecords, page * pageSize);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-2 text-xs text-slate-600 font-sans border-t border-slate-100">
      {/* Items per page selector & record counter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value) as any)}
            className="h-8 px-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 font-bold outline-none cursor-pointer hover:border-slate-400 transition"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <span className="font-medium text-slate-500">
          Showing <strong className="text-slate-900 font-bold">{startRecord}–{endRecord}</strong> of{' '}
          <strong className="text-slate-900 font-bold">{totalRecords}</strong> records
        </span>
      </div>

      {/* Page navigation controls & Page Indicator */}
      <div className="flex items-center gap-3">
        <span className="font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded text-[11px]">
          Page <strong className="text-slate-950 font-bold">{page}</strong> of{' '}
          <strong className="text-slate-950 font-bold">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={!canGoPrevious}
            className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            title="First Page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={!canGoPrevious}
            className="h-8 px-2.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={!canGoNext}
            className="h-8 px-2.5 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer flex items-center gap-1"
          >
            Next <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={!canGoNext}
            className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
            title="Last Page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
