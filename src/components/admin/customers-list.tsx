'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  toggleCustomerStatusAction,
  bulkUpdateCustomerStatusAction,
} from '@/app/actions/customer-actions';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { Button } from '@/components/ui/button';
import { EditCustomerSheet } from '@/components/admin/edit-customer-sheet';
import { toast } from 'sonner';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/core/utils/cn';

interface CustomerItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt: Date;
  isActive: boolean;
}

interface CustomersListProps {
  initialCustomers: CustomerItem[];
}

export function CustomersList({ initialCustomers }: CustomersListProps) {
  const router = useRouter();
  const [customers, setCustomers] = React.useState<CustomerItem[]>(initialCustomers);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setCustomers(initialCustomers);
  }, [initialCustomers]);

  // KPIs
  const totalCount = customers.length;
  const activeCount = customers.filter((c) => c.isActive).length;
  const staffAdminCount = customers.filter((c) => c.role === 'admin' || c.role === 'staff').length;
  const inactiveCount = totalCount - activeCount;

  // Enrich data for table display
  const tableData = React.useMemo(() => {
    return customers.map((c) => ({
      ...c,
      statusStr: c.isActive ? 'active' : 'inactive',
      createdAtDate: new Date(c.createdAt),
      displayName: c.fullName || c.email || 'Unnamed Account',
    }));
  }, [customers]);

  const handleToggleStatus = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const nextStatus = !currentStatus;
      const res = await toggleCustomerStatusAction(id, nextStatus);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isActive: nextStatus } : c))
        );
        toast.success(`Customer status updated to ${nextStatus ? 'ACTIVE' : 'INACTIVE'}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update customer status');
      }
    });
  };

  const handleBulkStatus = (targetStatus: boolean, selectedKeys: string[], clearSelection: () => void) => {
    if (selectedKeys.length === 0) return;

    startTransition(async () => {
      const res = await bulkUpdateCustomerStatusAction(selectedKeys, targetStatus);
      if (res.success) {
        setCustomers((prev) =>
          prev.map((c) => (selectedKeys.includes(c.id) ? { ...c, isActive: targetStatus } : c))
        );
        clearSelection();
        toast.success(`Updated ${selectedKeys.length} accounts to ${targetStatus ? 'ACTIVE' : 'INACTIVE'}`);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to bulk update customer accounts');
      }
    });
  };

  // Filter Configuration
  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'role',
        label: 'Role',
        type: 'select',
        options: [
          { label: 'Customer', value: 'customer' },
          { label: 'Supplier', value: 'supplier' },
          { label: 'Staff', value: 'staff' },
          { label: 'Admin', value: 'admin' },
        ],
      },
      {
        id: 'statusStr',
        label: 'Account Status',
        type: 'select',
        options: [
          { label: 'Active Only', value: 'active' },
          { label: 'Inactive Only', value: 'inactive' },
        ],
      },
    ],
    []
  );

  // Column Definitions
  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Customer Details',
        sortable: true,
        sortValue: (r) => r.displayName,
        cell: (user) => (
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.displayName}
                className="h-9 w-9 object-cover rounded-full border border-slate-200 shrink-0 bg-slate-50"
              />
            ) : (
              <div className="h-9 w-9 bg-slate-900 text-white rounded-full text-xs font-bold flex items-center justify-center shrink-0 uppercase">
                {user.displayName.slice(0, 2)}
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 truncate text-xs">
                {user.fullName || 'Unnamed Account'}
              </span>
              <span className="text-xs text-slate-500 font-mono truncate">
                {user.email || 'No email attached'}
              </span>
            </div>
          </div>
        ),
      },
      {
        header: 'Phone',
        sortable: true,
        sortValue: (r) => r.phone || '',
        cell: (user) => (
          <span className="text-xs font-mono text-slate-600">{user.phone || '—'}</span>
        ),
      },
      {
        header: 'Role',
        sortable: true,
        sortValue: (r) => r.role,
        cell: (user) => (
          <span
            className={cn(
              'px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider',
              user.role === 'admin'
                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                : user.role === 'staff'
                ? 'bg-blue-100 text-blue-900 border border-blue-200'
                : user.role === 'supplier'
                ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                : 'bg-slate-100 text-slate-700'
            )}
          >
            {user.role}
          </span>
        ),
      },
      {
        header: 'Registered Date',
        sortable: true,
        sortValue: (r) => r.createdAtDate,
        cell: (user) => (
          <span className="text-xs text-slate-500 font-mono">
            {user.createdAtDate.toLocaleDateString('en-IN', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (r) => (r.isActive ? 'Active' : 'Inactive'),
        cell: (user) => (
          <span
            className={cn(
              'px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider',
              user.isActive
                ? 'bg-slate-950 text-white'
                : 'bg-rose-100 text-rose-800 border border-rose-200'
            )}
          >
            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (user) => (
          <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
            <EditCustomerSheet customer={user} />

            <Button
              type="button"
              onClick={() => handleToggleStatus(user.id, user.isActive)}
              disabled={isPending}
              className={cn(
                'h-8 w-8 p-0 rounded flex items-center justify-center cursor-pointer border shrink-0 transition',
                user.isActive
                  ? 'bg-white border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
              )}
              title={user.isActive ? 'Deactivate Account' : 'Activate Account'}
            >
              {user.isActive ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
            </Button>
          </div>
        ),
      },
    ],
    [isPending]
  );

  return (
    <div className="flex flex-col gap-5 text-slate-900 font-sans w-full">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Accounts</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{totalCount}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{activeCount}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff & Admin Users</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{staffAdminCount}</span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive / Suspended</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{inactiveCount}</span>
        </div>
      </div>

      {/* Standardized DataTable Engine */}
      <DataTable
        columns={columns}
        data={tableData}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search customers by name, email, or phone..."
        searchableKeys={(item) => [item.fullName || '', item.email || '', item.phone || '']}
        getItemKey={(item) => item.id}
        bulkActions={(keys, selectedItems, clearSelection) => (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={() => handleBulkStatus(true, keys, clearSelection)}
              disabled={isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              <Unlock className="h-3.5 w-3.5 mr-1.5" />
              Activate Selected ({keys.length})
            </Button>
            <Button
              type="button"
              onClick={() => handleBulkStatus(false, keys, clearSelection)}
              disabled={isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Deactivate Selected ({keys.length})
            </Button>
          </div>
        )}
      />
    </div>
  );
}
export default CustomersList;
