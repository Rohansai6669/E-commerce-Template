import { cache as reactCache } from 'react';
import { productRepository } from '../product/product.repository';
import { productDetailService } from '../storefront/product-detail.service';
import { type ProductFilters } from '../product/product.types';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  tags: string[];
}

// Global in-memory cache surviving across requests in the Node server process
const globalForCache = globalThis as unknown as {
  memoryCache: Map<string, CacheEntry<unknown>> | undefined;
  inFlight: Map<string, Promise<unknown>> | undefined;
};

const memoryCache = globalForCache.memoryCache || new Map<string, CacheEntry<unknown>>();
const inFlight = globalForCache.inFlight || new Map<string, Promise<unknown>>();

if (process.env.NODE_ENV !== 'production') {
  globalForCache.memoryCache = memoryCache;
  globalForCache.inFlight = inFlight;
}

/**
 * High-speed cached fetcher with in-flight request deduplication and memory TTL.
 */
async function getOrSetCached<T>(
  key: string,
  ttlMs: number,
  tags: string[],
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  // Deduplicate simultaneous in-flight database requests
  if (inFlight.has(key)) {
    return inFlight.get(key) as Promise<T>;
  }

  const promise = (async () => {
    try {
      const data = await fetcher();
      memoryCache.set(key, {
        value: data,
        expiresAt: Date.now() + ttlMs,
        tags,
      });
      return data;
    } finally {
      inFlight.delete(key);
    }
  })();

  inFlight.set(key, promise);
  return promise;
}

/**
 * Invalidates in-memory cache entries matching any of the specified tags.
 */
export function invalidateCacheTag(...tags: string[]) {
  for (const [key, entry] of memoryCache.entries()) {
    if (tags.some((tag) => entry.tags.includes(tag))) {
      memoryCache.delete(key);
    }
  }
}

/**
 * Purges the entire in-memory cache.
 */
export function clearAllMemoryCache() {
  memoryCache.clear();
  inFlight.clear();
}

/**
 * Cached fetch wrapper for list of products catalog.
 * Memoized per filter set with a 30s TTL.
 */
export async function getCachedProducts(filters: ProductFilters) {
  const cacheKey = `products_${JSON.stringify(filters)}`;
  return getOrSetCached(cacheKey, 30 * 1000, ['products'], () =>
    productRepository.getProducts(filters)
  );
}

/**
 * Cached fetch wrapper for single detailed product by slug.
 * Request-deduplicated via React.cache and memory-cached with a 60s TTL.
 */
export const getCachedProductBySlug = reactCache(async (slug: string) => {
  const cacheKey = `product_slug_${slug}`;
  return getOrSetCached(cacheKey, 60 * 1000, ['products', `product:${slug}`], () =>
    productRepository.getProductBySlug(slug)
  );
});

/**
 * Cached fetch wrapper for featured recommendation lists.
 */
export async function getCachedFeaturedProducts(limit = 4) {
  const cacheKey = `featured_products_${limit}`;
  return getOrSetCached(cacheKey, 60 * 1000, ['products', 'featured-products'], () =>
    productRepository.getFeaturedProducts(limit)
  );
}

/**
 * Cached fetch wrapper for categories catalog taxonomy list.
 * 5-minute TTL - eliminates repeated database trips for static taxonomy.
 */
export const getCachedCategories = reactCache(async () => {
  return getOrSetCached('categories_list', 5 * 60 * 1000, ['categories'], () =>
    productRepository.getCategories()
  );
});

/**
 * Cached fetch wrapper for brands taxonomy list.
 * 5-minute TTL.
 */
export const getCachedBrands = reactCache(async () => {
  return getOrSetCached('brands_list', 5 * 60 * 1000, ['brands'], () =>
    productRepository.getBrands()
  );
});

/**
 * Cached fetch wrapper for storefront product filtering facets.
 * 60-second TTL.
 */
export const getCachedFilterFacets = reactCache(async () => {
  return getOrSetCached(
    'product_filter_facets',
    60 * 1000,
    ['products', 'categories', 'brands', 'collections', 'attributes'],
    () => productRepository.getFilterFacets()
  );
});

/**
 * Cached fetch wrapper for PDP details (includes product, recommendations, and reviews).
 * React request-deduplicated and 60-second memory cache.
 */
export const getCachedProductDetailPage = reactCache(async (slug: string) => {
  const cacheKey = `pdp_details_${slug}`;
  return getOrSetCached(
    cacheKey,
    60 * 1000,
    ['products', `product:${slug}`, 'reviews'],
    () => productDetailService.getProductDetail(slug)
  );
});

/**
 * Mutation helpers to invalidate caches when admin creates or updates items
 */
export function invalidateProductCache(slug?: string) {
  if (slug) {
    invalidateCacheTag('products', `product:${slug}`);
  } else {
    invalidateCacheTag('products');
  }
}

export function invalidateCategoryCache() {
  invalidateCacheTag('categories', 'products');
}

export function invalidateBrandCache() {
  invalidateCacheTag('brands', 'products');
}
