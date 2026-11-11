import * as React from 'react';
import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema/catalog/brands';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { createBrandAction } from '@/app/actions/brand-actions';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { BrandsList } from '@/components/admin/brands-list';
import { AddBrandForm } from '@/components/admin/add-brand-form';
import { Plus } from 'lucide-react';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { sql, eq } from 'drizzle-orm';

/**
 * Admin Brand Manager.
 * Features a left side slide-over creation overlay sheet.
 */
export default async function AdminBrandsPage() {
  const [list, suppliersList, permissionsList] = await Promise.all([
    db.select().from(brands).where(sql`${brands.deletedAt} IS NULL`).orderBy(brands.name),
    db.select({ id: suppliers.id, name: suppliers.name }).from(suppliers).where(eq(suppliers.status, 'active')),
    SupplierBrandService.getAllSupplierBrandPermissions(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {/* Headings and creation trigger row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Brand Manager
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Configure manufacturer brands for storefront filter tags and map authorized fulfilling suppliers.
          </Text>
        </div>

        {/* Left slide-over trigger wrapper */}
        <AdminFormSheet
          title="Add Brand"
          description="Register a new brand with Cloudflare R2 logo & cover media and authorized suppliers."
          trigger={
            <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
              <Plus className="h-4 w-4" /> Add Brand
            </Button>
          }
        >
          <AddBrandForm suppliers={suppliersList} />
        </AdminFormSheet>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start mt-2">
        {/* Brands list */}
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registered Brands ({list.length})
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <BrandsList initialBrands={list} suppliers={suppliersList} permissions={permissionsList} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
