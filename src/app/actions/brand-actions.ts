'use server';

import { db } from '@/lib/db';
import { brands } from '@/lib/db/schema/catalog/brands';
import { products } from '@/lib/db/schema/catalog/products';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new brand and assigns fulfilling suppliers if provided.
 */
export async function createBrandAction(
  formData: FormData
): Promise<{ success: boolean; data?: { id: string; name: string }; error?: string }> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const supplierIds = formData.getAll('supplierIds') as string[];

  if (!name) return { success: false, error: 'Brand name is required.' };

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  try {
    let createdBrand: { id: string; name: string } | undefined;
    await db.transaction(async (tx) => {
      const [newBrand] = await tx
        .insert(brands)
        .values({
          name,
          slug,
          description,
        })
        .returning({ id: brands.id, name: brands.name });

      createdBrand = newBrand;

      if (supplierIds && supplierIds.length > 0) {
        await SupplierBrandService.syncBrandSuppliers(newBrand.id, supplierIds, tx);
      }
    });

    console.log(`[Brand Created] ${name} (${slug})`);
    revalidatePath('/admin/brands');
    revalidatePath('/products');
    return { success: true, data: createdBrand };
  } catch (err: any) {
    console.error('Create brand action failed:', err);
    return { success: false, error: err.message || 'Failed to create brand.' };
  }
}

/**
 * Updates an existing brand and atomically synchronizes fulfilling suppliers.
 */
export async function updateBrandAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  // Check if supplierIds field was submitted in form
  const supplierIdsRaw = formData.getAll('supplierIds') as string[];
  const hasSupplierIdsParam = formData.has('hasSupplierIdsInput');

  if (!name) return { success: false, error: 'Brand name is required.' };

  try {
    await db.transaction(async (tx) => {
      await tx
        .update(brands)
        .set({
          name,
          description,
          updatedAt: new Date(),
        })
        .where(eq(brands.id, id));

      if (hasSupplierIdsParam) {
        await SupplierBrandService.syncBrandSuppliers(id, supplierIdsRaw, tx);
      }
    });

    console.log(`[Brand Updated] ID: ${id}, Name: ${name}`);
    revalidatePath('/admin/brands');
    revalidatePath('/products');
    return { success: true };
  } catch (err: any) {
    console.error('Update brand action failed:', err);
    return { success: false, error: err.message || 'Failed to update brand.' };
  }
}

/**
 * Directly updates fulfilling supplier assignments for a brand.
 */
export async function updateBrandSuppliersAction(
  brandId: string,
  supplierIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.transaction(async (tx) => {
      await SupplierBrandService.syncBrandSuppliers(brandId, supplierIds, tx);
    });

    revalidatePath('/admin/brands');
    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    console.error('Update brand suppliers failed:', err);
    return { success: false, error: err.message || 'Failed to update brand suppliers.' };
  }
}

/**
 * Performs a soft-delete on a brand after verifying dependency safety constraints.
 */
export async function deleteBrandAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Safety check: verify if any products are associated with this brand
    const associatedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.brandId, id), sql`${products.deletedAt} IS NULL`))
      .limit(1);

    if (associatedProducts.length > 0) {
      return {
        success: false,
        error: 'Cannot delete brand: It is currently referenced by active products. Please reassign them first.',
      };
    }

    await db
      .update(brands)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(brands.id, id));

    console.log(`[Brand Soft-Deleted] ID: ${id}`);
    revalidatePath('/admin/brands');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Delete brand action failed:', err);
    return { success: false, error: 'Failed to delete brand.' };
  }
}
