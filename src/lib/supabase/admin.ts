import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { authConfig } from '@/core/config/auth';

/**
 * Creates an administrative Supabase client using the service role key.
 * ⚠️ WARNING: Bypasses Row Level Security (RLS). Ensure this is NEVER imported in client components.
 */
export function createAdminClient() {
  const serviceRoleKey = authConfig.supabase.serviceRoleKey;

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables.');
  }

  return createSupabaseClient(
    authConfig.supabase.url,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
