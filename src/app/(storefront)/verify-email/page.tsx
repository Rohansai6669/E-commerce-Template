'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@/components/ui/icon';

/**
 * State-driven Email Verification Status Page.
 * Follows minimal luxury editorial aesthetic.
 */
export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center" />}>
      <VerifyEmailContent />
    </React.Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const status = searchParams.get('status') || 'pending'; // 'pending' | 'verified' | 'expired' | 'invalid'

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-16 sm:py-24 px-4 select-none">
      <div className="w-full max-w-[420px] sm:max-w-[460px] flex flex-col items-center text-center">
        {/* LEXIDO Wordmark Logo */}
        <Link
          href="/"
          className="font-display font-black uppercase text-2xl sm:text-[30px] tracking-[0.04em] text-foreground mb-10 sm:mb-12 hover:opacity-85 transition-opacity"
        >
          LEXIDO
        </Link>

        {status === 'pending' && (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-display uppercase tracking-tight text-foreground leading-none mb-4">
              CHECK YOUR INBOX
            </h1>
            <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal max-w-[340px] mb-8 leading-relaxed">
              We dispatched an authentication confirmation link to{' '}
              <strong className="text-foreground font-semibold">{email || 'your email'}</strong>. Please open the link to activate your profile.
            </p>
          </>
        )}

        {status === 'verified' && (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-display uppercase tracking-tight text-foreground leading-none mb-4">
              ACCOUNT VERIFIED
            </h1>
            <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal max-w-[340px] mb-8 leading-relaxed">
              Your profile is now verified and active. You can now access your orders, wishlist, and exclusive drops.
            </p>
            <Link
              href="/account"
              className="w-full h-12 bg-foreground text-background font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none hover:opacity-90"
            >
              PROCEED TO ACCOUNT
            </Link>
          </>
        )}

        {status === 'expired' && (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-display uppercase tracking-tight text-foreground leading-none mb-4">
              LINK EXPIRED
            </h1>
            <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal max-w-[340px] mb-8 leading-relaxed">
              The verification token has expired. Please sign in to request a fresh activation link.
            </p>
          </>
        )}

        {status === 'invalid' && (
          <>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-black font-display uppercase tracking-tight text-foreground leading-none mb-4">
              INVALID LINK
            </h1>
            <p className="text-xs sm:text-[13px] text-muted-foreground font-sans tracking-normal font-normal max-w-[340px] mb-8 leading-relaxed">
              We could not authenticate this verification code. Please check that you clicked the full URL or request a new code.
            </p>
          </>
        )}

        <div className="w-full flex flex-col gap-3 mt-4">
          <Link
            href="/login"
            className="w-full h-12 bg-background border border-border hover:border-foreground text-foreground font-bold text-[11px] sm:text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all cursor-pointer rounded-none"
          >
            RETURN TO SIGN IN
          </Link>
        </div>
      </div>
    </div>
  );
}
