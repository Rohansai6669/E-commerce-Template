import { relations } from 'drizzle-orm';
import { profiles } from './schema/auth';
import { categories } from './schema/catalog/categories';
import { brands } from './schema/catalog/brands';
import { products } from './schema/catalog/products';
import { productImages } from './schema/catalog/images';
import { productVariants } from './schema/catalog/variants';
import { inventory, inventoryMovements, inventoryReservations } from './schema/inventory';
import { carts, cartItems } from './schema/cart';
import { shippingMethods, orders, orderStatusHistory, orderItems } from './schema/order';
import { payments } from './schema/payment';
import { coupons } from './schema/marketing';
import { reviews } from './schema/reviews';
import { wishlistItems } from './schema/wishlist';
import { notifications } from './schema/notification';
import { customerAddresses } from './schema/address';

export const profilesRelations = relations(profiles, ({ many }) => ({
  carts: many(carts),
  orders: many(orders),
  wishlistItems: many(wishlistItems),
  reviews: many(reviews),
  notifications: many(notifications),
  addresses: many(customerAddresses),
}));

export const customerAddressesRelations = relations(customerAddresses, ({ one }) => ({
  profile: one(profiles, {
    fields: [customerAddresses.profileId],
    references: [profiles.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'categoriesParent',
  }),
  children: many(categories, {
    relationName: 'categoriesParent',
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  reviews: many(reviews),
}));

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  inventory: one(inventory),
}));

export const inventoryRelations = relations(inventory, ({ one, many }) => ({
  product: one(products, {
    fields: [inventory.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
  movements: many(inventoryMovements),
  reservations: many(inventoryReservations),
}));

export const cartsRelations = relations(carts, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [carts.profileId],
    references: [profiles.id],
  }),
  items: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [orders.profileId],
    references: [profiles.id],
  }),
  coupon: one(coupons, {
    fields: [orders.couponId],
    references: [coupons.id],
  }),
  shippingMethod: one(shippingMethods, {
    fields: [orders.shippingMethodId],
    references: [shippingMethods.id],
  }),
  items: many(orderItems),
  statusHistory: many(orderStatusHistory),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  profile: one(profiles, {
    fields: [reviews.profileId],
    references: [profiles.id],
  }),
}));

export const wishlistItemsRelations = relations(wishlistItems, ({ one }) => ({
  product: one(products, {
    fields: [wishlistItems.productId],
    references: [products.id],
  }),
  profile: one(profiles, {
    fields: [wishlistItems.profileId],
    references: [profiles.id],
  }),
}));
