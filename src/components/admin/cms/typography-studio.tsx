'use client';

import React from 'react';
import { SiteDesignTokens } from '@/types/cms';
import { CURATED_FONTS, FontOption } from '@/lib/cms/typography-fonts';
import { Type, Sparkles, Eye, SlidersHorizontal, CaseSensitive, BookOpen, Layers } from 'lucide-react';

interface TypographyStudioProps {
  tokens: SiteDesignTokens;
  onChange: (key: keyof SiteDesignTokens, value: string) => void;
}

export function TypographyStudio({ tokens, onChange }: TypographyStudioProps) {
  // Current values with robust fallbacks
  const primaryFontVal = tokens.headingFont || tokens.primaryFont || "'Clash Display', sans-serif";
  const paragraphFontVal = tokens.paragraphFont || tokens.primaryFont || "'Plus Jakarta Sans', sans-serif";
  const accentFontVal = tokens.accentFont || "'Cinzel', serif";
  const monoFontVal = tokens.monoFont || "'JetBrains Mono', monospace";

  // Check if selected font is one of the curated presets or custom
  const isCustomPrimary = !CURATED_FONTS.some((f) => f.family === primaryFontVal);
  const isCustomPara = !CURATED_FONTS.some((f) => f.family === paragraphFontVal);
  const isCustomAccent = !CURATED_FONTS.some((f) => f.family === accentFontVal);
  const isCustomMono = !CURATED_FONTS.some((f) => f.family === monoFontVal);

  const handlePrimaryFontSelect = (family: string) => {
    onChange('primaryFont', family);
    onChange('headingFont', family);
  };

  const categories = [
    'Modern Streetwear & Display',
    'Swiss & Clean Sans',
    'Luxury Editorial Serif',
    'Technical Monospace',
  ] as const;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold uppercase tracking-tight text-foreground font-heading">
              Typography & Font Architecture
            </h3>
            <p className="text-xs text-muted-foreground">
              Select curated luxury, streetwear & editorial typefaces for primary headers, paragraphs, and accents.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2.5 py-1 rounded-md self-start sm:self-auto font-bold uppercase tracking-wider">
          Live Real-Time Engine
        </span>
      </div>

      {/* Font Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. PRIMARY / HEADING FONT */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                Primary / Heading
              </label>
              <span className="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold px-1.5 py-0.5 rounded">
                Display
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              Main hero titles, product names, section banners, and bold display statements.
            </p>
          </div>

          <div className="space-y-2">
            <select
              value={isCustomPrimary ? 'custom' : primaryFontVal}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  handlePrimaryFontSelect(e.target.value);
                }
              }}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <optgroup label="✨ Featured Typography">
                <option value="'Clash Display', -apple-system, BlinkMacSystemFont, sans-serif">
                  Clash Display (Streetwear / Luxury)
                </option>
                <option value="'Helvetica Now Display', 'Helvetica Now', 'Helvetica Neue', Helvetica, Arial, sans-serif">
                  Helvetica Now Display (Swiss Modernist)
                </option>
              </optgroup>

              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {CURATED_FONTS.filter((f) => f.category === cat).map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name} — {f.badge}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">Custom Font Family String...</option>
            </select>

            {isCustomPrimary && (
              <input
                type="text"
                placeholder="e.g. 'Cabinet Grotesk', sans-serif"
                value={primaryFontVal}
                onChange={(e) => handlePrimaryFontSelect(e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono text-foreground"
              />
            )}
          </div>
        </div>

        {/* 2. PARAGRAPH / BODY FONT */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                Paragraph / Body
              </label>
              <span className="text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold px-1.5 py-0.5 rounded">
                Para
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              Product descriptions, storytelling, policy prose, reviews, and editorial paragraphs.
            </p>
          </div>

          <div className="space-y-2">
            <select
              value={isCustomPara ? 'custom' : paragraphFontVal}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  onChange('paragraphFont', e.target.value);
                }
              }}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <optgroup label="✨ Featured Body Typography">
                <option value="'Helvetica Now Display', 'Helvetica Now', 'Helvetica Neue', Helvetica, Arial, sans-serif">
                  Helvetica Now Display (Ultra Clean)
                </option>
                <option value="'Plus Jakarta Sans', sans-serif">
                  Plus Jakarta Sans (Modern Geometric)
                </option>
                <option value="'Inter', sans-serif">
                  Inter (Precision Neutral)
                </option>
                <option value="'Clash Display', -apple-system, BlinkMacSystemFont, sans-serif">
                  Clash Display (Bold Editorial)
                </option>
              </optgroup>

              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {CURATED_FONTS.filter((f) => f.category === cat).map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name} — {f.badge}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">Custom Font Family String...</option>
            </select>

            {isCustomPara && (
              <input
                type="text"
                placeholder="e.g. 'Plus Jakarta Sans', sans-serif"
                value={paragraphFontVal}
                onChange={(e) => onChange('paragraphFont', e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono text-foreground"
              />
            )}
          </div>
        </div>

        {/* 3. ACCENT / EDITORIAL FONT */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                Accent / Editorial
              </label>
              <span className="text-[10px] font-mono bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold px-1.5 py-0.5 rounded">
                Serif / Flair
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              Luxury category eyebrows, boutique signatures, quotes, and limited badges.
            </p>
          </div>

          <div className="space-y-2">
            <select
              value={isCustomAccent ? 'custom' : accentFontVal}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  onChange('accentFont', e.target.value);
                }
              }}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <optgroup label="✨ Featured Accent Typography">
                <option value="'Cinzel', 'Times New Roman', serif">
                  Cinzel (Roman Classical Luxury)
                </option>
                <option value="'Playfair Display', Georgia, serif">
                  Playfair Display (Vogue Editorial)
                </option>
                <option value="'Italiana', Didot, serif">
                  Italiana (Haute Couture)
                </option>
                <option value="'Clash Display', -apple-system, BlinkMacSystemFont, sans-serif">
                  Clash Display (Bold Statement)
                </option>
                <option value="'Syne', sans-serif">
                  Syne (Avant-Garde Boutique)
                </option>
              </optgroup>

              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {CURATED_FONTS.filter((f) => f.category === cat).map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name} — {f.badge}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">Custom Font Family String...</option>
            </select>

            {isCustomAccent && (
              <input
                type="text"
                placeholder="e.g. 'Cinzel', serif"
                value={accentFontVal}
                onChange={(e) => onChange('accentFont', e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono text-foreground"
              />
            )}
          </div>
        </div>

        {/* 4. MONOSPACE / TECHNICAL FONT */}
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wide text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                Technical / Mono
              </label>
              <span className="text-[10px] font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded">
                Specs & Price
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-2">
              SKU codes, prices, inventory counters, audit timestamps, and technical spec labels.
            </p>
          </div>

          <div className="space-y-2">
            <select
              value={isCustomMono ? 'custom' : monoFontVal}
              onChange={(e) => {
                if (e.target.value !== 'custom') {
                  onChange('monoFont', e.target.value);
                }
              }}
              className="w-full rounded-xl border border-input bg-background p-2.5 text-xs font-bold text-foreground cursor-pointer focus:ring-1 focus:ring-primary"
            >
              <optgroup label="✨ Featured Monospace Typography">
                <option value="'JetBrains Mono', monospace">
                  JetBrains Mono (Technical Minimalist)
                </option>
                <option value="'Space Grotesk', sans-serif">
                  Space Grotesk (Cyber Streetwear)
                </option>
                <option value="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace">
                  System Standard Monospace
                </option>
              </optgroup>

              {categories.map((cat) => (
                <optgroup key={cat} label={`── ${cat} ──`}>
                  {CURATED_FONTS.filter((f) => f.category === cat).map((f) => (
                    <option key={f.id} value={f.family}>
                      {f.name} — {f.badge}
                    </option>
                  ))}
                </optgroup>
              ))}
              <option value="custom">Custom Font Family String...</option>
            </select>

            {isCustomMono && (
              <input
                type="text"
                placeholder="e.g. 'JetBrains Mono', monospace"
                value={monoFontVal}
                onChange={(e) => onChange('monoFont', e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2 text-xs font-mono text-foreground"
              />
            )}
          </div>
        </div>
      </div>

      {/* Typography Fine-Tuning Controls */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl border border-border bg-card">
        {/* Tracking */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
            Heading Tracking
          </label>
          <select
            value={tokens.headingTracking || 'tighter'}
            onChange={(e) => onChange('headingTracking', e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-2 text-xs text-foreground cursor-pointer"
          >
            <option value="tighter">Tighter (-0.05em, Streetwear)</option>
            <option value="tight">Tight (-0.025em)</option>
            <option value="normal">Normal (0em)</option>
            <option value="wide">Wide (0.05em, Luxury)</option>
            <option value="widest">Widest (0.10em, Haute)</option>
          </select>
        </div>

        {/* Text Transform */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <CaseSensitive className="w-3.5 h-3.5 text-muted-foreground" />
            Heading Transform
          </label>
          <select
            value={tokens.headingTransform || 'uppercase'}
            onChange={(e) => onChange('headingTransform', e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-2 text-xs text-foreground cursor-pointer"
          >
            <option value="uppercase">UPPERCASE (All Caps)</option>
            <option value="capitalize">Capitalize (Title Case)</option>
            <option value="none">None (As Typed)</option>
          </select>
        </div>

        {/* Font Weight */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-muted-foreground" />
            Heading Weight
          </label>
          <select
            value={tokens.headingWeight || '800'}
            onChange={(e) => onChange('headingWeight', e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-2 text-xs text-foreground cursor-pointer"
          >
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">SemiBold (600)</option>
            <option value="700">Bold (700)</option>
            <option value="800">ExtraBold (800)</option>
            <option value="900">Black / Heavy (900)</option>
          </select>
        </div>

        {/* Typography Scale */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            Typography Scale
          </label>
          <select
            value={tokens.typographyScale || 'normal'}
            onChange={(e) => onChange('typographyScale', e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-2 text-xs text-foreground cursor-pointer"
          >
            <option value="compact">Compact (0.9x)</option>
            <option value="normal">Normal (1.0x)</option>
            <option value="editorial">Editorial (1.1x)</option>
            <option value="grand">Grand Scale (1.25x)</option>
          </select>
        </div>
      </div>

      {/* Interactive Live Typography Canvas Preview Card */}
      <div className="p-6 rounded-2xl border border-border bg-slate-50 dark:bg-slate-900/60 shadow-xs space-y-4 select-none">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
              Live Interactive Typography Canvas
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded font-bold">
              Primary: {CURATED_FONTS.find((f) => f.family === primaryFontVal)?.name || 'Custom'}
            </span>
            <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
              Para: {CURATED_FONTS.find((f) => f.family === paragraphFontVal)?.name || 'Custom'}
            </span>
          </div>
        </div>

        {/* Accent Eyebrow */}
        <div
          style={{ fontFamily: accentFontVal }}
          className="text-xs uppercase tracking-widest text-muted-foreground font-semibold"
        >
          LEXIDO • AUTUMN / WINTER EDITORIAL COLLECTION
        </div>

        {/* Primary Headline Title */}
        <h2
          style={{
            fontFamily: primaryFontVal,
            fontWeight: tokens.headingWeight || '800',
            letterSpacing:
              tokens.headingTracking === 'tighter'
                ? '-0.05em'
                : tokens.headingTracking === 'tight'
                ? '-0.025em'
                : tokens.headingTracking === 'wide'
                ? '0.05em'
                : tokens.headingTracking === 'widest'
                ? '0.10em'
                : '0em',
            textTransform: (tokens.headingTransform || 'uppercase') as any,
          }}
          className="text-3xl sm:text-5xl font-black text-foreground leading-[0.92] tracking-tight"
        >
          RAW LUXURY SILHOUETTES & TEXTILES
        </h2>

        {/* Paragraph Body Text */}
        <p
          style={{ fontFamily: paragraphFontVal }}
          className="text-sm sm:text-base text-foreground/85 leading-relaxed max-w-2xl font-normal"
        >
          Crafted with 450 GSM heavyweight organic French terry and precision architectural tailoring.
          Every piece is produced in limited capsule batches designed for effortless minimalist statement aesthetics.
        </p>

        {/* Technical Monospace Specs & Price Tag */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <span
            style={{ fontFamily: monoFontVal }}
            className="text-xs font-bold px-3 py-1 rounded bg-foreground text-background font-mono tracking-tight"
          >
            ₹4,999.00 • SKU-LX-092
          </span>
          <span
            style={{ fontFamily: monoFontVal }}
            className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold"
          >
            ● IN STOCK — 14 PIECES LEFT
          </span>
          <span
            style={{ fontFamily: primaryFontVal }}
            className="ml-auto text-xs font-extrabold uppercase tracking-widest underline cursor-pointer hover:opacity-80"
          >
            EXPLORE CAPSULE ➔
          </span>
        </div>
      </div>
    </div>
  );
}

