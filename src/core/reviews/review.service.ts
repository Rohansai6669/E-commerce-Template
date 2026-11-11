import { reviewRepository } from './review.repository';
import { db } from '@/lib/db';
import { orders, orderItems } from '@/lib/db/schema/order';
import { productVariants } from '@/lib/db/schema/catalog/variants';
import { eq, and, inArray } from 'drizzle-orm';

/**
 * Helper to safely extract error message from unknown catch blocks.
 */
function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Failed to submit review. Please try again.';
}

/**
 * ReviewService coordinates review submissions, verified purchase checks, and moderation.
 */
export class ReviewService {
  /**
   * Orchestrates review submission & editing (UPSERT):
   * Verifies order-item purchase history (delivered or shipped status) and persists review.
   */
  async submitReview(params: {
    profileId: string;
    productId: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean; review?: unknown; error?: string }> {
    try {
      // 1. Order-Item-Based Verified Purchase Check
      const matchingOrders = await db
        .select({ id: orders.id })
        .from(orders)
        .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
        .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
        .where(
          and(
            eq(orders.profileId, params.profileId),
            eq(productVariants.productId, params.productId),
            inArray(orders.status, ['delivered', 'shipped'])
          )
        )
        .limit(1);

      const isVerifiedPurchase = matchingOrders.length > 0;

      // 2. Persist or UPSERT the review record (editing resets status to 'pending' for re-moderation)
      const review = await reviewRepository.upsertReview({
        profileId: params.profileId,
        productId: params.productId,
        rating: params.rating,
        comment: params.comment,
        isVerifiedPurchase,
      });

      return { success: true, review };
    } catch (err) {
      return { success: false, error: getErrorMessage(err) };
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService;
