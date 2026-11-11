import { env } from '../validation/env';

export const authConfig = {
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  },
  cookieName: 'sb-auth-token',
  sessionLifetime: 60 * 60 * 24 * 7, // 7 days in seconds
  paths: {
    login: '/login',
    register: '/register',
    callback: '/auth/callback',
    defaultRedirect: '/dashboard',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
  },
} as const;
