'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SiteDesignTokens } from '@/types/cms';
import { THEME_PRESETS, ThemePreset } from '@/lib/cms/theme/presets';
import { Palette, Sparkles, ChevronDown, Check, Activity, Zap, Square, Type } from 'lucide-react';

interface ThemeEditorPanelProps {
  tokens: SiteDesignTokens;
  onTokenChange: (key: keyof SiteDesignTokens, val: string) => void;
  onSelectPreset: (preset: ThemePreset) => void;
}

export function ThemeEditorPanel({ tokens, onTokenChange, onSelectPreset }: ThemeEditorPanelProps) {
  const presets = Object.values(THEME_PRESETS);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('minimalistMonochrome');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activePreset = presets.find((p) => p.id === selectedPresetId) || presets[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (preset: ThemePreset) => {
    setSelectedPresetId(preset.id);
    onSelectPreset(preset);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-6 p-4 text-slate-900">
      {/* Theme Presets Dropdown Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-slate-900" />
          <h4 className="font-extrabold text-sm text-slate-950 font-heading uppercase tracking-tight">
            Curated Palette Presets
          </h4>
        </div>
        <p className="text-xs text-slate-500 mb-3 leading-relaxed">
          Select a theme preset dropdown to transform all design tokens instantly.
        </p>

        {/* Custom Dropdown Control with Name & Color Swatches */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full p-3 bg-white border-2 border-slate-950 hover:border-black rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-between text-left select-none"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-extrabold text-xs text-slate-950 uppercase tracking-tight truncate">
                {activePreset.name}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Color Swatch Indicators inside Dropdown Trigger */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-slate-300"
                  style={{ backgroundColor: activePreset.previewBg }}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activePreset.previewPrimary }}
                />
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: activePreset.previewAccent }}
                />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-950 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>

          {/* Dropdown Options Popup */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-2 border-slate-950 rounded-xl shadow-xl max-h-72 overflow-y-auto space-y-1 p-1.5 animate-in fade-in slide-in-from-top-2 duration-200">
              {presets.map((preset) => {
                const isSelected = preset.id === activePreset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelect(preset)}
                    className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-slate-950 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-950'
                    }`}
                  >
                    <div className="pr-2 truncate">
                      <div className="flex items-center gap-1.5">
                        <h5
                          className={`font-extrabold text-xs uppercase tracking-tight truncate ${
                            isSelected ? 'text-white' : 'text-slate-950'
                          }`}
                        >
                          {preset.name}
                        </h5>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                      </div>
                      <p
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {preset.description}
                      </p>
                    </div>

                    {/* Color Swatch Indicators for each option */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: preset.previewBg }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.previewPrimary }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: preset.previewAccent }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Dynamic Token Inputs */}
      <div>
        <h4 className="font-extrabold text-sm text-slate-950 mb-3 flex items-center gap-2 font-heading uppercase tracking-tight">
          <Palette className="w-4 h-4 text-slate-900" /> Dynamic Theme Variables
        </h4>

        <div className="space-y-3">
          {[
            { key: 'primaryColor', label: 'Primary Brand Color' },
            { key: 'secondaryColor', label: 'Secondary Color' },
            { key: 'accentColor', label: 'Accent Highlight Color' },
            { key: 'backgroundColor', label: 'Global Background' },
            { key: 'surfaceColor', label: 'Card Surface Color' },
            { key: 'textColor', label: 'Primary Text Color' },
            { key: 'borderColor', label: 'Border Line Color' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <label className="text-xs font-bold text-slate-800">{item.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={(tokens as any)[item.key] || '#000000'}
                  onChange={(e) => onTokenChange(item.key as any, e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer bg-white p-0.5 shadow-2xs"
                />
                <input
                  type="text"
                  value={(tokens as any)[item.key] || ''}
                  onChange={(e) => onTokenChange(item.key as any, e.target.value)}
                  className="w-24 text-xs font-mono font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-slate-950 focus:ring-1 focus:ring-slate-950 focus:outline-none"
                />
              </div>
            </div>
          ))}

          {/* Border Radius Control */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800">Border Radius Geometry</label>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                {tokens.borderRadius || 'md'}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {(['none', 'sm', 'md', 'lg', 'xl'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onTokenChange('borderRadius', r)}
                  className={`py-1.5 rounded-md text-[10px] font-extrabold uppercase transition cursor-pointer text-center ${
                    (tokens.borderRadius || 'md') === r
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Global Typography & Font Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-2 font-heading uppercase tracking-tight">
            <Type className="w-4 h-4 text-slate-900" /> Global Typography &amp; Fonts
          </h4>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
            Storewide
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Configure fonts globally across all titles, heroes, editorial sections, and body text with strict typographic consistency.
        </p>

        {/* 1. Heading Font Selection */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Heading &amp; Title Font</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 truncate max-w-[150px]">
              {tokens.headingFont || "'Space Grotesk', sans-serif"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: "'Space Grotesk', sans-serif",
                name: 'Space Grotesk',
                category: 'Grotesque Streetwear (LEXIDO Default)',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Space Grotesk', sans-serif",
              },
              {
                id: "'Syne', sans-serif",
                name: 'Syne',
                category: 'Avant-Garde High Fashion',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Syne', sans-serif",
              },
              {
                id: "'Plus Jakarta Sans', sans-serif",
                name: 'Plus Jakarta Sans',
                category: 'Clean Geometric Modernist',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              },
              {
                id: "'Oswald', sans-serif",
                name: 'Oswald',
                category: 'Condensed Heavyweight Impact',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Oswald', sans-serif",
              },
              {
                id: "'Inter', sans-serif",
                name: 'Inter / Technical Sans',
                category: 'Neutral High-Legibility',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Inter', sans-serif",
              },
              {
                id: "'Cinzel', serif",
                name: 'Cinzel',
                category: 'Classical Roman High-Jewelry Serif',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Cinzel', serif",
              },
              {
                id: "'Playfair Display', serif",
                name: 'Playfair Display',
                category: 'Editorial Luxury Serif',
                preview: 'LEXIDO EDITORIAL 26',
                fontFamily: "'Playfair Display', serif",
              },
            ].map((font) => {
              const isSelected = (tokens.headingFont || "'Space Grotesk', sans-serif") === font.id;
              return (
                <button
                  key={font.id}
                  type="button"
                  onClick={() => onTokenChange('headingFont', font.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white shadow-2xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold leading-tight truncate">{font.name}</span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {font.category}
                      </span>
                    </div>
                    <div
                      className={`text-sm tracking-tight mt-1 truncate ${
                        isSelected ? 'text-slate-200' : 'text-slate-600'
                      }`}
                      style={{ fontFamily: font.fontFamily }}
                    >
                      {font.preview}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Body Font Selection */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Body &amp; Paragraph Font</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans', desc: 'Modern & crisp' },
              { id: "'Space Grotesk', sans-serif", label: 'Space Grotesk', desc: 'Streetwear look' },
              { id: "'Inter', sans-serif", label: 'Inter Sans', desc: 'Neutral reader' },
              { id: 'var(--font-geist-sans)', label: 'Geist Sans', desc: 'System tech' },
            ].map((bf) => {
              const isSelected = (tokens.primaryFont || "'Plus Jakarta Sans', sans-serif") === bf.id;
              return (
                <button
                  key={bf.id}
                  type="button"
                  onClick={() => onTokenChange('primaryFont', bf.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950 text-white shadow-2xs font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="text-[11px] font-bold truncate">{bf.label}</div>
                  <div className={`text-[9px] truncate ${isSelected ? 'text-slate-400' : 'text-slate-400'}`}>{bf.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Heading Tracking (Letter-Spacing) */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Heading Letter Spacing (Tracking)</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {tokens.headingTracking || 'tighter'}
            </span>
          </div>
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'tighter', label: 'Tighter', val: '-0.05em' },
              { id: 'tight', label: 'Tight', val: '-0.025em' },
              { id: 'normal', label: 'Normal', val: '0' },
              { id: 'wide', label: 'Wide', val: '+0.05em' },
              { id: 'widest', label: 'Widest', val: '+0.10em' },
            ].map((track) => {
              const isSelected = (tokens.headingTracking || 'tighter') === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => onTokenChange('headingTracking', track.id)}
                  className={`py-1.5 px-1 rounded-md text-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white font-extrabold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">{track.label}</div>
                  <div className="text-[8px] opacity-70">{track.val}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Heading Text Casing */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Heading Letter Transform</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'uppercase', label: 'UPPERCASE', desc: 'Editorial (LEXIDO)' },
              { id: 'none', label: 'As Typed', desc: 'Natural case' },
              { id: 'capitalize', label: 'Capitalize', desc: 'Title Words' },
            ].map((casing) => {
              const isSelected = (tokens.headingTransform || 'uppercase') === casing.id;
              return (
                <button
                  key={casing.id}
                  type="button"
                  onClick={() => onTokenChange('headingTransform', casing.id)}
                  className={`py-2 px-1 rounded-lg text-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white font-extrabold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">{casing.label}</div>
                  <div className="text-[8px] opacity-70">{casing.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Heading Weight / Thickness */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Heading Thickness &amp; Weight</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {tokens.headingWeight || '800'}
            </span>
          </div>
          <div className="grid grid-cols-6 gap-1">
            {[
              { id: '400', label: '400', desc: 'Regular', weightClass: 'font-normal' },
              { id: '500', label: '500', desc: 'Medium', weightClass: 'font-medium' },
              { id: '600', label: '600', desc: 'Semibold', weightClass: 'font-semibold' },
              { id: '700', label: '700', desc: 'Bold', weightClass: 'font-bold' },
              { id: '800', label: '800', desc: 'Heavy', weightClass: 'font-extrabold' },
              { id: '900', label: '900', desc: 'Black', weightClass: 'font-black' },
            ].map((w) => {
              const isSelected = (tokens.headingWeight || '800') === w.id;
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => onTokenChange('headingWeight', w.id)}
                  className={`py-1.5 px-1 rounded-md text-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white font-extrabold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`text-[10px] leading-tight ${w.weightClass}`}>{w.label}</div>
                  <div className="text-[7.5px] opacity-70 truncate">{w.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 6. Responsive Typography Scale Profile */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Responsive Scale Profile</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {tokens.typographyScale || 'normal'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 leading-snug">
            Controls fluid scaling of hero banners, headings, and body text dynamically across all screen sizes.
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'compact', label: 'Compact', factor: '0.9x', desc: 'Dense mobile' },
              { id: 'normal', label: 'Balanced', factor: '1.0x', desc: 'Default scale' },
              { id: 'editorial', label: 'Editorial', factor: '1.1x', desc: 'Fashion lookbook' },
              { id: 'grand', label: 'Grand', factor: '1.25x', desc: 'Max impact' },
            ].map((scale) => {
              const isSelected = (tokens.typographyScale || 'normal') === scale.id;
              return (
                <button
                  key={scale.id}
                  type="button"
                  onClick={() => onTokenChange('typographyScale', scale.id)}
                  className={`py-2 px-1 rounded-lg text-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white font-extrabold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] font-bold leading-tight">{scale.label}</div>
                  <div className="text-[8px] font-mono opacity-80">{scale.factor}</div>
                  <div className="text-[7.5px] opacity-65 truncate mt-0.5">{scale.desc}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Global Website Border Lines & Dividers */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-2 font-heading uppercase tracking-tight">
            <Square className="w-4 h-4 text-slate-900" /> Website Border Lines &amp; Dividers
          </h4>
          <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full uppercase">
            All Pages
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Take total control over border thickness, divider lines between sections, and card edge styling across the entire storefront.
        </p>

        {/* 1. Global Border Width */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Master Border Line Thickness</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
              {tokens.borderWidth || 'thin'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'none', label: '0px Flush', desc: 'Borderless' },
              { id: 'thin', label: '1px Hairline', desc: 'Minimal' },
              { id: 'medium', label: '2px Crisp', desc: 'Defined' },
              { id: 'thick', label: '3px Bold', desc: 'Editorial' },
            ].map((bw) => {
              const isSelected = (tokens.borderWidth || 'thin') === bw.id;
              return (
                <button
                  key={bw.id}
                  type="button"
                  onClick={() => onTokenChange('borderWidth', bw.id)}
                  className={`py-2 px-1 rounded-lg text-center transition cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-950 border-slate-950 text-white font-extrabold shadow-2xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">{bw.label}</div>
                  <div className="text-[8px] opacity-70">{bw.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Global Border Line Style */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Border Line Geometry &amp; Style</label>
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'solid', label: 'Solid ──' },
              { id: 'dashed', label: 'Dashed ╌╌' },
              { id: 'dotted', label: 'Dotted ┈┈' },
              { id: 'none', label: 'None ∅' },
            ].map((bs) => {
              const isSelected = (tokens.borderStyle || 'solid') === bs.id;
              return (
                <button
                  key={bs.id}
                  type="button"
                  onClick={() => onTokenChange('borderStyle', bs.id)}
                  className={`py-1.5 rounded-md text-[10px] font-extrabold uppercase transition cursor-pointer text-center ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bs.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Section Boundary Divider Lines */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Section Divider Lines (Between Page Sections)</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'none', label: 'No Dividers', desc: 'Seamless flow' },
              { id: 'bottom', label: 'Bottom Line', desc: 'Divider under each' },
              { id: 'top-bottom', label: 'Top & Bottom', desc: 'Full box frames' },
            ].map((sd) => {
              const isSelected = (tokens.sectionDividers || 'none') === sd.id;
              return (
                <button
                  key={sd.id}
                  type="button"
                  onClick={() => onTokenChange('sectionDividers', sd.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold">{sd.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">{sd.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Product & Category Card Border Style */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Product &amp; Category Card Border Lines</label>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { id: 'borderless', label: 'Borderless', desc: '0px border' },
              { id: 'bordered', label: 'Theme Border', desc: 'Hairline outline' },
              { id: 'accent', label: 'Accent Border', desc: 'Brand highlight' },
            ].map((cb) => {
              const isSelected = (tokens.cardBorders || 'bordered') === cb.id;
              return (
                <button
                  key={cb.id}
                  type="button"
                  onClick={() => onTokenChange('cardBorders', cb.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold">{cb.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">{cb.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* Global Living Motion & Dynamics Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-sm text-slate-950 flex items-center gap-2 font-heading uppercase tracking-tight">
            <Activity className="w-4 h-4 text-indigo-600" /> Storefront Alive Dynamics
          </h4>
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full uppercase">
            Global
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Configure site-wide motion speed, interactive card hover physics, and ambient living energy.
        </p>

        {/* Global Card Hover Dynamics */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Product &amp; Category Card Hover Physics</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'none', label: 'Default', desc: 'No lift reaction' },
              { id: 'lift', label: 'Floating Lift', desc: 'Translates up with soft shadow' },
              { id: 'glow', label: 'Aura Glow', desc: 'Accent edge illumination' },
              { id: 'zoom', label: 'Ken Burns Zoom', desc: 'Smooth image scaling' },
            ].map((opt) => {
              const isSelected = (tokens.globalCardHover || 'lift') === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onTokenChange('globalCardHover', opt.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold">{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">{opt.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Storefront Motion Feel */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800">Storefront Motion Feel</label>
            <span className="text-[10px] font-mono font-bold text-slate-500 capitalize">
              {tokens.animationSpeed || 'smooth'}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {[
              { id: 'subtle', label: 'Subtle' },
              { id: 'smooth', label: 'Smooth' },
              { id: 'energetic', label: 'Lively' },
              { id: 'off', label: 'Static' },
            ].map((speed) => {
              const isSelected = (tokens.animationSpeed || 'smooth') === speed.id;
              return (
                <button
                  key={speed.id}
                  type="button"
                  onClick={() => onTokenChange('animationSpeed', speed.id)}
                  className={`py-1.5 rounded-md text-[10px] font-extrabold uppercase transition cursor-pointer text-center ${
                    isSelected
                      ? 'bg-slate-950 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {speed.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ambient Living Energy */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <label className="text-xs font-bold text-slate-800 block">Ambient Background Living Motion</label>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { id: 'none', label: 'None', desc: 'No ambient movement' },
              { id: 'subtle-pulse', label: 'Subtle Breathing', desc: 'Soft living rhythm' },
              { id: 'glow-ambient', label: 'Aura Glow', desc: 'Ambient luminous halo' },
              { id: 'gentle-float', label: 'Gentle Float', desc: 'Subtle floating drift' },
            ].map((amb) => {
              const isSelected = (tokens.ambientMotion || 'none') === amb.id;
              return (
                <button
                  key={amb.id}
                  type="button"
                  onClick={() => onTokenChange('ambientMotion', amb.id)}
                  className={`p-2 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 ring-1 ring-indigo-500 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold">{amb.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 flex-shrink-0" />}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5">{amb.desc}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
