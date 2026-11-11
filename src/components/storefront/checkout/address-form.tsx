'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormValues } from '@/core/checkout/address.validation';
import { type CheckoutAddress } from '@/core/checkout/checkout.types';
import { type CustomerAddress } from '@/core/address/address.types';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/forms/select';
import { Button } from '@/components/ui/button';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  MapPin,
  Plus,
  Check,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Phone,
  Mail,
  BookmarkCheck,
  ShieldCheck,
} from 'lucide-react';
import { createAddressAction } from '@/app/actions/account';
import { toast } from 'sonner';

export interface AddressFormProps {
  defaultValues?: CheckoutAddress | null;
  savedAddresses?: CustomerAddress[];
  user?: { id: string; email: string } | null;
  profile?: { fullName?: string | null; phone?: string | null } | null;
  onSubmit: (address: CheckoutAddress) => void;
  onAddressSaved?: (newAddress: CustomerAddress) => void;
}

const COUNTRIES = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'AE', label: 'United Arab Emirates' },
  { value: 'SG', label: 'Singapore' },
];

/**
 * Address Step Component supporting:
 * 1. Selecting from existing saved account addresses.
 * 2. Adding a new address with an option to automatically sync it to the customer's account address book.
 * 3. Pre-filling customer information from their profile.
 */
export function AddressForm({
  defaultValues,
  savedAddresses = [],
  user,
  profile,
  onSubmit,
  onAddressSaved,
}: AddressFormProps) {
  const [selectedAddressId, setSelectedAddressId] = React.useState<string | null>(() => {
    if (savedAddresses.length === 0) return null;
    // Check if defaultValues matches an existing saved address
    if (defaultValues?.addressLine1) {
      const match = savedAddresses.find(
        (a) =>
          a.addressLine1.toLowerCase() === defaultValues.addressLine1.toLowerCase() &&
          a.postalCode === defaultValues.postalCode
      );
      if (match) return match.id;
    }
    const defaultAddr = savedAddresses.find((a) => a.isDefault);
    return defaultAddr ? defaultAddr.id : savedAddresses[0].id;
  });

  const [isAddingNew, setIsAddingNew] = React.useState(savedAddresses.length === 0);
  const [saveToAccount, setSaveToAccount] = React.useState(!!user);
  const [makeDefault, setMakeDefault] = React.useState(savedAddresses.length === 0);
  const [isSaving, setIsSaving] = React.useState(false);

  // Parse first and last name from profile if available
  const profileNames = React.useMemo(() => {
    if (!profile?.fullName) return { first: '', last: '' };
    const parts = profile.fullName.trim().split(/\s+/);
    return {
      first: parts[0] || '',
      last: parts.slice(1).join(' ') || '',
    };
  }, [profile]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addressSchema) as any,
    defaultValues: (defaultValues || {
      firstName: profileNames.first || '',
      lastName: profileNames.last || '',
      email: user?.email || '',
      phone: profile?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'IN',
    }) as AddressFormValues,
  });

  // Handle selection of an existing saved address
  const handleSelectSavedAddress = (saved: CustomerAddress) => {
    setSelectedAddressId(saved.id);
  };

  const handleContinueWithSaved = () => {
    const selected = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!selected) {
      toast.error('Please select an address to proceed.');
      return;
    }

    const checkoutAddr: CheckoutAddress = {
      firstName: selected.firstName,
      lastName: selected.lastName,
      email: user?.email || defaultValues?.email || '',
      phone: selected.phone,
      addressLine1: selected.addressLine1,
      addressLine2: selected.addressLine2 || '',
      city: selected.city,
      state: selected.state,
      postalCode: selected.postalCode,
      country: selected.country,
    };

    onSubmit(checkoutAddr);
  };

  // Handle submission of a brand new address
  const onNewAddressSubmit = async (data: AddressFormValues) => {
    setIsSaving(true);
    try {
      // If user is authenticated and "save to account" is checked, persist to database address book
      if (user && saveToAccount) {
        try {
          const res = await createAddressAction({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || '',
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            isDefault: makeDefault,
          });

          if (res.success && res.address) {
            toast.success('Address saved to your address book!');
            if (onAddressSaved) {
              onAddressSaved(res.address);
            }
          }
        } catch (saveErr) {
          console.warn('Could not sync address to account:', saveErr);
        }
      }

      onSubmit(data as CheckoutAddress);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-5 border-b border-border bg-muted/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Heading level={2} className="text-base font-bold tracking-tight font-heading flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Shipping & Delivery Address
          </Heading>
          <Text className="text-xs text-muted-foreground mt-0.5 font-sans">
            {savedAddresses.length > 0 && !isAddingNew
              ? 'Select from your saved addresses or add a new delivery location.'
              : 'Please enter the delivery address for this order.'}
          </Text>
        </div>

        {savedAddresses.length > 0 && (
          <Button
            type="button"
            variant={isAddingNew ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
          >
            {isAddingNew ? (
              <span className="flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                Saved Addresses ({savedAddresses.length})
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add New Address
              </span>
            )}
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {/* VIEW A: Saved Addresses Grid */}
        {savedAddresses.length > 0 && !isAddingNew ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {savedAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => handleSelectSavedAddress(addr)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                        : 'border-border hover:border-foreground/40 bg-card'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-foreground">
                            {addr.firstName} {addr.lastName}
                          </span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                              Default
                            </span>
                          )}
                        </div>

                        {/* Selection check indicator */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-border bg-muted/20'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground leading-relaxed">
                        <p>{addr.addressLine1}</p>
                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                        <p>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="font-medium text-foreground/80 mt-1">{addr.country}</p>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" />
                        {addr.phone}
                      </span>
                      {isSelected ? (
                        <span className="text-primary font-bold text-[11px] uppercase tracking-wider">
                          Selected
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[11px] font-medium group-hover:text-foreground">
                          Click to select
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Email prompt if not present in saved card */}
            {!user?.email && (
              <div className="p-4 rounded-lg border border-border bg-muted/10 space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Order Confirmation Email
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  defaultValue={defaultValues?.email || ''}
                  onChange={(e) => setValue('email', e.target.value)}
                  className="bg-card text-xs"
                />
                <Text className="text-[11px] text-muted-foreground">
                  Your receipt and live tracking updates will be delivered here.
                </Text>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddingNew(true)}
                className="w-full sm:w-auto text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                + Add Another Address
              </Button>

              <Button
                type="button"
                onClick={handleContinueWithSaved}
                disabled={!selectedAddressId}
                className="w-full sm:w-auto font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 h-10 px-6 shadow-sm"
              >
                <span>Deliver to this Address</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* VIEW B: Enter New Address Form */
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <form onSubmit={handleSubmit(onNewAddressSubmit as any)} noValidate>
            <Stack gap="4">
              {/* Name row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="First Name" error={errors.firstName?.message} id="firstName">
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                </FormField>
                <FormField label="Last Name" error={errors.lastName?.message} id="lastName">
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                </FormField>
              </div>

              {/* Contact row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Email Address" error={errors.email?.message} id="email">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                </FormField>
                <FormField label="Phone Number" error={errors.phone?.message} id="phone">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    {...register('phone')}
                    className={errors.phone ? 'border-destructive' : ''}
                  />
                </FormField>
              </div>

              {/* Address Lines */}
              <FormField label="Street Address / Flat / Building" error={errors.addressLine1?.message} id="addressLine1">
                <Input
                  id="addressLine1"
                  placeholder="House/Flat number, Street name, Area"
                  {...register('addressLine1')}
                  className={errors.addressLine1 ? 'border-destructive' : ''}
                />
              </FormField>

              <FormField label="Landmark / Apartment / Suite (Optional)" error={errors.addressLine2?.message} id="addressLine2">
                <Input
                  id="addressLine2"
                  placeholder="Near City Park, Apt 4B"
                  {...register('addressLine2')}
                />
              </FormField>

              {/* City / State / Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="City" error={errors.city?.message} id="city">
                  <Input
                    id="city"
                    placeholder="City"
                    {...register('city')}
                    className={errors.city ? 'border-destructive' : ''}
                  />
                </FormField>
                <FormField label="State / Province" error={errors.state?.message} id="state">
                  <Input
                    id="state"
                    placeholder="State"
                    {...register('state')}
                    className={errors.state ? 'border-destructive' : ''}
                  />
                </FormField>
                <FormField label="PIN / Postal Code" error={errors.postalCode?.message} id="postalCode">
                  <Input
                    id="postalCode"
                    placeholder="Postal Code"
                    {...register('postalCode')}
                    className={errors.postalCode ? 'border-destructive' : ''}
                  />
                </FormField>
              </div>

              {/* Country */}
              <FormField label="Country / Region" error={errors.country?.message} id="country">
                <Select
                  id="country"
                  {...register('country')}
                  className={errors.country ? 'border-destructive' : ''}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Synchronize Checkboxes for Registered Users */}
              {user && (
                <div className="pt-2 pb-1 space-y-2 border-t border-border/60">
                  <label className="flex items-center gap-2.5 text-xs text-foreground font-semibold cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveToAccount}
                      onChange={(e) => setSaveToAccount(e.target.checked)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                    <BookmarkCheck className="w-3.5 h-3.5 text-primary" />
                    <span>Save this address to my account for future purchases</span>
                  </label>

                  {saveToAccount && (
                    <label className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium cursor-pointer select-none ml-6">
                      <input
                        type="checkbox"
                        checked={makeDefault}
                        onChange={(e) => setMakeDefault(e.target.checked)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                      />
                      <span>Make this my default shipping address</span>
                    </label>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3">
                {savedAddresses.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingNew(false)}
                    className="w-full sm:w-auto text-xs font-semibold cursor-pointer"
                  >
                    ← Choose from saved addresses
                  </Button>
                )}

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto sm:ml-auto font-bold text-xs uppercase tracking-wider cursor-pointer h-10 px-6 shadow-sm"
                >
                  {isSaving ? 'Saving...' : 'Deliver to this Address'}
                </Button>
              </div>
            </Stack>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default AddressForm;
