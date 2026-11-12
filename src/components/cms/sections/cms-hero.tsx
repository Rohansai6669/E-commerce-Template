'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HeroConfig, HeroSlide, DescriptionLayout } from '@/types/cms';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Play, Quote } from 'lucide-react';
import { normalizeNineAlignment, getNineAlignmentClasses } from '@/components/ui/nine-alignment-matrix';

export function CmsHero({ config }: { config: HeroConfig }) {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  if (!config.enabled) return null;

  // Determine slides list
  const slidesList: HeroSlide[] =
    config.layoutMode === 'CAROUSEL' && config.slides && config.slides.length > 0
      ? config.slides
      : [
          {
            id: 'fallback-slide',
            eyebrow: config.eyebrow,
            heading: config.heading || 'WELCOME TO OUR STORE',
            subTitle: config.subTitle,
            description: config.description,
            primaryCtaText: config.primaryCtaText,
            primaryCtaUrl: config.primaryCtaUrl,
            secondaryCtaText: config.secondaryCtaText,
            secondaryCtaUrl: config.secondaryCtaUrl,
            mediaType: config.videoUrl ? 'video' : 'image',
            mediaUrl: config.videoUrl || config.desktopImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
            posterImage: config.posterImage,
            overlayOpacity: config.overlayOpacity ?? 0.35,
            contentPosition: config.contentPosition || 'center',
          },
        ];

  const activeSlide = slidesList[currentSlideIdx] || slidesList[0];

  // Carousel autoplay timer
  const nextSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev + 1) % slidesList.length);
  }, [slidesList.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlideIdx((prev) => (prev - 1 + slidesList.length) % slidesList.length);
  }, [slidesList.length]);

  useEffect(() => {
    if (config.layoutMode !== 'CAROUSEL' || !config.autoplay || slidesList.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, config.autoplayInterval || 5000);

    return () => clearInterval(interval);
  }, [config.layoutMode, config.autoplay, config.autoplayInterval, slidesList.length, nextSlide]);

  const heightClasses = {
    auto: 'min-h-[380px]',
    small: 'min-h-[420px]',
    medium: 'min-h-[520px]',
    large: 'min-h-[600px]',
    screen: 'min-h-[85vh]',
  }[config.heroHeight || 'medium'];

  const currentPos = normalizeNineAlignment(activeSlide.contentPosition || config.contentPosition || 'center');
  const align = getNineAlignmentClasses(currentPos);
  const ctaAlignClass =
    align.horizontal === 'items-start'
      ? 'justify-start'
      : align.horizontal === 'items-end'
      ? 'justify-end'
      : 'justify-center';

  const renderDescriptionLayout = (descLayout: DescriptionLayout = 'boxed-glass') => {
    if (!activeSlide.description && !activeSlide.subTitle) return null;

    if (descLayout === 'boxed-glass') {
      return (
        <div className="rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md p-6 max-w-2xl space-y-2 shadow-2xl">
          {activeSlide.subTitle && (
            <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
              {activeSlide.subTitle}
            </p>
          )}
          {activeSlide.description && (
            <p className="text-xs sm:text-sm text-slate-300 opacity-90">
              {activeSlide.description}
            </p>
          )}
        </div>
      );
    }

    if (descLayout === 'quote') {
      return (
        <div className="border-l-4 border-primary pl-4 max-w-xl text-left py-1 space-y-1">
          <Quote className="h-4 w-4 text-white/70" />
          {activeSlide.subTitle && (
            <p className="text-sm sm:text-base text-white font-serif italic">
              &ldquo;{activeSlide.subTitle}&rdquo;
            </p>
          )}
        </div>
      );
    }

    if (descLayout === 'badge-pill') {
      return (
        <div className="inline-block rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-5 py-2 text-xs sm:text-sm text-white font-medium">
          {activeSlide.subTitle || activeSlide.description}
        </div>
      );
    }

    return (
      <div className="max-w-2xl space-y-2">
        {activeSlide.subTitle && (
          <p className="text-sm sm:text-lg text-slate-200 font-medium leading-relaxed">
            {activeSlide.subTitle}
          </p>
        )}
        {activeSlide.description && (
          <p className="text-xs sm:text-sm text-slate-300 opacity-90">
            {activeSlide.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <section 
      className={`relative w-full flex flex-col ${heightClasses} ${align.vertical} ${align.horizontal} ${align.text} p-6 sm:p-12 md:p-16 overflow-hidden text-white select-none`}
      style={{ backgroundColor: config.backgroundColor || '#0f172a' }}
    >
      {/* Media Layer (Image or Video) */}
      {activeSlide.mediaType === 'video' ? (
        <video
          key={activeSlide.id}
          autoPlay
          loop
          muted
          playsInline
          poster={activeSlide.posterImage}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
        >
          <source src={activeSlide.mediaUrl} type="video/mp4" />
        </video>
      ) : (
        <div
          key={activeSlide.id}
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105"
          style={{ backgroundImage: `url('${activeSlide.mediaUrl}')` }}
        />
      )}

      {/* Customizable Overlay Opacity */}
      <div
        className="absolute inset-0 bg-black transition-opacity duration-700"
        style={{ opacity: activeSlide.overlayOpacity ?? config.overlayOpacity ?? 0.35 }}
      />

      {/* Content Box */}
      <div className={`relative z-10 max-w-3xl space-y-5 animate-in fade-in slide-in-from-bottom-6 duration-700 flex flex-col ${align.horizontal} ${align.text}`}>
        {activeSlide.eyebrow && (
          <span className="inline-block rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 text-[11px] font-bold tracking-widest uppercase text-white">
            {activeSlide.eyebrow}
          </span>
        )}

        {activeSlide.heading && (
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white uppercase leading-tight drop-shadow-md">
            {activeSlide.heading}
          </h1>
        )}

        {/* Description Layout */}
        {renderDescriptionLayout(config.descriptionLayout)}

        {/* CTA Buttons */}
        <div className={`pt-2 flex flex-wrap gap-4 w-full ${ctaAlignClass}`}>
          {activeSlide.primaryCtaText && activeSlide.primaryCtaUrl && (
            <Link
              href={activeSlide.primaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 shadow-2xl hover:bg-slate-100 transition-all hover:scale-105"
            >
              {activeSlide.primaryCtaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {activeSlide.secondaryCtaText && activeSlide.secondaryCtaUrl && (
            <Link
              href={activeSlide.secondaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-black/30 backdrop-blur-md px-7 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-white/20 transition-all"
            >
              {activeSlide.secondaryCtaText}
            </Link>
          )}
        </div>
      </div>

      {/* Carousel Navigation Arrows */}
      {config.layoutMode === 'CAROUSEL' && slidesList.length > 1 && config.showNavigationArrows !== false && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-11 w-11 rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-slate-900 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Carousel Pagination Dots */}
      {config.layoutMode === 'CAROUSEL' && slidesList.length > 1 && config.showPaginationDots !== false && (
        <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center gap-2">
          {slidesList.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              className={`h-2.5 transition-all rounded-full cursor-pointer ${
                idx === currentSlideIdx ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
