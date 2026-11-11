'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PageConfig, AnySectionConfig, SiteDesignTokens } from '@/types/cms';
import { saveCmsPageConfig, saveSiteDesignTokens } from '@/lib/cms/service';
import { useThemeVariables } from '@/providers/ThemeVariableProvider';
import { BuilderPreviewCanvas, type DeviceViewport } from './builder-preview-canvas';
import { SECTION_REGISTRY, RegistryEntry } from '@/lib/cms/registry';
import { SectionPicker } from './section-picker';
import { DynamicEditorForm } from './dynamic-editor-form';
import { ThemeEditorPanel } from './theme-editor-panel';
import { ThemePreset } from '@/lib/cms/theme/presets';
import { SectionEditorModal } from './section-editor-modal';
import { DirectSectionInspector } from './direct-section-inspector';
import { EditProductSheet } from '@/components/admin/catalog/products/edit-product-sheet';
import { type SeasonalCampaignData } from '@/core/storefront/homepage.service';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import {
  Monitor,
  Tablet,
  Smartphone,
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Palette,
  Sliders,
  Sparkles,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
  Maximize2,
  Box,
  Image as ImageIcon,
  SlidersHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Split,
  ExternalLink,
  Columns2,
} from 'lucide-react';
import { toast } from 'sonner';

interface VisualBuilderStudioProps {
  initialPageConfig: PageConfig;
  initialThemeTokens: SiteDesignTokens;
  products: ProductData[];
  seasonalSections: SeasonalCampaignData[];
  categories?: { id: string; name: string; parentId?: string | null; slug?: string; imageUrl?: string | null; description?: string | null }[];
  brands?: { id: string; name: string }[];
  collections?: { id: string; name: string; slug: string; imageUrl?: string | null }[];
  attributes?: { id: string; name: string }[];
}

export function VisualBuilderStudio({
  initialPageConfig,
  initialThemeTokens,
  products,
  seasonalSections,
  categories = [],
  brands = [],
  collections = [],
  attributes = [],
}: VisualBuilderStudioProps) {
  const { updateTokens: applyLiveTheme } = useThemeVariables();

  const [pageConfig, setPageConfig] = useState<PageConfig>(initialPageConfig);
  const [themeTokens, setThemeTokens] = useState<SiteDesignTokens>(initialThemeTokens);
  const [device, setDevice] = useState<DeviceViewport>('desktop');
  const [activeTab, setActiveTab] = useState<'sections' | 'products' | 'theme'>('sections');
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [editingModalSection, setEditingModalSection] = useState<AnySectionConfig | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'canvas' | 'inspector'>('split');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState('');

  const filteredCatalogProducts = products.filter((p) => {
    const matchesSearch =
      !catalogSearch ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (p.slug && p.slug.toLowerCase().includes(catalogSearch.toLowerCase()));
    const matchesCategory =
      !catalogCategoryFilter ||
      (p.category && p.category.toLowerCase() === catalogCategoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      if (pageConfig) {
        await saveCmsPageConfig('/', pageConfig);
      }
      if (themeTokens) {
        await saveSiteDesignTokens(themeTokens);
        applyLiveTheme(themeTokens);
      }
      setSavedSuccess(true);
      toast.success('Visual Storefront & Theme Tokens Published Successfully!');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to publish storefront changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleColorChange = (key: keyof SiteDesignTokens, val: string) => {
    const updated = { ...themeTokens, [key]: val };
    setThemeTokens(updated);
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setThemeTokens(preset.tokens);
    toast.success(`Applied "${preset.name}" Theme Preset!`);
  };

  const handleAddRegistrySection = (entry: RegistryEntry) => {
    const newSection: AnySectionConfig = {
      ...entry.defaultConfig,
      id: `sec-${Date.now()}`,
      displayOrder: pageConfig.sections.length + 1,
    };

    const updated = {
      ...pageConfig,
      sections: [...pageConfig.sections, newSection],
    };

    setPageConfig(updated);
    setSelectedSectionId(newSection.id);
    saveCmsPageConfig('/', updated).catch(console.error);
    toast.success(`Added "${entry.label}" to layout`);
  };

  const toggleSectionEnabled = (id: string) => {
    const updated = {
      ...pageConfig,
      sections: pageConfig.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      ),
    };
    setPageConfig(updated);
    saveCmsPageConfig('/', updated).catch(console.error);
  };

  const deleteSection = (id: string) => {
    const updatedSections = pageConfig.sections
      .filter((sec) => sec.id !== id)
      .map((sec, idx) => ({ ...sec, displayOrder: idx + 1 }));

    const updated = { ...pageConfig, sections: updatedSections };
    setPageConfig(updated);
    saveCmsPageConfig('/', updated).catch(console.error);

    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
    toast.success('Section removed from layout');
  };

  const duplicateSection = (id: string) => {
    const target = pageConfig.sections.find((s) => s.id === id);
    if (!target) return;

    const duplicated: AnySectionConfig = {
      ...JSON.parse(JSON.stringify(target)),
      id: `sec-${Date.now()}`,
      name: `${target.name} (Copy)`,
      displayOrder: pageConfig.sections.length + 1,
    };

    const updated = {
      ...pageConfig,
      sections: [...pageConfig.sections, duplicated],
    };
    setPageConfig(updated);
    setSelectedSectionId(duplicated.id);
    saveCmsPageConfig('/', updated).catch(console.error);
    toast.success(`Duplicated "${target.name}"`);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...pageConfig.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    const updatedSections = newSections.map((sec, idx) => ({
      ...sec,
      displayOrder: idx + 1,
    }));

    const updated = { ...pageConfig, sections: updatedSections };
    setPageConfig(updated);
    saveCmsPageConfig('/', updated).catch(console.error);
  };

  const updateSectionField = (sectionId: string, field: string, value: any) => {
    const updated = {
      ...pageConfig,
      sections: pageConfig.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, [field]: value } : sec
      ),
    };
    setPageConfig(updated);
    saveCmsPageConfig('/', updated).catch(console.error);
  };

  const handleSaveFromModal = (updatedSection: AnySectionConfig) => {
    const updated = {
      ...pageConfig,
      sections: pageConfig.sections.map((sec) =>
        sec.id === updatedSection.id ? updatedSection : sec
      ),
    };
    setPageConfig(updated);
    saveCmsPageConfig('/', updated).catch(console.error);
    toast.success(`Updated "${updatedSection.name}" from Detailed Form!`);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Top Header Navigation Bar - Admin Control Center Vibe */}
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs gap-2">
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">EXIT STUDIO</span>
          </Link>
          <div className="h-4 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-slate-900 shrink-0" />
            <h1 className="font-extrabold text-sm sm:text-base tracking-tight uppercase text-slate-950 font-heading truncate">
              Visual Website Studio
            </h1>
            <span className="hidden md:inline text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white shrink-0">
              46 COMPONENTS
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'canvas' ? 'split' : 'canvas')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
            title={viewMode === 'canvas' ? 'Show Editor Sidebar' : 'Hide Editor Sidebar (Full Preview)'}
          >
            {viewMode === 'canvas' ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* View Mode & Viewport Device Controls */}
        <div className="flex items-center gap-2">
          {/* View Mode: Split / Canvas / Inspector */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('split')}
              title="Split View (Editor + Live Canvas)"
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white'
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">SPLIT</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('canvas')}
              title="Preview Canvas Only"
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">PREVIEW</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('inspector')}
              title="Editor Only"
              className={`px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-extrabold uppercase flex items-center gap-1.5 transition cursor-pointer ${
                viewMode === 'inspector'
                  ? 'bg-slate-950 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">EDITOR</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden md:block" />

          {/* Viewport Device Mode Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              title="Desktop Viewport"
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'desktop'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] font-extrabold">DESKTOP</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('tablet')}
              title="Tablet Viewport"
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'tablet'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] font-extrabold">TABLET</span>
            </button>
            <button
              type="button"
              onClick={() => setDevice('mobile')}
              title="Mobile Viewport"
              className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                device === 'mobile'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[10px] font-extrabold">MOBILE</span>
            </button>
          </div>
        </div>

        {/* Right Actions: Live Store Link + Publish Action Button */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Store in New Tab"
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline text-[10px]">LIVE STORE</span>
          </Link>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-slate-800 text-white shadow-md'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" /> PUBLISHED LIVE
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isSaving ? 'PUBLISHING...' : 'PUBLISH LIVE'}
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body: Inspector Sidebar + Preview Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Inspector Control Sidebar */}
        {(viewMode === 'split' || viewMode === 'inspector') && (
          <div
            className={`${
              viewMode === 'inspector'
                ? 'w-full max-w-4xl mx-auto border-x'
                : 'w-[360px] md:w-[380px] lg:w-[400px] xl:w-[420px] shrink-0 border-r'
            } bg-white border-slate-200 flex flex-col z-20 overflow-hidden shadow-xs transition-all duration-200`}
          >
            {/* Studio Inspector Tab Selector */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-1.5 gap-1.5">
              <button
                onClick={() => setActiveTab('sections')}
                className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'sections'
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Sliders className="w-3.5 h-3.5 text-slate-900" />
                <span>SECTIONS</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'products'
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Box className="w-3.5 h-3.5 text-slate-900" />
                <span>CATALOG</span>
              </button>
              <button
                onClick={() => setActiveTab('theme')}
                className={`flex-1 py-2 rounded-lg text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'theme'
                    ? 'bg-white text-slate-950 shadow-2xs border border-slate-200'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                <Palette className="w-3.5 h-3.5 text-slate-900" />
                <span>THEME</span>
              </button>
            </div>

            {/* Tab 1: Section List or Direct Section Inspector */}
            {activeTab === 'sections' && (
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50">
                {selectedSectionId &&
                pageConfig.sections.some((s) => s.id === selectedSectionId) ? (
                  <DirectSectionInspector
                    section={
                      pageConfig.sections.find((s) => s.id === selectedSectionId)!
                    }
                    onUpdateField={(field, val) =>
                      updateSectionField(selectedSectionId, field, val)
                    }
                    onBack={() => setSelectedSectionId(null)}
                    onToggleEnabled={() => toggleSectionEnabled(selectedSectionId)}
                    onDuplicate={() => duplicateSection(selectedSectionId)}
                    onDelete={() => deleteSection(selectedSectionId)}
                    onOpenModal={() => {
                      const sec = pageConfig.sections.find(
                        (s) => s.id === selectedSectionId
                      );
                      if (sec) setEditingModalSection(sec);
                    }}
                    onCollapse={() => setViewMode('canvas')}
                    categories={categories}
                    brands={brands}
                    collections={collections}
                    attributes={attributes}
                    products={products}
                  />
                ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Add Component Trigger Button */}
                  <button
                    onClick={() => setShowSectionPicker(true)}
                    className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> ADD STOREFRONT COMPONENT OR BUNDLE
                  </button>

                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-extrabold text-slate-950 uppercase tracking-tight">
                      Page Sections ({pageConfig.sections.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Click to inspect</span>
                  </div>

                  {/* Clean Sections List */}
                  <div className="space-y-2">
                    {pageConfig.sections.map((section, index) => {
                      const registryEntry = SECTION_REGISTRY[section.type];

                      return (
                        <div
                          key={section.id}
                          onClick={() => setSelectedSectionId(section.id)}
                          className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-2xs transition flex items-center justify-between gap-2.5 cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                            <span className="w-5 h-5 rounded bg-slate-100 group-hover:bg-slate-950 group-hover:text-white text-slate-500 text-[10px] font-extrabold flex items-center justify-center transition shrink-0">
                              {index + 1}
                            </span>
                            <div className="truncate">
                              <h4 className="text-xs font-bold text-slate-950 truncate group-hover:text-indigo-600 transition">
                                {section.name || registryEntry?.label || section.type}
                              </h4>
                              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                                {registryEntry?.category || 'SECTION'}
                              </span>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div
                            className="flex items-center gap-1 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'up')}
                              disabled={index === 0}
                              className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 cursor-pointer"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveSection(index, 'down')}
                              disabled={index === pageConfig.sections.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 cursor-pointer"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleSectionEnabled(section.id)}
                              className="p-1 text-slate-400 hover:text-slate-950 cursor-pointer"
                              title={section.enabled ? 'Hide Section' : 'Show Section'}
                            >
                              {section.enabled ? (
                                <Eye className="w-3.5 h-3.5 text-slate-950" />
                              ) : (
                                <EyeOff className="w-3.5 h-3.5 text-slate-300" />
                              )}
                            </button>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 transition ml-1" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Catalog Products Inspector & Detailed Shopify-Style Editor */}
          {activeTab === 'products' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-slate-950 uppercase tracking-tight flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-indigo-600" /> Catalog Products ({products.length})
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Live Inspector</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Search, inspect live media, prices, and open the detailed variant product editor.
                </p>

                {/* Search & Category Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search by name or slug..."
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-950"
                  />
                  <select
                    value={catalogCategoryFilter}
                    onChange={(e) => setCatalogCategoryFilter(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:border-slate-950 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                {filteredCatalogProducts.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                    No products match your search query.
                  </div>
                ) : (
                  filteredCatalogProducts.map((product) => {
                    const prodImg = product.images?.[0];
                    return (
                      <div
                        key={product.id}
                        className="p-3 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between gap-3 hover:border-slate-400 transition"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
                            {prodImg ? (
                              <img
                                src={prodImg}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs font-bold text-slate-950 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 text-[11px] mt-0.5">
                              <span className="font-extrabold text-slate-900">${product.price.toFixed(2)}</span>
                              {product.category && (
                                <span className="text-slate-400 font-medium truncate">• {product.category}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <EditProductSheet
                            productId={product.id}
                            productName={product.name}
                            categories={categories}
                            brands={brands}
                            trigger={
                              <button
                                type="button"
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-950 hover:text-white text-[11px] font-extrabold uppercase tracking-wider text-slate-800 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                              >
                                <SlidersHorizontal className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                            }
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Theme Presets & Color Token Inspector */}
          {activeTab === 'theme' && (
            <div className="flex-1 overflow-y-auto bg-slate-50/50">
              <ThemeEditorPanel
                tokens={themeTokens}
                onTokenChange={handleColorChange}
                onSelectPreset={handlePresetSelect}
              />
            </div>
          )}
        </div>
      )}

      {/* Right Interactive Preview Canvas */}
      {(viewMode === 'split' || viewMode === 'canvas') && (
        <div className="flex-1 min-w-0 h-full overflow-hidden bg-slate-900/95 flex flex-col relative">
          {/* Quick Floating Re-open Editor Button when in Canvas Only mode */}
          {viewMode === 'canvas' && (
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg hover:bg-white flex items-center gap-1.5 cursor-pointer transition hover:scale-105"
              title="Open Editor Sidebar"
            >
              <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
              <span>Show Editor</span>
            </button>
          )}

          <BuilderPreviewCanvas
            sections={pageConfig.sections}
            products={products}
            seasonalSections={seasonalSections}
            device={device}
            themeTokens={themeTokens}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => {
              if (viewMode === 'canvas') {
                setViewMode('split');
              }
              setActiveTab('sections');
              setSelectedSectionId(id);
            }}
          />
        </div>
      )}
    </div>

      {/* Categorized 46-Component Picker Modal Drawer */}
      {showSectionPicker && (
        <SectionPicker
          onSelectSection={handleAddRegistrySection}
          onClose={() => setShowSectionPicker(false)}
        />
      )}

      {/* Full Detailed Section Form Modal with Carousel Slides, Attribute Filters & Live Previews */}
      {editingModalSection && (
        <SectionEditorModal
          section={editingModalSection}
          isOpen={Boolean(editingModalSection)}
          onClose={() => setEditingModalSection(null)}
          onSave={handleSaveFromModal}
          categories={categories}
          brands={brands}
          collections={collections}
          attributes={attributes}
          products={products}
        />
      )}
    </div>
  );
}

export default VisualBuilderStudio;
