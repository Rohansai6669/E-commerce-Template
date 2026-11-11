'use client';

import React, { useEffect, useState } from 'react';
import { PageConfig, AnySectionConfig, ProductCardConfig, TableConfig, AnnouncementBarConfig, SiteDesignTokens } from '@/types/cms';
import { getCmsPageConfig, saveCmsPageConfig, getTableConfig, saveTableConfig, getAnnouncementBar, saveAnnouncementBar, getSiteDesignTokens, saveSiteDesignTokens } from '@/lib/cms/service';
import { defaultProductCardConfig, defaultSiteDesignTokens } from '@/lib/cms/defaults';
import { useThemeVariables } from '@/providers/ThemeVariableProvider';
import { SectionEditorModal } from '@/components/admin/cms/section-editor-modal';
import Link from 'next/link';
import { Sliders, Eye, ArrowUp, ArrowDown, Save, CheckCircle, Layout, Table as TableIcon, Megaphone, Palette, Edit3, Sparkles } from 'lucide-react';

export default function AdminCmsPage() {
  const { tokens: currentThemeTokens, updateTokens: applyLiveTheme } = useThemeVariables();

  const [pageConfig, setPageConfig] = useState<PageConfig | null>(null);
  const [productCardConfig, setProductCardConfig] = useState<ProductCardConfig>(defaultProductCardConfig);
  const [tableConfig, setTableConfig] = useState<TableConfig | null>(null);
  const [announcementBar, setAnnouncementBarState] = useState<AnnouncementBarConfig | null>(null);
  const [themeTokens, setThemeTokens] = useState<SiteDesignTokens>(currentThemeTokens || defaultSiteDesignTokens);

  const [editingSection, setEditingSection] = useState<AnySectionConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'theme' | 'sections' | 'product_cards' | 'tables' | 'announcement'>('theme');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      const page = await getCmsPageConfig('/');
      setPageConfig(page);

      const tbl = await getTableConfig('admin-orders-table');
      setTableConfig(tbl);

      const ann = await getAnnouncementBar();
      setAnnouncementBarState(ann);

      const tok = await getSiteDesignTokens();
      setThemeTokens(tok);
    }
    loadData();
  }, []);

  const handleSaveAll = async () => {
    if (pageConfig) {
      await saveCmsPageConfig('/', pageConfig);
    }
    if (tableConfig) {
      await saveTableConfig(tableConfig);
    }
    if (announcementBar) {
      await saveAnnouncementBar(announcementBar);
    }
    if (themeTokens) {
      await saveSiteDesignTokens(themeTokens);
      applyLiveTheme(themeTokens);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleColorChange = (key: keyof SiteDesignTokens, val: string) => {
    const updated = { ...themeTokens, [key]: val };
    setThemeTokens(updated);
    applyLiveTheme(updated);
  };

  const toggleSectionEnabled = (id: string) => {
    if (!pageConfig) return;
    const updated = {
      ...pageConfig,
      sections: pageConfig.sections.map((sec) =>
        sec.id === id ? { ...sec, enabled: !sec.enabled } : sec
      ),
    };
    setPageConfig(updated);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!pageConfig) return;
    const newSections = [...pageConfig.sections];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newSections.length) return;

    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    newSections.forEach((sec, idx) => {
      sec.displayOrder = idx + 1;
    });

    setPageConfig({ ...pageConfig, sections: newSections });
  };

  const handleSectionSaveFromModal = (updatedSec: AnySectionConfig) => {
    if (!pageConfig) return;
    const updatedSections = pageConfig.sections.map((sec) =>
      sec.id === updatedSec.id ? updatedSec : sec
    );
    setPageConfig({ ...pageConfig, sections: updatedSections });
  };

  const toggleTableColumnVisible = (colId: string) => {
    if (!tableConfig) return;
    const updatedCols = tableConfig.columns.map((col) =>
      col.id === colId ? { ...col, visible: !col.visible } : col
    );
    setTableConfig({ ...tableConfig, columns: updatedCols });
  };

  const toggleCardVisibilityFlag = (key: keyof ProductCardConfig) => {
    setProductCardConfig((prev) => ({
      ...prev,
      [key]: typeof prev[key] === 'boolean' ? !prev[key] : prev[key],
    }));
  };

  if (!pageConfig || !tableConfig || !announcementBar) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Loading CMS control panel...
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
            Storefront CMS Control Panel
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control dynamic styling, section content, Hero carousel layout, card visibility, and data tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg hover:bg-indigo-500 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" /> Launch Visual Builder & Device Preview
          </Link>

          <button
            onClick={handleSaveAll}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                Saved & Applied!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Publish Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('theme')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'theme'
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Palette className="h-4 w-4" />
          Global Theme & Styling
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'sections'
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Layout className="h-4 w-4" />
          Landing Page Sections ({pageConfig.sections.length})
        </button>

        <button
          onClick={() => setActiveTab('product_cards')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'product_cards'
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Sliders className="h-4 w-4" />
          Product Card Merchandising
        </button>

        <button
          onClick={() => setActiveTab('tables')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'tables'
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <TableIcon className="h-4 w-4" />
          Configurable Data Tables
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors ${
            activeTab === 'announcement'
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/60 text-muted-foreground hover:bg-muted'
          }`}
        >
          <Megaphone className="h-4 w-4" />
          Announcement Bar
        </button>
      </div>

      {/* TAB 0: Global Theme & Customization */}
      {activeTab === 'theme' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Dynamic Theme & Color Palette Customizer
            </h3>
            <span className="text-xs text-muted-foreground">
              Changes apply instantly across storefront and admin views
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'primaryColor', label: 'Primary Brand Color' },
              { key: 'secondaryColor', label: 'Secondary Text Color' },
              { key: 'accentColor', label: 'Accent Highlight Color' },
              { key: 'backgroundColor', label: 'Page Background Color' },
              { key: 'surfaceColor', label: 'Card / Surface Color' },
              { key: 'textColor', label: 'Primary Text Color' },
              { key: 'borderColor', label: 'Border Color' },
              { key: 'destructiveColor', label: 'Alert / Destructive Color' },
            ].map(({ key, label }) => (
              <div key={key} className="p-4 rounded-2xl border border-border bg-card space-y-2">
                <label className="text-xs font-semibold text-foreground block">{label}</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={String(themeTokens[key as keyof SiteDesignTokens] || '#0f172a')}
                    onChange={(e) => handleColorChange(key as keyof SiteDesignTokens, e.target.value)}
                    className="h-9 w-9 rounded-lg border border-input cursor-pointer"
                  />
                  <input
                    type="text"
                    value={String(themeTokens[key as keyof SiteDesignTokens] || '')}
                    onChange={(e) => handleColorChange(key as keyof SiteDesignTokens, e.target.value)}
                    className="flex-1 rounded-xl border border-input bg-background p-2 text-xs font-mono text-foreground"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Border Radius & Shadow Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <label className="text-xs font-semibold text-foreground block">Border Radius Style</label>
              <select
                value={themeTokens.borderRadius}
                onChange={(e) => handleColorChange('borderRadius', e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground"
              >
                <option value="none">Square (0px)</option>
                <option value="sm">Small (4px)</option>
                <option value="md">Medium (8px)</option>
                <option value="lg">Large (12px)</option>
                <option value="xl">Extra Large (20px)</option>
                <option value="full">Pill / Full Round</option>
              </select>
            </div>

            <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
              <label className="text-xs font-semibold text-foreground block">Elevation / Shadow Style</label>
              <select
                value={themeTokens.shadowStyle}
                onChange={(e) => handleColorChange('shadowStyle', e.target.value)}
                className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground"
              >
                <option value="none">Flat / No Shadow</option>
                <option value="sm">Subtle Shadow (sm)</option>
                <option value="md">Standard Shadow (md)</option>
                <option value="lg">Deep Elevation (lg)</option>
                <option value="glass">Glassmorphism Backdrop Blur</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Page Sections Manager */}
      {activeTab === 'sections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold tracking-tight text-foreground">
              Homepage Sections Content & Order
            </h3>
            <span className="text-xs text-muted-foreground">
              Click &ldquo;Edit Content&rdquo; to modify titles, Hero carousel slides, images, and CTAs
            </span>
          </div>

          <div className="space-y-3">
            {pageConfig.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  section.enabled
                    ? 'border-border bg-card shadow-xs'
                    : 'border-border/40 bg-muted/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      {section.name}
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                        {section.type}
                      </span>
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Heading: &ldquo;{section.heading || 'N/A'}&rdquo;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingSection(section)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    Edit Content
                  </button>

                  <div className="flex gap-1">
                    <button
                      onClick={() => moveSection(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-input bg-background text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveSection(idx, 'down')}
                      disabled={idx === pageConfig.sections.length - 1}
                      className="p-1.5 rounded-lg border border-input bg-background text-foreground hover:bg-accent disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => toggleSectionEnabled(section.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                      section.enabled
                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                        : 'bg-muted text-muted-foreground border border-border'
                    }`}
                  >
                    {section.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Product Card Merchandising */}
      {activeTab === 'product_cards' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Product Card Presentation Visibility Flags
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { key: 'showName', label: 'Product Title / Name' },
              { key: 'showPrice', label: 'Price' },
              { key: 'showCompareAtPrice', label: 'Compare-at Price (Strikethrough)' },
              { key: 'showDiscount', label: 'Discount Percentage Badge' },
              { key: 'showCategory', label: 'Category Eyebrow' },
              { key: 'showRating', label: 'Star Rating' },
              { key: 'showReviewCount', label: 'Review Count' },
              { key: 'showBadges', label: 'Custom Badges (NEW, SALE, BESTSELLER)' },
              { key: 'showQuickAdd', label: 'Quick Add Button' },
              { key: 'showWishlist', label: 'Wishlist Button' },
              { key: 'hoverImageEnabled', label: 'Secondary Image Hover Effect' },
              { key: 'quickViewEnabled', label: 'Quick View Modal Trigger' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card cursor-pointer hover:bg-muted/30 transition-colors"
              >
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <input
                  type="checkbox"
                  checked={Boolean(productCardConfig[key as keyof ProductCardConfig])}
                  onChange={() => toggleCardVisibilityFlag(key as keyof ProductCardConfig)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-primary cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Configurable Data Tables */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            {tableConfig.name} - Columns Configuration
          </h3>

          <div className="space-y-3">
            {tableConfig.columns.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase font-mono">
                    {col.type}
                  </span>
                  <span className="text-sm font-semibold text-foreground">{col.label}</span>
                  <span className="text-xs text-muted-foreground font-mono">({col.field})</span>
                </div>

                <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                  <span>Visible</span>
                  <input
                    type="checkbox"
                    checked={col.visible}
                    onChange={() => toggleTableColumnVisible(col.id)}
                    className="h-4 w-4 rounded border-input text-primary cursor-pointer"
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Announcement Bar */}
      {activeTab === 'announcement' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold tracking-tight text-foreground">
            Top Announcement Bar Settings
          </h3>

          <div className="space-y-4 max-w-xl border border-border bg-card p-6 rounded-2xl">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-foreground">Enable Announcement Bar</span>
              <input
                type="checkbox"
                checked={announcementBar.enabled}
                onChange={(e) => setAnnouncementBarState({ ...announcementBar, enabled: e.target.checked })}
                className="h-4 w-4 rounded border-input text-primary cursor-pointer"
              />
            </label>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground block">Announcement Message</label>
              <input
                type="text"
                value={announcementBar.message}
                onChange={(e) => setAnnouncementBarState({ ...announcementBar, message: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground block">CTA Text</label>
              <input
                type="text"
                value={announcementBar.ctaText || ''}
                onChange={(e) => setAnnouncementBarState({ ...announcementBar, ctaText: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground"
              />
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal Editor */}
      {editingSection && (
        <SectionEditorModal
          section={editingSection}
          isOpen={Boolean(editingSection)}
          onClose={() => setEditingSection(null)}
          onSave={handleSectionSaveFromModal}
        />
      )}
    </div>
  );
}
