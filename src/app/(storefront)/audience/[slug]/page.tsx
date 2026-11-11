import * as React from 'react';
import { fetchAudienceProducts } from '@/core/storefront/taxonomy-catalog';
import { CategoryViewClient } from '@/components/storefront/category-view-client';

export interface AudiencePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AudienceSlugPage({ params, searchParams }: AudiencePageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const { items, meta } = await fetchAudienceProducts(slug, sort);

  return (
    <CategoryViewClient
      category={meta.title}
      meta={meta}
      initialItems={items}
    />
  );
}
