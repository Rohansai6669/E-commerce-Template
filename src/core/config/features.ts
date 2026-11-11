export const featureFlags = {
  wishlist: true,
  reviews: false,
  coupons: true,
  blog: false,
  analytics: true,
  emailVerification: true,
  phoneOtp: false,
} as const;

export type FeatureKey = keyof typeof featureFlags;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return featureFlags[key] ?? false;
}
