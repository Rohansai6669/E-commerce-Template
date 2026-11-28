'use server';

import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { invalidateCategoryCache, invalidateCacheTag } from '@/core/performance/cache';

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
    invalidateCategoryCache();
    invalidateCacheTag('categories', 'navigation', 'catalog');
    revalidatePath('/', 'layout');
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
 * Updates an existing category's properties (name, slug, description, parent, active status, image).
 */
export async function updateCategoryAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const name = formData.get('name') as string;
  const slugRaw = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const isActiveStr = formData.get('isActive') as string;
  const parentIdRaw = formData.get('parentId') as string;
  const imageUrlRaw = formData.get('imageUrl') as string;

  if (!name || name.trim() === '') return { success: false, error: 'Category name is required.' };

  const slug =
    slugRaw && slugRaw.trim() !== ''
      ? slugRaw.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      : name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const parentId =
    parentIdRaw !== undefined
      ? parentIdRaw && parentIdRaw !== 'none' && parentIdRaw.trim() !== '' && parentIdRaw !== id
        ? parentIdRaw.trim()
        : null
      : undefined;

  const imageUrl = imageUrlRaw !== undefined ? (imageUrlRaw.trim() !== '' ? imageUrlRaw.trim() : null) : undefined;

  try {
    const updateData: Record<string, any> = {
      name: name.trim(),
      slug,
      description: description?.trim() || null,
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

    console.log(`[Category Updated] ID: ${id}, Name: ${name}, Slug: ${slug}, Parent: ${parentId ?? 'none'}`);
    invalidateCategoryCache();
    invalidateCacheTag('categories', 'navigation', 'catalog');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Update category action failed:', err);
    return { success: false, error: 'Failed to update category (duplicate or invalid slug).' };
  }
}

export interface DeleteCategoryOptions {
  mode?: 'cascade' | 'reassign' | 'detach';
  reassignToParentId?: string | null;
}

/**
 * Performs category deletion with configurable cascading behavior:
 * - 'cascade': Deletes the parent AND all its nested subcategories and child categories.
 * - 'reassign': Deletes the parent and moves its direct children under another selected parent.
 * - 'detach': Deletes the parent and promotes direct children to top-level (parentId: null).
 */
export async function deleteCategoryAction(
  id: string,
  options?: DeleteCategoryOptions
): Promise<{ success: boolean; error?: string; affectedCount?: number }> {
  try {
    const mode = options?.mode || 'detach';
    const reassignToParentId = options?.reassignToParentId || null;

    // 1. Gather all direct children
    const directChildren = await db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.parentId, id), sql`${categories.deletedAt} IS NULL`));

    const directChildIds = directChildren.map((c) => c.id);

    // 2. Gather grandchildren (children of direct children)
    let grandChildIds: string[] = [];
    if (directChildIds.length > 0) {
      const grandchildren = await db
        .select({ id: categories.id })
        .from(categories)
        .where(and(inArray(categories.parentId, directChildIds), sql`${categories.deletedAt} IS NULL`));
      grandChildIds = grandchildren.map((c) => c.id);
    }

    const allDescendantIds = [...directChildIds, ...grandChildIds];
    const targetDeleteIds = mode === 'cascade' ? [id, ...allDescendantIds] : [id];

    // Safety check: verify if any products are associated with target deletion categories
    const associatedProducts = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(and(inArray(products.categoryId, targetDeleteIds), sql`${products.deletedAt} IS NULL`))
      .limit(5);

    if (associatedProducts.length > 0) {
      return {
        success: false,
        error: `Cannot delete: ${associatedProducts.length} product(s) (such as "${associatedProducts[0].name}") are assigned to this category or its nested items. Please reassign the products first.`,
      };
    }

    const now = new Date();

    if (mode === 'cascade') {
      // Soft-delete parent, subcategories, and child categories together
      await db
        .update(categories)
        .set({ deletedAt: now, updatedAt: now })
        .where(inArray(categories.id, targetDeleteIds));
      console.log(`[Category Cascade-Deleted] ID: ${id}, Total Deleted Items: ${targetDeleteIds.length}`);
    } else if (mode === 'reassign' && reassignToParentId) {
      // Reassign direct children to the selected parent
      if (directChildIds.length > 0) {
        await db
          .update(categories)
          .set({ parentId: reassignToParentId, updatedAt: now })
          .where(inArray(categories.id, directChildIds));
      }
      // Soft-delete only the target category
      await db.update(categories).set({ deletedAt: now, updatedAt: now }).where(eq(categories.id, id));
      console.log(`[Category Deleted & Children Reassigned to ${reassignToParentId}] ID: ${id}`);
    } else {
      // Detach: promote direct children to top-level (parentId: null) so they aren't orphaned
      if (directChildIds.length > 0) {
        await db
          .update(categories)
          .set({ parentId: null, updatedAt: now })
          .where(inArray(categories.id, directChildIds));
      }
      // Soft-delete only the target category
      await db.update(categories).set({ deletedAt: now, updatedAt: now }).where(eq(categories.id, id));
      console.log(`[Category Deleted & Children Promoted to Top-Level] ID: ${id}`);
    }

    invalidateCategoryCache();
    invalidateCacheTag('categories', 'navigation', 'catalog');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/categories');
    revalidatePath('/products');
    return { success: true, affectedCount: targetDeleteIds.length };
  } catch (err) {
    console.error('Delete category action failed:', err);
    return { success: false, error: 'Failed to delete category.' };
  }
}

/**
 * Reassigns a category or unassigned subcategory to a new parent or promotes it to top-level.
 */
export async function reassignCategoryParentAction(
  categoryId: string,
  newParentId: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const parentId = newParentId && newParentId !== 'none' && newParentId.trim() !== '' ? newParentId.trim() : null;
    if (parentId === categoryId) {
      return { success: false, error: 'A category cannot be its own parent.' };
    }

    await db
      .update(categories)
      .set({ parentId, updatedAt: new Date() })
      .where(eq(categories.id, categoryId));

    console.log(`[Category Parent Reassigned] Category ${categoryId} -> New Parent ${parentId ?? 'Top-Level'}`);
    invalidateCategoryCache();
    invalidateCacheTag('categories', 'navigation', 'catalog');
    revalidatePath('/', 'layout');
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidatePath('/products');
    return { success: true };
  } catch (err) {
    console.error('Reassign category parent action failed:', err);
    return { success: false, error: 'Failed to reassign category parent.' };
  }
}
