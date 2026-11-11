'use server';

import { db } from '@/lib/db';
import { profiles, type Profile } from '@/lib/db/schema/auth';
import { suppliers, supplierSettings } from '@/lib/db/schema/marketplace/suppliers';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { eq, inArray, or } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

/**
 * Ensures caller is an Admin or Staff.
 */
async function enforceAdminAuthorization() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    throw new Error('Unauthorized: Administrative access is required.');
  }
  return profile;
}

/**
 * Helper to ensure a user profile with role='supplier' has a corresponding suppliers table entry.
 */
async function syncSupplierAccount(profileId: string, fullName: string, email: string, phone: string | null) {
  const [existingSupplier] = await db
    .select()
    .from(suppliers)
    .where(or(eq(suppliers.profileId, profileId), eq(suppliers.email, email)))
    .limit(1);

  if (existingSupplier) {
    if (!existingSupplier.profileId) {
      await db
        .update(suppliers)
        .set({ profileId, phone: phone || existingSupplier.phone })
        .where(eq(suppliers.id, existingSupplier.id));
    }
    return existingSupplier.id;
  }

  const supplierName = fullName || email.split('@')[0];
  const slug = `${supplierName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}-${Date.now().toString().slice(-4)}`;

  const [newSupplier] = await db
    .insert(suppliers)
    .values({
      name: supplierName,
      slug,
      email,
      phone,
      commissionRate: '10.00',
      status: 'active',
      profileId,
    })
    .returning();

  await db.insert(supplierSettings).values({
    supplierId: newSupplier.id,
    autoAcceptOrders: false,
    autoApproveReturns: false,
    autoPublishProducts: false,
    allowBackorders: false,
    fulfillmentSLA: 48,
    minimumOrderValue: '0.00',
    maximumLeadTime: 7,
  });

  return newSupplier.id;
}

/**
 * Creates a new customer/user profile.
 */
export async function createCustomerAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || null;
    const role = (formData.get('role') as 'customer' | 'staff' | 'admin' | 'supplier') || 'customer';
    const isActive = formData.get('isActive') === 'true';
    const avatarUrl = (formData.get('avatarUrl') as string) || null;

    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    const newId = randomUUID();

    const [newProfile] = await db
      .insert(profiles)
      .values({
        id: newId,
        email,
        username: `${username}-${Date.now().toString().slice(-4)}`,
        fullName: fullName || username,
        phone,
        avatarUrl,
        role: role as any,
        isActive,
        metadata: { createdByAdmin: true, createdByActorId: actor.id },
      })
      .returning();

    if (role === 'supplier') {
      await syncSupplierAccount(newProfile.id, fullName || username, email, phone);
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'user',
      entityId: newProfile.id,
      action: 'create',
      newValue: { fullName, email, role, isActive },
    });

    revalidatePath('/admin/customers');
    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (err: any) {
    console.error('Create customer error:', err);
    return { success: false, error: err?.message || 'Failed to create customer account.' };
  }
}

/**
 * Updates an existing customer profile.
 */
export async function updateCustomerAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    const fullName = (formData.get('fullName') as string) || '';
    const email = (formData.get('email') as string) || '';
    const phone = (formData.get('phone') as string) || null;
    const role = (formData.get('role') as 'customer' | 'staff' | 'admin' | 'supplier') || 'customer';
    const isActive = formData.get('isActive') === 'true';
    const avatarUrl = (formData.get('avatarUrl') as string) || null;

    await db
      .update(profiles)
      .set({
        fullName,
        email,
        phone,
        role: role as any,
        isActive,
        avatarUrl,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id));

    if (role === 'supplier') {
      await syncSupplierAccount(id, fullName, email, phone);
    }

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'user',
      entityId: id,
      action: 'update',
      newValue: { fullName, email, role, isActive },
    });

    revalidatePath('/admin/customers');
    revalidatePath('/admin/suppliers');
    return { success: true };
  } catch (err: any) {
    console.error('Update customer error:', err);
    return { success: false, error: err?.message || 'Failed to update customer account.' };
  }
}

/**
 * Toggles a customer's active status.
 */
export async function toggleCustomerStatusAction(
  id: string,
  targetStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    await db
      .update(profiles)
      .set({
        isActive: targetStatus,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, id));

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'user',
      entityId: id,
      action: 'status_changed',
      newValue: { isActive: targetStatus },
    });

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    console.error('Toggle customer status error:', err);
    return { success: false, error: err?.message || 'Failed to update customer status.' };
  }
}

/**
 * Bulk updates active status for multiple selected customers.
 */
export async function bulkUpdateCustomerStatusAction(
  ids: string[],
  targetStatus: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();
    if (!ids || ids.length === 0) return { success: true };

    await db
      .update(profiles)
      .set({
        isActive: targetStatus,
        updatedAt: new Date(),
      })
      .where(inArray(profiles.id, ids));

    await db.insert(auditLogs).values({
      actorId: actor.id,
      entity: 'user',
      entityId: ids.join(','),
      action: 'bulk_status_changed',
      newValue: { idsCount: ids.length, isActive: targetStatus },
    });

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    console.error('Bulk update customer status error:', err);
    return { success: false, error: err?.message || 'Failed to bulk update customer accounts.' };
  }
}
