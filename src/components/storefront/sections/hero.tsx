/* eslint-disable @next/next/no-img-element */
import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heading, Lead } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Container } from '@/components/layout/container';

export interface HeroProps {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Premium landing Hero banner section.
 */
export function Hero({ title, subtitle, imageUrl, ctaLabel, ctaHref }: HeroProps) {
  return (
    <div className="relative w-full h-[460px] md:h-[520px] flex items-center justify-center overflow-hidden bg-slate-900 select-none">
      {/* Dim overlay */}
      <div className="absolute inset-0 w-full h-full bg-black/45 z-[1]" />
      <img
        src={imageUrl}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover scale-102 transition-transform duration-[12000ms] animate-pulse"
      />

      <Container className="relative z-10 flex flex-col items-center text-center text-white max-w-2xl px-4">
        <Stack gap="6" align="center">
          <Stack gap="3" align="center">
            <Heading level={1} className="text-white text-3xl md:text-5xl font-extrabold tracking-tight leading-none font-heading drop-shadow-sm">
              {title}
            </Heading>
            <Lead className="text-slate-100 text-sm md:text-lg max-w-lg leading-relaxed drop-shadow-sm font-sans">
              {subtitle}
            </Lead>
          </Stack>

          <Button size="lg" className="cursor-pointer font-semibold shadow-md bg-white text-black hover:bg-slate-100 border border-transparent" asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        </Stack>
      </Container>
    </div>
  );
}
export default Hero;
