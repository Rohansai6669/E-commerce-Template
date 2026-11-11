'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { type FilterConfig, type FilterState, type FilterValue } from './data-table-types';
import { cn } from '@/core/utils/cn';

interface DataTableToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  searchPlaceholder?: string;
  filterConfigs?: FilterConfig[];
  filters: FilterState;
  onFilterChange: (filterId: string, value: FilterValue) => void;
  onClearFilters: () => void;
  storeMode?: 'standalone' | 'marketplace';
}

export function DataTableToolbar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search records...',
  filterConfigs = [],
  filters,
  onFilterChange,
  onClearFilters,
  storeMode = 'standalone',
}: DataTableToolbarProps) {
  // Filter out marketplace-only filters if in standalone mode
  const activeConfigs = filterConfigs.filter(
    (cfg) => !cfg.requiresMarketplace || storeMode === 'marketplace'
  );

  // Compute active filters list for chip rendering
  const activeChips = React.useMemo(() => {
    const chips: { id: string; label: string; displayValue: string }[] = [];
    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === '' || value === undefined || value === 'all') return;
      const config = activeConfigs.find((c) => c.id === key);
      if (!config) return;

      let displayVal = String(value);
      if (config.type === 'select' && config.options) {
        const opt = config.options.find((o) => o.value === value);
        if (opt) displayVal = opt.label;
      } else if (Array.isArray(value)) {
        displayVal = value.join(', ');
      }

      chips.push({
        id: key,
        label: config.label,
        displayValue: displayVal,
      });
    });
    return chips;
  }, [filters, activeConfigs]);

  const hasActiveFilters = search.trim() !== '' || activeChips.length > 0;

  return (
    <div className="flex flex-col gap-3.5 w-full bg-slate-50/70 p-4 border border-slate-200 rounded-lg">
      {/* Primary search & filter controls row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9 pr-8 h-9 text-xs bg-white border-slate-200 text-slate-900 focus:border-slate-950 font-medium"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Dynamic Filter Dropdowns */}
        {activeConfigs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold uppercase tracking-wider select-none pr-1">
              <Filter className="w-3.5 h-3.5 text-slate-600" />
              <span>Filter:</span>
            </div>
            {activeConfigs.map((cfg) => {
              const currentVal = (filters[cfg.id] as string) || 'all';

              return (
                <select
                  key={cfg.id}
                  value={currentVal}
                  onChange={(e) => onFilterChange(cfg.id, e.target.value)}
                  className={cn(
                    "h-9 px-3 text-xs bg-white border border-slate-200 rounded text-slate-800 font-semibold outline-none cursor-pointer hover:border-slate-400 transition",
                    currentVal !== 'all' && currentVal !== '' && "border-slate-950 bg-slate-900 text-white font-bold"
                  )}
                >
                  <option value="all" className="bg-white text-slate-900">
                    All {cfg.label}
                  </option>
                  {cfg.options?.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white text-slate-900 font-medium">
                      {opt.label}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Filter Chips & Clear All */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1.5 border-t border-slate-200/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 select-none">
            Active:
          </span>

          {search.trim() !== '' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium shadow-2xs">
              <span className="text-slate-400 font-bold">Search:</span> "{search}"
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="ml-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium shadow-2xs"
            >
              <span className="text-slate-400 font-bold">{chip.label}:</span> {chip.displayValue}
              <button
                type="button"
                onClick={() => onFilterChange(chip.id, 'all')}
                className="ml-1 text-slate-300 hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-7 px-2 text-xs font-bold text-slate-600 hover:text-slate-950 flex items-center gap-1 cursor-pointer select-none ml-auto"
          >
            <RotateCcw className="w-3 h-3" /> Clear All
          </Button>
        </div>
      )}
    </div>
  );
}
