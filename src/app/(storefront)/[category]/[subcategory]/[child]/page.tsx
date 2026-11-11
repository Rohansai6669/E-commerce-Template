import * as React from 'react';
import { fetchCategoryProducts } from '@/core/storefront/category-catalog';
import { CategoryViewClient } from '@/components/storefront/category-view-client';

export default async function ChildCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string; child: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category, subcategory, child } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  const { items, meta } = await fetchCategoryProducts(category, child || subcategory, sort);

  return (
    <CategoryViewClient
      category={category}
      subcategory={`${subcategory} / ${child}`}
      meta={meta}
      initialItems={items}
    />
  );
}
