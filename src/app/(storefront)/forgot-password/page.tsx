'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { forgotPasswordAction } from '@/app/actions/auth-actions';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ForgotPasswordContent() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [email, setEmail] = React.useState('');
  const [submittedEmail, setSubmittedEmail] = React.useState('');
  const [emailError, setEmailError] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(urlError ? decodeURIComponent(urlError) : null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setEmailError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setEmailError('Please enter your email address.');
      return;
    }

    if (!EMAIL_REGEX.test(cleanEmail)) {
      setEmailError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    const formData = new FormData();
    formData.append('email', cleanEmail);

    startTransition(async () => {
      const res = await forgotPasswordAction(formData);
      if (res.success) {
        setSubmittedEmail(cleanEmail);
        setSuccess(true);
        toast.success('Password recovery email sent.');
      } else {
        setServerError(res.error || 'Failed to request reset link.');
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
          RESET PASSWORD
        </h1>

        <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal mb-8 leading-relaxed">
          Enter your account email below. We will send you a secure link to reset your password.
        </p>

        {/* Server Error Alert */}
        {serverError && (
          <div className="w-full p-3.5 mb-6 text-xs bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        {success ? (
          <div className="w-full p-6 sm:p-8 bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5 text-foreground">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-sm font-bold font-display uppercase tracking-wider">
                Check Your Inbox
              </span>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-sans">
              We have dispatched a secure password reset link to{' '}
              <strong className="text-foreground font-mono">{submittedEmail}</strong>.
              Click the link in the email to define a new password.
            </p>

            <div className="border-t border-border pt-4 flex flex-col gap-2.5">
              <span className="text-[11px] text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or try requesting again after a moment.
              </span>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                    setServerError(null);
                  }}
                  className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground underline cursor-pointer"
                >
                  Try Another Email
                </button>

                <Link
                  href="/login"
                  className="text-xs font-bold font-mono uppercase tracking-widest text-foreground underline hover:opacity-75"
                >
                  Return to Sign In →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
            <div className="w-full flex flex-col">
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                  if (serverError) setServerError(null);
                }}
                placeholder="Email address"
                required
                disabled={isPending}
                className={`w-full h-12 px-4 bg-background border ${
                  emailError
                    ? 'border-rose-500'
                    : 'border-border focus:border-foreground'
                } text-foreground text-sm placeholder:text-muted-foreground focus:outline-none rounded-none transition-colors`}
              />
              {emailError && (
                <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                  <span>{emailError}</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 mt-2 bg-foreground text-background hover:opacity-90 font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none disabled:opacity-50"
            >
              {isPending ? 'DISPATCHING RESET LINK...' : 'SEND RESET LINK'}
            </button>

            <div className="flex justify-center mt-4">
              <Link
                href="/login"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Remember your password? <span className="underline font-medium text-foreground">Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <ForgotPasswordContent />
    </React.Suspense>
  );
}
