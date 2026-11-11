import * as React from 'react';
import { getCmsPageConfigServer } from '@/lib/cms/cms-server';
import { PageRenderer } from '@/components/cms/page-renderer';
import { homepageService, type SeasonalCampaignData } from '@/core/storefront/homepage.service';
import { type ProductData } from '@/components/commerce/configurable-product-card';
import { getCachedProducts } from '@/core/performance/cache';
import { ProductMapper } from '@/core/product/product.mapper';
import { connection } from 'next/server';

/**
 * Public storefront Homepage Server Component.
 * Dynamically renders landing sections driven by CMS Configuration, active seasonal sales, and database feeds.
 */
export default async function HomePage() {
  await connection();
  const [pageConfig, homepageData, catalogResult] = await Promise.all([
    getCmsPageConfigServer('/'),
    homepageService.getHomepageData().catch((err) => {
      console.warn('Could not fetch homepage data from DB:', err);
      return { seasonalSections: [], featuredProducts: [], categories: [] };
    }),
    getCachedProducts({ page: 1, limit: 16 }).catch(() => ({ items: [] })),
  ]);

  const seasonalSections = homepageData.seasonalSections || [];

  let products: ProductData[] = [];

  if (catalogResult && catalogResult.items && catalogResult.items.length > 0) {
    products = catalogResult.items.map((row: any) => {
      const card = ProductMapper.toProductCardModel(row);
      return {
        id: card.id,
        name: card.name,
        slug: card.slug,
        price: card.price,
        compareAtPrice: card.compareAtPrice ?? undefined,
        category: card.categoryName ?? undefined,
        categoryName: card.categoryName ?? undefined,
        categoryId: row.product?.categoryId ?? undefined,
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
    products = (homepageData.featuredProducts || []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? undefined,
      category: p.categoryName ?? undefined,
      categoryName: p.categoryName ?? undefined,
      brand: p.brandName ?? undefined,
      brandName: p.brandName ?? undefined,
      gender: p.gender ?? undefined,
      fit: p.fit ?? undefined,
      season: p.season ?? undefined,
      attributes: p.attributes ?? [],
      rating: p.rating ?? undefined,
      reviewCount: p.reviewsCount,
      images: p.imageUrl ? [p.imageUrl] : [],
      badges: p.isNew ? ['NEW'] : [],
      inStock: p.quantity > 0,
    }));
  }

  return (
    <div className="w-full flex flex-col">
      <PageRenderer
        sections={pageConfig.sections}
        products={products}
        seasonalSections={seasonalSections}
      />
    </div>
  );
}
