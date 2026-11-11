export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  PRODUCTS: '/api/products',
  ORDERS: '/api/orders',
  CUSTOMERS: '/api/customers',
  SETTINGS: '/api/settings',
} as const;
