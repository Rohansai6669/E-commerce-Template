'use client';

import * as React from 'react';
import { updateBrandAction, deleteBrandAction } from '@/app/actions/brand-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { DataTable, type ColumnDef } from './data-table';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface SupplierOption {
  id: string;
  name: string;
}

interface PermissionItem {
  brandId: string;
  supplierId: string;
}

interface BrandsListProps {
  initialBrands: BrandItem[];
  suppliers?: SupplierOption[];
  permissions?: PermissionItem[];
}

export function BrandsList({ initialBrands, suppliers = [], permissions = [] }: BrandsListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [editingBrand, setEditingBrand] = React.useState<BrandItem | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingBrand) return;

    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateBrandAction(editingBrand.id, formData);
      if (res.success) {
        toast.success('Brand updated successfully');
        setEditingBrand(null);
      } else {
        toast.error(res.error || 'Failed to update brand');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteBrandAction(id);
      if (res.success) {
        toast.success('Brand soft-deleted successfully');
        setDeletingId(null);
      } else {
        toast.error(res.error || 'Failed to delete brand');
      }
    });
  };

  const columns: ColumnDef<BrandItem>[] = React.useMemo(
    () => [
      {
        header: 'Brand Name',
        sortable: true,
        sortValue: (br) => br.name,
        cell: (br) => <span className="font-semibold text-slate-900">{br.name}</span>,
      },
      {
        header: 'Slug',
        sortable: true,
        sortValue: (br) => br.slug,
        cell: (br) => <span className="text-slate-450 font-mono text-xs">{br.slug}</span>,
      },
      {
        header: 'Fulfilled By (Suppliers)',
        requiresMarketplace: true,
        sortable: false,
        cell: (br) => {
          const assignedSupplierIds = permissions.filter((p) => p.brandId === br.id).map((p) => p.supplierId);
          const assignedSuppliers = suppliers.filter((s) => assignedSupplierIds.includes(s.id));

          if (assignedSuppliers.length === 0) {
            return <span className="text-slate-400 text-xs italic">Unassigned (No fulfillment constraint)</span>;
          }

          return (
            <div className="flex flex-wrap gap-1">
              {assignedSuppliers.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                >
                  ✓ {s.name}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        header: 'Description',
        sortable: true,
        sortValue: (br) => br.description || '',
        cell: (br) => <span className="text-slate-500 truncate max-w-xs block text-xs">{br.description || '—'}</span>,
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (br) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => setEditingBrand(br)}
              variant="outline"
              className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
            >
              Edit
            </Button>
            <Button
              onClick={() => setDeletingId(br.id)}
              variant="destructive"
              className="h-8 text-xs bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 cursor-pointer rounded"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [suppliers, permissions]
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={initialBrands}
        searchPlaceholder="Search brands by name or slug..."
        searchableKeys={(item) => [item.name, item.slug, item.description || '']}
        getItemKey={(item) => item.id}
        emptyStateMessage="No brands found matching your search query."
      />

      {/* Edit Dialog */}
      {editingBrand && (
        <Dialog open={!!editingBrand} onOpenChange={(open) => !open && setEditingBrand(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-900 font-bold">Edit Brand & Fulfillment Suppliers</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4 py-2">
              <input type="hidden" name="hasSupplierIdsInput" value="true" />
              <FormField label="Brand Name">
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={editingBrand.name}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950"
                />
              </FormField>

              <FormField label="Description">
                <Input
                  id="description"
                  name="description"
                  type="text"
                  defaultValue={editingBrand.description || ''}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950"
                />
              </FormField>

              <FormField label="Authorized Fulfilling Suppliers">
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto p-3 border border-slate-200 rounded bg-slate-50">
                  {suppliers.map((sup) => {
                    const isChecked = permissions.some(
                      (p) => p.brandId === editingBrand.id && p.supplierId === sup.id
                    );
                    return (
                      <label key={sup.id} className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                        <input
                          type="checkbox"
                          name="supplierIds"
                          value={sup.id}
                          defaultChecked={isChecked}
                          className="rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                        />
                        {sup.name}
                      </label>
                    );
                  })}
                  {suppliers.length === 0 && (
                    <span className="text-xs text-slate-400 italic">No active suppliers available.</span>
                  )}
                </div>
              </FormField>

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isPending} className="bg-slate-950 text-white font-bold cursor-pointer hover:bg-slate-900">
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <Dialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-600 font-bold">Delete Brand</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-slate-600">
              Are you sure you want to delete this brand? This will soft-delete the brand record.
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={() => handleDelete(deletingId)}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
export default BrandsList;
