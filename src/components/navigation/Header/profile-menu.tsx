'use client';

import * as React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { useSupabase } from '@/providers/SupabaseProvider';
import { cn } from '@/core/utils/cn';

export interface ProfileMenuProps {
  buttonType?: 'icon' | 'pill' | 'text';
  iconStyleClass?: string;
  className?: string;
}

/**
 * Client-bound Profile Menu connected to Supabase Auth state.
 * Adapts to transparent and solid navbar themes with high-contrast text.
 */
export function ProfileMenu({
  buttonType = 'icon',
  iconStyleClass = 'hover:bg-current/10',
  className = '',
}: ProfileMenuProps) {
  const { user, supabase } = useSupabase();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  React.useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  // 1. GUEST STATE (Not Signed In)
  if (!user) {
    if (buttonType === 'pill') {
      return (
        <Link
          href="/login"
          aria-label="Sign In to Account"
          className={cn(
            'px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-current bg-transparent border border-current/30 hover:border-current hover:bg-current/10 transition-colors cursor-pointer rounded-full inline-flex items-center gap-1.5',
            className
          )}
        >
          <Icon name="User" className="h-3.5 w-3.5" />
          <span>Sign In</span>
        </Link>
      );
    }

    if (buttonType === 'text') {
      return (
        <Link
          href="/login"
          aria-label="Sign In to Account"
          className={cn(
            'text-xs font-bold uppercase tracking-wider text-current hover:opacity-75 transition-opacity px-2 py-1',
            className
          )}
        >
          Sign In
        </Link>
      );
    }

    // Default: Clean Icon matching Search, Wishlist & Cart
    return (
      <Link
        href="/login"
        aria-label="Sign In to Account"
        title="Sign In"
        className={cn(
          'relative flex items-center justify-center h-9 w-9 text-current transition-colors cursor-pointer select-none',
          iconStyleClass,
          className
        )}
      >
        <Icon name="User" className="h-4 w-4" />
      </Link>
    );
  }

  // 2. AUTHENTICATED STATE
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle account dropdown list"
        className={cn(
          'relative flex items-center justify-center h-9 w-9 text-current transition-colors cursor-pointer select-none',
          iconStyleClass,
          className
        )}
      >
        <Icon name="User" className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-none border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-2 shadow-2xl z-[1050] text-neutral-900 dark:text-white animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 block">
              SIGNED IN AS
            </span>
            <p className="text-xs font-bold truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1 flex flex-col gap-0.5">
            <Link
              href="/account"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              My Profile
            </Link>
            <Link
              href="/account/orders"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Order History
            </Link>
            <Link
              href="/account/wishlist"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Saved Wishlist
            </Link>
            <Link
              href="/account/settings"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 text-xs font-semibold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              Account Settings
            </Link>
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1 mt-1">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
