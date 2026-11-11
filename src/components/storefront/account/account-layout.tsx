'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/core/utils/cn';
import { ACCOUNT_NAVIGATION } from '@/core/account/navigation';
import { Icon } from '@/components/ui/icon';
import { Container } from '@/components/layout/container';
import { Heading, Text } from '@/components/ui/typography';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export interface AccountLayoutProps {
  children: React.ReactNode;
  userEmail?: string | null;
}

/**
 * Composite layout wrapping account subpages with responsive sidebar navigation links.
 */
export function AccountLayout({ children, userEmail }: AccountLayoutProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Failed to log out.');
    } else {
      toast.success('Logged out successfully.');
      window.location.href = '/';
    }
  };

  return (
    <Container className="py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 shrink-0 bg-card border border-border rounded-md shadow-xs p-4 flex flex-col gap-5">
          <div>
            <Heading level={2} className="text-sm font-bold truncate">
              Account
            </Heading>
            {userEmail && (
              <Text className="text-[11px] text-muted-foreground truncate mt-0.5 font-sans">
                {userEmail}
              </Text>
            )}
          </div>

          <nav aria-label="Account navigation" className="flex flex-col gap-1 w-full">
            {ACCOUNT_NAVIGATION.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer',
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon name={item.icon} className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 text-xs font-semibold rounded-md text-destructive hover:bg-destructive/5 transition-colors cursor-pointer text-left w-full mt-4 border-t border-border pt-4 rounded-t-none"
            >
              <Icon name="LogOut" className="h-4 w-4 shrink-0" />
              <span>Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Content body */}
        <main className="flex-1 w-full min-w-0">{children}</main>
      </div>
    </Container>
  );
}
export default AccountLayout;
