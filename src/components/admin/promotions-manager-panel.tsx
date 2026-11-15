'use client';

import * as React from 'react';
import { DataTable, type ColumnDef } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Sparkles, Percent, Ticket, History, Plus, Pencil, Trash2, Power, Wand2 } from 'lucide-react';
import { CouponsList } from '@/components/admin/coupons-list';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { createCouponAction } from '@/app/actions/coupon-actions';
import {
  createCampaignAction,
  updateCampaignAction,
  toggleCampaignStatusAction,
  deleteCampaignAction,
  bulkDeleteCampaignsAction,
  cleanupDuplicateCampaignsAction,
  createOfferAction,
  updateOfferAction,
  toggleOfferStatusAction,
  deleteOfferAction,
  bulkDeleteOffersAction,
} from '@/app/actions/promotion-actions';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface CampaignItem {
  id: string;
  name: string;
  description?: string | null;
  discountType: string;
  discountValue: string;
  startsAt: Date;
  endsAt: Date;
  status: string;
  priority: number;
}

interface OfferItem {
  id: string;
  title: string;
  ownerType: string;
  productId?: string | null;
  discountType: string;
  discountValue: string;
  status: string;
  priority: number;
}

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

interface EventItem {
  id: string;
  entityType: string;
  action: string;
  reason: string | null;
  createdAt: Date;
}

interface PromotionsManagerPanelProps {
  campaigns: CampaignItem[];
  offers: OfferItem[];
  coupons: CouponItem[];
  events: EventItem[];
}

function toDateTimeLocalString(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return '';
  }
}

function formatDateDeterministic(dateInput?: Date | string | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '—';
  }
}

function formatDateTimeDeterministic(dateInput?: Date | string | null): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '—';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${mins}`;
  } catch {
    return '—';
  }
}

export function PromotionsManagerPanel({ campaigns, offers, coupons, events }: PromotionsManagerPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'campaigns' | 'offers' | 'coupons' | 'events'>('campaigns');
  const [isPending, startTransition] = React.useTransition();

  // Campaign State
  const [editingCampaign, setEditingCampaign] = React.useState<CampaignItem | null>(null);
  const [deletingCampaignId, setDeletingCampaignId] = React.useState<string | null>(null);

  // Offer State
  const [editingOffer, setEditingOffer] = React.useState<OfferItem | null>(null);
  const [deletingOfferId, setDeletingOfferId] = React.useState<string | null>(null);

  // Handlers for Campaigns
  const handleToggleCampaignStatus = (campaign: CampaignItem) => {
    startTransition(async () => {
      const res = await toggleCampaignStatusAction(campaign.id, campaign.status);
      if (res.success) {
        toast.success(`Campaign status toggled successfully.`);
      } else {
        toast.error(res.error || 'Failed to toggle campaign status.');
      }
    });
  };

  const handleDeleteCampaign = (id: string) => {
    startTransition(async () => {
      const res = await deleteCampaignAction(id);
      if (res.success) {
        toast.success('Campaign deleted successfully.');
        setDeletingCampaignId(null);
      } else {
        toast.error(res.error || 'Failed to delete campaign.');
      }
    });
  };

  const handlePruneDuplicates = () => {
    startTransition(async () => {
      const res = await cleanupDuplicateCampaignsAction();
      if (res.success) {
        toast.success(`Cleaned up ${res.removedCount ?? 0} duplicate campaigns!`);
      } else {
        toast.error(res.error || 'Failed to clean up duplicates.');
      }
    });
  };

  // Handlers for Offers
  const handleToggleOfferStatus = (offer: OfferItem) => {
    startTransition(async () => {
      const res = await toggleOfferStatusAction(offer.id, offer.status);
      if (res.success) {
        toast.success(`Offer status toggled successfully.`);
      } else {
        toast.error(res.error || 'Failed to toggle offer status.');
      }
    });
  };

  const handleDeleteOffer = (id: string) => {
    startTransition(async () => {
      const res = await deleteOfferAction(id);
      if (res.success) {
        toast.success('Offer deleted successfully.');
        setDeletingOfferId(null);
      } else {
        toast.error(res.error || 'Failed to delete offer.');
      }
    });
  };

  // Campaign Columns with Full CRUD Actions
  const campaignColumns: ColumnDef<CampaignItem>[] = React.useMemo(() => [
    {
      header: 'Campaign Name',
      sortable: true,
      sortValue: (c) => c.name,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900 text-xs uppercase">{row.name}</span>
          {row.description && (
            <span className="text-xs text-slate-600 line-clamp-1">{row.description}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Discount',
      sortable: true,
      sortValue: (c) => parseFloat(c.discountValue),
      cell: (row) => (
        <span className="font-bold text-indigo-700 text-xs">
          {row.discountType === 'percentage' ? `${row.discountValue}% OFF` : `₹${row.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Priority',
      sortable: true,
      sortValue: (c) => c.priority,
      cell: (row) => <span className="text-xs font-mono font-bold text-slate-900">P-{row.priority}</span>,
    },
    {
      header: 'Status',
      sortable: true,
      sortValue: (c) => c.status,
      cell: (row) => (
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
            row.status === 'active'
              ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
              : 'bg-slate-100 text-slate-800 border-slate-300'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Validity Period',
      sortable: true,
      sortValue: (c) => new Date(c.startsAt).getTime(),
      cell: (row) => (
        <span suppressHydrationWarning className="text-xs text-slate-700 font-mono font-medium">
          {formatDateDeterministic(row.startsAt)} ➔ {formatDateDeterministic(row.endsAt)}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditingCampaign(row)}
            className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
            title="Edit Campaign"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleCampaignStatus(row)}
            disabled={isPending}
            className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
            title={row.status === 'active' ? 'End Campaign' : 'Activate Campaign'}
          >
            <Power className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {row.status === 'active' ? 'End' : 'Activate'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeletingCampaignId(row.id)}
            disabled={isPending}
            className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2 cursor-pointer rounded"
            title="Delete Campaign"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      ),
    },
  ], [isPending]);

  // Offer Columns with Full CRUD Actions
  const offerColumns: ColumnDef<OfferItem>[] = React.useMemo(() => [
    {
      header: 'Offer Title',
      sortable: true,
      sortValue: (o) => o.title,
      cell: (row) => <span className="font-bold text-slate-900 text-xs">{row.title}</span>,
    },
    {
      header: 'Owner',
      sortable: true,
      sortValue: (o) => o.ownerType,
      cell: (row) => (
        <span
          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
            row.ownerType === 'supplier' ? 'bg-purple-100 text-purple-800' : 'bg-slate-900 text-white'
          }`}
        >
          {row.ownerType}
        </span>
      ),
    },
    {
      header: 'Discount',
      sortable: true,
      sortValue: (o) => parseFloat(o.discountValue),
      cell: (row) => (
        <span className="font-bold text-indigo-600 text-xs">
          {row.discountType === 'percentage' ? `${row.discountValue}% OFF` : `₹${row.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Status',
      sortable: true,
      sortValue: (o) => o.status,
      cell: (row) => (
        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-300">
          {row.status}
        </span>
      ),
    },
    {
      header: 'Actions',
      sortable: false,
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditingOffer(row)}
            className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
            title="Edit Offer"
          >
            <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleToggleOfferStatus(row)}
            disabled={isPending}
            className="h-7 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 px-2 cursor-pointer rounded"
            title={row.status === 'active' ? 'Pause Offer' : 'Activate Offer'}
          >
            <Power className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {row.status === 'active' ? 'Pause' : 'Activate'}
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setDeletingOfferId(row.id)}
            disabled={isPending}
            className="h-7 text-xs bg-rose-600 hover:bg-rose-700 text-white px-2 cursor-pointer rounded"
            title="Delete Offer"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
          </Button>
        </div>
      ),
    },
  ], [isPending]);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'campaigns' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Campaigns ({campaigns.length})
        </button>

        <button
          onClick={() => setActiveTab('offers')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'offers' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Percent className="w-3.5 h-3.5" /> Offers ({offers.length})
        </button>

        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'coupons' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Ticket className="w-3.5 h-3.5" /> Coupons ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`px-3 py-1.5 text-xs font-bold uppercase rounded-md transition cursor-pointer ml-auto flex items-center gap-1.5 ${
            activeTab === 'events' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <History className="w-3.5 h-3.5" /> Audit History ({events.length})
        </button>
      </div>

      {/* Render Active Data Table or Audit Timeline */}
      {activeTab === 'campaigns' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Sales Campaigns ({campaigns.length})
              </h3>
              <p className="text-xs text-slate-500">
                Create and manage platform-wide sales campaigns (e.g. Dussehra Special, Summer Sale).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handlePruneDuplicates}
                disabled={isPending}
                className="font-bold cursor-pointer text-xs uppercase border-slate-300 text-slate-700 hover:bg-slate-100 h-9 px-3 rounded flex items-center gap-1.5"
                title="Prune any redundant duplicates across campaigns"
              >
                <Wand2 className="h-3.5 w-3.5 text-indigo-600" /> Prune Duplicates
              </Button>

              <AdminFormSheet
                title="Create Sales Campaign"
                description="Configure platform-wide sales campaigns with priority discount rules."
                trigger={
                  <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-9 px-3.5 rounded flex items-center gap-1.5">
                    <Plus className="h-4 w-4" /> Create Campaign
                  </Button>
                }
              >
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const res = await createCampaignAction(formData);
                    if (res.success) {
                      toast.success('Sales campaign created successfully!');
                    } else {
                      toast.error(res.error || 'Failed to create campaign');
                    }
                  }}
                  className="flex flex-col gap-5 py-2"
                >
                  <FormField label="Campaign Name">
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="e.g. Dussehra Special Sale"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
                    />
                  </FormField>

                  <FormField label="Description">
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      placeholder="e.g. Festive discount of 25% across catalog"
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                    />
                  </FormField>

                  <FormField label="Discount Type">
                    <select
                      id="discountType"
                      name="discountType"
                      required
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                    >
                      <option value="percentage">Percentage OFF (%)</option>
                      <option value="fixed">Fixed Amount OFF (₹)</option>
                    </select>
                  </FormField>

                  <FormField label="Discount Value">
                    <Input
                      id="discountValue"
                      name="discountValue"
                      type="number"
                      step="0.01"
                      placeholder="e.g. 25.00"
                      required
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Starts At">
                      <Input
                        id="startsAt"
                        name="startsAt"
                        type="datetime-local"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs"
                      />
                    </FormField>

                    <FormField label="Ends At">
                      <Input
                        id="endsAt"
                        name="endsAt"
                        type="datetime-local"
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs"
                      />
                    </FormField>
                  </div>

                  <FormField label="Priority Rank (Higher = Applied First)">
                    <Input
                      id="priority"
                      name="priority"
                      type="number"
                      defaultValue="100"
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
                    />
                  </FormField>

                  <Button
                    type="submit"
                    className="w-full mt-4 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs"
                  >
                    Save Campaign
                  </Button>
                </form>
              </AdminFormSheet>
            </div>
          </div>

          <DataTable
            columns={campaignColumns}
            data={campaigns}
            getItemKey={(item) => item.id}
            selectable={true}
            searchPlaceholder="Search campaigns by name..."
            searchableKeys={(item) => [item.name]}
            bulkActions={(keys, _items, clearSelection) => (
              <Button
                type="button"
                onClick={() => {
                  if (!confirm(`Are you sure you want to delete ${keys.length} selected campaigns?`)) return;
                  startTransition(async () => {
                    const res = await bulkDeleteCampaignsAction(keys);
                    if (res.success) {
                      toast.success(`Deleted ${res.count ?? keys.length} campaigns.`);
                      clearSelection();
                    } else {
                      toast.error(res.error || 'Failed to bulk delete campaigns.');
                    }
                  });
                }}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete ({keys.length})
              </Button>
            )}
          />
        </div>
      )}

      {/* Offers Tab */}
      {activeTab === 'offers' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Promotional Offers ({offers.length})
              </h3>
              <p className="text-xs text-slate-500">
                Create and manage specific promotional product or brand offers.
              </p>
            </div>

            <AdminFormSheet
              title="Create Promotional Offer"
              description="Define specific promotional offers."
              trigger={
                <Button className="font-bold cursor-pointer text-xs uppercase bg-indigo-600 text-white hover:bg-indigo-700 h-9 px-3.5 rounded flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Create Offer
                </Button>
              }
            >
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const res = await createOfferAction(formData);
                  if (res.success) {
                    toast.success('Promotional offer created successfully!');
                  } else {
                    toast.error(res.error || 'Failed to create offer');
                  }
                }}
                className="flex flex-col gap-5 py-2"
              >
                <FormField label="Offer Title">
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g. 20% OFF Sneakers"
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
                  />
                </FormField>

                <FormField label="Eligible Target Product ID (Optional)">
                  <Input
                    id="productId"
                    name="productId"
                    type="text"
                    placeholder="e.g. prod-123 (Leave empty for ALL products)"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs font-mono"
                  />
                </FormField>

                <FormField label="Discount Type">
                  <select
                    id="discountType"
                    name="discountType"
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 20.00"
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>

                <FormField label="Priority Rank">
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    defaultValue="50"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
                  />
                </FormField>

                <Button
                  type="submit"
                  className="w-full mt-4 font-bold cursor-pointer h-10 bg-indigo-600 text-white hover:bg-indigo-700 rounded uppercase text-xs"
                >
                  Save Offer
                </Button>
              </form>
            </AdminFormSheet>
          </div>

          <DataTable
            columns={offerColumns}
            data={offers}
            getItemKey={(item) => item.id}
            selectable={true}
            searchPlaceholder="Search offers by title..."
            searchableKeys={(item) => [item.title]}
            bulkActions={(keys, _items, clearSelection) => (
              <Button
                type="button"
                onClick={() => {
                  if (!confirm(`Are you sure you want to delete ${keys.length} selected offers?`)) return;
                  startTransition(async () => {
                    const res = await bulkDeleteOffersAction(keys);
                    if (res.success) {
                      toast.success(`Deleted ${res.count ?? keys.length} offers.`);
                      clearSelection();
                    } else {
                      toast.error(res.error || 'Failed to bulk delete offers.');
                    }
                  });
                }}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold h-8 px-3 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete ({keys.length})
              </Button>
            )}
          />
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Promotional Coupon Codes ({coupons.length})
              </h3>
              <p className="text-xs text-slate-500">
                Manage, activate, deactivate, or create new promotional discount coupons.
              </p>
            </div>

            <AdminFormSheet
              title="Create Promo Code"
              description="Define promotional campaigns with percentage or flat rates constraints."
              trigger={
                <Button className="font-bold cursor-pointer text-xs uppercase bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-3.5 rounded flex items-center gap-1.5">
                  <Plus className="h-4 w-4" /> Create Coupon
                </Button>
              }
            >
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const res = await createCouponAction(formData);
                  if (res.success) {
                    toast.success('Coupon created successfully!');
                  } else {
                    toast.error(res.error || 'Failed to create coupon');
                  }
                }}
                className="flex flex-col gap-5 py-2"
              >
                <FormField label="Coupon Code">
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="e.g. SAVE30"
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm uppercase font-semibold"
                  />
                </FormField>

                <FormField label="Discount Type">
                  <select
                    id="discountType"
                    name="discountType"
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <Input
                    id="discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.00 or 15"
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>

                <FormField label="Minimum Order Value (₹)">
                  <Input
                    id="minOrderValue"
                    name="minOrderValue"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500.00 (Optional)"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>

                <FormField label="Global Usage Limit">
                  <Input
                    id="usageLimit"
                    name="usageLimit"
                    type="number"
                    placeholder="e.g. 100 redemptions (Optional)"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>

                <Button
                  type="submit"
                  className="w-full mt-4 font-bold cursor-pointer h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase text-xs"
                >
                  Create Coupon
                </Button>
              </form>
            </AdminFormSheet>
          </div>

          <CouponsList initialCoupons={coupons} />
        </div>
      )}

      {/* Audit History Tab */}
      {activeTab === 'events' && (
        <div className="flex flex-col gap-3 p-4 bg-white border border-slate-200 rounded-lg shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
            Promotion & Discount Audit Events Timeline
          </h4>
          {events.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No promotion events logged yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-slate-100 bg-slate-50/50 text-xs gap-2"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 uppercase">
                      {ev.entityType}: {ev.action}
                    </span>
                    {ev.reason && <span className="text-slate-600 text-[11px]">Reason: {ev.reason}</span>}
                  </div>
                  <span suppressHydrationWarning className="text-[10px] text-slate-400 font-mono">
                    {formatDateTimeDeterministic(ev.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Campaign Dialog */}
      {editingCampaign && (
        <Dialog open={!!editingCampaign} onOpenChange={(open) => !open && setEditingCampaign(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-950 font-bold uppercase tracking-tight">
                Edit Sales Campaign
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await updateCampaignAction(editingCampaign.id, formData);
                  if (res.success) {
                    toast.success('Campaign updated successfully!');
                    setEditingCampaign(null);
                  } else {
                    toast.error(res.error || 'Failed to update campaign');
                  }
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <FormField label="Campaign Name">
                <Input
                  id="edit-campaign-name"
                  name="name"
                  type="text"
                  defaultValue={editingCampaign.name}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
                />
              </FormField>

              <FormField label="Description">
                <Input
                  id="edit-campaign-desc"
                  name="description"
                  type="text"
                  defaultValue={editingCampaign.description || ''}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Discount Type">
                  <select
                    id="edit-campaign-discountType"
                    name="discountType"
                    defaultValue={editingCampaign.discountType}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="percentage">Percentage OFF (%)</option>
                    <option value="fixed">Fixed Amount OFF (₹)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <Input
                    id="edit-campaign-discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingCampaign.discountValue}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Starts At">
                  <Input
                    id="edit-campaign-startsAt"
                    name="startsAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalString(editingCampaign.startsAt)}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs"
                  />
                </FormField>

                <FormField label="Ends At">
                  <Input
                    id="edit-campaign-endsAt"
                    name="endsAt"
                    type="datetime-local"
                    defaultValue={toDateTimeLocalString(editingCampaign.endsAt)}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Priority Rank">
                  <Input
                    id="edit-campaign-priority"
                    name="priority"
                    type="number"
                    defaultValue={editingCampaign.priority}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    id="edit-campaign-status"
                    name="status"
                    defaultValue={editingCampaign.status}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ended">Ended</option>
                    <option value="draft">Draft</option>
                  </select>
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
                  className="bg-slate-950 text-white hover:bg-slate-900 font-bold cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Campaign Confirmation Dialog */}
      {deletingCampaignId && (
        <Dialog open={!!deletingCampaignId} onOpenChange={(open) => !open && setDeletingCampaignId(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-600 font-bold">Delete Sales Campaign</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-slate-600">
              Are you sure you want to delete this sales campaign? It will be soft-deleted and removed from the active catalog.
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={() => handleDeleteCampaign(deletingCampaignId)}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Offer Dialog */}
      {editingOffer && (
        <Dialog open={!!editingOffer} onOpenChange={(open) => !open && setEditingOffer(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-slate-950 font-bold uppercase tracking-tight">
                Edit Promotional Offer
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                startTransition(async () => {
                  const res = await updateOfferAction(editingOffer.id, formData);
                  if (res.success) {
                    toast.success('Offer updated successfully!');
                    setEditingOffer(null);
                  } else {
                    toast.error(res.error || 'Failed to update offer');
                  }
                });
              }}
              className="flex flex-col gap-4 py-2"
            >
              <FormField label="Offer Title">
                <Input
                  id="edit-offer-title"
                  name="title"
                  type="text"
                  defaultValue={editingOffer.title}
                  required
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
                />
              </FormField>

              <FormField label="Eligible Target Product ID (Optional)">
                <Input
                  id="edit-offer-productId"
                  name="productId"
                  type="text"
                  defaultValue={editingOffer.productId || ''}
                  placeholder="e.g. prod-123 (Leave empty for ALL products)"
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs font-mono"
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Discount Type">
                  <select
                    id="edit-offer-discountType"
                    name="discountType"
                    defaultValue={editingOffer.discountType}
                    required
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </FormField>

                <FormField label="Discount Value">
                  <Input
                    id="edit-offer-discountValue"
                    name="discountValue"
                    type="number"
                    step="0.01"
                    defaultValue={editingOffer.discountValue}
                    required
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="Priority Rank">
                  <Input
                    id="edit-offer-priority"
                    name="priority"
                    type="number"
                    defaultValue={editingOffer.priority}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    id="edit-offer-status"
                    name="status"
                    defaultValue={editingOffer.status}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded text-slate-900 focus:outline-none focus:border-slate-950 text-xs w-full cursor-pointer h-10 font-semibold"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                    <option value="draft">Draft</option>
                  </select>
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
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Offer Confirmation Dialog */}
      {deletingOfferId && (
        <Dialog open={!!deletingOfferId} onOpenChange={(open) => !open && setDeletingOfferId(null)}>
          <DialogContent className="border-slate-200 bg-white text-slate-900 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-rose-600 font-bold">Delete Offer</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm text-slate-600">
              Are you sure you want to delete this promotional offer? It will be soft-deleted.
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600 cursor-pointer">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                onClick={() => handleDeleteOffer(deletingOfferId)}
                disabled={isPending}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold cursor-pointer"
              >
                {isPending ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
