'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BaseSectionConfig, CategoryGridConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { ShoppingBag, ArrowRight, MapPin } from 'lucide-react';

const mockCategories = [
  { id: '1', title: 'WOMEN', subtitle: 'Tailored Silhouettes & Silk Essentials', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop', link: '/products?category=women' },
  { id: '2', title: 'MEN', subtitle: 'Contemporary Outerwear & Denim', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop', link: '/products?category=men' },
  { id: '3', title: 'ACCESSORIES', subtitle: 'Italian Leather Goods & Jewelry', image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop', link: '/products?category=accessories' },
];

function getCategoryCardFallbackImage(titleOrSlug: string = ''): string {
  const lower = titleOrSlug.toLowerCase();
  if (lower.includes('denim') || lower.includes('jeans')) {
    return 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('oversize') || lower.includes('t-shirt') || lower.includes('tee')) {
    return 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('cargo') || lower.includes('trouser') || lower.includes('pant')) {
    return 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('hoodie') || lower.includes('fleece') || lower.includes('sweat')) {
    return 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('women') || lower.includes('dress') || lower.includes('silk')) {
    return 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('men') || lower.includes('suit') || lower.includes('tailor')) {
    return 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop';
  }
  if (lower.includes('accessori') || lower.includes('bag') || lower.includes('leather')) {
    return 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop';
  }
  return 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop';
}

export function CategoryGridSection({ config }: { config: CategoryGridConfig & any }) {
  const rawItems = config.items && config.items.length > 0 ? config.items : mockCategories;
  const items = rawItems
    .filter((item: any) => item.enabled !== false)
    .sort((a: any, b: any) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Dynamic Breakpoint Grid Columns
  const mobileCols = config.columnsMobile === 2 ? 'grid-cols-2' : 'grid-cols-1';
  const tabletCols = config.columnsTablet === 3 ? 'sm:grid-cols-3' : config.columnsTablet === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-2';
  const targetDesktop = config.columnsDesktop || (items.length <= 2 ? 2 : 4);
  const desktopCols = targetDesktop === 6
    ? 'lg:grid-cols-6'
    : targetDesktop === 4
    ? 'lg:grid-cols-4'
    : targetDesktop === 3
    ? 'lg:grid-cols-3'
    : 'lg:grid-cols-2';
  const gridColsClass = `${mobileCols} ${tabletCols} ${desktopCols}`;

  // Card Border Radius
  const sectionRadiusPx = config.cardRadiusPx;
  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  };
  const radiusClass = radiusMap[String(config.cardRadius || '')] || (sectionRadiusPx !== undefined ? '' : 'rounded-2xl');

  // Aspect Ratio
  const aspectMap: Record<string, string> = {
    portrait: 'aspect-[3/4]',
    tall: 'aspect-[4/5]',
    square: 'aspect-square',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
  };
  const aspectClass = aspectMap[String(config.aspectRatio || '')] || 'aspect-[3/4]';

  // Shadows
  const shadowMap: Record<string, string> = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };
  const shadowClass = shadowMap[String(config.cardShadow || '')] || 'shadow-md';

  // Hover Effect
  const hoverMap: Record<string, string> = {
    zoom: 'group-hover:scale-105',
    'zoom-lg': 'group-hover:scale-110',
    lift: 'group-hover:scale-102 hover:-translate-y-2',
    glow: 'group-hover:ring-2 group-hover:ring-indigo-500',
    none: '',
  };
  const hoverScaleClass = hoverMap[String(config.cardHoverEffect || '')] || 'group-hover:scale-105';

  // Card Gap
  const gapMap: Record<string, string> = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8',
    flush: 'gap-1',
  };
  const gapClass = gapMap[String(config.cardGap || '')] || 'gap-6';

  const showEyebrow = config.showCardEyebrow !== false;
  const showCta = config.showCardCta !== false;
  const defaultEyebrow = config.cardEyebrow || 'EXPLORE CATEGORY';
  const defaultCta = config.cardCtaText || 'SHOP NOW';

  return (
    <SectionShell config={config}>
      <SectionHeading
        eyebrow={config.eyebrow}
        heading={config.heading}
        description={config.description}
        alignment={config.headingAlignment}
      />
      <div className={`grid ${gridColsClass} ${gapClass}`}>
        {items.map((cat: any) => {
          const cardRadiusPx = cat.cardRadiusPx ?? sectionRadiusPx;
          const cardRadiusStyle = cardRadiusPx !== undefined ? { borderRadius: `${cardRadiusPx}px` } : {};
          const cardImg = cat.image || getCategoryCardFallbackImage(cat.title || cat.categorySlug);
          const objectPosClass = cat.imagePosition === 'center'
            ? 'object-center'
            : cat.imagePosition === 'bottom'
            ? 'object-bottom'
            : 'object-top';

          return (
            <Link
              key={cat.id}
              href={cat.link || `/products?category=${cat.categorySlug || 'all'}`}
              className={`group relative overflow-hidden ${radiusClass} ${shadowClass} ${aspectClass} block transition-all duration-500 ${config.cardHoverEffect === 'lift' ? 'hover:-translate-y-1.5' : ''}`}
              style={cardRadiusStyle}
            >
              <img
                src={cardImg}
                alt={cat.title}
                className={`w-full h-full object-cover ${objectPosClass} transition-transform duration-700 ${hoverScaleClass}`}
              />
              {/* Dark Gradient Vignette Overlay - opacity only affects the dark vignette, not the typography */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent pointer-events-none transition-opacity duration-300"
                style={{ opacity: cat.overlayOpacity ?? config.cardOverlayOpacity ?? 0.65 }}
              />

              {/* Text & Content Overlay with crystal clear typography */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10 pointer-events-none">
                {showEyebrow && (
                  <span className="text-xs font-bold tracking-[0.2em] text-[var(--accent,#818cf8)] mb-1 uppercase drop-shadow-xs">
                    {cat.eyebrow || defaultEyebrow}
                  </span>
                )}
                <h3 className="text-2xl font-extrabold font-heading uppercase drop-shadow-sm tracking-tight">{cat.title}</h3>
                {cat.subtitle && (
                  <p className="text-xs text-slate-200 mt-1 font-normal opacity-95 drop-shadow-xs">{cat.subtitle}</p>
                )}
                {showCta && (
                  <div className="mt-4 flex items-center text-xs font-bold group-hover:translate-x-1.5 transition-transform drop-shadow-xs">
                    {cat.ctaText || defaultCta} <ArrowRight className="w-4 h-4 ml-1.5" />
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </SectionShell>
  );
}

export function CategoryCirclesSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow="POPULAR COLLECTIONS" heading="BROWSE BY CATEGORY" alignment="center" />
      <div className="flex gap-6 overflow-x-auto justify-start sm:justify-center pb-4">
        {[
          { name: 'Outerwear', img: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=300&auto=format&fit=crop' },
          { name: 'Tailoring', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=300&auto=format&fit=crop' },
          { name: 'Leather', img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=300&auto=format&fit=crop' },
          { name: 'Knitwear', img: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=300&auto=format&fit=crop' },
          { name: 'Footwear', img: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=300&auto=format&fit=crop' },
        ].map((item, i) => (
          <Link key={i} href="/products" className="flex flex-col items-center gap-3 group min-w-[90px]">
            <div className="w-20 h-20 rounded-full p-1 border-2 border-[var(--accent,#6366f1)] overflow-hidden shadow-md group-hover:scale-105 transition-transform">
              <img src={item.img} alt="" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-xs font-bold text-[var(--foreground,#0f172a)] group-hover:text-[var(--accent,#6366f1)]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </SectionShell>
  );
}

export function ShoppableLookbookSection({ config }: { config: BaseSectionConfig & any }) {
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
      <SectionHeading eyebrow={config.eyebrow || 'SHOP THE LOOK'} heading={config.heading || 'AUTUMN EDITORIAL LOOKBOOK'} alignment={config.headingAlignment || 'center'} />
      <div
        className={`relative max-w-5xl mx-auto overflow-hidden shadow-2xl aspect-[16/9] ${cardRadiusClass}`}
        style={cardRadiusStyle}
      >
        <img
          src={config.imageUrl || config.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1400&auto=format&fit=crop'}
          alt="Editorial Lookbook"
          className="w-full h-full object-cover"
        />
        {/* Hotspot Pin */}
        <div className="absolute top-[35%] left-[45%] group">
          <div className="w-6 h-6 rounded-full bg-[var(--accent,#6366f1)] text-white font-bold flex items-center justify-center cursor-pointer shadow-lg animate-ping absolute inset-0 opacity-75" />
          <div className="w-6 h-6 rounded-full bg-[var(--accent,#6366f1)] text-white font-bold flex items-center justify-center cursor-pointer shadow-lg relative z-10">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div className="hidden group-hover:flex absolute left-8 top-0 bg-white p-3 rounded-xl shadow-xl w-48 text-left z-20 flex-col gap-1 border border-[var(--border,#e2e8f0)]">
            <span className="font-bold text-xs text-[var(--foreground,#0f172a)]">Cashmere Coat</span>
            <span className="text-xs font-extrabold text-[var(--primary,#0f172a)]">₹18,999</span>
            <Link href="/products" className="text-[10px] font-bold text-[var(--accent,#6366f1)] underline">View Product</Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

export function CollectionShowcaseSection({ config }: { config: BaseSectionConfig & any }) {
  const [activeTab, setActiveTab] = useState('all');

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

  const cols = config.columnsDesktop || 3;
  const colClass = cols === 2 ? 'sm:grid-cols-2' : cols === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-3';

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow || 'CURATED SELECTIONS'} heading={config.heading || 'SEASONAL COLLECTIONS'} alignment={config.headingAlignment || 'center'} />
      <div className="flex justify-center gap-2 sm:gap-3 mb-8 overflow-x-auto pb-2">
        {['all', 'outerwear', 'tailoring', 'accessories'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-[var(--primary,#0f172a)] text-white shadow-md'
                : 'bg-[var(--surface,#f8fafc)] text-[var(--muted-foreground,#64748b)] hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className={`grid grid-cols-1 ${colClass} gap-6`}>
        {mockCategories.map((c) => (
          <div
            key={c.id}
            className={`p-4 bg-white border border-border/80 shadow-sm ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <img
              src={c.image}
              alt={c.title}
              className={`w-full h-48 object-cover mb-3 ${cardRadiusClass}`}
              style={cardRadiusStyle}
            />
            <h4 className="font-bold text-lg text-[var(--foreground,#0f172a)] uppercase">{c.title}</h4>
            <p className="text-xs text-[var(--muted-foreground,#64748b)] mt-1">{c.subtitle}</p>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function MasonryGallerySection({ config }: { config: BaseSectionConfig & any }) {
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
      <SectionHeading eyebrow={config.eyebrow || 'COMMUNITY GALLERY'} heading={config.heading || '#LEXIDOSTYLE IN REAL LIFE'} alignment={config.headingAlignment || 'center'} />
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {[
          'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop',
          'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=600&auto=format&fit=crop',
        ].map((src, i) => (
          <div
            key={i}
            className={`break-inside-avoid overflow-hidden shadow-md ${cardRadiusClass}`}
            style={cardRadiusStyle}
          >
            <img src={src} alt="Gallery item" className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function BrandLogosSliderSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config}>
      {config.heading && (
        <SectionHeading eyebrow={config.eyebrow} heading={config.heading} alignment={config.headingAlignment || 'center'} />
      )}
      <div className="w-full py-6 flex justify-around items-center opacity-70 grayscale hover:grayscale-0 transition-all gap-8 flex-wrap">
        <span className="font-extrabold text-base sm:text-lg tracking-widest font-heading">VOGUE</span>
        <span className="font-extrabold text-base sm:text-lg tracking-widest font-heading">GQ</span>
        <span className="font-extrabold text-base sm:text-lg tracking-widest font-heading">HARPER'S BAZAAR</span>
        <span className="font-extrabold text-base sm:text-lg tracking-widest font-heading">FORBES</span>
        <span className="font-extrabold text-base sm:text-lg tracking-widest font-heading">ELLE</span>
      </div>
    </SectionShell>
  );
}
