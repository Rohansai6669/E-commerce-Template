/* eslint-disable @next/next/no-img-element */
'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/core/utils/cn';
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from 'lucide-react';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';

export interface ProductGalleryProps {
  images: Array<string | { url: string; altText?: string | null; variantId?: string | null }>;
  alt: string;
  className?: string;
}

/**
 * Amazon-Style Interactive Product Gallery.
 * - Left vertical thumbnail strip on desktop with hover & click swap.
 * - Responsive bottom horizontal carousel on mobile devices.
 * - Main viewport with hover magnifying zoom, prev/next arrows, and image counter badge.
 * - Fullscreen modal lightbox for deep inspection.
 * - Robust "No Image Found" fallback for missing or broken media.
 */
export function ProductGallery({ images, alt, className }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isZoomed, setIsZoomed] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [brokenImageIndices, setBrokenImageIndices] = React.useState<Record<number, boolean>>({});

  const validUrls = React.useMemo(() => {
    return images
      .map((img) => (typeof img === 'string' ? img : img.url))
      .filter((url): url is string => Boolean(url && url.trim() !== ''));
  }, [images]);

  // Handle broken image error for an individual index
  const handleImageError = (index: number) => {
    setBrokenImageIndices((prev) => ({ ...prev, [index]: true }));
  };

  const hasImages = validUrls.length > 0;
  const currentImageUrl = hasImages ? validUrls[activeIndex] : null;
  const isCurrentBroken = brokenImageIndices[activeIndex];

  // Carousel navigation
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : validUrls.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev < validUrls.length - 1 ? prev + 1 : 0));
  };

  // Amazon-style mouse move magnifying zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasImages || isCurrentBroken) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <>
      <div className={cn('flex flex-col-reverse md:flex-row gap-4 w-full items-start', className)}>
        {/* Left Thumbnail Strip (Amazon Style: Vertical on Desktop, Horizontal on Mobile) */}
        {validUrls.length > 1 && (
          <div className="flex md:flex-col items-center gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[580px] w-full md:w-20 shrink-0 py-1 scrollbar-thin scrollbar-thumb-slate-200">
            {validUrls.map((url, idx) => {
              const isActive = activeIndex === idx;
              const isBroken = brokenImageIndices[idx];

              return (
                <button
                  key={idx}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  className={cn(
                    'relative h-16 w-16 md:h-18 md:w-18 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 bg-white dark:bg-slate-900',
                    isActive
                      ? 'border-indigo-600 ring-2 ring-indigo-600/30 shadow-md scale-102'
                      : 'border-slate-200 dark:border-slate-800 opacity-70 hover:opacity-100 hover:border-slate-400'
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  {isBroken ? (
                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 text-[10px] font-bold uppercase">
                      No Img
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`${alt} thumbnail ${idx + 1}`}
                      onError={() => handleImageError(idx)}
                      className="h-full w-full object-cover select-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Hero Viewport */}
        <div className="relative flex-1 w-full aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900 shadow-sm group">
          {!hasImages || isCurrentBroken ? (
            <NoImageFallback
              message="No Image Found"
              subMessage="No product image available for this item."
            />
          ) : (
            <div
              className="relative w-full h-full cursor-crosshair overflow-hidden"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* Base Image */}
              <img
                src={currentImageUrl!}
                alt={`${alt} - View ${activeIndex + 1}`}
                onError={() => handleImageError(activeIndex)}
                className={cn(
                  'w-full h-full object-cover select-none transition-transform duration-200',
                  isZoomed && 'opacity-0'
                )}
              />

              {/* High-Resolution Zoom Surface (Amazon Loupe Pan) */}
              {isZoomed && currentImageUrl && !isCurrentBroken && (
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-150"
                  style={{
                    backgroundImage: `url(${currentImageUrl})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '220%',
                    backgroundRepeat: 'no-repeat',
                  }}
                />
              )}

              {/* Prev / Next Navigation Arrows */}
              {validUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter & Fullscreen Lightbox Button */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
                {validUrls.length > 1 ? (
                  <span className="rounded-full bg-slate-900/80 text-white backdrop-blur-md px-3 py-1 text-xs font-mono font-bold tracking-wider shadow-sm border border-white/10 pointer-events-auto">
                    {activeIndex + 1} / {validUrls.length}
                  </span>
                ) : <span />}

                <button
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                  aria-label="View Fullscreen Lightbox"
                  className="h-9 w-9 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-indigo-600 hover:bg-white transition-all pointer-events-auto cursor-pointer"
                  title="Expand image"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>

              {/* Hover Zoom Hint */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 text-white backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                  <ZoomIn className="w-3 h-3 text-slate-300" />
                  Hover to zoom
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && hasImages && !isCurrentBroken && (
        <div
          className="fixed inset-0 z-[2000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 h-11 w-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImageUrl!}
              alt={`${alt} - View ${activeIndex + 1}`}
              className="max-h-[85vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />

            {validUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-7 h-7" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ProductGallery;
