'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createSupplierAction } from '@/app/actions/supplier-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { MediaUploader } from '@/components/admin/media-uploader';
import { toast } from 'sonner';
import { Building2, Percent, Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';

interface BrandOption {
  id: string;
  name: string;
}

interface AddSupplierFormProps {
  brands: BrandOption[];
  onSuccess?: () => void;
}

export function AddSupplierForm({ brands, onSuccess }: AddSupplierFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [commissionRate, setCommissionRate] = React.useState('10.00');
  const [taxId, setTaxId] = React.useState('');
  const [logoUrl, setLogoUrl] = React.useState('');
  
  // Address details
  const [addressLine1, setAddressLine1] = React.useState('');
  const [city, setCity] = React.useState('Mumbai');
  const [state, setState] = React.useState('Maharashtra');
  const [country, setCountry] = React.useState('India');
  const [postalCode, setPostalCode] = React.useState('');

  // Selected brands
  const [selectedBrandIds, setSelectedBrandIds] = React.useState<string[]>([]);

  const handleToggleBrand = (brandId: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Boutique name and contact email are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('commissionRate', commissionRate);
    formData.append('taxId', taxId);
    formData.append('logoUrl', logoUrl);
    formData.append('addressLine1', addressLine1);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('postalCode', postalCode);

    selectedBrandIds.forEach((bId) => formData.append('brandIds', bId));

    startTransition(async () => {
      const res = await createSupplierAction(formData);
      if (res.success) {
        toast.success('Supplier boutique registered successfully!');
        setName('');
        setEmail('');
        setPhone('');
        setLogoUrl('');
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to register boutique.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-3 text-slate-900 font-sans">
      <FormField label="Boutique / Supplier Name">
        <Input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Milan Luxury Boutique"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Contact Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@boutique.com"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
          />
        </FormField>

        <FormField label="Contact Phone">
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="Default Commission Rate (%)">
          <Input
            type="number"
            step="0.01"
            value={commissionRate}
            onChange={(e) => setCommissionRate(e.target.value)}
            placeholder="10.00"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>

        <FormField label="GSTIN / Tax Registration ID">
          <Input
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="27AAAAA0000A1Z5"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-mono"
          />
        </FormField>
      </div>

      {/* Cloudflare R2 Logo Uploader */}
      <MediaUploader
        label="Boutique Logo / Document Media (Cloudflare R2)"
        value={logoUrl}
        onChange={(url) => setLogoUrl(url)}
        folder="suppliers"
        helpText="Upload brand boutique logo or registration document directly to Cloudflare R2."
      />

      {/* Address & Location details */}
      <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50 flex flex-col gap-4">
        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-700" /> Fulfillment Address Details
        </span>

        <FormField label="Address Line 1">
          <Input
            type="text"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            placeholder="Unit 102, Fashion District"
            disabled={isPending}
            className="bg-white border-slate-200 text-slate-900 h-9 text-xs"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="City">
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Mumbai"
              disabled={isPending}
              className="bg-white border-slate-200 text-slate-900 h-9 text-xs"
            />
          </FormField>
          <FormField label="Postal Code">
            <Input
              type="text"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="400001"
              disabled={isPending}
              className="bg-white border-slate-200 text-slate-900 h-9 text-xs font-mono"
            />
          </FormField>
        </div>
      </div>

      {/* Brand Fulfillment Permissions */}
      <FormField label="Authorized Brands to Fulfill">
        <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-3 border border-slate-200 rounded bg-slate-50/80">
          {brands.map((brand) => (
            <label key={brand.id} className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={selectedBrandIds.includes(brand.id)}
                onChange={() => handleToggleBrand(brand.id)}
                className="rounded border-slate-300 text-slate-950 focus:ring-slate-950 accent-slate-950 cursor-pointer"
              />
              {brand.name}
            </label>
          ))}
          {brands.length === 0 && <span className="text-xs text-slate-400 italic">No registered brands found.</span>}
        </div>
      </FormField>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
      >
        <Building2 className="w-4 h-4" /> {isPending ? 'Registering...' : 'Register Supplier Boutique'}
      </Button>
    </form>
  );
}
export default AddSupplierForm;
