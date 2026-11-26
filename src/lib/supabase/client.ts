import { createBrowserClient } from '@supabase/ssr';
import { authConfig } from '@/core/config/auth';

export class SupabaseNetworkError extends Error {
  constructor(message = 'Supabase service is unreachable due to a network error') {
    super(message);
    this.name = 'SupabaseNetworkError';
  }
}

/**
 * Resilient fetch wrapper for Supabase client.
 * Converts generic `TypeError: Failed to fetch` into `SupabaseNetworkError`
 * while preserving HTTP errors (4xx, 5xx, auth errors).
 */
export const resilientFetch: typeof fetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (
      error instanceof TypeError &&
      error.message.toLowerCase().includes('failed to fetch')
    ) {
      throw new SupabaseNetworkError('Supabase API is unreachable');
    }
    throw error;
  }
};

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Creates a browser-side Supabase client for client-side React components with network resilience.
 * Uses a browser-level singleton to avoid creating multiple Supabase clients and leaking event listeners.
 */
export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      authConfig.supabase.url,
      authConfig.supabase.anonKey,
      {
        global: {
          fetch: resilientFetch,
        },
      }
    );
  }

  if (!browserClient) {
    browserClient = createBrowserClient(
      authConfig.supabase.url,
      authConfig.supabase.anonKey,
      {
        global: {
          fetch: resilientFetch,
        },
      }
    );
  }
  return browserClient;
}
