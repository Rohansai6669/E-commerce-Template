'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginAction, registerAction } from '@/app/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AuthViewProps {
  initialMode?: 'options' | 'email';
  initialTab?: 'login' | 'register';
}

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Production-ready luxury storefront Auth View.
 * Features:
 * - Pixel-perfect luxury styling matching reference images
 * - Full Supabase OAuth integration (Google & Apple)
 * - Password Show/Hide toggle with keyboard accessibility
 * - Production-level validation checks (client & server)
 * - Real-time validation feedback and error sanitization
 */
export function AuthView({
  initialMode = 'options',
  initialTab = 'login',
}: AuthViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || searchParams.get('next') || '/account';

  const [mode, setMode] = React.useState<'options' | 'email'>(initialMode);
  const [tab, setTab] = React.useState<'login' | 'register'>(initialTab);

  // Form field states
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  // Validation & status states
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [isOAuthPending, setIsOAuthPending] = React.useState<'google' | 'apple' | null>(null);

  // Sync state if initial props change
  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  React.useEffect(() => {
    setTab(initialTab);
    setFieldErrors({});
    setServerError(null);
  }, [initialTab]);

  // Check URL error parameter (e.g. from callback failure)
  React.useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      if (errorParam === 'auth-callback-failed') {
        setServerError('Authentication exchange failed. Please try signing in again.');
      } else {
        setServerError(decodeURIComponent(errorParam));
      }
    }
  }, [searchParams]);

  // Client-side Validation Checks
  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    // 1. Validate Full Name (Register mode)
    if (tab === 'register') {
      const trimmedName = fullName.trim();
      if (!trimmedName) {
        errors.fullName = 'Please enter your full name.';
      } else if (trimmedName.length < 2) {
        errors.fullName = 'Full name must be at least 2 characters.';
      }
    }

    // 2. Validate Email
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Please enter your email address.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    // 3. Validate Password
    if (!password) {
      errors.password = 'Please enter your password.';
    } else if (tab === 'register' && password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Supabase Google & Apple OAuth Handler
  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    try {
      setIsOAuthPending(provider);
      setServerError(null);

      const supabase = createClient();
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      
      // Ensure redirect URL is safe
      const safeRedirect = redirectUrl.startsWith('/') && !redirectUrl.startsWith('//')
        ? redirectUrl
        : '/account';
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(safeRedirect)}`;

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (oauthError) {
        console.error(`Supabase OAuth ${provider} error:`, oauthError);
        setServerError(oauthError.message || `Failed to initialize ${provider} sign-in.`);
        toast.error(oauthError.message || `Failed to initialize ${provider} sign-in.`);
        setIsOAuthPending(null);
      }
      // Note: If successful, browser will redirect to provider's login screen
    } catch (err: any) {
      console.error(`Unexpected ${provider} OAuth error:`, err);
      const msg = err?.message || `Unable to reach authentication server for ${provider}.`;
      setServerError(msg);
      toast.error(msg);
      setIsOAuthPending(null);
    }
  };

  // Form Submit Handler (Email Sign In / Create Account)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    // Run client-side production checks
    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append('email', email.trim().toLowerCase());
    formData.append('password', password);
    if (tab === 'register') {
      formData.append('fullName', fullName.trim());
    }

    startTransition(async () => {
      if (tab === 'login') {
        const res = await loginAction(formData);
        if (res.success) {
          toast.success('Signed in successfully.');
          router.push(redirectUrl);
          router.refresh();
        } else {
          setServerError(res.error || 'Authentication failed. Please check your credentials.');
          toast.error(res.error || 'Authentication failed.');
        }
      } else {
        const res = await registerAction(formData);
        if (res.success) {
          toast.success('Account created! Please check your email to activate.');
          router.push(`/verify-email?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        } else {
          setServerError(res.error || 'Failed to create account.');
          toast.error(res.error || 'Failed to create account.');
        }
      }
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-16 sm:py-24 px-4 select-none">
      <div className="w-full max-w-[420px] sm:max-w-[460px] flex flex-col">
        {/* LEXIDO Wordmark Logo */}
        <Link
          href="/"
          className="text-center font-clash font-black uppercase text-2xl sm:text-[30px] tracking-[0.04em] text-neutral-950 dark:text-white mb-10 sm:mb-12 hover:opacity-85 transition-opacity"
        >
          LEXIDO
        </Link>

        {mode === 'options' ? (
          /* ======================================================== */
          /* 1. ENTER LEXIDO LANDING VIEW (Options)                   */
          /* ======================================================== */
          <div className="flex flex-col items-center text-center animate-in fade-in duration-200">
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-clash uppercase tracking-tight text-neutral-950 dark:text-white leading-none mb-3">
              ENTER LEXIDO
            </h1>

            <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-sans tracking-normal font-normal max-w-[320px] mb-8 sm:mb-10 leading-relaxed">
              Sign in to access orders, wishlist and exclusive drops.
            </p>

            {serverError && (
              <div className="w-full p-3.5 mb-6 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-left flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              {/* Google Button - Supabase OAuth */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn('google')}
                disabled={isOAuthPending !== null || isPending}
                className="w-full h-12 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                {/* Official Multi-Color Google G SVG */}
                <svg className="w-4 h-4 mr-2.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>
                  {isOAuthPending === 'google' ? 'CONNECTING TO GOOGLE...' : 'CONTINUE WITH GOOGLE'}
                </span>
              </button>

              {/* Apple Button - Supabase OAuth */}
              <button
                type="button"
                onClick={() => handleOAuthSignIn('apple')}
                disabled={isOAuthPending !== null || isPending}
                className="w-full h-12 bg-black hover:bg-neutral-800 text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                {/* Apple SVG */}
                <svg className="w-4 h-4 mr-2.5 fill-current shrink-0" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.71-11.65-14.01-6.73-10.43-12.06-22.18-15.98-35.25-3.92-13.07-5.88-25.21-5.88-36.42 0-14.46 3.48-26.41 10.44-35.85 6.96-9.44 15.66-14.28 26.1-14.52 4.9.11 10.33 1.3 16.29 3.59 5.96 2.29 9.89 3.5 11.78 3.63 2.07-.13 6.09-1.39 12.06-3.79 5.97-2.4 11.2-3.5 15.69-3.32 12.63.76 22.84 5.44 30.64 14.03-10.98 6.64-16.37 15.77-16.16 27.4.22 9.14 3.81 16.86 10.78 23.17 6.96 6.31 15.22 9.89 24.79 10.74-2.17 6.42-4.89 13.06-8.15 19.92zM119.22 31.84c0-7.39 2.61-14.14 7.83-20.24 5.22-6.1 11.53-9.8 18.93-11.11.22 1.09.33 2.18.33 3.27 0 7.39-2.72 14.25-8.15 20.57-5.44 6.31-11.96 10.01-19.57 11.1-.22-1.09-.33-2.18-.33-3.27z" />
                </svg>
                <span>
                  {isOAuthPending === 'apple' ? 'CONNECTING TO APPLE...' : 'CONTINUE WITH APPLE'}
                </span>
              </button>

              {/* Minimal Divider */}
              <div className="relative flex py-2 items-center w-full my-2">
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
                <span className="flex-shrink mx-4 text-[10px] font-mono tracking-[0.25em] text-neutral-400 uppercase">
                  OR
                </span>
                <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
              </div>

              {/* Continue With Email Button */}
              <button
                type="button"
                onClick={() => {
                  setMode('email');
                  setServerError(null);
                }}
                className="w-full h-12 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 hover:border-black dark:hover:border-white text-neutral-900 dark:text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none"
              >
                CONTINUE WITH EMAIL
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* 2. SIGN IN & CREATE ACCOUNT EMAIL VIEW                   */
          /* ======================================================== */
          <div className="flex flex-col items-start w-full animate-in fade-in duration-200">
            {/* Back to Options Link */}
            <button
              type="button"
              onClick={() => {
                setMode('options');
                setServerError(null);
                setFieldErrors({});
              }}
              className="text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors mb-6"
            >
              ← BACK
            </button>

            {/* Page Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-clash uppercase tracking-tight text-neutral-950 dark:text-white leading-none mb-6">
              {tab === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
            </h1>

            {/* Tabs: Sign In | Create Account */}
            <div className="flex items-center gap-6 mb-8 border-b border-transparent">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setServerError(null);
                  setFieldErrors({});
                }}
                className={`text-xs sm:text-[13px] tracking-normal transition-all pb-1 cursor-pointer ${
                  tab === 'login'
                    ? 'font-medium text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'font-normal text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white border-b-2 border-transparent'
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setServerError(null);
                  setFieldErrors({});
                }}
                className={`text-xs sm:text-[13px] tracking-normal transition-all pb-1 cursor-pointer ${
                  tab === 'register'
                    ? 'font-medium text-black dark:text-white border-b-2 border-black dark:border-white'
                    : 'font-normal text-neutral-400 dark:text-neutral-500 hover:text-black dark:hover:text-white border-b-2 border-transparent'
                }`}
              >
                Create Account
              </button>
            </div>

            {serverError && (
              <div className="w-full p-3.5 mb-5 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{serverError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
              {/* Full Name field (Register only) */}
              {tab === 'register' && (
                <div className="w-full flex flex-col">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (fieldErrors.fullName) {
                        setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    placeholder="Full name"
                    disabled={isPending}
                    className={`w-full h-12 px-4 bg-white dark:bg-neutral-950 border ${
                      fieldErrors.fullName
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
                    } text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none rounded-none transition-colors`}
                  />
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Email field */}
              <div className="w-full flex flex-col">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }
                  }}
                  placeholder="Email"
                  disabled={isPending}
                  className={`w-full h-12 px-4 bg-white dark:bg-neutral-950 border ${
                    fieldErrors.email
                      ? 'border-rose-500 dark:border-rose-500'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
                  } text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none rounded-none transition-colors`}
                />
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Password field with Show / Hide Toggle */}
              <div className="w-full flex flex-col">
                <div className="relative w-full">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    placeholder="Password"
                    disabled={isPending}
                    className={`w-full h-12 pl-4 pr-16 bg-white dark:bg-neutral-950 border ${
                      fieldErrors.password
                        ? 'border-rose-500 dark:border-rose-500'
                        : 'border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white'
                    } text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:outline-none rounded-none transition-colors`}
                  />

                  {/* Show / Hide Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={0}
                    className="absolute right-0 top-0 h-12 px-3 flex items-center gap-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none text-[10px] sm:text-[11px] font-mono tracking-wider"
                  >
                    {showPassword ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span className="hidden sm:inline">HIDE</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">SHOW</span>
                      </>
                    )}
                  </button>
                </div>

                {fieldErrors.password && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                    <span>{fieldErrors.password}</span>
                  </p>
                )}

                {/* Password helper in Register tab */}
                {tab === 'register' && !fieldErrors.password && (
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1">
                    {password.length >= 8 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <Check className="w-3.5 h-3.5" /> 8+ characters requirement met
                      </span>
                    ) : (
                      <span>Must be at least 8 characters long</span>
                    )}
                  </p>
                )}
              </div>

              {/* Forgot Password Link (Sign In only) */}
              {tab === 'login' && (
                <div className="flex justify-end -mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="w-full h-12 mt-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
              >
                {isPending
                  ? tab === 'login'
                    ? 'SIGNING IN...'
                    : 'CREATING ACCOUNT...'
                  : tab === 'login'
                  ? 'SIGN IN'
                  : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
