import * as React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { promotionOffers } from '@/lib/db/schema/catalog/promotions';
import { getCurrentProfile } from '@/core/auth/session';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { connection } from 'next/server';
import { eq, desc } from 'drizzle-orm';
import { Heading, Text } from '@/components/ui/typography';
import { DataTable, type ColumnDef } from '@/components/admin/data-table';
import { Percent } from 'lucide-react';

export default async function SupplierOffersPage() {
  await connection();

  const profile = await getCurrentProfile();
  let currentSupplier = null;

  if (profile) {
    const [supp] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.profileId, profile.id))
      .limit(1);
    currentSupplier = supp || null;
  }

  // Load supplier-owned offers
  const offersList = profile ? await db
    .select()
    .from(promotionOffers)
    .where(eq(promotionOffers.ownerId, profile.id))
    .orderBy(desc(promotionOffers.createdAt)) : [];

  const columns: ColumnDef<typeof offersList[0]>[] = [
    {
      header: 'Offer Title',
      sortable: true,
      sortValue: (o) => o.title,
      cell: (row) => <span className="font-bold text-slate-900 text-xs">{row.title}</span>,
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
      header: 'Priority',
      sortable: true,
      sortValue: (o) => o.priority,
      cell: (row) => <span className="text-xs font-mono font-bold text-slate-700">P-{row.priority}</span>,
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
  ];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2">
          <Percent className="w-6 h-6 text-slate-900" />
          Boutique Vendor Offers & Discounts
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Manage vendor-specific discounts and pricing promotional offers for your authorized catalog items.
        </Text>
      </div>

      <DataTable
        columns={columns}
        data={offersList}
        searchPlaceholder="Search your offers by title..."
        searchableKeys={(item) => [item.title]}
        emptyStateMessage="No vendor offers created yet."
      />
    </div>
  );
}
