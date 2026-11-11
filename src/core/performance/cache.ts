import { cacheTag } from 'next/cache';
import { productRepository } from '../product/product.repository';
import { type ProductFilters } from '../product/product.types';

/**
 * Cached fetch wrapper for list of products catalog.
 */
export async function getCachedProducts(filters: ProductFilters) {
  'use cache';
  cacheTag('products');
  return productRepository.getProducts(filters);
}

/**
 * Cached fetch wrapper for single detailed product by slug.
 */
export async function getCachedProductBySlug(slug: string) {
  'use cache';
  cacheTag(`product:${slug}`, 'products');
  return productRepository.getProductBySlug(slug);
}

/**
 * Cached fetch wrapper for featured recommendation lists.
 */
export async function getCachedFeaturedProducts(limit = 4) {
  'use cache';
  cacheTag('products', 'featured-products');
  return productRepository.getFeaturedProducts(limit);
}

/**
 * Cached fetch wrapper for categories catalog taxonomy list.
 */
export async function getCachedCategories() {
  'use cache';
  cacheTag('categories');
  return productRepository.getCategories();
}

import { productDetailService } from '../storefront/product-detail.service';

/**
 * Cached fetch wrapper for brands taxonomy list.
 */
export async function getCachedBrands() {
  'use cache';
  cacheTag('brands');
  return productRepository.getBrands();
}

/**
 * Cached fetch wrapper for storefront product filtering facets.
 */
export async function getCachedFilterFacets() {
  'use cache';
  cacheTag('products', 'categories', 'brands', 'collections', 'attributes');
  return productRepository.getFilterFacets();
}

/**
 * Cached fetch wrapper for PDP details (includes product, recommendations, and reviews).
 */
export async function getCachedProductDetailPage(slug: string) {
  'use cache';
  cacheTag(`product:${slug}`, 'products', 'reviews');
  return productDetailService.getProductDetail(slug);
}
