'use client';

import * as React from 'react';
import { deleteReviewAction } from '@/app/actions/admin-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  productName: string | null;
  customerName: string | null;
  customerEmail: string | null;
}

interface ReviewsListProps {
  initialReviews: ReviewItem[];
}

export function ReviewsList({ initialReviews }: ReviewsListProps) {
  const [isPending, startTransition] = React.useTransition();

  const tableData = React.useMemo(() => {
    return initialReviews.map((r) => ({
      ...r,
      createdAtDate: new Date(r.createdAt),
      ratingStr: String(r.rating),
    }));
  }, [initialReviews]);

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this customer review?')) return;
    startTransition(async () => {
      const res = await deleteReviewAction(id);
      if (res.success) {
        toast.success('Review deleted successfully');
      } else {
        toast.error(res.error || 'Failed to delete review');
      }
    });
  };

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'ratingStr',
        label: 'Star Rating',
        type: 'select',
        options: [
          { label: '5 Stars ★★★★★', value: '5' },
          { label: '4 Stars ★★★★☆', value: '4' },
          { label: '3 Stars ★★★☆☆', value: '3' },
          { label: '2 Stars ★★☆☆☆', value: '2' },
          { label: '1 Star ★☆☆☆☆', value: '1' },
        ],
      },
    ],
    []
  );

  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Product Name',
        sortable: true,
        sortValue: (row) => row.productName || '',
        cell: (row) => <span className="font-semibold text-slate-900 text-xs">{row.productName || 'Unknown Product'}</span>,
      },
      {
        header: 'Customer',
        sortable: true,
        sortValue: (row) => row.customerName || '',
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="text-slate-900 font-semibold text-xs">{row.customerName || 'Guest User'}</span>
            <span className="text-[10px] text-slate-400 font-mono">{row.customerEmail || '—'}</span>
          </div>
        ),
      },
      {
        header: 'Rating',
        sortable: true,
        sortValue: (row) => row.rating,
        cell: (row) => (
          <div className="flex items-center gap-1 text-amber-500 font-bold text-xs select-none">
            <Star className="h-3.5 w-3.5 fill-current" />
            <span>{row.rating} / 5</span>
          </div>
        ),
      },
      {
        header: 'Feedback / Comment',
        sortable: true,
        sortValue: (row) => row.comment || '',
        cell: (row) => <p className="text-slate-600 text-xs line-clamp-2 max-w-xs md:max-w-md">{row.comment || '—'}</p>,
      },
      {
        header: 'Created On',
        sortable: true,
        sortValue: (row) => row.createdAtDate,
        cell: (row) => (
          <span className="text-slate-500 text-xs font-mono">
            {row.createdAtDate.toLocaleDateString('en-IN', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end">
            <Button
              onClick={() => handleDelete(row.id)}
              disabled={isPending}
              variant="destructive"
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white cursor-pointer rounded"
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [isPending]
  );

  return (
    <DataTable
      columns={columns}
      data={tableData}
      filterConfigs={filterConfigs}
      searchPlaceholder="Search reviews by product or customer name..."
      searchableKeys={(item) => [item.productName || '', item.customerName || '', item.comment || '']}
      getItemKey={(item) => item.id}
      emptyStateMessage="No reviews match your active search filter."
    />
  );
}
export default ReviewsList;
