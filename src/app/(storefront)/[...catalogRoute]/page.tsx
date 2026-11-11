import * as React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema/catalog/categories';
import { products } from '@/lib/db/schema/catalog/products';
import { audiences } from '@/lib/db/schema/catalog/audiences';
import { productImages } from '@/lib/db/schema/catalog/images';
import { brands } from '@/lib/db/schema/catalog/brands';
import { productCategories } from '@/lib/db/schema/catalog/product-taxonomy';
import { eq, and, or, sql, desc, asc } from 'drizzle-orm';
import { getCachedProductDetailPage } from '@/core/performance/cache';
import ProductGallery from '@/components/commerce/product-gallery';
import ProductSummary from '@/components/storefront/product-detail/product-summary';
import ProductInfo from '@/components/storefront/product-detail/product-info';
import ProductSpecifications from '@/components/storefront/product-detail/product-specifications';
import RelatedProducts from '@/components/storefront/product-detail/related-products';
import { ProductReviews } from '@/components/storefront/product-detail/product-reviews';
import { RecentlyViewedTracker } from '@/components/commerce/recently-viewed-tracker';
import { Breadcrumb } from '@/components/navigation/Breadcrumb/breadcrumb';
import { Container } from '@/components/layout/container';
import { Stack } from '@/components/layout/stack';
import { Separator } from '@/components/ui/separator';
import { RecentlyViewedSection } from '@/components/storefront/sections/recently-viewed';
import { getCurrentUser } from '@/core/auth/session';
import { wishlistService } from '@/core/wishlist/wishlist.service';
import { generateStorefrontMetadata } from '@/core/seo/metadata';
import { getProductSchema, getBreadcrumbsSchema } from '@/core/seo/jsonld';
import { CategoryViewClient } from '@/components/storefront/category-view-client';
import { type ProductData } from '@/components/commerce/configurable-product-card';

const KNOWN_ATTRIBUTES = new Set(['men', 'women', 'kids', 'unisex', 'sale', 'limited', 'trending', 'all']);

export interface CatalogRouteProps {
  params: Promise<{ catalogRoute: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Generates dynamic SEO metadata for hierarchical routes:
 * [attribute] / [category] / [subcategory] / [product]
 */
export async function generateMetadata({ params }: CatalogRouteProps) {
  const { catalogRoute } = await params;
  if (!catalogRoute || catalogRoute.length === 0) return {};

  const lastSlug = catalogRoute[catalogRoute.length - 1];

  // Check if target is a product
  if (db) {
    const [matchedProduct] = await db
      .select({ name: products.name, description: products.description, slug: products.slug })
      .from(products)
      .where(and(eq(products.slug, lastSlug), sql`${products.deletedAt} IS NULL`))
      .limit(1);

    if (matchedProduct) {
      return generateStorefrontMetadata({
        title: matchedProduct.name,
        description: matchedProduct.description || `Buy ${matchedProduct.name} at Lexido.`,
        path: `/${catalogRoute.join('/')}`,
      });
    }

    // Check if target is a category
    const [matchedCategory] = await db
      .select({ name: categories.name, description: categories.description, imageUrl: categories.imageUrl })
      .from(categories)
      .where(and(eq(categories.slug, lastSlug), sql`${categories.deletedAt} IS NULL`))
      .limit(1);

    if (matchedCategory) {
      return generateStorefrontMetadata({
        title: `${matchedCategory.name.toUpperCase()} Collection`,
        description: matchedCategory.description || `Explore ${matchedCategory.name} styles at Lexido.`,
        path: `/${catalogRoute.join('/')}`,
        imageUrl: matchedCategory.imageUrl || undefined,
      });
    }
  }

  const titleCase = catalogRoute.map((s) => s.replace(/-/g, ' ').toUpperCase()).join(' · ');
  return generateStorefrontMetadata({
    title: titleCase,
    description: `Browse ${titleCase} luxury collections at Lexido.`,
    path: `/${catalogRoute.join('/')}`,
  });
}

/**
 * Universal Hierarchical Catalog & Product Page Handler.
 * Supports:
 * - 4 segments: /[attribute]/[category]/[subcategory]/[product]
 * - 3 segments: /[attribute]/[category]/[subcategory] OR /[category]/[subcategory]/[product]
 * - 2 segments: /[attribute]/[category] OR /[category]/[subcategory]
 * - 1 segment:  /[attribute] OR /[category]
 */
export default async function HierarchicalCatalogPage({ params, searchParams }: CatalogRouteProps) {
  const { catalogRoute } = await params;
  const resolvedSearchParams = await searchParams;
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams.sort : 'newest';

  if (!catalogRoute || catalogRoute.length === 0) {
    notFound();
  }

  const lastSegment = catalogRoute[catalogRoute.length - 1].toLowerCase();

  // =========================================================================
  // CASE A: The destination is a PRODUCT (PDP)
  // =========================================================================
  const productData = await getCachedProductDetailPage(lastSegment);

  if (productData) {
    const { product, relatedProducts, reviews } = productData;
    const user = await getCurrentUser();
    const isLoggedIn = !!user;
    const initialIsSaved = isLoggedIn ? await wishlistService.isSaved(user.id, product.id) : false;

    // Construct hierarchical breadcrumb based on URL segments
    const dynamicBreadcrumbs: Array<{ label: string; href?: string }> = [
      { label: 'Home', href: '/' },
    ];

    let pathAcc = '';
    for (let i = 0; i < catalogRoute.length - 1; i++) {
      const seg = catalogRoute[i];
      pathAcc += `/${seg}`;
      const label = seg.replace(/-/g, ' ').toUpperCase();
      dynamicBreadcrumbs.push({ label, href: pathAcc });
    }
    dynamicBreadcrumbs.push({ label: product.name });

    const imageStringUrls = product.images.map((img) => (typeof img === 'string' ? img : img.url));

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

    const breadcrumbsJsonLd = getBreadcrumbsSchema(
      dynamicBreadcrumbs.map((b) => ({ label: b.label, href: b.href || '#' }))
    );

    return (
      <Container className="py-6 sm:py-10">
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
          <Breadcrumb items={dynamicBreadcrumbs} />

          {/* Top visual detail grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
            {/* Left Column: Image Gallery (7 cols on lg) */}
            <div className="w-full lg:col-span-7">
              <ProductGallery images={product.images} alt={product.name} />
            </div>

            {/* Right Column: Sticky Summary & Purchase Details (5 cols on lg) */}
            <div className="w-full lg:col-span-5 lg:sticky lg:top-24 lg:self-start space-y-6">
              <ProductSummary product={product} />
              <ProductInfo product={product} initialIsSaved={initialIsSaved} />
            </div>
          </div>

          <Separator className="opacity-60" />

          {/* Descriptions and Specs tab */}
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

  // =========================================================================
  // CASE B: The destination is a TAXONOMY LISTING (Attribute / Category / Subcategory)
  // =========================================================================
  if (!db) {
    notFound();
  }

  // Parse segments:
  // Is segment 0 an attribute/audience?
  const firstSeg = catalogRoute[0].toLowerCase();
  const isFirstSegAttribute = KNOWN_ATTRIBUTES.has(firstSeg);

  let attributeVal: string | undefined = undefined;
  let categorySlug: string | undefined = undefined;
  let subcategorySlug: string | undefined = undefined;

  if (isFirstSegAttribute) {
    attributeVal = firstSeg;
    if (catalogRoute.length >= 2) categorySlug = catalogRoute[1].toLowerCase();
    if (catalogRoute.length >= 3) subcategorySlug = catalogRoute[2].toLowerCase();
  } else {
    categorySlug = firstSeg;
    if (catalogRoute.length >= 2) subcategorySlug = catalogRoute[1].toLowerCase();
  }

  const targetCategorySlug = subcategorySlug || categorySlug;

  // Query database category record
  const [targetCategory] = targetCategorySlug
    ? await db
        .select()
        .from(categories)
        .where(
          and(
            eq(categories.slug, targetCategorySlug),
            eq(categories.isActive, true),
            sql`${categories.deletedAt} IS NULL`
          )
        )
        .limit(1)
    : [null];

  // Query database audience record if attribute is present
  const [targetAudience] = attributeVal
    ? await db
        .select()
        .from(audiences)
        .where(eq(audiences.slug, attributeVal))
        .limit(1)
    : [null];

  // If neither category nor audience exists and it's not a known attribute, return 404
  if (!targetCategory && !targetAudience && !isFirstSegAttribute) {
    notFound();
  }

  // Construct page title & breadcrumbs
  const formattedAttr = attributeVal ? attributeVal.toUpperCase() : '';
  const formattedCat = targetCategory ? targetCategory.name.toUpperCase() : (categorySlug?.replace(/-/g, ' ').toUpperCase() || '');
  const formattedSub = subcategorySlug ? subcategorySlug.replace(/-/g, ' ').toUpperCase() : '';

  let pageTitle = formattedSub || formattedCat || `${formattedAttr}'S CATALOGUE`;
  if (attributeVal && (categorySlug || subcategorySlug)) {
    pageTitle = `${formattedAttr} · ${formattedSub || formattedCat}`;
  }

  const breadcrumbParts: string[] = ['LEXIDO'];
  if (attributeVal) breadcrumbParts.push(formattedAttr);
  if (categorySlug) breadcrumbParts.push(formattedCat);
  if (subcategorySlug) breadcrumbParts.push(formattedSub);

  const breadcrumbString = breadcrumbParts.join(' · ');

  // Fetch child categories for subcategory filter pills
  let subtags: string[] = ['All'];
  if (targetCategory) {
    const childCategories = await db
      .select({ name: categories.name, slug: categories.slug })
      .from(categories)
      .where(
        and(
          eq(categories.parentId, targetCategory.id),
          sql`${categories.deletedAt} IS NULL`,
          eq(categories.isActive, true)
        )
      )
      .orderBy(asc(categories.name));

    if (childCategories.length > 0) {
      subtags = ['All', ...childCategories.map((c) => c.name)];
    }
  }

  // Query Products from DB
  const conditions: any[] = [
    sql`${products.deletedAt} IS NULL`,
    eq(products.status, 'active'),
  ];

  // Gender/attribute filter
  if (attributeVal && ['men', 'women', 'kids'].includes(attributeVal)) {
    conditions.push(eq(products.gender, attributeVal));
  }

  // Category condition
  if (targetCategory) {
    const catCondition = or(
      eq(products.categoryId, targetCategory.id),
      sql`exists (
        select 1 from ${productCategories}
        where ${productCategories.productId} = ${products.id} and ${productCategories.categoryId} = ${targetCategory.id}
      )`
    );
    if (catCondition) {
      conditions.push(catCondition);
    }
  }

  let orderByClause = desc(products.createdAt);
  if (sort === 'price-low') orderByClause = asc(products.price);
  if (sort === 'price-high') orderByClause = desc(products.price);

  const dbProducts = await db
    .select({
      product: products,
      category: categories,
      brand: brands,
      primaryImage: sql<string | null>`(select url from ${productImages} where ${productImages.productId} = ${products.id} order by ${productImages.sortOrder} asc limit 1)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(brands, eq(products.brandId, brands.id))
    .where(and(...conditions))
    .orderBy(orderByClause)
    .limit(48);

  const items: ProductData[] = dbProducts.map((p) => ({
    id: p.product.id,
    name: p.product.name,
    slug: p.product.slug,
    price: Number(p.product.price),
    compareAtPrice: p.product.compareAtPrice ? Number(p.product.compareAtPrice) : undefined,
    category: p.category?.name || pageTitle,
    rating: 5.0,
    reviewCount: 0,
    images: p.primaryImage
      ? [p.primaryImage]
      : ['https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800&auto=format&fit=crop'],
    badges: targetCategory?.name ? [targetCategory.name.toUpperCase()] : ['CATALOGUE'],
    inStock: true,
  }));

  const categoryHeroImage = targetCategory?.imageUrl || null;

  return (
    <div className="w-full bg-background min-h-screen">
      {/* Category Hero Banner if Category has Image */}
      {categoryHeroImage && (
        <div className="relative w-full h-56 sm:h-72 lg:h-80 overflow-hidden bg-slate-950">
          <Image
            src={categoryHeroImage}
            alt={pageTitle}
            fill
            priority
            className="object-cover object-center opacity-75"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-[1600px] mx-auto">
            <span className="text-[11px] font-extrabold tracking-[0.25em] text-slate-300 uppercase mb-2">
              {breadcrumbString}
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-white uppercase leading-none">
              {pageTitle}
            </h1>
            {targetCategory?.description && (
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl line-clamp-2">
                {targetCategory.description}
              </p>
            )}
          </div>
        </div>
      )}

      <CategoryViewClient
        category={pageTitle}
        subcategory={subcategorySlug}
        meta={{
          title: pageTitle,
          breadcrumb: breadcrumbString,
          description:
            targetCategory?.description ||
            `Curated ${pageTitle.toLowerCase()} catalog — premium luxury fashion with atelier precision.`,
          subtags,
        }}
        initialItems={items}
      />
    </div>
  );
}

