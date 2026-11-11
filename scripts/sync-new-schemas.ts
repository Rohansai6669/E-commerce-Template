import fs from 'fs';
import path from 'path';

// Parse .env.local or .env to populate process.env before importing DB
const envPath = path.resolve(__dirname, '../.env.local');
const fallbackEnvPath = path.resolve(__dirname, '../.env');

const targetEnv = fs.existsSync(envPath) ? envPath : fs.existsSync(fallbackEnvPath) ? fallbackEnvPath : null;

if (targetEnv) {
  const content = fs.readFileSync(targetEnv, 'utf-8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.substring(0, idx).trim();
      let value = trimmed.substring(idx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

import { sql } from 'drizzle-orm';

/**
 * Ensures physical PostgreSQL tables and columns match newly added Drizzle schema definitions.
 */
async function syncNewSchemas() {
  console.log('🔄 Starting physical PostgreSQL database schema synchronization...');

  try {
    // Dynamic import to guarantee process.env.DATABASE_URL is set before DB initialization
    const { db } = await import('../src/lib/db');

    // 1. Update supplier_products table columns
    await db.execute(sql`
      ALTER TABLE supplier_products
      ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft' NOT NULL,
      ADD COLUMN IF NOT EXISTS rejection_reason text,
      ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS reviewed_at timestamp with time zone;
    `);
    console.log('✅ Synchronized supplier_products approval columns.');

    // 2. Create supplier_product_approval_events table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS supplier_product_approval_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
        from_status text NOT NULL,
        to_status text NOT NULL,
        actor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        reason text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb NOT NULL
      );
    `);
    console.log('✅ Synchronized supplier_product_approval_events table.');

    // 3. Update reviews table columns
    await db.execute(sql`
      ALTER TABLE reviews
      ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved' NOT NULL,
      ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone,
      ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS moderation_reason text,
      ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
      ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES profiles(id) ON DELETE SET NULL;
    `);
    console.log('✅ Synchronized reviews moderation & soft-delete columns.');

    // 4. Create product_media table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS product_media (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
        storage_key text NOT NULL,
        cdn_url text NOT NULL,
        alt_text text,
        sort_order integer DEFAULT 0 NOT NULL,
        media_type text DEFAULT 'image' NOT NULL,
        is_primary boolean DEFAULT false NOT NULL,
        width integer,
        height integer,
        file_size integer,
        mime_type text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);
    console.log('✅ Synchronized product_media table.');

    // 5. Create sales_campaigns table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS sales_campaigns (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        description text,
        discount_type text NOT NULL,
        discount_value numeric(12, 2) NOT NULL,
        starts_at timestamp with time zone NOT NULL,
        ends_at timestamp with time zone NOT NULL,
        status text DEFAULT 'draft' NOT NULL,
        priority integer DEFAULT 100 NOT NULL,
        is_stackable boolean DEFAULT false NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      );
      ALTER TABLE sales_campaigns ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
    `);
    console.log('✅ Synchronized sales_campaigns table.');

    // 6. Create promotion_offers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS promotion_offers (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text NOT NULL,
        owner_type text DEFAULT 'platform' NOT NULL,
        owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        discount_type text NOT NULL,
        discount_value numeric(12, 2) NOT NULL,
        priority integer DEFAULT 50 NOT NULL,
        is_stackable boolean DEFAULT false NOT NULL,
        status text DEFAULT 'active' NOT NULL,
        starts_at timestamp with time zone,
        ends_at timestamp with time zone,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      );
      ALTER TABLE promotion_offers ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone;
    `);
    console.log('✅ Synchronized promotion_offers table.');

    // 7. Create promotion_events table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS promotion_events (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        entity_type text NOT NULL,
        entity_id uuid NOT NULL,
        actor_profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
        action text NOT NULL,
        from_status text,
        to_status text,
        reason text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        metadata jsonb DEFAULT '{}'::jsonb NOT NULL
      );
    `);
    console.log('✅ Synchronized promotion_events table.');

    // 8. Create shipping_methods and sync orders table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS shipping_methods (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        price numeric(12, 2) NOT NULL,
        currency text DEFAULT 'USD' NOT NULL,
        estimated_delivery text,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    const orderColumnQueries = [
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number text;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS idempotency_key text;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS checkout_request_hash text;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS reservation_expires_at timestamp with time zone;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_method_id uuid;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address jsonb;`,
      `ALTER TABLE orders ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';`,
    ];

    for (const q of orderColumnQueries) {
      try {
        await db.execute(sql.raw(q));
      } catch (e) {
        console.warn('Orders column sync warning:', (e as any)?.message || e);
      }
    }
    console.log('✅ Synchronized orders and shipping_methods tables.');

    // 9. Create CMS tables (cms_pages, cms_page_sections, cms_table_configs, cms_site_settings)
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS cms_pages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        slug text UNIQUE NOT NULL,
        title text NOT NULL,
        status text DEFAULT 'published' NOT NULL,
        seo_title text,
        meta_description text,
        og_image text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS cms_page_sections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        page_id uuid REFERENCES cms_pages(id) ON DELETE CASCADE,
        name text NOT NULL,
        type text NOT NULL,
        enabled boolean DEFAULT true NOT NULL,
        display_order integer DEFAULT 1 NOT NULL,
        config jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS cms_table_configs (
        id text PRIMARY KEY,
        name text NOT NULL,
        enabled boolean DEFAULT true NOT NULL,
        config jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS cms_site_settings (
        key text PRIMARY KEY,
        value jsonb NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );
    `);
    // 10. Create Taxonomy, Audiences, Collections, Navigation & Product Categories tables
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS audiences (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        name text NOT NULL,
        slug text NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS product_audiences (
        store_id uuid,
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        audience_id uuid NOT NULL REFERENCES audiences(id) ON DELETE CASCADE,
        PRIMARY KEY (product_id, audience_id)
      );

      CREATE TABLE IF NOT EXISTS collections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        name text NOT NULL,
        slug text NOT NULL,
        description text,
        image_url text,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS collection_products (
        store_id uuid,
        collection_id uuid NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        sort_order integer DEFAULT 0 NOT NULL,
        PRIMARY KEY (collection_id, product_id)
      );

      CREATE TABLE IF NOT EXISTS navigation_menus (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        name text NOT NULL,
        slug text NOT NULL,
        location text DEFAULT 'main' NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS navigation_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        menu_id uuid NOT NULL REFERENCES navigation_menus(id) ON DELETE CASCADE,
        parent_id uuid,
        label text NOT NULL,
        item_type text NOT NULL,
        category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
        collection_id uuid REFERENCES collections(id) ON DELETE SET NULL,
        url text,
        image_url text,
        sort_order integer DEFAULT 0 NOT NULL,
        column_number smallint,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS navigation_promotions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        menu_id uuid REFERENCES navigation_menus(id) ON DELETE CASCADE,
        title text NOT NULL,
        description text,
        image_url text,
        target_url text,
        action_label text,
        is_active boolean DEFAULT true NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS product_categories (
        store_id uuid,
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        is_primary boolean DEFAULT false NOT NULL,
        PRIMARY KEY (product_id, category_id)
      );

      CREATE TABLE IF NOT EXISTS product_types (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id uuid,
        name text NOT NULL,
        slug text NOT NULL,
        description text,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS product_type_attributes (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_type_id uuid NOT NULL REFERENCES product_types(id) ON DELETE CASCADE,
        name text NOT NULL,
        code text NOT NULL,
        type text NOT NULL,
        options jsonb,
        is_required boolean DEFAULT false NOT NULL,
        created_at timestamp with time zone DEFAULT now() NOT NULL,
        updated_at timestamp with time zone DEFAULT now() NOT NULL,
        deleted_at timestamp with time zone
      );

      ALTER TABLE coupons ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb NOT NULL;
    `);
    console.log('✅ Synchronized taxonomy, audiences, collections, navigation, and product_categories tables.');

    console.log('🎉 Database Schema Synchronization Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Schema Sync Error:', err);
    process.exit(1);
  }
}

syncNewSchemas();
