import * as React from 'react';
import { Rating } from '@/components/commerce/rating';
import { Text } from '@/components/ui/typography';
import { Card, CardContent } from '@/components/ui/card';

export interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
  };
}

/**
 * Individual reviewer feedback card.
 */
export function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card className="w-full border-border bg-card shadow-xs">
      <CardContent className="p-4 flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Rating value={review.rating} size="sm" />
          <span className="text-xs text-muted-foreground font-medium">
            {formattedDate}
          </span>
        </div>
        <Text className="text-xs sm:text-sm text-foreground/80 leading-relaxed font-sans">
          {review.comment || 'No comment provided by this reviewer.'}
        </Text>
      </CardContent>
    </Card>
  );
}
export default ReviewCard;
