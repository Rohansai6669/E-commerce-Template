'use client';

import * as React from 'react';
import { updateTicketStatusAction, assignTicketAction } from '@/app/actions/ticket-actions';
import { Button } from '@/components/ui/button';
import { DataTable, type ColumnDef, type FilterConfig } from './data-table';
import { toast } from 'sonner';

interface TicketItem {
  id: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in-progress' | 'closed';
  assignedTo: string | null;
}

interface StaffItem {
  id: string;
  fullName: string | null;
}

interface TicketsListProps {
  initialTickets: TicketItem[];
  staffList: StaffItem[];
}

export function TicketsList({ initialTickets, staffList }: TicketsListProps) {
  const [isPending, startTransition] = React.useTransition();

  const handleCloseTicket = (id: string) => {
    startTransition(async () => {
      const res = await updateTicketStatusAction(id, 'closed');
      if (res.success) {
        toast.success('Ticket closed successfully');
      } else {
        toast.error(res.error || 'Failed to close ticket');
      }
    });
  };

  const handleAutoAssign = (id: string) => {
    if (staffList.length === 0) return;
    startTransition(async () => {
      const res = await assignTicketAction(id, staffList[0].id);
      if (res.success) {
        toast.success('Ticket assigned successfully');
      } else {
        toast.error(res.error || 'Failed to assign ticket');
      }
    });
  };

  const filterConfigs: FilterConfig[] = React.useMemo(
    () => [
      {
        id: 'status',
        label: 'Ticket Status',
        type: 'select',
        options: [
          { label: 'Open', value: 'open' },
          { label: 'In Progress', value: 'in-progress' },
          { label: 'Closed', value: 'closed' },
        ],
      },
      {
        id: 'priority',
        label: 'Priority',
        type: 'select',
        options: [
          { label: 'Urgent', value: 'urgent' },
          { label: 'High', value: 'high' },
          { label: 'Medium', value: 'medium' },
          { label: 'Low', value: 'low' },
        ],
      },
    ],
    []
  );

  const columns: ColumnDef<TicketItem>[] = React.useMemo(
    () => [
      {
        header: 'Ticket Subject',
        sortable: true,
        sortValue: (row) => row.subject,
        cell: (row) => (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-slate-900 text-xs">{row.subject}</span>
            <span className="text-[10px] text-slate-400 font-mono">ID: {row.id.slice(0, 8).toUpperCase()}</span>
          </div>
        ),
      },
      {
        header: 'Priority',
        sortable: true,
        sortValue: (row) => row.priority,
        cell: (row) => (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.priority === 'urgent' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
            row.priority === 'high' ? 'bg-amber-100 text-amber-800' :
            row.priority === 'medium' ? 'bg-slate-100 text-slate-700' :
            'bg-slate-50 text-slate-400'
          }`}>
            {row.priority}
          </span>
        ),
      },
      {
        header: 'Status',
        sortable: true,
        sortValue: (row) => row.status,
        cell: (row) => (
          <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            row.status === 'open' ? 'bg-amber-100 text-amber-800' :
            row.status === 'in-progress' ? 'bg-slate-950 text-white' :
            'bg-slate-100 text-slate-500'
          }`}>
            {row.status}
          </span>
        ),
      },
      {
        header: 'Assigned To',
        sortable: true,
        sortValue: (row) => staffList.find((s) => s.id === row.assignedTo)?.fullName || 'Unassigned',
        cell: (row) => {
          const assignee = staffList.find((s) => s.id === row.assignedTo);
          return <span className="text-slate-700 text-xs font-medium">{assignee ? assignee.fullName : 'Unassigned'}</span>;
        },
      },
      {
        header: 'Actions',
        sortable: false,
        className: 'text-right',
        cell: (row) => (
          <div className="flex items-center justify-end gap-2">
            {row.status !== 'closed' && (
              <Button
                onClick={() => handleCloseTicket(row.id)}
                disabled={isPending}
                variant="outline"
                className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
              >
                Close Ticket
              </Button>
            )}
            <Button
              onClick={() => handleAutoAssign(row.id)}
              disabled={isPending}
              variant="outline"
              className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded"
            >
              Auto Assign
            </Button>
          </div>
        ),
      },
    ],
    [staffList, isPending]
  );

  return (
    <DataTable
      columns={columns}
      data={initialTickets}
      filterConfigs={filterConfigs}
      searchPlaceholder="Search tickets by subject..."
      searchableKeys={(item) => [item.subject, item.id]}
      getItemKey={(item) => item.id}
      emptyStateMessage="No support tickets match your search filters."
    />
  );
}
export default TicketsList;
