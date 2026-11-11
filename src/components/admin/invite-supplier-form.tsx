'use client';

import * as React from 'react';
import { inviteSupplierAction } from '@/app/actions/supplier-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { toast } from 'sonner';
import { Mail, Copy, CheckCircle2, Send, Sparkles } from 'lucide-react';

interface BrandOption {
  id: string;
  name: string;
}

interface InviteSupplierFormProps {
  brands: BrandOption[];
  onSuccess?: () => void;
}

export function InviteSupplierForm({ brands, onSuccess }: InviteSupplierFormProps) {
  const [isPending, startTransition] = React.useTransition();

  const [supplierName, setSupplierName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [commissionRate, setCommissionRate] = React.useState('10.00');
  const [selectedBrandIds, setSelectedBrandIds] = React.useState<string[]>([]);
  const [inviteLink, setInviteLink] = React.useState<string | null>(null);

  const handleToggleBrand = (brandId: string) => {
    setSelectedBrandIds((prev) =>
      prev.includes(brandId) ? prev.filter((id) => id !== brandId) : [...prev, brandId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierName.trim() || !email.trim()) {
      toast.error('Boutique name and email are required.');
      return;
    }

    const formData = new FormData();
    formData.append('supplierName', supplierName);
    formData.append('email', email);
    formData.append('commissionRate', commissionRate);
    selectedBrandIds.forEach((bId) => formData.append('brandIds', bId));

    startTransition(async () => {
      const res = await inviteSupplierAction(formData);
      if (res.success && res.inviteLink) {
        const fullUrl = `${window.location.origin}${res.inviteLink}`;
        setInviteLink(fullUrl);
        toast.success('Supplier invitation link generated!');
        onSuccess?.();
      } else {
        toast.error(res.error || 'Failed to generate invitation link.');
      }
    });
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
    toast.success('Invitation link copied to clipboard!');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-3 text-slate-900 font-sans">
      <FormField label="Boutique / Supplier Name">
        <Input
          type="text"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
          placeholder="e.g. Paris Fashion Boutique"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
        />
      </FormField>

      <FormField label="Supplier Email Address">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="owner@boutique.com"
          required
          disabled={isPending}
          className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
        />
      </FormField>

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

      <FormField label="Authorized Brands to Fulfill">
        <div className="flex flex-col gap-2 max-h-36 overflow-y-auto p-3 border border-slate-200 rounded bg-slate-50">
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
        </div>
      </FormField>

      {inviteLink && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col gap-2">
          <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Supplier Invitation Link Generated
          </span>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              readOnly
              value={inviteLink}
              className="bg-white border-emerald-300 text-slate-900 text-xs font-mono h-9 truncate"
            />
            <Button
              type="button"
              onClick={handleCopyLink}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold h-9 px-3 shrink-0 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 mr-1" /> Copy Link
            </Button>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
      >
        <Send className="w-4 h-4" /> {isPending ? 'Generating Link...' : 'Generate Supplier Invite Link'}
      </Button>
    </form>
  );
}
export default InviteSupplierForm;
