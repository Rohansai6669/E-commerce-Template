'use server';

import { getCurrentUser } from '@/core/auth/session';
import { reviewService } from '@/core/reviews/review.service';
import { reviewSchema, type ReviewFormValues } from '@/core/reviews/review.validation';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Helper to safely extract error message from unknown catch blocks.
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

/**
 * Server action to validate and submit a product review.
 */
export async function submitReviewAction(
  productId: string,
  data: ReviewFormValues
): Promise<{ success: boolean; review?: unknown; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Please log in to submit a review.' };
    }

    const parsed = reviewSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: 'Invalid rating or comment' };
    }

    const result = await reviewService.submitReview({
      profileId: user.id,
      productId,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    });

    if (result.success) {
      revalidatePath(`/products/${productId}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (revalidateTag as any)('reviews');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (revalidateTag as any)('products');
    }

    return result;
  } catch (err) {
    return { success: false, error: getErrorMessage(err) };
  }
}
