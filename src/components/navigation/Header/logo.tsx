import * as React from 'react';
import Link from 'next/link';
import { Heading } from '@/components/ui/typography';

/**
 * Logomark branding element.
 */
export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 select-none group cursor-pointer">
      <span className="font-black text-2xl tracking-[0.18em] uppercase text-foreground transition-colors font-heading leading-none">
        LEXIDO
      </span>
    </Link>
  );
}
export default Logo;
