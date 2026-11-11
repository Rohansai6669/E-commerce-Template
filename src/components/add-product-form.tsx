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
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { toast } from 'sonner';
import { ShoppingBag, Sparkles, Sliders, Box } from 'lucide-react';

interface AddProductFormProps {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
}

export function AddProductForm({ categories, brands }: AddProductFormProps) {
  const router = useRouter();
  const [productType, setProductType] = React.useState<'simple' | 'variant'>('simple');
  const [isPending, startTransition] = React.useTransition();

  // Basic product details
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [sku, setSku] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [brandId, setBrandId] = React.useState('');

  // Global Attributes mapping
  const [globalAttributes, setGlobalAttributes] = React.useState<any[]>([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = React.useState<string[]>([]);
  const [selectedValues, setSelectedValues] = React.useState<{ attributeId: string; valueIds: string[] }[]>([]);
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
        sku,
        categoryId: categoryId || null,
        brandId: brandId || null,
        imageUrl: imageUrl || null,
        productType,
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
            stock: 0,
            status: 'active' as const,
            trackInventory: true,
            attributeValueIds: [],
          },
        ];

        const syncRes = await syncVariantsAction(newProductId, [], [], defaultVarList);
        if (syncRes.success) {
          toast.success('Simple product created successfully.');
          setName('');
          setDescription('');
          setPrice('');
          setSku('');
          setImageUrl('');
          setCategoryId('');
          setBrandId('');
          router.refresh();
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
          setSku('');
          setImageUrl('');
          setCategoryId('');
          setBrandId('');
          setSelectedAttributeIds([]);
          setSelectedValues([]);
          setVariantsList([]);
          router.refresh();
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
          placeholder="Premium silk tailored silhouette..."
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Base Price ($)">
          <Input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="299.99"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>

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
      </div>

      <ImagePreviewInput
        label="Primary Product Image (Cloudflare R2 or External URL)"
        value={imageUrl}
        onChange={setImageUrl}
        placeholder="https://example.com/image.jpg"
        aspectRatio="square"
        disabled={isPending}
        folder="products"
        description="Primary catalog photo for PDP and collections."
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Category">
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
          >
            <option value="">Select Category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Brand">
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-semibold"
          >
            <option value="">Select Brand...</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {/* Inline Variant Management Matrix */}
      {productType === 'variant' && (
        <div className="border border-slate-200 rounded-lg p-5 bg-slate-50/30 flex flex-col gap-6 mt-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sliders className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Configure Attributes & Matrix Rows
            </h4>
          </div>

          <AttributeSelector
            globalAttributes={globalAttributes}
            selectedAttributeIds={selectedAttributeIds}
            selectedValues={selectedValues}
            onChange={(ids, vals) => {
              setSelectedAttributeIds(ids);
              setSelectedValues(vals);
            }}
          />

          <VariantMatrix
            globalAttributes={globalAttributes}
            selectedAttributeIds={selectedAttributeIds}
            selectedValues={selectedValues}
            baseSku={sku}
            basePrice={price}
            onChange={(list) => setVariantsList(list)}
          />
        </div>
      )}

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
