'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { STORE_MODE_COOKIE_NAME, type StoreMode } from '@/core/config/store-mode';

/**
 * Server action to update operating store mode cookie.
 */
export async function setStoreModeAction(mode: StoreMode): Promise<{ success: boolean; error?: string }> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(STORE_MODE_COOKIE_NAME, mode, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
      httpOnly: false, // accessible to client JS for immediate UI sync
    });

    revalidatePath('/', 'layout');
    return { success: true };
  } catch (err) {
    console.error('Failed to set store mode:', err);
    return { success: false, error: 'Failed to update store mode setting.' };
  }
}
