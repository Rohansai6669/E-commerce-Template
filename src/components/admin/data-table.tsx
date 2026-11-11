'use client';

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { getStoreModeClient, type StoreMode } from '@/core/config/store-mode';
import { DataTableToolbar } from './data-table/data-table-toolbar';
import { DataTableHeader } from './data-table/data-table-header';
import { DataTableBody } from './data-table/data-table-body';
import { DataTablePagination } from './data-table/data-table-pagination';
import {
  type ColumnDef,
  type DataTableProps,
  type DataTableState,
  type FilterState,
  type FilterValue,
  type SortingState,
} from './data-table/data-table-types';

export * from './data-table/data-table-types';

export function DataTable<T>({
  columns,
  data,
  filterConfigs = [],
  searchPlaceholder = 'Search records...',
  searchableKeys,
  emptyStateMessage = 'No records found.',
  emptyStateAction,
  className,
  selectable = true,
  getItemKey = (item: any, idx) => item?.id || item?.code || String(idx),
  onSelectionChange,
  bulkActions,
  isLoading = false,
  totalRecords: customTotalRecords,
  serverSide = false,
  onStateChange,
}: DataTableProps<T>) {
  const [storeMode, setStoreMode] = React.useState<StoreMode>('standalone');

  React.useEffect(() => {
    setStoreMode(getStoreModeClient());
  }, []);

  // Table State
  const [search, setSearch] = React.useState('');
  const [sorting, setSorting] = React.useState<SortingState>({ columnId: null, direction: null });
  const [filters, setFilters] = React.useState<FilterState>({});
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState<10 | 25 | 50 | 100>(10);
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(new Set());

  const getKey = React.useCallback(
    (item: T, idx: number) => getItemKey(item, idx),
    [getItemKey]
  );

  // Filter Handler
  const handleFilterChange = (filterId: string, value: FilterValue) => {
    setFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
    setPage(1); // Reset to page 1 on filter
  };

  const handleClearFilters = () => {
    setSearch('');
    setFilters({});
    setPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  // Sort Handler
  const handleSortChange = (columnId: string) => {
    setSorting((prev) => {
      if (prev.columnId !== columnId) {
        return { columnId, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { columnId, direction: 'desc' };
      }
      return { columnId: null, direction: null };
    });
  };

  // Client-Side Search & Filter Processing
  const filteredData = React.useMemo(() => {
    if (serverSide) return data;

    return data.filter((item) => {
      // 1. Text Search Filter
      if (search.trim() !== '') {
        const query = search.toLowerCase().trim();
        let matchesSearch = false;

        if (searchableKeys) {
          const keys = searchableKeys(item);
          matchesSearch = keys.some((k) => k?.toString().toLowerCase().includes(query));
        } else {
          // Fallback: search string properties in item
          matchesSearch = Object.values(item as any).some((val) => {
            if (val === null || val === undefined) return false;
            if (typeof val === 'string' || typeof val === 'number') {
              return val.toString().toLowerCase().includes(query);
            }
            if (typeof val === 'object' && val !== null) {
              return Object.values(val).some((subVal) =>
                subVal?.toString().toLowerCase().includes(query)
              );
            }
            return false;
          });
        }

        if (!matchesSearch) return false;
      }

      // 2. Custom Filter Config Matching
      for (const [filterId, filterVal] of Object.entries(filters)) {
        if (filterVal === null || filterVal === '' || filterVal === undefined || filterVal === 'all') {
          continue;
        }

        const itemVal = (item as any)[filterId];
        if (Array.isArray(filterVal)) {
          if (!(filterVal as any[]).map(String).includes(String(itemVal))) return false;
        } else {
          if (String(itemVal).toLowerCase() !== String(filterVal).toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [data, search, filters, searchableKeys, serverSide]);

  // Client-Side Column Sorting
  const sortedData = React.useMemo(() => {
    if (serverSide || !sorting.columnId || !sorting.direction) {
      return filteredData;
    }

    const col = columns.find(
      (c) => (c.id || c.sortKey || (typeof c.header === 'string' ? c.header.toLowerCase().replace(/\s+/g, '_') : '')) === sorting.columnId
    );

    return [...filteredData].sort((a, b) => {
      let valA: any = null;
      let valB: any = null;

      if (col?.sortValue) {
        valA = col.sortValue(a);
        valB = col.sortValue(b);
      } else if (col?.sortKey) {
        valA = (a as any)[col.sortKey];
        valB = (b as any)[col.sortKey];
      } else if (sorting.columnId) {
        valA = (a as any)[sorting.columnId];
        valB = (b as any)[sorting.columnId];
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      } else if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime();
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, { numeric: true, sensitivity: 'base' });
      }

      return sorting.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sorting, columns, serverSide]);

  // Client-Side Pagination Slicing
  const totalRecords = serverSide ? customTotalRecords || data.length : sortedData.length;

  const paginatedData = React.useMemo(() => {
    if (serverSide) return data;
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize, data, serverSide]);

  // Selection Logic
  const currentKeys = React.useMemo(
    () => paginatedData.map((item, idx) => getKey(item, idx)),
    [paginatedData, getKey]
  );

  const isAllSelected = paginatedData.length > 0 && currentKeys.every((key) => selectedKeys.has(key));
  const isSomeSelected = selectedKeys.size > 0 && !isAllSelected;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedKeys(new Set());
      onSelectionChange?.([], []);
    } else {
      const nextSet = new Set(currentKeys);
      setSelectedKeys(nextSet);
      onSelectionChange?.(currentKeys, [...paginatedData]);
    }
  };

  const handleSelectRow = (key: string, item: T) => {
    const nextSet = new Set(selectedKeys);
    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }
    setSelectedKeys(nextSet);

    const selectedItems = data.filter((d, idx) => nextSet.has(getKey(d, idx)));
    onSelectionChange?.(Array.from(nextSet), selectedItems);
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
    onSelectionChange?.([], []);
  };

  const selectedItems = React.useMemo(
    () => data.filter((d, idx) => selectedKeys.has(getKey(d, idx))),
    [data, selectedKeys, getKey]
  );

  // Notify parent component on state change if registered
  React.useEffect(() => {
    if (onStateChange) {
      onStateChange({
        page,
        pageSize,
        search,
        sorting,
        filters,
      });
    }
  }, [page, pageSize, search, sorting, filters, onStateChange]);

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Search & Dynamic Filters Toolbar */}
      <DataTableToolbar
        search={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        filterConfigs={filterConfigs}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        storeMode={storeMode}
      />

      {/* Multi-select Bulk Action Bar */}
      {selectable && selectedKeys.size > 0 && (
        <div className="flex items-center justify-between gap-4 bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs shadow-md border border-slate-800 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-3 font-semibold">
            <span className="bg-slate-800 text-slate-200 px-2.5 py-1 rounded text-[11px]">
              {selectedKeys.size} selected
            </span>
            <span className="text-slate-300">
              {selectedKeys.size} of {totalRecords} items chosen
            </span>
          </div>

          <div className="flex items-center gap-2">
            {bulkActions && bulkActions(Array.from(selectedKeys), selectedItems, clearSelection)}

            <button
              type="button"
              onClick={clearSelection}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white rounded text-xs font-semibold transition cursor-pointer"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Primary Table Container */}
      <div className={cn("overflow-x-auto w-full border-collapse rounded-lg border border-slate-200 shadow-2xs bg-white", className)}>
        <table className="w-full text-left border-collapse">
          <DataTableHeader
            columns={columns}
            sorting={sorting}
            onSortChange={handleSortChange}
            selectable={selectable}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            onSelectAll={handleSelectAll}
            storeMode={storeMode}
          />
          <DataTableBody
            columns={columns}
            data={paginatedData}
            selectable={selectable}
            selectedKeys={selectedKeys}
            onSelectRow={handleSelectRow}
            getItemKey={getKey}
            emptyStateMessage={emptyStateMessage}
            emptyStateAction={emptyStateAction}
            isLoading={isLoading}
            storeMode={storeMode}
          />
        </table>
      </div>

      {/* Footer Pagination Controls */}
      <DataTablePagination
        page={page}
        pageSize={pageSize}
        totalRecords={totalRecords}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
      />
    </div>
  );
}
