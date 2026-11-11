import { type Metadata } from 'next';

/**
 * Base site URL environment helper.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://ecommerce-storefront.vercel.app';

/**
 * Generates reusable metadata headers, appending canonical links, OG, and Twitter details.
 */
export function generateStorefrontMetadata(params: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  noIndex?: boolean;
}): Metadata {
  const canonicalUrl = `${SITE_URL}${params.path}`;
  const defaultImage = `${SITE_URL}/og-image.jpg`;
  const finalImage = params.imageUrl || defaultImage;

  return {
    title: `${params.title} | Modern Storefront`,
    description: params.description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: params.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      title: params.title,
      description: params.description,
      url: canonicalUrl,
      siteName: 'Modern Storefront',
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: params.title,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: params.title,
      description: params.description,
      images: [finalImage],
      creator: '@storefront',
    },
  };
}
