'use client';

import React from 'react';
import { AnySectionConfig } from '@/types/cms';
import { SECTION_REGISTRY } from '@/lib/cms/registry';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { Sparkles } from 'lucide-react';

interface PageRendererProps {
  sections: AnySectionConfig[];
  products?: ProductData[];
  seasonalSections?: any[];
  selectedSectionId?: string | null;
  onSelectSection?: (id: string) => void;
}

export function PageRenderer({
  sections = [],
  products = [],
  seasonalSections = [],
  selectedSectionId,
  onSelectSection,
}: PageRendererProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="w-full min-h-[300px] flex items-center justify-center text-slate-400 text-sm">
        No storefront sections configured. Add sections using the Visual Studio Builder.
      </div>
    );
  }

  const activeSections = [...sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (activeSections.length === 0) {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 text-sm p-8 text-center space-y-2">
        <p className="font-bold text-slate-600">All storefront sections are currently hidden or disabled.</p>
        <p className="text-xs text-slate-400">Enable sections in the left sidebar or click &ldquo;Add Component&rdquo;.</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-full flex flex-col">
      {activeSections.map((section) => {
        const entry = SECTION_REGISTRY[section.type];
        if (!entry || !entry.renderer) {
          return null;
        }

        const Component = entry.renderer;
        const isSelected = selectedSectionId === section.id;
        const isInteractive = Boolean(onSelectSection);

        return (
          <div
            key={`${section.id}-${section.animationPreset || 'none'}-${section._animReplayKey || 0}`}
            id={`section-canvas-${section.id}`}
            onClick={() => onSelectSection?.(section.id)}
            className={`relative transition-all ${
              isInteractive ? 'cursor-pointer' : ''
            } ${
              isSelected
                ? 'ring-3 ring-indigo-600 ring-offset-2 z-20 shadow-lg'
                : isInteractive
                ? 'hover:ring-2 hover:ring-indigo-400/70 hover:ring-dashed'
                : ''
            }`}
          >
            {isSelected && isInteractive && (
              <div className="absolute top-2 left-2 z-30 px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase shadow-md flex items-center gap-1.5 select-none pointer-events-none">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>SELECTED: {section.name || entry.label}</span>
              </div>
            )}
            <Component
              config={section}
              products={products}
              seasonalSections={seasonalSections}
            />
          </div>
        );
      })}
    </div>
  );
}

export default PageRenderer;
