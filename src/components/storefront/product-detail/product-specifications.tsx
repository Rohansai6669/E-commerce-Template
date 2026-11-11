import * as React from 'react';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Separator } from '@/components/ui/separator';
import { type ProductDetailModel } from '@/core/product/product.types';

export interface ProductSpecificationsProps {
  product: ProductDetailModel;
}

/**
 * Technical specifications grid parsing dynamic metadata logs from database schema profiles.
 */
export function ProductSpecifications({ product }: ProductSpecificationsProps) {
  // Dynamic universal attributes from catalog database
  const attributeSpecs = (product.options || []).map((opt) => ({
    label: opt.name,
    value: opt.values.map((v) => v.value).join(', '),
  }));

  const specs = [
    { label: 'Category', value: product.categoryName || 'General Catalog' },
    { label: 'Brand Partner', value: product.brandName || 'Generic Storebrand' },
    ...attributeSpecs,
    // Fallback for legacy columns if present and not duplicated
    ...(product.material && !attributeSpecs.some((s) => s.label.toLowerCase() === 'material')
      ? [{ label: 'Material', value: product.material }]
      : []),
    ...(product.countryOfOrigin ? [{ label: 'Country of Origin', value: product.countryOfOrigin }] : []),
    { label: 'Status Code', value: product.status === 'active' ? 'Active In Stock' : 'Draft Release' },
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
    <Stack gap="8" className="w-full">
      {/* Composed description */}
      <Stack gap="3">
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Product Details
        </Heading>
        <Text className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-sans">
          {product.description || 'Detailed description is currently unavailable for this catalog unit.'}
        </Text>
      </Stack>

      {/* Size Chart Section if present */}
      {product.sizeChart && product.sizeChart.columns && product.sizeChart.columns.length > 0 && (
        <>
          <Separator />
          <Stack gap="3">
            <div className="flex items-center justify-between">
              <Heading level={2} className="text-base font-bold tracking-tight font-heading">
                {product.sizeChart.title || 'Size & Fit Measurements Guide'}
              </Heading>
              {product.sizeChart.unit && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground uppercase">
                  Unit: {product.sizeChart.unit}
                </span>
              )}
            </div>
            <div className="border border-border rounded-md overflow-x-auto bg-card shadow-sm">
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
                        <td key={cIdx} className="px-4 py-2.5 text-foreground font-medium whitespace-nowrap">
                          {row[col] || '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Stack>
        </>
      )}

      <Separator />

      {/* Structured specification items table */}
      <Stack gap="3">
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Fashion & Technical Specifications
        </Heading>
        <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
          <table className="w-full border-collapse text-xs sm:text-sm">
            <tbody>
              {specs.map((spec, idx) => (
                <tr
                  key={idx}
                  className="border-b border-border last:border-0 hover:bg-muted/15 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-muted-foreground w-1/3 bg-muted/10 select-none">
                    {spec.label}
                  </td>
                  <td className="px-4 py-3 text-foreground font-semibold">
                    {spec.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Stack>
    </Stack>
  );
}
export default ProductSpecifications;
