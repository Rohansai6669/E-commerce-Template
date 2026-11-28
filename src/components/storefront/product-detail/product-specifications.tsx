'use client';

import * as React from 'react';
import Link from 'next/link';
import { Heading, Text } from '@/components/ui/typography';
import { type ProductDetailModel, type SizeChartGrid } from '@/core/product/product.types';
import {
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Globe2,
  Ruler,
  Layers,
  Tag,
} from 'lucide-react';

export interface ProductSpecificationsProps {
  product: ProductDetailModel;
}

function resolveCategoryUrl(categorySlug?: string | null, gender?: string | null): string {
  if (categorySlug) {
    if (gender && (gender.toLowerCase() === 'men' || gender.toLowerCase() === 'women')) {
      return `/${gender.toLowerCase()}/${categorySlug.toLowerCase().trim()}`;
    }
    return `/products?category=${encodeURIComponent(categorySlug.toLowerCase().trim())}`;
  }
  return '/products';
}

function resolveBrandUrl(brandSlug?: string | null, brandName?: string | null): string {
  const target = brandSlug || brandName;
  if (!target) return '/products';
  return `/products?brand=${encodeURIComponent(target.toLowerCase().trim())}`;
}

/**
 * Editorial Overview and Clean Technical Specifications Layout.
 * Streamlined for luxury customer UX — no noisy compliance boilerplate or raw inventory dumps.
 */
export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const categoryUrl = resolveCategoryUrl(product.categorySlug, product.gender);
  const brandUrl = resolveBrandUrl(product.brandSlug, product.brandName);
  const genderUrl = product.gender ? `/${product.gender.toLowerCase()}` : '/products';

  // Options specifications (e.g. Size, Color)
  const optionSpecs = (product.options || []).map((opt) => ({
    label: opt.name,
    value: opt.values.map((v) => v.value).join(', '),
  }));

  // Clean customer-facing apparel specifications
  const technicalSpecs: Array<{
    label: string;
    value: React.ReactNode;
    href?: string;
  }> = [];

  if (product.material) {
    technicalSpecs.push({
      label: 'Material / Fabric',
      value: product.material,
    });
  }

  if (product.fit) {
    technicalSpecs.push({
      label: 'Fit & Silhouette',
      value: product.fit,
    });
  }

  if (product.pattern) {
    technicalSpecs.push({
      label: 'Pattern / Style',
      value: product.pattern,
    });
  }

  if (product.occasion) {
    technicalSpecs.push({
      label: 'Occasion',
      value: product.occasion,
    });
  }

  if (product.gender) {
    technicalSpecs.push({
      label: 'Department',
      value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1).toLowerCase(),
      href: genderUrl,
    });
  }

  if (product.categoryName) {
    technicalSpecs.push({
      label: 'Category',
      value: product.categoryName,
      href: categoryUrl,
    });
  }

  if (product.brandName) {
    technicalSpecs.push({
      label: 'Brand',
      value: product.brandName,
      href: brandUrl,
    });
  }

  if (product.season) {
    technicalSpecs.push({
      label: 'Season',
      value: product.season,
    });
  }

  if (product.collection) {
    technicalSpecs.push({
      label: 'Collection',
      value: product.collection,
    });
  }

  // Include option specs (e.g. Available Sizes, Colors)
  optionSpecs.forEach((opt) => {
    technicalSpecs.push({
      label: `Available ${opt.label}`,
      value: opt.value,
    });
  });

  if (product.careInstructions) {
    technicalSpecs.push({
      label: 'Care Guide',
      value: product.careInstructions,
    });
  }

  technicalSpecs.push({
    label: 'Country of Origin',
    value: product.countryOfOrigin || 'India',
  });

  // Dynamic craftsmanship bullet highlights (customer-relevant, clean)
  const dynamicHighlights = [
    {
      title: 'Fabric Composition',
      desc: product.material || 'Premium high-density breathable cotton textile weave',
    },
    {
      title: 'Silhouette & Cut',
      desc: product.fit
        ? `${product.fit} tailored profile for effortless daily draping`
        : 'Contemporary silhouette engineered for balanced movement and lasting shape',
    },
    {
      title: 'Finish & Surface',
      desc: product.pattern
        ? `${product.pattern} surface texture finished with colorfast treatment`
        : 'Pure refined weave with smooth skin-feel and enduring wash resilience',
    },
    {
      title: 'Care & Longevity',
      desc: product.careInstructions || 'Easy-care wash cycle; engineered to retain silhouette through regular wear',
    },
  ];

  return (
    <div className="w-full space-y-8 select-none">
      {/* 2-Column Responsive Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Editorial Overview & Dynamic Craftsmanship Highlights */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-none border border-border bg-card shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-none bg-primary/10 text-primary font-mono">
                Product Story
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Product Overview & Details
            </Heading>

            <Text className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
              {product.description ||
                `${product.name} by ${product.brandName || 'Lexido'}. Crafted with signature atelier precision, engineered from breathable fabrics to ensure long-lasting comfort, modern drape, and durability.`}
            </Text>

            {/* Bulleted Craftsmanship Highlights */}
            <div className="pt-4 border-t border-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3.5 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Key Highlights
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {dynamicHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-foreground font-semibold">{hl.title}:</strong> {hl.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subtle Brand & Authenticity Guarantee */}
            <div className="pt-3 border-t border-border/60 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-none bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                100% Authentic Brand Guaranteed
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-none bg-muted text-foreground border border-border">
                <Globe2 className="w-3.5 h-3.5 text-primary" />
                Crafted in {product.countryOfOrigin || 'India'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Clean Specifications Table */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-none border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-none bg-muted text-muted-foreground font-mono">
                Specifications
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Product Specifications
            </Heading>

            {/* Clean Specifications Table */}
            <div className="border border-border rounded-none overflow-hidden divide-y divide-border bg-background/50">
              {technicalSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between px-3.5 py-2.5 text-xs hover:bg-muted/20 transition-colors gap-3"
                >
                  <span className="font-semibold text-muted-foreground select-none shrink-0 w-2/5 font-mono text-[11px]">
                    {spec.label}
                  </span>
                  <div className="text-right max-w-[60%] font-medium text-foreground break-words">
                    {spec.href ? (
                      <Link
                        href={spec.href}
                        className="text-primary hover:underline font-bold inline-flex items-center gap-1 justify-end cursor-pointer"
                      >
                        <span>{spec.value}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60 shrink-0" />
                      </Link>
                    ) : (
                      spec.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Section (Full width if present) */}
      {product.sizeChart && product.sizeChart.columns && product.sizeChart.columns.length > 0 && (
        <div className="p-6 rounded-none border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <Heading level={2} className="text-base font-bold tracking-tight font-heading">
                {product.sizeChart.title || 'Size & Fit Measurement Guide'}
              </Heading>
            </div>
            {product.sizeChart.unit && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-none bg-muted text-muted-foreground uppercase font-mono">
                Unit: {product.sizeChart.unit}
              </span>
            )}
          </div>

          <div className="border border-border rounded-none overflow-x-auto bg-card">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {product.sizeChart.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase text-[11px] tracking-wider font-mono"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {product.sizeChart.rows?.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className="border-b border-border last:border-0 hover:bg-muted/15 transition-colors"
                  >
                    {product.sizeChart?.columns.map((col, cIdx) => (
                      <td
                        key={cIdx}
                        className="px-4 py-2.5 text-foreground font-medium whitespace-nowrap"
                      >
                        {row[col] || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSpecifications;
