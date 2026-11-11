'use client';

import * as React from 'react';
import { Sliders, Check, Sparkles, Layers, Tag } from 'lucide-react';

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

interface AttributeSelectorProps {
  globalAttributes: Attribute[];
  selectedAttributeIds: string[];
  selectedValues: { attributeId: string; valueIds: string[] }[];
  variantAttributeIds?: string[];
  onChange: (
    attributeIds: string[],
    values: { attributeId: string; valueIds: string[] }[],
    variantAttributeIds?: string[]
  ) => void;
  title?: string;
  description?: string;
}

export function AttributeSelector({
  globalAttributes,
  selectedAttributeIds,
  selectedValues,
  variantAttributeIds,
  onChange,
  title = 'Catalog Attributes & Specifications Engine',
  description = 'Select universal product attributes, festival editions, materials, and configure which axes generate variant SKUs.',
}: AttributeSelectorProps) {
  // If variantAttributeIds is not provided, initialize it smartly (Size and Color default to variant generation)
  const effectiveVariantAttrIds = React.useMemo(() => {
    if (variantAttributeIds !== undefined) return variantAttributeIds;
    return selectedAttributeIds.filter((id) => {
      const attr = globalAttributes.find((a) => a.id === id);
      const name = attr?.name.toLowerCase() || '';
      return name === 'size' || name === 'color' || name === 'storage' || name === 'dimension';
    });
  }, [variantAttributeIds, selectedAttributeIds, globalAttributes]);

  const handleAttributeToggle = (attrId: string) => {
    const isSelected = selectedAttributeIds.includes(attrId);
    let nextAttrIds = [...selectedAttributeIds];
    let nextValues = [...selectedValues];
    let nextVariantAttrIds = [...effectiveVariantAttrIds];

    if (isSelected) {
      nextAttrIds = nextAttrIds.filter((id) => id !== attrId);
      nextValues = nextValues.filter((v) => v.attributeId !== attrId);
      nextVariantAttrIds = nextVariantAttrIds.filter((id) => id !== attrId);
    } else {
      nextAttrIds.push(attrId);
      nextValues.push({ attributeId: attrId, valueIds: [] });
      // Default to variant axis if typical variant dimension
      const attr = globalAttributes.find((a) => a.id === attrId);
      const name = attr?.name.toLowerCase() || '';
      if (name === 'size' || name === 'color' || name === 'storage') {
        if (!nextVariantAttrIds.includes(attrId)) {
          nextVariantAttrIds.push(attrId);
        }
      }
    }

    onChange(nextAttrIds, nextValues, nextVariantAttrIds);
  };

  const handleVariantToggle = (attrId: string) => {
    let nextVariantAttrIds = [...effectiveVariantAttrIds];
    if (nextVariantAttrIds.includes(attrId)) {
      nextVariantAttrIds = nextVariantAttrIds.filter((id) => id !== attrId);
    } else {
      nextVariantAttrIds.push(attrId);
    }
    onChange(selectedAttributeIds, selectedValues, nextVariantAttrIds);
  };

  const handleValueToggle = (attrId: string, valueId: string) => {
    const nextValues = selectedValues.map((v) => {
      if (v.attributeId !== attrId) return v;

      const isSelected = v.valueIds.includes(valueId);
      const nextValIds = isSelected
        ? v.valueIds.filter((id) => id !== valueId)
        : [...v.valueIds, valueId];

      return {
        ...v,
        valueIds: nextValIds,
      };
    });

    onChange(selectedAttributeIds, nextValues, effectiveVariantAttrIds);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="border-b border-slate-100 pb-3 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            {title}
          </h4>
        </div>
        <p className="text-xs text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {globalAttributes.map((attr) => {
          const isAttrChecked = selectedAttributeIds.includes(attr.id);
          const mappedValueObj = selectedValues.find((v) => v.attributeId === attr.id);
          const checkedValueIds = mappedValueObj?.valueIds || [];
          const isVariantAxis = effectiveVariantAttrIds.includes(attr.id);

          return (
            <div
              key={attr.id}
              className={`border rounded-lg p-4 transition-all ${
                isAttrChecked
                  ? 'border-indigo-200 bg-indigo-50/15 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`attr-${attr.id}`}
                    checked={isAttrChecked}
                    onChange={() => handleAttributeToggle(attr.id)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
                  />
                  <label
                    htmlFor={`attr-${attr.id}`}
                    className="text-sm font-bold text-slate-800 cursor-pointer select-none uppercase tracking-wide flex items-center gap-1.5"
                  >
                    {attr.name}
                    {attr.name === 'Festival' && <Sparkles className="w-3.5 h-3.5 text-amber-500 inline" />}
                    {attr.name === 'Edition' && <Tag className="w-3.5 h-3.5 text-indigo-500 inline" />}
                  </label>
                </div>

                {isAttrChecked && (
                  <button
                    type="button"
                    onClick={() => handleVariantToggle(attr.id)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition cursor-pointer ${
                      isVariantAxis
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                    title={
                      isVariantAxis
                        ? 'This attribute will generate distinct purchasable SKUs in the Variant Matrix'
                        : 'This attribute acts as a product specification tag (for deals, festive sections, and coupons)'
                    }
                  >
                    <Layers className="w-3 h-3" />
                    {isVariantAxis ? 'Generates Variant SKUs' : 'Product Spec / Filter Tag'}
                  </button>
                )}
              </div>

              {isAttrChecked && (
                <div className="pl-7 pt-2 flex flex-wrap gap-2 border-t border-slate-100 mt-3">
                  {attr.values.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">No values defined for this attribute.</span>
                  ) : (
                    attr.values.map((val) => {
                      const isValChecked = checkedValueIds.includes(val.id);

                      return (
                        <button
                          key={val.id}
                          type="button"
                          onClick={() => handleValueToggle(attr.id, val.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold cursor-pointer select-none transition ${
                            isValChecked
                              ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {attr.displayType === 'color' && val.colorHex && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0"
                              style={{ backgroundColor: val.colorHex }}
                            />
                          )}
                          {attr.displayType === 'image' && val.imageUrl && (
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-white/20 bg-cover bg-center flex-shrink-0"
                              style={{ backgroundImage: `url(${val.imageUrl})` }}
                            />
                          )}
                          <span>{val.value}</span>
                          {isValChecked && <Check className="w-3 h-3 text-white ml-0.5" />}
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
