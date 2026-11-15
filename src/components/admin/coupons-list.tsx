'use client';

import * as React from 'react';
import { toggleCouponAction, deleteCouponAction, updateCouponAction } from '@/app/actions/coupon-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { toast } from 'sonner';
import { Pencil, Trash2, Power } from 'lucide-react';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';

interface CouponItem {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderValue: string | null;
  usedCount: number;
  usageLimit: number | null;
  isActive: boolean;
}

interface CouponsListProps {
  initialCoupons: CouponItem[];
}

export function CouponsList({ initialCoupons }: CouponsListProps) {
  const [isPending, startTransition] = React.useTransition();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [editingCoupon, setEditingCoupon] = React.useState<CouponItem | null>(null);

  const tableData = React.useMemo(() => {
    return initialCoupons.map((c) => ({
      ...c,
      statusStr: c.isActive ? 'active' : 'inactive',
      discountValNum: parseFloat(c.discountValue),
    }));
  }, [initialCoupons]);

  const handleToggle = (id: string, currentStatus: boolean) => {
    startTransition(async () => {
      const res = await toggleCouponAction(id, currentStatus);
      if (res.success) {
        toast.success(`Coupon status updated successfully`);
      } else {
        toast.error(res.error || 'Failed to update coupon status');
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteCouponAction(id);
      if (res.success) {
        toast.success('Coupon soft-deleted successfully');
        setDeletingId(null);
      } else {
        toast.error(res.error || 'Failed to delete coupon');
      }
    });
  };

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'discountType',
        label: 'Discount Type',
        type: 'select',
        options: [
          { label: 'Percentage', value: 'percentage' },
          { label: 'Fixed Amount', value: 'fixed' },
        ],
      },
      {
        id: 'statusStr',
        label: 'Status',
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
      },
    ],
    []
  );

  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Code',
        sortable: true,
        sortValue: (c) => c.code,
        cell: (c) => <span className="font-mono font-bold text-slate-900 tracking-wider text-xs">{c.code}</span>,
      },
      {
        header: 'Type',
        sortable: true,
        sortValue: (c) => c.discountType,
        cell: (c) => <span className="text-slate-600 text-xs uppercase font-semibold">{c.discountType}</span>,
      },
      {
        header: 'Value',
        sortable: true,
        sortValue: (c) => c.discountValNum,
        cell: (c) => (
          <span className="font-bold text-slate-900 text-xs">
            {c.discountType === 'percentage' ? `${c.discountValNum}%` : `₹${c.discountValNum.toFixed(2)}`}
          </span>
        ),
      },
      {
        header: 'Min Order',
        sortable: true,
        sortValue: (c) => (c.minOrderValue ? parseFloat(c.minOrderValue) : 0),
        cell: (c) => <span className="text-slate-500 text-xs">{c.minOrderValue ? `₹${parseFloat(c.minOrderValue).toFixed(2)}` : '—'}</span>,
      },
      {
        header: 'Redemptions',
        sortable: true,
        sortValue: (c) => c.usedCount,
        cell: (c) => (
          <span className="text-slate-600 font-semibold text-xs">
            {c.usedCount} {c.usageLimit !== null ? `/ ${c.usageLimit}` : 'used'}
          </span>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (c) => (c.isActive ? 'Active' : 'Inactive'),
        cell: (c) => (
          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
            c.isActive
              ? 'bg-slate-950 text-white'
              : 'bg-slate-100 text-slate-500'
          }`}>
            {c.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (c) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button
              type="button"
              onClick={() => setEditingCoupon(c)}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
              title="Edit Coupon"
            >
              <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
            </Button>
            <Button
              type="button"
              onClick={() => handleToggle(c.id, c.isActive)}
              variant="outline"
              size="sm"
              className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
              title={c.isActive ? 'Deactivate' : 'Activate'}
            >
              <Power className="w-3.5 h-3.5 mr-1 text-slate-500" />
              {c.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              type="button"
              onClick={() => setDeletingId(c.id)}
              variant="destructive"
              size="sm"
              className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2 cursor-pointer rounded"
              title="Delete Coupon"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        filterConfigs={filterConfigs}
        searchPlaceholder="Search coupons by promo code..."
        searchableKeys={(item) => [item.code]}
        getItemKey={(item) => item.id}
        emptyStateMessage="No coupons match your active query."
      />

      {/* Edit Coupon Dialog */}
      {editingCoupon && (
        <Dialog open={!!editingCoupon} onOpenChange={(open) => !open && setEditingCoupon(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-slate-950 font-bold uppercase tracking-tight">
                Edit Coupon: {editingCoupon.code}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await updateCouponAction(editingCoupon.id, formData);
                  if (res.success) {
                    toast.success('Coupon updated successfully!');
                    setEditingCoupon(null);
                  } else {
                    toast.error(res.error || 'Failed to update coupon');
                  }
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <FormField label="Coupon Code">
                <Input
                  id="edit-coupon-code"
                  name="code"
                  type="text"
                  defaultValue={editingCoupon.code}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm uppercase font-semibold"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Discount Type">
                  <select
                    id="edit-coupon-discountType"
                    name="discountType"
                    defaultValue={editingCoupon.discountType}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <Input
                    id="edit-coupon-discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingCoupon.discountValue}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Min Order Value (₹)">
                  <Input
                    id="edit-coupon-minOrderValue"
                    name="minOrderValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingCoupon.minOrderValue || ''}
                    placeholder="Optional"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>

                <FormField label="Usage Limit">
                  <Input
                    id="edit-coupon-usageLimit"
                    name="usageLimit"
                    type="number"
                    defaultValue={editingCoupon.usageLimit || ''}
                    placeholder="Optional"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>
              </div>

              <DialogFooter className="mt-4 gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
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
              <DialogTitle className="text-rose-600 font-bold">Delete Coupon</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-slate-600">
              Are you sure you want to delete this coupon? This will soft-delete the coupon so historical records remain valid.
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
export default CouponsList;
