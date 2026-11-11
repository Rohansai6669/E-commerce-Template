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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2 flex flex-col items-center">
          {status === 'pending' && (
            <>
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon name="Mail" className="h-6 w-6" />
              </div>
              <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Check Your Inbox
              </Heading>
            </>
          )}

          {status === 'verified' && (
            <>
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-450 flex items-center justify-center mb-4">
                <Icon name="CheckCircle" className="h-6 w-6" />
              </div>
              <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Account Verified!
              </Heading>
            </>
          )}

          {status === 'expired' && (
            <>
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-450 flex items-center justify-center mb-4">
                <Icon name="AlertTriangle" className="h-6 w-6" />
              </div>
              <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Verification Expired
              </Heading>
            </>
          )}

          {status === 'invalid' && (
            <>
              <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-450 flex items-center justify-center mb-4">
                <Icon name="XCircle" className="h-6 w-6" />
              </div>
              <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Invalid Verification Link
              </Heading>
            </>
          )}
        </CardHeader>
        <CardContent className="pt-4 text-center">
          {status === 'pending' && (
            <div className="flex flex-col gap-3">
              <Text className="text-sm text-slate-355 leading-relaxed">
                We have sent an activation link to <span className="font-semibold text-slate-100">{email || 'your email'}</span>.
              </Text>
              <Text className="text-xs text-slate-500 leading-normal">
                Please click the link inside that message to activate and verify your customer profile.
              </Text>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col gap-3">
              <Text className="text-sm text-slate-355 leading-relaxed">
                Your email address has been successfully verified. You can now access your cart and account details.
              </Text>
            </div>
          )}

          {status === 'expired' && (
            <div className="flex flex-col gap-3">
              <Text className="text-sm text-slate-355 leading-relaxed">
                This verification link has expired. Please sign in to request a fresh confirmation link.
              </Text>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col gap-3">
              <Text className="text-sm text-slate-355 leading-relaxed">
                The verification token is invalid or has already been used.
              </Text>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/60 pt-4">
          <Link
            href={status === 'verified' ? '/account' : '/login'}
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-750 transition-colors rounded-lg text-slate-200 text-xs font-semibold cursor-pointer"
          >
            {status === 'verified' ? 'Go to My Account' : 'Back to Login'}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
