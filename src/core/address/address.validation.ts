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
    .refine(
      (val) => {
        const clean = val.replace(/\D/g, '');
        return /^(?:91|0)?[6-9]\d{9}$/.test(clean);
      },
      {
        message: 'Please enter a valid 10-digit mobile number (e.g. 9876543210)',
      }
    ),
  addressLine1: z
    .string()
    .min(10, 'Street address must be at least 10 characters (House/Flat, Building, Street)')
    .max(200, 'Address must be 200 characters or fewer'),
  addressLine2: z
    .string()
    .max(200, 'Address line 2 must be 200 characters or fewer')
    .optional()
    .default(''),
  city: z
    .string()
    .min(2, 'City is required')
    .max(100, 'City must be 100 characters or fewer'),
  state: z
    .string()
    .min(2, 'State / Province is required')
    .max(100, 'State must be 100 characters or fewer'),
  postalCode: z
    .string()
    .min(1, 'PIN code is required')
    .refine(
      (val) => {
        const clean = val.replace(/\D/g, '');
        return /^[1-9][0-9]{5}$/.test(clean);
      },
      {
        message: 'Please enter a valid 6-digit Indian PIN code (e.g. 400001)',
      }
    ),
  country: z
    .string()
    .min(1, 'Country is required')
    .default('IN'),
  isDefault: z.boolean().default(false),
});

export type CustomerAddressFormValues = z.infer<typeof customerAddressSchema>;
