'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createCustomerAction } from '@/app/actions/customer-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/form-field';
import { MediaUploader } from '@/components/admin/media-uploader';
import { toast } from 'sonner';
import { UserPlus, Shield, Mail, Phone, UserCheck } from 'lucide-react';

interface AddCustomerFormProps {
  onSuccess?: () => void;
  redirectOnSuccess?: string;
}

export function AddCustomerForm({ onSuccess, redirectOnSuccess }: AddCustomerFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [role, setRole] = React.useState<'customer' | 'staff' | 'admin' | 'supplier'>('customer');
  const [isActive, setIsActive] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email address is required.');
      return;
    }

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('role', role);
    formData.append('isActive', String(isActive));
    formData.append('avatarUrl', avatarUrl);

    startTransition(async () => {
      const res = await createCustomerAction(formData);
      if (res.success) {
        toast.success('User account registered successfully!');
        setFullName('');
        setEmail('');
        setPhone('');
        setAvatarUrl('');
        onSuccess?.();
        if (redirectOnSuccess) {
          router.push(redirectOnSuccess);
        } else {
          router.refresh();
        }
      } else {
        toast.error(res.error || 'Failed to create user account.');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-3 text-slate-900 font-sans">
      <FormField label="Full Name">
        <Input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="e.g. John Doe"
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
            placeholder="john@example.com"
            required
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
          />
        </FormField>

        <FormField label="Phone Number">
          <Input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            disabled={isPending}
            className="bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-950 focus:bg-white h-10 text-sm font-medium"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="User Role">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            disabled={isPending}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold uppercase"
          >
            <option value="customer">Customer (Storefront Buyer)</option>
            <option value="supplier">Supplier (Boutique Partner)</option>
            <option value="staff">Staff Member</option>
            <option value="admin">Administrator</option>
          </select>
        </FormField>

        <FormField label="Account Status">
          <select
            value={String(isActive)}
            onChange={(e) => setIsActive(e.target.value === 'true')}
            disabled={isPending}
            className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 focus:border-slate-950 outline-none cursor-pointer h-10 font-bold"
          >
            <option value="true">Active (Granted Access)</option>
            <option value="false">Inactive / Suspended</option>
          </select>
        </FormField>
      </div>

      {/* Cloudflare R2 Avatar Photo Uploader */}
      <MediaUploader
        label="Avatar / Profile Photo (Cloudflare R2)"
        value={avatarUrl}
        onChange={(url) => setAvatarUrl(url)}
        folder="avatars"
        helpText="Upload user avatar image to Cloudflare R2."
      />

      <Button
        type="submit"
        disabled={isPending}
        className="w-full mt-2 font-bold cursor-pointer h-10 bg-slate-950 text-white hover:bg-slate-900 rounded uppercase text-xs flex items-center justify-center gap-1.5"
      >
        <UserPlus className="w-4 h-4" /> {isPending ? 'Registering...' : 'Register Customer Account'}
      </Button>
    </form>
  );
}
export default AddCustomerForm;
