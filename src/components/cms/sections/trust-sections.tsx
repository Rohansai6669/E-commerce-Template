'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BaseSectionConfig, EditorialBannerConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { Star, ShieldCheck, Truck, RefreshCw, Headset, ChevronDown, Camera, CheckCircle, ArrowRight } from 'lucide-react';
import { getNineAlignmentClasses } from '@/components/ui/nine-alignment-matrix';

export function TestimonialsSection({ config }: { config: BaseSectionConfig & any }) {
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

  const shadowMap: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  const shadowClass = shadowMap[String(config.cardShadow || '')] || 'shadow-sm';

  const defaultTestimonials = [
    { name: 'Elena Rostova', city: 'Milan, Italy', review: 'The cashmere quality is unbelievable. Fits like bespoke Italian tailoring.', rating: 5 },
    { name: 'Marcus Vance', city: 'London, UK', review: 'Remarkable craftsmanship. Fast express delivery and beautiful packaging.', rating: 5 },
    { name: 'Sophie Chen', city: 'New York, USA', review: 'Subtle elegance and zero compromise on sustainability. I ordered 3 coats!', rating: 5 },
  ];

  const testimonialsList = (Array.isArray(config.items) && config.items.length > 0)
    ? config.items.map((item: any) => ({
        name: item.title || item.name || 'Verified Customer',
        city: item.subtitle || item.city || 'Verified Buyer',
        review: item.description || item.review || item.text || 'Exceptional craftsmanship and luxury fit.',
        rating: item.rating || 5,
      }))
    : defaultTestimonials;

  const colsDesktop = config.columnsDesktop || 3;
  const desktopColsClass = colsDesktop === 1 ? 'lg:grid-cols-1' : colsDesktop === 2 ? 'lg:grid-cols-2' : colsDesktop === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'VERIFIED BUYERS'} heading={config.heading || 'WHAT OUR CUSTOMERS SAY'} alignment={config.headingAlignment || 'center'} />
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${desktopColsClass} gap-6`}>
        {testimonialsList.map((t: any, i: number) => (
          <div
            key={i}
            className={`bg-white p-6 border border-[var(--border,#e2e8f0)] ${cardRadiusClass} ${shadowClass} flex flex-col justify-between`}
            style={cardRadiusStyle}
          >
            <div>
              <div className="flex text-amber-400 mb-3">
                {[...Array(t.rating || 5)].map((_, r) => (
                  <Star key={r} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-[var(--foreground,#0f172a)] font-medium leading-relaxed mb-4">"{t.review}"</p>
            </div>
            <div className="flex items-center gap-2 border-t pt-3 border-slate-100">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <div>
                <h4 className="text-xs font-bold text-[var(--foreground,#0f172a)]">{t.name}</h4>
                <span className="text-[10px] text-[var(--muted-foreground,#64748b)]">{t.city} • Verified Buyer</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function FeatureHighlightsSection({ config }: { config: BaseSectionConfig & any }) {
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

  const items = [
    { icon: Truck, title: 'FREE EXPRESS SHIPPING', text: 'On all orders over ₹4,999' },
    { icon: RefreshCw, title: '30-DAY EASY RETURNS', text: 'Hassle-free global returns' },
    { icon: ShieldCheck, title: 'SECURE PAYMENTS', text: 'Encrypted RBI-compliant gateway' },
    { icon: Headset, title: '24/7 VIP SUPPORT', text: 'Dedicated personal stylist' },
  ];

  return (
    <SectionShell config={config}>
      {config.heading && (
        <SectionHeading eyebrow={config.eyebrow} heading={config.heading} alignment={config.headingAlignment || 'center'} />
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center p-4 bg-white/60 dark:bg-white/5 border border-border/60 ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <item.icon className="w-8 h-8 text-[var(--accent,#6366f1)] mb-3" />
            <h4 className="text-xs font-extrabold tracking-wider text-[var(--primary,#0f172a)] uppercase mb-1">
              {item.title}
            </h4>
            <span className="text-xs text-[var(--muted-foreground,#64748b)] font-normal">{item.text}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function FaqAccordionSection({ config }: { config: BaseSectionConfig & any }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

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

  const defaultFaqs = [
    { q: 'What materials are used in your outerwear?', a: 'We use 100% certified organic virgin wool and Italian cashmere from sustainable ateliers in Florence.' },
    { q: 'How long does express delivery take in India?', a: 'Standard express orders arrive within 2-4 business days across India via our priority courier partners.' },
    { q: 'What is your return policy?', a: 'We offer 30-day complimentary easy returns with prepaid pickup included in every order.' },
  ];

  const faqsList = (Array.isArray(config.items) && config.items.length > 0)
    ? config.items.map((item: any) => ({
        q: item.title || item.q || item.question || 'FAQ Question',
        a: item.subtitle || item.a || item.answer || item.description || 'FAQ Answer details.',
      }))
    : defaultFaqs;

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'NEED HELP?'} heading={config.heading || 'FREQUENTLY ASKED QUESTIONS'} alignment={config.headingAlignment || 'left'} />
      <div className="max-w-3xl mx-auto space-y-3.5">
        {faqsList.map((faq: any, i: number) => (
          <div
            key={i}
            className={`border border-[var(--border,#e2e8f0)] overflow-hidden bg-white shadow-2xs ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full p-4 sm:p-5 text-left font-bold text-sm text-[var(--foreground,#0f172a)] flex justify-between items-center hover:bg-[var(--surface,#f8fafc)] transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${openIdx === i ? 'rotate-180' : ''}`} />
            </button>
            {openIdx === i && (
              <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-[var(--muted-foreground,#64748b)] border-t border-[var(--border,#e2e8f0)] leading-relaxed">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function InstagramFeedSection({ config }: { config: BaseSectionConfig & any }) {
  const [liveSettings, setLiveSettings] = React.useState<any>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const { getInstagramSettings } = await import('@/lib/cms/service');
        const settings = await getInstagramSettings();
        if (isMounted) {
          setLiveSettings(settings);
        }
      } catch (e) {
        console.warn('Failed to fetch Instagram settings in section:', e);
      }
    }

    loadSettings();

    const handleUpdate = () => {
      loadSettings();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('cms-instagram-updated', handleUpdate);
    }

    return () => {
      isMounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('cms-instagram-updated', handleUpdate);
      }
    };
  }, []);

  const handle = config?.handle || liveSettings?.handle || '@LEXIDO';
  const followUrl = config?.followUrl || liveSettings?.followUrl || 'https://instagram.com/lexido';
  const posts = (config?.posts && config.posts.length > 0)
    ? config.posts
    : (liveSettings?.posts && liveSettings.posts.length > 0)
    ? liveSettings.posts
    : [
        { id: 'ig-1', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/1', caption: 'Lookbook Editorial 2026' },
        { id: 'ig-2', imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/2', caption: 'Minimalist Tailoring Essentials' },
        { id: 'ig-3', imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/3', caption: 'Real Organic Cotton & Cashmere' },
        { id: 'ig-4', imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/4', caption: 'Handcrafted Italian Leather Goods' },
        { id: 'ig-5', imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/5', caption: 'Autumn / Winter Outerwear' },
        { id: 'ig-6', imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800&auto=format&fit=crop', postUrl: 'https://instagram.com/p/6', caption: 'Zero-Emission Ateliers' },
      ];

  if (liveSettings?.enabled === false && !config?.overrideEnabled) {
    return null;
  }

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-xl',
    large: 'rounded-2xl',
    xlarge: 'rounded-3xl',
    full: 'rounded-full',
  };
  const igRadiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-none sm:rounded-xl');
  const igRadiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  return (
    <SectionShell config={config} className="py-12 sm:py-16">
      <div className="w-full">
        {/* Screenshot Matching Header Layout */}
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading text-[var(--foreground,#0f172a)] uppercase">
            {handle}
          </h2>
          <a
            href={followUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[var(--muted-foreground,#64748b)] hover:text-[var(--foreground,#0f172a)] transition-colors flex items-center gap-1 group border-b border-transparent hover:border-[var(--foreground,#0f172a)] pb-0.5"
          >
            FOLLOW US <span className="group-hover:translate-x-1 transition-transform">—</span>
          </a>
        </div>

        {/* 6-Column High Contrast Post Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {posts.map((post: any, i: number) => (
            <a
              key={post.id || i}
              href={post.postUrl || followUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative aspect-square ${igRadiusClass} overflow-hidden bg-slate-100 block border border-slate-200/50 shadow-xs hover:shadow-md transition-all`}
              style={igRadiusStyle}
            >
              <img
                src={post.imageUrl}
                alt={post.caption || `Instagram post ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white p-3 text-center">
                <Camera className="w-6 h-6 mb-2 drop-shadow-md" />
                {post.caption && (
                  <span className="text-xs font-semibold line-clamp-2 leading-tight tracking-tight drop-shadow-md">
                    {post.caption}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}

export function BrandStorySection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)]">
      <div className="max-w-4xl mx-auto text-center py-8">
        <span className="text-xs font-bold tracking-widest text-[var(--accent,#6366f1)] uppercase mb-2 block">OUR PHILOSOPHY</span>
        <h2 className="text-3xl font-extrabold text-[var(--foreground,#0f172a)] font-heading mb-4">SUSTAINABLE LUXURY WITHOUT COMPROMISE</h2>
        <p className="text-base text-[var(--muted-foreground,#64748b)] leading-relaxed mb-6 max-w-2xl mx-auto">
          Founded in 2022, our atelier works exclusively with certified zero-emission fabric mills in Northern Italy to create wardrobe staples that last generations.
        </p>
        <span className="font-serif italic text-lg text-[var(--primary,#0f172a)] font-bold">— Mateo Rossi, Founder</span>
      </div>
    </SectionShell>
  );
}

export function EditorialBannerSection({ config }: { config: EditorialBannerConfig & any }) {
  const layout = config.layout || 'manifesto-card';

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const radiusClass = radiusMap[String(config.cardRadius || '')] || (config.cardRadiusPx !== undefined ? '' : 'rounded-2xl');
  const radiusStyle = config.cardRadiusPx !== undefined ? { borderRadius: `${config.cardRadiusPx}px` } : {};

  const shadowMap: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  const shadowClass = shadowMap[String(config.cardShadow || '')] || (config.containerWidth !== 'full' ? 'shadow-md' : '');

  // Extract checklist items if provided as array or newline text string
  const checklist: string[] = Array.isArray(config.checklistItems) && config.checklistItems.length > 0
    ? config.checklistItems
    : typeof config.checklistText === 'string' && config.checklistText.trim()
    ? config.checklistText.split('\n').map((s: string) => s.trim()).filter(Boolean)
    : ['LUXURY MAGNETIC BOX', 'EMBOSSED BRAND TAGS', 'HAND-SIGNED THANK-YOU CARD'];

  const alignClass = getNineAlignmentClasses(config.contentAlignment || config.headingAlignment || 'middle-left').all;

  // Variation 1: Manifesto Card (Dark Box Split - Screenshot 1)
  if (layout === 'manifesto-card' || layout === 'dark-split') {
    return (
      <SectionShell config={config}>
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-zinc-200 dark:border-zinc-800 ${radiusClass} ${shadowClass}`}
          style={radiusStyle}
        >
          {/* Black Manifesto Card */}
          <div className={`bg-black text-white p-8 sm:p-12 lg:p-16 flex flex-col ${alignClass}`}>
            {config.eyebrow && (
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-400 mb-4 block">
                {config.eyebrow}
              </span>
            )}
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading leading-tight uppercase mb-6 text-white">
              {config.heading || 'Not a brand. A way of moving.'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 font-normal leading-relaxed mb-8 max-w-xl">
              {config.description ||
                'LEXIDO is a study in restraint. We obsess over weight, drape, and the way a garment lives on the body. Every piece is cut to outlast trend — built in India, designed for the rest of the world.'}
            </p>
            {config.primaryCtaText && (
              <div>
                <Link
                  href={config.primaryCtaUrl || '/about'}
                  className="inline-flex items-center gap-2 border border-white bg-black text-white hover:bg-white hover:text-black transition-all px-6 py-3.5 text-xs font-bold uppercase tracking-widest cursor-pointer"
                >
                  {config.primaryCtaText} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Right Media Image */}
          <div className="relative min-h-[350px] lg:min-h-[500px] bg-zinc-900">
            <img
              src={
                config.image ||
                'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
              }
              alt={config.heading || 'Editorial Campaign'}
              className="w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </SectionShell>
    );
  }

  // Variation 2: Ritual Checklist (Image + Bullet Points - Screenshot 2)
  if (layout === 'ritual-checklist' || layout === 'checklist-split') {
    return (
      <SectionShell config={config} className="p-0">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 overflow-hidden border border-zinc-200 dark:border-zinc-800 ${radiusClass}`}
          style={radiusStyle}
        >
          {/* Left Media Image */}
          <div className="relative min-h-[350px] lg:min-h-[500px] order-2 lg:order-1">
            <img
              src={
                config.image ||
                'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop'
              }
              alt={config.heading || 'The Ritual'}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right White Content Box */}
          <div className={`bg-white text-black p-8 sm:p-12 lg:p-16 flex flex-col ${alignClass} order-1 lg:order-2`}>
            {config.eyebrow && (
              <span className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-500 mb-4 block">
                {config.eyebrow}
              </span>
            )}
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-heading leading-tight uppercase mb-6 text-black">
              {config.heading || 'THE RITUAL'}
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 font-normal leading-relaxed mb-8 max-w-xl">
              {config.description ||
                'A LEXIDO box arrives sealed in matte black, monogrammed with embossed silver. Inside — your piece, wrapped in archival tissue, a hand-numbered tag, and a thank-you card signed by our design team.'}
            </p>

            {/* Square Bullet Points List */}
            <div className="space-y-3.5 pt-2">
              {checklist.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-black">
                  <span className="w-2 h-2 bg-black flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {config.primaryCtaText && (
              <div className="pt-8">
                <Link
                  href={config.primaryCtaUrl || '/about'}
                  className="inline-flex items-center gap-2 border border-black bg-black text-white hover:bg-zinc-800 transition-all px-6 py-3 text-xs font-bold uppercase tracking-widest"
                >
                  {config.primaryCtaText} <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </SectionShell>
    );
  }

  // Standard Image Left / Image Right Fallback
  const isImageRight = layout === 'image-right';

  return (
    <SectionShell config={config}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div
          className={`overflow-hidden border border-zinc-200 shadow-md aspect-[4/3] ${isImageRight ? 'order-1 lg:order-2' : ''} ${radiusClass}`}
          style={radiusStyle}
        >
          <img
            src={config.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className={isImageRight ? 'order-2 lg:order-1' : ''}>
          {config.badgeText && (
            <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase tracking-wider mb-3 inline-block">
              {config.badgeText}
            </span>
          )}
          {config.eyebrow && (
            <span className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-500 mb-2 block">
              {config.eyebrow}
            </span>
          )}
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight font-heading uppercase mb-4 text-black">
            {config.heading || 'CRAFTED WITH INTENTION & PURPOSE'}
          </h2>
          <p className="text-base text-zinc-600 mb-8 leading-relaxed">
            {config.description || 'Every garment is ethically sourced from organic cotton farms and crafted in zero-emission ateliers.'}
          </p>
          <ThemeButton href={config.primaryCtaUrl || '/about'} variant="primary" size="lg">
            {config.primaryCtaText || 'READ OUR MANIFESTO'}
          </ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function PressMentionsSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config} className="bg-[var(--primary,#0f172a)] text-white">
      <div className="max-w-3xl mx-auto text-center py-6">
        <p className="text-xl sm:text-2xl font-serif italic text-slate-200 mb-4">
          "Redefining modern luxury tailoring with unrivaled European craftsmanship and sustainable textiles."
        </p>
        <span className="text-xs font-extrabold tracking-widest text-[var(--accent,#6366f1)] uppercase">VOGUE EDITORIAL 2026</span>
      </div>
    </SectionShell>
  );
}
