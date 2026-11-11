'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { resetPasswordAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Storefront Reset Password updates page.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

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
        }, 3000);
      } else {
        setError(res.error || 'Failed to update password.');
        toast.error(res.error || 'Failed to update password.');
      }
    });
  };

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12 bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Define New Password
          </Heading>
          <Text className="text-sm text-slate-400 mt-1">
            Choose a new secure password for your store account.
          </Text>
        </CardHeader>
        <CardContent className="pt-4">
          {success ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 rounded-lg text-center flex flex-col gap-3">
              <Text className="text-sm font-semibold">Password Reset Successful</Text>
              <Text className="text-xs text-slate-400 font-medium">
                Your password has been updated. You will be redirected to the login screen shortly...
              </Text>
              <Link href="/login" className="text-xs text-primary font-bold hover:underline mt-2">
                Click here to sign in immediately
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField label="New Password">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
                  disabled={isPending}
                />
              </FormField>

              <FormField label="Confirm New Password">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
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
                {isPending ? 'Updating Password...' : 'Save Password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-800/60 pt-4">
          <Link
            href="/login"
            className="text-xs text-slate-450 hover:text-slate-200 transition-colors font-medium"
          >
            Cancel and Sign In
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
