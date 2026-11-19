'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/app/actions/auth-actions';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Storefront Reset Password updates page.
 * Follows minimal luxury editorial aesthetic with show/hide password toggle.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      if (res.success) {
        setSuccess(true);
        toast.success('Your password has been successfully updated.');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(res.error || 'Failed to update password.');
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
          className="self-center font-clash font-black uppercase text-2xl sm:text-[30px] tracking-[0.04em] text-neutral-950 dark:text-white mb-10 sm:mb-12 hover:opacity-85 transition-opacity"
        >
          LEXIDO
        </Link>

        {/* Back Link */}
        <Link
          href="/login"
          className="text-[11px] font-mono font-medium tracking-[0.2em] uppercase text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer inline-flex items-center gap-1.5 transition-colors mb-6"
        >
          ← BACK
        </Link>

        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-clash uppercase tracking-tight text-neutral-950 dark:text-white leading-none mb-3">
          NEW PASSWORD
        </h1>

        <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-sans tracking-normal font-normal mb-8 leading-relaxed">
          Please choose a strong, secure password of at least 8 characters.
        </p>

        {success ? (
          <div className="w-full p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col gap-2">
            <span className="text-xs font-bold font-mono tracking-widest uppercase text-neutral-900 dark:text-white">
              Password Updated
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              Your password has been securely reset. Redirecting to sign in...
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-black dark:text-white underline hover:opacity-75"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {error && (
              <div className="w-full p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="w-full relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="New password (8+ characters)"
                required
                disabled={isPending}
                className="w-full h-12 pl-4 pr-14 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none rounded-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-12 px-3 flex items-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="w-full relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm new password"
                required
                disabled={isPending}
                className="w-full h-12 pl-4 pr-14 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none rounded-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-0 h-12 px-3 flex items-center text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer select-none"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
            >
              {isPending ? 'UPDATING PASSWORD...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
