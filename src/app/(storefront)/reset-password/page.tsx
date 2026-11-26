'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/app/actions/auth-actions';
import { createClient } from '@/lib/supabase/client';
import { type AuthChangeEvent, type Session } from '@supabase/supabase-js';
import { Eye, EyeOff, Check, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordContent() {
  const router = useRouter();

  const [checkingSession, setCheckingSession] = React.useState(true);
  const [hasValidSession, setHasValidSession] = React.useState(false);

  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const [fieldErrors, setFieldErrors] = React.useState<{ password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Verify that an active session or recovery token exists
  React.useEffect(() => {
    const supabase = createClient();
    let subscription: { unsubscribe: () => void } | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    async function checkAuthSession() {
      try {
        // 1. Check if URL hash contains recovery access token
        if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
          setHasValidSession(true);
          setCheckingSession(false);
          return;
        }

        // 2. Check active Supabase session (established via /auth/callback)
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setHasValidSession(true);
          setCheckingSession(false);
          return;
        }

        // 3. Listen for asynchronous auth event (PASSWORD_RECOVERY)
        const res = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
          if (event === 'PASSWORD_RECOVERY' || session) {
            setHasValidSession(true);
            setCheckingSession(false);
          }
        });
        subscription = res.data.subscription;

        // 4. Grace period timeout before flagging expired link
        timeoutId = setTimeout(() => {
          setCheckingSession(false);
        }, 1200);
      } catch (err) {
        console.error('Session check error:', err);
        setCheckingSession(false);
      }
    }

    checkAuthSession();

    return () => {
      subscription?.unsubscribe();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const validateForm = (): boolean => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'Please enter a new password.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    const formData = new FormData();
    formData.append('password', password);
    formData.append('confirmPassword', confirmPassword);

    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      if (res.success) {
        setSuccess(true);
        toast.success('Your password has been successfully updated.');
        setTimeout(() => {
          router.push('/login');
        }, 2200);
      } else {
        setServerError(res.error || 'Failed to update password.');
        toast.error(res.error || 'Failed to update password.');
      }
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-16 sm:py-24 px-4 select-none">
      <div className="w-full max-w-[420px] sm:max-w-[460px] flex flex-col items-start">
        {/* LEXIDO Wordmark Logo */}
        <Link
          href="/"
          className="self-center font-display font-black uppercase text-2xl sm:text-[30px] tracking-[0.04em] text-foreground mb-10 sm:mb-12 hover:opacity-85 transition-opacity"
        >
          LEXIDO
        </Link>

        {/* Back Link */}
        <Link
          href="/login"
          className="text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground cursor-pointer inline-flex items-center gap-1.5 transition-colors mb-6"
        >
          ← BACK TO SIGN IN
        </Link>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-display uppercase tracking-tight text-foreground leading-none mb-3">
          NEW PASSWORD
        </h1>

        <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal mb-8 leading-relaxed">
          Please define a strong, secure password of at least 8 characters.
        </p>

        {/* Loading Verification State */}
        {checkingSession && (
          <div className="w-full p-8 border border-border bg-background flex flex-col items-center justify-center gap-3">
            <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-mono tracking-widest text-muted-foreground uppercase">
              Verifying Recovery Link...
            </span>
          </div>
        )}

        {/* Expired / Invalid Session State */}
        {!checkingSession && !hasValidSession && (
          <div className="w-full p-6 sm:p-8 bg-background border border-border flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-foreground">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-sm font-bold font-display uppercase tracking-wider">
                Link Expired or Invalid
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              This password reset link is invalid or has expired. For your security, reset links can only be used once and expire shortly after being issued.
            </p>

            <div className="pt-2 flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="w-full h-12 bg-foreground text-background hover:opacity-90 font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none"
              >
                REQUEST NEW RESET LINK
              </Link>

              <Link
                href="/login"
                className="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground underline pt-1"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}

        {/* Active Session: Reset Form */}
        {!checkingSession && hasValidSession && (
          <>
            {success ? (
              <div className="w-full p-6 sm:p-8 bg-background border border-border flex flex-col gap-4 animate-in fade-in duration-200">
                <div className="flex items-center gap-2.5 text-foreground">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-sm font-bold font-display uppercase tracking-wider">
                    Password Updated
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Your account password has been securely updated. You will now be redirected to sign in with your new credentials.
                </p>

                <div className="pt-2">
                  <Link
                    href="/login"
                    className="w-full h-12 bg-foreground text-background hover:opacity-90 font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none"
                  >
                    GO TO SIGN IN NOW →
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
                {serverError && (
                  <div className="w-full p-3.5 mb-2 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{serverError}</span>
                  </div>
                )}

                {/* New Password */}
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
                      placeholder="New password (8+ characters)"
                      required
                      disabled={isPending}
                      className={`w-full h-12 pl-4 pr-16 bg-background border ${
                        fieldErrors.password
                          ? 'border-rose-500'
                          : 'border-border focus:border-foreground'
                      } text-foreground text-sm placeholder:text-muted-foreground focus:outline-none rounded-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                      className="absolute right-0 top-0 h-12 px-3 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none text-[10px] sm:text-[11px] font-mono tracking-wider z-10"
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
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                      {fieldErrors.password}
                    </p>
                  )}

                  {!fieldErrors.password && password && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      {password.length >= 8 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" /> 8+ characters requirement met
                        </span>
                      ) : (
                        <span>Needs at least 8 characters</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="w-full flex flex-col">
                  <div className="relative w-full">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                        }
                      }}
                      placeholder="Confirm new password"
                      required
                      disabled={isPending}
                      className={`w-full h-12 pl-4 pr-16 bg-background border ${
                        fieldErrors.confirmPassword
                          ? 'border-rose-500'
                          : 'border-border focus:border-foreground'
                      } text-foreground text-sm placeholder:text-muted-foreground focus:outline-none rounded-none transition-colors`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      tabIndex={0}
                      className="absolute right-0 top-0 h-12 px-3 flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none text-[10px] sm:text-[11px] font-mono tracking-wider z-10"
                    >
                      {showConfirmPassword ? (
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

                  {fieldErrors.confirmPassword && (
                    <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}

                  {!fieldErrors.confirmPassword && confirmPassword && (
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1">
                      {password === confirmPassword ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                          <Check className="w-3.5 h-3.5" /> Passwords match
                        </span>
                      ) : (
                        <span className="text-rose-500">Passwords do not match yet</span>
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-12 mt-2 bg-foreground text-background hover:opacity-90 font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
                >
                  {isPending ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <ResetPasswordContent />
    </React.Suspense>
  );
}
