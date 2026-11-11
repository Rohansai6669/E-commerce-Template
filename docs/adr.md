# Architecture Decision Records (ADR)

This document contains brief summaries of key architectural choices made during the evolution of this storefront.

## ADR 1: Caching Strategy - Prefer Cache Components (`use cache`)

- **Context**: Older Next.js models used `unstable_cache` to cache database lookups, which was complex and decoupled from component trees.
- **Decision**: Adopt the Next.js stabilized Cache Components model (`'use cache'`) coupled with `cacheTag()` and `revalidateTag()`.
- **Consequence**: Keeps caching declarative, co-located within rendering blocks, and automatically handles granular tag-based purging upon database mutations.

---

## ADR 2: Security - Abstracted Rate Limiter Interface

- **Context**: Public guess order tracking needs protection against credential and order reference enumeration sweeps.
- **Decision**: Define a strict `RateLimiter` interface and use a memory sliding-window class for local development environments.
- **Consequence**: Protects tracking forms immediately out-of-the-box. Facilitates swapping out memory caches for production Redis setups without altering caller parameters in Server Actions.

---

## ADR 3: Domain Isolation - Search Decoupling

- **Context**: Searching was initially a method under product listing controllers, which limited independent tuning of search scoring and normalization.
- **Decision**: Decouple keyword searching into its own isolated Service domain (`SearchService`), separated from standard product listing logic.
- **Consequence**: Enables search capabilities to grow independently (e.g. adding keyword normalization or swapping Drizzle search filters for dedicated indices like Elastic/Algolia) without impacting standard catalog repositories.

---

## ADR 4: Unified InfoLayout for Informational CMS Pages

- **Context**: The store has several policy pages (Terms, Privacy, Refund, Shipping) which share a visual column structure and navigation links sidebar.
- **Decision**: Build a modular `InfoLayout` shell containing the sidebar links, wrapping static markdown/RSC pages.
- **Consequence**: Substantially reduces layout redundancy and simplifies adding new policies, keeping static pages easy to maintain.
