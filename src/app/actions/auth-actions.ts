'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapAuthError(rawError: string): string {
  const lower = rawError.toLowerCase();
  if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
    return 'Incorrect email or password. Please verify your details and try again.';
  }
  if (lower.includes('user already registered') || lower.includes('already exists') || lower.includes('already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address. Check your inbox for the confirmation link.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password must be at least 8 characters long.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('for security purposes')) {
    return 'For security purposes, you can only request this once every 60 seconds. Please wait before trying again.';
  }
  if (lower.includes('auth session missing') || lower.includes('session missing') || lower.includes('jwt expired') || lower.includes('invalid token')) {
    return 'Your password reset session has expired or is invalid. Please request a new reset link.';
  }
  return rawError;
}

/**
 * Server action to sign in customer using email and password.
 */
export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err: any) {
    console.error('Login action failure:', err);
    return { success: false, error: err?.message || 'An unexpected authentication error occurred.' };
  }
}

/**
 * Server action to register a new customer profile.
 */
export async function registerAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const fullName = (formData.get('fullName') as string || '').trim();
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  const password = formData.get('password') as string || '';

  if (!fullName) {
    return { success: false, error: 'Full name is required.' };
  }

  if (fullName.length < 2) {
    return { success: false, error: 'Full name must be at least 2 characters.' };
  }

  if (!email) {
    return { success: false, error: 'Email address is required.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  if (!password) {
    return { success: false, error: 'Password is required.' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  try {
    const supabase = await createClient();
    
    // 1. Sign up user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      return { success: false, error: mapAuthError(authError.message) };
    }

    const authUser = authData.user;
    if (authUser) {
      // 2. Initialize customer profile record in database using Drizzle
      const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);
      
      const existing = await db
        .select()
        .from(profiles)
        .where(eq(profiles.id, authUser.id))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(profiles).values({
          id: authUser.id,
          email: email,
          fullName: fullName,
          username: username,
          role: 'customer',
          isActive: true,
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Registration action failure:', err);
    return { success: false, error: err?.message || 'An unexpected database error occurred during registration.' };
  }
}

/**
 * Server action to log out user and clear sessions.
 */
export async function logoutAction(): Promise<{ success: boolean }> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error('Logout error:', err);
    return { success: true };
  }
}

/**
 * Server action to trigger password recovery emails.
 */
export async function forgotPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = (formData.get('email') as string || '').trim().toLowerCase();
  if (!email) {
    return { success: false, error: 'Email address is required.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const supabase = await createClient();
    
    // Dynamically resolve request origin
    let origin = process.env.NEXT_PUBLIC_APP_URL?.trim();
    if (!origin) {
      try {
        const headerList = await headers();
        const host = headerList.get('x-forwarded-host') || headerList.get('host') || 'localhost:3000';
        const proto = headerList.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
        origin = `${proto}://${host}`;
      } catch {
        origin = 'http://localhost:3000';
      }
    }
    origin = origin.replace(/\/+$/, '');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Forgot password action failure:', err);
    return { success: false, error: err?.message || 'An unexpected connection error occurred.' };
  }
}

/**
 * Server action to reset user passwords from an active session link.
 */
export async function resetPasswordAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

  if (!password || !confirmPassword) {
    return { success: false, error: 'All password fields are required.' };
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' };
  }

  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { success: false, error: mapAuthError(error.message) };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Reset password action failure:', err);
    return { success: false, error: err?.message || 'An unexpected error occurred during password update.' };
  }
}
