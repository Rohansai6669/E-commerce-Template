import { SITE_URL } from './metadata';

/**
 * Generates structured JSON-LD Organization schema markup.
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: 'Modern Storefront',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://facebook.com/modernstorefront',
      'https://instagram.com/modernstorefront',
      'https://twitter.com/modernstorefront',
    ],
  };
}

/**
 * Generates structured JSON-LD WebSite and SearchAction schema markup.
 */
export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Modern Storefront',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generates structured JSON-LD BreadcrumbList schema markup.
 */
export function getBreadcrumbsSchema(items: Array<{ label: string; href?: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.label,
      item: item.href ? `${SITE_URL}${item.href}` : undefined,
    })),
  };
}

/**
 * Generates structured JSON-LD Product schema markup with offers & ratings.
 */
export function getProductSchema(product: {
  id: string;
  name: string;
  description: string | null;
  images: string[];
  price: string | number;
  quantity: number;
  slug: string;
  rating?: number | null;
  reviewsCount?: number;
}) {
  const priceVal = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${SITE_URL}/products/${product.slug}/#product`,
    name: product.name,
    image: product.images,
    description: product.description || `Purchase ${product.name} from our storefront.`,
    offers: {
      '@type': 'Offer',
      price: priceVal.toFixed(2),
      priceCurrency: 'INR',
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.quantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/products/${product.slug}`,
    },
    aggregateRating: product.rating && product.reviewsCount
      ? {
          '@type': 'AggregateRating',
          ratingValue: product.rating.toFixed(1),
          reviewCount: product.reviewsCount,
        }
      : undefined,
  };
}
