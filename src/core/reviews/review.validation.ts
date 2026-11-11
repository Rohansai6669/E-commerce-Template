import { z } from 'zod';

/**
 * Zod validation schema for submitting product reviews.
 */
export const reviewSchema = z.object({
  rating: z
    .number()
    .min(1, 'Rating must be at least 1 star')
    .max(5, 'Rating cannot exceed 5 stars'),
  comment: z
    .string()
    .max(1000, 'Comments must be 1000 characters or fewer')
    .optional()
    .default(''),
});

export type ReviewFormValues = z.infer<typeof reviewSchema>;
