import * as React from 'react';
import { db } from '@/lib/db';
import { productRepository } from '@/core/product/product.repository';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { suppliers } from '@/lib/db/schema/marketplace/suppliers';
import { supplierProducts } from '@/lib/db/schema/catalog/supplier-products';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { inventory } from '@/lib/db/schema/inventory';
import { ProductsList } from '@/components/admin/products-list';
import { connection } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { safeQuery } from '@/lib/db/safe-query';

/**
 * Server Component displaying the Admin Product Catalog Manager.
 */
export default async function AdminProductsPage() {
  await connection();

  // Load basic catalog lists using standard productRepository method
  const [productsData, categoriesList, brandsList] = await Promise.all([
    productRepository.getProducts({ visibility: 'admin', limit: 50 }),
    safeQuery(
      () =>
        db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            parentId: categories.parentId,
          })
          .from(categories)
          .where(sql`${categories.deletedAt} IS NULL`)
          .orderBy(categories.name),
      'categories_list'
    ),
    safeQuery(() => db.select({ id: brands.id, name: brands.name, slug: brands.slug }).from(brands).where(sql`${brands.deletedAt} IS NULL`), 'brands_list'),
  ]);

  // Marketplace optional queries (graceful degradation)
  const [activeSuppliers, mappedLinks, allVariants] = await Promise.all([
    safeQuery(() => db.select({ id: suppliers.id, name: suppliers.name, status: suppliers.status }).from(suppliers).where(eq(suppliers.status, 'active')), 'active_suppliers'),
    safeQuery(() => db.select({ id: supplierProducts.id, productId: supplierProducts.productId, supplierId: supplierProducts.supplierId, approvalStatus: supplierProducts.approvalStatus }).from(supplierProducts), 'supplier_products'),
    safeQuery(
      () =>
        db
          .select({
            id: productVariants.id,
            productId: productVariants.productId,
            sku: productVariants.sku,
            price: productVariants.price,
            stock: sql<number>`cast(coalesce(${inventory.quantity}, ${productVariants.stock}) as integer)`,
          })
          .from(productVariants)
          .leftJoin(inventory, eq(productVariants.id, inventory.variantId)),
      'product_variants'
    ),
  ]);

  return (
    <div className="w-full text-slate-900 pb-12">
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
