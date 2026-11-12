import React from 'react';
import { normalizeNineAlignment, getNineAlignmentClasses, type NineAlignment } from '@/components/ui/nine-alignment-matrix';

interface SectionHeadingProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  alignment?: 'left' | 'center' | 'right' | NineAlignment | string;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  heading,
  description,
  alignment = 'center',
  className = '',
}: SectionHeadingProps) {
  if (!eyebrow && !heading && !description) return null;

  const norm = normalizeNineAlignment(alignment);
  const alignInfo = getNineAlignmentClasses(norm);

  const containerMargin =
    alignInfo.horizontal === 'center'
      ? 'mx-auto'
      : alignInfo.horizontal === 'right'
      ? 'ml-auto'
      : 'mr-auto';

  return (
    <div
      className={`flex flex-col mb-4 sm:mb-6 max-w-3xl ${containerMargin} ${alignInfo.horizontal} ${alignInfo.text} ${className}`}
    >
      {eyebrow && (
        <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-muted-foreground mb-1.5 sm:mb-2 inline-block anim-child-1">
          {eyebrow}
        </span>
      )}
      {heading && (
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold sm:font-black tracking-tight text-foreground font-heading leading-tight sm:leading-none uppercase anim-child-2">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground font-normal leading-relaxed anim-child-3">
          {description}
        </p>
      )}
    </div>
  );
}
