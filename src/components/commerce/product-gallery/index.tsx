'use client';
/* eslint-disable @next/next/no-img-element */

import * as React from 'react';
import { cn } from '@/core/utils/cn';
import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from 'lucide-react';
import { NoImageFallback } from '@/components/commerce/no-image-fallback';

export interface ProductGalleryProps {
  images: Array<string | { url: string; altText?: string | null; variantId?: string | null }>;
  alt: string;
  className?: string;
}

/**
 * Luxury Editorial Product Gallery (Lexido Monochrome Aesthetic).
 * - Vertical thumbnail rail on desktop with hover & click swap.
 * - Horizontal thumbnail rail on mobile.
 * - Centered object-contain viewport ensuring whole garments & accessories display without cropping.
 * - Smooth cursor-focused magnifying scale that does not pixelate or hide the base image.
 * - Fullscreen modal lightbox for full-resolution inspection.
 * - Fallback for missing/broken assets.
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

  // Cursor-centered zoom calculations
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasImages || isCurrentBroken) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // Clamping coordinates slightly to prevent edge flicker
    const rawX = ((e.clientX - rect.left) / rect.width) * 100;
    const rawY = ((e.clientY - rect.top) / rect.height) * 100;
    const x = Math.max(5, Math.min(95, rawX));
    const y = Math.max(5, Math.min(95, rawY));
    setZoomPos({ x, y });
  };

  return (
    <>
      <div className={cn('flex flex-col-reverse md:flex-row gap-4 w-full items-start select-none', className)}>
        {/* Left Thumbnail Strip */}
        {validUrls.length > 1 && (
          <div className="flex md:flex-col items-center gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[580px] w-full md:w-20 shrink-0 py-1 scrollbar-none">
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
                    'relative h-16 w-16 md:h-20 md:w-20 shrink-0 rounded-none overflow-hidden border transition-all duration-150 cursor-pointer focus:outline-none bg-muted p-1 flex items-center justify-center',
                    isActive
                      ? 'border-foreground ring-1 ring-foreground shadow-sm'
                      : 'border-border opacity-60 hover:opacity-100 hover:border-foreground/50'
                  )}
                  aria-label={`View image ${idx + 1}`}
                >
                  {isBroken ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-widest font-mono">
                      No Img
                    </div>
                  ) : (
                    <img
                      src={url}
                      alt={`${alt} thumbnail ${idx + 1}`}
                      onError={() => handleImageError(idx)}
                      className="h-full w-full object-contain select-none"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Main Hero Viewport */}
        <div className="relative flex-1 w-full aspect-[4/5] sm:aspect-[1/1] md:aspect-[4/5] max-h-[640px] rounded-none overflow-hidden border border-border bg-background group">
          {!hasImages || isCurrentBroken ? (
            <NoImageFallback
              message="No Image Found"
              subMessage="No product image available for this item."
            />
          ) : (
            <div
              className="relative w-full h-full cursor-zoom-in overflow-hidden flex items-center justify-center"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setIsLightboxOpen(true)}
            >
              {/* Main Base Image: Object-contain with smooth transformOrigin scaling */}
              <img
                src={currentImageUrl!}
                alt={`${alt} - View ${activeIndex + 1}`}
                onError={() => handleImageError(activeIndex)}
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZoomed ? 'scale(1.75)' : 'scale(1)',
                }}
                className="w-full h-full object-contain p-4 sm:p-6 md:p-8 select-none transition-transform duration-150 ease-out will-change-transform"
              />

              {/* Prev / Next Navigation Arrows */}
              {validUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous Image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-none bg-black/80 hover:bg-black text-white border border-neutral-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next Image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-none bg-black/80 hover:bg-black text-white border border-neutral-800 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-20"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Image Counter & Fullscreen Lightbox Button */}
              <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
                {validUrls.length > 1 ? (
                  <span className="bg-black/90 text-white px-2.5 py-1 text-[11px] font-mono font-bold tracking-widest uppercase border border-neutral-800 shadow-sm pointer-events-auto">
                    {activeIndex + 1} / {validUrls.length}
                  </span>
                ) : <span />}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  aria-label="View Fullscreen Lightbox"
                  className="h-9 w-9 rounded-none bg-black/90 text-white hover:bg-white hover:text-black border border-neutral-800 shadow-sm flex items-center justify-center transition-all pointer-events-auto cursor-pointer"
                  title="Expand image"
                >
                  <Expand className="h-4 w-4" />
                </button>
              </div>

              {/* Hover Zoom Hint */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                <span className="inline-flex items-center gap-1.5 bg-black/80 text-white px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest border border-white/10">
                  <ZoomIn className="w-3 h-3 text-neutral-300" />
                  Click to Expand
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && hasImages && !isCurrentBroken && (
        <div
          className="fixed inset-0 z-[2000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-5 right-5 h-11 w-11 rounded-none bg-neutral-900 border border-neutral-700 hover:bg-white hover:text-black text-white flex items-center justify-center transition-colors cursor-pointer z-50"
            aria-label="Close Lightbox"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImageUrl!}
              alt={`${alt} - View ${activeIndex + 1}`}
              className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl p-2"
            />

            {validUrls.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-none bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-7 h-7" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-12 w-12 rounded-none bg-black/80 hover:bg-white hover:text-black text-white border border-neutral-700 flex items-center justify-center cursor-pointer transition-colors"
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
