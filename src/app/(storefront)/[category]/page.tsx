import * as React from 'react';
import { fetchCategoryProducts } from '@/core/storefront/category-catalog';
import { CategoryViewClient } from '@/components/storefront/category-view-client';

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const { items, meta } = await fetchCategoryProducts(category, undefined, sort);

  return (
    <CategoryViewClient
      category={category}
      meta={meta}
      initialItems={items}
    />
  );
}
