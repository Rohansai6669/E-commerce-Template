'use client';

import * as React from 'react';
import { transitionSupplierProductStatusAction } from '@/app/actions/supplier-approval-actions';
import { DataTable, type ColumnDef, type FilterConfig } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { CheckCircle, XCircle, AlertTriangle, History, Shield, Clock } from 'lucide-react';

interface SupplierApprovalPanelProps {
  listings: Array<{
    listing: {
      id: string;
      productId: string;
      supplierId: string;
      approvalStatus: string;
      rejectionReason: string | null;
      reviewedAt: Date | null;
      createdAt: Date;
    };
    product: {
      id: string;
      name: string;
      sku: string | null;
      price: string;
    };
    supplier: {
      id: string;
      name: string;
    };
    reviewer: {
      id: string;
      fullName: string | null;
    } | null;
  }>;
  events: Array<{
    event: {
      id: string;
      supplierProductId: string;
      fromStatus: string;
      toStatus: string;
      reason: string | null;
      createdAt: Date;
    };
    actor: {
      id: string;
      fullName: string | null;
    };
  }>;
}

export function SupplierApprovalPanel({ listings, events }: SupplierApprovalPanelProps) {
  const [isPending, startTransition] = React.useTransition();
  const [activeTab, setActiveTab] = React.useState<'pending' | 'approved' | 'rejected' | 'all' | 'history'>('pending');

  // Rejection Modal State
  const [rejectingListingId, setRejectingListingId] = React.useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = React.useState('');

  const handleTransition = (listingId: string, status: 'under_review' | 'approved' | 'active' | 'rejected' | 'suspended', reason?: string) => {
    startTransition(async () => {
      const res = await transitionSupplierProductStatusAction(listingId, status, reason);
      if (res.success) {
        toast.success(`Listing status updated to '${status}'.`);
        setRejectingListingId(null);
        setRejectionReasonInput('');
      } else {
        toast.error(res.error || 'Failed to update approval status.');
      }
    });
  };

  const filteredListings = React.useMemo(() => {
    if (activeTab === 'pending') {
      return listings.filter(l => l.listing.approvalStatus === 'submitted' || l.listing.approvalStatus === 'under_review' || l.listing.approvalStatus === 'draft');
    }
    if (activeTab === 'approved') {
      return listings.filter(l => l.listing.approvalStatus === 'approved' || l.listing.approvalStatus === 'active');
    }
    if (activeTab === 'rejected') {
      return listings.filter(l => l.listing.approvalStatus === 'rejected' || l.listing.approvalStatus === 'suspended');
    }
    return listings;
  }, [listings, activeTab]);

  const columns: ColumnDef<typeof listings[0]>[] = React.useMemo(() => [
    {
      header: 'Boutique & Product',
      sortable: true,
      sortValue: (r) => r.product.name,
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">
            {row.product.name}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span>SKU: {row.product.sku || 'N/A'}</span>
            <span>•</span>
            <span className="font-bold text-indigo-600 font-sans">{row.supplier.name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Base Price',
      sortable: true,
      sortValue: (r) => parseFloat(r.product.price),
      cell: (row) => (
        <span className="font-bold text-slate-900 text-xs">
          ₹{parseFloat(row.product.price).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      header: 'Status',
      sortable: true,
      sortValue: (r) => r.listing.approvalStatus,
      cell: (row) => {
        const s = row.listing.approvalStatus;
        if (s === 'approved' || s === 'active') {
          return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-300">Active</span>;
        }
        if (s === 'rejected') {
          return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-rose-300">Rejected</span>;
        }
        if (s === 'suspended') {
          return <span className="bg-slate-200 text-slate-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-slate-300">Suspended</span>;
        }
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-amber-300">Pending Review</span>;
      },
    },
    {
      header: 'Last Reviewed',
      sortable: true,
      sortValue: (r) => r.listing.reviewedAt?.getTime() || 0,
      cell: (row) => (
        <div className="flex flex-col text-[11px] text-slate-500">
          <span>{row.listing.reviewedAt ? new Date(row.listing.reviewedAt).toLocaleDateString() : 'Never'}</span>
          {row.reviewer && <span className="text-[10px] text-slate-400">by {row.reviewer.fullName || 'Admin'}</span>}
        </div>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cell: (row) => {
        const s = row.listing.approvalStatus;
        return (
          <div className="flex items-center justify-end gap-1.5">
            {s !== 'approved' && s !== 'active' && (
              <Button
                type="button"
                onClick={() => handleTransition(row.listing.id, 'approved')}
                disabled={isPending}
                className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold uppercase rounded cursor-pointer"
              >
                <CheckCircle className="w-3 h-3 mr-1" /> Approve
              </Button>
            )}

            {s !== 'rejected' && (
              <Button
                type="button"
                onClick={() => setRejectingListingId(row.listing.id)}
                disabled={isPending}
                className="h-7 px-2.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold uppercase rounded cursor-pointer"
              >
                <XCircle className="w-3 h-3 mr-1" /> Reject
              </Button>
            )}

            {(s === 'approved' || s === 'active') && (
              <Button
                type="button"
                onClick={() => handleTransition(row.listing.id, 'suspended', 'Suspended by Admin moderation')}
                disabled={isPending}
                className="h-7 px-2 bg-slate-700 hover:bg-slate-800 text-white text-[11px] font-bold uppercase rounded cursor-pointer"
              >
                <AlertTriangle className="w-3 h-3" />
              </Button>
            )}
          </div>
        );
      },
    },
  ], [isPending]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Pending ({listings.filter(l => l.listing.approvalStatus === 'submitted' || l.listing.approvalStatus === 'under_review').length})
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'approved' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" /> Approved ({listings.filter(l => l.listing.approvalStatus === 'approved' || l.listing.approvalStatus === 'active').length})
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rejected' ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" /> Rejected ({listings.filter(l => l.listing.approvalStatus === 'rejected').length})
        </button>

        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer ${
            activeTab === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Listings ({listings.length})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer ml-auto flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Event Log ({events.length})
        </button>
      </div>

      {/* Rejection Modal */}
      {rejectingListingId && (
        <div className="p-4 rounded-lg border border-rose-200 bg-rose-50/70 flex flex-col gap-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Provide Rejection Feedback Reason
            </span>
            <button
              onClick={() => setRejectingListingId(null)}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={rejectionReasonInput}
              onChange={(e) => setRejectionReasonInput(e.target.value)}
              placeholder="e.g. Missing required care instructions or incomplete specs..."
              className="bg-white border-rose-300 text-xs h-9"
              autoFocus
            />
            <Button
              type="button"
              onClick={() => handleTransition(rejectingListingId, 'rejected', rejectionReasonInput)}
              disabled={isPending || !rejectionReasonInput.trim()}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold h-9 px-4 shrink-0 cursor-pointer"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      )}

      {/* Render Main DataTable or Audit Timeline */}
      {activeTab !== 'history' ? (
        <DataTable
          columns={columns}
          data={filteredListings}
          searchPlaceholder="Search listings by product name or SKU..."
          searchableKeys={(item) => [item.product.name, item.product.sku || '', item.supplier.name]}
        />
      ) : (
        <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
            Recent Approval Audit Events History
          </h4>

          {events.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No approval events logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div key={ev.event.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-slate-100 bg-slate-50/50 text-xs gap-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">{ev.event.fromStatus} ➔ {ev.event.toStatus}</span>
                      <span className="text-[10px] text-slate-400">({new Date(ev.event.createdAt).toLocaleString()})</span>
                    </div>
                    {ev.event.reason && <span className="text-slate-600 text-[11px]">Reason: {ev.event.reason}</span>}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                    Actor: {ev.actor.fullName || 'Admin'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
