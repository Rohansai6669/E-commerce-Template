'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Icon } from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { type DashboardStats } from '@/core/account/dashboard.service';
import { type Profile } from '@/lib/db/schema/auth';
import { AddressPresenter } from '@/core/address/address.presenter';
import { CartPresenter } from '@/core/cart/cart.presenter';
import { linkGuestOrdersAction } from '@/app/actions/account';
import { toast } from 'sonner';

export interface DashboardContentProps {
  profile: Profile;
  stats: DashboardStats;
}

/**
 * Account dashboard landing screen content composed of stats cards.
 */
export function DashboardContent({ profile, stats }: DashboardContentProps) {
  const [isLinking, setIsLinking] = React.useState(false);

  const handleLinkOrders = async () => {
    setIsLinking(true);
    try {
      const result = await linkGuestOrdersAction();
      if (result.success) {
        if (result.count > 0) {
          toast.success(`Success! Linked ${result.count} previous guest orders to your account.`);
          window.location.reload();
        } else {
          toast.info('No unlinked guest orders found matching your email.');
        }
      } else {
        toast.error(result.error ?? 'Failed to link orders.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <Stack gap="6" className="w-full">
      {/* Welcome Banner */}
      <div>
        <Heading level={1} className="text-xl sm:text-2xl font-extrabold tracking-tight font-heading">
          Hello, {profile.fullName || 'Customer'}!
        </Heading>
        <Text className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Welcome to your customer dashboard. Manage settings, addresses, and track order histories.
        </Text>
      </div>

      {/* Guest order check banner */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <Icon name="Inbox" className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <Text className="text-xs font-bold text-foreground">Have prior guest purchases?</Text>
              <Text className="text-[11px] text-muted-foreground mt-0.5">
                Scan for order history records placed using the email {profile.email} to link them.
              </Text>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleLinkOrders}
            disabled={isLinking}
            className="text-xs font-bold shrink-0 cursor-pointer"
          >
            {isLinking ? 'Scanning...' : 'Link Guest Orders'}
          </Button>
        </CardContent>
      </Card>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Icon name="Package" className="h-5 w-5" />
            </div>
            <div>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Orders</Text>
              <Text className="text-base font-extrabold mt-0.5">{stats.totalOrders}</Text>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
              <Icon name="Banknote" className="h-5 w-5" />
            </div>
            <div>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Spent</Text>
              <Text className="text-base font-extrabold mt-0.5">
                {CartPresenter.formatCurrency(stats.totalSpent)}
              </Text>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 shrink-0">
              <Icon name="Calendar" className="h-5 w-5" />
            </div>
            <div>
              <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Profile Status</Text>
              <Text className="text-xs font-bold text-foreground mt-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block">
                Active Account
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Addresses & Orders Recap Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-start">
        {/* Default Shipping Address */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col justify-between">
          <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
            <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
              Primary Address
            </Heading>
            <Link
              href="/account/addresses"
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Manage
            </Link>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-center">
            {stats.defaultAddress ? (
              <div>
                <Text className="text-sm font-bold text-foreground">
                  {stats.defaultAddress.firstName} {stats.defaultAddress.lastName}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1.5 whitespace-pre-line leading-relaxed">
                  {AddressPresenter.formatAddressBlock(stats.defaultAddress)}
                </Text>
                <Text className="text-xs text-muted-foreground mt-2 font-mono">
                  {stats.defaultAddress.phone}
                </Text>
              </div>
            ) : (
              <div className="text-center py-6">
                <Icon name="MapPin" className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <Text className="text-xs text-muted-foreground">No address book details saved.</Text>
                <Button asChild size="sm" variant="outline" className="mt-3 text-xs font-bold cursor-pointer">
                  <Link href="/account/addresses">Add Address</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account settings overview */}
        <Card className="border-border bg-card shadow-sm h-full flex flex-col justify-between">
          <CardHeader className="p-4 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
            <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
              Profile Summary
            </Heading>
            <Link
              href="/account/settings"
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Edit Settings
            </Link>
          </CardHeader>
          <CardContent className="p-5 flex-1 flex flex-col justify-center gap-4">
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Full Name</span>
              <span className="text-foreground">{profile.fullName || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Username</span>
              <span className="text-foreground">@{profile.username || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Contact Email</span>
              <span className="text-foreground">{profile.email}</span>
            </div>
            <div className="flex justify-between items-center text-xs font-semibold">
              <span className="text-muted-foreground">Phone Number</span>
              <span className="text-foreground">{profile.phone || 'Not set'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Stack>
  );
}
export default DashboardContent;
