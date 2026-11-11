import * as React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { salesCampaigns, promotionOffers, promotionEvents } from '@/lib/db/schema/catalog/promotions';
import { coupons } from '@/lib/db/schema/marketing';
import { connection } from 'next/server';
import { desc, sql } from 'drizzle-orm';
import { PromotionsManagerPanel } from '@/components/admin/promotions-manager-panel';
import { Tag, Sparkles, Plus, Percent, Ticket } from 'lucide-react';

import { safeQuery } from '@/lib/db/safe-query';

export default async function AdminPromotionsPage() {
  await connection();

  const [campaignsList, offersList, couponsList, eventsList] = await Promise.all([
    safeQuery(() => db.select().from(salesCampaigns).where(sql`${salesCampaigns.deletedAt} IS NULL`).orderBy(desc(salesCampaigns.createdAt)), 'sales_campaigns'),
    safeQuery(() => db.select().from(promotionOffers).where(sql`${promotionOffers.deletedAt} IS NULL`).orderBy(desc(promotionOffers.createdAt)), 'promotion_offers'),
    safeQuery(() => db.select().from(coupons).where(sql`${coupons.deletedAt} IS NULL`).orderBy(desc(coupons.createdAt)), 'coupons'),
    safeQuery(() => db.select().from(promotionEvents).orderBy(desc(promotionEvents.createdAt)).limit(50), 'promotion_events'),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight font-heading flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-slate-900" />
            Promotions & Sales Campaigns Manager
          </h1>
          <p className="text-xs text-slate-500">
            Create platform-wide sales campaigns, configure priority discount rules, manage coupons, and audit discount event history.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Sales Campaigns
          </span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{campaignsList.length}</span>
        </div>
        <div className="p-3.5 bg-indigo-50/50 border border-indigo-200/80 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
            <Percent className="w-3 h-3" /> Active Offers
          </span>
          <span className="text-2xl font-bold text-indigo-900 tracking-tight font-heading">
            {offersList.filter(o => o.status === 'active').length}
          </span>
        </div>
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Ticket className="w-3 h-3" /> Active Coupons
          </span>
          <span className="text-2xl font-bold text-emerald-900 tracking-tight font-heading">
            {couponsList.filter(c => c.isActive).length}
          </span>
        </div>
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit Events Logged</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{eventsList.length}</span>
        </div>
      </div>

      {/* Main Promotions Manager Component */}
      <PromotionsManagerPanel
        campaigns={campaignsList}
        offers={offersList}
        coupons={couponsList}
        events={eventsList}
      />
    </div>
  );
}
