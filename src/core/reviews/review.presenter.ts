import { type ReviewSummary } from './review.types';

/**
 * ReviewPresenter handles UI presentation aggregates and summaries formatting.
 */
export class ReviewPresenter {
  /**
   * Calculates rating averages and star counts for a product.
   * Safe to run in Client Components (does not import database drivers).
   */
  static calculateSummary(reviewsList: unknown[]): ReviewSummary {
    const totalCount = reviewsList.length;
    if (totalCount === 0) {
      return {
        averageRating: 0,
        totalCount: 0,
        starsCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const starsCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;

    reviewsList.forEach((r) => {
      const reviewObj = r as { rating: number };
      const rating = Math.min(5, Math.max(1, reviewObj.rating));
      starsCount[rating as 1|2|3|4|5] += 1;
      sum += rating;
    });

    const averageRating = parseFloat((sum / totalCount).toFixed(1));

    return {
      averageRating,
      totalCount,
      starsCount,
    };
  }
}
export default ReviewPresenter;
