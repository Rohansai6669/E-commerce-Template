'use client';

import * as React from 'react';
import { DataTable, type ColumnDef } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { Sparkles, Percent, Ticket, History, Plus } from 'lucide-react';
import { CouponsList } from '@/components/admin/coupons-list';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { createCouponAction } from '@/app/actions/coupon-actions';
import { createCampaignAction, createOfferAction } from '@/app/actions/promotion-actions';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PromotionsManagerPanelProps {
  campaigns: Array<{
    id: string;
    name: string;
    discountType: string;
    discountValue: string;
    startsAt: Date;
    endsAt: Date;
    status: string;
    priority: number;
  }>;
  offers: Array<{
    id: string;
    title: string;
    ownerType: string;
    discountType: string;
    discountValue: string;
    status: string;
    priority: number;
  }>;
  coupons: Array<{
    id: string;
    code: string;
    discountType: string;
    discountValue: string;
    minOrderValue: string | null;
    usedCount: number;
    usageLimit: number | null;
    isActive: boolean;
  }>;
  events: Array<{
    id: string;
    entityType: string;
    action: string;
    reason: string | null;
    createdAt: Date;
  }>;
}

export function PromotionsManagerPanel({ campaigns, offers, coupons, events }: PromotionsManagerPanelProps) {
  const [activeTab, setActiveTab] = React.useState<'campaigns' | 'offers' | 'coupons' | 'events'>('campaigns');

  const campaignColumns: ColumnDef<typeof campaigns[0]>[] = React.useMemo(() => [
    {
      header: 'Campaign Name',
      sortable: true,
      sortValue: (c) => c.name,
      cell: (row) => <span className="font-bold text-slate-900 text-xs uppercase">{row.name}</span>,
    },
    {
      header: 'Discount',
      sortable: true,
      sortValue: (c) => parseFloat(c.discountValue),
      cell: (row) => (
        <span className="font-bold text-indigo-600 text-xs">
          {row.discountType === 'percentage' ? `${row.discountValue}% OFF` : `₹${row.discountValue} OFF`}
        </span>
      ),
    },
    {
      header: 'Priority',
      sortable: true,
      sortValue: (c) => c.priority,
      cell: (row) => <span className="text-xs font-mono font-bold text-slate-700">P-{row.priority}</span>,
    },
    {
      header: 'Status',
      sortable: true,
      sortValue: (c) => c.status,
      cell: (row) => (
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
          row.status === 'active' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-700 border-slate-300'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Validity Period',
      sortable: true,
      sortValue: (c) => new Date(c.startsAt).getTime(),
      cell: (row) => (
        <span className="text-[11px] text-slate-500 font-mono">
          {new Date(row.startsAt).toLocaleDateString()} ➔ {new Date(row.endsAt).toLocaleDateString()}
        </span>
      ),
    },
  ], []);

  const offerColumns: ColumnDef<typeof offers[0]>[] = React.useMemo(() => [
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
        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
          row.ownerType === 'supplier' ? 'bg-purple-100 text-purple-800' : 'bg-slate-900 text-white'
        }`}>
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
  ], []);

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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Sales Campaigns ({campaigns.length})
              </h3>
              <p className="text-xs text-slate-500">
                Create and manage platform-wide sales campaigns (e.g. Dussehra Special, Summer Sale).
              </p>
            </div>

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

                <FormField label="Eligible Product IDs (Optional)">
                  <Input
                    id="targetProductIds"
                    name="targetProductIds"
                    type="text"
                    placeholder="e.g. prod-1, prod-2 (Comma separated, leave empty for ALL products)"
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs font-mono"
                  />
                </FormField>

                <Button type="submit" className="w-full mt-4 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs">
                  Save Campaign
                </Button>
              </form>
            </AdminFormSheet>
          </div>

          <DataTable
            columns={campaignColumns}
            data={campaigns}
            searchPlaceholder="Search campaigns by name..."
            searchableKeys={(item) => [item.name]}
          />
        </div>
      )}

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

                <Button type="submit" className="w-full mt-4 font-bold cursor-pointer h-10 bg-indigo-600 text-white hover:bg-indigo-700 rounded uppercase text-xs">
                  Save Offer
                </Button>
              </form>
            </AdminFormSheet>
          </div>

          <DataTable
            columns={offerColumns}
            data={offers}
            searchPlaceholder="Search offers by title..."
            searchableKeys={(item) => [item.title]}
          />
        </div>
      )}

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

                <Button type="submit" className="w-full mt-4 font-bold cursor-pointer h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded uppercase text-xs">
                  Create Coupon
                </Button>
              </form>
            </AdminFormSheet>
          </div>

          <CouponsList initialCoupons={coupons} />
        </div>
      )}

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
                <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded border border-slate-100 bg-slate-50/50 text-xs gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 uppercase">{ev.entityType}: {ev.action}</span>
                    {ev.reason && <span className="text-slate-600 text-[11px]">Reason: {ev.reason}</span>}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(ev.createdAt).toLocaleString()}
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
