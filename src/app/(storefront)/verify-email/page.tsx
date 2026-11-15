'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

/**
 * State-driven Email Verification Status Page.
 */
export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const status = searchParams.get('status') || 'pending'; // 'pending' | 'verified' | 'expired' | 'invalid'

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950/20">
      <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2 flex flex-col items-center">
          {status === 'pending' && (
            <>
              <div className="h-12 w-12 rounded-full bg-neutral-100 text-neutral-900 flex items-center justify-center mb-4">
                <Icon name="Mail" className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
                Check Your Inbox
              </h1>
            </>
          )}

          {status === 'verified' && (
            <>
              <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <Icon name="CheckCircle" className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
                Account Verified!
              </h1>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <Icon name="AlertTriangle" className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
                Verification Expired
              </h1>
            </>
          )}

          {status === 'invalid' && (
            <>
              <div className="h-12 w-12 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mb-4">
                <Icon name="XCircle" className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
                Invalid Verification Link
              </h1>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-4 text-center">
          {status === 'pending' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                We have sent an activation link to <span className="font-semibold text-neutral-950">{email || 'your email'}</span>.
              </p>
              <p className="text-xs text-neutral-400 leading-normal">
                Please click the link inside that message to activate and verify your customer profile.
              </p>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                Your email address has been successfully verified. You can now access your cart and account details.
              </p>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                This verification link has expired. Please sign in to request a fresh confirmation link.
              </p>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-600 leading-relaxed">
                The verification token is invalid or has already been used.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <Link
            href={status === 'verified' ? '/account' : '/login'}
            className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-none text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            {status === 'verified' ? 'Go to My Account' : 'Back to Login'}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
