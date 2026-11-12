/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Link from 'next/link';

export interface LogoProps {
  type?: 'text' | 'image';
  text?: string;
  font?: 'heading' | 'sans' | 'serif' | 'mono';
  fontSize?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black';
  letterSpacing?: 'normal' | 'wide' | 'widest' | 'ultra-wide';
  color?: string;
  imageUrl?: string;
  imageHeight?: number;
  className?: string;
}

const FONT_MAP = {
  heading: 'font-heading',
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

const SIZE_MAP = {
  sm: 'text-xs sm:text-sm',
  base: 'text-sm sm:text-base',
  lg: 'text-base sm:text-lg',
  xl: 'text-lg sm:text-xl',
  '2xl': 'text-xl sm:text-2xl',
  '3xl': 'text-2xl sm:text-3xl',
};

const WEIGHT_MAP = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
};

const SPACING_MAP = {
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  widest: 'tracking-widest',
  'ultra-wide': 'tracking-[0.2em]',
};

/**
 * Logomark branding element with complete customizable appearance.
 */
export function Logo({
  type = 'text',
  text = 'LEXIDO',
  font = 'heading',
  fontSize = '2xl',
  fontWeight = 'black',
  letterSpacing = 'ultra-wide',
  color,
  imageUrl,
  imageHeight = 32,
  className = '',
}: LogoProps) {
  if (type === 'image' && imageUrl) {
    return (
      <Link href="/" className={`flex items-center gap-2 select-none group cursor-pointer ${className}`}>
        <img
          src={imageUrl}
          alt={text || 'Store Logo'}
          style={{ height: `${imageHeight}px`, width: 'auto' }}
          className="object-contain"
        />
      </Link>
    );
  }

  const fontClass = FONT_MAP[font] || 'font-heading';
  const sizeClass = SIZE_MAP[fontSize] || 'text-2xl';
  const weightClass = WEIGHT_MAP[fontWeight] || 'font-black';
  const spacingClass = SPACING_MAP[letterSpacing] || 'tracking-[0.2em]';

  return (
    <Link href="/" className={`flex items-center gap-2 select-none group cursor-pointer ${className}`}>
      <span
        style={color ? { color } : undefined}
        className={`${fontClass} ${sizeClass} ${weightClass} ${spacingClass} uppercase ${
          color ? '' : 'text-foreground'
        } transition-colors leading-none`}
      >
        {text || 'LEXIDO'}
      </span>
    </Link>
  );
}

export default Logo;
