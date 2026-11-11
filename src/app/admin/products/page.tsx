import * as React from 'react';
import { db } from '@/lib/db';
import { productRepository } from '@/core/product/product.repository';
import { getCachedCategories, getCachedBrands } from '@/core/performance/cache';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { ProductsList } from '@/components/admin/products-list';
import { connection } from 'next/server';
import { eq } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';

/**
 * Server Component displaying the Admin Product Catalog Manager.
 * Optimized for low latency:
 * - Single parallel Promise.all execution (no sequential waterfalls)
 * - Cached category and brand taxonomy reads
 * - Elimination of redundant full-table variant scans
 */
export default async function AdminProductsPage() {
  await connection();

  // Load all catalog datasets in ONE single parallel roundtrip
  const [productsData, categoriesList, brandsList, activeSuppliers, mappedLinks] =
    await Promise.all([
      productRepository.getProducts({ visibility: 'admin', limit: 50 }),
      getCachedCategories(),
      getCachedBrands(),
      safeQuery(
        () =>
          db
            .select({ id: suppliers.id, name: suppliers.name, status: suppliers.status })
            .from(suppliers)
            .where(eq(suppliers.status, 'active')),
        'active_suppliers'
      ),
      safeQuery(
        () =>
          db
            .select({
              id: supplierProducts.id,
              productId: supplierProducts.productId,
              supplierId: supplierProducts.supplierId,
              approvalStatus: supplierProducts.approvalStatus,
            })
            .from(supplierProducts),
        'supplier_products'
      ),
    ]);

  return (
    <div className="w-full text-slate-900 pb-12">
      <ProductsList
        products={productsData.items}
        activeSuppliers={activeSuppliers}
        mappedLinks={mappedLinks}
        allVariants={[]}
        categories={categoriesList}
        brands={brandsList}
      />
    </div>
  );
}
