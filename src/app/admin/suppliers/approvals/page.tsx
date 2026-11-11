import * as React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { supplierProducts, supplierProductApprovalEvents } from '@/lib/db/schema/catalog/supplier-products';
import { products } from '@/lib/db/schema/catalog/products';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { profiles } from '@/lib/db/schema/auth';
import { connection } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { SupplierApprovalPanel } from '@/components/admin/supplier-approval-panel';
import { ArrowLeft, ShieldCheck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

import { safeQuery } from '@/lib/db/safe-query';

export default async function SupplierApprovalsDashboardPage() {
  await connection();

  // Load all supplier product listings with linked product & supplier info
  const listingsRaw = await safeQuery(
    () =>
      db
        .select({
          listing: supplierProducts,
          product: products,
          supplier: suppliers,
          reviewer: profiles,
        })
        .from(supplierProducts)
        .innerJoin(products, eq(supplierProducts.productId, products.id))
        .innerJoin(suppliers, eq(supplierProducts.supplierId, suppliers.id))
        .leftJoin(profiles, eq(supplierProducts.reviewedBy, profiles.id))
        .orderBy(desc(supplierProducts.createdAt)),
    'supplier_approval_listings'
  );

  // Load approval events history timeline
  const approvalEventsRaw = await safeQuery(
    () =>
      db
        .select({
          event: supplierProductApprovalEvents,
          actor: profiles,
        })
        .from(supplierProductApprovalEvents)
        .innerJoin(profiles, eq(supplierProductApprovalEvents.actorProfileId, profiles.id))
        .orderBy(desc(supplierProductApprovalEvents.createdAt))
        .limit(50),
    'supplier_approval_events'
  );

  // Group metrics
  const totalCount = listingsRaw.length;
  const pendingCount = listingsRaw.filter(l => l.listing.approvalStatus === 'submitted' || l.listing.approvalStatus === 'under_review').length;
  const approvedCount = listingsRaw.filter(l => l.listing.approvalStatus === 'approved' || l.listing.approvalStatus === 'active').length;
  const rejectedCount = listingsRaw.filter(l => l.listing.approvalStatus === 'rejected').length;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex flex-col gap-1">
          <Link
            href="/admin/suppliers"
            className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-bold uppercase transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Suppliers Directory
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-950 tracking-tight font-heading flex items-center gap-2.5 mt-1">
            <ShieldCheck className="w-6 h-6 text-slate-900" />
            Supplier Listing Approvals
          </h1>
          <p className="text-xs text-slate-500">
            Evaluate submitted boutique product listings, audit state transitions, and enforce platform marketplace quality standards.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{totalCount}</span>
        </div>
        <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
          <span className="text-2xl font-bold text-amber-900 tracking-tight font-heading">{pendingCount}</span>
        </div>
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved / Active
          </span>
          <span className="text-2xl font-bold text-emerald-900 tracking-tight font-heading">{approvedCount}</span>
        </div>
        <div className="p-3.5 bg-rose-50/50 border border-rose-200/80 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
          <span className="text-2xl font-bold text-rose-900 tracking-tight font-heading">{rejectedCount}</span>
        </div>
      </div>

      {/* Main Interactive Approval Panel Component */}
      <SupplierApprovalPanel
        listings={listingsRaw}
        events={approvalEventsRaw}
      />
    </div>
  );
}
