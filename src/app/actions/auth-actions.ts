'use server';

import { createClient } from '@/lib/supabase/server';
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema/auth';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Server action to sign in customer using email and password.
 */
export async function loginAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/account');
    return { success: true };
  } catch (err) {
    console.error('Login action failure:', err);
    return { success: false, error: 'An unexpected authentication error occurred.' };
  }
}

/**
 * Server action to register a new customer profile.
 */
export async function registerAction(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const fullName = formData.get('fullName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!fullName || !email || !password) {
    return { success: false, error: 'All fields are required.' };
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
      return { success: false, error: authError.message };
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
  } catch (err) {
    console.error('Registration action failure:', err);
    return { success: false, error: 'An unexpected database error occurred during registration.' };
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
  const email = formData.get('email') as string;
  if (!email) {
    return { success: false, error: 'Email address is required.' };
  }

  try {
    const supabase = await createClient();
    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Forgot password action failure:', err);
    return { success: false, error: 'An unexpected connection error occurred.' };
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Reset password action failure:', err);
    return { success: false, error: 'An unexpected error occurred during password update.' };
  }
}
