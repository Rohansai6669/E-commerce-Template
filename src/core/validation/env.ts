import { z } from 'zod';

const envSchema = z.object({
  // Core
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // SMTP Email
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USERNAME: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),

  // Resend API
  RESEND_API_KEY: z.string().min(1),

  // Payments
  RAZORPAY_KEY: z.string().min(1),
  RAZORPAY_SECRET: z.string().min(1),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
  NEXT_PUBLIC_R2_PUBLIC_URL: z.string().url(),
});

const clientSchema = envSchema.pick({
  NODE_ENV: true,
  NEXT_PUBLIC_APP_URL: true,
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_R2_PUBLIC_URL: true,
});

const isServer = typeof window === 'undefined';

let parsedEnv: z.infer<typeof envSchema>;

if (isServer) {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    throw new Error('Invalid environment variables');
  }
  parsedEnv = result.data;
} else {
  const clientEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
  };
  const result = clientSchema.safeParse(clientEnv);
  if (!result.success) {
    console.error('❌ Invalid client environment variables:', result.error.format());
    throw new Error('Invalid client environment variables');
  }
  parsedEnv = result.data as unknown as z.infer<typeof envSchema>;
}

export const env = parsedEnv;
export type EnvType = z.infer<typeof envSchema>;
