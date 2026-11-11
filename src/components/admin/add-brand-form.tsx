'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createBrandAction } from '@/app/actions/brand-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { MediaUploader } from '@/components/admin/media-uploader';
import { toast } from 'sonner';
import { Tag, Globe, Sparkles } from 'lucide-react';

interface SupplierOption {
  id: string;
  name: string;
}

interface AddBrandFormProps {
  suppliers: SupplierOption[];
  onSuccess?: () => void;
}

export function AddBrandForm({ suppliers, onSuccess }: AddBrandFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [websiteUrl, setWebsiteUrl] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  const [bannerUrl, setBannerUrl] = React.useState('');
  const [selectedSupplierIds, setSelectedSupplierIds] = React.useState<string[]>([]);

  const handleToggleSupplier = (supId: string) => {
    setSelectedSupplierIds((prev) =>
      prev.includes(supId) ? prev.filter((id) => id !== supId) : [...prev, supId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Brand name is required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('websiteUrl', websiteUrl);
    formData.append('logoUrl', logoUrl);
    formData.append('bannerUrl', bannerUrl);

    selectedSupplierIds.forEach((sId) => formData.append('supplierIds', sId));

    startTransition(async () => {
      const res = await createBrandAction(formData);
      if (res.success) {
        toast.success('Brand created successfully!');
        setName('');
        setDescription('');
        setWebsiteUrl('');
        setLogoUrl('');
        setBannerUrl('');
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to create brand.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-3 text-slate-900 font-sans">
      <FormField label="Brand Name">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nike / Gucci"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
        />
      </FormField>

      <FormField label="Description">
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="High fashion luxury manufacturer brand details..."
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
        />
      </FormField>

      <FormField label="Official Website / Reference Link">
        <Input
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://brand.com"
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-xs font-mono"
        />
      </FormField>

      {/* Cloudflare R2 Media Uploaders */}
      <MediaUploader
        label="Brand Logo (Cloudflare R2)"
        value={logoUrl}
        onChange={(url) => setLogoUrl(url)}
        folder="brands/logos"
        helpText="Upload brand icon/logo image to Cloudflare R2."
      />

      <MediaUploader
        label="Brand Cover Banner (Cloudflare R2)"
        value={bannerUrl}
        onChange={(url) => setBannerUrl(url)}
        folder="brands/banners"
        helpText="Upload brand header banner image to Cloudflare R2."
      />

      {/* Fulfilling Suppliers */}
      <FormField label="Authorized Fulfilling Suppliers">
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded bg-slate-50/80">
          {suppliers.map((sup) => (
            <label key={sup.id} className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSupplierIds.includes(sup.id)}
                onChange={() => handleToggleSupplier(sup.id)}
                className="rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950 cursor-pointer"
              />
              {sup.name}
            </label>
          ))}
          {suppliers.length === 0 && <span className="text-xs text-slate-400 italic">No active suppliers found.</span>}
        </div>
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
      >
        <Tag className="w-4 h-4" /> {isPending ? 'Creating...' : 'Create Brand'}
      </Button>
    </form>
  );
}
export default AddBrandForm;
