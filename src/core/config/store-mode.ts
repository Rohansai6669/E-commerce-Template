export type StoreMode = 'standalone' | 'marketplace';

export const STORE_MODE_COOKIE_NAME = 'store_mode';

/**
 * Reads the active operating mode on the client side.
 * Safe to import in Client Components (does NOT use next/headers).
 */
export function getStoreModeClient(): StoreMode {
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(new RegExp(`(?:^|; )${STORE_MODE_COOKIE_NAME}=([^;]*)`));
    if (match && (match[1] === 'marketplace' || match[1] === 'standalone')) {
      return match[1] as StoreMode;
    }
  }
  const envMode = process.env.NEXT_PUBLIC_MARKETPLACE_MODE;
  if (envMode === 'true' || envMode === 'marketplace') {
    return 'marketplace';
  }
  return 'standalone';
}
