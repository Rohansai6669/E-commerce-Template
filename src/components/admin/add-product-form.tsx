'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, syncVariantsAction } from '@/app/actions/product-actions';
import { getGlobalAttributesAction } from '@/app/actions/attribute-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { AttributeSelector } from '@/components/admin/catalog/products/attribute-selector';
import { VariantMatrix } from '@/components/admin/catalog/products/variant-matrix';
import { ProductGalleryManager } from '@/components/admin/media/product-gallery-manager';
import { toast } from 'sonner';
import { createCategoryAction } from '@/app/actions/category-actions';
import { createBrandAction } from '@/app/actions/brand-actions';
import { ShoppingBag, Sparkles, Sliders, Box, Plus, X } from 'lucide-react';

interface AddProductFormProps {
  categories: { id: string; name: string; parentId?: string | null }[];
  brands: { id: string; name: string }[];
  redirectOnSuccess?: string;
}

export function AddProductForm({ categories, brands, redirectOnSuccess }: AddProductFormProps) {
  const router = useRouter();
  const [productType, setProductType] = React.useState<'simple' | 'variant'>('simple');
  const [isPending, startTransition] = React.useTransition();

  // Local lists for categories & brands to allow direct additions
  const [categoriesList, setCategoriesList] = React.useState(categories);
  const [brandsList, setBrandsList] = React.useState(brands);

  React.useEffect(() => {
    setCategoriesList(categories);
  }, [categories]);

  React.useEffect(() => {
    setBrandsList(brands);
  }, [brands]);

  // Direct Add Category State
  const [isAddingCategory, setIsAddingCategory] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState('');
  const [isCategoryPending, setIsCategoryPending] = React.useState(false);

  // Direct Add Brand State
  const [isAddingBrand, setIsAddingBrand] = React.useState(false);
  const [newBrandName, setNewBrandName] = React.useState('');
  const [isBrandPending, setIsBrandPending] = React.useState(false);

  // Basic product details
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [compareAtPrice, setCompareAtPrice] = React.useState('');
  const [costPrice, setCostPrice] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [stock, setStock] = React.useState('10');
  const [status, setStatus] = React.useState<'active' | 'draft' | 'archived'>('active');
  const [imageUrl, setImageUrl] = React.useState('');
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [categoryId, setCategoryId] = React.useState('');
  const [brandId, setBrandId] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [dimensions, setDimensions] = React.useState('');

  // Fashion Attributes State
  const [gender, setGender] = React.useState('');
  const [material, setMaterial] = React.useState('');
  const [fit, setFit] = React.useState('');
  const [pattern, setPattern] = React.useState('');
  const [season, setSeason] = React.useState('');
  const [collection, setCollection] = React.useState('');
  const [occasion, setOccasion] = React.useState('');
  const [careInstructions, setCareInstructions] = React.useState('');
  const [countryOfOrigin, setCountryOfOrigin] = React.useState('');

  // Global Attributes mapping
  const [globalAttributes, setGlobalAttributes] = React.useState<any[]>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = React.useState<string[]>([]);
  const [selectedValues, setSelectedValues] = React.useState<{ attributeId: string; valueIds: string[] }[]>([]);
  const [variantAttributeIds, setVariantAttributeIds] = React.useState<string[]>([]);
  const [variantsList, setVariantsList] = React.useState<any[]>([]);

  // Load global attributes
  React.useEffect(() => {
    startTransition(async () => {
      const res = await getGlobalAttributesAction();
      if (res.success && res.data) {
        setGlobalAttributes(res.data);
      }
    });
  }, []);

  // Direct Add Category Handler
  const handleDirectAddCategory = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCategoryPending(true);
    const formData = new FormData();
    formData.append('name', newCategoryName.trim());

    const res = await createCategoryAction(formData);
    setIsCategoryPending(false);

    if (res.success && res.data) {
      const created = res.data;
      setCategoriesList((prev) => [...prev, created]);
      setCategoryId(created.id);
      setNewCategoryName('');
      setIsAddingCategory(false);
      toast.success(`Category "${created.name}" created and selected!`);
    } else {
      toast.error(res.error || 'Failed to create category.');
    }
  };

  // Direct Add Brand Handler
  const handleDirectAddBrand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newBrandName.trim()) return;

    setIsBrandPending(true);
    const formData = new FormData();
    formData.append('name', newBrandName.trim());

    const res = await createBrandAction(formData);
    setIsBrandPending(false);

    if (res.success && res.data) {
      const created = res.data;
      setBrandsList((prev) => [...prev, created]);
      setBrandId(created.id);
      setNewBrandName('');
      setIsAddingBrand(false);
      toast.success(`Brand "${created.name}" created and selected!`);
    } else {
      toast.error(res.error || 'Failed to create brand.');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim() || !price || !sku) {
      toast.error('Product name, base price, and SKU are required.');
      return;
    }

    startTransition(async () => {
      // 1. Create Basic Product Catalog Item
      const res = await createProductAction({
        name,
        description: description || null,
        price,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        sku,
        categoryId: categoryId || null,
        brandId: brandId || null,
        imageUrl: imageUrl || null,
        productType,
        status,
        weight: weight || null,
        dimensions: dimensions || null,
        gender: gender || null,
        material: material || null,
        fit: fit || null,
        pattern: pattern || null,
        season: season || null,
        collection: collection || null,
        occasion: occasion || null,
        careInstructions: careInstructions || null,
        countryOfOrigin: countryOfOrigin || null,
      });

      if (!res.success || !res.productId) {
        toast.error(res.error || 'Failed to create product catalog item.');
        return;
      }

      const newProductId = res.productId;

      // 2. If simple product, setup single default variant
      if (productType === 'simple') {
        const defaultVarList = [
          {
            sku,
            price,
            costPrice: costPrice || null,
            stock: parseInt(stock, 10) || 0,
            status: status === 'active' ? ('active' as const) : ('draft' as const),
            trackInventory: true,
            attributeValueIds: [],
          },
        ];

        const syncRes = await syncVariantsAction(
          newProductId,
          selectedAttributeIds,
          selectedValues,
          defaultVarList
        );
        if (syncRes.success) {
          toast.success('Simple product created successfully.');
          setName('');
          setDescription('');
          setPrice('');
          setCompareAtPrice('');
          setCostPrice('');
          setSku('');
          setStock('10');
          setImageUrl('');
          setCategoryId('');
          setBrandId('');
          setWeight('');
          setDimensions('');
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess);
          } else {
            router.refresh();
          }
        } else {
          toast.error(syncRes.error || 'Failed to initialize default variant.');
        }
      } else {
        // 3. If variant product, sync matrix list
        if (variantsList.length === 0) {
          toast.error('Select attributes and generate at least one variant.');
          return;
        }

        const syncRes = await syncVariantsAction(
          newProductId,
          selectedAttributeIds,
          selectedValues,
          variantsList
        );

        if (syncRes.success) {
          toast.success('Variant product and options matrix generated successfully!');
          setName('');
          setDescription('');
          setPrice('');
          setCompareAtPrice('');
          setCostPrice('');
          setSku('');
          setStock('10');
          setImageUrl('');
          setCategoryId('');
          setBrandId('');
          setWeight('');
          setDimensions('');
          setSelectedAttributeIds([]);
          setSelectedValues([]);
          setVariantsList([]);
          if (redirectOnSuccess) {
            router.push(redirectOnSuccess);
          } else {
            router.refresh();
          }
        } else {
          toast.error(syncRes.error || 'Failed to generate variants.');
        }
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-4">
      <FormField label="Product Type">
        <select
          id="productType"
          name="productType"
          value={productType}
          onChange={(e) => setProductType(e.target.value as 'simple' | 'variant')}
          className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold"
        >
          <option value="simple">Simple Product (Single default option)</option>
          <option value="variant">Variant Product (Configured options & variants inline)</option>
        </select>
      </FormField>

      <FormField label="Product Name">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Silk Evening Dress"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
        />
      </FormField>

      <FormField label="Description">
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Premium silk tailored silhouette with elegant finish..."
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField label="Selling Price (INR ₹)">
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="1499.00"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>

        <FormField label="Cost Price (INR ₹)">
          <Input
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="750.00"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>

        <FormField label="MSRP / Compare At Price (INR ₹)">
          <Input
            type="number"
            step="0.01"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            placeholder="1999.00"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>
      </div>

      {/* Live Margin & Profit Preview */}
      {Number(price) > 0 && Number(costPrice) > 0 && (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-emerald-950">Unit Margin:</span>
            <span className="text-emerald-800 font-medium">
              Gross Profit ₹{(Number(price) - Number(costPrice)).toFixed(2)} per unit
            </span>
          </div>
          <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
            {(((Number(price) - Number(costPrice)) / Number(price)) * 100).toFixed(1)}% margin
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Base Catalog SKU">
          <Input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="SLK-EVN-VAR"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
          />
        </FormField>

        {productType === 'simple' && (
          <FormField label="Initial Stock Quantity">
            <Input
              type="number"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="10"
              required
              disabled={isPending}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
            />
          </FormField>
        )}

        {productType === 'variant' && (
          <FormField label="Product Status">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold"
            >
              <option value="active">Active (Published)</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </FormField>
        )}
      </div>

      {/* Amazon-style Multi-Image Gallery Manager */}
      <ProductGalleryManager
        primaryImage={imageUrl}
        onPrimaryImageChange={(url) => setImageUrl(url)}
        galleryImages={galleryUrls}
        onGalleryImagesChange={(urls) => setGalleryUrls(urls)}
        folder="products"
        disabled={isPending}
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Weight (kg)">
          <Input
            type="number"
            step="0.01"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="0.50"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs"
          />
        </FormField>

        <FormField label="Dimensions (L × W × H cm)">
          <Input
            type="text"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            placeholder="30 x 20 x 5"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs font-mono"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Field with Direct Add Option */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Category</label>
            <button
              type="button"
              onClick={() => setIsAddingCategory(!isAddingCategory)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              {isAddingCategory ? (
                <>
                  <X className="w-3 h-3" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" /> Direct Add Category
                </>
              )}
            </button>
          </div>

          {isAddingCategory ? (
            <div className="flex items-center gap-2 bg-indigo-50/50 p-2 border border-indigo-200 rounded-md animate-in fade-in duration-150">
              <Input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Enter new category name..."
                disabled={isCategoryPending}
                className="h-9 text-xs bg-white border-slate-300 focus:border-indigo-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectAddCategory();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleDirectAddCategory}
                disabled={isCategoryPending || !newCategoryName.trim()}
                className="h-9 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shrink-0"
              >
                {isCategoryPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          ) : (
            <select
              value={categoryId}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setIsAddingCategory(true);
                } else {
                  setCategoryId(e.target.value);
                }
              }}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
            >
              <option value="">Select Category / Subcategory...</option>
              {categoriesList.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.parentId ? `  ↳ ${cat.name} (Subcategory)` : `📁 ${cat.name}`}
                </option>
              ))}
              <option value="__add_new__" className="font-bold text-indigo-600">
                + Direct Add Category...
              </option>
            </select>
          )}
        </div>

        {/* Brand Field with Direct Add Option */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Brand</label>
            <button
              type="button"
              onClick={() => setIsAddingBrand(!isAddingBrand)}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              {isAddingBrand ? (
                <>
                  <X className="w-3 h-3" /> Cancel
                </>
              ) : (
                <>
                  <Plus className="w-3 h-3" /> Direct Add Brand
                </>
              )}
            </button>
          </div>

          {isAddingBrand ? (
            <div className="flex items-center gap-2 bg-indigo-50/50 p-2 border border-indigo-200 rounded-md animate-in fade-in duration-150">
              <Input
                type="text"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="Enter new brand name..."
                disabled={isBrandPending}
                className="h-9 text-xs bg-white border-slate-300 focus:border-indigo-600"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleDirectAddBrand();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleDirectAddBrand}
                disabled={isBrandPending || !newBrandName.trim()}
                className="h-9 px-3 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shrink-0"
              >
                {isBrandPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          ) : (
            <select
              value={brandId}
              onChange={(e) => {
                if (e.target.value === '__add_new__') {
                  setIsAddingBrand(true);
                } else {
                  setBrandId(e.target.value);
                }
              }}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
            >
              <option value="">Select Brand...</option>
              {brandsList.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
              <option value="__add_new__" className="font-bold text-indigo-600">
                + Direct Add Brand...
              </option>
            </select>
          )}
        </div>
      </div>

      {/* Universal Attributes & Specifications Engine */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/40 flex flex-col gap-6 mt-2">
        <AttributeSelector
          globalAttributes={globalAttributes}
          selectedAttributeIds={selectedAttributeIds}
          selectedValues={selectedValues}
          variantAttributeIds={variantAttributeIds}
          onChange={(ids, vals, vAttrIds) => {
            setSelectedAttributeIds(ids);
            setSelectedValues(vals);
            if (vAttrIds) setVariantAttributeIds(vAttrIds);
          }}
          title="Product Attributes & Specifications"
          description="Tag festival drops, limited editions, materials, or configure variant dimensions."
        />

        {productType === 'variant' && (
          <VariantMatrix
            globalAttributes={globalAttributes}
            selectedAttributeIds={selectedAttributeIds}
            selectedValues={selectedValues}
            variantAttributeIds={variantAttributeIds}
            baseSku={sku}
            basePrice={price}
            onChange={(list) => setVariantsList(list)}
          />
        )}
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
      >
        <ShoppingBag className="w-4 h-4" /> {isPending ? 'Saving...' : 'Create Product'}
      </Button>
    </form>
  );
}
