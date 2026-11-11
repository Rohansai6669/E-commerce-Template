import * as React from 'react';
import { getCurrentProfile } from '@/core/auth/session';
import { ProfileForm } from '@/components/storefront/account/profile-form';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

export const metadata = {
  title: 'My Profile Settings | Storefront',
  description: 'Manage your contact details, username, avatar photo and identifiers.',
};

/**
 * Server Component serving the /account/settings edit form page.
 */
export default async function AccountSettingsPage() {
  await connection();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/');
  }

  return <ProfileForm profile={profile} />;
}
