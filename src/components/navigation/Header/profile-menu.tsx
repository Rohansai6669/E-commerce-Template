'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { createClient } from '@/lib/supabase/client';
import { type User, type AuthChangeEvent, type Session } from '@supabase/supabase-js';

/**
 * Client-bound Profile Menu drop-down list connected to Supabase Auth state.
 */
export function ProfileMenu() {
  const supabase = createClient();
  const [user, setUser] = React.useState<User | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setUser(res.data.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  if (!user) {
    return (
      <Button variant="outline" size="sm" className="h-9 font-semibold px-4 cursor-pointer" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-9 w-9 border-border bg-background hover:bg-accent text-foreground cursor-pointer"
        aria-label="Toggle account dropdown list"
      >
        <Icon name="User" className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[1030]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1.5 z-[1040] animate-in fade-in slide-in-from-top-1">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-semibold cursor-pointer"
            >
              My Account
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted font-semibold cursor-pointer"
            >
              Order History
            </Link>
            <div className="h-px bg-border my-1" />
            <button
              onClick={handleSignOut}
              className="w-full text-left block px-4 py-2 text-sm text-destructive hover:bg-muted font-semibold cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
export default ProfileMenu;
