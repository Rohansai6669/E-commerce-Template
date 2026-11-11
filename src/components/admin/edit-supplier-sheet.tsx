'use client';

import * as React from 'react';
import { updateSupplierDetailsAction } from '@/app/actions/supplier-actions';
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
import { toast } from 'sonner';
import { Edit, MapPin, Building2, Phone, Mail, Percent, ShieldCheck } from 'lucide-react';

interface SupplierItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  commissionRate: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
}

interface SupplierAddressItem {
  id?: string;
  supplierId?: string;
  contactName?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string | null;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface EditSupplierSheetProps {
  supplier: SupplierItem;
  address?: SupplierAddressItem | null;
}

export function EditSupplierSheet({ supplier, address }: EditSupplierSheetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  // Boutique Info State
  const [name, setName] = React.useState(supplier.name);
  const [email, setEmail] = React.useState(supplier.email);
  const [phone, setPhone] = React.useState(supplier.phone || '');
  const [commissionRate, setCommissionRate] = React.useState(supplier.commissionRate);
  const [status, setStatus] = React.useState(supplier.status);

  // Address State
  const [contactName, setContactName] = React.useState(address?.contactName || supplier.name);
  const [addressPhone, setAddressPhone] = React.useState(address?.phone || supplier.phone || '');
  const [addressLine1, setAddressLine1] = React.useState(address?.addressLine1 || '');
  const [addressLine2, setAddressLine2] = React.useState(address?.addressLine2 || '');
  const [city, setCity] = React.useState(address?.city || '');
  const [state, setState] = React.useState(address?.state || '');
  const [country, setCountry] = React.useState(address?.country || 'India');
  const [postalCode, setPostalCode] = React.useState(address?.postalCode || '');

  React.useEffect(() => {
    setName(supplier.name);
    setEmail(supplier.email);
    setPhone(supplier.phone || '');
    setCommissionRate(supplier.commissionRate);
    setStatus(supplier.status);

    setContactName(address?.contactName || supplier.name);
    setAddressPhone(address?.phone || supplier.phone || '');
    setAddressLine1(address?.addressLine1 || '');
    setAddressLine2(address?.addressLine2 || '');
    setCity(address?.city || '');
    setState(address?.state || '');
    setCountry(address?.country || 'India');
    setPostalCode(address?.postalCode || '');
  }, [supplier, address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      toast.error('Boutique name and email are required.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('email', email.trim());
    formData.append('phone', phone);
    formData.append('commissionRate', commissionRate);
    formData.append('status', status);

    formData.append('contactName', contactName);
    formData.append('addressPhone', addressPhone);
    formData.append('addressLine1', addressLine1);
    formData.append('addressLine2', addressLine2);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('country', country);
    formData.append('postalCode', postalCode);

    startTransition(async () => {
      const res = await updateSupplierDetailsAction(supplier.id, formData);
      if (res.success) {
        toast.success(`Supplier details & address updated successfully!`);
        setIsOpen(false);
      } else {
        toast.error(res.error || 'Failed to update supplier details');
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="h-8 text-xs border-slate-200 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer rounded flex items-center gap-1"
        >
          <Edit className="w-3.5 h-3.5" /> Edit Details & Address
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] max-w-[640px] border-l border-slate-200 bg-white p-0 flex flex-col h-full text-slate-900 font-sans">
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <SheetHeader>
            <SheetTitle className="text-lg font-bold text-slate-900 flex items-center gap-2 font-heading">
              <Building2 className="w-5 h-5 text-slate-900" /> Edit Boutique Profile & Pickup Address
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-500">
              Update boutique details, account status, commission margin, and pickup location for {supplier.name}.
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Section 1: Boutique Profile */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-600" /> Boutique Profile & Margin
            </h4>

            <FormField label="Boutique Name">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Acme Luxury Attire"
                required
                disabled={isPending}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-sm font-semibold"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email Address">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@boutique.com"
                  required
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-sm font-medium"
                />
              </FormField>

              <FormField label="Contact Phone">
                <Input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-sm font-medium"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Commission Rate (%)">
                <Input
                  type="number"
                  step="0.01"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  placeholder="10.00"
                  required
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-sm font-bold"
                />
              </FormField>

              <FormField label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  disabled={isPending}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold uppercase"
                >
                  <option value="active">Active (Verified)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended</option>
                  <option value="rejected">Rejected</option>
                  <option value="archived">Archived</option>
                </select>
              </FormField>
            </div>
          </div>

          {/* Section 2: Pickup & Fulfillment Address */}
          <div className="flex flex-col gap-4 border-t border-slate-100 pt-5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Pickup & Consignment Dispatch Address
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Contact Person Name">
                <Input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Dispatch Manager"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
                />
              </FormField>

              <FormField label="Pickup Phone Number">
                <Input
                  type="text"
                  value={addressPhone}
                  onChange={(e) => setAddressPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
                />
              </FormField>
            </div>

            <FormField label="Address Line 1 (Building, Street)">
              <Input
                type="text"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="123 Fashion Avenue, Suite 400"
                disabled={isPending}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
              />
            </FormField>

            <FormField label="Address Line 2 (Landmark, Floor)">
              <Input
                type="text"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="Near Central Mall"
                disabled={isPending}
                className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="City">
                <Input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mumbai"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
                />
              </FormField>

              <FormField label="State / Province">
                <Input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Country">
                <Input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-medium"
                />
              </FormField>

              <FormField label="Postal / ZIP Code">
                <Input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="400001"
                  disabled={isPending}
                  className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 h-10 text-xs font-mono font-bold"
                />
              </FormField>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
            <Button
              type="button"
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="h-10 px-4 text-xs font-bold uppercase border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer bg-white rounded"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-10 px-5 text-xs font-bold uppercase bg-slate-950 text-white hover:bg-slate-900 cursor-pointer rounded flex items-center gap-1.5"
            >
              {isPending ? 'Saving...' : 'Save Boutique Details'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
