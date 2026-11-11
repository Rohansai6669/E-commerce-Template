'use client';

import React, { useState } from 'react';
import { BaseSectionConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { Tag, Copy, Check, Truck, Award, Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export function PromoBannerSection({ config }: { config: BaseSectionConfig & any }) {
  const [copied, setCopied] = useState(false);
  const code = config.promoCode || 'WELCOME20';

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

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`Discount code ${code} copied to clipboard!`);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <SectionShell config={config} className="bg-[var(--primary,#0f172a)] text-white">
      <div
        className={`flex flex-col md:flex-row items-center justify-between gap-6 p-6 sm:p-8 bg-white/5 border border-white/10 ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <div>
          <span className="bg-[var(--accent,#6366f1)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">
            {config.badgeText || 'SPECIAL OFFER'}
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {config.heading || 'GET 20% OFF YOUR FIRST ORDER'}
          </h3>
          <p className="text-sm text-slate-300 mt-1">
            {config.description || 'Apply code at checkout on all full-priced items.'}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/20">
          <Tag className="w-5 h-5 text-[var(--accent,#6366f1)] ml-2" />
          <span className="font-mono font-extrabold text-lg text-white tracking-wider px-2">{code}</span>
          <button
            onClick={handleCopy}
            className="bg-[var(--accent,#6366f1)] hover:opacity-90 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'COPIED' : 'COPY CODE'}
          </button>
        </div>
      </div>
    </SectionShell>
  );
}

export function FreeShippingProgressSection({ config }: { config: BaseSectionConfig & any }) {
  const currentTotal = 75;
  const target = 100;
  const progress = Math.min((currentTotal / target) * 100, 100);

  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)] border-y border-[var(--border,#e2e8f0)]">
      <div className="max-w-2xl mx-auto text-center py-4">
        <div className="flex items-center justify-center gap-2 mb-2 font-bold text-sm text-[var(--foreground,#0f172a)]">
          <Truck className="w-5 h-5 text-[var(--accent,#6366f1)]" />
          <span>You are only ${(target - currentTotal).toFixed(2)} away from FREE Express Shipping!</span>
        </div>
        <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mb-2">
          <div
            className="bg-[var(--accent,#6366f1)] h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-[var(--muted-foreground,#64748b)]">
          Add any accessory to qualify for free express delivery nationwide.
        </span>
      </div>
    </SectionShell>
  );
}

export function ExitIntentPopupSection({ config }: { config: BaseSectionConfig & any }) {
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
      <div
        className={`max-w-xl mx-auto bg-white p-8 border-2 border-[var(--accent,#6366f1)] shadow-2xl text-center ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <Gift className="w-12 h-12 text-[var(--accent,#6366f1)] mx-auto mb-4" />
        <h3 className="text-2xl font-extrabold text-[var(--foreground,#0f172a)] font-heading">
          {config.heading || 'WAIT! DON\'T LEAVE WITHOUT YOUR 15% OFF'}
        </h3>
        <p className="text-sm text-[var(--muted-foreground,#64748b)] my-3">
          Sign up to our VIP newsletter and unlock an instant 15% discount code for your basket.
        </p>
        <div className="flex gap-2 max-w-md mx-auto mt-4">
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--border,#e2e8f0)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent,#6366f1)]"
          />
          <ThemeButton variant="accent">UNLOCK 15%</ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function VipRewardsCardSection({ config }: { config: BaseSectionConfig & any }) {
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
    <SectionShell config={config} className="bg-[var(--primary,#0f172a)] text-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-6">
        <div>
          <span className="bg-[var(--accent,#6366f1)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
            {config.badgeText || 'VIP CLUB REWARDS'}
          </span>
          <h2 className="text-3xl font-extrabold font-heading text-white mb-3">
            {config.heading || 'EARN 1 POINT FOR EVERY ₹100 SPENT'}
          </h2>
          <p className="text-sm text-slate-300">
            {config.description || 'Redeem points for exclusive luxury gifts, free shipping vouchers, and private lookbook access.'}
          </p>
        </div>
        <div className="flex gap-4">
          <div
            className={`flex-1 bg-white/10 p-5 border border-white/20 text-center ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <Award className="w-8 h-8 text-[var(--accent,#6366f1)] mx-auto mb-2" />
            <h4 className="font-bold text-base text-white">SILVER MEMBER</h4>
            <span className="text-xs text-slate-300">0 - 500 Points</span>
          </div>
          <div
            className={`flex-1 bg-white/10 p-5 border border-white/20 text-center ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h4 className="font-bold text-base text-white">GOLD VIP</h4>
            <span className="text-xs text-slate-300">500+ Points</span>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CouponWheelSection({ config }: { config: BaseSectionConfig & any }) {
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
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)]">
      <SectionHeading eyebrow={config.eyebrow || 'INTERACTIVE BONUS'} heading={config.heading || 'SPIN TO UNLOCK YOUR DISCOUNT'} />
      <div
        className={`max-w-md mx-auto text-center bg-white p-6 border border-[var(--border,#e2e8f0)] shadow-lg ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <div className="w-32 h-32 rounded-full border-4 border-dashed border-[var(--accent,#6366f1)] flex items-center justify-center mx-auto mb-4 animate-spin-slow">
          <Sparkles className="w-10 h-10 text-[var(--accent,#6366f1)]" />
        </div>
        <ThemeButton variant="accent" size="lg" className="w-full">
          {config.buttonText || 'SPIN THE WHEEL NOW'}
        </ThemeButton>
      </div>
    </SectionShell>
  );
}

export function LimitedDealBannerSection({ config }: { config: BaseSectionConfig & any }) {
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
      <div
        className={`bg-gradient-to-r from-[var(--primary,#0f172a)] to-slate-800 text-white p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <div>
          <span className="text-xs font-bold tracking-widest text-[var(--accent,#6366f1)] uppercase block mb-1">
            {config.badgeText || 'DEAL OF THE DAY'}
          </span>
          <h3 className="text-2xl font-extrabold font-heading text-white">{config.heading || 'EXCLUSIVE OVERCOAT BUNDLE'}</h3>
          <p className="text-sm text-slate-300 mt-1">{config.description || 'Claim ₹1,500 off when ordering before midnight.'}</p>
        </div>
        <ThemeButton href={config.buttonUrl || config.primaryCtaUrl || '/products'} variant="accent" size="lg">
          {config.buttonText || config.primaryCtaText || 'CLAIM OFFER NOW'}
        </ThemeButton>
      </div>
    </SectionShell>
  );
}

export function MarqueeTickerSection({ config }: { config: BaseSectionConfig & any }) {
  const items = Array.isArray(config.tickerItems) && config.tickerItems.length > 0
    ? config.tickerItems
    : typeof config.tickerText === 'string' && config.tickerText.trim()
    ? config.tickerText.split('•').map((s: string) => s.trim()).filter(Boolean)
    : [
        'FREE EXPRESS SHIPPING ON ORDERS OVER ₹4,999',
        'BUILT IN INDIA — DESIGNED FOR THE WORLD',
        '100% CERTIFIED ORGANIC COTTON & SILK',
        'COMPLIMENTARY 30-DAY EASY RETURNS',
        'LIMITED EDITORIAL DROPS AVAILABLE NOW',
      ];

  return (
    <SectionShell
      config={{
        containerWidth: 'full',
        paddingX: 'none',
        topSpacing: 'none',
        bottomSpacing: 'none',
        ...config,
      }}
      className="p-0"
    >
      <div
        className="w-full py-3.5 bg-black text-white border-y border-zinc-800 overflow-hidden select-none"
        style={{
          backgroundColor: config.backgroundColor || '#000000',
          color: config.textColor || '#ffffff',
        }}
      >
        <div className="flex gap-8 whitespace-nowrap animate-marquee">
          {[...items, ...items, ...items, ...items].map((text: string, idx: number) => (
            <div key={idx} className="flex items-center gap-6 text-xs font-bold uppercase tracking-[0.25em]">
              <span>{text}</span>
              <span className="text-zinc-600">•</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
