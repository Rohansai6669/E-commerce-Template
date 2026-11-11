import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as authSchema from './schema/auth';
import * as catalogCategoriesSchema from './schema/catalog/categories';
import * as catalogBrandsSchema from './schema/catalog/brands';
import * as catalogProductsSchema from './schema/catalog/products';
import * as catalogVariantsSchema from './schema/catalog/variants';
import * as catalogImagesSchema from './schema/catalog/images';
import * as inventorySchema from './schema/inventory';
import * as cartSchema from './schema/cart';
import * as orderSchema from './schema/order';
import * as paymentSchema from './schema/payment';
import * as addressSchema from './schema/address';
import * as marketingSchema from './schema/marketing';
import * as notificationSchema from './schema/notification';
import * as reviewsSchema from './schema/reviews';
import * as wishlistSchema from './schema/wishlist';
import * as enumsSchema from './schema/enums';
import * as relations from './relations';

// Marketplace Schemas
import * as suppliersSchema from './schema/marketplace/suppliers';
import * as supplierInvitationsSchema from './schema/marketplace/invitations';
import * as supplierProductsSchema from './schema/catalog/supplier-products';
import * as supplierProductVariantsSchema from './schema/catalog/supplier-product-variants';
import * as supplierOrdersSchema from './schema/marketplace/supplier-orders';
import * as supplierLedgerSchema from './schema/marketplace/supplier-ledger';
import * as supplierInventorySchema from './schema/marketplace/supplier-inventory';
import * as ticketsSchema from './schema/support/tickets';
import * as returnsSchema from './schema/support/returns';
import * as payoutsSchema from './schema/finance/payouts';
import * as auditSchema from './schema/audit';
import * as promotionsSchema from './schema/catalog/promotions';
import * as catalogMediaSchema from './schema/catalog/media';
import * as cmsSchema from './schema/cms';

import * as mediaSchema from './schema/media';

import * as catalogAudiencesSchema from './schema/catalog/audiences';
import * as catalogCollectionsSchema from './schema/catalog/collections';
import * as catalogNavigationSchema from './schema/catalog/navigation';
import * as catalogProductTaxonomySchema from './schema/catalog/product-taxonomy';

const schema = {
  ...enumsSchema,
  ...authSchema,
  ...catalogCategoriesSchema,
  ...catalogBrandsSchema,
  ...catalogProductsSchema,
  ...catalogVariantsSchema,
  ...catalogImagesSchema,
  ...catalogAudiencesSchema,
  ...catalogCollectionsSchema,
  ...catalogNavigationSchema,
  ...catalogProductTaxonomySchema,
  ...mediaSchema,
  ...inventorySchema,
  ...cartSchema,
  ...orderSchema,
  ...paymentSchema,
  ...addressSchema,
  ...marketingSchema,
  ...notificationSchema,
  ...reviewsSchema,
  ...wishlistSchema,
  ...suppliersSchema,
  ...supplierInvitationsSchema,
  ...supplierProductsSchema,
  ...supplierProductVariantsSchema,
  ...supplierOrdersSchema,
  ...supplierLedgerSchema,
  ...supplierInventorySchema,
  ...ticketsSchema,
  ...returnsSchema,
  ...payoutsSchema,
  ...auditSchema,
  ...promotionsSchema,
  ...catalogMediaSchema,
  ...cmsSchema,
  ...relations,
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set in environment variables');
}

// Establish a singleton connection pool optimized for low-latency with Supabase Transaction pooler
const globalForDb = globalThis as unknown as { client: ReturnType<typeof postgres> | undefined };
const client =
  globalForDb.client ||
  postgres(databaseUrl, {
    max: 12,
    idle_timeout: 120,
    max_lifetime: 1800,
    connect_timeout: 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== 'production') {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
