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
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12 bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Reset Password
          </Heading>
          <Text className="text-sm text-slate-400 mt-1">
            We will email you a secure link to reset your account password.
          </Text>
        </CardHeader>
        <CardContent className="pt-4">
          {success ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-lg text-center flex flex-col gap-3">
              <Text className="text-sm font-semibold">Check Your Email</Text>
              <Text className="text-xs text-slate-400">
                A password reset link has been dispatched to your inbox. Click the link to define a new password.
              </Text>
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
                  className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
                  disabled={isPending}
                />
              </FormField>

              {error && (
                <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-lg">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full mt-2 font-semibold cursor-pointer" disabled={isPending}>
                {isPending ? 'Sending Link...' : 'Send Reset Link'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/60 pt-4">
          <Text className="text-xs text-slate-450">
            Remember your password?{' '}
            <Link
              href="/login"
              className="text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              Sign In
            </Link>
          </Text>
        </CardFooter>
      </Card>
    </div>
  );
}
