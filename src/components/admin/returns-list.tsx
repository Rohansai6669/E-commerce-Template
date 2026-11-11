'use client';

import * as React from 'react';
import { moderateReturnQCAction } from '@/app/actions/return-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

interface ReturnItem {
  id: string;
  reason: string;
  qcResult: string | null;
  status: 'requested' | 'approved' | 'item_received' | 'qc_passed' | 'qc_failed' | 'refunded' | 'rejected';
  refundAmount: string | null;
}

interface ReturnsListProps {
  initialReturns: ReturnItem[];
}

export function ReturnsList({ initialReturns }: ReturnsListProps) {
  const [isPending, startTransition] = React.useTransition();

  const tableData = React.useMemo(() => {
    return initialReturns.map((r) => ({
      ...r,
      refundVal: parseFloat(r.refundAmount || '0'),
      qcResultStr: r.qcResult || 'not_audited',
    }));
  }, [initialReturns]);

  const handleAction = (payload: any, successMessage: string) => {
    startTransition(async () => {
      const res = await moderateReturnQCAction(payload);
      if (res.success) {
        toast.success(successMessage);
      } else {
        toast.error(res.error || 'Failed to perform returns action');
      }
    });
  };

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'status',
        label: 'Return Status',
        type: 'select',
        options: [
          { label: 'Requested', value: 'requested' },
          { label: 'Approved', value: 'approved' },
          { label: 'Item Received', value: 'item_received' },
          { label: 'QC Passed', value: 'qc_passed' },
          { label: 'QC Failed', value: 'qc_failed' },
          { label: 'Refunded', value: 'refunded' },
          { label: 'Rejected', value: 'rejected' },
        ],
      },
      {
        id: 'qcResultStr',
        label: 'QC Audit Result',
        type: 'select',
        options: [
          { label: 'QC Passed', value: 'pass' },
          { label: 'QC Failed', value: 'fail' },
          { label: 'Not Audited', value: 'not_audited' },
        ],
      },
    ],
    []
  );

  const columns: ColumnDef<typeof tableData[0]>[] = React.useMemo(
    () => [
      {
        header: 'Return Reason',
        sortable: true,
        sortValue: (row) => row.reason,
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-900 text-xs">{row.reason}</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {row.id.slice(0, 8).toUpperCase()}</span>
          </div>
        ),
      },
      {
        header: 'QC Status',
        sortable: true,
        sortValue: (row) => row.qcResultStr,
        cell: (row) => {
          if (row.qcResult) {
            return (
              <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-max uppercase tracking-wider ${
                row.qcResult === 'pass' ? 'bg-slate-100 text-slate-900' : 'bg-rose-50 text-rose-700 border border-rose-100'
              }`}>
                {row.qcResult === 'pass' ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
                QC {row.qcResult}
              </span>
            );
          }
          return <span className="text-xs text-slate-450 italic">Not Audited</span>;
        },
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.status === 'refunded' ? 'bg-slate-950 text-white' :
            row.status === 'qc_passed' ? 'bg-slate-100 text-slate-700' :
            row.status === 'qc_failed' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
            'bg-amber-100 text-amber-800'
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        header: 'Refund Amount',
        sortable: true,
        sortValue: (row) => row.refundVal,
        cell: (row) => (
          <span className="font-bold text-slate-900 text-xs">
            {row.refundVal.toLocaleString('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0,
            })}
          </span>
        ),
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            {row.status === 'requested' && (
              <Button
                onClick={() => handleAction({ returnId: row.id, status: 'approved' }, 'Return request approved')}
                disabled={isPending}
                variant="outline"
                className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
              >
                Approve Request
              </Button>
            )}
            {row.status === 'approved' && (
              <Button
                onClick={() => handleAction({ returnId: row.id, status: 'item_received' }, 'Item receipt confirmed')}
                disabled={isPending}
                variant="outline"
                className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
              >
                Confirm Item Received
              </Button>
            )}
            {row.status === 'item_received' && (
              <>
                <Button
                  onClick={() =>
                    handleAction(
                      {
                        returnId: row.id,
                        status: 'qc_passed',
                        qcResult: 'pass',
                        inspectionNotes: 'QC Passed - original packaging complete.',
                      },
                      'QC verification passed'
                    )
                  }
                  disabled={isPending}
                  variant="outline"
                  className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
                >
                  QC Pass
                </Button>
                <Button
                  onClick={() =>
                    handleAction(
                      {
                        returnId: row.id,
                        status: 'qc_failed',
                        qcResult: 'fail',
                        inspectionNotes: 'QC Failed - packaging damaged.',
                      },
                      'QC verification failed'
                    )
                  }
                  disabled={isPending}
                  variant="outline"
                  className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
                >
                  QC Fail
                </Button>
              </>
            )}
            {(row.status === 'qc_passed' || row.status === 'qc_failed') && (
              <Button
                onClick={() =>
                  handleAction(
                    {
                      returnId: row.id,
                      status: 'refunded',
                      refundAmount: row.refundVal,
                    },
                    'Refund ledger credit processed'
                  )
                }
                disabled={isPending}
                className="h-8 text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-900 px-3 cursor-pointer rounded"
              >
                Issue Refund
              </Button>
            )}
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
      searchPlaceholder="Search return requests by reason..."
      searchableKeys={(item) => [item.reason, item.id]}
      getItemKey={(item) => item.id}
      emptyStateMessage="No return requests match your search query."
    />
  );
}
export default ReturnsList;
