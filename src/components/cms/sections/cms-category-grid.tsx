'use client';

import React from 'react';
import { CategoryGridConfig } from '@/types/cms';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function CmsCategoryGrid({ config }: { config: CategoryGridConfig }) {
  if (!config.enabled || !config.items || config.items.length === 0) return null;

  const sortedItems = [...config.items]
    .filter((i) => i.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  const aspectClasses = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    tall: 'aspect-[4/5]',
    landscape: 'aspect-[4/3]',
    wide: 'aspect-[16/9]',
  }[config.aspectRatio || 'portrait'] || 'aspect-[3/4]';

  const colCount = config.columnsDesktop || (sortedItems.length <= 2 ? 2 : 4);
  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[colCount as 2 | 3 | 4 | 6] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';

  const sectionRadiusPx = config.cardRadiusPx;
  const radiusClass = {
    none: 'rounded-none',
    small: 'rounded-lg',
    medium: 'rounded-2xl',
    large: 'rounded-3xl',
    xlarge: 'rounded-[32px]',
    full: 'rounded-full',
  }[config.cardRadius as string] || (sectionRadiusPx !== undefined ? '' : 'rounded-2xl');

  const shadowClass = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  }[config.cardShadow || 'md'] || 'shadow-md';

  const hoverScaleClass = {
    zoom: 'group-hover:scale-105',
    'zoom-lg': 'group-hover:scale-110',
    lift: 'group-hover:scale-102 hover:-translate-y-2',
    glow: 'group-hover:ring-2 group-hover:ring-indigo-500',
    none: '',
  }[config.cardHoverEffect || 'zoom'] || 'group-hover:scale-105';

  const gapClass = {
    small: 'gap-4',
    medium: 'gap-6 sm:gap-8',
    large: 'gap-8 sm:gap-10',
    flush: 'gap-1',
  }[config.cardGap || 'medium'] || 'gap-6 sm:gap-8';

  const sectionStyle: React.CSSProperties = {};
  if (config.backgroundColor) {
    sectionStyle.backgroundColor = config.backgroundColor;
  }
  if (config.backgroundImageUrl) {
    sectionStyle.backgroundImage = `url('${config.backgroundImageUrl}')`;
    sectionStyle.backgroundSize = 'cover';
    sectionStyle.backgroundPosition = 'center';
  }

  return (
    <section 
      className="py-12 sm:py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-8 rounded-2xl transition-colors"
      style={sectionStyle}
    >
      {/* Header */}
      {(config.heading || config.eyebrow) && (
        <div className={`text-${config.headingAlignment || 'center'} space-y-2`}>
          {config.eyebrow && (
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
              {config.eyebrow}
            </p>
          )}
          {config.heading && (
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight uppercase text-foreground">
              {config.heading}
            </h2>
          )}
        </div>
      )}

      {/* Grid */}
      <div className={`grid ${gridColsClass} ${gapClass}`}>
        {sortedItems.map((item) => {
          const cardRadiusPx = item.cardRadiusPx ?? sectionRadiusPx;
          const cardRadiusStyle = cardRadiusPx !== undefined ? { borderRadius: `${cardRadiusPx}px` } : {};
          return (
            <Link
              key={item.id}
              href={item.link}
              className={`group relative overflow-hidden ${radiusClass} ${shadowClass} ${aspectClasses} bg-muted block transition-all duration-500`}
              style={cardRadiusStyle}
            >
              {/* Background Image */}
              <div
                className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 ${hoverScaleClass}`}
                style={{ backgroundImage: `url('${item.image}')` }}
              />

              {/* Dark Overlay */}
              <div
                className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300"
                style={{ opacity: item.overlayOpacity ?? config.cardOverlayOpacity ?? 0.3 }}
              />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight uppercase group-hover:translate-x-1 transition-transform">
                      {item.title}
                    </h3>
                    {item.subtitle && (
                      <p className="text-xs text-slate-200 mt-1 opacity-90">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-slate-900 transition-all">
                    <ArrowUpRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
