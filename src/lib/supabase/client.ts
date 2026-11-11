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

/**
 * Creates a browser-side Supabase client for client-side React components with network resilience.
 */
export function createClient() {
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
