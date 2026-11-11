import * as React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { productRepository } from '@/core/product/product.repository';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { getCurrentProfile } from '@/core/auth/session';
import { Heading, Text } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { ProductsList } from '@/components/admin/products-list';
import { safeQuery } from '@/lib/db/safe-query';
import { connection } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { Plus, ShoppingBag } from 'lucide-react';

export default async function SupplierProductsPage() {
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

  // Load basic catalog lists using standard productRepository method
  const [productsData, categoriesList, brandsList] = await Promise.all([
    productRepository.getProducts({ visibility: 'admin', limit: 100 }),
    safeQuery(() => db.select().from(categories).where(sql`${categories.deletedAt} IS NULL`), 'categories_list'),
    safeQuery(() => db.select().from(brands).where(sql`${brands.deletedAt} IS NULL`), 'brands_list'),
  ]);

  // Marketplace optional queries
  const [activeSuppliers, mappedLinks, allVariants] = await Promise.all([
    safeQuery(() => db.select().from(suppliers).where(eq(suppliers.status, 'active')), 'active_suppliers'),
    safeQuery(() => db.select().from(supplierProducts), 'supplier_products'),
    safeQuery(() => db.select().from(productVariants), 'product_variants'),
  ]);

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex flex-col gap-1">
          <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
            Supplier Catalog Products
          </Heading>
          <Text className="text-sm text-slate-500 font-sans">
            Manage boutique inventory, set pricing margins, and configure attributes & Cloudflare R2 media assets.
          </Text>
        </div>

        <Link href="/supplier/products/new">
          <Button className="font-bold cursor-pointer text-xs uppercase bg-slate-950 text-white hover:bg-slate-900 h-10 px-4 rounded flex items-center gap-1.5 self-start">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      {/* Catalog List Component with matching admin UI */}
      <ProductsList
        products={productsData.items}
        activeSuppliers={activeSuppliers}
        mappedLinks={mappedLinks}
        allVariants={allVariants}
        categories={categoriesList}
        brands={brandsList}
      />
    </div>
  );
}
