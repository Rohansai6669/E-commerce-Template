import * as React from 'react';
import { db } from '@/lib/db';
import { reviews } from '@/lib/db/schema/reviews';
import { products } from '@/lib/db/schema/catalog/products';
import { profiles } from '@/lib/db/schema/auth';
import { Heading, Text } from '@/components/ui/typography';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { eq, desc } from 'drizzle-orm';
import { ReviewsList } from '@/components/admin/reviews-list';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  productName: string | null;
  customerName: string | null;
  customerEmail: string | null;
}

/**
 * Admin Product Reviews Moderation Board.
 */
export default async function AdminReviewsPage() {
  const list = await db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      comment: reviews.comment,
      createdAt: reviews.createdAt,
      productName: products.name,
      customerName: profiles.fullName,
      customerEmail: profiles.email,
    })
    .from(reviews)
    .leftJoin(products, eq(reviews.productId, products.id))
    .leftJoin(profiles, eq(reviews.profileId, profiles.id))
    .orderBy(desc(reviews.createdAt)) as ReviewItem[];

  return (
    <div className="flex flex-col gap-6 w-full text-slate-900 pb-12">
      <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
        <Heading level={1} className="text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
          Product Reviews Moderation
        </Heading>
        <Text className="text-sm text-slate-500 font-sans">
          Moderate, inspect, and delete customer product feedback ratings.
        </Text>
      </div>

      <div className="grid grid-cols-1 gap-6 items-start">
        <Card className="border-slate-200 bg-white shadow-xs rounded">
          <CardHeader className="border-b border-slate-100 py-4 px-6 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Moderation Queue ({list.length})
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <ReviewsList initialReviews={list} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
