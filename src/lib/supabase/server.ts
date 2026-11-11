import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig } from '@/core/config/auth';

/**
 * Creates a server-side Supabase client for Server Components, Server Actions, and Route Handlers.
 * Handles the asynchronous cookies() API required by Next.js 15/16.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    authConfig.supabase.url,
    authConfig.supabase.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be safely ignored if you have middleware refreshing
            // user sessions (which middleware.ts handles).
          }
        },
      },
    }
  );
}
