import * as React from 'react';
import { notFound } from 'next/navigation';
import { resolveHierarchicalCatalog } from '@/core/storefront/hierarchical-catalog';
import { CategoryViewClient } from '@/components/storefront/category-view-client';
import { generateStorefrontMetadata } from '@/core/seo/metadata';
import { getCachedProductDetailPage } from '@/core/performance/cache';
import ProductGallery from '@/components/commerce/product-gallery';
import ProductSummary from '@/components/storefront/product-detail/product-summary';
import ProductInfo from '@/components/storefront/product-detail/product-info';
import ProductSpecifications from '@/components/storefront/product-detail/product-specifications';
import RelatedProducts from '@/components/storefront/product-detail/related-products';
import { ProductReviews } from '@/components/storefront/product-detail/product-reviews';
import { RecentlyViewedTracker } from '@/components/commerce/recently-viewed-tracker';
import { RecentlyViewedSection } from '@/components/storefront/sections/recently-viewed';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { Container } from '@/components/layout/container';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/core/auth/session';
import { wishlistService } from '@/core/wishlist/wishlist.service';
import { getProductSchema, getBreadcrumbsSchema } from '@/core/seo/jsonld';

export interface CatalogRouteProps {
  params: Promise<{ catalogRoute: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generates dynamic SEO metadata for stacked catalog & category routes:
 * e.g. /men, /men/streetwear, /men/streetwear/oversized-shirt
 */
export async function generateMetadata({ params }: CatalogRouteProps) {
  const { catalogRoute } = await params;
  if (!catalogRoute || catalogRoute.length === 0) return {};

  const { resolution } = await resolveHierarchicalCatalog(catalogRoute);

  if (resolution.isProduct && resolution.matchedProduct) {
    return generateStorefrontMetadata({
      title: resolution.matchedProduct.name,
      description: resolution.matchedProduct.description || `Purchase ${resolution.matchedProduct.name} at Lexido.`,
      path: `/${catalogRoute.join('/')}`,
    });
  }

  return generateStorefrontMetadata({
    title: `${resolution.pageTitle} | Lexido`,
    description: resolution.pageDescription,
    path: `/${catalogRoute.join('/')}`,
    imageUrl: resolution.heroImage || undefined,
  });
}

/**
 * Universal Hierarchical Catalog & Category Route Handler.
 * Supports infinite depth stacked taxonomy:
 * - 1 Level: /[category] (e.g. /streetwear, /casual, /old-money)
 * - 2 Levels: /[category]/[subcategory] (e.g. /men/streetwear, /women/dresses)
 * - 3 Levels: /[category]/[subcategory]/[child] (e.g. /men/streetwear/oversized-shirt, /women/outerwear/trench-coats)
 * - Stacked Product URLs: /[category]/[subcategory]/[product-slug]
 */
export default async function HierarchicalCatalogPage({
  params,
  searchParams,
}: CatalogRouteProps) {
  const { catalogRoute } = await params;
  const resolvedSearchParams = await searchParams;

  if (!catalogRoute || catalogRoute.length === 0) {
    notFound();
  }

  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';
  const { resolution, items } = await resolveHierarchicalCatalog(catalogRoute, sort);

  // A. Product Detail Page Handler (when last slug points to an individual product)
  if (resolution.isProduct && resolution.matchedProduct) {
    const data = await getCachedProductDetailPage(resolution.matchedProduct.slug);
    if (!data) notFound();

    const { product, relatedProducts, reviews } = data;
    const user = await getCurrentUser();
    const isLoggedIn = !!user;
    const initialIsSaved = isLoggedIn ? await wishlistService.isSaved(user.id, product.id) : false;

    const imageStringUrls = product.images.map((img) =>
      typeof img === 'string' ? img : img.url
    );

    const productJsonLd = getProductSchema({
      id: product.id,
      name: product.name,
      description: product.description,
      images: imageStringUrls,
      price: product.price,
      quantity: product.quantity,
      slug: product.slug,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
    });

    const breadcrumbsJsonLd = getBreadcrumbsSchema(resolution.breadcrumbs);

    return (
      <Container className="py-6 sm:py-10 max-w-[1600px] mx-auto">
        <RecentlyViewedTracker slug={product.slug} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
        />

        <div className="space-y-10 sm:space-y-14 w-full">
          <Breadcrumb items={resolution.breadcrumbs} />

          {/* Top visual detail grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
            <div className="w-full lg:col-span-7">
              <ProductGallery images={product.images} alt={product.name} />
            </div>

            <div className="w-full lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-6">
              <ProductSummary product={product} />
              <ProductInfo product={product} initialIsSaved={initialIsSaved} />
            </div>
          </div>

          <Separator className="opacity-60" />

          {/* Specifications tab */}
          <ProductSpecifications product={product} />

          <Separator className="opacity-60" />

          {/* Customer review sections */}
          <div id="reviews" className="w-full scroll-mt-20">
            <ProductReviews
              productId={product.id}
              initialReviews={reviews}
              isLoggedIn={isLoggedIn}
            />
          </div>

          {/* Category suggestions strip */}
          {relatedProducts.length > 0 && (
            <>
              <Separator className="opacity-60" />
              <RelatedProducts products={relatedProducts} />
            </>
          )}

          {/* Recently viewed carousel strip */}
          <RecentlyViewedSection />
        </div>
      </Container>
    );
  }

  // B. Category / Subcategory / Child Catalog View Handler
  return (
    <CategoryViewClient
      category={resolution.pageTitle}
      subcategory={resolution.subcategorySlug}
      child={resolution.childSlug}
      breadcrumbs={resolution.breadcrumbs}
      heroImage={resolution.heroImage}
      subtitle={resolution.pageSubtitle}
      meta={{
        title: resolution.pageTitle,
        subtitle: resolution.pageSubtitle,
        breadcrumb: resolution.breadcrumbString,
        breadcrumbs: resolution.breadcrumbs,
        description: resolution.pageDescription,
        subtags: resolution.subtags,
        heroImage: resolution.heroImage,
      }}
      initialItems={items}
    />
  );
}
