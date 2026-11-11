import { STORAGE_BUCKETS } from '../constants/storage';

export const BUCKETS = {
  PUBLIC: STORAGE_BUCKETS.ASSETS,
  PRIVATE: STORAGE_BUCKETS.DOCUMENTS,
  AVATARS: STORAGE_BUCKETS.AVATARS,
  PRODUCTS: STORAGE_BUCKETS.PRODUCTS,
} as const;

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS];
