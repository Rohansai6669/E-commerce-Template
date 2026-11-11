import * as React from 'react';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { brands } from '@/lib/db/schema/catalog/brands';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { getCurrentProfile } from '@/core/auth/session';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';
import { Building2, ShoppingBag, Tag, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { connection } from 'next/server';
import { eq, inArray, and, sql } from 'drizzle-orm';

export default async function SupplierDashboardPage() {
  await connection();

  const profile = await getCurrentProfile();

  let boutique = null;
  let productsCount = 0;
  let authorizedBrands: { id: string; name: string }[] = [];

  if (profile) {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.profileId, profile.id))
      .limit(1);

    boutique = supplier || null;

    if (boutique) {
      const [pCount, brandIds] = await Promise.all([
        db
          .select({ count: sql<number>`count(*)` })
          .from(supplierProducts)
          .where(eq(supplierProducts.supplierId, boutique.id)),
        SupplierBrandService.getAuthorizedBrandsForSupplier(boutique.id),
      ]);

      productsCount = Number(pCount[0]?.count || 0);

      if (brandIds.length > 0) {
        authorizedBrands = (await db
          .select({ id: brands.id, name: brands.name })
          .from(brands)
          .where(and(inArray(brands.id, brandIds), sql`${brands.deletedAt} IS NULL`))) as { id: string; name: string }[];
      }
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
              {boutique ? boutique.name : 'Supplier Overview'}
            </Heading>
            <span className="bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded">
              Partner Boutique
            </span>
          </div>
          <Text className="text-sm text-slate-500 font-sans">
            Manage boutique catalog products, fulfill assigned consignment orders, and monitor sales payouts.
          </Text>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 select-none">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog Products</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{productsCount}</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Authorized Brands</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{authorizedBrands.length}</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Commission Margin</span>
          <span className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{boutique?.commissionRate || '10.00'}%</span>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between h-20">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Boutique Status</span>
          <span className="text-sm font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-4 h-4" /> {boutique?.status.toUpperCase() || 'ACTIVE'}
          </span>
        </div>
      </div>

      {/* Authorized Brands Panel */}
      <div className="border border-slate-200 bg-white shadow-xs rounded-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Authorized Catalog Brands ({authorizedBrands.length})
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-500">Fulfillment Rights Granted</span>
        </div>

        {authorizedBrands.length > 0 ? (
          <div className="flex flex-wrap gap-2 py-1">
            {authorizedBrands.map((brand) => (
              <span
                key={brand.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold"
              >
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                {brand.name}
              </span>
            ))}
          </div>
        ) : (
          <div className="py-4 text-xs text-slate-500 italic bg-slate-50 border border-dashed border-slate-200 rounded p-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            No specific brand restrictions assigned. Contact store administrator to request brand fulfillment permissions.
          </div>
        )}
      </div>

      {/* Quick Controls Card */}
      <div className="border border-slate-200 bg-white shadow-xs rounded-lg p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-900" /> Supplier Controls & Direct Actions
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Welcome to your Supplier Portal. Use the top navigation tabs to add boutique products, view consignment orders routed to your store, update fulfillment inventory status, and maintain pickup addresses.
        </p>
      </div>
    </div>
  );
}
