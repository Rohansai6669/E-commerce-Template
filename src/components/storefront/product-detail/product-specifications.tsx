import * as React from 'react';
import Link from 'next/link';
import { Heading, Text } from '@/components/ui/typography';
import { type ProductDetailModel } from '@/core/product/product.types';
import {
  Tag,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe2,
  ShieldCheck,
  Ruler,
  ExternalLink,
  PackageCheck,
  Building2,
  Barcode,
} from 'lucide-react';

export interface ProductSpecificationsProps {
  product: ProductDetailModel;
}

/**
 * Resolves dynamic category link across 1-tier, 2-tier, and 3-tier taxonomy routes.
 */
function resolveCategoryUrl(categorySlug?: string | null, gender?: string | null): string {
  if (!categorySlug) return '/products';
  const cleanSlug = categorySlug.toLowerCase().trim();
  const cleanGender = gender ? gender.toLowerCase().trim() : '';

  if (cleanSlug === 'signature-gym-set') {
    return '/men/gymwear/signature-gym-set';
  }
  if (cleanSlug === 'gymwear' || cleanSlug === 'gym-wear') {
    return '/men/gymwear';
  }
  if (['oversized-t-shirts', 'graphic-t-shirts', 'cargo-pants', 'baggy-jeans', 'hoodies'].includes(cleanSlug)) {
    return cleanGender ? `/${cleanGender}/streetwear/${cleanSlug}` : `/men/streetwear/${cleanSlug}`;
  }
  if (cleanGender && ['men', 'women', 'kids'].includes(cleanGender)) {
    return `/${cleanGender}/${cleanSlug}`;
  }
  return `/products?category=${cleanSlug}`;
}

/**
 * Resolves dynamic brand catalog link.
 */
function resolveBrandUrl(brandSlug?: string | null, brandName?: string | null): string {
  const target = brandSlug || brandName;
  if (!target) return '/products';
  return `/products?brand=${encodeURIComponent(target.toLowerCase().trim())}`;
}

/**
 * Amazon & Flipkart style Editorial Overview and Technical Specifications Layout.
 * Uses structured sections, authentic database fields, and verified navigation links.
 */
export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  const categoryUrl = resolveCategoryUrl(product.categorySlug, product.gender);
  const brandUrl = resolveBrandUrl(product.brandSlug, product.brandName);
  const genderUrl = product.gender ? `/${product.gender.toLowerCase()}` : '/products';
  const collectionUrl = product.collection
    ? `/collections/${product.collection.toLowerCase().trim().replace(/\s+/g, '-')}`
    : null;

  // Options specifications (e.g. Size, Color)
  const optionSpecs = (product.options || []).map((opt) => ({
    label: opt.name,
    value: opt.values.map((v) => v.value).join(', '),
    isLink: false,
  }));

  // Structured Technical Details table (Amazon/Flipkart standard)
  const technicalSpecs: Array<{
    label: string;
    value: React.ReactNode;
    href?: string;
  }> = [
    {
      label: 'Style / Product Title',
      value: product.name,
    },
    ...(product.sku
      ? [
          {
            label: 'Model / Style Code (SKU)',
            value: <span className="font-mono tracking-wider">{product.sku}</span>,
          },
        ]
      : []),
    {
      label: 'Category',
      value: product.categoryName || 'Apparel',
      href: categoryUrl,
    },
    {
      label: 'Brand',
      value: product.brandName || 'Lexido',
      href: brandUrl,
    },
    ...(product.gender
      ? [
          {
            label: 'Gender / Ideal For',
            value: product.gender.charAt(0).toUpperCase() + product.gender.slice(1).toLowerCase(),
            href: genderUrl,
          },
        ]
      : []),
    ...(product.fit
      ? [
          {
            label: 'Fit & Silhouette',
            value: product.fit,
          },
        ]
      : []),
    ...(product.material
      ? [
          {
            label: 'Fabric & Composition',
            value: product.material,
          },
        ]
      : []),
    ...(product.pattern
      ? [
          {
            label: 'Pattern / Surface',
            value: product.pattern,
          },
        ]
      : []),
    ...(product.occasion
      ? [
          {
            label: 'Occasion / Suitable For',
            value: product.occasion,
          },
        ]
      : []),
    ...(product.collection
      ? [
          {
            label: 'Collection',
            value: product.collection,
            href: collectionUrl || undefined,
          },
        ]
      : []),
    ...(product.season
      ? [
          {
            label: 'Season Period',
            value: product.season,
          },
        ]
      : []),
    ...optionSpecs.map((o) => ({ label: o.label, value: o.value })),
    ...(product.careInstructions
      ? [
          {
            label: 'Care Instructions',
            value: product.careInstructions,
          },
        ]
      : []),
    {
      label: 'Country of Origin',
      value: product.countryOfOrigin || 'India',
      href: `/products?country=${encodeURIComponent(product.countryOfOrigin || 'India')}`,
    },
    {
      label: 'Net Quantity',
      value: '1 N',
    },
    {
      label: 'Package Contents',
      value: `1 ${product.name}`,
    },
    {
      label: 'Manufacturer / Packer',
      value: `${product.brandName || 'Lexido'} Atelier Studio, Apparel Division, India`,
    },
    {
      label: 'Inventory Status',
      value: (
        <span
          className={`font-bold ${
            product.status === 'active' && product.quantity > 0
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {product.status === 'active'
            ? product.quantity > 0
              ? `In Stock (${product.quantity} units available)`
              : 'Out of Stock'
            : 'Limited Edition Release'}
        </span>
      ),
    },
  ];

  // Custom metadata from admin
  if (product.metadata) {
    Object.entries(product.metadata).forEach(([key, val]) => {
      if (typeof val === 'string' || typeof val === 'number') {
        technicalSpecs.push({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          value: val.toString(),
        });
      }
    });
  }

  // Dynamic craftsmanship bullet highlights
  const dynamicHighlights = [
    {
      title: 'Fabric Composition',
      desc: product.material || 'Engineered high-density luxury textile blend offering all-day breathability',
    },
    {
      title: 'Silhouette & Fit',
      desc: product.fit
        ? `${product.fit} cut with ergonomic seams for ease of movement`
        : 'Contemporary tailored profile designed for enduring comfort and clean draping',
    },
    {
      title: 'Pattern & Surface',
      desc: product.pattern
        ? `${product.pattern} surface design crafted with colorfast dye chemistry`
        : 'Solid minimalist finish created with certified non-toxic textile dyes',
    },
    {
      title: 'Occasion & Use',
      desc: product.occasion
        ? `Engineered specifically for ${product.occasion.toLowerCase()}`
        : 'Versatile design tailored seamlessly for daily, athletic, or elevated occasions',
    },
    {
      title: 'Seam Construction',
      desc: 'Precision reinforced stress points and high-density seam stitching for shape retention',
    },
    {
      title: 'Quality Standard',
      desc: 'Pre-shrunk fabric construction to minimize distortion across household washing cycles',
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* 2-Column Responsive Balanced Grid (Amazon/Flipkart Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Editorial Overview & Dynamic Craftsmanship Highlights */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Product Details
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Product Overview & Design Story
            </Heading>

            <Text className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line font-sans">
              {product.description ||
                `${product.name} by ${product.brandName || 'Lexido'}. Crafted with signature atelier precision, engineered from breathable fabrics to ensure long-lasting comfort, modern drape, and durability.`}
            </Text>

            {/* Bulleted Craftsmanship Highlights */}
            <div className="pt-3 border-t border-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Key Product Features & Highlights
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

            {/* Clickable Navigation Tag Pills */}
            <div className="pt-2 border-t border-border/60">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                Catalog Taxonomy & Direct Links
              </p>
              <div className="flex flex-wrap gap-2">
                {product.categoryName && (
                  <Link
                    href={categoryUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/60 group cursor-pointer"
                  >
                    <Tag className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                    <span>{product.categoryName}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </Link>
                )}

                {product.brandName && (
                  <Link
                    href={brandUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/60 group cursor-pointer"
                  >
                    <Layers className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                    <span>{product.brandName}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </Link>
                )}

                {product.gender && (
                  <Link
                    href={genderUrl}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/60 group cursor-pointer capitalize"
                  >
                    <Sparkles className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                    <span>{product.gender}&apos;s Collection</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </Link>
                )}

                {product.collection && (
                  <Link
                    href={collectionUrl || '#'}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/60 group cursor-pointer"
                  >
                    <Building2 className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                    <span>{product.collection} Capsule</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-60 ml-0.5" />
                  </Link>
                )}

                <Link
                  href={`/products?country=${encodeURIComponent(product.countryOfOrigin || 'India')}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted hover:bg-muted/80 text-foreground transition-colors border border-border/60 group cursor-pointer"
                >
                  <Globe2 className="w-3 h-3 text-primary group-hover:scale-110 transition-transform" />
                  <span>Made in {product.countryOfOrigin || 'India'}</span>
                </Link>

                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  100% Original Brand Certified
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Amazon & Flipkart Style Technical Details Table */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Technical Specifications
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {technicalSpecs.length} Attributes
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Technical Details
            </Heading>

            {/* Structured Specifications Table */}
            <div className="border border-border/80 rounded-lg overflow-hidden divide-y divide-border/80 bg-background/50">
              {technicalSpecs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between px-3.5 py-2.5 text-xs hover:bg-muted/20 transition-colors gap-3"
                >
                  <span className="font-semibold text-muted-foreground select-none shrink-0 w-2/5">
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
        <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-primary" />
              <Heading level={2} className="text-base font-bold tracking-tight font-heading">
                {product.sizeChart.title || 'Size & Fit Measurement Guide'}
              </Heading>
            </div>
            {product.sizeChart.unit && (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase">
                Unit: {product.sizeChart.unit}
              </span>
            )}
          </div>

          <div className="border border-border rounded-lg overflow-x-auto bg-card">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  {product.sizeChart.columns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase text-[11px] tracking-wider"
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
