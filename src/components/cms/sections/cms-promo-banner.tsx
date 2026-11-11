'use client';

import React from 'react';
import { PromoBannerConfig } from '@/types/cms';
import Link from 'next/link';
import { Tag, ArrowRight } from 'lucide-react';

export function CmsPromoBanner({ config }: { config: PromoBannerConfig }) {
  if (!config.enabled) return null;

  return (
    <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto">
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 max-w-xl z-10">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-indigo-400 font-semibold text-xs uppercase tracking-widest">
            <Tag className="h-4 w-4" />
            <span>{config.badgeText || 'SPECIAL OFFER'}</span>
          </div>

          {config.heading && (
            <h3 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-white">
              {config.heading}
            </h3>
          )}

          {config.description && (
            <p className="text-xs sm:text-sm text-slate-300">
              {config.description}
            </p>
          )}

          {config.promoCode && (
            <div className="pt-2">
              <span className="inline-block rounded-lg bg-indigo-500/20 border border-indigo-400/40 px-3 py-1.5 font-mono text-xs text-indigo-200 font-bold uppercase tracking-widest">
                USE CODE: {config.promoCode}
              </span>
            </div>
          )}
        </div>

        {config.primaryCtaText && config.primaryCtaUrl && (
          <div className="z-10 shrink-0">
            <Link
              href={config.primaryCtaUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 shadow-lg hover:bg-slate-100 transition-all hover:scale-105"
            >
              {config.primaryCtaText}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
