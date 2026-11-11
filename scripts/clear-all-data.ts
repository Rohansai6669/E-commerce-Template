import postgres from 'postgres';
import { loadEnvConfig } from '@next/env';

async function clearAllData() {
  loadEnvConfig(process.cwd());

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is missing in environment variables');
    process.exit(1);
  }

  console.log('🧹 Clearing all mock data from database...');
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    // Truncate all tables with CASCADE to wipe all mock products, orders, cart, inventory, etc.
    await sql`
      TRUNCATE TABLE 
        order_items,
        orders,
        consignment_items,
        consignments,
        product_images,
        product_variants,
        variant_attribute_values,
        product_attribute_values,
        product_attributes,
        products,
        categories,
        brands,
        global_attribute_values,
        global_attributes,
        coupons,
        shipping_methods,
        supplier_inventory_snapshots,
        supplier_inventory_logs,
        supplier_product_variants,
        supplier_products,
        supplier_ledger,
        suppliers,
        ticket_messages,
        support_tickets,
        order_returns,
        reviews,
        wishlists,
        cart_items,
        carts,
        addresses
      CASCADE;
    `;
    console.log('✅ Successfully cleared all mock data from database!');
  } catch (error: any) {
    console.warn('Notice during CASCADE truncation (some tables may not exist yet):', error?.message || error);
    
    // Fallback: Drop-safe DELETE for existing tables
    const tableList = [
      'order_items', 'orders', 'consignment_items', 'consignments',
      'product_images', 'product_variants', 'variant_attribute_values',
      'product_attribute_values', 'product_attributes', 'products',
      'categories', 'brands', 'global_attribute_values', 'global_attributes',
      'coupons', 'shipping_methods', 'supplier_inventory_snapshots',
      'supplier_inventory_logs', 'supplier_product_variants', 'supplier_products',
      'supplier_ledger', 'suppliers', 'ticket_messages', 'support_tickets',
      'order_returns', 'reviews', 'wishlists', 'cart_items', 'carts', 'addresses'
    ];

    for (const table of tableList) {
      try {
        await sql.unsafe(`DELETE FROM "${table}";`);
      } catch {
        // Table doesn't exist yet, ignore
      }
    }
    console.log('✅ Clean operation completed with fallback strategy.');
  } finally {
    await sql.end();
    process.exit(0);
  }
}

clearAllData();
