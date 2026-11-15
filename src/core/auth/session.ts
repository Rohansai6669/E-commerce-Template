import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema/auth';
import { eq, or } from 'drizzle-orm';

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
 * In development mode, automatically falls back to an administrative profile so admin
 * dashboard and CRUD workflows remain fully functional without active Supabase sessions.
 */
export const getCurrentProfile = cache(async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      if (process.env.NODE_ENV !== 'production') {
        // In development mode, check if a profile already exists in DB to reuse its ID
        try {
          const dbAdmins = await db
            .select()
            .from(profiles)
            .where(or(eq(profiles.role, 'admin'), eq(profiles.role, 'staff')))
            .limit(1);

          if (dbAdmins && dbAdmins.length > 0) {
            return {
              ...dbAdmins[0],
              role: 'admin' as const,
              isDevFallback: false,
            };
          }

          const anyProfiles = await db.select().from(profiles).limit(1);
          if (anyProfiles && anyProfiles.length > 0) {
            return {
              ...anyProfiles[0],
              role: 'admin' as const,
              isDevFallback: false,
            };
          }

          // If no profiles exist, attempt seeding a dev administrator profile
          const [seeded] = await db
            .insert(profiles)
            .values({
              id: '00000000-0000-0000-0000-000000000000',
              email: 'admin@lexido.in',
              username: 'admin',
              fullName: 'Store Administrator',
              role: 'admin',
              isActive: true,
            })
            .onConflictDoNothing()
            .returning();

          if (seeded) {
            return {
              ...seeded,
              isDevFallback: false,
            };
          }
        } catch {
          // Ignore DB lookup error in dev mode
        }

        return {
          id: '00000000-0000-0000-0000-000000000000',
          email: 'admin@lexido.in',
          role: 'admin' as const,
          name: 'Store Administrator',
          fullName: 'Store Administrator',
          isDevFallback: true,
        };
      }
      return null;
    }

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
        role: (user.user_metadata?.role as any) || (process.env.NODE_ENV !== 'production' ? 'admin' : 'customer'),
        name: user.user_metadata?.name || 'Store Administrator',
        fullName: user.user_metadata?.name || 'Store Administrator',
        isDevFallback: process.env.NODE_ENV !== 'production',
      };
    }

    if (process.env.NODE_ENV !== 'production') {
      return {
        ...profileResult.data,
        role: 'admin' as const,
        isDevFallback: false,
      };
    }

    return profileResult.data;
  } catch (err) {
    console.error('Error fetching current profile:', err);
    if (process.env.NODE_ENV !== 'production') {
      return {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'admin@lexido.in',
        role: 'admin' as const,
        name: 'Store Administrator',
        fullName: 'Store Administrator',
        isDevFallback: true,
      };
    }
    return null;
  }
});
