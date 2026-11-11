import * as React from 'react';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Separator } from '@/components/ui/separator';
import { type ProductDetailModel } from '@/core/product/product.types';
import {
  Tag,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe2,
  ShieldCheck,
  Ruler,
} from 'lucide-react';

export interface ProductSpecificationsProps {
  product: ProductDetailModel;
}

/**
 * Editorial Overview and Technical Specifications Layout.
 * Uses a balanced 2-column card grid to avoid stretched-out tables and dead whitespace.
 */
export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Dynamic universal attributes from catalog database
  const attributeSpecs = (product.options || []).map((opt) => ({
    label: opt.name,
    value: opt.values.map((v) => v.value).join(', '),
  }));

  const specs = [
    { label: 'Category', value: product.categoryName || 'Streetwear' },
    { label: 'Brand', value: product.brandName || 'Lexido' },
    ...attributeSpecs,
    ...(product.material && !attributeSpecs.some((s) => s.label.toLowerCase() === 'material')
      ? [{ label: 'Material', value: product.material }]
      : []),
    ...(product.countryOfOrigin
      ? [{ label: 'Country of Origin', value: product.countryOfOrigin }]
      : [{ label: 'Country of Origin', value: 'India' }]),
    {
      label: 'Inventory Status',
      value: product.status === 'active' ? 'Active In Stock' : 'Limited Release',
    },
  ];

  if (product.metadata) {
    Object.entries(product.metadata).forEach(([key, val]) => {
      if (typeof val === 'string' || typeof val === 'number') {
        specs.push({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          value: val.toString(),
        });
      }
    });
  }

  return (
    <div className="w-full space-y-8">
      {/* 2-Column Responsive Balanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Editorial Overview & Highlights */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                Overview & Story
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Product Details & Design Notes
            </Heading>

            <Text className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-sans">
              {product.description ||
                'Crafted with signature Lexido precision. Engineered using premium fabrics designed to offer lasting comfort, breathable performance, and a contemporary streetwear silhouette.'}
            </Text>

            {/* Garment Highlights Pillars */}
            <div className="pt-2 border-t border-border/60">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                Craftsmanship Highlights
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Precision tailored seams with reinforced durability</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Breathable, all-day comfort composition</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Pre-shrunk fabric to retain shape after washing</span>
                </div>
                <div className="flex items-start gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Authentic Lexido hardware & signature branding</span>
                </div>
              </div>
            </div>

            {/* Pill Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              {product.categoryName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                  <Tag className="w-3 h-3" />
                  {product.categoryName}
                </span>
              )}
              {product.brandName && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                  <Layers className="w-3 h-3" />
                  {product.brandName}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                <Globe2 className="w-3 h-3" />
                Made in India
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground">
                <ShieldCheck className="w-3 h-3" />
                Verified Quality
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Specifications Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                Specifications
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {specs.length} Attributes
              </span>
            </div>

            <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
              Technical Details
            </Heading>

            {/* Compact Specifications Table / List */}
            <div className="border border-border/80 rounded-lg overflow-hidden divide-y divide-border/80">
              {specs.map((spec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-muted/20 transition-colors"
                >
                  <span className="font-semibold text-muted-foreground select-none">
                    {spec.label}
                  </span>
                  <span className="font-bold text-foreground text-right max-w-[60%] truncate">
                    {spec.value}
                  </span>
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
