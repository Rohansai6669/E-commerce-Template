'use server';

import { getCurrentUser } from '@/core/auth/session';
import { customerRepository } from '@/core/customer/customer.repository';
import { addressRepository } from '@/core/address/address.repository';
import { profileSchema, type ProfileFormValues } from '@/core/account/profile.validation';
import { customerAddressSchema, type CustomerAddressFormValues } from '@/core/address/address.validation';
import { type CustomerAddress } from '@/core/address/address.types';
import { type Profile } from '@/lib/db/schema/auth';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema/order';
import { sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Asserts the user is authenticated and returns their profile ID.
 */
async function assertAuth(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized access');
  }
  return user.id;
}

/**
 * Helper to safely extract error message from unknown catch blocks.
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

/**
 * Action to update customer profile info.
 */
export async function updateProfileAction(data: ProfileFormValues): Promise<{ success: boolean; profile?: Profile; error?: string }> {
  try {
    const profileId = await assertAuth();
    const parsed = profileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Validation failed' };
    }

    const profile = await customerRepository.update(profileId, {
      fullName: parsed.data.fullName,
      username: parsed.data.username,
      phone: parsed.data.phone,
      avatarUrl: parsed.data.avatarUrl || null,
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    revalidatePath('/account/settings');
    revalidatePath('/account');
    return { success: true, profile };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Action to retrieve all saved addresses for the current user.
 */
export async function getAddressesAction(): Promise<CustomerAddress[]> {
  try {
    const profileId = await assertAuth();
    return await addressRepository.getAddresses(profileId);
  } catch {
    return [];
  }
}

/**
 * Action to create a new address card.
 */
export async function createAddressAction(data: CustomerAddressFormValues): Promise<{ success: boolean; address?: CustomerAddress; error?: string }> {
  try {
    const profileId = await assertAuth();
    const parsed = customerAddressSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Validation failed' };
    }

    const address = await addressRepository.create(profileId, parsed.data);
    revalidatePath('/account/addresses');
    return { success: true, address };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Action to update an existing address card.
 */
export async function updateAddressAction(id: string, data: CustomerAddressFormValues): Promise<{ success: boolean; address?: CustomerAddress; error?: string }> {
  try {
    const profileId = await assertAuth();
    const parsed = customerAddressSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Validation failed' };
    }

    const address = await addressRepository.update(id, profileId, parsed.data);
    if (!address) {
      return { success: false, error: 'Address not found' };
    }

    revalidatePath('/account/addresses');
    return { success: true, address };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Action to delete a saved address card.
 */
export async function deleteAddressAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const profileId = await assertAuth();
    const success = await addressRepository.delete(id, profileId);
    if (!success) {
      return { success: false, error: 'Address not found' };
    }
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Action to toggle a saved address card as default.
 */
export async function setDefaultAddressAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const profileId = await assertAuth();
    const success = await addressRepository.setDefault(id, profileId);
    if (!success) {
      return { success: false, error: 'Address not found' };
    }
    revalidatePath('/account/addresses');
    return { success: true };
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}

/**
 * Action to scan for historical guest orders with matching emails,
 * and link them to the newly registered customer account.
 */
export async function linkGuestOrdersAction(): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || !user.email) {
      return { success: false, count: 0, error: 'User email not found' };
    }

    // Perform database update in orders table linking profileId where email matches in shippingAddress JSON
    const updatedRows = await db
      .update(orders)
      .set({ profileId: user.id })
      .where(sql`${orders.shippingAddress}->>'email' = ${user.email}`)
      .returning();

    if (updatedRows.length > 0) {
      revalidatePath('/account/orders');
      revalidatePath('/account');
    }

    return { success: true, count: updatedRows.length };
  } catch (err) {
    return { success: false, count: 0, error: getErrorMessage(err) };
  }
}
