export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PRODUCTS: {
    LIST: '/dashboard/products',
    DETAILS: (id: string) => `/dashboard/products/${id}`,
    CREATE: '/dashboard/products/create',
    EDIT: (id: string) => `/dashboard/products/${id}/edit`,
  },
  CUSTOMERS: {
    LIST: '/dashboard/customers',
    DETAILS: (id: string) => `/dashboard/customers/${id}`,
  },
  INVENTORY: {
    LIST: '/dashboard/inventory',
  },
  ORDERS: {
    LIST: '/dashboard/orders',
    DETAILS: (id: string) => `/dashboard/orders/${id}`,
  },
  SETTINGS: '/dashboard/settings',
} as const;
