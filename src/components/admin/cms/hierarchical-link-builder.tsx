'use client';

import * as React from 'react';
import { Route, Check, Sparkles, Layers, ArrowRight, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface RouteOption {
  href: string;
  label: string;
  hasMega?: boolean;
}

interface HierarchicalLinkBuilderProps {
  currentHref: string;
  currentLabel: string;
  onApply: (option: RouteOption) => void;
  onClose?: () => void;
}

const ATTRIBUTES = [
  { id: '', label: 'None / Department Wide' },
  { id: 'men', label: 'Men (/men)' },
  { id: 'women', label: 'Women (/women)' },
  { id: 'kids', label: 'Kids (/kids)' },
  { id: 'unisex', label: 'Unisex (/unisex)' },
  { id: 'sale', label: 'Sale (/sale)' },
  { id: 'limited', label: 'Limited Editions (/limited)' },
  { id: 'trending', label: 'Trending Drops (/trending)' },
];

const CATEGORIES_TREE: Record<
  string,
  {
    label: string;
    subcategories: Array<{ id: string; label: string; sampleProduct?: string }>;
  }
> = {
  streetwear: {
    label: 'Streetwear',
    subcategories: [
      { id: 'oversized-t-shirts', label: 'Oversized T-Shirts', sampleProduct: 'heavyweight-oversized-tee' },
      { id: 'graphic-t-shirts', label: 'Graphic T-Shirts' },
      { id: 'oversized-hoodies', label: 'Oversized Hoodies' },
      { id: 'zip-hoodies', label: 'Zip Hoodies' },
      { id: 'baggy-jeans', label: 'Baggy Jeans' },
      { id: 'cargo-pants', label: 'Cargo Pants' },
      { id: 'utility-pants', label: 'Utility Pants' },
      { id: 'denim-jackets', label: 'Denim Jackets' },
      { id: 'varsity-jackets', label: 'Varsity Jackets' },
      { id: 'bomber-jackets', label: 'Bomber Jackets' },
      { id: 'shorts', label: 'Shorts' },
    ],
  },
  gymwear: {
    label: 'Gym Wear',
    subcategories: [
      { id: 'signature-gym-set', label: 'Signature Gym Set', sampleProduct: 'signature-gym-set' },
      { id: 'training-joggers', label: 'Surge Training Joggers' },
      { id: 'stringer-tanks', label: 'Iron Stringer Tanks' },
      { id: 'dry-fit-tees', label: 'Apex Dry-Fit Tees' },
      { id: 'fleece-shorts', label: 'Heavyweight Fleece Shorts' },
      { id: 'compression-tops', label: 'Velocity Compression Tops' },
    ],
  },
  'old-money': {
    label: 'Old Money',
    subcategories: [
      { id: 'oxford-shirts', label: 'Oxford Cotton Shirts' },
      { id: 'cashmere-crewnecks', label: 'Cashmere Crewnecks' },
      { id: 'cable-knit-sweaters', label: 'Cable Knit Sweaters' },
      { id: 'linen-trousers', label: 'French Linen Trousers' },
      { id: 'blazers', label: 'Double-Breasted Blazers' },
      { id: 'loafers', label: 'Italian Suede Loafers' },
    ],
  },
  casual: {
    label: 'Casual',
    subcategories: [
      { id: 'crewneck-tees', label: 'Everyday Crewneck Tees' },
      { id: 'polo-shirts', label: 'Pique Polo Shirts' },
      { id: 'denim-overshirts', label: 'Washed Denim Overshirts' },
      { id: 'chinos', label: 'Relaxed Fit Chinos' },
      { id: 'sneakers', label: 'Minimalist Canvas Sneakers' },
    ],
  },
  formal: {
    label: 'Formal',
    subcategories: [
      { id: 'suits', label: 'Structured Two-Piece Suits' },
      { id: 'dress-shirts', label: 'French Cuff Dress Shirts' },
      { id: 'tuxedo-jackets', label: 'Sartorial Tuxedo Jackets' },
      { id: 'dress-trousers', label: 'Pure Wool Dress Trousers' },
      { id: 'oxford-shoes', label: 'Handcrafted Oxford Shoes' },
    ],
  },
  winter: {
    label: 'Winter Collection',
    subcategories: [
      { id: 'puffer-jackets', label: 'Heavy Down Puffer Jackets' },
      { id: 'wool-overcoats', label: 'Cashmere Wool Overcoats' },
      { id: 'thermal-layers', label: 'Thermal Merino Base Layers' },
      { id: 'corduroy-jackets', label: 'Sherpa-Lined Corduroy Jackets' },
    ],
  },
  accessories: {
    label: "Men's Accessories",
    subcategories: [
      { id: 'duffle-bags', label: 'Full-Grain Leather Duffle Bags' },
      { id: 'watches', label: 'Minimalist Automatic Watches' },
      { id: 'silver-chains', label: '925 Sterling Silver Chains' },
      { id: 'sunglasses', label: 'Polarized Aviator Sunglasses' },
      { id: 'belts', label: 'Full Grain Italian Belts' },
    ],
  },
};

const STOREFRONT_PRESETS = [
  { label: 'Shop All Products', href: '/products', hasMega: false },
  { label: 'Curated Collections', href: '/collections', hasMega: true },
  { label: 'Shopping Cart', href: '/cart', hasMega: false },
  { label: 'Checkout', href: '/checkout', hasMega: false },
  { label: 'User Account', href: '/account', hasMega: false },
  { label: 'Brand Story / About', href: '/about', hasMega: false },
];

/**
 * Hierarchical Route & Link Generator with clean dropdowns.
 * Generates [attribute] / [category] / [subcategory] / [product] routes
 * seamlessly for the navigation builder without requiring manual URL typing.
 */
export function HierarchicalLinkBuilder({
  currentHref,
  currentLabel,
  onApply,
  onClose,
}: HierarchicalLinkBuilderProps) {
  const [selectedAttribute, setSelectedAttribute] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const [selectedSubcategory, setSelectedSubcategory] = React.useState('');
  const [selectedProduct, setSelectedProduct] = React.useState('');

  // Available subcategories for current category
  const activeSubcats = selectedCategory ? CATEGORIES_TREE[selectedCategory]?.subcategories || [] : [];

  // Reset dependent dropdowns when parent changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('');
    setSelectedProduct('');
  };

  const handleSubcategoryChange = (sub: string) => {
    setSelectedSubcategory(sub);
    setSelectedProduct('');
  };

  // Compute live generated route
  const generatedHref = React.useMemo(() => {
    const parts: string[] = [];
    if (selectedAttribute) parts.push(selectedAttribute);
    if (selectedCategory) parts.push(selectedCategory);
    if (selectedSubcategory) parts.push(selectedSubcategory);
    if (selectedProduct) parts.push(selectedProduct);

    if (parts.length === 0) return '/products';
    return `/${parts.join('/')}`;
  }, [selectedAttribute, selectedCategory, selectedSubcategory, selectedProduct]);

  // Compute recommended label
  const recommendedLabel = React.useMemo(() => {
    if (selectedProduct) {
      return selectedProduct.replace(/-/g, ' ').toUpperCase();
    }
    if (selectedSubcategory) {
      const match = activeSubcats.find((s) => s.id === selectedSubcategory);
      return match ? match.label.toUpperCase() : selectedSubcategory.replace(/-/g, ' ').toUpperCase();
    }
    if (selectedCategory) {
      return (CATEGORIES_TREE[selectedCategory]?.label || selectedCategory).toUpperCase();
    }
    if (selectedAttribute) {
      return selectedAttribute.toUpperCase();
    }
    return currentLabel || 'SHOP ALL';
  }, [selectedAttribute, selectedCategory, selectedSubcategory, selectedProduct, activeSubcats, currentLabel]);

  const handleApplyGenerated = () => {
    onApply({
      href: generatedHref,
      label: currentLabel.trim() ? currentLabel : recommendedLabel,
      hasMega: !selectedSubcategory && !selectedProduct,
    });
    if (onClose) onClose();
  };

  const handleApplyPreset = (preset: typeof STOREFRONT_PRESETS[0]) => {
    onApply({
      href: preset.href,
      label: currentLabel.trim() ? currentLabel : preset.label.toUpperCase(),
      hasMega: preset.hasMega,
    });
    if (onClose) onClose();
  };

  return (
    <div className="bg-slate-50 border border-indigo-200 rounded-xl p-4 space-y-4 shadow-sm animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
        <div className="flex items-center gap-1.5 text-indigo-950 font-black text-xs uppercase tracking-wide">
          <Compass className="w-4 h-4 text-indigo-600" />
          <span>Faceted Route Link Builder</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
          [attr]/[cat]/[sub]/[prod]
        </span>
      </div>

      {/* 4 Cascading Dropdowns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Dropdown 1: Attribute / Audience */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
            1. Attribute / Audience
          </label>
          <select
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-indigo-600 outline-none"
          >
            {ATTRIBUTES.map((attr) => (
              <option key={attr.id} value={attr.id}>
                {attr.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Category */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
            2. Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 focus:border-indigo-600 outline-none"
          >
            <option value="">All Categories / Department Landing</option>
            {Object.entries(CATEGORIES_TREE).map(([id, cat]) => (
              <option key={id} value={id}>
                📁 {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Subcategory (Depends on Category) */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
            3. Subcategory
          </label>
          <select
            value={selectedSubcategory}
            onChange={(e) => handleSubcategoryChange(e.target.value)}
            disabled={!selectedCategory || activeSubcats.length === 0}
            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-40 focus:border-indigo-600 outline-none"
          >
            <option value="">
              {!selectedCategory ? '(Pick category first)' : 'All Subcategories in Category'}
            </option>
            {activeSubcats.map((sub) => (
              <option key={sub.id} value={sub.id}>
                ↳ {sub.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 4: Product (Optional) */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-700 mb-1">
            4. Specific Product (Optional)
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            disabled={!selectedSubcategory}
            className="w-full text-xs font-semibold px-2.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 disabled:opacity-40 focus:border-indigo-600 outline-none"
          >
            <option value="">Category / Subcategory Landing Page</option>
            {activeSubcats
              .filter((s) => s.id === selectedSubcategory && s.sampleProduct)
              .map((s) => (
                <option key={s.sampleProduct} value={s.sampleProduct}>
                  🏷️ {s.label} Featured Item
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Live Route Result Box */}
      <div className="bg-white rounded-lg p-3 border border-indigo-200/80 flex flex-col gap-1.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Generated URL Destination:</span>
          <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            Preview Link
          </span>
        </div>
        <p className="font-mono text-xs font-bold text-slate-950 break-all select-all">
          {generatedHref}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <Button
          type="button"
          onClick={handleApplyGenerated}
          className="flex-1 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs h-9 uppercase tracking-wider cursor-pointer"
        >
          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          Apply Route to Link
        </Button>
        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs h-9 px-3 cursor-pointer"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* Standard Preset Shortcuts */}
      <div className="pt-2 border-t border-slate-200/80">
        <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">
          Or Quick Select Standard Storefront Page:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {STOREFRONT_PRESETS.map((p) => (
            <button
              key={p.href}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-[10px] font-bold px-2 py-1 rounded bg-white hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

