'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { updateCustomerAction, toggleCustomerStatusAction } from '@/app/actions/customer-actions';
import { AdminFormSheet } from '@/components/admin/admin-form-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { MediaUploader } from '@/components/admin/media-uploader';
import { toast } from 'sonner';
import { Edit2, ShieldAlert, CheckCircle2, Save } from 'lucide-react';

interface CustomerItem {
  id: string;
  fullName: string | null;
  email: string | null;
  phone?: string | null;
  role: string;
  avatarUrl?: string | null;
  createdAt: Date;
  isActive: boolean;
}

interface EditCustomerSheetProps {
  customer: CustomerItem;
}

export function EditCustomerSheet({ customer }: EditCustomerSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();

  const [fullName, setFullName] = React.useState(customer.fullName || '');
  const [email, setEmail] = React.useState(customer.email || '');
  const [phone, setPhone] = React.useState(customer.phone || '');
  const [role, setRole] = React.useState(customer.role || 'customer');
  const [isActive, setIsActive] = React.useState(customer.isActive);
  const [avatarUrl, setAvatarUrl] = React.useState(customer.avatarUrl || '');

  React.useEffect(() => {
    setFullName(customer.fullName || '');
    setEmail(customer.email || '');
    setPhone(customer.phone || '');
    setRole(customer.role || 'customer');
    setIsActive(customer.isActive);
    setAvatarUrl(customer.avatarUrl || '');
  }, [customer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('isActive', String(isActive));
    formData.append('avatarUrl', avatarUrl);

    startTransition(async () => {
      const res = await updateCustomerAction(customer.id, formData);
      if (res.success) {
        toast.success('Customer profile updated successfully!');
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || 'Failed to update customer profile.');
      }
    });
  };

  return (
    <AdminFormSheet
      open={isOpen}
      onOpenChange={setIsOpen}
      title="Edit Customer Account"
      description={`Manage profile parameters and role authorizations for ${customer.fullName || customer.email}.`}
      trigger={
        <Button
          type="button"
          className="h-8 w-8 p-0 bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:bg-slate-50 rounded flex items-center justify-center cursor-pointer border-solid shrink-0"
          title="Edit customer account"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-3 text-slate-900 font-sans">
        <FormField label="Full Name">
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-semibold"
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isPending}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isPending}
              className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="User Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold uppercase"
            >
              <option value="customer">CUSTOMER</option>
              <option value="supplier">SUPPLIER</option>
              <option value="staff">STAFF</option>
              <option value="admin">ADMIN</option>
            </select>
          </FormField>

          <FormField label="Account Status">
            <select
              value={String(isActive)}
              onChange={(e) => setIsActive(e.target.value === 'true')}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold"
            >
              <option value="true">ACTIVE</option>
              <option value="false">INACTIVE / BLOCKED</option>
            </select>
          </FormField>
        </div>

        <MediaUploader
          label="Avatar / Profile Photo (Cloudflare R2)"
          value={avatarUrl}
          onChange={(url) => setAvatarUrl(url)}
          folder="avatars"
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
        >
          <Save className="w-4 h-4" /> {isPending ? 'Saving...' : 'Save Profile Changes'}
        </Button>
      </form>
    </AdminFormSheet>
  );
}
export default EditCustomerSheet;
