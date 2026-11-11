import React from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser, getCurrentProfile } from '@/core/auth/session';
import { getCmsPageConfigServer, getSiteDesignTokensServer, getNavAppearanceConfigServer } from '@/lib/cms/cms-server';
import { defaultSiteDesignTokens } from '@/lib/cms/defaults';
import { fetchHomepageVisualBuilderData } from '@/app/actions/cms-actions';
import { VisualBuilderStudio } from '@/components/admin/cms/visual-builder-studio';
import { connection } from 'next/server';
import { db } from '@/lib/db';
import { safeQuery } from '@/lib/db/safe-query';
import { categories } from '@/lib/db/schema/catalog/categories';
import { brands } from '@/lib/db/schema/catalog/brands';
import { collections } from '@/lib/db/schema/catalog/collections';
import { globalAttributes } from '@/lib/db/schema/catalog/variants';
import { productRepository } from '@/core/product/product.repository';
import { getCachedProducts } from '@/core/performance/cache';
import { ProductMapper } from '@/core/product/product.mapper';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { sql } from 'drizzle-orm';

export default async function VisualBuilderPage() {
  await connection();
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) {
    redirect('/account');
  }

  const [
    pageConfig,
    themeTokens,
    navConfig,
    builderData,
    categoriesList,
    brandsList,
    collectionsList,
    attributesList,
    catalogResult,
  ] = await Promise.all([
    getCmsPageConfigServer('/'),
    getSiteDesignTokensServer().then((t) => t || defaultSiteDesignTokens),
    getNavAppearanceConfigServer(),
    fetchHomepageVisualBuilderData(),
    safeQuery(
      () =>
        db
          .select({
            id: categories.id,
            name: categories.name,
            parentId: categories.parentId,
            slug: categories.slug,
            imageUrl: categories.imageUrl,
            description: categories.description,
          })
          .from(categories)
          .where(sql`${categories.deletedAt} IS NULL`),
      'builder_categories_list'
    ),
    safeQuery(
      () =>
        db
          .select({ id: brands.id, name: brands.name })
          .from(brands)
          .where(sql`${brands.deletedAt} IS NULL`),
      'builder_brands_list'
    ),
    safeQuery(
      () =>
        db
          .select({
            id: collections.id,
            name: collections.name,
            slug: collections.slug,
            imageUrl: collections.imageUrl,
          })
          .from(collections)
          .where(sql`${collections.deletedAt} IS NULL`),
      'builder_collections_list'
    ),
    safeQuery(
      () =>
        db
          .select({
            id: globalAttributes.id,
            name: globalAttributes.name,
          })
          .from(globalAttributes)
          .where(sql`${globalAttributes.deletedAt} IS NULL`),
      'builder_attributes_list'
    ),
    getCachedProducts({ page: 1, limit: 50, visibility: 'admin' }).catch(() => ({ items: [] })),
  ]);

  let mappedProducts: ProductData[] = [];

  if (catalogResult && catalogResult.items && catalogResult.items.length > 0) {
    mappedProducts = catalogResult.items.map((row) => {
      const card = ProductMapper.toProductCardModel(row);
      const rowProduct = (row as { product?: { categoryId?: string } }).product;
      return {
        id: card.id,
        name: card.name,
        slug: card.slug,
        price: card.price,
        compareAtPrice: card.compareAtPrice ?? undefined,
        category: card.categoryName ?? undefined,
        categoryName: card.categoryName ?? undefined,
        categoryId: rowProduct?.categoryId ?? undefined,
        brand: card.brandName ?? undefined,
        brandName: card.brandName ?? undefined,
        gender: card.gender ?? undefined,
        fit: card.fit ?? undefined,
        season: card.season ?? undefined,
        attributes: card.attributes ?? [],
        rating: card.rating ?? undefined,
        reviewCount: card.reviewsCount,
        images: card.images && card.images.length > 0 ? card.images : card.imageUrl ? [card.imageUrl] : [],
        imageUrl: card.imageUrl ?? (card.images?.[0] || ''),
        badges: card.isNew ? ['NEW'] : [],
        inStock: card.quantity > 0,
        quantity: card.quantity,
        status: card.status,
      };
    });
  } else {
    mappedProducts = (builderData.featuredProducts || []).map((p) => {
      const pRecord = p as unknown as Record<string, unknown>;
      return {
        id: String(pRecord.id || ''),
        name: String(pRecord.name || ''),
        slug: String(pRecord.slug || ''),
        price: typeof pRecord.price === 'string' ? parseFloat(pRecord.price) : Number(pRecord.price || 0),
        compareAtPrice: pRecord.compareAtPrice
          ? typeof pRecord.compareAtPrice === 'string'
            ? parseFloat(pRecord.compareAtPrice)
            : Number(pRecord.compareAtPrice)
          : undefined,
        category: typeof pRecord.categoryName === 'string' ? pRecord.categoryName : undefined,
        categoryName: typeof pRecord.categoryName === 'string' ? pRecord.categoryName : undefined,
        brand: typeof pRecord.brandName === 'string' ? pRecord.brandName : undefined,
        brandName: typeof pRecord.brandName === 'string' ? pRecord.brandName : undefined,
        gender: typeof pRecord.gender === 'string' ? pRecord.gender : undefined,
        fit: typeof pRecord.fit === 'string' ? pRecord.fit : undefined,
        season: typeof pRecord.season === 'string' ? pRecord.season : undefined,
        attributes: Array.isArray(pRecord.attributes) ? (pRecord.attributes as string[]) : [],
        rating: typeof pRecord.rating === 'number' ? pRecord.rating : undefined,
        reviewCount: typeof pRecord.reviewsCount === 'number' ? pRecord.reviewsCount : 0,
        images: Array.isArray(pRecord.images) && pRecord.images.length > 0 ? (pRecord.images as string[]) : typeof pRecord.imageUrl === 'string' ? [pRecord.imageUrl] : [],
        imageUrl: typeof pRecord.imageUrl === 'string' ? pRecord.imageUrl : '',
        badges: p.isNew ? ['NEW'] : [],
        inStock: Number(pRecord.quantity || 0) > 0,
        quantity: Number(pRecord.quantity || 0),
        status: (pRecord.status as ProductData['status']) || 'active',
      };
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      <VisualBuilderStudio
        initialPageConfig={pageConfig}
        initialThemeTokens={themeTokens}
        initialNavConfig={navConfig}
        products={mappedProducts}
        seasonalSections={builderData.seasonalSections}
        categories={categoriesList || []}
        brands={brandsList || []}
        collections={collectionsList || []}
        attributes={attributesList || []}
      />
    </div>
  );
}
