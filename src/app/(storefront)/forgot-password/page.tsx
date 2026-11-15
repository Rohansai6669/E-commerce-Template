'use client';

import * as React from 'react';
import Link from 'next/link';
import { forgotPasswordAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Storefront Forgot Password / Recovery triggers page.
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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950/20">
      <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase font-mono block mb-1">
            LEXIDO • RECOVERY
          </span>
          <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
            Reset Password
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            We will email you a secure link to reset your account password.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {success ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-none text-center flex flex-col gap-2">
              <span className="text-sm font-bold uppercase tracking-wider">Check Your Email</span>
              <p className="text-xs text-emerald-600">
                A password reset link has been dispatched to your inbox. Click the link to define a new password.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="Email Address">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:border-neutral-950 rounded-none"
                  disabled={isPending}
                />
              </FormField>

              {error && (
                <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-none">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2 font-bold uppercase tracking-widest text-xs py-3 rounded-none bg-black hover:bg-neutral-800 text-white cursor-pointer" disabled={isPending}>
                {isPending ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-black dark:text-white hover:underline font-bold transition-colors uppercase tracking-wider"
            >
              Sign In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
