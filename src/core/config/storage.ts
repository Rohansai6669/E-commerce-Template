import { env } from '../validation/env';

export const storageConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedImageMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  allowedDocMimes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
  r2: {
    accountId: env.CLOUDFLARE_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucketName: env.R2_BUCKET_NAME,
    publicUrl: env.NEXT_PUBLIC_R2_PUBLIC_URL,
  },
  buckets: {
    public: 'public-assets',
    private: 'private-documents',
    avatars: 'avatars',
    products: 'products',
  },
} as const;
