'use client';

import React, { useState, useRef, useEffect } from 'react';
import { SiteDesignTokens } from '@/types/cms';
import { THEME_PRESETS, ThemePreset } from '@/lib/cms/theme/presets';
import { Palette, Sparkles, ChevronDown, Check } from 'lucide-react';

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
    </div>
  );
}
