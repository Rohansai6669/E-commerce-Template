import * as React from 'react';
import { db } from '@/lib/db';
import { suppliers, supplierSettings, supplierAddresses } from '@/lib/db/schema/marketplace/suppliers';
import { profiles } from '@/lib/db/schema/auth';
import { brands } from '@/lib/db/schema/catalog/brands';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { getStoreModeServer } from '@/core/config/store-mode.server';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { connection } from 'next/server';
import { desc, sql, eq } from 'drizzle-orm';
import { Plus, CheckCircle2, AlertOctagon, RefreshCw, Send, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';
import { SuppliersList } from '@/components/admin/suppliers-list';
import { AddSupplierForm } from '@/components/admin/add-supplier-form';
import { InviteSupplierForm } from '@/components/admin/invite-supplier-form';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';

interface SupplierItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commissionRate: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
}

/**
 * Admin Suppliers Boutique Directory.
 * Features a left side slide-over registration sheet.
 */
export default async function AdminSuppliersPage() {
  await connection();

  const storeMode = await getStoreModeServer();

  // Reconcile user profiles with role 'supplier' that lack a supplier boutique row
  const supplierProfiles = await db.select().from(profiles).where(eq(profiles.role, 'supplier'));
  const existingSuppliers = await db.select().from(suppliers);

  for (const prof of supplierProfiles) {
    if (!prof.email) continue;
    const profEmail = prof.email;
    const hasSupplierRow = existingSuppliers.some(
      (s) => s.profileId === prof.id || s.email.toLowerCase() === profEmail.toLowerCase()
    );
    if (!hasSupplierRow) {
      const sName = prof.fullName || profEmail.split('@')[0];
      const slug = `${sName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-4)}`;
      try {
        const [newSupp] = await db
          .insert(suppliers)
          .values({
            name: sName,
            slug,
            email: profEmail,
            phone: prof.phone,
            commissionRate: '10.00',
            status: 'active',
            profileId: prof.id,
          })
          .returning();

        await db.insert(supplierSettings).values({
          supplierId: newSupp.id,
          autoAcceptOrders: false,
          autoApproveReturns: false,
          autoPublishProducts: false,
          allowBackorders: false,
          fulfillmentSLA: 48,
          minimumOrderValue: '0.00',
          maximumLeadTime: 7,
        });
      } catch (e) {
        console.error('Failed to auto-sync supplier profile:', e);
      }
    }
  }

  const [list, brandsList, permissionsList, addressesList] = await Promise.all([
    db.select().from(suppliers).orderBy(desc(suppliers.createdAt)) as Promise<SupplierItem[]>,
    db.select({ id: brands.id, name: brands.name }).from(brands).where(sql`${brands.deletedAt} IS NULL`),
    SupplierBrandService.getAllSupplierBrandPermissions(),
    db.select().from(supplierAddresses),
  ]);

  // Supplier statuses KPIs
  const activeCount = list.filter((s) => s.status === 'active').length;
  const pendingCount = list.filter((s) => s.status === 'pending').length;
  const suspendedCount = list.filter((s) => s.status === 'suspended').length;

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      {/* Standalone E-Commerce Alert Banner */}
      {storeMode === 'standalone' && (
        <div className="p-5 rounded-2xl border border-amber-300 bg-amber-50/90 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-700 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex flex-col gap-1">
              <h4 className="text-sm font-extrabold uppercase tracking-wide text-amber-950 font-heading">
                Standalone E-Commerce Mode Active (Marketplace Features Disabled)
              </h4>
              <p className="text-xs text-amber-900/90 leading-relaxed font-sans max-w-3xl">
                The platform is currently running in single-merchant Standalone Mode. Multi-vendor supplier onboarding, consignment routing, and supplier management actions are disabled.
              </p>
            </div>
          </div>
          <Link
            href="/admin/settings"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950 text-amber-50 hover:bg-amber-900 text-xs font-bold uppercase tracking-wider shrink-0 transition-colors cursor-pointer select-none shadow-xs"
          >
            <Settings className="w-4 h-4" />
            Change Mode in Settings
          </Link>
        </div>
      )}

      {/* Headings and registration trigger row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Supplier Boutique Directory
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Manage partner luxury boutiques, verify registration status, and authorize brand fulfillment permissions.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <AdminFormSheet
            title="Invite Supplier Partner"
            description="Generate a secure invitation link for a supplier boutique to complete onboarding."
            trigger={
              <Button className="font-bold cursor-pointer text-xs uppercase bg-amber-500 hover:bg-amber-400 text-slate-950 h-10 px-4 rounded flex items-center gap-1.5">
                <Send className="h-4 w-4" /> Invite Supplier
              </Button>
            }
          >
            <InviteSupplierForm brands={brandsList} />
          </AdminFormSheet>

          <AdminFormSheet
            title="Register Boutique"
            description="Onboard a new luxury boutique partner with Cloudflare R2 logo media & authorized brands."
            trigger={
              <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Register Boutique
              </Button>
            }
          >
            <AddSupplierForm brands={brandsList} />
          </AdminFormSheet>
        </div>
      </div>

      {/* Supplier KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Boutiques</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{activeCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Verification</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{pendingCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <RefreshCw className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suspended</span>
              <span className="text-2xl font-extrabold text-slate-950 font-heading">{suspendedCount}</span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 text-slate-900 border border-slate-100">
              <AlertOctagon className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        {/* Suppliers List */}
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Boutiques</h3>
          </CardHeader>
          <CardContent className="p-0">
            <SuppliersList
              initialSuppliers={list}
              brands={brandsList}
              permissions={permissionsList}
              addresses={addressesList}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
