'use client';

import React from 'react';
import {
  GENDER_FILTER_OPTIONS,
  FIT_FILTER_OPTIONS,
  SEASON_FILTER_OPTIONS,
  MATERIAL_FILTER_OPTIONS,
  OCCASION_FILTER_OPTIONS,
  AVAILABILITY_FILTER_OPTIONS,
  SORT_FILTER_OPTIONS,
  filterCatalogProducts,
  getProductFilterSummary,
} from '@/lib/cms/product-filter';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { Filter, CheckCircle2, AlertTriangle, RotateCcw, Layers, Sparkles } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  parentId?: string | null;
  slug?: string;
}

interface BrandItem {
  id: string;
  name: string;
}

interface ProductAttributeFilterFormProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  categories?: CategoryItem[];
  brands?: BrandItem[];
  allProducts?: ProductData[];
  className?: string;
}

export function ProductAttributeFilterForm({
  config,
  onChange,
  categories = [],
  brands = [],
  allProducts = [],
  className = '',
}: ProductAttributeFilterFormProps) {
  // Compute real-time product matches
  const matchingProducts = filterCatalogProducts(allProducts, config);
  const activeChips = getProductFilterSummary(config);

  // Group categories into parent categories and subcategories
  const parentCategories = categories.filter((c) => !c.parentId);
  const subCategories = categories.filter((c) => Boolean(c.parentId));

  const handleResetFilters = () => {
    onChange('productSource', 'all');
    onChange('filterCategory', '');
    onChange('filterSubcategory', '');
    onChange('filterGender', '');
    onChange('filterBrand', '');
    onChange('filterFit', '');
    onChange('filterSeason', '');
    onChange('filterMaterial', '');
    onChange('filterOccasion', '');
    onChange('filterAvailability', 'all');
    onChange('attributeName', '');
    onChange('attributeValue', '');
  };

  return (
    <div className={`space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs ${className}`}>
      {/* Header with Live Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Filter className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-tight text-slate-950">
              Product Attribute Filters
            </h4>
            <p className="text-[11px] text-slate-500">
              Target products dynamically by category, audience gender, fit, season, or material.
            </p>
          </div>
        </div>

        {/* Live Match Badge */}
        <div className="flex items-center gap-2">
          {matchingProducts.length > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {matchingProducts.length} Products Match
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              0 Matches (Try broader criteria)
            </span>
          )}

          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-slate-500 hover:text-rose-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 transition cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Quick Filter Source Preset */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
          Source Preset / Collection Bundle
        </label>
        <select
          value={config.productSource || 'all'}
          onChange={(e) => onChange('productSource', e.target.value)}
          className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
        >
          <option value="all">📦 All Catalog Products (Filtered by Attributes Below)</option>
          <option value="offers">🔥 Offer & Discount Deals (Auto-Discounted)</option>
          <option value="festive">✨ Festive & Seasonal Special (Holiday / Diwali / Special)</option>
          <option value="limited">⏳ Limited Edition / Exclusive Run</option>
          <option value="bestsellers">🏆 Top Best Sellers (Rating &gt;= 4.8)</option>
          <option value="new_arrivals">🆕 New Arrivals (Last 7 Days)</option>
        </select>
      </div>

      {/* Grid of Attribute Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Category / Subcategory Dropdown */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Category / Classification
          </label>
          <select
            value={config.filterCategory || ''}
            onChange={(e) => {
              onChange('filterCategory', e.target.value);
              // clear subcategory if category changes
              onChange('filterSubcategory', '');
            }}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            <option value="">All Categories & Taxonomies</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                📁 {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Dropdown (if available) */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Subcategory / Specific Type
          </label>
          <select
            value={config.filterSubcategory || ''}
            onChange={(e) => onChange('filterSubcategory', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            <option value="">All Subcategories</option>
            {subCategories.map((sub) => {
              const parent = categories.find((c) => c.id === sub.parentId);
              return (
                <option key={sub.id} value={sub.name}>
                  ↳ {sub.name} {parent ? `(${parent.name})` : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Audience / Gender Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Audience / Gender
          </label>
          <select
            value={config.filterGender || 'all'}
            onChange={(e) => onChange('filterGender', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {GENDER_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Selector */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Brand / Manufacturer
          </label>
          <select
            value={config.filterBrand || ''}
            onChange={(e) => onChange('filterBrand', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* Fit Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Silhouette / Fit
          </label>
          <select
            value={config.filterFit || 'all'}
            onChange={(e) => onChange('filterFit', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {FIT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Season Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Season / Campaign
          </label>
          <select
            value={config.filterSeason || 'all'}
            onChange={(e) => onChange('filterSeason', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {SEASON_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Material Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Material / Fabric
          </label>
          <select
            value={config.filterMaterial || 'all'}
            onChange={(e) => onChange('filterMaterial', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {MATERIAL_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Occasion Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Occasion / Use Case
          </label>
          <select
            value={config.filterOccasion || 'all'}
            onChange={(e) => onChange('filterOccasion', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {OCCASION_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Stock Availability
          </label>
          <select
            value={config.filterAvailability || 'all'}
            onChange={(e) => onChange('filterAvailability', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {AVAILABILITY_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sorting Filter */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold uppercase tracking-tight text-slate-800">
            Catalog Sort Order
          </label>
          <select
            value={config.sortBy || 'newest'}
            onChange={(e) => onChange('sortBy', e.target.value)}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:border-slate-950 focus:outline-none cursor-pointer"
          >
            {SORT_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matching Products Live Thumbnail Strip */}
      {matchingProducts.length > 0 && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Matching Products Preview (showing {Math.min(matchingProducts.length, 6)} of {matchingProducts.length})
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {matchingProducts.slice(0, 6).map((item: any) => {
              const img = item.images?.[0] || item.imageUrl;
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-1.5 p-1.5 rounded-lg border border-slate-200 bg-slate-50 shrink-0 max-w-[170px]"
                >
                  <div className="w-7 h-7 rounded border border-slate-200 bg-white overflow-hidden shrink-0 flex items-center justify-center">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </div>
                  <div className="truncate text-[10px]">
                    <span className="font-bold text-slate-900 block truncate">{item.name}</span>
                    <span className="font-extrabold text-slate-600">${Number(item.price).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductAttributeFilterForm;

