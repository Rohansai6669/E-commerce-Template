'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createCategoryAction } from '@/app/actions/category-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { ImagePreviewInput } from '@/components/ui/image-preview-input';
import { toast } from 'sonner';
import { Plus, Loader2 } from 'lucide-react';

interface ParentCategoryOption {
  id: string;
  name: string;
  parentId?: string | null;
  parentName?: string | null;
}

interface AddCategoryFormProps {
  availableParents: ParentCategoryOption[];
  onSuccess?: () => void;
}

export function AddCategoryForm({ availableParents, onSuccess }: AddCategoryFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [parentId, setParentId] = React.useState('none');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');

  const tier1Categories = React.useMemo(
    () => availableParents.filter((p) => !p.parentId),
    [availableParents]
  );

  const tier2Subcategories = React.useMemo(
    () => availableParents.filter((p) => !!p.parentId),
    [availableParents]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Category name is required.');
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set('name', name.trim());
      formData.set('parentId', parentId);
      if (description.trim()) {
        formData.set('description', description.trim());
      }
      if (imageUrl.trim()) {
        formData.set('imageUrl', imageUrl.trim());
      }

      const res = await createCategoryAction(formData);
      if (res.success) {
        toast.success(`Category "${name}" created successfully with media!`);
        setName('');
        setDescription('');
        setImageUrl('');
        setParentId('none');
        router.refresh();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || 'Failed to create category.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
      <FormField label="Classification Hierarchy (Parent or Subcategory)">
        <div className="relative">
          <select
            id="parentId"
            name="parentId"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            disabled={isPending}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-medium"
          >
            <option value="none">📁 Top-Level Category (Tier 1: e.g. Men, Women, Kids, Accessories)</option>
            {tier1Categories.length > 0 && (
              <optgroup label="Select Category (to create a Tier 2 Subcategory):">
                {tier1Categories.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    ↳ Subcategory under: {parent.name}
                  </option>
                ))}
              </optgroup>
            )}
            {tier2Subcategories.length > 0 && (
              <optgroup label="Select Subcategory (to create a Tier 3 Child Category):">
                {tier2Subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    ↳ ↳ Child category under: {sub.parentName ? `${sub.parentName} > ` : ''}{sub.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Leave as Top-Level for main departments, or pick a parent to create a subcategory like <em>T-Shirts</em> under <em>Men</em>.
        </p>
      </FormField>

      <FormField label="Category / Subcategory Name">
        <Input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Graphic T-Shirts, Hoodies, or Street Wear"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
        />
      </FormField>

      <FormField label="Description (Optional)">
        <Input
          id="description"
          name="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description of this collection or category"
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
        />
      </FormField>

      <FormField label="Category Featured Image / Cover Photo">
        <ImagePreviewInput
          name="imageUrl"
          value={imageUrl}
          onChange={setImageUrl}
          placeholder="Upload photo, paste URL, or pick from Media Storage"
          aspectRatio="square"
          folder="categories"
          description="Upload via Cloudflare R2, choose from media storage, or paste a high-res image URL. This image dynamically appears in the mega menu banner, category headers, and mobile drawers."
        />
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-4 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving Taxonomy Item...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Save Taxonomy Item
          </>
        )}
      </Button>
    </form>
  );
}

