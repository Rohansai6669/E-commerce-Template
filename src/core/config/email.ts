import { env } from '../validation/env';

export const emailConfig = {
  smtp: {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    username: env.SMTP_USERNAME,
    password: env.SMTP_PASSWORD,
  },
  resend: {
    apiKey: env.RESEND_API_KEY,
  },
  defaultFrom: 'no-reply@example.com',
  supportEmail: 'support@example.com',
  systemName: 'Ecommerce Starter',
} as const;
