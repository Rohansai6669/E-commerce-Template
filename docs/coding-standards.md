# Coding Standards and Conventions

To preserve code quality, developer velocity, and maintainability, all additions to the codebase must follow these coding conventions.

## 1. Directory Structure Conventions

Always group files by feature domain rather than general technology types. Maintain the domain folder architecture under `src/core/`:

- **Domain Model Types**: Defined in `src/core/<domain>/<domain>.types.ts`
- **Data Access Layer**: Implemented inside `src/core/<domain>/<domain>.repository.ts`
- **Business Layer / Calculations**: Implemented in `src/core/<domain>/<domain>.service.ts`
- **UI Data Formatting**: Formatted via presenters inside `src/core/<domain>/<domain>.presenter.ts`
- **Data Model Mappers**: Implemented inside `src/core/<domain>/<domain>.mapper.ts`

---

## 2. Naming Conventions

- **Database Tables**: Plural Snake Case (e.g. `order_items`, `product_variants`).
- **TypeScript interfaces / Types**: Pascal Case (e.g. `PlacedOrder`, `ProductCardModel`).
- **Repositories**: Pascal Case ending in `Repository` (e.g. `OrderRepository`). Export a constant lowercase default instance (e.g. `export const orderRepository = new OrderRepository();`).
- **Services**: Pascal Case ending in `Service` (e.g. `SearchService`). Export a constant lowercase default instance (e.g. `export const searchService = new SearchService();`).
- **Server Actions**: Camel Case ending in `Action` (e.g. `placeOrderAction`, `deleteReviewAction`).
- **Components**: Pascal Case matching folder structures (e.g. `CartSummaryComponent`).

---

## 3. Presenters & Formatting

Do not put formatting logic (e.g. currency formatting, date patterns, progress bars calculations) inside React components. Write a presenter:

```typescript
// Good: Presenter formatting
export class CartPresenter {
  static formatPrice(amount: number): string {
    return `$${amount.toFixed(2)}`;
  }

  static getShippingProgress(subtotal: number) {
    const isFree = subtotal >= 75.0;
    const progress = Math.min((subtotal / 75.0) * 100, 100);
    return { isFree, progress };
  }
}
```

Components should consume clean values from the presenter.

---

## 4. Database Access Constraints

- **Never** query Drizzle db directly inside React client components. Use Server Actions or retrieve via RSC server pages.
- **Never** put raw SQL statements inside UI code. Always isolate them inside repository class methods.
- Ensure soft-delete audits are checked in active listing lookups:
  `and(eq(table.isActive, true), sql`${table.deletedAt} IS NULL`)`

---

## 5. Security & Validation

- Validate all inputs on the server.
- Mask internal system details (e.g. database schema matches or credential checks). Provide generic errors.
- Always use `useTransition` or `startTransition` inside Client Components when triggering Server Actions to handle pending loading states cleanly and prevent native form submissions from blocking threads.
