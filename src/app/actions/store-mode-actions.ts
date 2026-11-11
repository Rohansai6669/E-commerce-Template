'use server';

import { cookies } from 'next/headers';
import { STORE_MODE_COOKIE_NAME, type StoreMode } from '@/core/config/store-mode';
import { getCurrentProfile } from '@/core/auth/session';
import { revalidatePath } from 'next/cache';

/**
 * Toggles or updates the platform Store Mode ('standalone' | 'marketplace').
 * Safe non-destructive toggle: preserves database records while updating cookie state.
 * Requires Admin authorization.
 */
export async function updateStoreModeAction(
  newMode: StoreMode
): Promise<{ success: boolean; error?: string }> {
  try {
    const actor = await getCurrentProfile();
    if (!actor || actor.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin privileges required to update Store Mode.' };
    }

    if (newMode !== 'standalone' && newMode !== 'marketplace') {
      return { success: false, error: 'Invalid store mode specified.' };
    }

    const cookieStore = await cookies();
    cookieStore.set(STORE_MODE_COOKIE_NAME, newMode, {
      path: '/',
      httpOnly: false, // Accessible client-side for StoreModeSwitcher
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    revalidatePath('/admin');
    revalidatePath('/admin/settings');
    revalidatePath('/products');
    revalidatePath('/supplier');

    return { success: true };
  } catch (err: any) {
    console.error('Failed to update store mode:', err);
    return { success: false, error: err.message || 'Failed to update store mode.' };
  }
}
