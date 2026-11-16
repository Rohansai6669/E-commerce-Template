import * as React from 'react';
import { getCurrentProfile } from '@/core/auth/session';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { Container } from '@/components/layout/container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Heading, Text } from '@/components/ui/typography';
import { Bell, CheckCircle2, PackageCheck, Tag, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'My Notifications | Lexido',
  description: 'View order delivery updates, status changes, and account alerts.',
};

export default async function AccountNotificationsPage() {
  await connection();
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect('/login');
  }

  // Pre-formatted customer activity alerts
  const sampleNotifications = [
    {
      id: 'notif-1',
      title: 'Order Status Notification',
      message: 'Orders placed on Lexido are automatically tracked in real-time. Check tracking anytime.',
      time: 'Just now',
      icon: PackageCheck,
      badge: 'Order Tracking',
      link: '/account/orders',
    },
    {
      id: 'notif-2',
      title: 'Security Notice: Two-Factor / 256-Bit Protection Active',
      message: 'Your account is protected with authenticated session cookies and SSL gateway protection.',
      time: 'Active',
      icon: ShieldAlert,
      badge: 'Security',
      link: '/account/settings',
    },
    {
      id: 'notif-3',
      title: 'Exclusive Member Offers',
      message: 'Use code "LEXIDO10" at checkout for 10% off your purchase.',
      time: 'Ongoing',
      icon: Tag,
      badge: 'Promotion',
      link: '/products',
    },
  ];

  return (
    <Container className="py-10 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Heading level={1} className="text-2xl font-extrabold tracking-tight font-heading text-foreground">
            Notifications &amp; Activity
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5">
            Stay updated with your deliveries, announcements, and exclusive benefits.
          </Text>
        </div>
        <Button asChild variant="outline" size="sm" className="font-bold text-xs uppercase cursor-pointer">
          <Link href="/account">Back to Account</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {sampleNotifications.map((n) => {
          const IconComp = n.icon;
          return (
            <Card key={n.id} className="border-border bg-card shadow-xs hover:border-foreground/30 transition">
              <CardContent className="p-4 sm:p-5 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-none bg-muted text-foreground flex items-center justify-center shrink-0">
                  <IconComp className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground font-heading">
                      {n.title}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {n.message}
                  </p>
                  <div className="pt-1">
                    <Link
                      href={n.link}
                      className="text-[11px] font-bold text-primary hover:underline uppercase tracking-wider inline-flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}

