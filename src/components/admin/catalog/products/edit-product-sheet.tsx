'use client';

import * as React from 'react';
import { getProductForEditAction, syncVariantsAction, updateProductAction } from '@/app/actions/product-actions';
import { getGlobalAttributesAction } from '@/app/actions/attribute-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AttributeSelector } from './attribute-selector';
import { VariantMatrix } from './variant-matrix';
import { toast } from 'sonner';
import { createCategoryAction } from '@/app/actions/category-actions';
import { createBrandAction } from '@/app/actions/brand-actions';
import { Edit2, Sparkles, Box, DollarSign, Sliders, Layers, CheckSquare, Plus, X } from 'lucide-react';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { ProductGalleryManager } from '@/components/admin/media/product-gallery-manager';

interface EditProductSheetProps {
  productId: string;
  productName: string;
  categories: { id: string; name: string; parentId?: string | null }[];
  brands: { id: string; name: string }[];
  trigger?: React.ReactNode;
}

export function EditProductSheet({
  productId,
  productName,
  categories,
  brands,
  trigger,
}: EditProductSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'basic' | 'attributes' | 'variants' | 'seo'>('basic');
  const [globalAttributes, setGlobalAttributes] = React.useState<any[]>([]);
  const [variantAttributeIds, setVariantAttributeIds] = React.useState<string[]>([]);

  // Local categories & brands lists
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

  // Product Basic States
  const [name, setName] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [costPrice, setCostPrice] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [galleryUrls, setGalleryUrls] = React.useState<string[]>([]);
  const [categoryId, setCategoryId] = React.useState('');
  const [brandId, setBrandId] = React.useState('');
  const [status, setStatus] = React.useState<'active' | 'draft' | 'archived'>('active');

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

  // Variant States
  const [selectedAttributeIds, setSelectedAttributeIds] = React.useState<string[]>([]);
  const [selectedValues, setSelectedValues] = React.useState<{ attributeId: string; valueIds: string[] }[]>([]);
  const [variantsList, setVariantsList] = React.useState<any[]>([]);
  const [existingVariants, setExistingVariants] = React.useState<any[]>([]);

  const [isPending, startTransition] = React.useTransition();

  // Load product and global attributes on sheet open
  React.useEffect(() => {
    if (!isOpen) return;

    startTransition(async () => {
      // 1. Fetch Global Attributes
      const attrRes = await getGlobalAttributesAction();
      if (attrRes.success && attrRes.data) {
        setGlobalAttributes(attrRes.data);
      }

      // 2. Fetch Product Config
      const prodRes = await getProductForEditAction(productId);
      if (prodRes.success && prodRes.data) {
        const { product, selectedAttributeIds: selAttrIds, selectedValues: selVals, variants } = prodRes.data;

        setName(product.name);
        setSku(product.sku || '');
        setPrice(parseFloat(product.price).toString());
        setCostPrice(product.costPrice ? parseFloat(product.costPrice).toString() : '');
        setDescription(product.description || '');
        setImageUrl(product.imageUrl || '');
        setGalleryUrls((product as any).galleryUrls || []);
        setCategoryId(product.categoryId || '');
        setBrandId(product.brandId || '');
        setStatus(product.status as any);

        setGender(product.gender || '');
        setMaterial(product.material || '');
        setFit(product.fit || '');
        setPattern(product.pattern || '');
        setSeason(product.season || '');
        setCollection(product.collection || '');
        setOccasion(product.occasion || '');
        setCareInstructions(product.careInstructions || '');
        setCountryOfOrigin(product.countryOfOrigin || '');

        setSelectedAttributeIds(selAttrIds);
        setSelectedValues(selVals);

        // Map existing variants
        const mappedExisting = variants.map((v: any) => ({
          id: v.id,
          sku: v.sku,
          barcode: v.barcode || '',
          price: parseFloat(v.price).toString(),
          compareAtPrice: v.compareAtPrice ? parseFloat(v.compareAtPrice).toString() : '',
          costPrice: v.costPrice ? parseFloat(v.costPrice).toString() : '',
          weight: v.weight ? parseFloat(v.weight).toString() : '',
          status: v.status as any,
          imageUrl: v.imageUrl || '',
          trackInventory: v.trackInventory,
          stock: v.stock,
          attributeValueIds: v.attributeValueIds,
          combinationLabel: '', // will be calculated in Matrix
        }));

        setExistingVariants(mappedExisting);
        setVariantsList(mappedExisting);
      } else {
        toast.error(prodRes.error || 'Failed to load product details.');
        setIsOpen(false);
      }
    });
  }, [isOpen, productId]);

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    startTransition(async () => {
      // 1. Update basic info & fashion specs
      const basicRes = await updateProductAction(productId, {
        name,
        description,
        price,
        costPrice: costPrice || null,
        sku,
        categoryId: categoryId || null,
        brandId: brandId || null,
        imageUrl,
        galleryUrls: galleryUrls.filter(Boolean),
        status,
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

      if (!basicRes.success) {
        toast.error(basicRes.error || 'Failed to save product basic info.');
        return;
      }

      // 2. Sync variants & attributes
      const syncRes = await syncVariantsAction(
        productId,
        selectedAttributeIds,
        selectedValues,
        variantsList
      );

      if (syncRes.success) {
        toast.success('Product details and variants synced successfully!');
        setIsOpen(false);
      } else {
        toast.error(syncRes.error || 'Failed to synchronize variants.');
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="outline"
            className="h-8 text-xs font-bold uppercase border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 px-3 bg-white cursor-pointer select-none"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Catalog
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        className="w-[90vw] max-w-[1000px] border-r border-slate-200 bg-white text-slate-900 p-0 flex flex-col h-full shadow-2xl"
      >
        <div className="p-6 border-b border-slate-200 bg-white flex-shrink-0">
          <SheetHeader>
            <SheetTitle className="text-lg font-extrabold text-slate-950 uppercase tracking-tight flex items-center gap-2 font-heading">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Shopify-style Variant Product Editor
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-600 font-medium mt-1">
              Configure parameters, mapping attributes, stock, cost & selling prices, and barcodes for {productName}.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Tabs switcher row */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-100/70 flex-shrink-0 gap-2 pt-2.5">
          {[
            { id: 'basic', label: 'Basic Details' },
            { id: 'attributes', label: 'Attributes & Specs' },
            { id: 'variants', label: 'Variants Matrix' },
            { id: 'seo', label: 'SEO & Organization' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-t-xl transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-slate-950 border-t-2 border-slate-950 border-x border-slate-200 -mb-px shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-5 max-w-2xl">
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
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Premium silk tailored silhouette..."
                  rows={4}
                  disabled={isPending}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 focus:bg-white outline-none font-medium resize-none"
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Selling Price ($)">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="299.99"
                      required
                      disabled={isPending}
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold pl-8"
                    />
                  </div>
                </FormField>

                <FormField label="Cost Price ($)">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.01"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="150.00"
                      disabled={isPending}
                      className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold pl-8"
                    />
                  </div>
                </FormField>

                <FormField label="Base SKU">
                  <Input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="SLK-EVN-001"
                    required
                    disabled={isPending}
                    className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
                  />
                </FormField>
              </div>

              {/* Profit & Margin Preview */}
              {Number(price) > 0 && Number(costPrice) > 0 && (
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950">Unit Margin:</span>
                    <span className="text-emerald-800 font-medium">
                      Profit ${(Number(price) - Number(costPrice)).toFixed(2)} per item
                    </span>
                  </div>
                  <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                    {(((Number(price) - Number(costPrice)) / Number(price)) * 100).toFixed(1)}% margin
                  </span>
                </div>
              )}

              <div className="pt-2">
                <ProductGalleryManager
                  primaryImage={imageUrl}
                  onPrimaryImageChange={setImageUrl}
                  galleryImages={galleryUrls}
                  onGalleryImagesChange={setGalleryUrls}
                  folder="products"
                  disabled={isPending}
                />
              </div>
            </div>
          )}

          {activeTab === 'attributes' && (
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
            />
          )}

          {activeTab === 'variants' && (
            <VariantMatrix
              globalAttributes={globalAttributes}
              selectedAttributeIds={selectedAttributeIds}
              selectedValues={selectedValues}
              variantAttributeIds={variantAttributeIds}
              baseSku={sku}
              basePrice={price}
              existingVariants={existingVariants}
              onChange={(list) => setVariantsList(list)}
            />
          )}

          {activeTab === 'seo' && (
            <div className="flex flex-col gap-5 max-w-2xl">
              <FormField label="Product Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isPending}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
                >
                  <option value="active">Active (Visible on Storefront)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="archived">Archived (Soft deleted)</option>
                </select>
              </FormField>

              {/* Category Field with Direct Add Option */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Catalog Category</label>
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
                    <option value="">Uncategorized</option>
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Catalog Brand</label>
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
                    <option value="">No Brand Mapping</option>
                    {brandsList.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                    <option value="__add_new__" className="font-bold text-indigo-600">
                      + Direct Add Brand...
                    </option>
                  </select>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="outline"
            className="h-10 px-4 text-xs font-bold uppercase border-slate-200 hover:bg-slate-50 cursor-pointer bg-white rounded"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="h-10 px-5 text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-900 cursor-pointer rounded flex items-center gap-1.5"
          >
            {isPending ? 'Saving Config...' : 'Save Product'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
