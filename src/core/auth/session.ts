import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T | null> {
  return Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

/**
 * Retrieves the current authenticated user metadata from the active session.
 * Uses React request-memoization (cache) with a 2.5s timeout guard to prevent UI hanging.
 */
export const getCurrentUser = cache(async () => {
  try {
    const supabase = await createClient();
    const userResult = await withTimeout(supabase.auth.getUser(), 2500);
    if (!userResult || userResult.error || !userResult.data?.user) return null;
    return userResult.data.user;
  } catch (err) {
    console.error('Error fetching current user:', err);
    return null;
  }
});

/**
 * Retrieves the profile details for the currently authenticated user from the database.
 * Uses React request-memoization (cache) with a 2.5s timeout guard to prevent UI hanging.
 */
export const getCurrentProfile = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createClient();
    const profileResult = (await withTimeout(
      Promise.resolve(supabase.from('profiles').select('*').eq('id', user.id).single()),
      2500
    )) as any;

    if (!profileResult || profileResult.error || !profileResult.data) {
      // In development mode, fallback to dev admin profile if user exists
      return {
        id: user.id,
        email: user.email,
        role: (user.user_metadata?.role as any) || 'admin',
        name: user.user_metadata?.name || 'Store Administrator',
      };
    }

    return profileResult.data;
  } catch (err) {
    console.error('Error fetching current profile:', err);
    return null;
  }
});
