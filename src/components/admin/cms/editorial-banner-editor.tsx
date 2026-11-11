'use client';

import * as React from 'react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import {
  Sparkles,
  Sliders,
  Check,
  ImageIcon,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  FileText,
  MousePointerClick,
} from 'lucide-react';
import {
  type CategoryItemOption,
  type CollectionItemOption,
  type AttributeItemOption,
} from './category-cards-editor';

export interface EditorialBannerConfig {
  id?: string;
  name?: string;
  type?: string;
  layout?: 'manifesto-card' | 'ritual-checklist' | 'image-left' | 'image-right' | 'full-width-overlay';
  eyebrow?: string;
  heading?: string;
  description?: string;
  image?: string;
  badgeText?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  checklistText?: string;
  checklistItems?: string[];
  cardRadius?: 'none' | 'small' | 'medium' | 'large' | 'xlarge' | 'full';
  cardRadiusPx?: number;
  [key: string]: unknown;
}

export interface EditorialBannerEditorProps {
  config: Partial<EditorialBannerConfig> & Record<string, unknown>;
  onChange: (field: string, value: unknown) => void;
  categories?: CategoryItemOption[];
  collections?: CollectionItemOption[];
  attributes?: AttributeItemOption[];
}

export const EDITORIAL_IMAGE_PRESETS = [
  {
    label: 'Dark Luxury Runway',
    tag: 'Haute Couture',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Minimalist Studio Drapery',
    tag: 'Editorial',
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Japanese Selvedge Loom',
    tag: 'Craftsmanship',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Sartorial Tailoring',
    tag: 'Structure',
    url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Archival Monochrome',
    tag: 'Manifesto',
    url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    label: 'Raw Denim & Leather',
    tag: 'Heritage',
    url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=1200&auto=format&fit=crop',
  },
];

export function EditorialBannerEditor({
  config,
  onChange,
  categories = [],
  collections = [],
}: EditorialBannerEditorProps) {
  const cfg = config as Partial<EditorialBannerConfig>;

  // Checklist items helper
  const rawItems = Array.isArray(cfg.checklistItems) && cfg.checklistItems.length > 0
    ? cfg.checklistItems
    : typeof cfg.checklistText === 'string' && cfg.checklistText.trim()
    ? cfg.checklistText.split('\n').map((s) => s.trim()).filter(Boolean)
    : ['LUXURY MAGNETIC BOX', 'EMBOSSED BRAND TAGS', 'HAND-SIGNED THANK-YOU CARD'];

  const [checklist, setChecklist] = React.useState<string[]>(rawItems);

  const updateChecklist = (newItems: string[]) => {
    setChecklist(newItems);
    onChange('checklistItems', newItems);
    onChange('checklistText', newItems.join('\n'));
  };

  const handleAddChecklistItem = () => {
    const updated = [...checklist, 'ARCHIVAL PACKAGING'];
    updateChecklist(updated);
  };

  const handleRemoveChecklistItem = (idx: number) => {
    const updated = checklist.filter((_, i) => i !== idx);
    updateChecklist(updated);
  };

  const handleUpdateChecklistItem = (idx: number, val: string) => {
    const updated = [...checklist];
    updated[idx] = val;
    updateChecklist(updated);
  };

  return (
    <div className="space-y-4">
      {/* 1. Layout Mode Selection */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-900">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h4 className="text-[11px] font-extrabold uppercase tracking-tight">Editorial Layout Architecture</h4>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {[
            {
              id: 'manifesto-card',
              title: 'Manifesto Card',
              desc: 'Dark split box + full portrait media',
            },
            {
              id: 'ritual-checklist',
              title: 'The Ritual Checklist',
              desc: 'Image left + white box bullet list',
            },
            {
              id: 'image-left',
              title: 'Image Left',
              desc: 'Clean 50/50 split with text on right',
            },
            {
              id: 'image-right',
              title: 'Image Right',
              desc: 'Clean 50/50 split with text on left',
            },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange('layout', mode.id)}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer ${
                (cfg.layout || 'manifesto-card') === mode.id
                  ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="text-[11px] font-extrabold uppercase">{mode.title}</div>
              <div className={`text-[10px] mt-0.5 line-clamp-1 ${
                (cfg.layout || 'manifesto-card') === mode.id ? 'text-slate-300' : 'text-slate-400'
              }`}>
                {mode.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Card Border Radius & Geometry */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-900">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <h4 className="text-[11px] font-extrabold uppercase tracking-tight">Card Radius & Geometry</h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
            {cfg.cardRadiusPx !== undefined ? `${cfg.cardRadiusPx}px` : (cfg.cardRadius || 'Sharp (0px)')}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: 'none', label: 'Sharp', px: 0 },
            { id: 'small', label: 'Subtle', px: 8 },
            { id: 'medium', label: 'Round', px: 16 },
            { id: 'large', label: 'Curved', px: 24 },
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => {
                onChange('cardRadius', preset.id);
                onChange('cardRadiusPx', preset.px);
              }}
              className={`p-2 rounded-lg text-[10px] font-bold uppercase transition text-center cursor-pointer ${
                (cfg.cardRadius || 'none') === preset.id
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight shrink-0">
            Precision Slider:
          </span>
          <input
            type="range"
            min={0}
            max={48}
            step={2}
            value={cfg.cardRadiusPx ?? 0}
            onChange={(e) => {
              const val = Number(e.target.value);
              onChange('cardRadiusPx', val);
              onChange('cardRadius', val === 0 ? 'none' : val <= 8 ? 'small' : val <= 16 ? 'medium' : val <= 24 ? 'large' : 'xlarge');
            }}
            className="w-full accent-slate-950 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono font-extrabold text-slate-900 w-8 text-right shrink-0">
            {cfg.cardRadiusPx ?? 0}px
          </span>
        </div>
      </div>

      {/* 3. Editorial Media Asset & 1-Click Fashion Presets */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-slate-900">
            <ImageIcon className="w-4 h-4 text-indigo-600" />
            <h4 className="text-[11px] font-extrabold uppercase tracking-tight">Editorial Campaign Media Asset</h4>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase">High-Res</span>
        </div>

        {/* Full Image Asset: Preview + URL + Upload + Existing Media */}
        <ImagePreviewInput
          label="Campaign Media Asset"
          value={cfg.image || ''}
          placeholder="https://images.unsplash.com/... or media upload"
          onChange={(url) => onChange('image', url)}
          aspectRatio="wide"
          folder="banners"
          description="Live preview with file upload, URL input, and existing media library"
        />

        {/* 1-Click Curated Presets */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>1-Click Fashion Campaign Presets</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {EDITORIAL_IMAGE_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() => onChange('image', preset.url)}
                className={`p-1.5 rounded-lg border text-left transition flex items-center gap-2 cursor-pointer ${
                  cfg.image === preset.url
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-slate-200 hover:border-slate-400 bg-white text-slate-700'
                }`}
              >
                <img src={preset.url} alt="" className="w-7 h-7 rounded object-cover shrink-0" />
                <div className="truncate">
                  <div className="text-[10px] font-bold truncate leading-tight">{preset.label}</div>
                  <div className="text-[9px] text-slate-400 uppercase">{preset.tag}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Action Button & Database Redirection */}
      <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center gap-1.5 text-slate-900">
          <MousePointerClick className="w-4 h-4 text-indigo-600" />
          <h4 className="text-[11px] font-extrabold uppercase tracking-tight">Call-To-Action & Navigation Link</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-tight text-slate-700">Button Label</label>
            <input
              type="text"
              value={cfg.primaryCtaText || ''}
              onChange={(e) => onChange('primaryCtaText', e.target.value)}
              placeholder="e.g. OUR STORY"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-tight text-slate-700">Target URL</label>
            <input
              type="text"
              value={cfg.primaryCtaUrl || ''}
              onChange={(e) => onChange('primaryCtaUrl', e.target.value)}
              placeholder="/about or /products"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-900"
            />
          </div>
        </div>

        {/* Low-Latency Quick Database Link Selector */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <label className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
            <ExternalLink className="w-3 h-3 text-indigo-600" />
            <span>Link Directly to Catalog Entity</span>
          </label>
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                onChange('primaryCtaUrl', e.target.value);
              }
            }}
            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-medium text-slate-800 cursor-pointer"
          >
            <option value="">— Select Catalog Destination —</option>
            <optgroup label="Core Pages">
              <option value="/about">About Us / Manifesto (/about)</option>
              <option value="/products">All Products (/products)</option>
              <option value="/contact">Contact Support (/contact)</option>
            </optgroup>
            {categories.length > 0 && (
              <optgroup label="Product Categories">
                {categories.map((c) => (
                  <option key={c.id} value={`/products?category=${c.slug}`}>
                    {c.parentId ? `└ ${c.name}` : c.name} (/products?category={c.slug})
                  </option>
                ))}
              </optgroup>
            )}
            {collections.length > 0 && (
              <optgroup label="Curated Collections">
                {collections.map((col) => (
                  <option key={col.id} value={`/collections/${col.slug}`}>
                    ★ {col.name} (/collections/{col.slug})
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* 5. Ritual Checklist Manager (Available for checklist modes) */}
      {(cfg.layout === 'ritual-checklist' || (cfg.checklistItems && cfg.checklistItems.length > 0)) && (
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-900">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h4 className="text-[11px] font-extrabold uppercase tracking-tight">Ritual Checklist Bullet Points</h4>
            </div>
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-2 py-0.5 rounded bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add Item
            </button>
          </div>

          <div className="space-y-1.5">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2 h-2 bg-slate-950 shrink-0" />
                <input
                  type="text"
                  value={item}
                  onChange={(e) => handleUpdateChecklistItem(idx, e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-900 uppercase"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveChecklistItem(idx)}
                  className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                  title="Remove item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

