/**
 * A customer product review view model.
 */
export interface ProductReview {
  id: string;
  productId: string;
  profileId: string;
  rating: number; // 1-5
  comment: string | null;
  isVerifiedPurchase: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  profile?: {
    fullName: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Summary ratings aggregates statistics for a product.
 */
export interface ReviewSummary {
  averageRating: number;
  totalCount: number;
  starsCount: Record<number, number>; // Maps 1..5 stars -> count of reviews
}
