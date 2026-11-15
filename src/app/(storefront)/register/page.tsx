'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerAction } from '@/app/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { toast } from 'sonner';

/**
 * Clean glassmorphic Storefront Register Page.
 */
export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [isPending, startTransition] = React.useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    startTransition(async () => {
      const res = await registerAction(formData);
      if (res.success) {
        toast.success('Registration successful! Please check your email inbox.');
        const email = formData.get('email') as string;
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      } else {
        setError(res.error || 'Registration failed.');
        toast.error(res.error || 'Registration failed.');
      }
    });
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-neutral-50/50 dark:bg-neutral-950/20">
      <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-xl rounded-none">
        <CardHeader className="text-center pb-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-neutral-400 uppercase font-mono block mb-1">
            LEXIDO • ACCOUNT
          </span>
          <h1 className="text-2xl font-black font-heading uppercase text-neutral-950 dark:text-white tracking-tight">
            Create Account
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Sign up to track purchases, save products, and configure addresses.
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormField label="Full Name">
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                required
                className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:border-neutral-950 rounded-none"
                disabled={isPending}
              />
            </FormField>

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

            <FormField label="Password">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                required
                className="bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:border-neutral-950 rounded-none"
                disabled={isPending}
              />
            </FormField>

            <FormField label="Confirm Password">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat password"
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
              {isPending ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <p className="text-xs text-neutral-500">
            Already have an account?{' '}
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
