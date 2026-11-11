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
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-950/20">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-2">
          <Heading level={2} className="text-2xl font-extrabold text-slate-100 tracking-tight">
            Welcome Back
          </Heading>
          <Text className="text-sm text-slate-400 mt-1">
            Sign in to access your dashboard, addresses, and wishlist.
          </Text>
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
                className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
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
                className="bg-slate-950/40 border-slate-800 text-slate-200 focus:border-primary"
                disabled={isPending}
              />
            </FormField>

            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-end text-xs">
              <Link
                href="/forgot-password"
                className="text-slate-450 hover:text-slate-250 transition-colors font-medium"
              >
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" className="w-full mt-2 font-semibold cursor-pointer" disabled={isPending}>
              {isPending ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center border-t border-slate-800/60 pt-4">
          <Text className="text-xs text-slate-450">
            Don't have an account?{' '}
            <Link
              href="/register"
              className="text-primary hover:text-primary-hover font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </Text>
        </CardFooter>
      </Card>
    </div>
  );
}
