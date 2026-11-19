import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema/auth';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * API handler to exchange validation codes for active login sessions.
 * Handles redirections for OAuth (Google, Apple), password recovery, and email confirmations.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error') || searchParams.get('error_description');

  // Handle direct OAuth error callback
  if (errorParam) {
    console.error('OAuth callback error reported from provider:', errorParam);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorParam)}`);
  }

  const rawNext = searchParams.get('next') || '/account';
  // Prevent open redirect attacks: ensure next is a relative URL
  const safeNext = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/account';

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      const authUser = data.user;

      // Ensure customer profile row exists in Postgres DB
      try {
        const existing = await db
          .select({ id: profiles.id })
          .from(profiles)
          .where(eq(profiles.id, authUser.id))
          .limit(1);

        if (existing.length === 0) {
          const email = authUser.email || '';
          const fullName =
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            (email ? email.split('@')[0] : 'Customer');
          const avatarUrl =
            authUser.user_metadata?.avatar_url ||
            authUser.user_metadata?.picture ||
            null;
          const username =
            (email ? email.split('@')[0] : 'user') +
            Math.floor(1000 + Math.random() * 9000);

          await db.insert(profiles).values({
            id: authUser.id,
            email,
            fullName,
            avatarUrl,
            username,
            role: 'customer',
            isActive: true,
          });
        }
      } catch (profileErr) {
        console.error('Failed to sync profile during OAuth callback:', profileErr);
      }

      const forwardedHost = request.headers.get('x-forwarded-host'); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development';
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safeNext}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safeNext}`);
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    } else if (error) {
      console.error('Failed to exchange code for session:', error.message);
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  // Return to login with error indication on failure
  return NextResponse.redirect(`${origin}/login?error=auth-callback-failed`);
}
