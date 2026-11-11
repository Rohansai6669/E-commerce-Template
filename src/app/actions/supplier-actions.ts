'use server';

import { db } from '@/lib/db';
import { suppliers, supplierSettings, supplierAddresses } from '@/lib/db/schema/marketplace/suppliers';
import { supplierInvitations } from '@/lib/db/schema/marketplace/invitations';
import { profiles } from '@/lib/db/schema/auth';
import { auditLogs } from '@/lib/db/schema/audit';
import { getCurrentProfile } from '@/core/auth/session';
import { SupplierBrandService } from '@/lib/services/supplier-brand-service';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { randomUUID, randomBytes } from 'crypto';

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
 * Creates a new supplier boutique, registers user account with role 'supplier', and sets up permissions.
 */
export async function createSupplierAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const commissionRateRaw = formData.get('commissionRate') as string;
    const brandIds = formData.getAll('brandIds') as string[];

    if (!name || !email) {
      return { success: false, error: 'Name and email are required.' };
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const commissionRate = commissionRateRaw ? parseFloat(commissionRateRaw).toFixed(2) : '10.00';
    const profileId = randomUUID();
    const username = `supplier-${name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    await db.transaction(async (tx) => {
      // 1. Create Supplier User Profile with role 'supplier'
      const [newProfile] = await tx
        .insert(profiles)
        .values({
          id: profileId,
          email,
          username,
          fullName: name,
          phone,
          role: 'supplier' as any,
          isActive: true,
          metadata: { isSupplierAccount: true, boutiqueName: name },
        })
        .returning();

      // 2. Create Supplier Boutique record linked to profile
      const [newSupplier] = await tx
        .insert(suppliers)
        .values({
          name,
          slug,
          email,
          phone,
          commissionRate,
          status: 'active',
          profileId: newProfile.id,
        })
        .returning();

      // 3. Initialize default Supplier settings
      await tx.insert(supplierSettings).values({
        supplierId: newSupplier.id,
        autoAcceptOrders: false,
        autoApproveReturns: false,
        autoPublishProducts: false,
        allowBackorders: false,
        fulfillmentSLA: 48,
        minimumOrderValue: '0.00',
        maximumLeadTime: 7,
      });

      // 4. Sync authorized brand fulfillment list
      if (brandIds && brandIds.length > 0) {
        await SupplierBrandService.syncSupplierBrands(newSupplier.id, brandIds, tx);
      }

      // 5. Log mutation in audit trail
      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'supplier',
        entityId: newSupplier.id,
        action: 'create',
        newValue: { name, email, commissionRate, role: 'supplier' },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/customers');
    revalidatePath('/admin/brands');
    return { success: true };
  } catch (err: any) {
    console.error('Create supplier failed:', err);
    return { success: false, error: err.message || 'Failed to create supplier boutique.' };
  }
}

/**
 * Invites a supplier via invitation token.
 */
export async function inviteSupplierAction(formData: FormData): Promise<{
  success: boolean;
  inviteLink?: string;
  token?: string;
  error?: string;
}> {
  try {
    const actor = await enforceAdminAuthorization();

    const email = (formData.get('email') as string) || '';
    const supplierName = (formData.get('supplierName') as string) || '';
    const commissionRateRaw = (formData.get('commissionRate') as string) || '10.00';
    const brandIds = formData.getAll('brandIds') as string[];

    if (!email || !supplierName) {
      return { success: false, error: 'Boutique name and email are required for invitation.' };
    }

    const token = randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days expiration

    await db.insert(supplierInvitations).values({
      email,
      supplierName,
      token,
      commissionRate: parseFloat(commissionRateRaw).toFixed(2),
      brandIds,
      invitedBy: actor.id,
      expiresAt,
      status: 'pending',
    });

    // Also pre-create a profile with role 'supplier' and isActive: false
    const profileId = randomUUID();
    const username = `invite-${supplierName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;

    try {
      await db.insert(profiles).values({
        id: profileId,
        email,
        username,
        fullName: supplierName,
        role: 'supplier' as any,
        isActive: false,
        metadata: { isPendingInvite: true, inviteToken: token },
      });
    } catch {
      // Profile may already exist
    }

    const inviteLink = `/invite/supplier?token=${token}`;

    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/customers');
    return {
      success: true,
      token,
      inviteLink,
    };
  } catch (err: any) {
    console.error('Invite supplier failed:', err);
    return { success: false, error: err?.message || 'Failed to generate supplier invitation.' };
  }
}

/**
 * Gets details of a pending supplier invitation.
 */
export async function getSupplierInviteDetailsAction(token: string): Promise<{
  success: boolean;
  invite?: {
    email: string;
    supplierName: string;
    commissionRate: string;
    expiresAt: Date;
  };
  error?: string;
}> {
  try {
    const [invite] = await db
      .select()
      .from(supplierInvitations)
      .where(eq(supplierInvitations.token, token))
      .limit(1);

    if (!invite) return { success: false, error: 'Invalid invitation token.' };

    if (invite.status === 'accepted') {
      return { success: false, error: 'This supplier invitation has already been accepted.' };
    }

    if (new Date() > new Date(invite.expiresAt)) {
      return { success: false, error: 'This supplier invitation link has expired. Please request a new invite.' };
    }

    return {
      success: true,
      invite: {
        email: invite.email,
        supplierName: invite.supplierName,
        commissionRate: invite.commissionRate,
        expiresAt: invite.expiresAt,
      },
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch invitation details.' };
  }
}

/**
 * Accepts a supplier invitation and activates supplier user profile & boutique.
 */
export async function acceptSupplierInviteAction(
  token: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const [invite] = await db
      .select()
      .from(supplierInvitations)
      .where(eq(supplierInvitations.token, token))
      .limit(1);

    if (!invite || invite.status !== 'pending') {
      return { success: false, error: 'Invalid or expired invitation token.' };
    }

    const fullName = (formData.get('fullName') as string) || invite.supplierName;
    const phone = (formData.get('phone') as string) || '';

    const slug = invite.supplierName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await db.transaction(async (tx) => {
      // 1. Update/create user profile with role 'supplier'
      const [existingProfile] = await tx
        .select()
        .from(profiles)
        .where(eq(profiles.email, invite.email))
        .limit(1);

      let pId = existingProfile?.id;
      if (existingProfile) {
        await tx
          .update(profiles)
          .set({
            fullName,
            phone,
            role: 'supplier' as any,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, existingProfile.id));
      } else {
        pId = randomUUID();
        await tx.insert(profiles).values({
          id: pId,
          email: invite.email,
          username: `supplier-${slug}-${Date.now().toString().slice(-4)}`,
          fullName,
          phone,
          role: 'supplier' as any,
          isActive: true,
        });
      }

      // 2. Insert active supplier boutique
      const [newSupplier] = await tx
        .insert(suppliers)
        .values({
          name: invite.supplierName,
          slug,
          email: invite.email,
          phone,
          commissionRate: invite.commissionRate,
          status: 'active',
          profileId: pId,
        })
        .returning();

      // 3. Initialize supplier settings
      await tx.insert(supplierSettings).values({
        supplierId: newSupplier.id,
        autoAcceptOrders: false,
        autoApproveReturns: false,
        autoPublishProducts: false,
        allowBackorders: false,
        fulfillmentSLA: 48,
        minimumOrderValue: '0.00',
        maximumLeadTime: 7,
      });

      // 4. Sync authorized brands if any
      const brandIdsArr = (invite.brandIds as string[]) || [];
      if (brandIdsArr.length > 0) {
        await SupplierBrandService.syncSupplierBrands(newSupplier.id, brandIdsArr, tx);
      }

      // 5. Update invitation status
      await tx
        .update(supplierInvitations)
        .set({ status: 'accepted' })
        .where(eq(supplierInvitations.id, invite.id));
    });

    revalidatePath('/admin');
    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    console.error('Accept supplier invite error:', err);
    return { success: false, error: err?.message || 'Failed to accept supplier invitation.' };
  }
}

/**
 * Updates a supplier boutique's status.
 */
export async function updateSupplierStatusAction(
  supplierId: string,
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived'
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    await db.transaction(async (tx) => {
      const [supplier] = await tx.select().from(suppliers).where(eq(suppliers.id, supplierId)).limit(1);
      if (!supplier) throw new Error('Supplier boutique not found.');

      await tx.update(suppliers).set({ status }).where(eq(suppliers.id, supplierId));

      if (supplier.profileId) {
        await tx
          .update(profiles)
          .set({ isActive: status === 'active' })
          .where(eq(profiles.id, supplier.profileId));
      }

      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'supplier',
        entityId: supplierId,
        action: 'status_changed',
        oldValue: { status: supplier.status },
        newValue: { status },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    console.error('Update supplier status failed:', err);
    return { success: false, error: err.message || 'Failed to transition supplier status.' };
  }
}

/**
 * Directly updates brand fulfillment authorization for a supplier.
 */
export async function updateSupplierBrandsAction(
  supplierId: string,
  brandIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    await enforceAdminAuthorization();

    await db.transaction(async (tx) => {
      await SupplierBrandService.syncSupplierBrands(supplierId, brandIds, tx);
    });

    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/brands');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (err: any) {
    console.error('Update supplier brands failed:', err);
    return { success: false, error: err.message || 'Failed to update supplier brands.' };
  }
}

/**
 * Updates supplier boutique details including status, contact info, commission rate, and pickup address.
 */
export async function updateSupplierDetailsAction(
  supplierId: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await enforceAdminAuthorization();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const commissionRateRaw = formData.get('commissionRate') as string;
    const status = formData.get('status') as 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';

    // Address fields
    const contactName = formData.get('contactName') as string;
    const addressPhone = formData.get('addressPhone') as string;
    const addressLine1 = formData.get('addressLine1') as string;
    const addressLine2 = formData.get('addressLine2') as string;
    const city = formData.get('city') as string;
    const state = formData.get('state') as string;
    const country = formData.get('country') as string;
    const postalCode = formData.get('postalCode') as string;

    if (!name || !email) {
      return { success: false, error: 'Boutique name and email are required.' };
    }

    await db.transaction(async (tx) => {
      // 1. Update supplier record
      const [supplier] = await tx
        .update(suppliers)
        .set({
          name,
          email,
          phone,
          commissionRate: commissionRateRaw ? parseFloat(commissionRateRaw).toFixed(2) : '10.00',
          status: status || 'active',
          updatedAt: new Date(),
        })
        .where(eq(suppliers.id, supplierId))
        .returning();

      // 2. Sync profile email & phone if linked
      if (supplier && supplier.profileId) {
        await tx
          .update(profiles)
          .set({
            fullName: name,
            email,
            phone,
            isActive: status === 'active',
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, supplier.profileId));
      }

      // 3. Upsert address if addressLine1 provided
      if (addressLine1 && city && state && country && postalCode) {
        const [existingAddress] = await tx
          .select()
          .from(supplierAddresses)
          .where(eq(supplierAddresses.supplierId, supplierId))
          .limit(1);

        if (existingAddress) {
          await tx
            .update(supplierAddresses)
            .set({
              contactName: contactName || name,
              phone: addressPhone || phone || '',
              addressLine1,
              addressLine2: addressLine2 || null,
              city,
              state,
              country,
              postalCode,
              updatedAt: new Date(),
            })
            .where(eq(supplierAddresses.id, existingAddress.id));
        } else {
          await tx.insert(supplierAddresses).values({
            supplierId,
            type: 'pickup',
            contactName: contactName || name,
            phone: addressPhone || phone || '',
            addressLine1,
            addressLine2: addressLine2 || null,
            city,
            state,
            country,
            postalCode,
            isDefault: true,
          });
        }
      }

      // 4. Log audit entry
      await tx.insert(auditLogs).values({
        actorId: actor.id,
        entity: 'supplier',
        entityId: supplierId,
        action: 'update_details',
        newValue: { name, email, status, addressLine1, city },
      });
    });

    revalidatePath('/admin');
    revalidatePath('/admin/suppliers');
    revalidatePath('/admin/customers');
    return { success: true };
  } catch (err: any) {
    console.error('Update supplier details failed:', err);
    return { success: false, error: err.message || 'Failed to update supplier details.' };
  }
}
