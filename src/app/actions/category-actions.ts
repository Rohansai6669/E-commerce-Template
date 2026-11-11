'use server';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Creates a new category or subcategory.
 */
export async function createCategoryAction(
  formData: FormData
): Promise<{ success: boolean; data?: { id: string; name: string }; error?: string }> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const parentIdRaw = formData.get('parentId') as string;
  const imageUrlRaw = formData.get('imageUrl') as string;

  if (!name) return { success: false, error: 'Category name is required.' };

  const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const parentId = parentIdRaw && parentIdRaw !== 'none' && parentIdRaw.trim() !== '' ? parentIdRaw.trim() : null;
  const imageUrl = imageUrlRaw && imageUrlRaw.trim() !== '' ? imageUrlRaw.trim() : null;

  try {
    const [newCat] = await db
      .insert(categories)
      .values({
        name,
        slug,
        description,
        parentId,
        imageUrl,
        isActive: true,
      })
      .returning({ id: categories.id, name: categories.name });

    console.log(`[Category Created] ${name} (${slug}) - Parent: ${parentId || 'none'}`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true, data: { id: newCat.id, name: newCat.name } };
  } catch (err) {
    console.error('Create category action failed:', err);
    return { success: false, error: 'Failed to create category (duplicate or invalid slug).' };
  }
}

/**
 * Updates an existing category's properties.
 */
export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const isActiveStr = formData.get('isActive') as string;
  const parentIdRaw = formData.get('parentId') as string;
  const imageUrlRaw = formData.get('imageUrl') as string;

  if (!name) return { success: false, error: 'Category name is required.' };

  const parentId =
    parentIdRaw !== undefined
      ? parentIdRaw && parentIdRaw !== 'none' && parentIdRaw.trim() !== '' && parentIdRaw !== id
        ? parentIdRaw.trim()
        : null
      : undefined;

  const imageUrl = imageUrlRaw !== undefined ? (imageUrlRaw.trim() !== '' ? imageUrlRaw.trim() : null) : undefined;

  try {
    const updateData: Record<string, any> = {
      name,
      description,
      isActive: isActiveStr === 'true',
      updatedAt: new Date(),
    };

    if (parentId !== undefined) {
      updateData.parentId = parentId;
    }
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id));

    console.log(`[Category Updated] ID: ${id}, Name: ${name}`);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Update category action failed:', err);
    return { success: false, error: 'Failed to update category.' };
  }
}

/**
 * Performs a soft-delete on a category after verifying dependency safety constraints.
 */
export async function deleteCategoryAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Safety check: verify if any products are associated with this category
    const associatedProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(and(eq(products.categoryId, id), sql`${products.deletedAt} IS NULL`))
      .limit(1);

    if (associatedProducts.length > 0) {
      return {
        success: false,
        error: 'Cannot delete category: It is currently referenced by active products. Please reassign them first.',
      };
    }

    await db
      .update(categories)
      .set({
        deletedAt: new Date(),
      })
      .where(eq(categories.id, id));

    console.log(`[Category Soft-Deleted] ID: ${id}`);
    revalidatePath('/admin/categories');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Delete category action failed:', err);
    return { success: false, error: 'Failed to delete category.' };
  }
}
