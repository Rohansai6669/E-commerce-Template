'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  NavAppearanceConfig,
  NavLinkItem,
  NAV_APPEARANCE_PRESETS,
  defaultNavAppearanceConfig,
} from '@/types/navigation-appearance';
import {
  Layout,
  Type,
  Link as LinkIcon,
  Layers,
  ShoppingBag,
  Bell,
  ChevronDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Check,
  MoveVertical,
  ExternalLink,
  Edit2,
  Sliders,
  Maximize2,
  MousePointerClick,
  ArrowRight,
  Compass,
} from 'lucide-react';
import { HierarchicalLinkBuilder } from './hierarchical-link-builder';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { NineAlignmentMatrix } from '@/components/ui/nine-alignment-matrix';
import { toast } from 'sonner';

interface NavEditorPanelProps {
  config: NavAppearanceConfig;
  onChange: (updated: NavAppearanceConfig) => void;
  previewMegamenuCategory: string | null;
  onPreviewMegamenuChange: (category: string | null) => void;
}

type NavSubTab = 'header' | 'logo' | 'links' | 'megamenu' | 'icons';

export function NavEditorPanel({
  config,
  onChange,
  previewMegamenuCategory,
  onPreviewMegamenuChange,
}: NavEditorPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<NavSubTab>('header');
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [activeLinkBuilderIdx, setActiveLinkBuilderIdx] = useState<number | null>(null);
  const [isPromoRouteBuilderOpen, setIsPromoRouteBuilderOpen] = useState(false);
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close preset dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsPresetDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateField = <K extends keyof NavAppearanceConfig>(
    key: K,
    val: NavAppearanceConfig[K]
  ) => {
    onChange({
      ...config,
      [key]: val,
    });
  };

  const applyPreset = (presetId: string) => {
    const found = NAV_APPEARANCE_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onChange({
      ...config,
      ...found.config,
    });
    setIsPresetDropdownOpen(false);
    toast.success(`Applied "${found.name}" Nav Preset`);
  };

  const handleResetDefaults = () => {
    onChange(defaultNavAppearanceConfig);
    toast.success('Reset Navigation to Lexido Luxury Defaults');
  };

  // Nav Links Management
  const addNavLink = () => {
    const newId = `link-${Date.now()}`;
    const newLink: NavLinkItem = {
      id: newId,
      label: 'NEW LINK',
      href: '/products',
      hasMega: false,
      highlight: false,
    };
    updateField('links', [...config.links, newLink]);
    setEditingLinkId(newId);
    toast.success('Added new navigation link');
  };

  const updateNavLink = (index: number, updates: Partial<NavLinkItem>) => {
    const updated = [...config.links];
    updated[index] = { ...updated[index], ...updates };
    updateField('links', updated);
  };

  const removeNavLink = (index: number) => {
    const updated = config.links.filter((_, i) => i !== index);
    updateField('links', updated);
    toast.success('Link removed');
  };

  const moveNavLink = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= config.links.length) return;
    const updated = [...config.links];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updateField('links', updated);
  };

  const SAMPLE_PROMO_IMAGES = [
    {
      label: 'Streetwear Model',
      url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Editorial Coat',
      url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Active Gymwear',
      url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop',
    },
    {
      label: 'Winter Outerwear',
      url: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden bg-slate-100 text-slate-900 font-sans select-none pb-20">
      {/* 1. Header with Presets Dropdown & Reset */}
      <div className="p-4 bg-white border-b border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-950 uppercase tracking-tight font-heading flex items-center gap-1.5">
              <Layout className="w-4 h-4 text-slate-900" /> Navigation Studio
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">Customize storefront header & mega menu</p>
          </div>
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Reset to default luxury styling"
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold uppercase flex items-center gap-1 cursor-pointer transition shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" /> Reset
          </button>
        </div>

        {/* Presets Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
            className="w-full p-2.5 bg-white border-2 border-slate-900 hover:border-black rounded-xl shadow-xs cursor-pointer transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Theme Preset</span>
                <span className="font-black text-xs text-slate-950 uppercase tracking-tight">
                  Choose Styling Preset...
                </span>
              </div>
            </div>

            <ChevronDown
              className={`w-4 h-4 text-slate-950 transition-transform duration-200 ${
                isPresetDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isPresetDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-2 border-slate-950 rounded-xl shadow-xl max-h-72 overflow-y-auto space-y-1 p-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
              {NAV_APPEARANCE_PRESETS.map((p) => (
                <div
                  key={p.id}
                  onClick={() => applyPreset(p.id)}
                  className="p-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-between hover:bg-slate-100 group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md border border-slate-200">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: p.previewBg }}
                      />
                      <div
                        className="w-3.5 h-3.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: p.previewAccent }}
                      />
                    </div>
                    <div>
                      <p className="font-extrabold text-xs text-slate-950 group-hover:text-indigo-600">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{p.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. High-Contrast Sub-Tab Navigation Bar */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-2 gap-1 sticky top-0 z-20 shadow-2xs">
        {[
          { id: 'header', label: 'Header', icon: Layout },
          { id: 'logo', label: 'Logo', icon: Type },
          { id: 'links', label: `Links (${config.links.length})`, icon: LinkIcon },
          { id: 'megamenu', label: 'Mega Menu', icon: Layers },
          { id: 'icons', label: 'Icons & Bar', icon: ShoppingBag },
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as NavSubTab)}
              className={`flex-1 pb-2.5 pt-1 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'border-slate-950 text-slate-950 font-black'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Body */}
      <div className="p-4 space-y-4">
        {/* ===================== SUBTAB 1: HEADER LAYOUT, HEIGHT & COLORS ===================== */}
        {activeSubTab === 'header' && (
          <div className="space-y-4">
            {/* Height Controls Card (Slider + Px Input + Presets) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Header Height Control
                  </label>
                  <p className="text-[11px] text-slate-600">
                    Adjust top bar height in pixels or select luxury presets
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                  <span className="font-mono font-black text-xs text-slate-950">
                    {config.headerHeightPx || 72}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">px</span>
                </div>
              </div>

              {/* Range Slider */}
              <div>
                <input
                  type="range"
                  min="48"
                  max="120"
                  step="2"
                  value={config.headerHeightPx || 72}
                  onChange={(e) => {
                    const px = Number(e.target.value);
                    updateField('headerHeightPx', px);
                    updateField('customHeightPx', px);
                  }}
                  className="w-full cursor-pointer accent-slate-950"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold px-0.5 mt-1">
                  <span>48px (Slim)</span>
                  <span>72px (Standard)</span>
                  <span>120px (Heroic)</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="grid grid-cols-5 gap-1.5 pt-1">
                {[
                  { px: 56, label: '56px', tag: 'Compact' },
                  { px: 64, label: '64px', tag: 'Balanced' },
                  { px: 72, label: '72px', tag: 'Standard' },
                  { px: 80, label: '80px', tag: 'Spacious' },
                  { px: 88, label: '88px', tag: 'Luxury' },
                ].map((opt) => (
                  <button
                    key={opt.px}
                    type="button"
                    onClick={() => {
                      updateField('headerHeightPx', opt.px);
                      updateField('customHeightPx', opt.px);
                      if (opt.px === 56) updateField('height', 'compact');
                      else if (opt.px === 88) updateField('height', 'luxury');
                      else updateField('height', 'standard');
                    }}
                    className={`py-2 px-1 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                      (config.headerHeightPx || 72) === opt.px
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-extrabold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-[11px] leading-tight">{opt.label}</span>
                    <span
                      className={`text-[9px] mt-0.5 leading-none ${
                        (config.headerHeightPx || 72) === opt.px ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.tag}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Container Max Width Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Container Width
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'boxed', label: 'Boxed', sub: 'Max 7XL' },
                  { id: 'wide', label: 'Wide', sub: '1600px' },
                  { id: 'full', label: 'Full Edge', sub: '100% Width' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('maxWidth', opt.id as any)}
                    className={`p-2.5 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                      config.maxWidth === opt.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-extrabold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        config.maxWidth === opt.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Behavior & Display Toggles Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Display Options
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    key: 'isSticky',
                    label: 'Sticky Header',
                    desc: 'Pins the navigation bar to the top while scrolling',
                  },
                  {
                    key: 'translucentBlur',
                    label: 'Frosted Glass Backdrop Blur',
                    desc: 'Translucent background blur overlay over page content',
                  },
                  {
                    key: 'borderBottom',
                    label: 'Bottom Border Line',
                    desc: 'Clean subtle divider under the navigation bar',
                  },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(config[item.key as keyof NavAppearanceConfig])}
                      onChange={(e) =>
                        updateField(item.key as keyof NavAppearanceConfig, e.target.checked as any)
                      }
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-950">{item.label}</p>
                      <p className="text-[11px] text-slate-600">{item.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Tokens Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Header Colors
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'backgroundColor', label: 'Background Color', defaultHex: '#ffffff' },
                  { key: 'textColor', label: 'Text & Icons Color', defaultHex: '#0f172a' },
                  { key: 'activeTextColor', label: 'Active Link Accent', defaultHex: '#000000' },
                  { key: 'borderColor', label: 'Border Color', defaultHex: '#e2e8f0' },
                ].map((c) => {
                  const val = String(config[c.key as keyof NavAppearanceConfig] || c.defaultHex);
                  return (
                    <div key={c.key} className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={val.startsWith('#') ? val : c.defaultHex}
                          onChange={(e) =>
                            updateField(c.key as keyof NavAppearanceConfig, e.target.value as any)
                          }
                          className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            updateField(c.key as keyof NavAppearanceConfig, e.target.value as any)
                          }
                          className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ===================== SUBTAB 2: BRAND LOGO ===================== */}
        {activeSubTab === 'logo' && (
          <div className="space-y-4">
            {/* Logo Mode Switcher */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs flex gap-1.5">
              <button
                type="button"
                onClick={() => updateField('logoType', 'text')}
                className={`flex-1 py-2 text-xs font-extrabold uppercase rounded-lg transition cursor-pointer ${
                  config.logoType === 'text'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Text Brandmark
              </button>
              <button
                type="button"
                onClick={() => updateField('logoType', 'image')}
                className={`flex-1 py-2 text-xs font-extrabold uppercase rounded-lg transition cursor-pointer ${
                  config.logoType === 'image'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Image / SVG Logo
              </button>
            </div>

            {config.logoType === 'text' ? (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide mb-1.5">
                    Brand Name / Text
                  </label>
                  <input
                    type="text"
                    value={config.logoText}
                    onChange={(e) => updateField('logoText', e.target.value)}
                    placeholder="LEXIDO"
                    className="w-full text-base font-black tracking-widest uppercase px-3 py-2 rounded-lg border-2 border-slate-300 focus:border-slate-950 bg-white text-slate-950 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Font Family
                    </label>
                    <select
                      value={config.logoFont}
                      onChange={(e) => updateField('logoFont', e.target.value as any)}
                      className="w-full text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="heading">Heading Display (Outfit / Geist)</option>
                      <option value="sans">Clean Modern Sans</option>
                      <option value="serif">Luxury Editorial Serif</option>
                      <option value="mono">Technical Monospace</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Font Size
                    </label>
                    <select
                      value={config.logoFontSize}
                      onChange={(e) => updateField('logoFontSize', e.target.value as any)}
                      className="w-full text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="base">Medium (Base)</option>
                      <option value="lg">Large (Lg)</option>
                      <option value="xl">XL (20px)</option>
                      <option value="2xl">2XL (24px - Default)</option>
                      <option value="3xl">3XL (30px - Bold)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Font Weight
                    </label>
                    <select
                      value={config.logoFontWeight}
                      onChange={(e) => updateField('logoFontWeight', e.target.value as any)}
                      className="w-full text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="normal">Regular (400)</option>
                      <option value="medium">Medium (500)</option>
                      <option value="semibold">SemiBold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="extrabold">ExtraBold (800)</option>
                      <option value="black">Black (900 - Lexido)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Letter Spacing
                    </label>
                    <select
                      value={config.logoLetterSpacing}
                      onChange={(e) => updateField('logoLetterSpacing', e.target.value as any)}
                      className="w-full text-xs font-bold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                    >
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                      <option value="widest">Widest</option>
                      <option value="ultra-wide">Ultra Wide (0.2em - Luxury)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Logo Custom Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.logoColor.startsWith('#') ? config.logoColor : '#0f172a'}
                      onChange={(e) => updateField('logoColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                    />
                    <input
                      type="text"
                      value={config.logoColor}
                      onChange={(e) => updateField('logoColor', e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
                <div>
                  <ImagePreviewInput
                    label="Brand Logo Asset"
                    value={config.logoImageUrl || ''}
                    onChange={(url) => updateField('logoImageUrl', url)}
                    placeholder="Upload SVG/PNG or pick from Media Storage"
                    aspectRatio="square"
                    folder="brands"
                    description="SVG or transparent PNG recommended for luxury sharpness"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Image Height
                    </label>
                    <span className="text-xs font-bold text-slate-700">
                      {config.logoImageHeight || 32}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="64"
                    value={config.logoImageHeight || 32}
                    onChange={(e) => updateField('logoImageHeight', Number(e.target.value))}
                    className="w-full cursor-pointer accent-slate-950"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================== SUBTAB 3: NAVIGATION MENU LINKS & HOVER STYLES ===================== */}
        {activeSubTab === 'links' && (
          <div className="space-y-4">
            {/* Links Hover & Interaction Style Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-slate-900" />
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Top Links Hover Effects
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'underline', label: 'Animated Line', desc: 'Bottom line reveals on hover' },
                  { id: 'pill', label: 'Soft Pill Badge', desc: 'Background bubble highlight' },
                  { id: 'color-shift', label: 'Color Accent', desc: 'Transitions to accent color' },
                  { id: 'glow', label: 'Luminous Glow', desc: 'Subtle text shadow glow' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('linksHoverEffect', opt.id as any)}
                    className={`p-2.5 rounded-xl text-left border-2 transition cursor-pointer flex flex-col ${
                      config.linksHoverEffect === opt.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{opt.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        config.linksHoverEffect === opt.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Global Links Formatting Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Menu Links Layout
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Alignment
                  </label>
                  <select
                    value={config.linksAlignment}
                    onChange={(e) => updateField('linksAlignment', e.target.value as any)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="center">Center</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Spacing
                  </label>
                  <select
                    value={config.linksSpacing}
                    onChange={(e) => updateField('linksSpacing', e.target.value as any)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="compact">Compact (1rem)</option>
                    <option value="normal">Normal (1.75rem)</option>
                    <option value="wide">Wide (2.5rem)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Letter Case
                  </label>
                  <select
                    value={config.linksTextTransform}
                    onChange={(e) => updateField('linksTextTransform', e.target.value as any)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="uppercase">UPPERCASE</option>
                    <option value="capitalize">Capitalize</option>
                    <option value="none">Normal Case</option>
                  </select>
                </div>
              </div>
            </div>

            {/* List of Navigation Links */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Navigation Items ({config.links.length})
                </span>
                <button
                  type="button"
                  onClick={addNavLink}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Link
                </button>
              </div>

              {config.links.map((link, idx) => {
                const isEditing = editingLinkId === (link.id || String(idx));
                return (
                  <div
                    key={link.id || idx}
                    className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all"
                  >
                    {/* Collapsed Link Row */}
                    <div className="p-3 flex items-center justify-between gap-2 bg-slate-50/50 hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveNavLink(idx, 'up')}
                            className="p-1 rounded hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3 h-3 text-slate-700" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === config.links.length - 1}
                            onClick={() => moveNavLink(idx, 'down')}
                            className="p-1 rounded hover:bg-slate-200 disabled:opacity-20 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3 h-3 text-slate-700" />
                          </button>
                        </div>

                        <div>
                          <p className="font-black text-xs text-slate-950 uppercase tracking-wider">
                            {link.label}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono line-clamp-1">
                            {link.href}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {link.hasMega && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Mega Menu
                          </span>
                        )}

                        {link.badgeText && (
                          <span
                            style={{
                              backgroundColor: link.badgeColor || '#4f46e5',
                              color: '#ffffff',
                            }}
                            className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider"
                          >
                            {link.badgeText}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditingLinkId(isEditing ? null : link.id || String(idx))}
                          className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700 cursor-pointer transition shadow-2xs"
                          title="Edit Link Details"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeNavLink(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer transition"
                          title="Remove Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded Link Editing Drawer */}
                    {isEditing && (
                      <div className="p-3.5 border-t border-slate-200 bg-white space-y-3 animate-in fade-in duration-150">
                        <div className="grid grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                              Link Label
                            </label>
                            <input
                              type="text"
                              value={link.label}
                              onChange={(e) => updateNavLink(idx, { label: e.target.value })}
                              placeholder="e.g. MEN"
                              className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-bold text-slate-700 uppercase">
                                URL Destination
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setActiveLinkBuilderIdx(
                                    activeLinkBuilderIdx === idx ? null : idx
                                  )
                                }
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                              >
                                <Compass className="w-3 h-3 text-indigo-600" />
                                {activeLinkBuilderIdx === idx ? 'Close Route Dropdowns' : 'Route Dropdowns'}
                              </button>
                            </div>
                            <input
                              type="text"
                              value={link.href}
                              onChange={(e) => updateNavLink(idx, { href: e.target.value })}
                              placeholder="/products?category=men"
                              className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                            />
                          </div>
                        </div>

                        {/* Hierarchical Cascading Route Dropdown Builder */}
                        {activeLinkBuilderIdx === idx && (
                          <div className="pt-2 border-t border-slate-100">
                            <HierarchicalLinkBuilder
                              currentHref={link.href}
                              currentLabel={link.label}
                              onApply={(opt) => {
                                updateNavLink(idx, {
                                  href: opt.href,
                                  label: opt.label,
                                  hasMega: opt.hasMega !== undefined ? opt.hasMega : link.hasMega,
                                });
                                setActiveLinkBuilderIdx(null);
                              }}
                              onClose={() => setActiveLinkBuilderIdx(null)}
                            />
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={link.hasMega}
                              onChange={(e) => updateNavLink(idx, { hasMega: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                            />
                            <span className="text-xs font-bold text-slate-900">
                              Triggers Mega Menu Dropdown
                            </span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={Boolean(link.highlight)}
                              onChange={(e) => updateNavLink(idx, { highlight: e.target.checked })}
                              className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                            />
                            <span className="text-xs font-bold text-slate-900">Highlight Color</span>
                          </label>
                        </div>

                        {/* Custom Badge Tag */}
                        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                              Badge Tag (Optional)
                            </span>
                            <input
                              type="text"
                              value={link.badgeText || ''}
                              onChange={(e) => updateNavLink(idx, { badgeText: e.target.value })}
                              placeholder="e.g. LIMITED, SALE, NEW"
                              className="w-36 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                            />
                          </div>

                          {link.badgeText && (
                            <div>
                              <span className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                                Badge Color
                              </span>
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="color"
                                  value={link.badgeColor || '#4f46e5'}
                                  onChange={(e) => updateNavLink(idx, { badgeColor: e.target.value })}
                                  className="w-8 h-8 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 bg-white"
                                />
                                <span className="text-xs font-mono font-bold text-slate-700">
                                  {link.badgeColor || '#4f46e5'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== SUBTAB 4: MEGA MENU PANEL, HEIGHT & HOVER CONTROLS ===================== */}
        {activeSubTab === 'megamenu' && (
          <div className="space-y-4">
            {/* Mega Menu Interactive Canvas Pin Banner */}
            <div className="bg-white rounded-xl border-2 border-indigo-600 p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  <span className="font-black text-xs text-slate-950 uppercase tracking-wider">
                    Mega Menu Preview Pin
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onPreviewMegamenuChange(previewMegamenuCategory ? null : 'MEN')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase tracking-wider transition cursor-pointer ${
                    previewMegamenuCategory
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                  }`}
                >
                  {previewMegamenuCategory ? 'Close Preview' : 'Pin Open in Canvas'}
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Pin the mega menu open to see how the left category tabs, center subitem columns, and
                featured editorial promo card look in real time.
              </p>

              {previewMegamenuCategory && (
                <div className="flex items-center gap-2 pt-1 border-t border-indigo-100">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">Department:</span>
                  {['MEN', 'WOMEN', 'COLLECTIONS'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => onPreviewMegamenuChange(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase transition cursor-pointer ${
                        previewMegamenuCategory === cat
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mega Menu Heights & Spacing Controls Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MoveVertical className="w-4 h-4 text-slate-900" />
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Mega Menu Height & Padding Controls
                </label>
              </div>

              {/* Min-Height Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-700 uppercase">
                    Dropdown Minimum Height
                  </span>
                  <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <span className="font-mono font-black text-xs text-slate-950">
                      {config.megaMenuMinHeightPx || 460}
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">px</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="360"
                  max="650"
                  step="10"
                  value={config.megaMenuMinHeightPx || 460}
                  onChange={(e) => updateField('megaMenuMinHeightPx', Number(e.target.value))}
                  className="w-full cursor-pointer accent-slate-950"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-bold px-0.5 mt-0.5">
                  <span>360px (Compact)</span>
                  <span>460px (Standard)</span>
                  <span>650px (Spacious)</span>
                </div>
              </div>

              {/* Vertical Padding Scale */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                {[
                  { id: 'compact', label: 'Compact Padding', sub: '16px (py-4)' },
                  { id: 'standard', label: 'Standard Padding', sub: '32px (py-8)' },
                  { id: 'relaxed', label: 'Relaxed Padding', sub: '48px (py-12)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('megaMenuPaddingY', opt.id as any)}
                    className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                      (config.megaMenuPaddingY || 'standard') === opt.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-extrabold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span
                      className={`text-[9px] mt-0.5 ${
                        (config.megaMenuPaddingY || 'standard') === opt.id
                          ? 'text-slate-300'
                          : 'text-slate-500'
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>

              {/* Row Spacing Scales (Categories & Subcategories) */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Category List Row Gap
                  </label>
                  <select
                    value={config.categoryRowSpacing || 'standard'}
                    onChange={(e) => updateField('categoryRowSpacing', e.target.value as any)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="compact">Compact (gap-2)</option>
                    <option value="standard">Standard (gap-3.5)</option>
                    <option value="relaxed">Spacious (gap-5)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Subitem Links Row Gap
                  </label>
                  <select
                    value={config.subitemRowSpacing || 'standard'}
                    onChange={(e) => updateField('subitemRowSpacing', e.target.value as any)}
                    className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="compact">Compact (gap-2)</option>
                    <option value="standard">Standard (gap-3)</option>
                    <option value="relaxed">Spacious (gap-4.5)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mega Menu Hover Styles Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <MousePointerClick className="w-4 h-4 text-slate-900" />
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Mega Menu Hover Effects
                </label>
              </div>

              {/* Category Tab Hover Effect */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Left Category Tabs Hover
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'slide-right', label: 'Slide Right (→)', desc: 'Smooth horizontal glide' },
                    { id: 'border-reveal', label: 'Border Reveal Bar', desc: 'Left accent bar preview' },
                    { id: 'pill', label: 'Soft Pill Badge', desc: 'Background bubble highlight' },
                    { id: 'color-shift', label: 'Color Accent Shift', desc: 'Bold text color shift' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('categoryHoverEffect', opt.id as any)}
                      className={`p-2.5 rounded-xl text-left border-2 transition cursor-pointer flex flex-col ${
                        config.categoryHoverEffect === opt.id
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span className="font-extrabold text-xs">{opt.label}</span>
                      <span
                        className={`text-[9px] mt-0.5 ${
                          config.categoryHoverEffect === opt.id ? 'text-slate-300' : 'text-slate-500'
                        }`}
                      >
                        {opt.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Subitem Hover Effect */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1.5">
                  Center Subitem Links Hover
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'underline', label: 'Underline' },
                    { id: 'arrow', label: 'Sliding Arrow (→)' },
                    { id: 'pill', label: 'Pill Highlight' },
                    { id: 'bold', label: 'Bold Weight' },
                    { id: 'color-shift', label: 'Color Shift' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => updateField('subitemHoverEffect', opt.id as any)}
                      className={`p-2 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                        config.subitemHoverEffect === opt.id
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-extrabold'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 font-bold'
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mega Menu Colors Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Dropdown Panel Colors
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: 'megaMenuBgColor', label: 'Dropdown Background', defaultHex: '#ffffff' },
                  { key: 'megaMenuTextColor', label: 'Text & Titles', defaultHex: '#0f172a' },
                  { key: 'megaMenuMutedColor', label: 'Subtle / Column Labels', defaultHex: '#94a3b8' },
                  { key: 'megaMenuBorderColor', label: 'Panel Divider Lines', defaultHex: '#e2e8f0' },
                ].map((c) => {
                  const val = String(config[c.key as keyof NavAppearanceConfig] || c.defaultHex);
                  return (
                    <div key={c.key} className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">{c.label}</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={val.startsWith('#') ? val : c.defaultHex}
                          onChange={(e) =>
                            updateField(c.key as keyof NavAppearanceConfig, e.target.value as any)
                          }
                          className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                        />
                        <input
                          type="text"
                          value={val}
                          onChange={(e) =>
                            updateField(c.key as keyof NavAppearanceConfig, e.target.value as any)
                          }
                          className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Category Tab Style Selector Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Left Category Tab Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'border-left', label: 'Solid Left Bar', desc: 'Lexido signature look' },
                  { id: 'pill', label: 'Rounded Pill', desc: 'Filled background badge' },
                  { id: 'underline', label: 'Underline', desc: 'Bottom accent border' },
                  { id: 'bold-only', label: 'Minimalist Bold', desc: 'Clean font weight shift' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('megaMenuActiveTabStyle', opt.id as any)}
                    className={`p-3 rounded-xl text-left border-2 transition cursor-pointer flex flex-col ${
                      config.megaMenuActiveTabStyle === opt.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <span className="font-extrabold text-xs">{opt.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        config.megaMenuActiveTabStyle === opt.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Active Tab Accent Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      config.megaMenuActiveTabColor.startsWith('#')
                        ? config.megaMenuActiveTabColor
                        : '#020617'
                    }
                    onChange={(e) => updateField('megaMenuActiveTabColor', e.target.value)}
                    className="w-8 h-8 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                  />
                  <input
                    type="text"
                    value={config.megaMenuActiveTabColor}
                    onChange={(e) => updateField('megaMenuActiveTabColor', e.target.value)}
                    className="w-24 text-xs font-mono font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Featured Editorial Promo Card & Height */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Right Promo Banner Card
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    High-fashion photography banner with discover button
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showPromoBanner}
                    onChange={(e) => updateField('showPromoBanner', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span className="text-xs font-bold text-slate-900">Show Card</span>
                </label>
              </div>

              {config.showPromoBanner && (
                <div className="space-y-3.5 pt-2 border-t border-slate-100">
                  {/* Promo Card Height Controls */}
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-700 uppercase">
                        Card Height Control
                      </span>
                      <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded border border-slate-200">
                        <span className="font-mono font-black text-xs text-slate-950">
                          {config.promoCardHeightPx || 390}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold">px</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="260"
                      max="500"
                      step="10"
                      value={config.promoCardHeightPx || 390}
                      onChange={(e) => updateField('promoCardHeightPx', Number(e.target.value))}
                      className="w-full cursor-pointer accent-slate-950"
                    />

                    <div className="flex items-center gap-1.5 pt-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Quick:</span>
                      {[
                        { px: 300, label: '300px (Compact)' },
                        { px: 390, label: '390px (Standard)' },
                        { px: 450, label: '450px (Tall)' },
                      ].map((opt) => (
                        <button
                          key={opt.px}
                          type="button"
                          onClick={() => updateField('promoCardHeightPx', opt.px)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border transition cursor-pointer ${
                            (config.promoCardHeightPx || 390) === opt.px
                              ? 'bg-slate-950 text-white border-slate-950'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Eyebrow Label
                      </label>
                      <input
                        type="text"
                        value={config.promoBannerEyebrow}
                        onChange={(e) => updateField('promoBannerEyebrow', e.target.value)}
                        placeholder="DISCOVER"
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Card Title
                      </label>
                      <input
                        type="text"
                        value={config.promoBannerTitle}
                        onChange={(e) => updateField('promoBannerTitle', e.target.value)}
                        placeholder="STREETWEAR"
                        className="w-full text-xs font-black uppercase px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <ImagePreviewInput
                      label="Banner Cover Photo"
                      value={config.promoBannerImageUrl}
                      onChange={(url) => updateField('promoBannerImageUrl', url)}
                      placeholder="Upload photo, paste URL, or pick from Media Storage"
                      aspectRatio="banner"
                      folder="banners"
                      description="Pick from Cloudflare storage, upload high-res photography, or select preset"
                    />

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Presets:</span>
                      {SAMPLE_PROMO_IMAGES.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => updateField('promoBannerImageUrl', img.url)}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 transition cursor-pointer"
                        >
                          {img.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Button Action Label
                      </label>
                      <input
                        type="text"
                        value={config.promoBannerActionLabel}
                        onChange={(e) => updateField('promoBannerActionLabel', e.target.value)}
                        placeholder="SHOP THE EDIT"
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase">
                          Destination URL
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsPromoRouteBuilderOpen(!isPromoRouteBuilderOpen)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                        >
                          <Compass className="w-3 h-3 text-indigo-600" />
                          {isPromoRouteBuilderOpen ? 'Close Dropdowns' : 'Route Dropdowns'}
                        </button>
                      </div>
                      <input
                        type="text"
                        value={config.promoBannerHref}
                        onChange={(e) => updateField('promoBannerHref', e.target.value)}
                        placeholder="/products?category=streetwear"
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  {isPromoRouteBuilderOpen && (
                    <div className="pt-2 border-t border-slate-100">
                      <HierarchicalLinkBuilder
                        currentHref={config.promoBannerHref}
                        currentLabel={config.promoBannerTitle}
                        onApply={(opt) => {
                          updateField('promoBannerHref', opt.href);
                          if (opt.label) updateField('promoBannerTitle', opt.label);
                          setIsPromoRouteBuilderOpen(false);
                        }}
                        onClose={() => setIsPromoRouteBuilderOpen(false)}
                      />
                    </div>
                  )}

                  {/* Dynamic Category Image Propagation Toggle */}
                  <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-200/80 space-y-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-black text-indigo-950 uppercase tracking-wide block">
                          Dynamic Category Photo
                        </span>
                        <p className="text-[10px] text-indigo-800">
                          Automatically switches banner image and title when hovering category tabs
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={config.useCategoryImagesInMegaMenu !== false}
                        onChange={(e) => updateField('useCategoryImagesInMegaMenu', e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                      />
                    </label>
                  </div>

                  {/* Banner Image Fit, Position & Content Alignment */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Image Object Fit
                      </label>
                      <select
                        value={config.promoBannerObjectFit || 'cover'}
                        onChange={(e) =>
                          updateField('promoBannerObjectFit', e.target.value as any)
                        }
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="cover">Cover (Luxury Fill Crop)</option>
                        <option value="contain">Contain (Full Image Uncropped)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Focal Point Position
                      </label>
                      <select
                        value={config.promoBannerPosition || 'center'}
                        onChange={(e) =>
                          updateField('promoBannerPosition', e.target.value as any)
                        }
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top Focus</option>
                        <option value="bottom">Bottom Focus</option>
                      </select>
                    </div>
                  </div>

                  {/* Gradient Style & Shadow Depth */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Gradient Overlay Style
                      </label>
                      <select
                        value={config.promoBannerGradientStyle || 'dark-bottom'}
                        onChange={(e) =>
                          updateField('promoBannerGradientStyle', e.target.value as any)
                        }
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="dark-bottom">Dark Bottom Fade (Classic)</option>
                        <option value="dark-full">Full Dim Overlay</option>
                        <option value="subtle-bottom">Subtle Bottom Fade</option>
                        <option value="radial">Radial Vignette Center</option>
                        <option value="none">No Overlay (Raw Photo)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Card Shadow Depth
                      </label>
                      <select
                        value={config.promoBannerShadow || 'xl'}
                        onChange={(e) =>
                          updateField('promoBannerShadow', e.target.value as any)
                        }
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="none">Flat (No Shadow)</option>
                        <option value="sm">Subtle (Sm)</option>
                        <option value="md">Medium (Md)</option>
                        <option value="lg">Elevated (Lg)</option>
                        <option value="xl">Dramatic Luxury (XL - Default)</option>
                        <option value="2xl">Deep Float (2XL)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Border Radius
                      </label>
                      <select
                        value={config.promoBannerBorderRadius}
                        onChange={(e) =>
                          updateField('promoBannerBorderRadius', e.target.value as any)
                        }
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="none">Square (None)</option>
                        <option value="md">Rounded (Md)</option>
                        <option value="lg">Large (Lg)</option>
                        <option value="xl">Extra Large (XL - Default)</option>
                        <option value="2xl">2XL</option>
                      </select>
                    </div>

                  <div className="pt-2 border-t border-slate-100">
                    <NineAlignmentMatrix
                      label="Banner Text Alignment (9-Point Matrix)"
                      description="Position overlay text and buttons anywhere across the banner (Figma & Word style)"
                      value={config.promoBannerAlignment || 'bottom-left'}
                      onChange={(align) => updateField('promoBannerAlignment', align)}
                    />
                  </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-700 uppercase">
                        Gradient Darkness / Intensity
                      </label>
                      <span className="text-xs font-bold text-slate-800">
                        {Math.round((config.promoBannerOverlayOpacity ?? 0.4) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="0.8"
                      step="0.05"
                      value={config.promoBannerOverlayOpacity ?? 0.4}
                      onChange={(e) =>
                        updateField('promoBannerOverlayOpacity', parseFloat(e.target.value))
                      }
                      className="w-full cursor-pointer accent-slate-950 mt-1"
                    />
                  </div>

                  {/* Promo Card Hover Zoom Toggle */}
                  <label className="flex items-center gap-2.5 pt-2 border-t border-slate-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.promoCardHoverZoom !== false}
                      onChange={(e) => updateField('promoCardHoverZoom', e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-900">
                      Enable Smooth Photo Zoom on Card Hover (1.05x)
                    </span>
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== SUBTAB 5: ACTION ICONS & TOP BAR ===================== */}
        {activeSubTab === 'icons' && (
          <div className="space-y-4">
            {/* Action Icons Visibility Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Storefront Action Icons
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { key: 'showSearch', label: 'Live Search Bar' },
                  { key: 'showAccount', label: 'Customer Account' },
                  { key: 'showWishlist', label: 'Wishlist Button' },
                  { key: 'showCart', label: 'Shopping Cart' },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2.5 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(config[item.key as keyof NavAppearanceConfig])}
                      onChange={(e) =>
                        updateField(item.key as keyof NavAppearanceConfig, e.target.checked as any)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-900">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Icon Button Shape Style */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Icon Button Style
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'rounded-button', label: 'Circle Pill', sub: 'Bordered' },
                  { id: 'minimal', label: 'Minimal Bare', sub: 'Borderless' },
                  { id: 'square-button', label: 'Square', sub: 'Bordered' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateField('iconStyle', opt.id as any)}
                    className={`p-2.5 rounded-xl text-center border-2 transition cursor-pointer flex flex-col items-center justify-center ${
                      config.iconStyle === opt.id
                        ? 'bg-slate-950 text-white border-slate-950 shadow-sm font-extrabold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 font-bold'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        config.iconStyle === opt.id ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {opt.sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Badge Colors Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
                Cart Item Counter Badge
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Badge Background</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        config.cartBadgeBgColor.startsWith('#')
                          ? config.cartBadgeBgColor
                          : '#0f172a'
                      }
                      onChange={(e) => updateField('cartBadgeBgColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                    />
                    <input
                      type="text"
                      value={config.cartBadgeBgColor}
                      onChange={(e) => updateField('cartBadgeBgColor', e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-700 block">Badge Number Color</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={
                        config.cartBadgeTextColor.startsWith('#')
                          ? config.cartBadgeTextColor
                          : '#ffffff'
                      }
                      onChange={(e) => updateField('cartBadgeTextColor', e.target.value)}
                      className="w-9 h-9 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 shrink-0 bg-white"
                    />
                    <input
                      type="text"
                      value={config.cartBadgeTextColor}
                      onChange={(e) => updateField('cartBadgeTextColor', e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Announcement Bar Companion Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Top Announcement Bar
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    Header companion for discounts and shipping alerts
                  </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showAnnouncementBar}
                    onChange={(e) => updateField('showAnnouncementBar', e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                  <span className="text-xs font-bold text-slate-900">Enable</span>
                </label>
              </div>

              {config.showAnnouncementBar && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                      Announcement Message
                    </label>
                    <input
                      type="text"
                      value={config.announcementMessage}
                      onChange={(e) => updateField('announcementMessage', e.target.value)}
                      placeholder="FREE EXPRESS SHIPPING ON ORDERS OVER $100"
                      className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        CTA Text
                      </label>
                      <input
                        type="text"
                        value={config.announcementCtaText || ''}
                        onChange={(e) => updateField('announcementCtaText', e.target.value)}
                        placeholder="SHOP NOW"
                        className="w-full text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                        Destination Link
                      </label>
                      <input
                        type="text"
                        value={config.announcementCtaUrl || ''}
                        onChange={(e) => updateField('announcementCtaUrl', e.target.value)}
                        placeholder="/products"
                        className="w-full text-xs font-mono px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">Bar Background</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            config.announcementBgColor.startsWith('#')
                              ? config.announcementBgColor
                              : '#000000'
                          }
                          onChange={(e) => updateField('announcementBgColor', e.target.value)}
                          className="w-8 h-8 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.announcementBgColor}
                          onChange={(e) => updateField('announcementBgColor', e.target.value)}
                          className="w-full text-xs font-mono font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700 block">Text Color</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={
                            config.announcementTextColor.startsWith('#')
                              ? config.announcementTextColor
                              : '#ffffff'
                          }
                          onChange={(e) => updateField('announcementTextColor', e.target.value)}
                          className="w-8 h-8 rounded-lg border-2 border-slate-300 cursor-pointer p-0.5 bg-white"
                        />
                        <input
                          type="text"
                          value={config.announcementTextColor}
                          onChange={(e) => updateField('announcementTextColor', e.target.value)}
                          className="w-full text-xs font-mono font-bold px-2 py-1 rounded-lg border border-slate-300 bg-white text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NavEditorPanel;
