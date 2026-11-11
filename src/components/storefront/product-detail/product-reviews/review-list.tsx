import * as React from 'react';
import { ReviewCard } from './review-card';
import { Stack } from '@/components/layout/stack';
import { Text } from '@/components/ui/typography';

export interface ReviewListProps {
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  }>;
}

/**
 * Lists review cards.
 */
export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center border border-dashed border-border rounded-md bg-card shadow-xs">
        <Text className="text-xs sm:text-sm text-muted-foreground font-medium">
          No reviews available for this product yet.
        </Text>
      </div>
    );
  }

  return (
    <Stack gap="3" className="w-full">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </Stack>
  );
}
export default ReviewList;
