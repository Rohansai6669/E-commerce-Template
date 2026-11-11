import * as React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/core/auth/session';
import { AccountLayout } from '@/components/storefront/account/account-layout';
import { connection } from 'next/server';

/**
 * Server Layout guarding the /account route.
 * Redirects unauthenticated users to the homepage or login.
 */
export default async function AccountServerLayout({ children }: { children: React.ReactNode }) {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    // If no active session, redirect immediately
    redirect('/');
  }

  return (
    <AccountLayout userEmail={user.email}>
      {children}
    </AccountLayout>
  );
}
