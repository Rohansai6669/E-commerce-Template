'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Clean glassmorphic Storefront Sign-in Page.
 */
export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await loginAction(formData);
      if (res.success) {
        toast.success('Signed in successfully.');
        router.push('/account');
        router.refresh();
      } else {
        setError(res.error || 'Authentication failed.');
        toast.error(res.error || 'Authentication failed.');
      }
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950/20">
      <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase font-mono block mb-1">
            LEXIDO • ACCOUNT
          </span>
          <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign in to access your dashboard, addresses, and wishlist.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Email Address" error={error ? undefined : undefined}>
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

            <FormField label="Password">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
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

            <div className="flex justify-end text-xs">
              <Link
                href="/forgot-password"
                className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2 font-bold uppercase tracking-widest text-xs py-3 rounded-none bg-black hover:bg-neutral-800 text-white cursor-pointer" disabled={isPending}>
              {isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-black dark:text-white hover:underline font-bold transition-colors uppercase tracking-wider"
            >
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
