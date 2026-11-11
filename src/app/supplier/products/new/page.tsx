import * as React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { AddProductForm } from '@/components/admin/add-product-form';
import { safeQuery } from '@/lib/db/safe-query';
import { connection } from 'next/server';
import { sql } from 'drizzle-orm';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

export default async function SupplierNewProductPage() {
  await connection();

  const [categoriesList, brandsList] = await Promise.all([
    safeQuery(() => db.select().from(categories).where(sql`${categories.deletedAt} IS NULL`), 'categories_list'),
    safeQuery(() => db.select().from(brands).where(sql`${brands.deletedAt} IS NULL`), 'brands_list'),
  ]);

  return (
    <div className="w-full text-slate-900 pb-12 font-sans max-w-5xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link
              href="/supplier/products"
              className="text-slate-500 hover:text-slate-900 flex items-center gap-1 text-xs font-bold uppercase transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Boutique Catalog
            </Link>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading flex items-center gap-2.5 mt-1">
            <ShoppingBag className="w-6 h-6 text-slate-900" />
            Add Boutique Catalog Product
          </h1>
          <p className="text-xs text-slate-500">
            Create a new product listing for your boutique, upload media, set pricing, assign categories & brands, and configure matrix attributes.
          </p>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <AddProductForm
          categories={categoriesList}
          brands={brandsList}
          redirectOnSuccess="/supplier/products"
        />
      </div>
    </div>
  );
}
