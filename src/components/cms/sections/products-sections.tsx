'use client';

import React, { useState } from 'react';
import { BaseSectionConfig, ProductGridConfig } from '@/types/cms';
import { SectionShell } from '../primitives/section-shell';
import { SectionHeading } from '../primitives/heading';
import { ThemeButton } from '../primitives/button';
import { ConfigurableProductCard, ProductData } from '@/components/commerce/configurable-product-card';
import { filterCatalogProducts } from '@/lib/cms/product-filter';
import { Star, Check, ShoppingBag, ShieldCheck, Zap, PackageSearch } from 'lucide-react';

const mockProducts: ProductData[] = [
  {
    id: 'prod-1',
    name: 'Italian Wool Cashmere Overcoat',
    slug: 'italian-wool-cashmere-overcoat',
    price: 349.00,
    compareAtPrice: 420.00,
    category: 'Outerwear',
    rating: 4.9,
    reviewCount: 48,
    images: ['https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop'],
    badges: ['BESTSELLER', '20% OFF'],
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Minimalist Organic Cotton Blazer',
    slug: 'minimalist-organic-cotton-blazer',
    price: 229.00,
    category: 'Tailoring',
    rating: 4.8,
    reviewCount: 32,
    images: ['https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop'],
    badges: ['NEW'],
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Structured Leather Crossbody Tote',
    slug: 'structured-leather-crossbody-tote',
    price: 189.00,
    compareAtPrice: 240.00,
    category: 'Accessories',
    rating: 5.0,
    reviewCount: 94,
    images: ['https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=800&auto=format&fit=crop'],
    badges: ['LIMITED'],
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Silk Blend Tailored Trouser',
    slug: 'silk-blend-tailored-trouser',
    price: 159.00,
    category: 'Bottoms',
    rating: 4.7,
    reviewCount: 21,
    images: ['https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=800&auto=format&fit=crop'],
    badges: [],
    inStock: true,
  },
];

export function ProductGridSection({
  config,
  products = mockProducts,
}: {
  config: ProductGridConfig & any;
  products?: ProductData[];
}) {
  const baseProducts = products.length > 0 ? products : mockProducts;
  const filtered = filterCatalogProducts(baseProducts, config);
  const displayProducts = filtered.length > 0 ? filtered : (products.length === 0 ? mockProducts : []);
  const cols = Number(config.columnsDesktop) || 4;

  const colClasses: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  };

  return (
    <SectionShell config={config}>
      <SectionHeading
        eyebrow={config.eyebrow}
        heading={config.heading}
        description={config.description}
        alignment={config.headingAlignment}
      />
      {displayProducts.length > 0 ? (
        <div className={`grid ${colClasses[cols] || colClasses[4]} gap-6`}>
          {displayProducts.slice(0, config.maxProducts || 8).map((product) => (
            <ConfigurableProductCard
              key={product.id}
              product={product}
              config={config.cardConfig}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 px-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 max-w-lg mx-auto">
          <PackageSearch className="w-9 h-9 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
            No Products Match Configured Filters
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Adjust category, gender, fit, or season filters in the Visual Builder to display matching products.
          </p>
        </div>
      )}
    </SectionShell>
  );
}

export function ProductCarouselSection({
  config,
  products = mockProducts,
}: {
  config: BaseSectionConfig & any;
  products?: ProductData[];
}) {
  const baseProducts = products.length > 0 ? products : mockProducts;
  const filtered = filterCatalogProducts(baseProducts, config);
  const displayProducts = filtered.length > 0 ? filtered : (products.length === 0 ? mockProducts : []);

  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow={config.eyebrow} heading={config.heading} description={config.description} />
      {displayProducts.length > 0 ? (
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-thin snap-x">
          {displayProducts.slice(0, config.maxProducts || 12).map((product) => (
            <div key={product.id} className="min-w-[260px] sm:min-w-[300px] snap-start">
              <ConfigurableProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-10 px-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 max-w-lg mx-auto">
          <PackageSearch className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h4 className="text-sm font-extrabold uppercase tracking-tight text-slate-900">
            No Products Match Carousel Filter
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Broaden the attribute filters in the Visual Builder to display products in this carousel.
          </p>
        </div>
      )}
    </SectionShell>
  );
}

export function FeaturedProductSpotlightSection({ config }: { config: BaseSectionConfig & any }) {
  const [selectedSize, setSelectedSize] = useState('M');

  return (
    <SectionShell config={config}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="rounded-[var(--radius-xl,16px)] overflow-hidden shadow-xl aspect-square">
          <img
            src={config.imageUrl || 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=1000&auto=format&fit=crop'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col items-start">
          <span className="bg-[var(--accent,#6366f1)] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3">
            {config.badgeText || 'PRODUCT SPOTLIGHT'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--foreground,#0f172a)] font-heading mb-3">
            {config.productTitle || 'Italian Wool Cashmere Overcoat'}
          </h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-sm font-semibold text-[var(--muted-foreground,#64748b)]">4.9 (48 reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-[var(--primary,#0f172a)]">$349.00</span>
            <span className="text-lg text-[var(--muted-foreground,#64748b)] line-through">$420.00</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground,#64748b)] mb-6 leading-relaxed">
            {config.description || 'Crafted with premium Italian cashmere wool blend. Built for warmth, breathability, and timeless elegance.'}
          </p>

          <div className="mb-6 w-full">
            <label className="text-xs font-bold uppercase text-[var(--foreground,#0f172a)] mb-2 block">Select Size</label>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL'].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 rounded-lg border font-bold text-sm transition-all ${
                    selectedSize === size
                      ? 'border-[var(--primary,#0f172a)] bg-[var(--primary,#0f172a)] text-white'
                      : 'border-[var(--border,#e2e8f0)] text-[var(--foreground,#0f172a)] hover:bg-[var(--surface,#f8fafc)]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <ThemeButton size="lg" variant="primary" className="w-full sm:w-auto">
            <ShoppingBag className="w-5 h-5 mr-2" /> ADD TO BAG — $349.00
          </ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function FlashSaleGridSection({
  config,
  products = mockProducts,
}: {
  config: BaseSectionConfig & any;
  products?: ProductData[];
}) {
  const baseProducts = products.length > 0 ? products : mockProducts;
  const filtered = filterCatalogProducts(baseProducts, {
    ...config,
    productSource: config.productSource || 'offers',
  });
  const displayProducts = filtered.length > 0 ? filtered : baseProducts;

  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)]">
      <SectionHeading
        eyebrow={config.eyebrow || 'LIMITED INVENTORY'}
        heading={config.heading || 'FLASH SALE DEALS'}
        description={config.description}
        alignment="center"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayProducts.slice(0, 3).map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-[var(--radius-lg,12px)] border border-[var(--border,#e2e8f0)] shadow-sm">
            <img src={item.images?.[0] || item.imageUrl} alt="" className="w-full h-48 object-cover rounded-md mb-4" />
            <span className="text-xs font-bold text-[var(--accent,#6366f1)] uppercase">{item.category || item.categoryName}</span>
            <h3 className="font-bold text-base text-[var(--foreground,#0f172a)] mt-1 truncate">{item.name}</h3>
            <div className="flex items-baseline gap-2 my-2">
              <span className="font-extrabold text-lg">${Number(item.price).toFixed(2)}</span>
              {item.compareAtPrice && <span className="text-sm text-slate-400 line-through">${Number(item.compareAtPrice).toFixed(2)}</span>}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mb-2 overflow-hidden">
              <div className="bg-[var(--accent,#6366f1)] h-full w-3/4 rounded-full" />
            </div>
            <span className="text-xs text-[var(--muted-foreground,#64748b)]">In stock & ready to ship</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function BestsellersShowcaseSection({
  config,
  products = mockProducts,
}: {
  config: BaseSectionConfig & any;
  products?: ProductData[];
}) {
  const baseProducts = products.length > 0 ? products : mockProducts;
  const filtered = filterCatalogProducts(baseProducts, {
    ...config,
    productSource: config.productSource || 'bestsellers',
  });
  const displayProducts = filtered.length > 0 ? filtered : baseProducts;

  return (
    <SectionShell config={config}>
      <SectionHeading
        eyebrow={config.eyebrow || 'RANKED TOP 5'}
        heading={config.heading || 'MOST POPULAR THIS MONTH'}
        description={config.description}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayProducts.slice(0, 4).map((p, idx) => (
          <div key={p.id} className="relative">
            <div className="absolute top-2 left-2 z-10 w-9 h-9 rounded-full bg-[var(--primary,#0f172a)] text-white font-extrabold text-sm flex items-center justify-center shadow-lg">
              #{idx + 1}
            </div>
            <ConfigurableProductCard product={p} />
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function ProductSpecificationSheetSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config}>
      <SectionHeading eyebrow="CRAFT & MATERIALS" heading="PRODUCT SPECIFICATIONS" />
      <div className="max-w-4xl mx-auto border border-[var(--border,#e2e8f0)] rounded-[var(--radius-lg,12px)] overflow-hidden divide-y divide-[var(--border,#e2e8f0)]">
        {[
          { spec: 'Outer Shell', detail: '90% Virgin Organic Wool, 10% Italian Cashmere' },
          { spec: 'Lining', detail: '100% Cupro Sustainable Bemberg Silk' },
          { spec: 'Tailoring Atelier', detail: 'Florence, Italy' },
          { spec: 'Care Instructions', detail: 'Dry Clean Only. Storage garment bag included.' },
          { spec: 'Warranty', detail: 'Lifetime Repair Guarantee' },
        ].map((row, i) => (
          <div key={i} className="grid grid-cols-3 p-4 text-sm">
            <span className="font-bold text-[var(--foreground,#0f172a)]">{row.spec}</span>
            <span className="col-span-2 text-[var(--muted-foreground,#64748b)]">{row.detail}</span>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function BundleSaveShowcaseSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <SectionShell config={config} className="bg-[var(--surface,#f8fafc)]">
      <SectionHeading eyebrow="BUNDLE & SAVE 25%" heading="FREQUENTLY BOUGHT TOGETHER" />
      <div className="max-w-4xl mx-auto bg-white p-6 sm:p-8 rounded-[var(--radius-xl,16px)] border border-[var(--border,#e2e8f0)] shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img src={mockProducts[0].images[0]} alt="" className="w-20 h-24 object-cover rounded-md" />
            <span className="font-bold text-xl text-slate-400">+</span>
            <img src={mockProducts[2].images[0]} alt="" className="w-20 h-24 object-cover rounded-md" />
          </div>
          <div className="text-center sm:text-left">
            <h4 className="font-bold text-lg text-[var(--foreground,#0f172a)]">Overcoat + Leather Tote Bundle</h4>
            <p className="text-sm text-[var(--muted-foreground,#64748b)]">Get 25% off when bought together.</p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-extrabold text-[var(--primary,#0f172a)]">$399.00</span>
              <span className="text-base text-slate-400 line-through">$538.00</span>
            </div>
          </div>
          <ThemeButton variant="accent" size="lg">
            ADD BUNDLE TO BAG
          </ThemeButton>
        </div>
      </div>
    </SectionShell>
  );
}

export function StickyAddToCartBarSection({ config }: { config: BaseSectionConfig & any }) {
  return (
    <div className="w-full bg-[var(--background,#ffffff)] border-t border-[var(--border,#e2e8f0)] p-4 shadow-xl fixed bottom-0 left-0 z-30 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src={mockProducts[0].images[0]} alt="" className="w-10 h-10 object-cover rounded" />
        <div>
          <span className="font-bold text-sm text-[var(--foreground,#0f172a)] block truncate">{mockProducts[0].name}</span>
          <span className="text-xs text-[var(--muted-foreground,#64748b)] font-semibold">$349.00</span>
        </div>
      </div>
      <ThemeButton size="sm" variant="primary">
        QUICK PURCHASE
      </ThemeButton>
    </div>
  );
}
