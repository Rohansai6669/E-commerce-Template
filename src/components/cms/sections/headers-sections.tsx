'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BaseSectionConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { ThemeButton } from '../primitives/button';
import { CountdownPrimitive } from '../primitives/countdown';
import { ShoppingBag, Search, Heart, User, X, Menu, Phone, Globe, ChevronDown } from 'lucide-react';

export function AnnouncementBarSection({ config }: { config: BaseSectionConfig & any }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className="w-full py-2.5 px-4 text-xs font-semibold tracking-wider uppercase text-center relative flex items-center justify-between transition-all"
      style={{
        backgroundColor: config.backgroundColor || 'var(--primary, #0f172a)',
        color: config.textColor || '#ffffff',
      }}
    >
      <div className="flex-1 text-center truncate">
        <span>{config.message || 'FREE EXPRESS SHIPPING ON ALL ORDERS OVER $100'}</span>
        {config.ctaText && (
          <Link
            href={config.linkUrl || '/products'}
            className="ml-3 underline font-bold hover:opacity-80 transition-opacity"
          >
            {config.ctaText}
          </Link>
        )}
      </div>
      {config.dismissible !== false && (
        <button
          onClick={() => setDismissed(true)}
          className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export function TopUtilityBarSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <div className="w-full border-b border-[var(--border,#e2e8f0)] bg-[var(--surface,#f8fafc)] py-1.5 px-4 text-xs text-[var(--muted-foreground,#64748b)] hidden sm:flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="flex items-center gap-1.5">
          <Phone className="w-3 h-3 text-[var(--accent,#6366f1)]" /> {config.phoneText || '+1 (800) 555-0199'}
        </span>
        <span className="flex items-center gap-1.5">
          <Globe className="w-3 h-3 text-[var(--accent,#6366f1)]" /> {config.storeText || 'Store Locator'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="cursor-pointer hover:text-[var(--primary,#0f172a)] font-medium">USD ($)</span>
        <span>|</span>
        <span className="cursor-pointer hover:text-[var(--primary,#0f172a)] font-medium">English</span>
        <span>|</span>
        <Link href="/help" className="hover:underline">Help & FAQs</Link>
      </div>
    </div>
  );
}

export function StoreHeaderSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <header className="w-full bg-[var(--background,#ffffff)] border-b border-[var(--border,#e2e8f0)] sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button className="sm:hidden p-2 text-[var(--foreground,#0f172a)]">
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="font-extrabold text-xl tracking-tight text-[var(--primary,#0f172a)] font-heading">
            {config.storeName || 'MINIMALIST LUXURY'}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[var(--foreground,#0f172a)]">
          <Link href="/products?category=women" className="hover:text-[var(--accent,#6366f1)] transition-colors">Women</Link>
          <Link href="/products?category=men" className="hover:text-[var(--accent,#6366f1)] transition-colors">Men</Link>
          <Link href="/products?category=accessories" className="hover:text-[var(--accent,#6366f1)] transition-colors">Accessories</Link>
          <Link href="/products" className="hover:text-[var(--accent,#6366f1)] transition-colors">All Products</Link>
        </nav>

        <div className="flex items-center gap-4">
          <button className="p-2 text-[var(--foreground,#0f172a)] hover:text-[var(--accent,#6366f1)] transition-colors">
            <Search className="w-5 h-5" />
          </button>
          <Link href="/account" className="p-2 text-[var(--foreground,#0f172a)] hover:text-[var(--accent,#6366f1)] transition-colors">
            <User className="w-5 h-5" />
          </Link>
          <Link href="/cart" className="p-2 text-[var(--foreground,#0f172a)] relative hover:text-[var(--accent,#6366f1)] transition-colors">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute top-1 right-1 bg-[var(--accent,#6366f1)] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              2
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function PromoStickyHeaderSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <div className="w-full bg-[var(--surface,#f8fafc)] border-b border-[var(--border,#e2e8f0)] py-3 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <span className="bg-[var(--accent,#6366f1)] text-white text-xs font-bold px-2.5 py-1 rounded">
            {config.badgeText || 'FLASH SALE'}
          </span>
          <span className="text-sm font-bold text-[var(--foreground,#0f172a)]">
            {config.heading || 'Get 25% OFF Storewide — Offer Ends Soon!'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <CountdownPrimitive targetDate={config.endsAt} />
          <ThemeButton href={config.primaryCtaUrl || '/products'} size="sm" variant="accent">
            {config.primaryCtaText || 'CLAIM DISCOUNT'}
          </ThemeButton>
        </div>
      </div>
    </div>
  );
}

export function MegaMenuHeaderSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <div className="w-full bg-[var(--background,#ffffff)] border-b border-[var(--border,#e2e8f0)] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <span className="font-extrabold text-lg tracking-wider text-[var(--primary,#0f172a)]">
            {config.brandLabel || 'BOUTIQUE MEGA MENU'}
          </span>
          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold">
            <div className="group relative py-2 cursor-pointer flex items-center gap-1">
              <span>Apparel</span> <ChevronDown className="w-4 h-4" />
            </div>
            <div className="group relative py-2 cursor-pointer flex items-center gap-1">
              <span>Footwear</span> <ChevronDown className="w-4 h-4" />
            </div>
            <div className="group relative py-2 cursor-pointer flex items-center gap-1">
              <span>Accessories</span> <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
        <ThemeButton href="/products" size="sm" variant="primary">
          SHOP NEW ARRIVALS
        </ThemeButton>
      </div>
    </div>
  );
}
