'use client';

import React, { useState } from 'react';
import { SECTION_REGISTRY, RegistryEntry } from '@/lib/cms/registry';
import { SectionCategory } from '@/types/cms';
import { Search, X, Plus, Sparkles, Layers, Image as ImageIcon, LayoutGrid, Megaphone, Clock, ShoppingBag } from 'lucide-react';

interface SectionPickerProps {
  onSelectSection: (entry: RegistryEntry) => void;
  onClose: () => void;
}

const CATEGORIES: { id: SectionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All Components' },
  { id: 'headers', label: 'Headers' },
  { id: 'heroes', label: 'Heroes' },
  { id: 'products', label: 'Products & Bundles' },
  { id: 'categories', label: 'Categories' },
  { id: 'promotions', label: 'Promotions' },
  { id: 'trust', label: 'Trust & Reviews' },
  { id: 'utility', label: 'Footers & Utilities' },
];

/**
 * Visual Miniature Component Wireframe Preview Renderer
 */
function MiniComponentPreview({ category, type }: { category: SectionCategory; type: string }) {
  if (category === 'headers') {
    return (
      <div className="w-full h-16 bg-slate-100 rounded-lg p-2 flex flex-col justify-between border border-slate-200/80 mb-3 overflow-hidden select-none">
        <div className="w-full h-2 bg-slate-900 rounded-xs" />
        <div className="flex items-center justify-between gap-2">
          <div className="w-12 h-3 bg-slate-800 rounded-xs" />
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-slate-400 rounded-xs" />
            <div className="w-6 h-2 bg-slate-400 rounded-xs" />
            <div className="w-6 h-2 bg-slate-400 rounded-xs" />
          </div>
          <div className="w-4 h-3 bg-indigo-600 rounded-xs" />
        </div>
      </div>
    );
  }

  if (category === 'heroes') {
    return (
      <div className="w-full h-20 bg-slate-900 rounded-lg p-2.5 flex flex-col justify-end border border-slate-800 mb-3 relative overflow-hidden select-none">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 opacity-90" />
        <div className="relative z-10 space-y-1">
          <div className="w-10 h-1.5 bg-indigo-400 rounded-xs" />
          <div className="w-28 h-3 bg-white rounded-xs" />
          <div className="w-12 h-3 bg-indigo-600 rounded-xs mt-1" />
        </div>
      </div>
    );
  }

  if (category === 'products') {
    return (
      <div className="w-full h-20 bg-slate-50 rounded-lg p-2 grid grid-cols-3 gap-1.5 border border-slate-200 mb-3 overflow-hidden select-none">
        <div className="bg-white p-1 rounded border border-slate-200 flex flex-col justify-between">
          <div className="w-full h-8 bg-slate-200 rounded-xs" />
          <div className="w-full h-1.5 bg-slate-800 rounded-xs" />
          <div className="w-6 h-1.5 bg-indigo-600 rounded-xs" />
        </div>
        <div className="bg-white p-1 rounded border border-slate-200 flex flex-col justify-between">
          <div className="w-full h-8 bg-slate-200 rounded-xs" />
          <div className="w-full h-1.5 bg-slate-800 rounded-xs" />
          <div className="w-6 h-1.5 bg-indigo-600 rounded-xs" />
        </div>
        <div className="bg-white p-1 rounded border border-slate-200 flex flex-col justify-between">
          <div className="w-full h-8 bg-slate-200 rounded-xs" />
          <div className="w-full h-1.5 bg-slate-800 rounded-xs" />
          <div className="w-6 h-1.5 bg-indigo-600 rounded-xs" />
        </div>
      </div>
    );
  }

  if (category === 'categories') {
    return (
      <div className="w-full h-20 bg-slate-100 rounded-lg p-2 grid grid-cols-2 gap-2 border border-slate-200 mb-3 overflow-hidden select-none">
        <div className="bg-slate-800 rounded p-2 flex flex-col justify-end">
          <div className="w-10 h-2 bg-white rounded-xs" />
        </div>
        <div className="bg-slate-700 rounded p-2 flex flex-col justify-end">
          <div className="w-10 h-2 bg-white rounded-xs" />
        </div>
      </div>
    );
  }

  if (category === 'promotions') {
    return (
      <div className="w-full h-16 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-lg p-2.5 flex items-center justify-between border border-indigo-700/50 mb-3 overflow-hidden select-none">
        <div className="space-y-1">
          <div className="w-8 h-1.5 bg-indigo-400 rounded-xs" />
          <div className="w-24 h-2.5 bg-white rounded-xs" />
        </div>
        <div className="w-10 h-4 bg-indigo-500 rounded border border-dashed border-white/50" />
      </div>
    );
  }

  if (category === 'trust') {
    return (
      <div className="w-full h-16 bg-white rounded-lg p-2.5 border border-slate-200 mb-3 flex flex-col justify-between overflow-hidden select-none">
        <div className="flex gap-1 text-amber-400 text-xs">★★★★★</div>
        <div className="w-32 h-2 bg-slate-700 rounded-xs" />
        <div className="w-16 h-1.5 bg-slate-400 rounded-xs" />
      </div>
    );
  }

  // Utility / Footers
  return (
    <div className="w-full h-16 bg-slate-900 rounded-lg p-2.5 border border-slate-800 mb-3 flex flex-col justify-between overflow-hidden select-none">
      <div className="grid grid-cols-3 gap-2">
        <div className="w-full h-2 bg-slate-700 rounded-xs" />
        <div className="w-full h-2 bg-slate-700 rounded-xs" />
        <div className="w-full h-2 bg-slate-700 rounded-xs" />
      </div>
      <div className="w-full h-1.5 bg-slate-800 rounded-xs" />
    </div>
  );
}

export function SectionPicker({ onSelectSection, onClose }: SectionPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SectionCategory | 'all'>('all');

  const entries = Object.values(SECTION_REGISTRY);

  const filteredEntries = entries.filter((entry) => {
    const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;
    const matchesSearch =
      entry.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg tracking-tight font-heading uppercase">
              Add Storefront Component
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search 46 components..."
              className="w-full text-xs pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white font-semibold text-slate-900 shadow-2xs placeholder-slate-400"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'bg-white text-slate-800 hover:bg-slate-950 hover:text-white border border-slate-300 shadow-2xs'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid of Components with Visual Mini Previews */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-50/70">
          {filteredEntries.map((entry) => (
            <div
              key={entry.type}
              onClick={() => {
                onSelectSection(entry);
                onClose();
              }}
              className="group p-4 bg-white border-2 border-slate-200 hover:border-slate-950 rounded-2xl shadow-2xs hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-900 border border-slate-200 tracking-wider">
                    {entry.category}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-slate-950 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>

                {/* Visual Mini Preview Miniature */}
                <MiniComponentPreview category={entry.category} type={entry.type} />

                <h4 className="font-extrabold text-sm text-slate-950 group-hover:text-slate-900 transition-colors uppercase tracking-tight">
                  {entry.label}
                </h4>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-semibold">
                  {entry.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 font-medium">Theme Controlled</span>
                <span className="text-slate-950 group-hover:underline uppercase tracking-wider font-extrabold">
                  + ADD SECTION
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
