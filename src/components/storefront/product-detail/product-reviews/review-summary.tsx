import * as React from 'react';
import { Rating } from '@/components/commerce/rating';
import { Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { MessageSquarePlus } from 'lucide-react';

export interface ReviewSummaryProps {
  reviews: Array<{ rating: number }>;
  rating: number | null;
  reviewsCount: number;
}

/**
 * Visual ratings chart breakdown summarizing star allocations.
 */
export function ReviewSummary({ reviews, rating, reviewsCount }: ReviewSummaryProps) {
  const average = rating !== null ? rating.toFixed(1) : '0.0';

  // Compute stars occurrences distribution (index 0 = 5 stars, ..., index 4 = 1 star)
  const distribution = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    const starVal = Math.round(r.rating);
    if (starVal >= 1 && starVal <= 5) {
      distribution[5 - starVal]++;
    }
  });

  if (reviewsCount === 0) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border border-border bg-card rounded-xl shadow-xs w-full">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <MessageSquarePlus className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">No customer reviews yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Be the first to review this product and help other shoppers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Rating value={0} size="sm" />
          <span className="text-xs font-semibold text-muted-foreground">0.0 (0 reviews)</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center border border-border p-6 bg-card rounded-xl shadow-xs w-full">
      {/* Left Ratings Average summary */}
      <Stack gap="2" align="center" className="text-center md:border-r border-border md:pr-6 last:border-0">
        <Text className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
          {average}
        </Text>
        <Rating value={rating || 0} size="md" />
        <Text className="text-xs text-muted-foreground font-medium">
          Based on {reviewsCount} customer review{reviewsCount !== 1 ? 's' : ''}
        </Text>
      </Stack>

      {/* Bar charts distributions */}
      <div className="md:col-span-2 flex flex-col gap-2">
        {distribution.map((count, idx) => {
          const stars = 5 - idx;
          const percentage = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;

          return (
            <div key={idx} className="flex items-center gap-3 w-full text-xs">
              <span className="font-semibold text-muted-foreground w-12 text-right">
                {stars} star
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 left-0 bg-yellow-400 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-muted-foreground font-semibold w-10 text-right">
                {Math.round(percentage)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReviewSummary;
