'use client';

import React from 'react';
import { PageRenderer } from '@/components/cms/page-renderer';
import { Header } from '@/components/navigation/Header/header';
import { type AnySectionConfig } from '@/types/cms';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { type SeasonalSaleCampaignProps } from '@/components/cms/sections/cms-seasonal-sale-grid';
import { type SiteDesignTokens } from '@/types/cms';
import { type NavAppearanceConfig } from '@/types/navigation-appearance';

export type DeviceViewport = 'desktop' | 'tablet' | 'mobile';

interface BuilderPreviewCanvasProps {
  sections: AnySectionConfig[];
  products: ProductData[];
  seasonalSections: SeasonalSaleCampaignProps[];
  device: DeviceViewport;
  themeTokens: SiteDesignTokens;
  navConfig?: NavAppearanceConfig;
  previewActiveCategory?: string | null;
  onPreviewCategoryChange?: (category: string | null) => void;
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function BuilderPreviewCanvas({
  sections,
  products,
  seasonalSections,
  device,
  themeTokens,
  navConfig,
  previewActiveCategory,
  onPreviewCategoryChange,
  selectedSectionId,
  onSelectSection,
}: BuilderPreviewCanvasProps) {
  const radiusMap: Record<string, string> = {
    none: '0px',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  };

  const cssVariables = {
    '--primary': themeTokens.primaryColor || '#0f172a',
    '--primary-foreground': '#ffffff',
    '--secondary': themeTokens.secondaryColor || '#f1f5f9',
    '--secondary-foreground': themeTokens.textColor || '#0f172a',
    '--accent': themeTokens.accentColor || '#6366f1',
    '--accent-foreground': '#ffffff',
    '--background': themeTokens.backgroundColor || '#ffffff',
    '--surface': themeTokens.surfaceColor || '#f8fafc',
    '--card': themeTokens.surfaceColor || '#ffffff',
    '--card-foreground': themeTokens.textColor || '#0f172a',
    '--popover': themeTokens.surfaceColor || '#ffffff',
    '--popover-foreground': themeTokens.textColor || '#0f172a',
    '--muted': themeTokens.surfaceColor || '#f8fafc',
    '--muted-foreground': themeTokens.mutedTextColor || '#64748b',
    '--foreground': themeTokens.textColor || '#020617',
    '--text-primary': themeTokens.textColor || '#020617',
    '--border': themeTokens.borderColor || '#e2e8f0',
    '--input': themeTokens.borderColor || '#e2e8f0',
    '--ring': themeTokens.primaryColor || '#4f46e5',
    '--radius': radiusMap[themeTokens.borderRadius || 'md'] || '0.5rem',
    '--radius-sm': '0.25rem',
    '--radius-lg': '0.75rem',
    '--radius-xl': '1rem',
    '--font-heading': themeTokens.headingFont || 'inherit',
    '--font-primary': themeTokens.primaryFont || 'inherit',
    '--font-body': themeTokens.primaryFont || 'inherit',
  } as React.CSSProperties;

  if (device === 'desktop') {
    return (
      <div
        className="w-full h-full overflow-y-auto overflow-x-hidden bg-[var(--background,#ffffff)] font-sans text-[var(--foreground,#020617)] flex flex-col"
        style={cssVariables}
      >
        {/* Live Storefront Header in Builder Canvas */}
        <Header
          previewConfig={navConfig}
          previewActiveCategory={previewActiveCategory}
          onPreviewCategoryChange={onPreviewCategoryChange}
        />

        <main className="flex-1 w-full flex flex-col">
          <PageRenderer
            sections={sections}
            products={products}
            seasonalSections={seasonalSections}
            selectedSectionId={selectedSectionId}
            onSelectSection={onSelectSection}
          />
        </main>
      </div>
    );
  }

  // Tablet or Mobile Viewport Simulator
  return (
    <div className="w-full h-full flex items-center justify-center bg-slate-900/90 p-3 sm:p-6 overflow-hidden">
      {/* Device Frame Wrapper */}
      <div
        className={`transition-all duration-300 bg-white shadow-2xl flex flex-col relative overflow-hidden ${
          device === 'mobile'
            ? 'w-[375px] max-w-full h-[88vh] max-h-[820px] rounded-[44px] border-[12px] border-slate-950'
            : 'w-[768px] max-w-full h-[88vh] max-h-[960px] rounded-3xl border-[12px] border-slate-800'
        }`}
        style={cssVariables}
      >
        {/* Mobile Notch Bar */}
        {device === 'mobile' && (
          <div className="w-full bg-slate-950 h-6 flex items-center justify-center shrink-0 select-none z-10">
            <div className="w-24 h-4 bg-slate-900 rounded-b-xl flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
              <div className="w-8 h-1 bg-slate-800 rounded-full" />
            </div>
          </div>
        )}

        {/* Tablet Camera Dot */}
        {device === 'tablet' && (
          <div className="w-full bg-slate-800 h-5 flex items-center justify-center shrink-0 select-none z-10">
            <div className="w-2 h-2 rounded-full bg-slate-700" />
          </div>
        )}

        {/* Live Storefront Renderer Inside Device Frame */}
        <div className="w-full flex-1 min-h-0 overflow-y-auto overflow-x-hidden bg-[var(--background,#ffffff)] font-sans text-[var(--foreground,#020617)] flex flex-col">
          <Header
            previewConfig={navConfig}
            previewActiveCategory={previewActiveCategory}
            onPreviewCategoryChange={onPreviewCategoryChange}
          />

          <main className="flex-1 w-full flex flex-col">
            <PageRenderer
              sections={sections}
              products={products}
              seasonalSections={seasonalSections}
              selectedSectionId={selectedSectionId}
              onSelectSection={onSelectSection}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default BuilderPreviewCanvas;
