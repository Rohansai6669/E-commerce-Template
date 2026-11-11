'use client';

import * as React from 'react';
import { toggleCouponAction, deleteCouponAction } from '@/app/actions/coupon-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { toast } from 'sonner';
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
          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => handleToggle(c.id, c.isActive)}
              variant="outline"
              className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
            >
              {c.isActive ? 'Deactivate' : 'Activate'}
            </Button>
            <Button
              onClick={() => setDeletingId(c.id)}
              variant="destructive"
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer rounded"
            >
              Delete
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
