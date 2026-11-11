'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BaseSectionConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { Mail, MapPin, Phone, Clock, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export function NewsletterSection({ config }: { config: BaseSectionConfig & any }) {
  const [email, setEmail] = useState('');

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-2xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)] border-t border-[var(--border,#e2e8f0)]">
      <div
        className={`max-w-3xl mx-auto text-center p-6 sm:p-10 bg-white/70 dark:bg-white/5 border border-border/60 ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <Mail className="w-10 h-10 text-[var(--accent,#6366f1)] mx-auto mb-3" />
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[var(--foreground,#0f172a)] font-heading mb-2">
          {config.heading || 'JOIN THE MINIMALIST CLUB'}
        </h2>
        <p className="text-sm text-[var(--muted-foreground,#64748b)] mb-6">
          {config.description || 'Subscribe for private sales, lookbook previews, and ₹1,000 off your first purchase.'}
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={config.placeholder || 'Enter your email address'}
            className="flex-1 px-4 py-3 rounded-lg border border-[var(--border,#e2e8f0)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent,#6366f1)]"
            required
          />
          <ThemeButton variant="primary" size="md">
            {config.buttonText || 'SUBSCRIBE'}
          </ThemeButton>
        </form>
      </div>
    </SectionShell>
  );
}

export function BeforeAfterSliderSection({ config }: { config: BaseSectionConfig & any }) {
  const [sliderPos, setSliderPos] = useState(50);

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-2xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'FABRIC COMPARISON'} heading={config.heading || 'STANDARD VS ORGANIC CASHMERE'} alignment="center" />
      <div
        className={`relative max-w-4xl mx-auto overflow-hidden shadow-xl aspect-[16/9] select-none ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <img src={config.beforeImage || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img src={config.afterImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop'} alt="" className="w-full h-full object-cover" />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl pointer-events-none"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-lg text-[var(--primary,#0f172a)] font-bold text-xs flex items-center justify-center -translate-x-3.5 top-1/2 relative">
            ↔
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function StoreLocatorSection({ config }: { config: BaseSectionConfig & any }) {
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'PHYSICAL BOUTIQUES'} heading={config.heading || 'VISIT OUR FLAGSHIP STORES'} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        <div
          className={`p-6 bg-white border border-[var(--border,#e2e8f0)] shadow-sm ${cardRadiusClass}`}
          style={cardRadiusStyle}
        >
          <span className="text-xs font-bold text-[var(--accent,#6366f1)] uppercase">MUMBAI FLAGSHIP</span>
          <h3 className="text-xl font-bold text-[var(--foreground,#0f172a)] my-2">Bandra West, Linking Road</h3>
          <div className="space-y-2 text-xs text-[var(--muted-foreground,#64748b)]">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> Mumbai, MH 400050, India</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> Mon - Sat: 11:00 AM - 9:00 PM</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 22 5550 1928</p>
          </div>
        </div>
        <div
          className={`p-6 bg-white border border-[var(--border,#e2e8f0)] shadow-sm ${cardRadiusClass}`}
          style={cardRadiusStyle}
        >
          <span className="text-xs font-bold text-[var(--accent,#6366f1)] uppercase">DELHI ATELIER</span>
          <h3 className="text-xl font-bold text-[var(--foreground,#0f172a)] my-2">DLF Emporio, Vasant Kunj</h3>
          <div className="space-y-2 text-xs text-[var(--muted-foreground,#64748b)]">
            <p className="flex items-center gap-2"><MapPin className="w-4 h-4" /> New Delhi, DL 110070, India</p>
            <p className="flex items-center gap-2"><Clock className="w-4 h-4" /> Mon - Sun: 11:00 AM - 9:30 PM</p>
            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> +91 11 5550 8192</p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function MultiColumnFooterSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <footer className="w-full bg-[var(--primary,#0f172a)] text-slate-300 py-16 border-t border-[var(--border,#e2e8f0)]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-extrabold text-white font-heading mb-4">MINIMALIST LUXURY</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Ethically sourced luxury garments and Italian handcrafted outerwear designed for modern living.
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <CreditCard className="w-5 h-5" />
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">SHOP CATEGORIES</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=women" className="hover:text-white">Women's Collection</Link></li>
            <li><Link href="/products?category=men" className="hover:text-white">Men's Apparel</Link></li>
            <li><Link href="/products?category=accessories" className="hover:text-white">Leather Accessories</Link></li>
            <li><Link href="/products" className="hover:text-white">New Arrivals</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">CUSTOMER CARE</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/help" className="hover:text-white">Shipping & Returns</Link></li>
            <li><Link href="/help" className="hover:text-white">Track Order</Link></li>
            <li><Link href="/help" className="hover:text-white">Size Guide</Link></li>
            <li><Link href="/help" className="hover:text-white">Contact VIP Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-extrabold text-white uppercase tracking-wider mb-4">LEGAL & PRIVACY</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            <li><Link href="/sustainability" className="hover:text-white">Sustainability Pledge</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 Minimalist Luxury Storefront. All rights reserved.
      </div>
    </footer>
  );
}

export function MinimalFooterSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <footer className="w-full bg-[var(--background,#ffffff)] border-t border-[var(--border,#e2e8f0)] py-8 px-4 text-center text-xs text-[var(--muted-foreground,#64748b)]">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="font-bold text-[var(--foreground,#0f172a)] font-heading">MINIMALIST LUXURY</span>
        <span>© 2026 E-Commerce Storefront. Powered by Custom Visual Engine.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
        </div>
      </div>
    </footer>
  );
}

export function ReviewsOverviewGridSection({ config }: { config: BaseSectionConfig & any }) {
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-2xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'TRANSPARENT REVIEWS'} heading={config.heading || 'OVERALL RATING BREAKDOWN'} alignment={config.headingAlignment || 'center'} />
      <div
        className={`max-w-3xl mx-auto bg-white p-6 border border-[var(--border,#e2e8f0)] shadow-sm ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <span className="text-5xl font-extrabold text-[var(--primary,#0f172a)] font-heading">4.9</span>
            <span className="block text-xs font-bold text-[var(--muted-foreground,#64748b)] mt-1">Out of 5 Stars</span>
          </div>
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => (
              <div key={stars} className="flex items-center gap-3 text-xs">
                <span className="font-bold w-12 text-right">{stars} Stars</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: stars === 5 ? '90%' : stars === 4 ? '8%' : '2%' }}
                  />
                </div>
                <span className="w-8 text-slate-400">{stars === 5 ? '90%' : stars === 4 ? '8%' : '2%'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function SizeGuideModalSection({ config }: { config: BaseSectionConfig & any }) {
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'FITTING GUIDE'} heading={config.heading || 'SIZE CONVERSION CHART'} alignment={config.headingAlignment || 'left'} />
      <div
        className={`max-w-3xl mx-auto border border-border/80 overflow-hidden text-xs ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <div className="grid grid-cols-4 bg-[var(--surface,#f8fafc)] p-3 font-bold text-[var(--primary,#0f172a)] border-b">
          <span>SIZE</span>
          <span>CHEST (INCH)</span>
          <span>WAIST (INCH)</span>
          <span>EU CONVERSION</span>
        </div>
        {[
          { size: 'S', chest: '36 - 38', waist: '30 - 32', eu: '46' },
          { size: 'M', chest: '38 - 40', waist: '32 - 34', eu: '48' },
          { size: 'L', chest: '40 - 42', waist: '34 - 36', eu: '50' },
          { size: 'XL', chest: '42 - 44', waist: '36 - 38', eu: '52' },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-4 p-3 border-b hover:bg-slate-50">
            <span className="font-bold">{row.size}</span>
            <span>{row.chest}</span>
            <span>{row.waist}</span>
            <span>{row.eu}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function CustomHtmlCanvasSection({ config }: { config: BaseSectionConfig & any }) {
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const cardRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-xl');
  const cardRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config}>
      <div
        className={`p-6 bg-white border border-[var(--border,#e2e8f0)] shadow-sm ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <h3 className="font-bold text-lg mb-2 text-[var(--foreground,#0f172a)]">
          {config.heading || 'CUSTOM RICH EMBED'}
        </h3>
        <p className="text-sm text-[var(--muted-foreground,#64748b)]">
          {config.description || 'Sanitized rich HTML content block rendered securely within CMS boundaries.'}
        </p>
      </div>
    </SectionShell>
  );
}
