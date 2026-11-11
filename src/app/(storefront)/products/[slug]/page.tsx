import * as React from 'react';
import { notFound } from 'next/navigation';
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
import { Stack } from '@/components/layout/stack';
import { Separator } from '@/components/ui/separator';
import { getCurrentUser } from '@/core/auth/session';
import { wishlistService } from '@/core/wishlist/wishlist.service';
import { generateStorefrontMetadata } from '@/core/seo/metadata';
import { getProductSchema, getBreadcrumbsSchema } from '@/core/seo/jsonld';

export interface ProductPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

/**
 * Generates dynamic SEO metadata tags for search engine crawlers.
 */
export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const data = await getCachedProductDetailPage(resolvedParams.slug);
  if (!data) return {};

  const { product } = data;
  const primaryImg = product.images.length > 0 ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url) : undefined;
  return generateStorefrontMetadata({
    title: product.name,
    description: product.description || `Purchase ${product.name} from our storefront.`,
    path: `/products/${product.slug}`,
    imageUrl: primaryImg,
  });
}

/**
 * Server Component hosting the Product Detail Page.
 */
export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const data = await getCachedProductDetailPage(resolvedParams.slug);

  if (!data) {
    notFound();
  }

  const { product, relatedProducts, reviews } = data;
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  // Check if item is saved in user's wishlist
  const initialIsSaved = isLoggedIn ? await wishlistService.isSaved(user.id, product.id) : false;

  const breadcrumbs = [
    { label: 'Shop All', href: '/products' },
    { label: product.name },
  ];

  const imageStringUrls = product.images.map((img) => (typeof img === 'string' ? img : img.url));

  // Dynamic SEO JSON-LD schemas
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

  const breadcrumbsJsonLd = getBreadcrumbsSchema(breadcrumbs);

  return (
    <Container className="py-8">
      {/* Tracker mounts */}
      <RecentlyViewedTracker slug={product.slug} />

      {/* Structured SEO schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />

      <Stack gap="8">
        <Breadcrumb items={breadcrumbs} />

        {/* Top visual detail grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start w-full">
          <ProductGallery images={product.images} alt={product.name} />
          
          <Stack gap="6" className="w-full">
            <ProductSummary product={product} />
            <ProductInfo product={product} initialIsSaved={initialIsSaved} />
          </Stack>
        </div>

        <Separator />

        {/* Descriptions and Specs tab */}
        <ProductSpecifications product={product} />

        <Separator />

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
            <Separator />
            <RelatedProducts products={relatedProducts} />
          </>
        )}

        {/* Recently viewed carousel strip */}
        <RecentlyViewedSection />
      </Stack>
    </Container>
  );
}
