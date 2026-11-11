export const CACHE_TAGS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  CUSTOMERS: 'customers',
  ORDERS: 'orders',
  SETTINGS: 'settings',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];
