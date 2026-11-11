'use client';

import React, { useState } from 'react';
import { CategoryGridConfig, CategoryCardItem } from '@/types/cms';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Sliders,
  FolderTree,
} from 'lucide-react';

export interface CategoryItemOption {
  id: string;
  name: string;
  parentId?: string | null;
  slug?: string;
  imageUrl?: string | null;
  description?: string | null;
}

export interface CollectionItemOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
}

export interface AttributeItemOption {
  id: string;
  name: string;
}

export interface CategoryCardsEditorProps {
  config: Partial<CategoryGridConfig> & Record<string, unknown>;
  onChange: (fieldKey: string, value: unknown) => void;
  categories?: CategoryItemOption[];
  collections?: CollectionItemOption[];
  attributes?: AttributeItemOption[];
}

/**
 * Curated high-resolution fashion stock presets used when a category has no image in DB.
 */
export const FASHION_IMAGE_PRESETS: Record<string, { label: string; image: string; subtitle: string; icon: string }> = {
  denim: {
    label: 'Premium Denim',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800&auto=format&fit=crop',
    subtitle: 'JAPANESE SELVEDGE',
    icon: '👖',
  },
  oversized: {
    label: 'Oversized Tees',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    subtitle: 'DROP SHOULDER TEES',
    icon: '👕',
  },
  cargo: {
    label: 'Utility Cargo',
    image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=800&auto=format&fit=crop',
    subtitle: 'UTILITY TROUSERS',
    icon: '🪖',
  },
  hoodies: {
    label: 'Heavyweight Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
    subtitle: 'FRENCH TERRY FLEECE',
    icon: '🧥',
  },
  tailoring: {
    label: 'Tailored Suits',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=800&auto=format&fit=crop',
    subtitle: 'ITALIAN WOOL BLEND',
    icon: '👔',
  },
  knitwear: {
    label: 'Fine Knitwear',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop',
    subtitle: 'ORGANIC MERINO & CASHMERE',
    icon: '🧶',
  },
  accessories: {
    label: 'Leather Goods',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop',
    subtitle: 'HANDCRAFTED ACCESSORIES',
    icon: '👜',
  },
  footwear: {
    label: 'Sneakers & Boots',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop',
    subtitle: 'MINIMALIST SILHOUETTES',
    icon: '👟',
  },
  minimalist: {
    label: 'The Edit',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop',
    subtitle: 'LIMITED ARCHIVAL PIECES',
    icon: '✨',
  },
};

export function CategoryCardsEditor({
  config,
  onChange,
  categories = [],
  collections = [],
  attributes = [],
}: CategoryCardsEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const cfg = config as Partial<CategoryGridConfig>;

  const rawItems: CategoryCardItem[] = Array.isArray(cfg.items) ? cfg.items : [];

  // Group categories into Parent and Subcategories
  const parentCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => Boolean(c.parentId));

  const handleCardFieldChange = (index: number, field: keyof CategoryCardItem, value: CategoryCardItem[keyof CategoryCardItem]) => {
    const updated = [...rawItems];
    if (!updated[index]) return;
    updated[index] = { ...updated[index], [field]: value };
    onChange('items', updated);
  };

  const handleAddCard = () => {
    const nextOrder = rawItems.length + 1;
    const newCard: CategoryCardItem = {
      id: `cat-card-${Date.now()}`,
      title: 'NEW CATEGORY',
      subtitle: 'EXPLORE RELEASES',
      categorySlug: 'new-arrivals',
      image: FASHION_IMAGE_PRESETS.denim.image,
      link: '/products?category=new-arrivals',
      ctaText: 'SHOP NOW',
      displayOrder: nextOrder,
      enabled: true,
      overlayOpacity: 0.3,
    };
    onChange('items', [...rawItems, newCard]);
    setExpandedIndex(rawItems.length);
  };

  const handleRemoveCard = (index: number) => {
    const updated = rawItems.filter((_, idx) => idx !== index);
    onChange('items', updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rawItems.length) return;

    const updated = [...rawItems];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);

    // Normalize displayOrder
    const reordered = updated.map((item, idx) => ({ ...item, displayOrder: idx + 1 }));
    onChange('items', reordered);
    setExpandedIndex(targetIndex);
  };

  const handleSelectDbCategory = (cardIndex: number, selectedId: string) => {
    if (!selectedId) return;

    // Check if it's a category
    const cat = categories.find((c) => c.id === selectedId || c.slug === selectedId);
    if (cat) {
      const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
      const updated = [...rawItems];

      // Auto-assign image: DB imageUrl -> fallback preset -> default
      let matchedImage = cat.imageUrl;
      let matchedSubtitle = cat.description || '';

      if (!matchedImage) {
        const lowerName = cat.name.toLowerCase();
        for (const [key, preset] of Object.entries(FASHION_IMAGE_PRESETS)) {
          if (lowerName.includes(key)) {
            matchedImage = preset.image;
            matchedSubtitle = matchedSubtitle || preset.subtitle;
            break;
          }
        }
      }

      if (!matchedImage) {
        matchedImage = FASHION_IMAGE_PRESETS.minimalist.image;
      }

      updated[cardIndex] = {
        ...updated[cardIndex],
        categoryId: cat.id,
        categorySlug: slug,
        title: cat.name.toUpperCase(),
        subtitle: matchedSubtitle || updated[cardIndex].subtitle || 'CURATED SILHOUETTES',
        link: `/products?category=${slug}`,
        image: matchedImage,
      };

      onChange('items', updated);
      return;
    }

    // Check if it's a collection
    const col = collections.find((c) => c.id === selectedId || c.slug === selectedId);
    if (col) {
      const slug = col.slug || col.name.toLowerCase().replace(/\s+/g, '-');
      const updated = [...rawItems];
      updated[cardIndex] = {
        ...updated[cardIndex],
        categorySlug: slug,
        title: col.name.toUpperCase(),
        subtitle: updated[cardIndex].subtitle || 'CURATED EDITORIAL',
        link: `/products?collection=${slug}`,
        image: col.imageUrl || updated[cardIndex].image || FASHION_IMAGE_PRESETS.minimalist.image,
      };
      onChange('items', updated);
      return;
    }

    // Check if it's an attribute
    if (selectedId.startsWith('attr:')) {
      const attrName = selectedId.replace('attr:', '');
      const slug = attrName.toLowerCase().replace(/\s+/g, '-');
      const updated = [...rawItems];
      updated[cardIndex] = {
        ...updated[cardIndex],
        categorySlug: slug,
        title: attrName.toUpperCase(),
        subtitle: updated[cardIndex].subtitle || `SHOP BY ${attrName.toUpperCase()}`,
        link: `/products?attribute=${slug}`,
        image: updated[cardIndex].image || FASHION_IMAGE_PRESETS.minimalist.image,
      };
      onChange('items', updated);
    }
  };

  const currentRadius = cfg.cardRadius || (cfg.cardRadiusPx !== undefined ? 'custom' : 'medium');
  const currentRadiusPx = cfg.cardRadiusPx ?? (currentRadius === 'none' ? 0 : currentRadius === 'small' ? 8 : currentRadius === 'medium' ? 16 : currentRadius === 'large' ? 24 : currentRadius === 'xlarge' ? 32 : 16);

  return (
    <div className="space-y-4">
      {/* 1. CARD ARCHITECTURE & STYLING */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-indigo-50 text-indigo-700">
              <Sliders className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
              Card Architecture &amp; Radius
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            Radius: {currentRadiusPx}px
          </span>
        </div>

        {/* Card Border Radius Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-700 block">
            Corner Border Radius
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
            {[
              { label: 'Sharp (0px)', value: 'none', px: 0 },
              { label: 'Subtle (8px)', value: 'small', px: 8 },
              { label: 'Round (16px)', value: 'medium', px: 16 },
              { label: 'Curved (24px)', value: 'large', px: 24 },
              { label: 'Pill (32px)', value: 'xlarge', px: 32 },
              { label: 'Full Round', value: 'full', px: 999 },
            ].map((preset) => {
              const isSelected =
                cfg.cardRadiusPx === preset.px ||
                (!cfg.cardRadiusPx && cfg.cardRadius === preset.value);
              return (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    onChange('cardRadius', preset.value);
                    onChange('cardRadiusPx', preset.px);
                  }}
                  className={`p-2 rounded-lg text-[10px] font-extrabold uppercase transition border text-center cursor-pointer ${
                    isSelected
                      ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Precision Radius Slider */}
          <div className="pt-2">
            <div className="flex justify-between text-[10px] text-slate-600 font-semibold mb-1">
              <span>Precision Radius Slider</span>
              <span className="font-mono font-bold text-slate-900">{currentRadiusPx}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="48"
              step="2"
              value={currentRadiusPx}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChange('cardRadiusPx', val);
                onChange('cardRadius', val === 0 ? 'none' : val <= 8 ? 'small' : val <= 16 ? 'medium' : val <= 24 ? 'large' : 'xlarge');
              }}
              className="w-full accent-slate-950 cursor-pointer"
            />
          </div>
        </div>

        {/* Aspect Ratio & Desktop Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Card Aspect Ratio
            </label>
            <select
              value={cfg.aspectRatio || 'portrait'}
              onChange={(e) => onChange('aspectRatio', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
            >
              <option value="portrait">Portrait 3:4 (Editorial Standard)</option>
              <option value="tall">Tall 4:5 (Model Showcase)</option>
              <option value="square">Square 1:1 (Uniform Grid)</option>
              <option value="landscape">Landscape 4:3 (Wide Card)</option>
              <option value="wide">Wide 16:9 (Cinematic Banner)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Desktop Columns
            </label>
            <select
              value={cfg.columnsDesktop || 4}
              onChange={(e) => onChange('columnsDesktop', Number(e.target.value))}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
            >
              <option value={2}>2 Columns (Large Cards)</option>
              <option value={3}>3 Columns (Standard)</option>
              <option value={4}>4 Columns (Matches Attached Ref)</option>
              <option value={6}>6 Columns (Compact Grid)</option>
            </select>
          </div>
        </div>

        {/* Hover Effects & Shadows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Hover Interaction
            </label>
            <select
              value={cfg.cardHoverEffect || 'zoom'}
              onChange={(e) => onChange('cardHoverEffect', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
            >
              <option value="zoom">Smooth Zoom (105% Scale)</option>
              <option value="zoom-lg">High Zoom (110% Scale)</option>
              <option value="lift">Card Float &amp; Lift Up</option>
              <option value="glow">Accent Outline Glow</option>
              <option value="none">Static (No Animation)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Card Shadow / Depth
            </label>
            <select
              value={cfg.cardShadow || 'md'}
              onChange={(e) => onChange('cardShadow', e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
            >
              <option value="none">Flat (No Shadow)</option>
              <option value="sm">Subtle (sm)</option>
              <option value="md">Medium / Standard (md)</option>
              <option value="xl">Elevated / Deep (xl)</option>
              <option value="2xl">Dramatic Float (2xl)</option>
            </select>
          </div>
        </div>

        {/* Global Card Eyebrow & CTA defaults */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Default Card Eyebrow
            </label>
            <input
              type="text"
              value={cfg.cardEyebrow || 'EXPLORE CATEGORY'}
              onChange={(e) => onChange('cardEyebrow', e.target.value)}
              placeholder="e.g. EXPLORE CATEGORY"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-700 block">
              Default Card CTA Label
            </label>
            <input
              type="text"
              value={cfg.cardCtaText || 'SHOP NOW'}
              onChange={(e) => onChange('cardCtaText', e.target.value)}
              placeholder="e.g. SHOP NOW"
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* 2. CATEGORY CARDS LIST (WITH DB DROPDOWNS & IMAGES) */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-emerald-50 text-emerald-700">
              <Layers className="w-3.5 h-3.5" />
            </span>
            <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
              Category Cards ({rawItems.length})
            </h4>
          </div>

          <button
            type="button"
            onClick={handleAddCard}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-extrabold uppercase transition shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Card</span>
          </button>
        </div>

        {rawItems.length === 0 ? (
          <div className="p-6 text-center rounded-xl border border-dashed border-slate-300 bg-slate-50 space-y-2">
            <p className="text-xs font-bold text-slate-700">No category cards configured in this section.</p>
            <button
              type="button"
              onClick={handleAddCard}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              + Create First Card
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {rawItems.map((card, idx) => {
              const isExpanded = expandedIndex === idx;
              return (
                <div
                  key={card.id || `card-${idx}`}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden transition-all"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                    className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 cursor-pointer border-b border-slate-100"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                      {/* Image Thumbnail */}
                      <div className="w-9 h-12 rounded-md overflow-hidden bg-slate-200 border border-slate-200 shrink-0">
                        {card.image ? (
                          <img
                            src={card.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{idx + 1}</span>
                          <p className="text-xs font-extrabold text-slate-900 truncate uppercase">
                            {card.title || 'Untitled Card'}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                          {card.link || '/products'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Reorder Buttons */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCard(idx, 'up');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Card Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        disabled={idx === rawItems.length - 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCard(idx, 'down');
                        }}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                        title="Move Card Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCard(idx);
                        }}
                        className="p-1 rounded text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer"
                        title="Delete Card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <span className="text-slate-400 pl-1">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Card Edit Form */}
                  {isExpanded && (
                    <div className="p-3.5 space-y-3.5 bg-slate-50/80">
                      {/* 1. Fast Database Category Link Picker */}
                      <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <FolderTree className="w-3.5 h-3.5 text-indigo-700" />
                          <label className="text-[10px] font-extrabold uppercase tracking-tight text-indigo-950">
                            Auto-Link from Database Categories &amp; Collections
                          </label>
                        </div>

                        <select
                          value={card.categoryId || card.categorySlug || ''}
                          onChange={(e) => handleSelectDbCategory(idx, e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 rounded-md border border-indigo-300 bg-white text-slate-900 font-semibold cursor-pointer shadow-2xs"
                        >
                          <option value="">-- Choose Category / Subcategory to Auto-Fill --</option>
                          {parentCategories.length > 0 && (
                            <optgroup label="Main Categories (Parent)">
                              {parentCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  📁 {c.name.toUpperCase()} (/{c.slug})
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {subCategories.length > 0 && (
                            <optgroup label="Subcategories (Child)">
                              {subCategories.map((c) => (
                                <option key={c.id} value={c.id}>
                                  ↳ {c.name.toUpperCase()}
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {collections.length > 0 && (
                            <optgroup label="Collections &amp; Campaigns">
                              {collections.map((col) => (
                                <option key={col.id} value={col.id}>
                                  ✨ {col.name.toUpperCase()} (Collection)
                                </option>
                              ))}
                            </optgroup>
                          )}
                          {attributes.length > 0 && (
                            <optgroup label="Global Attributes">
                              {attributes.map((attr) => (
                                <option key={attr.id} value={`attr:${attr.name}`}>
                                  🏷️ {attr.name.toUpperCase()} (Attribute)
                                </option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        <span className="text-[9px] text-indigo-700 block">
                          Auto-fills card title, redirection link, and category photo from database.
                        </span>
                      </div>

                      {/* 2. Image Source: Preview + URL + Upload + Existing Media */}
                      <div className="space-y-1.5">
                        <ImagePreviewInput
                          label="Card Media Asset"
                          value={card.image || ''}
                          placeholder="Image URL or Cloudflare R2 / media upload"
                          onChange={(url) => handleCardFieldChange(idx, 'image', url)}
                          aspectRatio="video"
                          folder="categories"
                          description="Preview, paste URL, upload, or pick from media library"
                        />

                        {/* Quick Fashion Preset Image Chips */}
                        <div className="pt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Quick Fashion Photos (1-Click Apply):
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(FASHION_IMAGE_PRESETS).map(([key, preset]) => (
                              <button
                                key={key}
                                type="button"
                                onClick={() => {
                                  handleCardFieldChange(idx, 'image', preset.image);
                                  if (!card.subtitle) {
                                    handleCardFieldChange(idx, 'subtitle', preset.subtitle);
                                  }
                                }}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white hover:bg-slate-900 hover:text-white border border-slate-200 transition text-slate-700 cursor-pointer shadow-2xs"
                              >
                                {preset.icon} {preset.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 3. Text Fields: Eyebrow, Title, Subtitle */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 block">Card Title</label>
                          <input
                            type="text"
                            value={card.title || ''}
                            onChange={(e) => handleCardFieldChange(idx, 'title', e.target.value)}
                            placeholder="e.g. PREMIUM DENIM"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 block">Subtitle / Spec</label>
                          <input
                            type="text"
                            value={card.subtitle || ''}
                            onChange={(e) => handleCardFieldChange(idx, 'subtitle', e.target.value)}
                            placeholder="e.g. JAPANESE SELVEDGE"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                          />
                        </div>
                      </div>

                      {/* 4. Redirection Link & CTA */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <LinkIcon className="w-3 h-3 text-slate-500" />
                            <label className="text-[10px] font-bold text-slate-700 block">Redirection Link URL</label>
                          </div>
                          <input
                            type="text"
                            value={card.link || ''}
                            onChange={(e) => handleCardFieldChange(idx, 'link', e.target.value)}
                            placeholder="e.g. /products?category=denim"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono text-slate-900"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 block">CTA Label</label>
                          <input
                            type="text"
                            value={card.ctaText || 'SHOP NOW'}
                            onChange={(e) => handleCardFieldChange(idx, 'ctaText', e.target.value)}
                            placeholder="SHOP NOW"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-bold"
                          />
                        </div>
                      </div>

                      {/* 5. Custom Card Eyebrow & Overlay */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-700 block">Eyebrow Override</label>
                          <input
                            type="text"
                            value={card.eyebrow || ''}
                            onChange={(e) => handleCardFieldChange(idx, 'eyebrow', e.target.value)}
                            placeholder="Defaults to section eyebrow"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-slate-700">
                            <span>Dark Vignette Opacity</span>
                            <span className="font-mono">{Math.round((card.overlayOpacity ?? 0.3) * 100)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="0.8"
                            step="0.05"
                            value={card.overlayOpacity ?? 0.3}
                            onChange={(e) => handleCardFieldChange(idx, 'overlayOpacity', Number(e.target.value))}
                            className="w-full accent-slate-950 cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Active toggle */}
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={card.enabled !== false}
                            onChange={(e) => handleCardFieldChange(idx, 'enabled', e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-slate-950"
                          />
                          <span>Show Card on Storefront</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
export default CategoryCardsEditor;
