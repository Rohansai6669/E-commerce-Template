# Request and Data Flow

This document details how requests travel through domain layers for core application features.

## 1. Checkout and Order Placement

The checkout pipeline handles stock reservation, total calculations, transaction payment, and database storage inside a single, secure sequence:

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant CheckoutAction as Server Action (placeOrderAction)
    participant CheckoutService as CheckoutService
    participant Repository as OrderRepository
    participant Database as Postgres Database
    participant Payment as Payment Gateway

    Customer->>CheckoutAction: Click Place Order
    CheckoutAction->>CheckoutService: Validate Inventory (stock counts)
    CheckoutService-->>CheckoutAction: Stock Verified
    CheckoutAction->>CheckoutService: Calculate Totals (subtotal, tax, shipping, coupon discount)
    CheckoutService-->>CheckoutAction: Calculated Totals
    CheckoutAction->>Repository: Create Order (params)
    activate Repository
    Repository->>Database: Transaction: Insert Order & Line Items
    Database-->>Repository: Order ID & Order Number
    Repository-->>CheckoutAction: Persisted Details
    deactivate Repository
    CheckoutAction->>Payment: Process Payment (amount, currency, email)
    Payment-->>CheckoutAction: Payment Confirmed (success)
    CheckoutAction-->>Customer: Order Confirmation View (viewModel)
```

---

## 2. Guest Order Tracking

The public guest tracking flow implements security measures (rate limits and data exposure controls) to prevent harvesting order information:

```mermaid
graph TD
    A[Customer submits Order ID & Email] --> B[Retrieve Caller IP address from headers]
    B --> C{Check RateLimiter limits}
    C -- Exceeded --> D[Return Rate Limit Error: 429 Status]
    C -- Under Limits --> E[Query Order Repository]
    E --> F[SQL Lookup: Search in shippingAddress JSONB fields]
    F --> G{Match Found?}
    G -- No Match --> H[Return generic lookup failure message]
    G -- Match Found --> I[Map status values: pending / processing / shipped / delivered]
    I --> J[Return visual timeline progress payload]
```

---

## 3. Supabase Auth Redirects

Secure verification callbacks map state transitions upon user email confirmations, magic link clicks, and OAuth redirect responses:

```text
Supabase Email Verification Link
              ↓
  Redirects with auth code (?code=...)
              ↓
  [GET] /auth/callback/route.ts
              ↓
  Exchanges code for cookies session (Supabase client)
              ↓
  Verifies local environment variables / origins
              ↓
  Redirects to customer dashboard (/account)
```
