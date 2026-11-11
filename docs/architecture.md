# Architecture Overview

This storefront and administration portal is designed using clean, domain-driven boundaries and a structured, unidirectional layering architecture. It enforces strict separation of concerns, enabling high performance, rapid feature growth, and stable operations.

## Layering Model

The project adheres to a 4-tier server-side execution model, preventing business logic from leaking into UI components:

```text
       Server Actions (API Gateways)
                    ↓
        Services (Business Domain Rules)
                    ↓
        Repositories (Database Access)
                    ↓
           Drizzle ORM & Postgres
```

### 1. User Interface / React Server Components (RSC)
- **Storefront**: Consumes data directly via server-side Repository or Service calls in Server Components. client-side mutations invoke Server Actions.
- **Admin**: Operates under administrative guards. Uses secure Server Actions to perform catalog adjustments, promotion definitions, and reviews moderation.

### 2. Server Actions (Mutations)
- Located in `src/app/actions/`.
- Serve as the application's secure API entrypoints. Exposes asynchronous endpoints to client-side components without bundling node-specific database drivers into client packages.

### 3. Service Layer (Orchestration)
- Located in `src/core/<domain>/<domain>.service.ts`.
- Orchestrates multi-step logic (e.g. validating inventory, calculating tax, checking coupon date ranges, sorting taxonomy, and calling payment gateways).

### 4. Repository Layer (Data Mapping)
- Located in `src/core/<domain>/<domain>.repository.ts`.
- Abstracts SQL database operations behind clean methods. Uses Drizzle ORM to perform queries, joins, transactions, and mutations.

---

## Domain Boundaries

The application is structured into isolated domains under `src/core/`:

```text
src/core/
├── product      - Catalog items, images, option structures, and variants.
├── category     - Catalog taxonomy classifications and SEO breadcrumbs.
├── brand        - Manufacturer brand metadata and filters.
├── cart         - Customer cart schemas, discount application, and calculations.
├── checkout     - Address verification, shipping methods, and stock updates.
├── order        - Order placement, historical tracking, and status transitions.
├── payment      - Encryption payloads and credit processors.
├── coupon       - Database-backed promotional codes and limit validations.
├── customer     - Profiles directory and customer accounts.
├── security     - Rate limiting bounds, origin validators, and cookie flags.
├── performance  - Cache Component tagging and revalidations.
└── config       - Unified business defaults, limits, and support contact details.
```

---

## Shared Configurations & Security

- **Centralized Configuration**: `src/core/config/` hosts default store variables (`siteConfig`, `commerceConfig`, `securityConfig`) ensuring single source of truth across customer details, shipping rates, and security parameters.
- **Rate Limiting Guard**: Defends public guest tracking systems from enumeration attacks via the `RateLimiter` interface. Hidden behind memory-backed implementations in dev, ready to swap to Redis in production.
