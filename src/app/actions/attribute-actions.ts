'use server';

import { db } from '@/lib/db';
import { globalAttributes, globalAttributeValues } from '@/lib/db/schema/catalog/variants';
import { getCurrentProfile } from '@/core/auth/session';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Ensures caller is an Admin or Staff.
 */
async function enforceAdminAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff' && profile.role !== 'supplier')) {
    throw new Error('Unauthorized: Administrative or supplier catalog access is required.');
  }
  return profile;
}

export async function getGlobalAttributesAction(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  try {
    await enforceAdminAuthorization();
    const attributes = await db
      .select()
      .from(globalAttributes)
      .where(eq(globalAttributes.status, 'active'))
      .orderBy(globalAttributes.sortOrder);

    const attributesWithValues = await Promise.all(
      attributes.map(async (attr) => {
        const values = await db
          .select()
          .from(globalAttributeValues)
          .where(eq(globalAttributeValues.attributeId, attr.id))
          .orderBy(globalAttributeValues.sortOrder);
        return {
          ...attr,
          values,
        };
      })
    );

    return { success: true, data: attributesWithValues };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to fetch attributes.' };
  }
}

interface CreateAttributeValInput {
  value: string;
  colorHex?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

export async function createGlobalAttributeAction(
  name: string,
  displayType: string,
  values: CreateAttributeValInput[]
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    await enforceAdminAuthorization();
    if (!name.trim()) {
      return { success: false, error: 'Attribute name is required.' };
    }

    return await db.transaction(async (tx) => {
      // Create global attribute record
      const [newAttr] = await tx
        .insert(globalAttributes)
        .values({
          name: name.trim(),
          displayType: displayType || 'text',
          sortOrder: 0,
          status: 'active',
        })
        .returning();

      if (values && values.length > 0) {
        await tx.insert(globalAttributeValues).values(
          values.map((v, index) => ({
            attributeId: newAttr.id,
            value: v.value.trim(),
            colorHex: v.colorHex || null,
            imageUrl: v.imageUrl || null,
            sortOrder: v.sortOrder ?? index,
          }))
        );
      }

      revalidatePath('/admin/attributes');
      revalidatePath('/admin/products');
      return { success: true, data: newAttr };
    });
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create global attribute.' };
  }
}

interface UpdateAttributeValInput {
  id?: string;
  value: string;
  colorHex?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
}

export async function updateGlobalAttributeAction(
  id: string,
  name: string,
  displayType: string,
  values: UpdateAttributeValInput[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdminAuthorization();
    if (!name.trim()) {
      return { success: false, error: 'Attribute name is required.' };
    }

    return await db.transaction(async (tx) => {
      // Update global attribute name/display type
      await tx
        .update(globalAttributes)
        .set({
          name: name.trim(),
          displayType: displayType,
        })
        .where(eq(globalAttributes.id, id));

      // Fetch existing values to determine deleted ones
      const existing = await tx
        .select()
        .from(globalAttributeValues)
        .where(eq(globalAttributeValues.attributeId, id));

      const inputIds = values.filter(v => v.id).map(v => v.id as string);
      const toDelete = existing.filter(e => !inputIds.includes(e.id));

      // Delete removed values
      for (const e of toDelete) {
        await tx.delete(globalAttributeValues).where(eq(globalAttributeValues.id, e.id));
      }

      // Update or insert remaining values
      for (const val of values) {
        if (val.id) {
          await tx
            .update(globalAttributeValues)
            .set({
              value: val.value.trim(),
              colorHex: val.colorHex || null,
              imageUrl: val.imageUrl || null,
              sortOrder: val.sortOrder,
            })
            .where(eq(globalAttributeValues.id, val.id));
        } else {
          await tx.insert(globalAttributeValues).values({
            attributeId: id,
            value: val.value.trim(),
            colorHex: val.colorHex || null,
            imageUrl: val.imageUrl || null,
            sortOrder: val.sortOrder,
          });
        }
      }

      revalidatePath('/admin/attributes');
      revalidatePath('/admin/products');
      return { success: true };
    });
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to update global attribute.' };
  }
}

export async function archiveGlobalAttributeAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdminAuthorization();
    await db
      .update(globalAttributes)
      .set({
        status: 'archived',
        deletedAt: new Date(),
      })
      .where(eq(globalAttributes.id, id));

    revalidatePath('/admin/attributes');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to archive global attribute.' };
  }
}
