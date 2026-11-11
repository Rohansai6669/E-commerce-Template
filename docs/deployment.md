# Deployment and Operations Guide

This guide describes environment requirements, Supabase dashboard setups, and deployment command structures to transition this application to production.

## 1. Environment Variables

Define the following environment variables in your production hosting platform (e.g. Vercel, AWS, or Docker runtime):

```env
# Database Credentials
DATABASE_URL=postgresql://postgres:[password]@db.[id].supabase.co:5432/postgres

# Supabase Auth Keys
NEXT_PUBLIC_SUPABASE_URL=https://[id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...

# Storefront URL Setup
NEXT_PUBLIC_APP_URL=https://your-store.com
```

---

## 2. Supabase Authentication Dashboard

To support verification callback links, OAuth providers, and recover triggers, configure the following settings in your Supabase project dashboard:

1. Navigate to **Authentication > URL Configuration**.
2. Set the **Site URL** to your canonical storefront domain:
   `https://your-store.com`
3. Add the redirect callback endpoint to **Redirect URLs**:
   `https://your-store.com/auth/callback`

---

## 3. Database Schema Sync

To apply database tables, indexes, and constraint updates, run Drizzle kit commands prior to building production code:

```bash
# Push database changes directly to Postgres schema
npx drizzle-kit push
```

---

## 4. Production Build & Execution

The storefront compiles optimized static pages with dynamic server-streamed content:

```bash
# Build production bundles
npm run build

# Start production server
npm run start
```

---

## 5. Operations Best Practices

- **Coupons**: Manage promocodes securely via database inserts (`marketing.coupons` table). Avoid hardcoding discount properties in deployment variables.
- **Rate Limiters**: Swapping `MemoryRateLimiter` for a Redis-backed rate limiter is recommended for clustered, multi-instance production environments to prevent state desynchronization.
