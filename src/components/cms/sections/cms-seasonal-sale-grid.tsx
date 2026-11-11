'use client';

import React, { useState, useEffect } from 'react';
import { ConfigurableProductCard, ProductData } from '@/components/commerce/configurable-product-card';
import { Sparkles, Clock, Flame, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export interface SeasonalSaleCampaignProps {
  id: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  startsAt: Date | string;
  endsAt: Date | string;
  bannerUrl?: string;
  badgeLabel?: string;
  products: ProductData[];
}

interface CmsSeasonalSaleGridProps {
  campaign: SeasonalSaleCampaignProps;
}

export function CmsSeasonalSaleGrid({ campaign }: CmsSeasonalSaleGridProps) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetTime = new Date(campaign.endsAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = Math.max(0, targetTime - now);

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [campaign.endsAt]);

  const discountText = campaign.discountType === 'percentage' ? `${campaign.discountValue}% OFF` : `₹${campaign.discountValue} OFF`;

  return (
    <section className="w-full py-8 sm:py-12 bg-slate-50/80 text-slate-900 overflow-hidden my-6 rounded-2xl border border-slate-200 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6 sm:gap-8">
        {/* Campaign Banner Header */}
        <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 border border-amber-400/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden shadow-xl">
          {/* Subtle Background Glow */}
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 backdrop-blur-md border border-amber-300/40 rounded-full text-amber-200 text-xs font-bold uppercase tracking-wider self-start">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {campaign.badgeLabel || `${campaign.name} • ${discountText}`}
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-heading flex items-center gap-3">
              {campaign.name}
            </h2>

            <p className="text-sm text-amber-100/90 leading-relaxed font-sans">
              {campaign.description}
            </p>
          </div>

          {/* Countdown Clock */}
          <div className="flex flex-col items-center md:items-end gap-2 z-10 self-stretch justify-center">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-amber-200 tracking-wider">
              <Clock className="w-4 h-4 text-amber-300 animate-pulse" /> Sale Ends In:
            </div>

            <div className="flex items-center gap-2 text-center select-none">
              <div className="flex flex-col p-2 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/80 min-w-[54px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">{timeLeft.days}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Days</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="flex flex-col p-2 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/80 min-w-[54px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="flex flex-col p-2 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/80 min-w-[54px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Mins</span>
              </div>
              <span className="text-amber-400 font-bold text-lg">:</span>
              <div className="flex flex-col p-2 bg-slate-950/90 backdrop-blur-md rounded-xl border border-slate-700/80 min-w-[54px] shadow-sm">
                <span className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] font-bold text-rose-400 uppercase">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {campaign.products.map((product) => (
            <div key={product.id} className="relative group">
              {/* Product Badge overlay */}
              <div className="absolute top-3 left-3 z-20 pointer-events-none">
                <span className="px-2.5 py-1 bg-amber-500 text-slate-950 font-black text-[10px] uppercase rounded-md shadow-md tracking-wider flex items-center gap-1 border border-amber-300">
                  <Flame className="w-3 h-3 text-slate-950 fill-slate-950" />
                  {product.badges?.[0] || `${discountText}`}
                </span>
              </div>

              <ConfigurableProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Bottom Callout Link */}
        <div className="flex justify-end pt-2 border-t border-slate-200">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-500 uppercase tracking-wider transition group"
          >
            Explore All {campaign.name} Items
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CmsSeasonalSaleGrid;
