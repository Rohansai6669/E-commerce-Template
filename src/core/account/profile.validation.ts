import { z } from 'zod';

/**
 * Zod schema for profile details validation.
 */
export const profileSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be 100 characters or fewer'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be 30 characters or fewer')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[\d\s\-().]{7,20}$/, 'Please enter a valid phone number'),
  avatarUrl: z.string().url('Please enter a valid URL').or(z.literal('')).optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
