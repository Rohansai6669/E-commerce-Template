export const securityConfig = {
  rateLimit: {
    guestTracking: {
      limit: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes window
    },
    loginAttempts: {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    },
  },
  password: {
    minLength: 8,
    requireNumbers: true,
    requireSpecialChars: true,
  },
  cookies: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
  },
  cors: {
    allowedOrigins: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    ],
  },
} as const;

export default securityConfig;
