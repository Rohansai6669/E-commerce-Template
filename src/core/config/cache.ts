export const cacheConfig = {
  defaultTtl: 3600, // 1 hour in seconds
  staticTtl: 86400, // 24 hours in seconds
  revalidationPaths: {
    products: '/products',
    categories: '/categories',
    orders: '/orders',
  },
} as const;
