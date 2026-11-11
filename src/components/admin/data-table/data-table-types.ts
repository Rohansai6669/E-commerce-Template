import * as React from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortingState {
  columnId: string | null;
  direction: SortDirection;
}

export type FilterValue = string | number | boolean | string[] | [number, number] | null;
export type FilterState = Record<string, FilterValue>;

export interface DataTableState {
  page: number;
  pageSize: 10 | 25 | 50 | 100;
  search: string;
  sorting: SortingState;
  filters: FilterState;
}

export interface ColumnDef<T> {
  id?: string;
  header: string | React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  sortKey?: string;
  sortValue?: (item: T) => string | number | Date | boolean | null | undefined;
  requiresMarketplace?: boolean;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'multi-select' | 'range' | 'boolean';
  options?: FilterOption[];
  placeholder?: string;
  requiresMarketplace?: boolean;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  filterConfigs?: FilterConfig[];
  searchPlaceholder?: string;
  searchableKeys?: (item: T) => string[];
  emptyStateMessage?: string;
  emptyStateAction?: React.ReactNode;
  className?: string;
  selectable?: boolean;
  getItemKey?: (item: T, index: number) => string;
  onSelectionChange?: (selectedKeys: string[], selectedItems: T[]) => void;
  bulkActions?: (selectedKeys: string[], selectedItems: T[], clearSelection: () => void) => React.ReactNode;
  isLoading?: boolean;
  // Server pagination props for future API extension
  totalRecords?: number;
  serverSide?: boolean;
  onStateChange?: (state: DataTableState) => void;
}
