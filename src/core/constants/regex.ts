export const REGEX = {
  // Simple validation checks
  PHONE: /^\+?[1-9]\d{1,14}$/, // E.164 phone validation
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // Strong password check
  ZIP: /^\d{5}(-\d{4})?$/, // Standard US zip code
} as const;
