'use client';

import React, { useState } from 'react';
import { EditorSchema, FieldSchema } from '@/types/cms';
import {
  FileText,
  SlidersHorizontal,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Sliders,
} from 'lucide-react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { NineAlignmentMatrix } from '@/components/ui/nine-alignment-matrix';
import { ProductAttributeFilterForm } from './product-attribute-filter-form';
import { type ProductData } from '@/components/commerce/configurable-product-card';

export interface DynamicEditorFormProps {
  schema: EditorSchema;
  config: Record<string, any>;
  onChange: (fieldKey: string, val: any) => void;
  categories?: { id: string; name: string; parentId?: string | null; slug?: string; imageUrl?: string | null }[];
  brands?: { id: string; name: string }[];
  products?: ProductData[];
  collections?: { id: string; name: string; slug: string; imageUrl?: string | null }[];
  attributes?: { id: string; name: string }[];
}

export const UNIVERSAL_FASHION_IMAGE_PRESETS = [
  { label: 'Runway Haute Couture', url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800&auto=format&fit=crop' },
  { label: 'Minimalist Studio Drapery', url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop' },
  { label: 'Japanese Raw Denim', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop' },
  { label: 'Bespoke Tailoring Suit', url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop' },
  { label: 'Italian Cashmere Knit', url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop' },
  { label: 'Artisanal Leather Craft', url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop' },
  { label: 'Monochrome Streetwear', url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop' },
  { label: 'Footwear & Chelsea Boots', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop' },
];

export function DynamicEditorForm({
  schema,
  config,
  onChange,
  categories = [],
  brands = [],
  products = [],
  collections = [],
  attributes = [],
}: DynamicEditorFormProps) {
  const [activeSubTab, setActiveSubTab] = useState<'content' | 'layout'>('content');

  const isProductSection =
    config.type === 'PRODUCT_GRID' ||
    config.type === 'PRODUCT_CAROUSEL' ||
    config.type === 'FEATURED_PRODUCTS' ||
    config.type === 'BESTSELLERS_SHOWCASE' ||
    config.type === 'FLASH_SALE_GRID' ||
    config.type === 'SEASONAL_SALE_GRID' ||
    config.type === 'LIMITED_EDITION_GRID' ||
    config.type === 'OFFERS_BUNDLE_GRID' ||
    config.type === 'FESTIVE_BUNDLE_GRID' ||
    config.type === 'BUNDLE_SAVE_SHOWCASE' ||
    config.productSource !== undefined;

  // Multi-item support (items array)
  const items = Array.isArray(config.items) ? config.items : null;

  const handleItemChange = (index: number, field: string, val: any) => {
    if (!items) return;
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: val };
    onChange('items', updated);
  };

  const handleAddItem = () => {
    const current = items || [];
    const newItem = {
      id: `item-${Date.now()}`,
      title: `Item #${current.length + 1}`,
      subtitle: 'Optional subtitle',
      link: '/products',
      image: UNIVERSAL_FASHION_IMAGE_PRESETS[current.length % UNIVERSAL_FASHION_IMAGE_PRESETS.length].url,
      enabled: true,
    };
    onChange('items', [...current, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (!items) return;
    const updated = items.filter((_, idx) => idx !== index);
    onChange('items', updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (!items) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange('items', updated);
  };

  const renderField = (field: FieldSchema) => {
    const value = config[field.key] ?? field.defaultValue ?? '';

    // Detect if this is an image field
    const isImageField =
      field.type === 'image' ||
      ['image', 'img', 'media', 'banner', 'photo', 'thumbnail', 'cover', 'backdrop', 'logo'].some(
        (kw) => field.key.toLowerCase().includes(kw)
      );

    if (isImageField) {
      return (
        <div key={field.key} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
          <ImagePreviewInput
            label={field.label}
            value={value}
            placeholder={field.placeholder || 'https://images.unsplash.com/...'}
            onChange={(val) => onChange(field.key, val)}
            aspectRatio={field.key.toLowerCase().includes('banner') ? 'banner' : 'video'}
            description="Live image preview with 1-click curated fallbacks"
          />

          {/* 1-Click Curated Presets Bar */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-slate-500">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>1-Click Fashion Image Presets</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {UNIVERSAL_FASHION_IMAGE_PRESETS.slice(0, 4).map((p) => (
                <button
                  key={p.url}
                  type="button"
                  onClick={() => onChange(field.key, p.url)}
                  className={`p-1.5 rounded-lg border text-left transition flex items-center gap-1.5 cursor-pointer ${
                    value === p.url
                      ? 'border-indigo-600 bg-indigo-50 font-bold text-indigo-950'
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50 text-slate-700'
                  }`}
                >
                  <img src={p.url} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                  <span className="text-[9px] font-semibold truncate leading-tight">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
    }

    // Detect if this is a Link / URL field
    const isLinkField =
      field.type === 'url' ||
      ['link', 'url', 'href', 'ctaurl', 'primaryctaurl', 'buttonurl', 'followurl'].some(
        (kw) => field.key.toLowerCase().includes(kw)
      );

    if (isLinkField) {
      return (
        <div key={field.key} className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <span className="text-[10px] text-slate-400 font-mono">URL / Link</span>
          </div>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(field.key, e.target.value)}
            placeholder={field.placeholder || '/products or /about'}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono focus:outline-none focus:border-slate-950 shadow-2xs"
          />

          {/* Low-Latency Database Entity Dropdown */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) {
                  onChange(field.key, e.target.value);
                }
              }}
              className="w-full text-[11px] px-2 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 font-medium cursor-pointer"
            >
              <option value="">— Link to DB Category or Collection —</option>
              <optgroup label="Core Pages">
                <option value="/products">All Products (/products)</option>
                <option value="/about">About Us (/about)</option>
                <option value="/contact">Contact Support (/contact)</option>
                <option value="/cart">Shopping Bag (/cart)</option>
              </optgroup>
              {categories.length > 0 && (
                <optgroup label="Catalog Categories">
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
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-950 shadow-2xs"
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <textarea
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              rows={3}
              placeholder={field.placeholder}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:border-slate-950 shadow-2xs"
            />
          </div>
        );

      case 'number':
        return (
          <div key={field.key} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => onChange(field.key, Number(e.target.value))}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-slate-950 shadow-2xs"
            />
          </div>
        );

      case 'boolean':
        return (
          <div key={field.key} className="flex items-center justify-between py-2 border-b border-slate-200">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onChange(field.key, e.target.checked)}
              className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950 border-slate-300 cursor-pointer"
            />
          </div>
        );

      case 'color':
        return (
          <div key={field.key} className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={value || '#000000'}
                onChange={(e) => onChange(field.key, e.target.value)}
                className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer bg-white p-0.5 shadow-2xs"
              />
              <input
                type="text"
                value={value}
                onChange={(e) => onChange(field.key, e.target.value)}
                placeholder="#000000"
                className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-mono font-semibold focus:outline-none focus:border-slate-950 shadow-2xs"
              />
            </div>
          </div>
        );

      case 'select':
        if (field.key.toLowerCase().includes('align') || field.key.toLowerCase().includes('position')) {
          const hasOnlyHorizontal = field.options && field.options.length > 0 && field.options.every((o) => ['left', 'center', 'right'].includes(o.value));
          return (
            <div key={field.key} className="space-y-1 p-3 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <NineAlignmentMatrix
                label={field.label}
                description={field.description}
                value={value}
                onChange={(val, h) => {
                  onChange(field.key, hasOnlyHorizontal ? h : val);
                }}
              />
            </div>
          );
        }

        return (
          <div key={field.key} className="space-y-1">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight">{field.label}</label>
            <select
              value={value}
              onChange={(e) => onChange(field.key, e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-slate-950 shadow-2xs cursor-pointer"
            >
              {(field.options || []).map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4 text-slate-900 font-sans">
      {/* Sub-Tab Selector Header */}
      <div className="flex border-b border-slate-200 gap-1 pb-1">
        <button
          type="button"
          onClick={() => setActiveSubTab('content')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'content'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>CONTENT & ATTRIBUTES</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('layout')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeSubTab === 'layout'
              ? 'bg-slate-950 text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>GEOMETRY & RESPONSIVE</span>
        </button>
      </div>

      {/* Tab 1: CONTENT */}
      {activeSubTab === 'content' && (
        <div className="space-y-3.5">
          {/* Section Custom Name */}
          <div className="space-y-1 pb-2 border-b border-slate-200">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-tight flex items-center justify-between">
              <span>Section Custom Name</span>
              <span className="text-[10px] text-slate-400 font-normal uppercase">Visual Studio Label</span>
            </label>
            <input
              type="text"
              value={config.name || ''}
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="e.g. 05 — TRUST HIGHLIGHTS"
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:border-slate-950 shadow-2xs"
            />
          </div>

          {/* Product Section Attribute Filter Suite */}
          {isProductSection && (
            <div className="pt-1">
              <ProductAttributeFilterForm
                config={config}
                onChange={onChange}
                categories={categories}
                brands={brands}
                allProducts={products}
              />
            </div>
          )}

          {/* Schema Fields */}
          {schema && schema.fields && schema.fields.length > 0 && (
            <div className="space-y-3">
              {schema.fields
                .filter(
                  (f) =>
                    !isProductSection ||
                    (f.key !== 'productSource' &&
                      f.key !== 'attributeName' &&
                      f.key !== 'attributeValue')
                )
                .map(renderField)}
            </div>
          )}

          {/* Multi-Item Manager (if items array exists on config) */}
          {items && (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-900">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-[11px] font-extrabold uppercase tracking-tight">
                    Component Items ({items.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[10px] font-extrabold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Item
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-[11px] font-extrabold text-slate-900 uppercase">
                        Item #{idx + 1} {item.title ? `— ${item.title}` : ''}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-950 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'down')}
                          disabled={idx === items.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-950 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleItemChange(idx, 'title', e.target.value)}
                        placeholder="Item Title"
                        className="px-2 py-1 rounded border border-slate-300 bg-white font-bold text-slate-900"
                      />
                      <input
                        type="text"
                        value={item.subtitle || ''}
                        onChange={(e) => handleItemChange(idx, 'subtitle', e.target.value)}
                        placeholder="Subtitle / Caption"
                        className="px-2 py-1 rounded border border-slate-300 bg-white text-slate-700"
                      />
                    </div>

                    {item.link !== undefined && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold text-slate-700">Target Link</label>
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) handleItemChange(idx, 'link', e.target.value);
                            }}
                            className="text-[10px] py-0.5 px-1.5 rounded border border-slate-200 bg-white text-indigo-700 font-semibold cursor-pointer"
                          >
                            <option value="">🔗 Quick Link to Catalog Entity...</option>
                            <optgroup label="Core Pages">
                              <option value="/products">All Products</option>
                              <option value="/cart">Cart</option>
                              <option value="/checkout">Checkout</option>
                              <option value="/about">About Us</option>
                            </optgroup>
                            {categories && categories.length > 0 && (
                              <optgroup label="Categories">
                                {categories.map((c: any) => (
                                  <option key={c.id} value={`/products?category=${c.slug || c.id}`}>
                                    📁 {c.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                            {collections && collections.length > 0 && (
                              <optgroup label="Collections">
                                {collections.map((col: any) => (
                                  <option key={col.id} value={`/collections/${col.slug || col.id}`}>
                                    ✨ {col.name}
                                  </option>
                                ))}
                              </optgroup>
                            )}
                          </select>
                        </div>
                        <input
                          type="text"
                          value={item.link || ''}
                          onChange={(e) => handleItemChange(idx, 'link', e.target.value)}
                          placeholder="Target Link: /products?category=..."
                          className="w-full px-2 py-1 rounded border border-slate-300 bg-white text-[11px] font-mono text-slate-800"
                        />
                      </div>
                    )}

                    {/* Item Image Asset: Preview + URL + Upload + Existing Media */}
                    {(item.image !== undefined ||
                      item.imageUrl !== undefined ||
                      item.mediaUrl !== undefined ||
                      item.photo !== undefined ||
                      item.src !== undefined) &&
                      (() => {
                        const imgKey =
                          item.image !== undefined
                            ? 'image'
                            : item.imageUrl !== undefined
                            ? 'imageUrl'
                            : item.mediaUrl !== undefined
                            ? 'mediaUrl'
                            : item.photo !== undefined
                            ? 'photo'
                            : 'src';

                        return (
                          <div className="space-y-1.5 pt-1">
                            <ImagePreviewInput
                              label={`Item #${idx + 1} Image Asset`}
                              value={item[imgKey] || ''}
                              placeholder="Image URL or Cloudflare R2 / media upload"
                              onChange={(val) => handleItemChange(idx, imgKey, val)}
                              aspectRatio="video"
                              folder="items"
                              description="Preview, paste URL, upload, or choose from media library"
                            />
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase shrink-0">Presets:</span>
                              {UNIVERSAL_FASHION_IMAGE_PRESETS.slice(0, 4).map((p) => (
                                <button
                                  key={p.url}
                                  type="button"
                                  onClick={() => handleItemChange(idx, imgKey, p.url)}
                                  className="px-2 py-0.5 rounded text-[9px] font-semibold bg-white hover:bg-slate-900 hover:text-white border border-slate-200 transition shrink-0 cursor-pointer shadow-2xs"
                                >
                                  {p.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: GEOMETRY & RESPONSIVE */}
      {activeSubTab === 'layout' && (
        <div className="space-y-4 text-xs">
          {/* Universal Card Radius & Geometry Control */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-slate-900">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <label className="font-extrabold uppercase tracking-tight block">
                  Component Card Radius
                </label>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                {config.cardRadiusPx !== undefined ? `${config.cardRadiusPx}px` : (config.cardRadius || 'Standard (16px)')}
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
                  className={`p-1.5 rounded-lg text-[10px] font-bold uppercase transition text-center cursor-pointer ${
                    (config.cardRadius || 'medium') === preset.id
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
                value={config.cardRadiusPx ?? (config.cardRadius === 'none' ? 0 : 16)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  onChange('cardRadiusPx', val);
                  onChange('cardRadius', val === 0 ? 'none' : val <= 8 ? 'small' : val <= 16 ? 'medium' : val <= 24 ? 'large' : 'xlarge');
                }}
                className="w-full accent-slate-950 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[11px] font-mono font-extrabold text-slate-900 w-8 text-right shrink-0">
                {config.cardRadiusPx ?? (config.cardRadius === 'none' ? 0 : 16)}px
              </span>
            </div>
          </div>

          {/* Universal Card Shadow & Card Gap */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-900 uppercase tracking-tight block">Card Elevation Shadow</label>
              <select
                value={config.cardShadow || 'md'}
                onChange={(e) => onChange('cardShadow', e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="none">None (Flat)</option>
                <option value="sm">Subtle (sm)</option>
                <option value="md">Medium (md)</option>
                <option value="lg">Deep (lg)</option>
                <option value="xl">Dramatic (xl)</option>
                <option value="2xl">Luxury (2xl)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-900 uppercase tracking-tight block">Grid Column Gap</label>
              <select
                value={config.cardGap || config.gapDesktop || 'medium'}
                onChange={(e) => {
                  onChange('cardGap', e.target.value);
                  onChange('gapDesktop', e.target.value);
                }}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium"
              >
                <option value="flush">Flush (4px)</option>
                <option value="small">Small (16px)</option>
                <option value="medium">Medium (24px)</option>
                <option value="large">Spacious (32px)</option>
              </select>
            </div>
          </div>

          {/* Responsive Breakpoint Columns */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
            <span className="font-bold text-slate-900 uppercase tracking-tight block">
              Responsive Grid Columns
            </span>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <span className="font-semibold text-slate-600 text-[10px] flex items-center gap-1">
                  <Monitor className="w-3 h-3 text-slate-400" /> Desktop
                </span>
                <select
                  value={config.columnsDesktop || 4}
                  onChange={(e) => onChange('columnsDesktop', Number(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value={1}>1 Col</option>
                  <option value={2}>2 Cols</option>
                  <option value={3}>3 Cols</option>
                  <option value={4}>4 Cols</option>
                  <option value={5}>5 Cols</option>
                  <option value={6}>6 Cols</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-600 text-[10px] flex items-center gap-1">
                  <Tablet className="w-3 h-3 text-slate-400" /> Tablet
                </span>
                <select
                  value={config.columnsTablet || 2}
                  onChange={(e) => onChange('columnsTablet', Number(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value={1}>1 Col</option>
                  <option value={2}>2 Cols</option>
                  <option value={3}>3 Cols</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="font-semibold text-slate-600 text-[10px] flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-slate-400" /> Mobile
                </span>
                <select
                  value={config.columnsMobile || 1}
                  onChange={(e) => onChange('columnsMobile', Number(e.target.value))}
                  className="w-full text-xs px-2 py-1.5 rounded-lg border border-slate-300 bg-white font-bold"
                >
                  <option value={1}>1 Col</option>
                  <option value={2}>2 Cols</option>
                </select>
              </div>
            </div>
          </div>

          {/* Responsive Device Visibility Toggles */}
          <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
            <span className="font-bold text-slate-900 uppercase tracking-tight block">Responsive Device Display</span>
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-slate-500" /> Desktop Viewport
                </span>
                <input
                  type="checkbox"
                  checked={config.desktopVisible !== false}
                  onChange={(e) => onChange('desktopVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Tablet className="w-3.5 h-3.5 text-slate-500" /> Tablet Viewport
                </span>
                <input
                  type="checkbox"
                  checked={config.tabletVisible !== false}
                  onChange={(e) => onChange('tabletVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-slate-500" /> Mobile Viewport
                </span>
                <input
                  type="checkbox"
                  checked={config.mobileVisible !== false}
                  onChange={(e) => onChange('mobileVisible', e.target.checked)}
                  className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DynamicEditorForm;
