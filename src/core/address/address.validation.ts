import { z } from 'zod';

/**
 * Zod schema for validated address creation and updating.
 */
export const customerAddressSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name must be 50 characters or fewer'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be 50 characters or fewer'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'),
  addressLine1: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address must be 200 characters or fewer'),
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must be 200 characters or fewer')
    .optional()
    .default(''),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City must be 100 characters or fewer'),
  state: z
    .string()
    .min(1, 'State / Province is required')
    .max(100, 'State must be 100 characters or fewer'),
  postalCode: z
    .string()
    .min(1, 'Postal code is required')
    .regex(/^[\w\s-]{3,15}$/, 'Please enter a valid postal code'),
  country: z
    .string()
    .min(1, 'Country is required'),
  isDefault: z.boolean().default(false),
});

export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>;
