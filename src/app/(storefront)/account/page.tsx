import * as React from 'react';
import { getCurrentProfile } from '@/core/auth/session';
import { dashboardService } from '@/core/account/dashboard.service';
import { DashboardContent } from '@/components/storefront/account/dashboard-content';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';

export const metadata = {
  title: 'My Account Dashboard | Storefront',
  description: 'Manage your profile settings, saved shipping addresses, and review order histories.',
};

/**
 * Server Component serving the /account dashboard index page.
 */
export default async function AccountDashboardPage() {
  await connection();
  const profile = await getCurrentProfile();
  
  if (!profile) {
    redirect('/');
  }

  const stats = await dashboardService.getDashboardStats(profile.id);

  return <DashboardContent profile={profile} stats={stats} />;
}
