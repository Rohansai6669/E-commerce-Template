import * as React from 'react';
import { fetchCollectionProducts } from '@/core/storefront/taxonomy-catalog';
import { CategoryViewClient } from '@/components/storefront/category-view-client';

export interface CollectionPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CollectionSlugPage({ params, searchParams }: CollectionPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const { items, meta } = await fetchCollectionProducts(slug, sort);

  return (
    <CategoryViewClient
      category={meta.title}
      subcategory={slug}
      meta={meta}
      initialItems={items}
    />
  );
}
