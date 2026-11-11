import { cookies } from 'next/headers';
import { STORE_MODE_COOKIE_NAME, type StoreMode } from './store-mode';

/**
 * Reads the active operating mode on the server.
 * Server-only helper (uses next/headers).
 */
export async function getStoreModeServer(): Promise<StoreMode> {
  try {
    const cookieStore = await cookies();
    const modeCookie = cookieStore.get(STORE_MODE_COOKIE_NAME)?.value;
    if (modeCookie === 'marketplace' || modeCookie === 'standalone') {
      return modeCookie;
    }
  } catch (err) {
    // In static rendering or non-request contexts
  }

  const envMode = process.env.NEXT_PUBLIC_MARKETPLACE_MODE;
  if (envMode === 'true' || envMode === 'marketplace') {
    return 'marketplace';
  }

  return 'standalone';
}
