'use client';

import React from 'react';
import { ProductGridConfig } from '@/types/cms';
import { ConfigurableProductCard, ProductData } from '@/components/commerce/configurable-product-card';
import { SectionHeading } from '../primitives/heading';
import { SectionShell } from '../primitives/section-shell';

// Fallback sample products for CMS grid when database is unpopulated or in preview mode
const defaultProducts: ProductData[] = [
  {
    id: 'prod-1',
    name: 'Minimalist Wool Blazer',
    slug: 'minimalist-wool-blazer',
    price: 2499.00,
    compareAtPrice: 3299.00,
    category: 'Outerwear',
    rating: 4.9,
    reviewCount: 28,
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=600&auto=format&fit=crop'],
    badges: ['BESTSELLER', 'NEW'],
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Organic Cotton Oxford Shirt',
    slug: 'organic-cotton-oxford-shirt',
    price: 1499.00,
    compareAtPrice: 1999.00,
    category: 'Shirts',
    rating: 4.8,
    reviewCount: 42,
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?q=80&w=600&auto=format&fit=crop'],
    badges: ['SUSTAINABLE'],
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Structured Leather Tote Bag',
    slug: 'structured-leather-tote-bag',
    price: 2999.00,
    compareAtPrice: 3499.00,
    category: 'Accessories',
    rating: 4.9,
    reviewCount: 19,
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=600&auto=format&fit=crop'],
    badges: ['EXCLUSIVE'],
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Relaxed Fit Linen Trouser',
    slug: 'relaxed-fit-linen-trouser',
    price: 1899.00,
    category: 'Pants',
    rating: 4.7,
    reviewCount: 15,
    images: ['https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=600&auto=format&fit=crop'],
    inStock: true,
  },
];

interface CmsProductGridProps {
  config: ProductGridConfig;
  /** Products fetched from the database — passed in by the parent page/layout. */
  products?: ProductData[];
}

export function CmsProductGrid({ config, products }: CmsProductGridProps) {
  if (!config.enabled) return null;

  const gridColsClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }[config.columnsDesktop || 4];

  const gapClass = {
    small: 'gap-4',
    medium: 'gap-6',
    large: 'gap-8',
  }[config.gapDesktop || 'medium'];

  const sourceProducts = (products && products.length > 0) ? products : defaultProducts;

  // Apply pre-configured section filter bundle or attribute-based filters
  let filtered = [...sourceProducts];

  if (config.attributeName) {
    const targetAttrName = config.attributeName.toLowerCase();
    const targetAttrVal = config.attributeValue ? config.attributeValue.toLowerCase() : null;

    filtered = sourceProducts.filter((p: any) => {
      const hasAttr = p.attributes?.some((a: any) => {
        const nameMatches = a.name?.toLowerCase() === targetAttrName;
        const valMatches = !targetAttrVal || a.value?.toLowerCase().includes(targetAttrVal);
        return nameMatches && valMatches;
      });

      const hasOption = p.options?.some((opt: any) => {
        const nameMatches = opt.name?.toLowerCase() === targetAttrName;
        const valMatches =
          !targetAttrVal ||
          opt.values?.some((v: any) => (v.value || v).toLowerCase().includes(targetAttrVal));
        return nameMatches && valMatches;
      });

      return hasAttr || hasOption;
    });
  } else if (config.productSource === 'offers') {
    filtered = sourceProducts.filter(
      (p: any) =>
        (p.compareAtPrice && p.compareAtPrice > p.price) ||
        p.badges?.some((b: string) => b.includes('OFF') || b.includes('SALE')) ||
        p.attributes?.some(
          (a: any) =>
            a.name?.toLowerCase().includes('offer') || a.value?.toLowerCase().includes('offer')
        )
    );
  } else if (config.productSource === 'festive') {
    filtered = sourceProducts.filter((p: any) => {
      const hasFestiveBadge = p.badges?.some(
        (b: string) =>
          b.includes('FESTIVE') ||
          b.includes('SPECIAL') ||
          b.includes('DUSSEHRA') ||
          b.includes('DIWALI')
      );
      const hasFestiveAttr = p.attributes?.some(
        (a: any) =>
          a.name?.toLowerCase().includes('festival') ||
          a.value?.toLowerCase().includes('diwali') ||
          a.value?.toLowerCase().includes('festive') ||
          a.value?.toLowerCase().includes('christmas') ||
          a.value?.toLowerCase().includes('eid')
      );
      return hasFestiveBadge || hasFestiveAttr;
    });
  } else if (config.productSource === 'limited') {
    filtered = sourceProducts.filter((p: any) => {
      const hasLimitedBadge = p.badges?.some(
        (b: string) => b.includes('LIMITED') || b.includes('EXCLUSIVE')
      );
      const hasLimitedAttr = p.attributes?.some(
        (a: any) =>
          a.name?.toLowerCase().includes('edition') ||
          a.value?.toLowerCase().includes('limited') ||
          a.value?.toLowerCase().includes('exclusive') ||
          a.value?.toLowerCase().includes('collector')
      );
      return hasLimitedBadge || hasLimitedAttr;
    });
  } else if (config.productSource === 'bestsellers') {
    filtered = sourceProducts.filter(
      (p) => p.badges?.some((b: string) => b.includes('BESTSELLER')) || (p.rating && p.rating >= 4.8)
    );
  } else if (config.productSource === 'new_arrivals') {
    filtered = sourceProducts.filter((p) => p.isNew || p.badges?.includes('NEW'));
  }

  const effectiveProducts = filtered.length > 0 ? filtered : sourceProducts;
  const displayProducts = effectiveProducts.slice(0, config.maxProducts || 4);

  const sectionStyle: React.CSSProperties = {};
  if (config.backgroundColor) {
    sectionStyle.backgroundColor = config.backgroundColor;
  }
  if (config.backgroundImageUrl) {
    sectionStyle.backgroundImage = `url('${config.backgroundImageUrl}')`;
    sectionStyle.backgroundSize = 'cover';
    sectionStyle.backgroundPosition = 'center';
  }

  return (
    <SectionShell config={config} className="py-8 sm:py-12">
      <div className="space-y-8">
        {/* Heading */}
        {(config.heading || config.eyebrow) && (
          <SectionHeading
            eyebrow={config.eyebrow}
            heading={config.heading}
            alignment={config.headingAlignment || config.contentAlignment || 'center'}
          />
        )}

        {/* Grid */}
        <div className={`grid ${gridColsClass} ${gapClass}`}>
          {displayProducts.map((product, idx) => (
            <div
              key={product.id}
              className={`transition-all duration-300 ${
                config.animationHoverEffect === 'lift'
                  ? 'hover-lift'
                  : config.animationHoverEffect === 'glow'
                  ? 'hover-glow'
                  : ''
              } ${
                config.animationPreset && config.animationPreset !== 'NONE'
                  ? 'animate-fade-up'
                  : ''
              }`}
              style={
                config.animationPreset && config.animationPreset !== 'NONE'
                  ? {
                      animationDelay: `${Math.min(idx * 80 + 100, 800)}ms`,
                      animationFillMode: 'both',
                    }
                  : undefined
              }
            >
              <ConfigurableProductCard
                product={product}
                config={config.cardConfig}
              />
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
