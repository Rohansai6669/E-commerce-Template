import * as React from 'react';
import { db } from '@/lib/db';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { brands } from '@/lib/db/schema/catalog/brands';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { getCurrentProfile } from '@/core/auth/session';
import { Heading, Text } from '@/components/ui/typography';
import { Building2, Settings, ShieldCheck, MapPin, Tag } from 'lucide-react';
import { connection } from 'next/server';
import { eq, inArray, and, sql } from 'drizzle-orm';

export default async function SupplierSettingsPage() {
  await connection();

  const profile = await getCurrentProfile();
  let boutique = null;
  let authorizedBrands: { id: string; name: string }[] = [];

  if (profile) {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.profileId, profile.id))
      .limit(1);

    boutique = supplier || null;

    if (boutique) {
      const brandIds = await SupplierBrandService.getAuthorizedBrandsForSupplier(boutique.id);
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
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Boutique Settings & Account Config
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Manage fulfillment parameters, authorized brands, and boutique profile information.
        </Text>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-900" /> Boutique Profile Details
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-medium">Boutique Name:</span>
            <span className="font-bold text-slate-900">{boutique?.name || 'My Boutique'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-medium">Email:</span>
            <span className="font-bold text-slate-900">{boutique?.email || profile?.email}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-medium">Phone:</span>
            <span className="font-mono text-slate-900">{boutique?.phone || '—'}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-400 font-medium">Commission Margin:</span>
            <span className="font-bold text-emerald-700">{boutique?.commissionRate || '10.00'}%</span>
          </div>
        </div>
      </div>

      {/* Authorized Brands Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col gap-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-900" /> Authorized Catalog Brands ({authorizedBrands.length})
        </h3>

        {authorizedBrands.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {authorizedBrands.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-blue-50 text-blue-900 border border-blue-200 text-xs font-bold"
              >
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                {b.name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">
            No specific brand permissions currently set. Contact administration if brand fulfillment authorizations are required.
          </p>
        )}
      </div>
    </div>
  );
}
