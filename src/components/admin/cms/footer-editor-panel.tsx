'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FooterConfig,
  FooterColumn,
  FooterLinkItem,
  FooterSocialLink,
  FOOTER_PRESETS,
  defaultFooterConfig,
} from '@/types/footer-config';
import {
  LayoutGrid,
  Type,
  Mail,
  PhoneCall,
  Share2,
  FileText,
  Palette,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ExternalLink,
  Sliders,
  Check,
  Link as LinkIcon,
  Globe,
} from 'lucide-react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { toast } from 'sonner';

interface FooterEditorPanelProps {
  config: FooterConfig;
  onChange: (updated: FooterConfig) => void;
}

type FooterSubTab = 'columns' | 'brand' | 'newsletter' | 'contact' | 'social' | 'bottom' | 'styling';

export function FooterEditorPanel({ config, onChange }: FooterEditorPanelProps) {
  const [activeSubTab, setActiveSubTab] = useState<FooterSubTab>('columns');
  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);
  const [activeColIndex, setActiveColIndex] = useState<number>(0);
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

  const updateField = <K extends keyof FooterConfig>(key: K, val: FooterConfig[K]) => {
    onChange({
      ...config,
      [key]: val,
    });
  };

  const applyPreset = (presetId: string) => {
    const found = FOOTER_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    onChange({
      ...config,
      ...found.config,
    });
    setIsPresetDropdownOpen(false);
    toast.success(`Applied "${found.name}" Footer Preset`);
  };

  const handleResetDefaults = () => {
    onChange(defaultFooterConfig);
    toast.success('Reset Footer to Lexido Luxury Defaults');
  };

  // Column helpers
  const handleAddColumn = () => {
    const newId = `col-${Date.now()}`;
    const newCol: FooterColumn = {
      id: newId,
      title: 'NEW COLUMN',
      links: [
        { id: `lnk-${Date.now()}-1`, label: 'Link One', url: '/products' },
        { id: `lnk-${Date.now()}-2`, label: 'Link Two', url: '/collections' },
      ],
    };
    const nextCols = [...(config.columns || []), newCol];
    updateField('columns', nextCols);
    setActiveColIndex(nextCols.length - 1);
    toast.success('Added new footer column');
  };

  const handleRemoveColumn = (idx: number) => {
    const nextCols = [...(config.columns || [])];
    nextCols.splice(idx, 1);
    updateField('columns', nextCols);
    if (activeColIndex >= nextCols.length) {
      setActiveColIndex(Math.max(0, nextCols.length - 1));
    }
    toast.success('Removed footer column');
  };

  const handleMoveColumn = (idx: number, dir: 'up' | 'down') => {
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= (config.columns || []).length) return;
    const nextCols = [...(config.columns || [])];
    const temp = nextCols[idx];
    nextCols[idx] = nextCols[targetIdx];
    nextCols[targetIdx] = temp;
    updateField('columns', nextCols);
    setActiveColIndex(targetIdx);
  };

  const handleColumnTitleChange = (idx: number, title: string) => {
    const nextCols = [...(config.columns || [])];
    nextCols[idx] = { ...nextCols[idx], title };
    updateField('columns', nextCols);
  };

  // Link helpers inside column
  const handleAddLink = (colIdx: number) => {
    const nextCols = [...(config.columns || [])];
    const newLink: FooterLinkItem = {
      id: `lnk-${Date.now()}`,
      label: 'New Link',
      url: '/products',
    };
    nextCols[colIdx] = {
      ...nextCols[colIdx],
      links: [...(nextCols[colIdx].links || []), newLink],
    };
    updateField('columns', nextCols);
  };

  const handleUpdateLink = (
    colIdx: number,
    linkIdx: number,
    patch: Partial<FooterLinkItem>
  ) => {
    const nextCols = [...(config.columns || [])];
    const links = [...(nextCols[colIdx].links || [])];
    links[linkIdx] = { ...links[linkIdx], ...patch };
    nextCols[colIdx] = { ...nextCols[colIdx], links };
    updateField('columns', nextCols);
  };

  const handleRemoveLink = (colIdx: number, linkIdx: number) => {
    const nextCols = [...(config.columns || [])];
    const links = [...(nextCols[colIdx].links || [])];
    links.splice(linkIdx, 1);
    nextCols[colIdx] = { ...nextCols[colIdx], links };
    updateField('columns', nextCols);
  };

  // Social link helpers
  const handleToggleSocial = (idx: number) => {
    const nextSocial = [...(config.socialLinks || [])];
    nextSocial[idx] = { ...nextSocial[idx], enabled: !nextSocial[idx].enabled };
    updateField('socialLinks', nextSocial);
  };

  const handleUpdateSocialUrl = (idx: number, url: string) => {
    const nextSocial = [...(config.socialLinks || [])];
    nextSocial[idx] = { ...nextSocial[idx], url };
    updateField('socialLinks', nextSocial);
  };

  const handleAddSocialLink = () => {
    const newSoc: FooterSocialLink = {
      id: `soc-${Date.now()}`,
      platform: 'custom',
      label: 'Custom Link',
      url: 'https://',
      enabled: true,
    };
    updateField('socialLinks', [...(config.socialLinks || []), newSoc]);
  };

  const currentColumns = config.columns || [];

  return (
    <div className="flex flex-col gap-5 w-full text-slate-800">
      {/* Top Header Card with Presets and Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-slate-900" />
            <h3 className="text-sm font-bold tracking-tight text-slate-900 uppercase font-heading">
              Footer Studio
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-900 text-white rounded-full uppercase tracking-wider">
              Live
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Customize navigation columns, newsletter, branding, social links, and styling.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Preset Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsPresetDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Style Presets</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-1.5 animate-in fade-in-50 zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Visual Preset
                </div>
                {FOOTER_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p.id)}
                    className="w-full text-left px-2.5 py-2 rounded-lg hover:bg-slate-50 transition cursor-pointer flex flex-col gap-0.5"
                  >
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <span className="text-[10px] text-slate-500 leading-tight">
                      {p.description}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Defaults */}
          <button
            type="button"
            onClick={handleResetDefaults}
            title="Reset to default luxury Lexido settings"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'columns', label: 'Columns', icon: LayoutGrid, count: currentColumns.length },
          { id: 'brand', label: 'Brand & Logo', icon: Type },
          { id: 'newsletter', label: 'Newsletter', icon: Mail },
          { id: 'contact', label: 'Contact', icon: PhoneCall },
          { id: 'social', label: 'Social Channels', icon: Share2 },
          { id: 'bottom', label: 'Bottom Bar', icon: FileText },
          { id: 'styling', label: 'Styling & Borders', icon: Palette },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as FooterSubTab)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-950 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: COLUMNS EDITOR */}
      {activeSubTab === 'columns' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 font-heading">
              Footer Navigation Columns ({currentColumns.length})
            </h4>
            <button
              type="button"
              onClick={handleAddColumn}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Column
            </button>
          </div>

          {currentColumns.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No navigation columns configured.</p>
              <button
                type="button"
                onClick={handleAddColumn}
                className="mt-3 text-xs font-bold text-slate-950 underline cursor-pointer"
              >
                Add Your First Column
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
              {/* Column Selector List (Top when compact, Left when wide) */}
              <div className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-2">
                {currentColumns.map((col, idx) => {
                  const isSelected = activeColIndex === idx;
                  return (
                    <div
                      key={col.id}
                      onClick={() => setActiveColIndex(idx)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-slate-950 text-white border-slate-950 shadow-sm'
                          : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold uppercase tracking-wide truncate">
                          {col.title || 'Untitled Column'}
                        </span>
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {col.links?.length || 0} link(s)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveColumn(idx, 'up')}
                          className={`p-1 rounded transition disabled:opacity-30 cursor-pointer ${
                            isSelected
                              ? 'hover:bg-white/10 text-white'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === currentColumns.length - 1}
                          onClick={() => handleMoveColumn(idx, 'down')}
                          className={`p-1 rounded transition disabled:opacity-30 cursor-pointer ${
                            isSelected
                              ? 'hover:bg-white/10 text-white'
                              : 'hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveColumn(idx)}
                          className={`p-1 rounded transition hover:text-red-500 cursor-pointer ${
                            isSelected
                              ? 'hover:bg-white/10 text-slate-400'
                              : 'hover:bg-slate-100 text-slate-400'
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Column Details & Links (Below when compact, Right when wide) */}
              <div className="xl:col-span-8 bg-white p-4 rounded-xl border border-slate-200 flex flex-col gap-4">
                {currentColumns[activeColIndex] ? (
                  <>
                    <div className="flex flex-col gap-1.5 border-b border-slate-100 pb-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Column Title / Heading
                      </label>
                      <input
                        type="text"
                        value={currentColumns[activeColIndex].title}
                        onChange={(e) => handleColumnTitleChange(activeColIndex, e.target.value)}
                        placeholder="e.g. SHOP, EXPLORE, POLICIES"
                        className="px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Column Links ({currentColumns[activeColIndex].links?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => handleAddLink(activeColIndex)}
                        className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Link
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto pr-1">
                      {currentColumns[activeColIndex].links?.map((lnk, linkIdx) => (
                        <div
                          key={lnk.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={lnk.label}
                              onChange={(e) =>
                                handleUpdateLink(activeColIndex, linkIdx, { label: e.target.value })
                              }
                              placeholder="Link Label"
                              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:border-slate-900 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={lnk.url}
                              onChange={(e) =>
                                handleUpdateLink(activeColIndex, linkIdx, { url: e.target.value })
                              }
                              placeholder="/products?..."
                              className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:border-slate-900 focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveLink(activeColIndex, linkIdx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete Link"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-slate-500">Select a column on the left to edit its links.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BRAND & LOGO */}
      {activeSubTab === 'brand' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-xl border border-slate-200">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Brand Name
              </label>
              <input
                type="text"
                value={config.brandName}
                onChange={(e) => updateField('brandName', e.target.value)}
                placeholder="LEXIDO"
                className="px-3 py-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Eyebrow / Sub-Tagline
              </label>
              <input
                type="text"
                value={config.brandTagline}
                onChange={(e) => updateField('brandTagline', e.target.value)}
                placeholder="PREMIUM STREETWEAR"
                className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Brand Bio / Editorial Description
              </label>
              <textarea
                rows={3}
                value={config.brandDescription}
                onChange={(e) => updateField('brandDescription', e.target.value)}
                placeholder="Crafted for those who move different..."
                className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900 resize-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Logo Display Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateField('logoType', 'text')}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    config.logoType === 'text'
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Typography Text
                </button>
                <button
                  type="button"
                  onClick={() => updateField('logoType', 'image')}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    config.logoType === 'image'
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Image / Crest
                </button>
              </div>
            </div>

            {config.logoType === 'image' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Logo Asset (Cloudflare R2 or Web URL)
                </label>
                <ImagePreviewInput
                  value={config.logoImageUrl || ''}
                  onChange={(url) => updateField('logoImageUrl', url)}
                  label="Footer Logo"
                  folder="brands"
                  aspectRatio="auto"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: NEWSLETTER */}
      {activeSubTab === 'newsletter' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Newsletter Subscription Box
              </h4>
              <p className="text-xs text-slate-500">
                Display the luxury email capture form above the bottom divider.
              </p>
            </div>
            <input
              type="checkbox"
              id="showNewsletter"
              checked={config.showNewsletter}
              onChange={(e) => updateField('showNewsletter', e.target.checked)}
              className="w-4 h-4 accent-slate-900 cursor-pointer"
            />
          </div>

          {config.showNewsletter && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Newsletter Heading
                </label>
                <input
                  type="text"
                  value={config.newsletterHeading}
                  onChange={(e) => updateField('newsletterHeading', e.target.value)}
                  placeholder="BECOME PART OF LEXIDO"
                  className="px-3 py-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Input Placeholder
                </label>
                <input
                  type="text"
                  value={config.newsletterPlaceholder}
                  onChange={(e) => updateField('newsletterPlaceholder', e.target.value)}
                  placeholder="your@email.com"
                  className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Submit Button Label
                </label>
                <input
                  type="text"
                  value={config.newsletterButtonText}
                  onChange={(e) => updateField('newsletterButtonText', e.target.value)}
                  placeholder="SUBSCRIBE"
                  className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Success Confirmation Text
                </label>
                <input
                  type="text"
                  value={config.newsletterSuccessMessage}
                  onChange={(e) => updateField('newsletterSuccessMessage', e.target.value)}
                  placeholder="✓ THANK YOU FOR SUBSCRIBING."
                  className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="md:col-span-2 flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Subtitle Description
                </label>
                <input
                  type="text"
                  value={config.newsletterDescription}
                  onChange={(e) => updateField('newsletterDescription', e.target.value)}
                  placeholder="Subscribe to receive private drop alerts..."
                  className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONTACT & REACH US */}
      {activeSubTab === 'contact' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Contact Column Title
            </label>
            <input
              type="text"
              value={config.contactTitle}
              onChange={(e) => updateField('contactTitle', e.target.value)}
              placeholder="REACH US"
              className="px-3 py-2 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Support Email
            </label>
            <input
              type="email"
              value={config.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
              placeholder="hello@lexido.in"
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Working Hours
            </label>
            <input
              type="text"
              value={config.contactHours}
              onChange={(e) => updateField('contactHours', e.target.value)}
              placeholder="Mon–Sat, 10am–7pm IST"
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Helpline Phone (Optional)
            </label>
            <input
              type="text"
              value={config.contactPhone || ''}
              onChange={(e) => updateField('contactPhone', e.target.value)}
              placeholder="+91 98765 43210"
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>
      )}

      {/* TAB 5: SOCIAL CHANNELS */}
      {activeSubTab === 'social' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col gap-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900">
                Social Media Channels
              </h4>
              <p className="text-xs text-slate-500">
                Display square outlined icons linked directly to your official brand handles.
              </p>
            </div>
            <input
              type="checkbox"
              id="showSocialLinks"
              checked={config.showSocialLinks}
              onChange={(e) => updateField('showSocialLinks', e.target.checked)}
              className="w-4 h-4 accent-slate-900 cursor-pointer"
            />
          </div>

          {config.showSocialLinks && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 max-w-xs">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Social Heading
                </label>
                <input
                  type="text"
                  value={config.socialHeading}
                  onChange={(e) => updateField('socialHeading', e.target.value)}
                  placeholder="FOLLOW"
                  className="px-3 py-1.5 text-xs font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="flex flex-col gap-2.5">
                {config.socialLinks?.map((soc, idx) => (
                  <div
                    key={soc.id || idx}
                    className="flex items-center gap-3 p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      checked={soc.enabled}
                      onChange={() => handleToggleSocial(idx)}
                      className="w-4 h-4 accent-slate-900 cursor-pointer"
                    />

                    <span className="text-xs font-bold text-slate-800 w-28 uppercase truncate">
                      {soc.label}
                    </span>

                    <input
                      type="text"
                      value={soc.url}
                      onChange={(e) => handleUpdateSocialUrl(idx, e.target.value)}
                      placeholder="https://..."
                      className="flex-1 px-3 py-1 text-xs bg-white border border-slate-200 rounded focus:border-slate-900 focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: BOTTOM BAR */}
      {activeSubTab === 'bottom' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Copyright Notice
            </label>
            <input
              type="text"
              value={config.copyrightText}
              onChange={(e) => updateField('copyrightText', e.target.value)}
              placeholder="© 2026 LEXIDO. All rights reserved. Made in India."
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tagline Prefix
            </label>
            <input
              type="text"
              value={config.taglineText}
              onChange={(e) => updateField('taglineText', e.target.value)}
              placeholder="TAG"
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tagline Highlight
            </label>
            <input
              type="text"
              value={config.taglineHighlight}
              onChange={(e) => updateField('taglineHighlight', e.target.value)}
              placeholder="@LEXIDO — FEATURED IN OUR NEXT DROP"
              className="px-3 py-2 text-xs text-slate-900 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-900"
            />
          </div>
        </div>
      )}

      {/* TAB 7: STYLING & BORDERS */}
      {activeSubTab === 'styling' && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Background Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.backgroundColor || '#000000'}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={config.backgroundColor || '#000000'}
                onChange={(e) => updateField('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Text Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Heading & Primary Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.textColor || '#ffffff'}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={config.textColor || '#ffffff'}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Muted Text Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Muted / Secondary Text Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.mutedTextColor || '#a3a3a3'}
                onChange={(e) => updateField('mutedTextColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={config.mutedTextColor || '#a3a3a3'}
                onChange={(e) => updateField('mutedTextColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Border Color */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Border & Divider Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.borderColor || '#171717'}
                onChange={(e) => updateField('borderColor', e.target.value)}
                className="w-9 h-9 rounded-lg border border-slate-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={config.borderColor || '#171717'}
                onChange={(e) => updateField('borderColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>
          </div>

          {/* Top Border Width */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Top Border Width
            </label>
            <select
              value={config.borderTopWidth || 'thin'}
              onChange={(e) => updateField('borderTopWidth', e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="none">None (0px)</option>
              <option value="thin">Thin (1px)</option>
              <option value="medium">Medium (2px)</option>
              <option value="thick">Thick (4px)</option>
            </select>
          </div>

          {/* Border Style */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Border Style
            </label>
            <select
              value={config.borderStyle || 'solid'}
              onChange={(e) => updateField('borderStyle', e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="none">None</option>
            </select>
          </div>

          {/* Container Width */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Container Max Width
            </label>
            <select
              value={config.containerWidth || 'boxed'}
              onChange={(e) => updateField('containerWidth', e.target.value as any)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none"
            >
              <option value="boxed">Boxed (max 1280px / 7xl)</option>
              <option value="wide">Wide (max 1600px)</option>
              <option value="full">Full Width (Edge-to-Edge)</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

export default FooterEditorPanel;

