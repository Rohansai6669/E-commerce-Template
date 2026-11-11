'use client';

import * as React from 'react';
import { updateSupplierStatusAction, updateSupplierBrandsAction } from '@/app/actions/supplier-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { toast } from 'sonner';
import { EditSupplierSheet } from '@/components/admin/edit-supplier-sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface SupplierItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commissionRate: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
}

interface BrandOption {
  id: string;
  name: string;
}

interface PermissionItem {
  brandId: string;
  supplierId: string;
}

interface AddressItem {
  id: string;
  supplierId: string;
  contactName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface SuppliersListProps {
  initialSuppliers: SupplierItem[];
  brands?: BrandOption[];
  permissions?: PermissionItem[];
  addresses?: AddressItem[];
}

export function SuppliersList({
  initialSuppliers,
  brands = [],
  permissions = [],
  addresses = [],
}: SuppliersListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [editingBrandsSupplier, setEditingBrandsSupplier] = React.useState<SupplierItem | null>(null);

  const tableData = React.useMemo(() => {
    return initialSuppliers.map((s) => ({
      ...s,
      commissionVal: parseFloat(s.commissionRate),
    }));
  }, [initialSuppliers]);

  const handleStatusToggle = (id: string, currentStatus: string) => {
    const targetStatus = currentStatus === 'active' ? 'suspended' : 'active';
    startTransition(async () => {
      const res = await updateSupplierStatusAction(id, targetStatus);
      if (res.success) {
        toast.success(`Supplier boutique status updated successfully`);
      } else {
        toast.error(res.error || 'Failed to update boutique status');
      }
    });
  };

  const handleBrandsUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBrandsSupplier) return;

    const formData = new FormData(e.currentTarget);
    const brandIds = formData.getAll('brandIds') as string[];

    startTransition(async () => {
      const res = await updateSupplierBrandsAction(editingBrandsSupplier.id, brandIds);
      if (res.success) {
        toast.success('Authorized brands updated successfully');
        setEditingBrandsSupplier(null);
      } else {
        toast.error(res.error || 'Failed to update authorized brands');
      }
    });
  };

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Pending', value: 'pending' },
          { label: 'Suspended', value: 'suspended' },
          { label: 'Rejected', value: 'rejected' },
        ],
      },
    ],
    []
  );

  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Boutique Details',
        sortable: true,
        sortValue: (row) => row.name,
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-950 text-xs">{row.name}</span>
            <span className="text-[11px] text-slate-500 font-mono">{row.email}</span>
            {row.phone && <span className="text-[11px] text-slate-500">{row.phone}</span>}
          </div>
        ),
      },
      {
        header: 'Pickup Address',
        sortable: false,
        cell: (row) => {
          const addr = addresses.find((a) => a.supplierId === row.id);
          if (!addr || !addr.addressLine1) {
            return <span className="text-slate-400 text-xs italic">No address provided</span>;
          }

          return (
            <div className="flex flex-col text-xs text-slate-700 max-w-xs leading-snug">
              <span className="font-medium truncate">{addr.addressLine1}</span>
              <span className="text-[11px] text-slate-500">
                {[addr.city, addr.state, addr.postalCode].filter(Boolean).join(', ')}
              </span>
            </div>
          );
        },
      },
      {
        header: 'Commission',
        sortable: true,
        sortValue: (row) => row.commissionVal,
        cell: (row) => <span className="font-bold text-slate-900 text-xs">{row.commissionRate}%</span>,
      },
      {
        header: 'Authorized Brands',
        sortable: false,
        cell: (row) => {
          const assignedBrandIds = permissions.filter((p) => p.supplierId === row.id).map((p) => p.brandId);
          const assignedBrands = brands.filter((b) => assignedBrandIds.includes(b.id));

          if (assignedBrands.length === 0) {
            return <span className="text-slate-400 text-xs italic">No brand permissions</span>;
          }

          return (
            <div className="flex flex-wrap gap-1 max-w-xs">
              {assignedBrands.map((b) => (
                <span
                  key={b.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                >
                  {b.name}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.status === 'active' ? 'bg-slate-950 text-white' :
            row.status === 'pending' ? 'bg-slate-100 text-slate-600' :
            'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (row) => {
          const matchedAddr = addresses.find((a) => a.supplierId === row.id) || null;
          return (
            <div className="flex justify-end gap-2 items-center">
              <EditSupplierSheet supplier={row} address={matchedAddr} />

              <Button
                onClick={() => setEditingBrandsSupplier(row)}
                variant="outline"
                className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
              >
                Manage Brands
              </Button>

              <Button
                onClick={() => handleStatusToggle(row.id, row.status)}
                disabled={isPending}
                variant="outline"
                className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
              >
                {row.status === 'active' ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          );
        },
      },
    ],
    [addresses, permissions, brands, isPending]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search boutiques by name, email, or phone..."
        searchableKeys={(item) => [item.name, item.email, item.phone || '']}
        getItemKey={(item) => item.id}
        emptyStateMessage="No boutiques have registered yet. Click 'Register Boutique' above to add one."
      />

      {/* Edit Authorized Brands Modal */}
      {editingBrandsSupplier && (
        <Dialog open={!!editingBrandsSupplier} onOpenChange={(open) => !open && setEditingBrandsSupplier(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold">Authorized Brands — {editingBrandsSupplier.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBrandsUpdate} className="flex flex-col gap-4 py-2">
              <div className="text-xs text-slate-500">
                Select which catalog brands this boutique is authorized to stock and fulfill.
              </div>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto p-3 border border-slate-200 rounded bg-slate-50">
                {brands.map((b) => {
                  const isChecked = permissions.some(
                    (p) => p.supplierId === editingBrandsSupplier.id && p.brandId === b.id
                  );
                  return (
                    <label key={b.id} className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        name="brandIds"
                        value={b.id}
                        defaultChecked={isChecked}
                        className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                      />
                      {b.name}
                    </label>
                  );
                })}
                {brands.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No registered catalog brands available.</span>
                )}
              </div>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending} className="bg-slate-950 text-white font-bold cursor-pointer hover:bg-slate-900">
                  {isPending ? 'Saving...' : 'Save Permissions'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
export default SuppliersList;
