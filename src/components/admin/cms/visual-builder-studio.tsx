'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { PageConfig, AnySectionConfig, SiteDesignTokens, FooterConfig, defaultFooterConfig } from '@/types/cms';
import { NavAppearanceConfig, defaultNavAppearanceConfig } from '@/types/navigation-appearance';
import { saveCmsPageConfig, saveSiteDesignTokens, saveNavAppearanceConfig, saveFooterConfig } from '@/lib/cms/service';
import { useThemeVariables } from '@/providers/ThemeVariableProvider';
import { BuilderPreviewCanvas, type DeviceViewport } from './builder-preview-canvas';
import { SECTION_REGISTRY, RegistryEntry } from '@/lib/cms/registry';
import { SectionPicker } from './section-picker';
import { DynamicEditorForm } from './dynamic-editor-form';
import { ThemeEditorPanel } from './theme-editor-panel';
import { NavEditorPanel } from './nav-editor-panel';
import { FooterEditorPanel } from './footer-editor-panel';
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
  Compass,
  LayoutGrid,
  GripVertical,
} from 'lucide-react';
import { toast } from 'sonner';

interface VisualBuilderStudioProps {
  initialPageConfig: PageConfig;
  initialThemeTokens: SiteDesignTokens;
  initialNavConfig?: NavAppearanceConfig;
  initialFooterConfig?: FooterConfig;
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
  initialNavConfig,
  initialFooterConfig,
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
  const [navConfig, setNavConfig] = useState<NavAppearanceConfig>(
    initialNavConfig || defaultNavAppearanceConfig
  );
  const [footerConfig, setFooterConfig] = useState<FooterConfig>(
    initialFooterConfig || defaultFooterConfig
  );
  const [previewMegamenuCategory, setPreviewMegamenuCategory] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceViewport>('desktop');
  const [activeTab, setActiveTab] = useState<'sections' | 'nav' | 'footer' | 'products' | 'theme'>('sections');
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [editingModalSection, setEditingModalSection] = useState<AnySectionConfig | null>(null);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'split' | 'canvas' | 'inspector'>('split');
  const [mobileTab, setMobileTab] = useState<'canvas' | 'split' | 'editor'>('canvas');

  // VS Code-style Resizable Panel State & Persistence
  const DEFAULT_SIDEBAR_WIDTH = 420;
  const [sidebarWidth, setSidebarWidth] = useState<number>(DEFAULT_SIDEBAR_WIDTH);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);

  const splitContainerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => {
        const mobile = window.innerWidth < 768;
        setIsMobileScreen(mobile);
        if (mobile) {
          setSidebarWidth((prev) => Math.min(prev, Math.round(window.innerWidth * 0.65)));
        }
      };
      checkMobile();
      window.addEventListener('resize', checkMobile);

      const saved = localStorage.getItem('builder_sidebar_width');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 260 && parsed <= 1200) {
          setSidebarWidth(parsed);
        }
      }

      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    setIsResizing(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    e.preventDefault();

    const clientX = e.clientX;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    rafIdRef.current = requestAnimationFrame(() => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const currentWidth = clientX - rect.left;

      const isMobile = window.innerWidth < 768;
      const minWidth = isMobile ? 150 : 280;
      const maxWidth = isMobile ? window.innerWidth - 70 : Math.min(1000, window.innerWidth - 260);

      const clamped = Math.max(minWidth, Math.min(maxWidth, currentWidth));
      setSidebarWidth(clamped);
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isResizing) return;
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    setIsResizing(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    if (typeof window !== 'undefined') {
      localStorage.setItem('builder_sidebar_width', String(Math.round(sidebarWidth)));
    }
  };

  const handleDoubleClick = () => {
    setSidebarWidth((prev) => {
      let next = 420;
      if (prev < 380) next = 440;
      else if (prev < 550) next = 620;
      else next = 340;
      if (typeof window !== 'undefined') {
        localStorage.setItem('builder_sidebar_width', String(next));
      }
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSidebarWidth((w) => {
        const next = Math.max(280, w - 20);
        if (typeof window !== 'undefined') localStorage.setItem('builder_sidebar_width', String(next));
        return next;
      });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSidebarWidth((w) => {
        const next = Math.min(Math.min(1000, window.innerWidth - 260), w + 20);
        if (typeof window !== 'undefined') localStorage.setItem('builder_sidebar_width', String(next));
        return next;
      });
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSidebarWidth(340);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSidebarWidth(620);
    }
  };

  useEffect(() => {
    if (selectedSectionId) {
      const el = document.getElementById(`section-canvas-${selectedSectionId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedSectionId]);

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
      if (navConfig) {
        await saveNavAppearanceConfig(navConfig);
      }
      if (footerConfig) {
        await saveFooterConfig(footerConfig);
      }
      setSavedSuccess(true);
      toast.success('Storefront Sections, Navigation, Footer & Theme Published Successfully!');
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to publish storefront changes');
    } finally {
      setIsSaving(false);
    }
  };

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const themeSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const persistPageConfigDebounced = (updated: PageConfig) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveCmsPageConfig('/', updated).catch(console.error);
    }, 500);
  };

  const handleColorChange = (key: keyof SiteDesignTokens, val: string) => {
    const updated = { ...themeTokens, [key]: val };
    setThemeTokens(updated);
    applyLiveTheme(updated);
    if (themeSaveTimeoutRef.current) {
      clearTimeout(themeSaveTimeoutRef.current);
    }
    themeSaveTimeoutRef.current = setTimeout(() => {
      saveSiteDesignTokens(updated).catch(console.error);
    }, 500);
  };

  const handlePresetSelect = (preset: ThemePreset) => {
    setThemeTokens(preset.tokens);
    applyLiveTheme(preset.tokens);
    if (themeSaveTimeoutRef.current) {
      clearTimeout(themeSaveTimeoutRef.current);
    }
    themeSaveTimeoutRef.current = setTimeout(() => {
      saveSiteDesignTokens(preset.tokens).catch(console.error);
    }, 500);
    toast.success(`Applied "${preset.name}" Theme Preset!`);
  };

  const footerSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleFooterConfigChange = (updated: FooterConfig) => {
    setFooterConfig(updated);
    if (footerSaveTimeoutRef.current) {
      clearTimeout(footerSaveTimeoutRef.current);
    }
    footerSaveTimeoutRef.current = setTimeout(() => {
      saveFooterConfig(updated).catch(console.error);
    }, 600);
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
    setMobileTab('editor');
    persistPageConfigDebounced(updated);
    toast.success(`Added "${entry.label}" to layout`);
  };

  const toggleSectionEnabled = (id: string) => {
    setPageConfig((prev) => {
      const updated = {
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
        ),
      };
      persistPageConfigDebounced(updated);
      return updated;
    });
  };

  const deleteSection = (id: string) => {
    setPageConfig((prev) => {
      const updatedSections = prev.sections
        .filter((sec) => sec.id !== id)
        .map((sec, idx) => ({ ...sec, displayOrder: idx + 1 }));

      const updated = { ...prev, sections: updatedSections };
      persistPageConfigDebounced(updated);
      return updated;
    });

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

    setPageConfig((prev) => {
      const updated = {
        ...prev,
        sections: [...prev.sections, duplicated],
      };
      persistPageConfigDebounced(updated);
      return updated;
    });
    setSelectedSectionId(duplicated.id);
    toast.success(`Duplicated "${target.name}"`);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    setPageConfig((prev) => {
      const newSections = [...prev.sections];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= newSections.length) return prev;

      const temp = newSections[index];
      newSections[index] = newSections[targetIdx];
      newSections[targetIdx] = temp;

      const updatedSections = newSections.map((sec, idx) => ({
        ...sec,
        displayOrder: idx + 1,
      }));

      const updated = { ...prev, sections: updatedSections };
      persistPageConfigDebounced(updated);
      return updated;
    });
  };

  const updateSectionField = (
    sectionId: string,
    field: string | Record<string, any>,
    value?: any
  ) => {
    setPageConfig((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id !== sectionId) return sec;
        if (typeof field === 'object' && field !== null) {
          return { ...sec, ...field };
        }
        return { ...sec, [field]: value };
      });
      const updated = { ...prev, sections: updatedSections };
      persistPageConfigDebounced(updated);
      return updated;
    });
  };

  const handleSaveFromModal = (updatedSection: AnySectionConfig) => {
    setPageConfig((prev) => {
      const updated = {
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.id === updatedSection.id ? updatedSection : sec
        ),
      };
      persistPageConfigDebounced(updated);
      return updated;
    });
    toast.success(`Updated "${updatedSection.name}" from Detailed Form!`);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-100 text-slate-900 overflow-hidden font-sans">
      {/* Top Header Navigation Bar - Responsive Admin Control Center */}
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 px-2.5 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-950 transition-colors"
            title="Exit Studio to Admin"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">EXIT</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 hidden sm:block" />
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900 shrink-0" />
            <h1 className="font-extrabold text-xs sm:text-base tracking-tight uppercase text-slate-950 font-heading">
              <span className="inline sm:hidden">Studio</span>
              <span className="hidden sm:inline">Visual Website Studio</span>
            </h1>
            <span className="hidden lg:inline text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-900 text-white shrink-0">
              46 COMPONENTS
            </span>
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'canvas' ? 'split' : 'canvas')}
            className="hidden md:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-950 hover:bg-slate-100 transition cursor-pointer"
            title={viewMode === 'canvas' ? 'Show Editor Sidebar' : 'Hide Editor Sidebar (Full Preview)'}
          >
            {viewMode === 'canvas' ? (
              <PanelLeftOpen className="w-4 h-4 text-indigo-600" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile View Mode Switcher (Preview vs Split vs Editor) */}
        <div className="flex md:hidden items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
          <button
            type="button"
            onClick={() => setMobileTab('canvas')}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 transition cursor-pointer ${
              mobileTab === 'canvas'
                ? 'bg-slate-950 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span>Preview</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMobileTab('split');
              if (typeof window !== 'undefined') {
                setSidebarWidth(Math.round(window.innerWidth * 0.52));
              }
            }}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 transition cursor-pointer ${
              mobileTab === 'split'
                ? 'bg-slate-950 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Split className="w-3 h-3" />
            <span>Split</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase flex items-center gap-1 transition cursor-pointer ${
              mobileTab === 'editor'
                ? 'bg-slate-950 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-950'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>Editor</span>
          </button>
        </div>

        {/* Desktop View Mode & Viewport Device Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Panel Size Quick Presets (VS Code Inspired) */}
          {viewMode === 'split' && (
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[10px] font-bold">
              <span className="text-slate-400 px-1 font-mono uppercase text-[9px]">Panel:</span>
              {[
                { label: 'Compact', width: 340 },
                { label: 'Standard', width: 440 },
                { label: 'Spacious', width: 620 },
                { label: 'Wide', width: 800 },
              ].map((preset) => {
                const isCurrent = Math.abs(sidebarWidth - preset.width) < 30;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setSidebarWidth(preset.width);
                      if (typeof window !== 'undefined') {
                        localStorage.setItem('builder_sidebar_width', String(preset.width));
                      }
                    }}
                    className={`px-2 py-1 rounded-lg transition cursor-pointer ${
                      isCurrent
                        ? 'bg-white text-slate-950 font-extrabold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-white/60'
                    }`}
                    title={`Set editor panel to ${preset.width}px (or drag the border handle)`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          )}

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

          <div className="h-4 w-px bg-slate-200" />

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

          {/* Quick Mega Menu Dropdown Preview Pin Toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setPreviewMegamenuCategory(previewMegamenuCategory ? null : 'MEN')}
              title="Toggle Mega Menu Dropdown in Live Preview Canvas"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                previewMegamenuCategory
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="text-[10px] font-extrabold uppercase">
                {previewMegamenuCategory ? `MEGAMENU (${previewMegamenuCategory})` : 'PREVIEW MEGAMENU'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Actions: Live Store Link + Publish Action Button */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Store in New Tab"
            className="p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition"
          >
            <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden lg:inline text-[10px]">LIVE STORE</span>
          </Link>

          <button
            onClick={handlePublish}
            disabled={isSaving}
            className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl font-extrabold text-[11px] sm:text-xs uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              savedSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-950 hover:bg-slate-800 text-white shadow-md'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                <span className="hidden sm:inline">PUBLISHED</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{isSaving ? 'SAVING...' : 'PUBLISH'}</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Studio Body: Inspector Sidebar + Resizable Gutter + Preview Canvas */}
      <div
        ref={splitContainerRef}
        className={`flex-1 flex overflow-hidden relative ${
          isResizing ? 'cursor-col-resize select-none' : ''
        }`}
      >
        {/* Left Inspector Control Sidebar */}
        <div
          style={{
            width:
              viewMode === 'inspector'
                ? undefined
                : isMobileScreen
                ? mobileTab === 'editor'
                  ? '100%'
                  : mobileTab === 'canvas'
                  ? '0px'
                  : `${sidebarWidth}px`
                : viewMode === 'canvas'
                ? '0px'
                : `${sidebarWidth}px`,
            maxWidth: isMobileScreen && mobileTab === 'split' ? '85vw' : undefined,
          }}
          className={`${
            isMobileScreen
              ? mobileTab === 'canvas'
                ? 'hidden'
                : 'flex'
              : viewMode === 'canvas'
              ? 'hidden'
              : 'flex'
          } ${
            viewMode === 'inspector'
              ? 'w-full md:max-w-4xl md:mx-auto md:border-x'
              : 'shrink-0'
          } bg-white border-slate-200 flex-col z-20 overflow-hidden shadow-xs h-full ${
            isResizing ? 'transition-none select-none' : 'transition-[width] duration-150 ease-out'
          }`}
        >
          {/* Studio Inspector Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-100 p-1.5 sm:p-2 gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('sections')}
              className={`flex-1 min-w-max px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'sections'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Sliders className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>SECTIONS</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('nav')}
              className={`flex-1 min-w-max px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'nav'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>NAV</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('footer')}
              className={`flex-1 min-w-max px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'footer'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>FOOTER</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`flex-1 min-w-max px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'products'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Box className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>CATALOG</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 min-w-max px-2.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer shrink-0 ${
                activeTab === 'theme'
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:text-slate-950 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Palette className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
                  onCollapse={() => {
                    setViewMode('canvas');
                    setMobileTab('canvas');
                  }}
                  categories={categories}
                  brands={brands}
                  collections={collections}
                  attributes={attributes}
                  products={products}
                />
              ) : (
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {/* Add Component Trigger Button */}
                <button
                  onClick={() => setShowSectionPicker(true)}
                  className="w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-950 bg-white hover:bg-slate-50 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">ADD STOREFRONT COMPONENT OR BUNDLE</span>
                  <span className="inline sm:hidden">ADD STOREFRONT COMPONENT</span>
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
                        className="p-2.5 sm:p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-2xs transition flex items-center justify-between gap-2 cursor-pointer select-none group"
                      >
                        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                          <span className="w-5 h-5 rounded bg-slate-100 group-hover:bg-slate-950 group-hover:text-white text-slate-500 text-[10px] font-extrabold flex items-center justify-center transition shrink-0">
                            {index + 1}
                          </span>
                          <div className="truncate min-w-0">
                            <h4 className="text-xs font-bold text-slate-950 truncate group-hover:text-indigo-600 transition">
                              {section.name || registryEntry?.label || section.type}
                            </h4>
                            <span className="text-[9px] sm:text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                              {registryEntry?.category || 'SECTION'}
                            </span>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div
                          className="flex items-center gap-0.5 sm:gap-1 shrink-0"
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
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-950 group-hover:translate-x-0.5 transition ml-0.5" />
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

          {/* Tab 2: Navigation Appearance Studio */}
          {activeTab === 'nav' && (
            <NavEditorPanel
              config={navConfig}
              onChange={setNavConfig}
              previewMegamenuCategory={previewMegamenuCategory}
              onPreviewMegamenuChange={setPreviewMegamenuCategory}
            />
          )}

          {/* Tab: Footer Studio */}
          {activeTab === 'footer' && (
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
              <FooterEditorPanel
                config={footerConfig}
                onChange={handleFooterConfigChange}
              />
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

        {/* VS Code-style Resizable Splitter Gutter */}
        {((!isMobileScreen && viewMode === 'split') || (isMobileScreen && mobileTab === 'split')) && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize editor panel"
            aria-valuenow={Math.round(sidebarWidth)}
            aria-valuemin={280}
            aria-valuemax={1000}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDoubleClick={handleDoubleClick}
            onKeyDown={handleKeyDown}
            className={`group relative flex items-center justify-center select-none z-30 shrink-0 touch-none cursor-col-resize transition-all ${
              isResizing
                ? 'w-2 bg-indigo-600 ring-4 ring-indigo-400/30'
                : 'w-1 sm:w-1.5 hover:w-2 bg-slate-200 hover:bg-indigo-500 active:bg-indigo-600'
            }`}
          >
            {/* Generous touch/mouse target: 32px on touch mobile, 20px on desktop */}
            <div className="absolute inset-y-0 -left-3 -right-3 z-10 cursor-col-resize touch-none" />

            {/* Center Grip Handle Pill (VS Code / Figma style) */}
            <div
              className={`relative z-20 w-4 h-9 sm:w-3.5 sm:h-8 rounded-full border flex items-center justify-center transition-all shadow-xs pointer-events-none ${
                isResizing
                  ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-md ring-2 ring-indigo-300'
                  : 'bg-white border-slate-300 text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-400 group-hover:scale-110'
              }`}
              title="Drag to resize panel • Double-click to toggle width"
            >
              <GripVertical className="w-2.5 h-2.5" />
            </div>
          </div>
        )}

        {/* Right Interactive Preview Canvas */}
        <div
          className={`${
            isMobileScreen
              ? mobileTab === 'editor'
                ? 'hidden'
                : 'flex'
              : viewMode === 'inspector'
              ? 'hidden'
              : 'flex'
          } flex-1 min-w-0 h-full overflow-hidden bg-slate-900/95 flex-col relative isolate z-0 ${
            isResizing ? 'pointer-events-none select-none' : ''
          }`}
        >
          {/* Quick Floating Re-open Editor Button when in Canvas Only mode on Desktop */}
          {viewMode === 'canvas' && (
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className="hidden md:flex absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-lg hover:bg-white items-center gap-1.5 cursor-pointer transition hover:scale-105"
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
            navConfig={navConfig}
            footerConfig={footerConfig}
            previewActiveCategory={previewMegamenuCategory}
            onPreviewCategoryChange={setPreviewMegamenuCategory}
            selectedSectionId={selectedSectionId}
            onSelectSection={(id) => {
              if (viewMode === 'canvas') {
                setViewMode('split');
              }
              setActiveTab('sections');
              setSelectedSectionId(id);
              setMobileTab('editor');
            }}
            onSelectFooter={() => {
              if (viewMode === 'canvas') {
                setViewMode('split');
              }
              setActiveTab('footer');
              setMobileTab('editor');
            }}
          />
        </div>
      </div>

      {/* Floating Mobile Action Pill (Only on mobile when in canvas preview mode) */}
      {mobileTab === 'canvas' && (
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md p-1.5 pl-3 pr-2 rounded-full border border-slate-700 shadow-2xl text-white">
          <span className="text-[11px] font-bold text-slate-300">Live Preview</span>
          <button
            type="button"
            onClick={() => setMobileTab('editor')}
            className="px-3 py-1.5 bg-white text-slate-950 rounded-full text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-xs hover:bg-slate-100 transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Layout</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSectionPicker(true)}
            className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 transition cursor-pointer"
            title="Add Component"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

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
