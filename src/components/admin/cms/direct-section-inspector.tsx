'use client';

import React, { useState } from 'react';
import { AnySectionConfig, HeroConfig, HeroSlide } from '@/types/cms';
import { SECTION_REGISTRY } from '@/lib/cms/registry';
import { ProductAttributeFilterForm } from './product-attribute-filter-form';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  FileText,
  Sliders,
  Palette,
  Link as LinkIcon,
  Maximize2,
  Plus,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Check,
  Smartphone,
  Tablet,
  Monitor,
  MoveVertical,
  PanelLeftClose,
} from 'lucide-react';

import {
  CategoryCardsEditor,
  type CategoryItemOption,
  type CollectionItemOption,
  type AttributeItemOption,
} from './category-cards-editor';
import { EditorialBannerEditor } from './editorial-banner-editor';
import { DynamicEditorForm } from './dynamic-editor-form';

type CategoryItem = CategoryItemOption;

interface BrandItem {
  id: string;
  name: string;
}

interface DirectSectionInspectorProps {
  section: AnySectionConfig;
  onUpdateField: (fieldKey: string, value: any) => void;
  onBack: () => void;
  onToggleEnabled: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onOpenModal?: () => void;
  onCollapse?: () => void;
  categories?: CategoryItem[];
  brands?: BrandItem[];
  collections?: CollectionItemOption[];
  attributes?: AttributeItemOption[];
  products?: ProductData[];
}

export function DirectSectionInspector({
  section,
  onUpdateField,
  onBack,
  onToggleEnabled,
  onDuplicate,
  onDelete,
  onOpenModal,
  onCollapse,
  categories = [],
  brands = [],
  collections = [],
  attributes = [],
  products = [],
}: DirectSectionInspectorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'dimensions' | 'style' | 'cta'>('content');

  const registryEntry = SECTION_REGISTRY[section.type];
  const isHero = section.type === 'HERO';
  const heroConfig = section as HeroConfig;

  const isCategorySection =
    section.type === 'CATEGORY_GRID' ||
    section.type === 'CATEGORY_CIRCLES' ||
    ('items' in section && Array.isArray((section as Record<string, unknown>).items));

  const isEditorialSection =
    section.type === 'EDITORIAL_BANNER' ||
    section.type === 'BRAND_STORY' ||
    ('layout' in section && typeof (section as Record<string, unknown>).layout === 'string' &&
      ['manifesto-card', 'ritual-checklist', 'dark-split', 'checklist-split'].includes((section as Record<string, unknown>).layout as string));

  const isProductSection =
    section.type === 'PRODUCT_GRID' ||
    section.type === 'PRODUCT_CAROUSEL' ||
    section.type === 'FEATURED_PRODUCTS' ||
    section.type === 'BESTSELLERS_SHOWCASE' ||
    section.type === 'FLASH_SALE_GRID' ||
    section.type === 'SEASONAL_SALE_GRID' ||
    section.type === 'LIMITED_EDITION_GRID' ||
    section.type === 'OFFERS_BUNDLE_GRID' ||
    section.type === 'FESTIVE_BUNDLE_GRID' ||
    section.type === 'BUNDLE_SAVE_SHOWCASE' ||
    section.productSource !== undefined;

  const handleSlideChange = (index: number, field: keyof HeroSlide, value: any) => {
    if (!heroConfig.slides) return;
    const updated = [...heroConfig.slides];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateField('slides', updated);
  };

  const addHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      eyebrow: 'NEW COLLECTION',
      heading: 'MODERN MINIMALISM',
      subTitle: 'Precision tailored luxury outerwear.',
      primaryCtaText: 'SHOP NOW',
      primaryCtaUrl: '/products',
      mediaType: 'image',
      mediaUrl:
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
      overlayOpacity: 0.35,
      contentPosition: 'center',
    };
    const existing = heroConfig.slides || [];
    onUpdateField('slides', [...existing, newSlide]);
  };

  const removeHeroSlide = (index: number) => {
    if (!heroConfig.slides) return;
    const updated = heroConfig.slides.filter((_, idx) => idx !== index);
    onUpdateField('slides', updated);
  };

  const moveHeroSlide = (index: number, direction: 'up' | 'down') => {
    if (!heroConfig.slides) return;
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= heroConfig.slides.length) return;
    const updated = [...heroConfig.slides];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onUpdateField('slides', updated);
  };

  return (
    <div className="w-full h-full flex flex-col bg-white text-slate-900 overflow-hidden font-sans select-none">
      {/* Top Header Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-950 hover:bg-slate-200 transition cursor-pointer"
            title="Back to sections list"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-950 text-white uppercase tracking-wider">
                {registryEntry?.category || section.type}
              </span>
              <h3 className="text-xs font-bold text-slate-950 truncate font-heading">
                {section.name || registryEntry?.label || section.type}
              </h3>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {onCollapse && (
            <button
              type="button"
              onClick={onCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-200 rounded transition cursor-pointer"
              title="Collapse sidebar (Preview Only)"
            >
              <PanelLeftClose className="w-3.5 h-3.5" />
            </button>
          )}

          {onOpenModal && (
            <button
              type="button"
              onClick={onOpenModal}
              className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-200 rounded transition cursor-pointer"
              title="Expand into full modal view"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onToggleEnabled}
            className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-200 rounded transition cursor-pointer"
            title={section.enabled ? 'Hide Section' : 'Show Section'}
          >
            {section.enabled ? (
              <Eye className="w-3.5 h-3.5 text-slate-900" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-200 rounded transition cursor-pointer"
            title="Duplicate Section"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
            title="Delete Section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 bg-white px-2 pt-1 gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-2 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'content'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <FileText className="w-3 h-3" />
          <span>Content</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('dimensions')}
          className={`flex-1 py-2 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'dimensions'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <MoveVertical className="w-3 h-3" />
          <span>Height & Spacing</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-2 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'style'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Palette className="w-3 h-3" />
          <span>Style</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cta')}
          className={`flex-1 py-2 text-[11px] font-extrabold uppercase tracking-wider border-b-2 transition flex items-center justify-center gap-1 cursor-pointer ${
            activeTab === 'cta'
              ? 'border-slate-950 text-slate-950'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <LinkIcon className="w-3 h-3" />
          <span>Buttons</span>
        </button>
      </div>

      {/* Inspector Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
        {/* TAB 1: CONTENT & ATTRIBUTES / SLIDES */}
        {activeTab === 'content' && (
          <div className="space-y-4">
            {/* General Text Fields Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
                  Section Custom Name
                </label>
                <input
                  type="text"
                  value={section.name || ''}
                  onChange={(e) => onUpdateField('name', e.target.value)}
                  placeholder="e.g. 02 — HERO CAROUSEL"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
                  Eyebrow / Badge Text
                </label>
                <input
                  type="text"
                  value={section.eyebrow || ''}
                  onChange={(e) => onUpdateField('eyebrow', e.target.value)}
                  placeholder="e.g. CURATED NEW RELEASES"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
                  Main Heading Title
                </label>
                <input
                  type="text"
                  value={section.heading || ''}
                  onChange={(e) => onUpdateField('heading', e.target.value)}
                  placeholder="e.g. TRENDING ARRIVALS"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-bold focus:outline-none focus:border-slate-950"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
                  Description / Copy
                </label>
                <textarea
                  rows={2}
                  value={section.description || ''}
                  onChange={(e) => onUpdateField('description', e.target.value)}
                  placeholder="Add explanatory text or subtitle..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white text-slate-900 font-medium focus:outline-none focus:border-slate-950"
                />
              </div>
            </div>

            {/* CATEGORY & CARD SECTION: Cards Architecture & Database Linkage Suite */}
            {isCategorySection && (
              <CategoryCardsEditor
                config={section}
                onChange={onUpdateField}
                categories={categories}
                collections={collections}
                attributes={attributes}
              />
            )}

            {/* EDITORIAL & MANIFESTO BANNER SECTION: High-Fashion Architecture Suite */}
            {isEditorialSection && (
              <EditorialBannerEditor
                config={section}
                onChange={onUpdateField}
                categories={categories}
                collections={collections}
                attributes={attributes}
              />
            )}

            {/* PRODUCT SECTION: Attribute Filter Suite */}
            {isProductSection && (
              <div className="space-y-3">
                <ProductAttributeFilterForm
                  config={section}
                  onChange={onUpdateField}
                  categories={categories}
                  brands={brands}
                  allProducts={products}
                />

                {/* Column Limits */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900">
                    Product Grid Limits & Columns
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Desktop Columns</label>
                      <select
                        value={section.columnsDesktop || 4}
                        onChange={(e) => onUpdateField('columnsDesktop', Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                      >
                        <option value={2}>2 Columns</option>
                        <option value={3}>3 Columns</option>
                        <option value={4}>4 Columns</option>
                        <option value={5}>5 Columns</option>
                        <option value={6}>6 Columns</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Max Products</label>
                      <input
                        type="number"
                        value={section.maxProducts || 8}
                        onChange={(e) => onUpdateField('maxProducts', Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* HERO SECTION: Carousel Slides Editor */}
            {isHero && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900">
                    Hero Presentation Mode
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Layout</label>
                      <select
                        value={heroConfig.layoutMode || 'CAROUSEL'}
                        onChange={(e) => onUpdateField('layoutMode', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="CAROUSEL">Multi-Slide Carousel</option>
                        <option value="SINGLE_SLIDE">Single Slide</option>
                        <option value="SPLIT_LEFT">Split Left</option>
                        <option value="SPLIT_RIGHT">Split Right</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-700">Description Style</label>
                      <select
                        value={heroConfig.descriptionLayout || 'boxed-glass'}
                        onChange={(e) => onUpdateField('descriptionLayout', e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900"
                      >
                        <option value="boxed-glass">Boxed Glass</option>
                        <option value="badge-pill">Rounded Pill</option>
                        <option value="quote">Quote</option>
                        <option value="default">Default</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Slides Manager */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                      Carousel Slides ({heroConfig.slides?.length || 0})
                    </h4>
                    <button
                      type="button"
                      onClick={addHeroSlide}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 text-white text-[11px] font-extrabold uppercase tracking-wider hover:bg-slate-800 transition flex items-center gap-1 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" /> Add Slide
                    </button>
                  </div>

                  {heroConfig.slides?.map((slide, idx) => (
                    <div
                      key={slide.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {slide.mediaUrl ? (
                              <img src={slide.mediaUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-slate-950 block">Slide #{idx + 1}</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                              {slide.heading || 'Untitled'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveHeroSlide(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-slate-950 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveHeroSlide(idx, 'down')}
                            disabled={idx === (heroConfig.slides?.length || 1) - 1}
                            className="p-1 rounded text-slate-400 hover:text-slate-950 disabled:opacity-20 cursor-pointer"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeHeroSlide(idx)}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          value={slide.heading || ''}
                          onChange={(e) => handleSlideChange(idx, 'heading', e.target.value)}
                          placeholder="Slide heading..."
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-900"
                        />
                        <ImagePreviewInput
                          label="Slide Media Asset"
                          value={slide.mediaUrl || ''}
                          placeholder="Image URL or Cloudflare R2"
                          onChange={(url) => handleSlideChange(idx, 'mediaUrl', url)}
                          aspectRatio="banner"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DYNAMIC COMPONENT EDITOR: Tailored for all 48 components */}
            {!isHero && !isCategorySection && !isEditorialSection && (
              <DynamicEditorForm
                schema={registryEntry?.editorSchema || { fields: [] }}
                config={section}
                onChange={onUpdateField}
                categories={categories}
                brands={brands}
                products={products}
                collections={collections}
                attributes={attributes}
              />
            )}
          </div>
        )}

        {/* TAB 2: DIMENSIONS, HEIGHT & SPACING */}
        {activeTab === 'dimensions' && (
          <div className="space-y-4">
            {/* Section Height Control */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                  Section Height Control
                </label>
                <span className="text-[10px] font-bold text-indigo-600 uppercase font-mono">
                  {section.sectionHeight || section.heroHeight || 'auto'}
                </span>
              </div>

              {/* Height Presets */}
              <div className="grid grid-cols-3 gap-1.5">
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
                      onUpdateField('sectionHeight', preset.id);
                      if (isHero) onUpdateField('heroHeight', preset.id);
                    }}
                    className={`p-2 rounded-lg text-[10px] font-bold uppercase transition text-center cursor-pointer ${
                      (section.sectionHeight || section.heroHeight || 'auto') === preset.id
                        ? 'bg-slate-950 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Custom Min Height Slider */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Custom Height (px)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {section.minHeightPx ? `${section.minHeightPx}px` : 'Preset Default'}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1000}
                  step={20}
                  value={section.minHeightPx || 0}
                  onChange={(e) => onUpdateField('minHeightPx', Number(e.target.value) || undefined)}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Spacing Action Presets */}
            <div className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
              <label className="text-[10px] font-extrabold uppercase tracking-tight text-indigo-900 block">
                Quick Spacing Presets
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onUpdateField('marginTop', 'none');
                    onUpdateField('marginBottom', 'none');
                    onUpdateField('marginLeft', 'none');
                    onUpdateField('marginRight', 'none');
                    onUpdateField('topSpacing', 'none');
                    onUpdateField('bottomSpacing', 'none');
                    onUpdateField('paddingLeft', 'none');
                    onUpdateField('paddingRight', 'none');
                    onUpdateField('paddingX', 'none');
                    onUpdateField('marginTopPx', 0);
                    onUpdateField('marginBottomPx', 0);
                    onUpdateField('marginLeftPx', 0);
                    onUpdateField('marginRightPx', 0);
                    onUpdateField('paddingTopPx', 0);
                    onUpdateField('paddingBottomPx', 0);
                    onUpdateField('paddingLeftPx', 0);
                    onUpdateField('paddingRightPx', 0);
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                >
                  ⚡ All 4 Sides Zero
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateField('marginTop', 'none');
                    onUpdateField('marginBottom', 'none');
                    onUpdateField('marginLeft', 'none');
                    onUpdateField('marginRight', 'none');
                    onUpdateField('marginTopPx', 0);
                    onUpdateField('marginBottomPx', 0);
                    onUpdateField('marginLeftPx', 0);
                    onUpdateField('marginRightPx', 0);
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                >
                  Zero Margins (All 4)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateField('marginTop', 'none');
                    onUpdateField('marginBottom', 'none');
                    onUpdateField('marginLeft', 'none');
                    onUpdateField('marginRight', 'none');
                    onUpdateField('topSpacing', 'small');
                    onUpdateField('bottomSpacing', 'small');
                    onUpdateField('paddingLeft', undefined);
                    onUpdateField('paddingRight', undefined);
                    onUpdateField('paddingX', 'standard');
                    onUpdateField('marginTopPx', undefined);
                    onUpdateField('marginBottomPx', undefined);
                    onUpdateField('marginLeftPx', undefined);
                    onUpdateField('marginRightPx', undefined);
                    onUpdateField('paddingTopPx', undefined);
                    onUpdateField('paddingBottomPx', undefined);
                    onUpdateField('paddingLeftPx', undefined);
                    onUpdateField('paddingRightPx', undefined);
                  }}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-900 hover:text-white border border-indigo-200 text-slate-800 text-[10px] font-extrabold uppercase transition shadow-2xs cursor-pointer text-center"
                >
                  Reset Standard
                </button>
              </div>
            </div>

            {/* 1. OUTER MARGINS (4-Sided: Top, Bottom, Left, Right) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                    Outer Section Margins (4 Sides)
                  </label>
                  <span className="text-[10px] text-slate-500">Outer spacing outside section borders (can be 0px)</span>
                </div>
                {(section.marginTop === 'none' || section.marginTop === '0' || section.marginTopPx === 0) &&
                 (section.marginBottom === 'none' || section.marginBottom === '0' || section.marginBottomPx === 0) &&
                 (section.marginLeft === 'none' || section.marginLeft === '0' || section.marginLeftPx === 0) &&
                 (section.marginRight === 'none' || section.marginRight === '0' || section.marginRightPx === 0) && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    Zero Margin
                  </span>
                )}
              </div>

              {/* Vertical Margins (Top & Bottom) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Top Margin</label>
                  <select
                    value={section.marginTop || 'none'}
                    onChange={(e) => {
                      onUpdateField('marginTop', e.target.value);
                      if (e.target.value === 'none') onUpdateField('marginTopPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small (16px)</option>
                    <option value="medium">Medium (32px)</option>
                    <option value="large">Large (48px)</option>
                    <option value="xlarge">Extra Large (64px)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Bottom Margin</label>
                  <select
                    value={section.marginBottom || 'none'}
                    onChange={(e) => {
                      onUpdateField('marginBottom', e.target.value);
                      if (e.target.value === 'none') onUpdateField('marginBottomPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Left Margin</label>
                  <select
                    value={section.marginLeft || 'none'}
                    onChange={(e) => {
                      onUpdateField('marginLeft', e.target.value);
                      if (e.target.value === 'none') onUpdateField('marginLeftPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small (16px)</option>
                    <option value="medium">Medium (32px)</option>
                    <option value="large">Large (48px)</option>
                    <option value="auto">Auto (Centered)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Right Margin</label>
                  <select
                    value={section.marginRight || 'none'}
                    onChange={(e) => {
                      onUpdateField('marginRight', e.target.value);
                      if (e.target.value === 'none') onUpdateField('marginRightPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small (16px)</option>
                    <option value="medium">Medium (32px)</option>
                    <option value="large">Large (48px)</option>
                    <option value="auto">Auto (Centered)</option>
                  </select>
                </div>
              </div>

              {/* Exact Margin PX Sliders (Top, Bottom, Left, Right) */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Top Margin (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.marginTopPx ?? (section.marginTop === 'none' ? 0 : 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={section.marginTopPx ?? (section.marginTop === 'none' ? 0 : 0)}
                    onChange={(e) => onUpdateField('marginTopPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Bottom Margin (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.marginBottomPx ?? (section.marginBottom === 'none' ? 0 : 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={section.marginBottomPx ?? (section.marginBottom === 'none' ? 0 : 0)}
                    onChange={(e) => onUpdateField('marginBottomPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Left Margin (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.marginLeftPx ?? (section.marginLeft === 'none' ? 0 : 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={section.marginLeftPx ?? (section.marginLeft === 'none' ? 0 : 0)}
                    onChange={(e) => onUpdateField('marginLeftPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Right Margin (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.marginRightPx ?? (section.marginRight === 'none' ? 0 : 0)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="4"
                    value={section.marginRightPx ?? (section.marginRight === 'none' ? 0 : 0)}
                    onChange={(e) => onUpdateField('marginRightPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 2. INNER PADDING (4-Sided: Top, Bottom, Left, Right) */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                    Inner Section Padding (4 Sides)
                  </label>
                  <span className="text-[10px] text-slate-500">Internal buffer space inside section (can be 0px)</span>
                </div>
                {(section.topSpacing === 'none' || section.paddingTopPx === 0) &&
                 (section.bottomSpacing === 'none' || section.paddingBottomPx === 0) &&
                 (section.paddingLeft === 'none' || section.paddingLeftPx === 0 || section.paddingX === 'none') &&
                 (section.paddingRight === 'none' || section.paddingRightPx === 0 || section.paddingX === 'none') && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    Zero Padding
                  </span>
                )}
              </div>

              {/* Vertical Padding (Top & Bottom) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Top Padding</label>
                  <select
                    value={section.topSpacing || 'none'}
                    onChange={(e) => {
                      onUpdateField('topSpacing', e.target.value);
                      if (e.target.value === 'none') onUpdateField('paddingTopPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small / Compact</option>
                    <option value="medium">Medium / Standard</option>
                    <option value="large">Large / Spaced</option>
                    <option value="xlarge">Extra Large (120px)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Bottom Padding</label>
                  <select
                    value={section.bottomSpacing || 'none'}
                    onChange={(e) => {
                      onUpdateField('bottomSpacing', e.target.value);
                      if (e.target.value === 'none') onUpdateField('paddingBottomPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
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
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Left Padding</label>
                  <select
                    value={section.paddingLeft || (section.paddingX === 'none' ? 'none' : 'standard')}
                    onChange={(e) => {
                      onUpdateField('paddingLeft', e.target.value);
                      if (e.target.value === 'none') onUpdateField('paddingLeftPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small (16px)</option>
                    <option value="medium">Medium (24px)</option>
                    <option value="standard">Standard (32px)</option>
                    <option value="large">Large (48px)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700 block">Right Padding</label>
                  <select
                    value={section.paddingRight || (section.paddingX === 'none' ? 'none' : 'standard')}
                    onChange={(e) => {
                      onUpdateField('paddingRight', e.target.value);
                      if (e.target.value === 'none') onUpdateField('paddingRightPx', 0);
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                  >
                    <option value="none">None (0px Flush)</option>
                    <option value="small">Small (16px)</option>
                    <option value="medium">Medium (24px)</option>
                    <option value="standard">Standard (32px)</option>
                    <option value="large">Large (48px)</option>
                  </select>
                </div>
              </div>

              {/* Exact Padding PX Sliders (Top, Bottom, Left, Right) */}
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Top Padding (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.paddingTopPx ?? (section.topSpacing === 'none' ? 0 : 16)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    step="4"
                    value={section.paddingTopPx ?? (section.topSpacing === 'none' ? 0 : 16)}
                    onChange={(e) => onUpdateField('paddingTopPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Bottom Padding (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.paddingBottomPx ?? (section.bottomSpacing === 'none' ? 0 : 16)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    step="4"
                    value={section.paddingBottomPx ?? (section.bottomSpacing === 'none' ? 0 : 16)}
                    onChange={(e) => onUpdateField('paddingBottomPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Left Padding (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.paddingLeftPx ?? (section.paddingLeft === 'none' || section.paddingX === 'none' ? 0 : 16)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    step="4"
                    value={section.paddingLeftPx ?? (section.paddingLeft === 'none' || section.paddingX === 'none' ? 0 : 16)}
                    onChange={(e) => onUpdateField('paddingLeftPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="font-semibold text-slate-600">Right Padding (PX)</span>
                    <span className="font-mono font-bold text-slate-900">{section.paddingRightPx ?? (section.paddingRight === 'none' || section.paddingX === 'none' ? 0 : 16)}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="160"
                    step="4"
                    value={section.paddingRightPx ?? (section.paddingRight === 'none' || section.paddingX === 'none' ? 0 : 16)}
                    onChange={(e) => onUpdateField('paddingRightPx', Number(e.target.value))}
                    className="w-full accent-slate-950 cursor-pointer"
                  />
                </div>
              </div>

              {/* Side Padding Preset Switcher */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-700 block">Overall Horizontal Padding (Left &amp; Right Sync)</label>
                <select
                  value={section.paddingX || (section.paddingLeft === 'none' && section.paddingRight === 'none' ? 'none' : 'standard')}
                  onChange={(e) => {
                    onUpdateField('paddingX', e.target.value);
                    if (e.target.value === 'none') {
                      onUpdateField('paddingLeft', 'none');
                      onUpdateField('paddingRight', 'none');
                      onUpdateField('paddingLeftPx', 0);
                      onUpdateField('paddingRightPx', 0);
                    }
                  }}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
                >
                  <option value="none">None (0px Flush Edge-to-Edge)</option>
                  <option value="small">Small (16px)</option>
                  <option value="standard">Standard Container Padding (32px)</option>
                  <option value="spacious">Spacious (48px)</option>
                </select>
              </div>
            </div>

            {/* Container Max Width */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
              <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                Container Max Width
              </label>
              <select
                value={section.containerWidth || 'default'}
                onChange={(e) => onUpdateField('containerWidth', e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 font-medium cursor-pointer"
              >
                <option value="default">Default Container (1280px)</option>
                <option value="wide">Wide Screen (1536px)</option>
                <option value="narrow">Narrow Box (896px)</option>
                <option value="full">Full Bleed (100% Width)</option>
              </select>
            </div>

            {/* Responsive Device Visibility */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
              <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                Device Visibility
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={section.desktopVisible !== false}
                    onChange={(e) => onUpdateField('desktopVisible', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-slate-950 focus:ring-slate-950"
                  />
                  <span>Desktop</span>
                </label>

                <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={section.tabletVisible !== false}
                    onChange={(e) => onUpdateField('tabletVisible', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-slate-950 focus:ring-slate-950"
                  />
                  <span>Tablet</span>
                </label>

                <label className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={section.mobileVisible !== false}
                    onChange={(e) => onUpdateField('mobileVisible', e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-slate-950 focus:ring-slate-950"
                  />
                  <span>Mobile</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STYLE & BACKDROP */}
        {activeTab === 'style' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                Background Styling
              </label>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={section.backgroundColor || '#ffffff'}
                    onChange={(e) => onUpdateField('backgroundColor', e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 bg-white cursor-pointer"
                  />
                  <input
                    type="text"
                    value={section.backgroundColor || ''}
                    placeholder="#ffffff (or theme default)"
                    onChange={(e) => onUpdateField('backgroundColor', e.target.value)}
                    className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Background Image with live preview */}
              <div className="pt-2 border-t border-slate-100">
                <ImagePreviewInput
                  label="Backdrop Banner Image"
                  value={section.backgroundImageUrl || ''}
                  placeholder="https://images.unsplash.com/... or Cloudflare R2"
                  onChange={(url) => onUpdateField('backgroundImageUrl', url)}
                  aspectRatio="banner"
                />
              </div>

              {/* Darkening Overlay */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Darkening Overlay</span>
                  <span className="font-mono text-slate-900">
                    {Math.round((section.backgroundOverlayOpacity ?? 0.3) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={section.backgroundOverlayOpacity ?? 0.3}
                  onChange={(e) => onUpdateField('backgroundOverlayOpacity', parseFloat(e.target.value))}
                  className="w-full accent-slate-950 cursor-pointer"
                />
              </div>
            </div>

            {/* Text Alignment */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
              <label className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900 block">
                Heading & Text Alignment
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onUpdateField('headingAlignment', align)}
                    className={`py-2 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                      (section.headingAlignment || 'center') === align
                        ? 'bg-slate-950 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: BUTTONS & CTAs */}
        {activeTab === 'cta' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <h4 className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900">
                Primary CTA Button
              </h4>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Button Label</label>
                  <input
                    type="text"
                    value={section.primaryCtaText || ''}
                    onChange={(e) => onUpdateField('primaryCtaText', e.target.value)}
                    placeholder="e.g. SHOP NOW"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Button Link URL</label>
                  <input
                    type="text"
                    value={section.primaryCtaUrl || ''}
                    onChange={(e) => onUpdateField('primaryCtaUrl', e.target.value)}
                    placeholder="/products"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs">
              <h4 className="text-[11px] font-extrabold uppercase tracking-tight text-slate-900">
                Secondary CTA Button (Optional)
              </h4>
              <div className="space-y-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Button Label</label>
                  <input
                    type="text"
                    value={section.secondaryCtaText || ''}
                    onChange={(e) => onUpdateField('secondaryCtaText', e.target.value)}
                    placeholder="e.g. EXPLORE LOOKBOOK"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-700">Button Link URL</label>
                  <input
                    type="text"
                    value={section.secondaryCtaUrl || ''}
                    onChange={(e) => onUpdateField('secondaryCtaUrl', e.target.value)}
                    placeholder="/about"
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DirectSectionInspector;

