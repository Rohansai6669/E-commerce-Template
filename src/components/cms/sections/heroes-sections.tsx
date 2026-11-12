'use client';

import React, { useState } from 'react';
import { BaseSectionConfig, HeroConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { CountdownPrimitive } from '../primitives/countdown';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { normalizeNineAlignment, getNineAlignmentClasses } from '@/components/ui/nine-alignment-matrix';

export function HeroSection({ config }: { config: HeroConfig }) {
  const slides = config.slides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  if (slides.length === 0) {
    const fallbackNorm = normalizeNineAlignment(config.contentPosition || config.headingAlignment || 'center');
    const fallbackAlign = getNineAlignmentClasses(fallbackNorm);
    return (
      <SectionShell config={config}>
        <div className={`py-20 flex flex-col ${fallbackAlign.horizontal} ${fallbackAlign.text}`}>
          <SectionHeading eyebrow={config.eyebrow} heading={config.heading} description={config.description} alignment={fallbackNorm} />
          <ThemeButton href={config.primaryCtaUrl || '/products'}>
            {config.primaryCtaText || 'EXPLORE COLLECTION'}
          </ThemeButton>
        </div>
      </SectionShell>
    );
  }

  const slide = slides[currentSlide];

  const heightMap: Record<string, string> = {
    auto: 'h-auto py-20 sm:py-28 min-h-[400px]',
    small: 'h-[380px] sm:h-[460px]',
    medium: 'h-[500px] sm:h-[600px]',
    large: 'h-[640px] sm:h-[750px]',
    screen: 'min-h-[85vh] sm:min-h-screen',
  };

  const selectedHeightClass =
    heightMap[config.heroHeight || config.sectionHeight || 'medium'] || heightMap.medium;

  const rawPosition = slide.contentPosition || config.contentPosition || config.headingAlignment || 'center';
  const normPosition = normalizeNineAlignment(rawPosition);
  const align = getNineAlignmentClasses(normPosition);

  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <div
      id={config.id}
      data-section-id={config.id}
      className={`relative w-full ${selectedHeightClass} overflow-hidden bg-slate-900 text-white flex flex-col ${align.vertical} ${align.horizontal} px-8 sm:px-16 md:px-20 py-8 sm:py-14 md:py-16 transition-all duration-300`}
      style={config.minHeightPx ? { minHeight: `${config.minHeightPx}px` } : undefined}
    >
      <img
        src={slide.mediaUrl}
        alt={slide.heading || ''}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
      />
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity: slide.overlayOpacity ?? 0.35 }}
      />
      <div className={`relative z-10 max-w-3xl w-full flex flex-col ${align.horizontal} ${align.text}`}>
        {slide.eyebrow && (
          <span className={`text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-[var(--accent,#6366f1)] mb-3 block ${align.text}`}>
            {slide.eyebrow}
          </span>
        )}
        {slide.heading && (
          <h1 className={`text-3xl sm:text-6xl font-extrabold tracking-tight mb-4 font-heading leading-tight ${align.text}`}>
            {slide.heading}
          </h1>
        )}
        {(slide.description || slide.subTitle) && (
          <p className={`text-base sm:text-lg text-slate-200 max-w-2xl mb-8 font-normal leading-relaxed ${align.text}`}>
            {slide.description || slide.subTitle}
          </p>
        )}
        <div className={`flex flex-wrap items-center gap-4 ${ctaJustify}`}>
          {slide.primaryCtaText && (
            <ThemeButton href={slide.primaryCtaUrl || '/products'} variant="accent" size="lg">
              {slide.primaryCtaText}
            </ThemeButton>
          )}
          {slide.secondaryCtaText && (
            <ThemeButton href={slide.secondaryCtaUrl || '/about'} variant="secondary" size="lg">
              {slide.secondaryCtaText}
            </ThemeButton>
          )}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer"
            title="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors cursor-pointer"
            title="Next Slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}
    </div>
  );
}

export function SplitHeroSection({ config }: { config: BaseSectionConfig & any }) {
  const norm = normalizeNineAlignment(config.headingAlignment || config.contentAlignment || 'middle-left');
  const align = getNineAlignmentClasses(norm);
  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <SectionShell config={config}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-8">
        <div className={`flex flex-col ${align.horizontal} ${align.text}`}>
          <span className={`text-xs font-bold tracking-[0.2em] text-[var(--accent,#6366f1)] uppercase mb-3 ${align.text}`}>
            {config.eyebrow || 'EDITORIAL SELECTION'}
          </span>
          <h1 className={`text-3xl sm:text-5xl font-extrabold text-[var(--foreground,#0f172a)] font-heading leading-tight mb-6 ${align.text}`}>
            {config.heading || 'ARCHITECTURAL SILHOUETTES & MODERN TAILORING'}
          </h1>
          <p className={`text-base text-[var(--muted-foreground,#64748b)] mb-8 max-w-xl ${align.text}`}>
            {config.description || 'Precision luxury garments designed in Milan & Florence using 100% sustainable organic textiles.'}
          </p>
          <div className={`flex items-center gap-4 ${ctaJustify}`}>
            <ThemeButton href={config.primaryCtaUrl || '/products'} size="lg" variant="primary">
              {config.primaryCtaText || 'SHOP COLLECTION'}
            </ThemeButton>
            {config.secondaryCtaText && (
              <ThemeButton href={config.secondaryCtaUrl || '/about'} size="lg" variant="outline">
                {config.secondaryCtaText}
              </ThemeButton>
            )}
          </div>
        </div>
        <div className="relative rounded-[var(--radius-xl,16px)] overflow-hidden shadow-2xl aspect-[4/3]">
          <img
            src={config.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </SectionShell>
  );
}

export function VideoHeroSection({ config }: { config: BaseSectionConfig & any }) {
  const norm = normalizeNineAlignment(config.contentPosition || config.headingAlignment || config.contentAlignment || 'center');
  const align = getNineAlignmentClasses(norm);
  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <div className={`relative w-full h-[600px] overflow-hidden bg-black text-white flex flex-col ${align.vertical} ${align.horizontal} px-8 sm:px-16 py-12`}>
      <img
        src={config.posterImage || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop'}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className={`relative z-10 max-w-3xl w-full flex flex-col ${align.horizontal} ${align.text}`}>
        <div className={`w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 cursor-pointer hover:scale-110 transition-transform ${
          align.horizontal === 'items-start' ? 'mr-auto' : align.horizontal === 'items-end' ? 'ml-auto' : 'mx-auto'
        }`}>
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        </div>
        <h1 className={`text-4xl sm:text-6xl font-extrabold font-heading mb-4 ${align.text}`}>
          {config.heading || 'THE 2026 BRAND FILM'}
        </h1>
        <p className={`text-lg text-slate-200 mb-8 max-w-xl ${align.text}`}>
          {config.description || 'Watch our story of sustainable craftsmanship across Europe.'}
        </p>
        <div className={`flex items-center gap-4 ${ctaJustify}`}>
          <ThemeButton href={config.primaryCtaUrl || '/products'} variant="accent" size="lg">
            {config.primaryCtaText || 'EXPLORE BRAND'}
          </ThemeButton>
        </div>
      </div>
    </div>
  );
}

export function CountdownHeroSection({ config }: { config: BaseSectionConfig & any }) {
  const norm = normalizeNineAlignment(config.headingAlignment || config.contentAlignment || 'center');
  const align = getNineAlignmentClasses(norm);
  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)] border-y border-[var(--border,#e2e8f0)]">
      <div className={`py-12 max-w-3xl w-full flex flex-col ${align.horizontal} ${align.text} ${
        align.horizontal === 'items-center' ? 'mx-auto' : align.horizontal === 'items-end' ? 'ml-auto' : 'mr-auto'
      }`}>
        <span className="bg-[var(--destructive,#ef4444)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4 inline-block">
          {config.eyebrow || 'LIMITED FLASH EVENT'}
        </span>
        <h2 className={`text-3xl sm:text-5xl font-extrabold text-[var(--foreground,#0f172a)] font-heading mb-4 ${align.text}`}>
          {config.heading || 'MID-SEASON FLASH SALE'}
        </h2>
        <p className={`text-base text-[var(--muted-foreground,#64748b)] mb-8 ${align.text}`}>
          {config.description || 'Up to 50% off select handcrafted leather goods & outerwear.'}
        </p>
        <div className={`flex ${ctaJustify} mb-8 w-full`}>
          <CountdownPrimitive targetDate={config.endsAt} />
        </div>
        <div className={`flex ${ctaJustify} w-full`}>
          <ThemeButton href={config.primaryCtaUrl || '/products'} size="lg" variant="primary">
            {config.primaryCtaText || 'SHOP SALE NOW'}
          </ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function MinimalHeroSection({ config }: { config: BaseSectionConfig & any }) {
  const norm = normalizeNineAlignment(config.headingAlignment || config.contentAlignment || 'center');
  const align = getNineAlignmentClasses(norm);
  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <SectionShell config={config}>
      <div className={`py-8 sm:py-12 max-w-4xl w-full flex flex-col ${align.horizontal} ${align.text} ${
        align.horizontal === 'items-center' ? 'mx-auto' : align.horizontal === 'items-end' ? 'ml-auto' : 'mr-auto'
      }`}>
        <span className={`text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground,#64748b)] mb-4 block ${align.text}`}>
          {config.eyebrow || 'ESSENTIALS COLLECTION'}
        </span>
        <h1 className={`text-4xl sm:text-7xl font-light text-[var(--foreground,#0f172a)] font-heading tracking-tight leading-none mb-6 ${align.text}`}>
          {config.heading || 'TIMELESS MINIMALISM'}
        </h1>
        <p className={`text-lg text-[var(--muted-foreground,#64748b)] max-w-2xl mb-10 font-normal ${align.text}`}>
          {config.description || 'Thoughtfully engineered apparel crafted with zero waste.'}
        </p>
        <div className={`flex ${ctaJustify} w-full`}>
          <ThemeButton href={config.primaryCtaUrl || '/products'} size="lg" variant="outline">
            {config.primaryCtaText || 'DISCOVER LOOKBOOK'}
          </ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function BackgroundSliderHeroSection({ config }: { config: BaseSectionConfig & any }) {
  const norm = normalizeNineAlignment(config.contentPosition || config.headingAlignment || config.contentAlignment || 'center');
  const align = getNineAlignmentClasses(norm);
  const ctaJustify =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  return (
    <div className={`relative w-full h-[600px] overflow-hidden bg-slate-900 text-white flex flex-col ${align.vertical} ${align.horizontal} px-8 sm:px-16 py-12`}>
      <img
        src={config.imageUrl || 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1600&auto=format&fit=crop'}
        alt=""
        className="absolute inset-0 w-full h-full object-cover scale-105 animate-pulse opacity-70"
      />
      <div className={`relative z-10 max-w-3xl w-full flex flex-col ${align.horizontal} ${align.text}`}>
        <h1 className={`text-4xl sm:text-6xl font-extrabold font-heading mb-4 ${align.text}`}>
          {config.heading || 'DYNAMIC LANDSCAPES'}
        </h1>
        <p className={`text-lg text-slate-200 mb-8 ${align.text}`}>
          {config.description || 'Experience our immersive seasonal collections.'}
        </p>
        <div className={`flex items-center gap-4 ${ctaJustify}`}>
          <ThemeButton href={config.primaryCtaUrl || '/products'} variant="accent" size="lg">
            {config.primaryCtaText || 'SHOP COLLECTION'}
          </ThemeButton>
        </div>
      </div>
    </div>
  );
}
