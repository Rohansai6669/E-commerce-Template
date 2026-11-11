import { env } from '../validation/env';

export const appConfig = {
  name: 'Ecommerce Starter',
  version: '1.0.0',
  env: env.NODE_ENV,
  url: env.NEXT_PUBLIC_APP_URL,
  apiPrefix: '/api',
  isProduction: env.NODE_ENV === 'production',
  isDevelopment: env.NODE_ENV === 'development',
  isTest: env.NODE_ENV === 'test',
} as const;
