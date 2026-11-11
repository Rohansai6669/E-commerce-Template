'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerAddressSchema, type CustomerAddressFormValues } from '@/core/address/address.validation';
import { type CustomerAddress } from '@/core/address/address.types';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/forms/select';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { createAddressAction, updateAddressAction, deleteAddressAction, setDefaultAddressAction } from '@/app/actions/account';
import { AddressPresenter } from '@/core/address/address.presenter';
import { toast } from 'sonner';

export interface AddressBookProps {
  initialAddresses: CustomerAddress[];
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
];

/**
 * Saved address list and Address creation/editing modal forms.
 */
export function AddressBook({ initialAddresses }: AddressBookProps) {
  const [addresses, setAddresses] = React.useState<CustomerAddress[]>(initialAddresses);
  const [editingAddress, setEditingAddress] = React.useState<CustomerAddress | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isDeletingId, setIsDeletingId] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerAddressFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(customerAddressSchema) as any,
  });

  const handleOpenAdd = () => {
    reset({
      firstName: '',
      lastName: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      isDefault: false,
    });
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    reset({
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (data: CustomerAddressFormValues) => {
    try {
      if (editingAddress) {
        // Update Address action
        const result = await updateAddressAction(editingAddress.id, data);
        if (result.success && result.address) {
          setAddresses((prev) =>
            prev.map((a) => (a.id === result.address!.id ? result.address! : result.address!.isDefault ? { ...a, isDefault: false } : a))
          );
          toast.success('Address updated successfully!');
          setIsFormOpen(false);
        } else {
          toast.error(result.error ?? 'Failed to update address.');
        }
      } else {
        // Create Address action
        const result = await createAddressAction(data);
        if (result.success && result.address) {
          setAddresses((prev) =>
            result.address!.isDefault
              ? [...prev.map((a) => ({ ...a, isDefault: false })), result.address!]
              : [...prev, result.address!]
          );
          toast.success('Address created successfully!');
          setIsFormOpen(false);
        } else {
          toast.error(result.error ?? 'Failed to create address.');
        }
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeletingId(id);
    try {
      const result = await deleteAddressAction(id);
      if (result.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success('Address deleted successfully!');
      } else {
        toast.error(result.error ?? 'Failed to delete address.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setIsDeletingId(null);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const result = await setDefaultAddressAction(id);
      if (result.success) {
        setAddresses((prev) =>
          prev.map((a) => ({ ...a, isDefault: a.id === id }))
        );
        toast.success('Primary address updated!');
      } else {
        toast.error(result.error ?? 'Failed to set default address.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Stack gap="5" className="w-full">
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <Heading level={2} className="text-base font-bold tracking-tight font-heading">
            Saved Addresses
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
            Add and manage your shipping destinations.
          </Text>
        </div>
        <Button onClick={handleOpenAdd} size="sm" className="font-bold text-xs uppercase cursor-pointer">
          <Icon name="Plus" className="h-4 w-4 mr-1.5" />
          Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="border-border bg-card shadow-xs text-center py-12">
          <CardContent className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground/60 mb-4">
              <Icon name="MapPin" className="h-6 w-6" />
            </div>
            <Text className="text-sm font-bold text-foreground">No address book details saved.</Text>
            <Text className="text-xs text-muted-foreground mt-1 max-w-xs">
              Add your shipping address now to speed up checkout on your future orders.
            </Text>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card
              key={address.id}
              className={`border-border bg-card shadow-xs relative flex flex-col justify-between ${
                address.isDefault ? 'border-primary ring-1 ring-primary/20' : ''
              }`}
            >
              <CardContent className="p-5 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <Text className="text-sm font-bold text-foreground">
                    {address.firstName} {address.lastName}
                  </Text>
                  {address.isDefault && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                      Primary
                    </span>
                  )}
                </div>

                <Text className="text-xs text-muted-foreground mt-2 whitespace-pre-line leading-relaxed">
                  {AddressPresenter.formatAddressBlock(address)}
                </Text>
                <Text className="text-[11px] text-muted-foreground mt-2 font-mono">
                  {address.phone}
                </Text>
              </CardContent>

              <div className="px-5 pb-5 pt-0 flex flex-wrap items-center justify-between border-t border-border/40 pt-4 gap-2">
                {!address.isDefault ? (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Set as default
                  </button>
                ) : (
                  <div className="h-4" />
                )}

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(address)}
                    className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="Pencil" className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={isDeletingId === address.id}
                    className="text-xs font-bold text-destructive hover:text-destructive/80 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Icon name="Trash2" className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Address Form Dialog modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-base font-bold font-heading">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </DialogTitle>
          </DialogHeader>

          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <form onSubmit={handleSubmit(handleSave as any)} noValidate className="mt-2">
            <Stack gap="4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" error={errors.firstName?.message} id="firstName">
                  <Input id="firstName" {...register('firstName')} />
                </FormField>
                <FormField label="Last Name" error={errors.lastName?.message} id="lastName">
                  <Input id="lastName" {...register('lastName')} />
                </FormField>
              </div>

              <FormField label="Phone Number" error={errors.phone?.message} id="phone">
                <Input id="phone" {...register('phone')} />
              </FormField>

              <FormField label="Address Line 1" error={errors.addressLine1?.message} id="addressLine1">
                <Input id="addressLine1" {...register('addressLine1')} />
              </FormField>

              <FormField label="Address Line 2" id="addressLine2" description="Optional">
                <Input id="addressLine2" {...register('addressLine2')} />
              </FormField>

              <div className="grid grid-cols-3 gap-3">
                <FormField label="City" error={errors.city?.message} id="city">
                  <Input id="city" {...register('city')} />
                </FormField>
                <FormField label="State" error={errors.state?.message} id="state">
                  <Input id="state" {...register('state')} />
                </FormField>
                <FormField label="Zip" error={errors.postalCode?.message} id="postalCode">
                  <Input id="postalCode" {...register('postalCode')} />
                </FormField>
              </div>

              <FormField label="Country" error={errors.country?.message} id="country">
                <Select id="country" {...register('country')}>
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </Select>
              </FormField>

              <label className="flex items-center gap-2 mt-1 cursor-pointer">
                <input type="checkbox" {...register('isDefault')} className="rounded border-border h-4 w-4 bg-background" />
                <span className="text-xs font-semibold text-foreground select-none">Set as primary address</span>
              </label>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} className="font-bold text-xs uppercase cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="font-bold text-xs uppercase cursor-pointer">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </Stack>
          </form>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
export default AddressBook;
