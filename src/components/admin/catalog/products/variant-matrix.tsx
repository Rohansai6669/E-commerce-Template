'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Sliders, Settings2, Sparkles, Box, DollarSign, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { MediaPickerModal } from '@/components/admin/media/media-picker-modal';

interface AttributeValue {
  id: string;
  value: string;
  colorHex?: string | null;
  imageUrl?: string | null;
}

interface Attribute {
  id: string;
  name: string;
  displayType: string;
  values: AttributeValue[];
}

interface VariantRow {
  id?: string;
  sku: string;
  barcode?: string | null;
  price: string;
  compareAtPrice?: string | null;
  costPrice?: string | null;
  weight?: string | null;
  status: 'active' | 'draft' | 'archived';
  imageUrl?: string | null;
  trackInventory: boolean;
  stock: number;
  attributeValueIds: string[]; // combination values
  combinationLabel: string; // e.g. "Black / S"
}

interface VariantMatrixProps {
  globalAttributes: Attribute[];
  selectedAttributeIds: string[];
  selectedValues: { attributeId: string; valueIds: string[] }[];
  variantAttributeIds?: string[];
  baseSku: string;
  basePrice: string;
  existingVariants?: VariantRow[];
  onChange: (variants: VariantRow[]) => void;
}

export function VariantMatrix({
  globalAttributes,
  selectedAttributeIds,
  selectedValues,
  variantAttributeIds,
  baseSku,
  basePrice,
  existingVariants = [],
  onChange,
}: VariantMatrixProps) {
  const [variants, setVariants] = React.useState<VariantRow[]>([]);
  const [selectedRowIndexes, setSelectedRowIndexes] = React.useState<number[]>([]);
  const [variantPickerIndex, setVariantPickerIndex] = React.useState<number | null>(null);

  // Bulk values
  const [bulkPrice, setBulkPrice] = React.useState('');
  const [bulkStock, setBulkStock] = React.useState('');
  const [bulkCost, setBulkCost] = React.useState('');

  // 1. Generate matrix combinations
  React.useEffect(() => {
    // Determine which attributes generate variant SKU matrix rows
    const targetAttributeIds =
      variantAttributeIds && variantAttributeIds.length > 0
        ? variantAttributeIds
        : selectedAttributeIds;

    // Filter active attributes that have at least one value selected
    const activeAttrs = globalAttributes
      .filter((attr) => targetAttributeIds.includes(attr.id))
      .map((attr) => {
        const mapping = selectedValues.find((v) => v.attributeId === attr.id);
        const activeVals = attr.values.filter((v) => mapping?.valueIds.includes(v.id));
        return {
          attributeId: attr.id,
          name: attr.name,
          values: activeVals,
        };
      })
      .filter((a) => a.values.length > 0);

    if (activeAttrs.length === 0) {
      setVariants([]);
      onChange([]);
      return;
    }

    // Cartesian product helper
    const cartesian = (arrays: any[]): any[] => {
      return arrays.reduce(
        (a, b) => a.flatMap((d: any) => b.map((e: any) => [d, e].flat())),
        [[]]
      );
    };

    const valueArrays = activeAttrs.map((a) => a.values);
    const combinations = cartesian(valueArrays);

    const generated: VariantRow[] = combinations.map((combo: AttributeValue[]) => {
      const valIds = combo.map((v) => v.id);
      const label = combo.map((v) => v.value).join(' / ');

      // Check if this combination already exists in our current state or database variants
      const existingMatch = existingVariants.find((ev) => {
        const evSorted = [...ev.attributeValueIds].sort();
        const comboSorted = [...valIds].sort();
        return evSorted.length === comboSorted.length && evSorted.every((v, i) => v === comboSorted[i]);
      }) || variants.find((v) => {
        const vSorted = [...v.attributeValueIds].sort();
        const comboSorted = [...valIds].sort();
        return vSorted.length === comboSorted.length && vSorted.every((val, i) => val === comboSorted[i]);
      });

      if (existingMatch) {
        return {
          ...existingMatch,
          combinationLabel: label,
        };
      }

      // Generate a clean SKU suffix based on option values
      const skuSuffix = combo
        .map((v) => v.value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
        .join('-');

      return {
        sku: `${baseSku || 'sku'}-${skuSuffix}`,
        barcode: '',
        price: basePrice || '0.00',
        compareAtPrice: '',
        costPrice: '',
        weight: '',
        status: 'active',
        imageUrl: '',
        trackInventory: true,
        stock: 0,
        attributeValueIds: valIds,
        combinationLabel: label,
      };
    });

    setVariants(generated);
    onChange(generated);
    setSelectedRowIndexes([]);
  }, [selectedAttributeIds, selectedValues, baseSku, basePrice]);

  const handleRowChange = (index: number, field: keyof VariantRow, value: any) => {
    const next = variants.map((v, idx) => {
      if (idx !== index) return v;
      return {
        ...v,
        [field]: value,
      };
    });
    setVariants(next);
    onChange(next);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIndexes(variants.map((_, i) => i));
    } else {
      setSelectedRowIndexes([]);
    }
  };

  const handleSelectRow = (index: number, checked: boolean) => {
    if (checked) {
      setSelectedRowIndexes((prev) => [...prev, index]);
    } else {
      setSelectedRowIndexes((prev) => prev.filter((i) => i !== index));
    }
  };

  const applyBulkEdit = () => {
    if (selectedRowIndexes.length === 0) {
      toast.error('Select at least one variant row to apply bulk updates.');
      return;
    }

    const next = variants.map((v, index) => {
      if (!selectedRowIndexes.includes(index)) return v;

      return {
        ...v,
        price: bulkPrice ? parseFloat(bulkPrice).toFixed(2) : v.price,
        stock: bulkStock ? parseInt(bulkStock) : v.stock,
        costPrice: bulkCost ? parseFloat(bulkCost).toFixed(2) : v.costPrice,
      };
    });

    setVariants(next);
    onChange(next);
    toast.success(`Bulk settings applied to ${selectedRowIndexes.length} variants!`);
    setBulkPrice('');
    setBulkStock('');
    setBulkCost('');
  };

  if (variants.length === 0) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded p-6 text-center text-xs text-slate-500 italic">
        Select attributes and values above to automatically generate variant matrices.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Bulk Editor Section */}
      <div className="border border-slate-200 bg-slate-50 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Bulk Editor ({selectedRowIndexes.length} selected)
          </span>
          <span className="text-[10px] text-slate-500">
            Apply parameters to all checked combinations simultaneously.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="number"
            step="0.01"
            value={bulkPrice}
            onChange={(e) => setBulkPrice(e.target.value)}
            placeholder="Price"
            className="w-24 h-9 bg-white text-xs"
          />
          <Input
            type="number"
            step="0.01"
            value={bulkCost}
            onChange={(e) => setBulkCost(e.target.value)}
            placeholder="Cost"
            className="w-24 h-9 bg-white text-xs"
          />
          <Input
            type="number"
            value={bulkStock}
            onChange={(e) => setBulkStock(e.target.value)}
            placeholder="Stock"
            className="w-24 h-9 bg-white text-xs"
          />
          <Button
            type="button"
            onClick={applyBulkEdit}
            className="h-9 px-3 bg-slate-900 text-white hover:bg-slate-850 text-xs font-semibold cursor-pointer rounded flex items-center gap-1 uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" /> Apply
          </Button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600 uppercase tracking-wider text-[10px] h-10">
                <th className="px-4 text-center w-10">
                  <input
                    type="checkbox"
                    checked={selectedRowIndexes.length === variants.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                  />
                </th>
                <th className="px-4">Variant Option</th>
                <th className="px-3 w-16 text-center">Image</th>
                <th className="px-4 w-36">SKU Code</th>
                <th className="px-4 w-32">Barcode</th>
                <th className="px-4 w-24">Price</th>
                <th className="px-4 w-24">Compare At</th>
                <th className="px-4 w-24">Cost</th>
                <th className="px-4 w-20">Stock</th>
                <th className="px-4 w-20">Track Inv</th>
                <th className="px-4 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((row, index) => {
                const isSelected = selectedRowIndexes.includes(index);

                return (
                  <tr
                    key={index}
                    className={`border-b border-slate-100 hover:bg-slate-50/50 h-12 transition ${
                      isSelected ? 'bg-slate-50' : ''
                    }`}
                  >
                    <td className="px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(index, e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-4 font-bold text-slate-800">{row.combinationLabel}</td>
                    <td className="px-2 text-center">
                      <div className="flex items-center justify-center">
                        {row.imageUrl ? (
                          <div
                            onClick={() => setVariantPickerIndex(index)}
                            title="Click to change variant image from Cloudflare storage"
                            className="relative group w-8 h-8 rounded border border-slate-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer hover:border-slate-950 transition"
                          >
                            <img
                              src={row.imageUrl}
                              alt={row.combinationLabel}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                              <ImageIcon className="w-3.5 h-3.5 text-white" />
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setVariantPickerIndex(index)}
                            title="Pick or upload variant image from Cloudflare"
                            className="w-8 h-8 rounded border border-dashed border-slate-300 hover:border-slate-900 bg-slate-50 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition text-slate-400 hover:text-slate-800"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-2">
                      <Input
                        type="text"
                        value={row.sku}
                        onChange={(e) => handleRowChange(index, 'sku', e.target.value)}
                        required
                        className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] font-mono px-2"
                      />
                    </td>
                    <td className="px-2">
                      <Input
                        type="text"
                        value={row.barcode || ''}
                        onChange={(e) => handleRowChange(index, 'barcode', e.target.value)}
                        className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] font-mono px-2"
                      />
                    </td>
                    <td className="px-2">
                      <div className="relative">
                        <DollarSign className="absolute left-1.5 top-2.5 w-3 h-3 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={row.price}
                          onChange={(e) => handleRowChange(index, 'price', e.target.value)}
                          required
                          className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] pl-4.5 pr-1 font-semibold"
                        />
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="relative">
                        <DollarSign className="absolute left-1.5 top-2.5 w-3 h-3 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={row.compareAtPrice || ''}
                          onChange={(e) => handleRowChange(index, 'compareAtPrice', e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] pl-4.5 pr-1 font-semibold text-slate-500"
                        />
                      </div>
                    </td>
                    <td className="px-2">
                      <div className="relative">
                        <DollarSign className="absolute left-1.5 top-2.5 w-3 h-3 text-slate-400" />
                        <Input
                          type="number"
                          step="0.01"
                          value={row.costPrice || ''}
                          onChange={(e) => handleRowChange(index, 'costPrice', e.target.value)}
                          className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] pl-4.5 pr-1"
                        />
                      </div>
                    </td>
                    <td className="px-2">
                      <Input
                        type="number"
                        value={row.stock}
                        onChange={(e) => handleRowChange(index, 'stock', e.target.value ? parseInt(e.target.value) : 0)}
                        className="bg-white border-slate-200 text-slate-900 focus:border-slate-950 h-8 text-[11px] px-2 font-semibold"
                      />
                    </td>
                    <td className="px-4 text-center">
                      <input
                        type="checkbox"
                        checked={row.trackInventory}
                        onChange={(e) => handleRowChange(index, 'trackInventory', e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-2">
                      <select
                        value={row.status}
                        onChange={(e) => handleRowChange(index, 'status', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 text-[11px] text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-8 font-medium"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {variantPickerIndex !== null && (
        <MediaPickerModal
          isOpen={variantPickerIndex !== null}
          onClose={() => setVariantPickerIndex(null)}
          onSelect={(url) => {
            if (variantPickerIndex !== null) {
              handleRowChange(variantPickerIndex, 'imageUrl', url);
              toast.success(`Variant "${variants[variantPickerIndex]?.combinationLabel}" image updated!`);
            }
            setVariantPickerIndex(null);
          }}
          currentValue={variantPickerIndex !== null ? variants[variantPickerIndex]?.imageUrl || '' : ''}
          defaultFolder="products"
          title={`Select Variant Image: ${variantPickerIndex !== null ? variants[variantPickerIndex]?.combinationLabel : ''}`}
        />
      )}
    </div>
  );
}
