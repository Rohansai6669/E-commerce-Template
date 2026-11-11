import React from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  heading?: string;
  description?: string;
  alignment?: 'left' | 'center' | 'right';
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

  const alignClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[alignment];

  return (
    <div className={`flex flex-col mb-4 sm:mb-6 max-w-3xl ${alignment === 'center' ? 'mx-auto' : ''} ${alignClass} ${className}`}>
      {eyebrow && (
        <span className="text-xs font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-2 inline-block">
          {eyebrow}
        </span>
      )}
      {heading && (
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground font-heading leading-none uppercase">
          {heading}
        </h2>
      )}
      {description && (
        <p className="mt-3 text-sm sm:text-base text-muted-foreground font-normal leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
