'use client';

import * as React from 'react';
import Link from 'next/link';
import { Logo } from './logo';
import { MobileNav } from './mobile-nav';
import { Search } from './search';
import { CartButton } from './cart-button';
import { ProfileMenu } from './profile-menu';
import { Container } from '@/components/layout/container';
import { MegamenuPanel } from './megamenu-panel';
import { X, Heart, ChevronDown } from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  hasMega: boolean;
  highlight?: boolean;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'MEN', href: '/products?category=men', hasMega: true },
  { label: 'WOMEN', href: '/products?category=women', hasMega: true },
  { label: 'COLLECTIONS', href: '/collections', hasMega: true },
  { label: 'SHOP ALL', href: '/products', hasMega: false },
  { label: 'FESTIVE & LIMITED', href: '/products?edition=limited', hasMega: false, highlight: true },
  { label: 'OFFERS', href: '/products?availability=in-stock', hasMega: false },
];

/**
 * Luxury storefront Header component with full-width dynamic Megamenu overlay.
 * Mirrors modern high-fashion and customizable category navigation layouts.
 */
export function Header() {
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  return (
    <header
      className={`sticky top-0 w-full z-[1010] transition-colors duration-200 ${
        activeCategory
          ? 'bg-white text-slate-900 border-b border-slate-200 shadow-sm'
          : 'bg-background/90 backdrop-blur-md border-b border-border'
      }`}
      onMouseLeave={() => setActiveCategory(null)}
    >
      {/* Header Top Bar */}
      <Container className="flex items-center justify-between gap-4 h-[var(--header-height,4.5rem)]">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <Logo />
        </div>

        {/* Center: Dynamic Category & Section Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 h-full">
          {activeCategory ? (
            /* When Megamenu is open: Display Active Department Label matching the reference design */
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-[0.3em] uppercase text-slate-900 font-heading">
                {activeCategory}
              </span>
            </div>
          ) : (
            /* Standard Nav Links */
            <nav className="flex items-center gap-7 h-full">
              {DEFAULT_NAV_ITEMS.map((item) => {
                if (item.hasMega) {
                  return (
                    <button
                      key={item.label}
                      onMouseEnter={() => setActiveCategory(item.label)}
                      onClick={() => setActiveCategory(item.label)}
                      className="text-xs font-bold tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2 cursor-pointer flex items-center gap-1 group"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground/60 transition-transform group-hover:rotate-180" />
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-xs tracking-[0.2em] uppercase transition-colors py-2 ${
                      item.highlight
                        ? 'font-bold text-indigo-600 hover:text-indigo-700'
                        : 'font-bold text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Actions (Search, Account, Wishlist, Cart, Close X) */}
        <div className="flex items-center gap-3">
          <React.Suspense fallback={null}>
            <Search />
          </React.Suspense>

          <ProfileMenu />

          {/* Wishlist Link Icon */}
          <Link
            href="/account/wishlist"
            className="hidden sm:flex items-center justify-center h-9 w-9 rounded-full border border-border bg-background hover:bg-accent text-foreground transition-colors cursor-pointer"
            aria-label="View Wishlist"
          >
            <Heart className="h-4 w-4" />
          </Link>

          <CartButton />

          {/* Close button if Megamenu is open */}
          {activeCategory ? (
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center justify-center h-9 w-9 rounded-full border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer ml-1"
              aria-label="Close megamenu"
            >
              <X className="h-5 w-5" />
            </button>
          ) : (
            <MobileNav />
          )}
        </div>
      </Container>

      {/* Full-width Megamenu Dropdown Overlay */}
      {activeCategory && (
        <MegamenuPanel
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </header>
  );
}

export default Header;
