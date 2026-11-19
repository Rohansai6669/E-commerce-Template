'use client';

import * as React from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth-actions';
import { toast } from 'sonner';

/**
 * Storefront Forgot Password / Recovery triggers page.
 * Follows minimal luxury editorial aesthetic.
 */
export default function ForgotPasswordPage() {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (res.success) {
        setSuccess(true);
        toast.success('Password recovery email sent.');
      } else {
        setError(res.error || 'Failed to request reset link.');
        toast.error(res.error || 'Failed to request reset link.');
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
          RESET PASSWORD
        </h1>

        <p className="text-xs sm:text-[13px] text-neutral-500 dark:text-neutral-400 font-sans tracking-normal font-normal mb-8 leading-relaxed">
          We will email you a secure link to reset your account password.
        </p>

        {success ? (
          <div className="w-full p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center flex flex-col gap-2">
            <span className="text-xs font-bold font-mono tracking-widest uppercase text-neutral-900 dark:text-white">
              Check Your Email
            </span>
            <p className="text-xs text-neutral-500 leading-relaxed">
              A password reset link has been dispatched to your inbox. Click the link to define a new password.
            </p>
            <Link
              href="/login"
              className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-black dark:text-white underline hover:opacity-75"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            {error && (
              <div className="w-full p-3 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <div className="w-full">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                required
                disabled={isPending}
                className="w-full h-12 px-4 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm placeholder:text-neutral-400 focus:border-black dark:focus:border-white focus:outline-none rounded-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 bg-black hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-white font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
            >
              {isPending ? 'SENDING LINK...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
