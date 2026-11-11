export const cacheKeys = {
  products: {
    all: () => 'products:all',
    list: (query: Record<string, unknown>) => `products:list:${JSON.stringify(query)}`,
    detail: (id: string) => `products:detail:${id}`,
  },
  categories: {
    all: () => 'categories:all',
  },
  customers: {
    detail: (id: string) => `customers:detail:${id}`,
  },
  orders: {
    detail: (id: string) => `orders:detail:${id}`,
  },
} as const;
