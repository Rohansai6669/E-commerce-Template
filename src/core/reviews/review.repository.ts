import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema/reviews';
import { eq, and, isNull } from 'drizzle-orm';

/**
 * ReviewRepository manages database CRUD persistence queries for the reviews table.
 */
export class ReviewRepository {
  /**
   * Retrieves list of customer-facing approved reviews for a product (excluding soft-deleted or hidden reviews).
   */
  async getReviewsByProductId(productId: string): Promise<unknown[]> {
    const rows = await db.query.reviews.findMany({
      where: and(
        eq(reviews.productId, productId),
        eq(reviews.status, 'approved'),
        isNull(reviews.deletedAt)
      ),
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
      with: {
        profile: true,
      },
    });
    return rows;
  }

  /**
   * Creates or updates (UPSERT) a product review record.
   * Editing an existing review resets status back to 'pending' for re-moderation.
   */
  async upsertReview(params: {
    profileId: string;
    productId: string;
    rating: number;
    comment: string;
    isVerifiedPurchase: boolean;
  }): Promise<unknown> {
    const [existing] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, params.productId), eq(reviews.profileId, params.profileId)))
      .limit(1);

    if (existing) {
      // Editing existing review: Reset status to 'pending' for re-moderation
      const [updated] = await db
        .update(reviews)
        .set({
          rating: params.rating,
          comment: params.comment || null,
          isVerifiedPurchase: params.isVerifiedPurchase,
          status: 'pending',
          updatedAt: new Date(),
        })
        .where(eq(reviews.id, existing.id))
        .returning();
      return updated;
    }

    const [newRow] = await db
      .insert(reviews)
      .values({
        profileId: params.profileId,
        productId: params.productId,
        rating: params.rating,
        comment: params.comment || null,
        isVerifiedPurchase: params.isVerifiedPurchase,
        status: 'approved', // New reviews are published directly by default
      })
      .returning();
    return newRow;
  }

  /**
   * Soft deletes a review record.
   */
  async softDelete(id: string, actorProfileId: string, reason?: string): Promise<boolean> {
    const [updated] = await db
      .update(reviews)
      .set({
        status: 'hidden',
        deletedAt: new Date(),
        deletedBy: actorProfileId,
        moderationReason: reason || 'Soft deleted by Admin',
      })
      .where(eq(reviews.id, id))
      .returning();
    return !!updated;
  }
}

export const reviewRepository = new ReviewRepository();
export default reviewRepository;
