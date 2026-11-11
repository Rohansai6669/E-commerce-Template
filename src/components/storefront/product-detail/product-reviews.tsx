'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewSchema, type ReviewFormValues } from '@/core/reviews/review.validation';
import { submitReviewAction } from '@/app/actions/reviews';
import { ReviewPresenter } from '@/core/reviews/review.presenter';
import { ReviewSummary } from './product-reviews/review-summary';
import { ReviewList } from './product-reviews/review-list';
import { Heading, Text } from '@/components/ui/typography';
import { Stack } from '@/components/layout/stack';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FormField } from '@/components/forms/form-field';
import { Textarea } from '@/components/forms/textarea';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { toast } from 'sonner';

export interface ProductReviewsProps {
  productId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialReviews: any[];
  isLoggedIn: boolean;
}

/**
 * Composite reviews panel with summaries, histories list, and feedback submission forms.
 */
export function ProductReviews({ productId, initialReviews, isLoggedIn }: ProductReviewsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reviewsList, setReviewsList] = React.useState<any[]>(initialReviews);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reviewSchema) as any,
    defaultValues: {
      rating: 5,
      comment: '',
    },
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const ratingValue = watch('rating');

  const summary = React.useMemo(() => {
    return ReviewPresenter.calculateSummary(reviewsList);
  }, [reviewsList]);

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      const result = await submitReviewAction(productId, data);
      if (result.success && result.review) {
        toast.success('Thank you! Your review has been submitted.');
        setReviewsList((prev) => [result.review, ...prev]);
        reset({ rating: 5, comment: '' });
      } else {
        toast.error(result.error ?? 'Failed to submit review.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    }
  };

  return (
    <Stack gap="6" className="w-full">
      <Heading level={2} className="text-lg font-bold tracking-tight font-heading">
        Customer Reviews
      </Heading>

      {/* Review summary stats */}
      <ReviewSummary
        reviews={reviewsList}
        rating={summary.averageRating || null}
        reviewsCount={summary.totalCount}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left column: Reviews List */}
        <div className="md:col-span-2 w-full">
          <ReviewList reviews={reviewsList} />
        </div>

        {/* Right column: Submit Review Form (authenticated users) */}
        <div className="w-full">
          {isLoggedIn ? (
            <Card className="border-border bg-card shadow-xs">
              <CardHeader className="p-4 border-b border-border bg-muted/10">
                <Heading level={3} className="text-xs font-bold uppercase tracking-wider font-heading">
                  Submit a Review
                </Heading>
              </CardHeader>
              <CardContent className="p-4">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <form onSubmit={handleSubmit(onSubmit as any)} noValidate>
                  <Stack gap="4">
                    {/* Star Rating Selector */}
                    <FormField label="Rating" error={errors.rating?.message} id="rating">
                      <div className="flex items-center gap-1.5 mt-1" id="rating">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isActive = star <= ratingValue;
                          return (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setValue('rating', star, { shouldValidate: true })}
                              className="text-yellow-400 hover:scale-115 transition-transform shrink-0 cursor-pointer"
                              aria-label={`Rate ${star} stars`}
                            >
                              <Icon
                                name="Star"
                                className={`h-6 w-6 ${isActive ? 'fill-yellow-400' : 'fill-transparent'}`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </FormField>

                    {/* Review comment */}
                    <FormField label="Comment" error={errors.comment?.message} id="comment">
                      <Textarea
                        id="comment"
                        placeholder="Write your review here..."
                        rows={4}
                        {...register('comment')}
                      />
                    </FormField>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-bold text-xs uppercase cursor-pointer"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Stack>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border bg-muted/10 text-center p-6 shadow-xs">
              <CardContent className="flex flex-col items-center justify-center p-0">
                <Icon name="Lock" className="h-6 w-6 text-muted-foreground/60 mb-2" />
                <Text className="text-xs font-bold text-foreground">Sign in to leave a review</Text>
                <Text className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                  Only verified customers and registered users can review this product.
                </Text>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Stack>
  );
}
export default ProductReviews;
