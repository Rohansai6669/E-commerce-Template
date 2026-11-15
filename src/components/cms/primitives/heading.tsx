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

  const raw = String(alignment || 'center').toLowerCase().trim();
  const norm = normalizeNineAlignment(alignment);
  const alignInfo = getNineAlignmentClasses(norm);

  const isRight =
    raw === 'right' ||
    raw.includes('-right') ||
    raw.endsWith('right') ||
    alignInfo.horizontal === 'items-end' ||
    alignInfo.text === 'text-right';

  const isCenter =
    !isRight &&
    (raw === 'center' ||
      raw.includes('center') ||
      raw === 'middle' ||
      alignInfo.horizontal === 'items-center' ||
      alignInfo.text === 'text-center');

  const itemsAlign = isCenter ? 'items-center' : isRight ? 'items-end' : 'items-start';
  const textAlign = isCenter ? 'text-center' : isRight ? 'text-right' : 'text-left';
  const descMargin = isCenter ? 'mx-auto' : isRight ? 'ml-auto' : 'mr-auto';

  return (
    <div
      className={`w-full flex flex-col mb-4 sm:mb-6 ${itemsAlign} ${textAlign} ${className}`}
    >
      {eyebrow && (
        <span
          className={`text-[10px] sm:text-xs font-semibold tracking-[0.2em] sm:tracking-[0.25em] uppercase text-muted-foreground mb-1.5 sm:mb-2 inline-block anim-child-1 ${textAlign}`}
        >
          {eyebrow}
        </span>
      )}
      {heading && (
        <h2
          className={`w-full text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold sm:font-black tracking-tight text-foreground font-heading leading-tight uppercase anim-child-2 ${textAlign}`}
        >
          {heading}
        </h2>
      )}
      {description && (
        <p
          className={`mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-muted-foreground font-normal leading-relaxed anim-child-3 max-w-2xl ${descMargin} ${textAlign}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionHeading;
