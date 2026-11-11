'use client';

import React, { useState, useEffect } from 'react';
import { AnySectionConfig, HeroConfig, HeroSlide } from '@/types/cms';
import {
  X,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Image as ImageIcon,
  FileText,
  Palette,
  Link as LinkIcon,
  Layout,
  Filter,
  Eye,
  Check,
} from 'lucide-react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { SECTION_REGISTRY } from '@/lib/cms/registry';
import { DynamicEditorForm } from './dynamic-editor-form';
import { ProductAttributeFilterForm } from './product-attribute-filter-form';
import { type ProductData } from '@/components/commerce/configurable-product-card';

import {
  CategoryCardsEditor,
  type CategoryItemOption,
  type CollectionItemOption,
  type AttributeItemOption,
} from './category-cards-editor';
import { EditorialBannerEditor } from './editorial-banner-editor';

export interface SectionEditorModalProps {
  section: AnySectionConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSection: AnySectionConfig) => void;
  categories?: CategoryItemOption[];
  brands?: { id: string; name: string }[];
  collections?: CollectionItemOption[];
  attributes?: AttributeItemOption[];
  products?: ProductData[];
}

export function SectionEditorModal({
  section,
  isOpen,
  onClose,
  onSave,
  categories = [],
  brands = [],
  collections = [],
  attributes = [],
  products = [],
}: SectionEditorModalProps) {
  const [edited, setEdited] = useState<AnySectionConfig>({ ...section });
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'cta' | 'layout'>('content');

  useEffect(() => {
    setEdited({ ...section });
  }, [section]);

  if (!isOpen) return null;

  const isHero = edited.type === 'HERO';
  const heroConfig = edited as HeroConfig;
  const registryEntry = SECTION_REGISTRY[edited.type];

  const isCategorySection =
    edited.type === 'CATEGORY_GRID' ||
    edited.type === 'CATEGORY_CIRCLES' ||
    ('items' in edited && Array.isArray((edited as Record<string, unknown>).items));

  const isEditorialSection =
    edited.type === 'EDITORIAL_BANNER' ||
    edited.type === 'BRAND_STORY' ||
    ('layout' in edited && typeof (edited as Record<string, unknown>).layout === 'string' &&
      ['manifesto-card', 'ritual-checklist', 'dark-split', 'checklist-split'].includes((edited as Record<string, unknown>).layout as string));

  const isProductSection =
    edited.type === 'PRODUCT_GRID' ||
    edited.type === 'PRODUCT_CAROUSEL' ||
    edited.type === 'FEATURED_PRODUCTS' ||
    edited.type === 'BESTSELLERS_SHOWCASE' ||
    edited.type === 'FLASH_SALE_GRID' ||
    edited.type === 'SEASONAL_SALE_GRID' ||
    edited.type === 'LIMITED_EDITION_GRID' ||
    edited.type === 'OFFERS_BUNDLE_GRID' ||
    edited.type === 'FESTIVE_BUNDLE_GRID' ||
    edited.type === 'BUNDLE_SAVE_SHOWCASE' ||
    edited.productSource !== undefined;

  const handleFieldChange = (field: string, value: any) => {
    setEdited((prev) => ({ ...prev, [field]: value }));
  };

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: any) => {
    if (!heroConfig.slides) return;
    const updatedSlides = [...heroConfig.slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    setEdited({ ...heroConfig, slides: updatedSlides });
  };

  const addHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      eyebrow: 'NEW CAMPAIGN',
      heading: 'NEW HERO TITLE',
      subTitle: 'Enter slide subtitle here...',
      primaryCtaText: 'SHOP NOW',
      primaryCtaUrl: '/products',
      mediaType: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      overlayOpacity: 0.35,
      contentPosition: 'center',
    };
    const existing = heroConfig.slides || [];
    setEdited({ ...heroConfig, slides: [...existing, newSlide] });
  };

  const removeHeroSlide = (index: number) => {
    if (!heroConfig.slides) return;
    const updatedSlides = heroConfig.slides.filter((_, idx) => idx !== index);
    setEdited({ ...heroConfig, slides: updatedSlides });
  };

  const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
    if (!heroConfig.slides) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= heroConfig.slides.length) return;
    const updated = [...heroConfig.slides];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setEdited({ ...heroConfig, slides: updated });
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-extrabold bg-slate-950 text-white uppercase tracking-wider">
              SECTION EDITOR
            </span>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight text-slate-950 uppercase font-heading">
                {edited.name || registryEntry?.label || edited.type}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                Type: {edited.type} | ID: {edited.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation Row */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/80 gap-1 flex-shrink-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('content')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'content'
                ? 'border-slate-950 text-slate-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{isProductSection ? 'Content & Attribute Filters' : 'Content & Media'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('style')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'style'
                ? 'border-slate-950 text-slate-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Style & Backdrop</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cta')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'cta'
                ? 'border-slate-950 text-slate-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Buttons & CTAs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('layout')}
            className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'layout'
                ? 'border-slate-950 text-slate-950 bg-white shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>Layout & Margins</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: CONTENT & ATTRIBUTES / MEDIA */}
          {activeTab === 'content' && (
            <div className="space-y-5">
              {/* Common Content Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Section Custom Title (Tree Label)
                  </label>
                  <input
                    type="text"
                    value={edited.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    placeholder="e.g. 02 — HERO CAROUSEL"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-slate-950 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Eyebrow / Badge Text
                  </label>
                  <input
                    type="text"
                    value={edited.eyebrow || ''}
                    onChange={(e) => handleFieldChange('eyebrow', e.target.value)}
                    placeholder="e.g. NEW ARRIVALS OR LIMITED TIME"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-medium focus:border-slate-950 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Main Heading Title
                  </label>
                  <input
                    type="text"
                    value={edited.heading || ''}
                    onChange={(e) => handleFieldChange('heading', e.target.value)}
                    placeholder="e.g. CURATED LUXURY ESSENTIALS"
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-bold focus:border-slate-950 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                    Section Description / Narrative
                  </label>
                  <textarea
                    rows={2}
                    value={edited.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    placeholder="Provide contextual caption or storytelling copy..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-medium focus:border-slate-950 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* CATEGORY & CARD SECTION: Cards Architecture & Database Linkage Suite */}
              {isCategorySection && (
                <CategoryCardsEditor
                  config={edited}
                  onChange={handleFieldChange}
                  categories={categories}
                  collections={collections}
                  attributes={attributes}
                />
              )}

              {/* EDITORIAL & MANIFESTO BANNER SECTION */}
              {isEditorialSection && (
                <EditorialBannerEditor
                  config={edited}
                  onChange={handleFieldChange}
                  categories={categories}
                  collections={collections}
                  attributes={attributes}
                />
              )}

              {/* PRODUCT SECTION: Interactive Attribute Filters */}
              {isProductSection && (
                <div className="space-y-4">
                  <ProductAttributeFilterForm
                    config={edited}
                    onChange={handleFieldChange}
                    categories={categories}
                    brands={brands}
                    allProducts={products}
                  />

                  {/* Grid Display Settings */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                    <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                      Product Grid Display Limits & Columns
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Desktop Columns</label>
                        <select
                          value={edited.columnsDesktop || 4}
                          onChange={(e) => handleFieldChange('columnsDesktop', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-slate-950"
                        >
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                          <option value={5}>5 Columns</option>
                          <option value={6}>6 Columns</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Max Products</label>
                        <input
                          type="number"
                          value={edited.maxProducts || 8}
                          onChange={(e) => handleFieldChange('maxProducts', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-slate-950"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Tablet Columns</label>
                        <select
                          value={edited.columnsTablet || 2}
                          onChange={(e) => handleFieldChange('columnsTablet', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-slate-950"
                        >
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 block">Mobile Columns</label>
                        <select
                          value={edited.columnsMobile || 1}
                          onChange={(e) => handleFieldChange('columnsMobile', Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:border-slate-950"
                        >
                          <option value={1}>1 Column</option>
                          <option value={2}>2 Columns</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HERO SECTION: Layout & Slides with Live Previews */}
              {isHero && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 uppercase">Layout Mode</label>
                      <select
                        value={heroConfig.layoutMode || 'CAROUSEL'}
                        onChange={(e) => handleFieldChange('layoutMode', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-medium focus:border-slate-950 cursor-pointer"
                      >
                        <option value="CAROUSEL">Multi-Slide Carousel</option>
                        <option value="SINGLE_SLIDE">Single Slide</option>
                        <option value="SPLIT_LEFT">Split Image Left</option>
                        <option value="SPLIT_RIGHT">Split Image Right</option>
                        <option value="FULLSCREEN_VIDEO">Fullscreen Video</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-900 uppercase">Description Style</label>
                      <select
                        value={heroConfig.descriptionLayout || 'boxed-glass'}
                        onChange={(e) => handleFieldChange('descriptionLayout', e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-medium focus:border-slate-950 cursor-pointer"
                      >
                        <option value="boxed-glass">Boxed Glassmorphism</option>
                        <option value="badge-pill">Rounded Pill Highlight</option>
                        <option value="quote">Editorial Quote</option>
                        <option value="default">Default Paragraph</option>
                      </select>
                    </div>
                  </div>

                  {/* Slides Manager with Previews */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                        Carousel Slides ({heroConfig.slides?.length || 0})
                      </h4>
                      <button
                        type="button"
                        onClick={addHeroSlide}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 cursor-pointer transition shadow-2xs"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Slide
                      </button>
                    </div>

                    <div className="space-y-4">
                      {heroConfig.slides?.map((slide, idx) => (
                        <div
                          key={slide.id}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3.5 shadow-2xs"
                        >
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-3">
                              {/* Slide Thumbnail Preview Badge */}
                              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                                {slide.mediaUrl ? (
                                  <img
                                    src={slide.mediaUrl}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-extrabold text-slate-950 uppercase tracking-wide block">
                                  Slide #{idx + 1}
                                </span>
                                <span className="text-[10px] text-slate-500 font-medium block truncate max-w-[200px]">
                                  {slide.heading || 'Untitled Slide'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => moveHeroSlide(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 rounded text-slate-400 hover:text-slate-950 hover:bg-white disabled:opacity-30 cursor-pointer"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveHeroSlide(idx, 'down')}
                                disabled={idx === (heroConfig.slides?.length || 1) - 1}
                                className="p-1.5 rounded text-slate-400 hover:text-slate-950 hover:bg-white disabled:opacity-30 cursor-pointer"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeHeroSlide(idx)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition ml-1"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Remove
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-800">Slide Eyebrow</label>
                              <input
                                type="text"
                                value={slide.eyebrow || ''}
                                onChange={(e) => handleSlideChange(idx, 'eyebrow', e.target.value)}
                                placeholder="e.g. NEW SEASON"
                                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-slate-950"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-800">Heading Title</label>
                              <input
                                type="text"
                                value={slide.heading || ''}
                                onChange={(e) => handleSlideChange(idx, 'heading', e.target.value)}
                                placeholder="e.g. REDEFINING MODERN LUXURY"
                                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 font-bold focus:border-slate-950"
                              />
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                              <label className="text-[11px] font-bold text-slate-800">Subtitle / Caption</label>
                              <input
                                type="text"
                                value={slide.subTitle || ''}
                                onChange={(e) => handleSlideChange(idx, 'subTitle', e.target.value)}
                                placeholder="Precision tailored outerwear designed to last a lifetime..."
                                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-slate-950"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-800">CTA Text</label>
                              <input
                                type="text"
                                value={slide.primaryCtaText || ''}
                                onChange={(e) => handleSlideChange(idx, 'primaryCtaText', e.target.value)}
                                placeholder="SHOP NOW"
                                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-slate-950"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-slate-800">CTA Link URL</label>
                              <input
                                type="text"
                                value={slide.primaryCtaUrl || ''}
                                onChange={(e) => handleSlideChange(idx, 'primaryCtaUrl', e.target.value)}
                                placeholder="/products"
                                className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-slate-950"
                              />
                            </div>

                            {/* Live Media Input with Cloudflare Media Picker & Device Upload */}
                            <div className="sm:col-span-2 pt-2">
                              <ImagePreviewInput
                                label="Slide Media Asset with Live Preview"
                                value={slide.mediaUrl || ''}
                                placeholder="https://images.unsplash.com/... or Cloudflare R2 URL"
                                onChange={(url) => handleSlideChange(idx, 'mediaUrl', url)}
                                allowVideo={true}
                                mediaType={slide.mediaType || 'image'}
                                onMediaTypeChange={(type) => handleSlideChange(idx, 'mediaType', type)}
                                aspectRatio="banner"
                                description="Real-time image preview with device upload & Cloudflare R2 storage picker."
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* NON-HERO / NON-CATEGORY DYNAMIC COMPONENT FIELDS (from schema) */}
              {!isHero && !isCategorySection && !isEditorialSection && (
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs">
                  <DynamicEditorForm
                    schema={registryEntry?.editorSchema || { fields: [] }}
                    config={edited}
                    onChange={handleFieldChange}
                    categories={categories}
                    brands={brands}
                    products={products}
                    collections={collections}
                    attributes={attributes}
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STYLE & BACKDROP */}
          {activeTab === 'style' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                  Background Color & Overlay
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={edited.backgroundColor || '#ffffff'}
                        onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                        className="h-10 w-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={edited.backgroundColor || ''}
                        placeholder="#ffffff"
                        onChange={(e) => handleFieldChange('backgroundColor', e.target.value)}
                        className="flex-1 rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-mono font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      Overlay Darkening Opacity ({Math.round((edited.backgroundOverlayOpacity ?? 0.3) * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={edited.backgroundOverlayOpacity ?? 0.3}
                      onChange={(e) => handleFieldChange('backgroundOverlayOpacity', parseFloat(e.target.value))}
                      className="w-full mt-2 cursor-pointer accent-slate-950"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <ImagePreviewInput
                    label="Backdrop Banner Image URL (Optional)"
                    value={edited.backgroundImageUrl || ''}
                    placeholder="https://images.unsplash.com/... or Cloudflare R2 URL"
                    onChange={(url) => handleFieldChange('backgroundImageUrl', url)}
                    aspectRatio="banner"
                    description="Full-bleed backdrop image with Cloudflare R2 picker and instant preview."
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUTTONS & CTAs */}
          {activeTab === 'cta' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                  Primary Call-to-Action Button
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Primary CTA Label</label>
                    <input
                      type="text"
                      value={edited.primaryCtaText || ''}
                      onChange={(e) => handleFieldChange('primaryCtaText', e.target.value)}
                      placeholder="e.g. SHOP NOW OR EXPLORE"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Primary CTA Link URL</label>
                    <input
                      type="text"
                      value={edited.primaryCtaUrl || ''}
                      onChange={(e) => handleFieldChange('primaryCtaUrl', e.target.value)}
                      placeholder="/products"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-950"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                  Secondary Call-to-Action Button (Optional)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Secondary CTA Label</label>
                    <input
                      type="text"
                      value={edited.secondaryCtaText || ''}
                      onChange={(e) => handleFieldChange('secondaryCtaText', e.target.value)}
                      placeholder="e.g. VIEW LOOKBOOK"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Secondary CTA Link URL</label>
                    <input
                      type="text"
                      value={edited.secondaryCtaUrl || ''}
                      onChange={(e) => handleFieldChange('secondaryCtaUrl', e.target.value)}
                      placeholder="/lookbook"
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 focus:border-slate-950"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT, MARGINS & RESPONSIVE */}
          {activeTab === 'layout' && (
            <div className="space-y-5">
              {/* Section Height Control */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                    Section Height & Min-Height
                  </h4>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">
                    {edited.sectionHeight || (isHero ? heroConfig.heroHeight : undefined) || 'auto'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'auto', label: 'Auto (Fit)' },
                    { id: 'small', label: 'Compact (360px)' },
                    { id: 'medium', label: 'Medium (520px)' },
                    { id: 'large', label: 'Large (700px)' },
                    { id: 'screen', label: 'Full (100vh)' },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        handleFieldChange('sectionHeight', preset.id);
                        if (isHero) handleFieldChange('heroHeight', preset.id);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold uppercase transition text-center cursor-pointer ${
                        (edited.sectionHeight || (isHero ? heroConfig.heroHeight : undefined) || 'auto') === preset.id
                          ? 'bg-slate-950 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Custom Min-Height (px)</span>
                    <span className="font-mono text-slate-900">
                      {edited.minHeightPx ? `${edited.minHeightPx}px` : 'Default'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1000}
                    step={25}
                    value={edited.minHeightPx || 0}
                    onChange={(e) => handleFieldChange('minHeightPx', Number(e.target.value) || undefined)}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Spacing Action Presets */}
              <div className="p-3.5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-tight text-indigo-900 block">
                  Quick Spacing Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      handleFieldChange('marginTop', 'none');
                      handleFieldChange('marginBottom', 'none');
                      handleFieldChange('marginLeft', 'none');
                      handleFieldChange('marginRight', 'none');
                      handleFieldChange('topSpacing', 'none');
                      handleFieldChange('bottomSpacing', 'none');
                      handleFieldChange('paddingLeft', 'none');
                      handleFieldChange('paddingRight', 'none');
                      handleFieldChange('paddingX', 'none');
                      handleFieldChange('marginTopPx', 0);
                      handleFieldChange('marginBottomPx', 0);
                      handleFieldChange('marginLeftPx', 0);
                      handleFieldChange('marginRightPx', 0);
                      handleFieldChange('paddingTopPx', 0);
                      handleFieldChange('paddingBottomPx', 0);
                      handleFieldChange('paddingLeftPx', 0);
                      handleFieldChange('paddingRightPx', 0);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                  >
                    ⚡ All 4 Sides Zero
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleFieldChange('marginTop', 'none');
                      handleFieldChange('marginBottom', 'none');
                      handleFieldChange('marginLeft', 'none');
                      handleFieldChange('marginRight', 'none');
                      handleFieldChange('marginTopPx', 0);
                      handleFieldChange('marginBottomPx', 0);
                      handleFieldChange('marginLeftPx', 0);
                      handleFieldChange('marginRightPx', 0);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                  >
                    Zero Margins (All 4)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleFieldChange('marginTop', 'none');
                      handleFieldChange('marginBottom', 'none');
                      handleFieldChange('marginLeft', 'none');
                      handleFieldChange('marginRight', 'none');
                      handleFieldChange('topSpacing', 'small');
                      handleFieldChange('bottomSpacing', 'small');
                      handleFieldChange('paddingLeft', undefined);
                      handleFieldChange('paddingRight', undefined);
                      handleFieldChange('paddingX', 'standard');
                      handleFieldChange('marginTopPx', undefined);
                      handleFieldChange('marginBottomPx', undefined);
                      handleFieldChange('marginLeftPx', undefined);
                      handleFieldChange('marginRightPx', undefined);
                      handleFieldChange('paddingTopPx', undefined);
                      handleFieldChange('paddingBottomPx', undefined);
                      handleFieldChange('paddingLeftPx', undefined);
                      handleFieldChange('paddingRightPx', undefined);
                    }}
                    className="p-2 rounded-xl bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                  >
                    Reset Standard
                  </button>
                </div>
              </div>

              {/* 1. OUTER MARGINS (4-Sided: Top, Bottom, Left, Right) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                      Outer Section Margins (4 Sides)
                    </h4>
                    <span className="text-[10px] text-slate-500">Outer spacing outside section borders (can be 0px)</span>
                  </div>
                  {(edited.marginTop === 'none' || edited.marginTop === '0' || edited.marginTopPx === 0) &&
                   (edited.marginBottom === 'none' || edited.marginBottom === '0' || edited.marginBottomPx === 0) &&
                   (edited.marginLeft === 'none' || edited.marginLeft === '0' || edited.marginLeftPx === 0) &&
                   (edited.marginRight === 'none' || edited.marginRight === '0' || edited.marginRightPx === 0) && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Zero Margin
                    </span>
                  )}
                </div>

                {/* Vertical Margins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Top Margin</label>
                    <select
                      value={edited.marginTop || 'none'}
                      onChange={(e) => {
                        handleFieldChange('marginTop', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('marginTopPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (32px)</option>
                      <option value="large">Large (48px)</option>
                      <option value="xlarge">Extra Large (64px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Bottom Margin</label>
                    <select
                      value={edited.marginBottom || 'none'}
                      onChange={(e) => {
                        handleFieldChange('marginBottom', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('marginBottomPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (32px)</option>
                      <option value="large">Large (48px)</option>
                      <option value="xlarge">Extra Large (64px)</option>
                    </select>
                  </div>
                </div>

                {/* Horizontal Margins (Left & Right) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Left Margin</label>
                    <select
                      value={edited.marginLeft || 'none'}
                      onChange={(e) => {
                        handleFieldChange('marginLeft', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('marginLeftPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (32px)</option>
                      <option value="large">Large (48px)</option>
                      <option value="auto">Auto (Centered)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Right Margin</label>
                    <select
                      value={edited.marginRight || 'none'}
                      onChange={(e) => {
                        handleFieldChange('marginRight', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('marginRightPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (32px)</option>
                      <option value="large">Large (48px)</option>
                      <option value="auto">Auto (Centered)</option>
                    </select>
                  </div>
                </div>

                {/* Exact Margin PX Sliders (4 Sides) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Top Margin (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.marginTopPx ?? (edited.marginTop === 'none' ? 0 : 0)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={edited.marginTopPx ?? (edited.marginTop === 'none' ? 0 : 0)}
                      onChange={(e) => handleFieldChange('marginTopPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Bottom Margin (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.marginBottomPx ?? (edited.marginBottom === 'none' ? 0 : 0)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={edited.marginBottomPx ?? (edited.marginBottom === 'none' ? 0 : 0)}
                      onChange={(e) => handleFieldChange('marginBottomPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Left Margin (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.marginLeftPx ?? (edited.marginLeft === 'none' ? 0 : 0)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={edited.marginLeftPx ?? (edited.marginLeft === 'none' ? 0 : 0)}
                      onChange={(e) => handleFieldChange('marginLeftPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Right Margin (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.marginRightPx ?? (edited.marginRight === 'none' ? 0 : 0)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="120"
                      step="4"
                      value={edited.marginRightPx ?? (edited.marginRight === 'none' ? 0 : 0)}
                      onChange={(e) => handleFieldChange('marginRightPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* 2. INNER PADDING (4-Sided: Top, Bottom, Left, Right) */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                      Inner Section Padding (4 Sides)
                    </h4>
                    <span className="text-[10px] text-slate-500">Internal buffer space inside section (can be 0px)</span>
                  </div>
                  {(edited.topSpacing === 'none' || edited.paddingTopPx === 0) &&
                   (edited.bottomSpacing === 'none' || edited.paddingBottomPx === 0) &&
                   (edited.paddingLeft === 'none' || edited.paddingLeftPx === 0 || edited.paddingX === 'none') &&
                   (edited.paddingRight === 'none' || edited.paddingRightPx === 0 || edited.paddingX === 'none') && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Zero Padding
                    </span>
                  )}
                </div>

                {/* Vertical Padding */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Top Padding</label>
                    <select
                      value={edited.topSpacing || 'none'}
                      onChange={(e) => {
                        handleFieldChange('topSpacing', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('paddingTopPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small / Compact</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="large">Large / Spaced</option>
                      <option value="xlarge">Extra Large (120px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Bottom Padding</label>
                    <select
                      value={edited.bottomSpacing || 'none'}
                      onChange={(e) => {
                        handleFieldChange('bottomSpacing', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('paddingBottomPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small / Compact</option>
                      <option value="medium">Medium / Standard</option>
                      <option value="large">Large / Spaced</option>
                      <option value="xlarge">Extra Large (120px)</option>
                    </select>
                  </div>
                </div>

                {/* Horizontal Padding (Left & Right) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Left Padding</label>
                    <select
                      value={edited.paddingLeft || (edited.paddingX === 'none' ? 'none' : 'standard')}
                      onChange={(e) => {
                        handleFieldChange('paddingLeft', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('paddingLeftPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (24px)</option>
                      <option value="standard">Standard (32px)</option>
                      <option value="large">Large (48px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800">Right Padding</label>
                    <select
                      value={edited.paddingRight || (edited.paddingX === 'none' ? 'none' : 'standard')}
                      onChange={(e) => {
                        handleFieldChange('paddingRight', e.target.value);
                        if (e.target.value === 'none') handleFieldChange('paddingRightPx', 0);
                      }}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                    >
                      <option value="none">None (0px Flush)</option>
                      <option value="small">Small (16px)</option>
                      <option value="medium">Medium (24px)</option>
                      <option value="standard">Standard (32px)</option>
                      <option value="large">Large (48px)</option>
                    </select>
                  </div>
                </div>

                {/* Exact Padding PX Sliders (4 Sides) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Top Padding (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.paddingTopPx ?? (edited.topSpacing === 'none' ? 0 : 16)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      step="4"
                      value={edited.paddingTopPx ?? (edited.topSpacing === 'none' ? 0 : 16)}
                      onChange={(e) => handleFieldChange('paddingTopPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Bottom Padding (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.paddingBottomPx ?? (edited.bottomSpacing === 'none' ? 0 : 16)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      step="4"
                      value={edited.paddingBottomPx ?? (edited.bottomSpacing === 'none' ? 0 : 16)}
                      onChange={(e) => handleFieldChange('paddingBottomPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Left Padding (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.paddingLeftPx ?? (edited.paddingLeft === 'none' || edited.paddingX === 'none' ? 0 : 16)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      step="4"
                      value={edited.paddingLeftPx ?? (edited.paddingLeft === 'none' || edited.paddingX === 'none' ? 0 : 16)}
                      onChange={(e) => handleFieldChange('paddingLeftPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="font-semibold text-slate-600">Right Padding (PX)</span>
                      <span className="font-mono font-bold text-slate-900">{edited.paddingRightPx ?? (edited.paddingRight === 'none' || edited.paddingX === 'none' ? 0 : 16)}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="160"
                      step="4"
                      value={edited.paddingRightPx ?? (edited.paddingRight === 'none' || edited.paddingX === 'none' ? 0 : 16)}
                      onChange={(e) => handleFieldChange('paddingRightPx', Number(e.target.value))}
                      className="w-full accent-slate-950 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Overall Side Padding Presets */}
                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800">Overall Horizontal Padding (Sync Left &amp; Right)</label>
                  <select
                    value={edited.paddingX || (edited.paddingLeft === 'none' && edited.paddingRight === 'none' ? 'none' : 'standard')}
                    onChange={(e) => {
                      handleFieldChange('paddingX', e.target.value);
                      if (e.target.value === 'none') {
                        handleFieldChange('paddingLeft', 'none');
                        handleFieldChange('paddingRight', 'none');
                        handleFieldChange('paddingLeftPx', 0);
                        handleFieldChange('paddingRightPx', 0);
                      }
                    }}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                  >
                    <option value="none">None (0px Flush Edge-to-Edge)</option>
                    <option value="small">Small (16px)</option>
                    <option value="standard">Standard Container Padding (32px)</option>
                    <option value="spacious">Spacious (48px)</option>
                  </select>
                </div>

                <div className="space-y-1 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-800">Container Max Width</label>
                  <select
                    value={edited.containerWidth || 'default'}
                    onChange={(e) => handleFieldChange('containerWidth', e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs text-slate-900 font-semibold focus:border-slate-950 cursor-pointer"
                  >
                    <option value="default">Default Container (1280px)</option>
                    <option value="wide">Wide Screen (1536px)</option>
                    <option value="narrow">Narrow Box (896px)</option>
                    <option value="full">Full Bleed (100% Width)</option>
                  </select>
                </div>
              </div>

              {/* Device Visibility Checklist */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs">
                <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-900">
                  Device Viewport Visibility
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edited.desktopVisible !== false}
                      onChange={(e) => handleFieldChange('desktopVisible', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-800">Desktop</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edited.tabletVisible !== false}
                      onChange={(e) => handleFieldChange('tabletVisible', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-800">Tablet</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={edited.mobileVisible !== false}
                      onChange={(e) => handleFieldChange('mobileVisible', e.target.checked)}
                      className="w-4 h-4 rounded text-slate-950 focus:ring-slate-950"
                    />
                    <span className="text-xs font-bold text-slate-800">Mobile</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50/90 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-extrabold text-slate-700 hover:bg-slate-100 cursor-pointer transition shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onSave(edited);
              onClose();
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-extrabold uppercase tracking-wider hover:bg-slate-800 shadow-md cursor-pointer transition"
          >
            <Save className="h-4 w-4" />
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SectionEditorModal;
