'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, type AddressFormValues } from '@/core/checkout/address.validation';
import { type CheckoutAddress } from '@/core/checkout/checkout.types';
import { FormField } from '@/components/forms/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/forms/select';
import { Button } from '@/components/ui/button';
import { Heading } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export interface AddressFormProps {
  defaultValues?: CheckoutAddress | null;
  onSubmit: (address: CheckoutAddress) => void;
}

const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'IN', label: 'India' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
];

/**
 * Checkout address form with Zod validation via React Hook Form.
 */
export function AddressForm({ defaultValues, onSubmit }: AddressFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(addressSchema) as any,
    defaultValues: (defaultValues || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
    }) as AddressFormValues,
  });

  const onValid = (data: AddressFormValues) => {
    onSubmit(data as CheckoutAddress);
  };

  return (
    <Card className="border-border bg-card shadow-sm">
      <CardHeader className="p-5 border-b border-border bg-muted/10">
        <Heading level={2} className="text-base font-bold tracking-tight font-heading">
          Shipping Address
        </Heading>
      </CardHeader>

      <CardContent className="p-5">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <form onSubmit={handleSubmit(onValid as any)} noValidate>
          <Stack gap="4">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name" error={errors.firstName?.message} id="firstName">
                <Input
                  id="firstName"
                  placeholder="John"
                  {...register('firstName')}
                  className={errors.firstName ? 'border-destructive' : ''}
                />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message} id="lastName">
                <Input
                  id="lastName"
                  placeholder="Doe"
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
                  placeholder="+1 (555) 000-0000"
                  {...register('phone')}
                  className={errors.phone ? 'border-destructive' : ''}
                />
              </FormField>
            </div>

            {/* Address */}
            <FormField label="Address Line 1" error={errors.addressLine1?.message} id="addressLine1">
              <Input
                id="addressLine1"
                placeholder="123 Main St"
                {...register('addressLine1')}
                className={errors.addressLine1 ? 'border-destructive' : ''}
              />
            </FormField>

            <FormField label="Address Line 2" error={errors.addressLine2?.message} id="addressLine2" description="Optional">
              <Input
                id="addressLine2"
                placeholder="Apt 4B"
                {...register('addressLine2')}
              />
            </FormField>

            {/* City / State / Zip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="City" error={errors.city?.message} id="city">
                <Input
                  id="city"
                  placeholder="New York"
                  {...register('city')}
                  className={errors.city ? 'border-destructive' : ''}
                />
              </FormField>
              <FormField label="State / Province" error={errors.state?.message} id="state">
                <Input
                  id="state"
                  placeholder="NY"
                  {...register('state')}
                  className={errors.state ? 'border-destructive' : ''}
                />
              </FormField>
              <FormField label="Postal Code" error={errors.postalCode?.message} id="postalCode">
                <Input
                  id="postalCode"
                  placeholder="10001"
                  {...register('postalCode')}
                  className={errors.postalCode ? 'border-destructive' : ''}
                />
              </FormField>
            </div>

            {/* Country */}
            <FormField label="Country" error={errors.country?.message} id="country">
              <Select
                id="country"
                {...register('country')}
                className={errors.country ? 'border-destructive' : ''}
              >
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </FormField>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto sm:self-end font-bold text-xs uppercase cursor-pointer mt-2"
            >
              Continue to Shipping
            </Button>
          </Stack>
        </form>
      </CardContent>
    </Card>
  );
}
export default AddressForm;
