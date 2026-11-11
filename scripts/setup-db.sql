-- =====================================================================
-- Production-Grade E-commerce Database Bootstrap Schema (Refined)
-- =====================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create custom schemas
create schema if not exists app;

-- 2. Create custom PostgreSQL Enums
create type public.user_role as enum (
  'customer',
  'staff',
  'admin',
  'vendor'
);

create type public.product_status as enum (
  'draft',
  'active',
  'archived'
);

create type public.order_status as enum (
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create type public.payment_status as enum (
  'pending',
  'succeeded',
  'failed',
  'refunded'
);

create type public.inventory_movement_type as enum (
  'inbound',
  'outbound',
  'reservation_hold',
  'reservation_release',
  'adjustment'
);

create type public.notification_type as enum (
  'order_update',
  'promotional',
  'system'
);

-- 3. Automatic updated_at trigger helper
create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- 4. User Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  username text unique,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'customer'::public.user_role,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_seen_at timestamp with time zone
);

-- 5. SQL Authorization Helper Functions (housed in app schema)
-- Enforces search_path to public and app schemas to protect against search path injection.
create or replace function app.user_role()
returns public.user_role as $$
declare
  u_role public.user_role;
begin
  select role into u_role from public.profiles where id = auth.uid();
  return coalesce(u_role, 'customer'::public.user_role);
end;
$$ language plpgsql security definer set search_path = public, app;

create or replace function app.has_role(role_name public.user_role)
returns boolean as $$
begin
  return app.user_role() = role_name;
end;
$$ language plpgsql security definer set search_path = public, app;

create or replace function app.is_admin()
returns boolean as $$
begin
  return app.has_role('admin'::public.user_role);
end;
$$ language plpgsql security definer set search_path = public, app;

-- 6. Customer Addresses Table
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('shipping', 'billing')),
  is_default boolean not null default false,
  full_name text not null,
  phone text,
  street_address text not null,
  apartment_suite text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Categories Table (Supports hierarchies & soft deletes)
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Brands Table (Supports soft deletes)
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  description text,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Products Table (With full-text search, status enum, and soft deletes)
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  brand_id uuid references public.brands(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  sku text unique,
  barcode text,
  status public.product_status not null default 'draft'::public.product_status,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(description, ''))
  ) stored
);

-- 10. Product Images Table
create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  alt_text text,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Product Options (e.g. Size, Color)
create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  name text not null, -- e.g. 'Size'
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_product_option_name unique (product_id, name)
);

-- 12. Product Option Values (e.g. L, XL, Red)
create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid references public.product_options(id) on delete cascade not null,
  value text not null, -- e.g. 'XL'
  sort_order integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_option_value unique (option_id, value)
);

-- 13. Product Variants
create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  sku text unique not null,
  price numeric(12,2) check (price >= 0), -- Null represents using default product price
  compare_at_price numeric(12,2) check (compare_at_price >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 14. Product Variant Options Mapping
create table public.product_variant_options (
  variant_id uuid references public.product_variants(id) on delete cascade not null,
  option_value_id uuid references public.product_option_values(id) on delete cascade not null,
  primary key (variant_id, option_value_id)
);

-- 15. Inventory Table
create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete cascade, -- Null if simple product
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_product_variant_inventory unique (product_id, variant_id)
);

-- 16. Inventory Movements Audit Table
create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete cascade not null,
  type public.inventory_movement_type not null,
  quantity integer not null,
  reference_id text, -- e.g., order ID, purchase order ID
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 17. Inventory Reservations Table (Checkout holds)
create table public.inventory_reservations (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references public.inventory(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  session_id text, -- Guest cart session
  profile_id uuid references public.profiles(id) on delete set null,
  expires_at timestamp with time zone not null,
  is_completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 18. Shopping Carts Table
create table public.carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade, -- Null if guest
  session_id text, -- Guest identifier
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint cart_owner_constraint check (profile_id is not null or session_id is not null)
);

-- 19. Shopping Cart Items Table
create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid references public.carts(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_cart_item unique (cart_id, product_id, variant_id)
);

-- 20. Coupons Table
create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12,2) not null check (discount_value > 0),
  min_order_value numeric(12,2) check (min_order_value >= 0),
  max_discount_value numeric(12,2) check (max_discount_value >= 0),
  usage_limit integer check (usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  per_user_limit integer check (per_user_limit > 0),
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 21. Shipping Methods Table
create table public.shipping_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null check (price >= 0),
  estimated_delivery text,
  is_active boolean not null default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 22. Orders Table (With strict numeric check constraints)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  status public.order_status not null default 'pending'::public.order_status,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  tax_amount numeric(12,2) not null default 0.00 check (tax_amount >= 0),
  shipping_amount numeric(12,2) not null default 0.00 check (shipping_amount >= 0),
  discount_amount numeric(12,2) not null default 0.00 check (discount_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  coupon_id uuid references public.coupons(id) on delete set null,
  shipping_address jsonb not null, -- Snapshotted shipping address
  billing_address jsonb, -- Snapshotted billing address
  shipping_method_id uuid references public.shipping_methods(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint check_discount_limit check (discount_amount <= subtotal),
  constraint check_total_calculation check (total_amount = (subtotal + tax_amount + shipping_amount - discount_amount))
);

-- 23. Order Status History Table (Audit log for tracking orders)
create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  status public.order_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 24. Order Items Table (Snapshotted details for immutable record-keeping)
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  name text not null, -- Snapshot of product name
  sku text not null, -- Snapshot of SKU
  price numeric(12,2) not null check (price >= 0), -- Snapshot of price
  tax_amount numeric(12,2) not null default 0.00 check (tax_amount >= 0),
  discount_amount numeric(12,2) not null default 0.00 check (discount_amount >= 0),
  image_url text, -- Snapshot of product image URL
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 25. Payments Table (Idempotent tracking with provider auditing payload)
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  provider text not null, -- 'stripe', 'razorpay', 'cod'
  transaction_id text unique, -- Provider reference transaction ID
  amount numeric(12,2) not null check (amount > 0),
  status public.payment_status not null default 'pending'::public.payment_status,
  idempotency_key text unique,
  currency text not null default 'USD',
  provider_fee numeric(12,2) check (provider_fee >= 0),
  provider_payload jsonb not null default '{}'::jsonb,
  provider_response jsonb not null default '{}'::jsonb,
  captured_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 26. Coupon Redemptions Auditing Table
create table public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid references public.coupons(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete set null,
  order_id uuid references public.orders(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 27. Product Reviews Table (One review per product per profile)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  profile_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  is_verified_purchase boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_review_per_user unique (product_id, profile_id)
);

-- 28. Simplified Wishlist Items Table (No nested wishlist, direct profile lookup)
create table public.wishlist_items (
  profile_id uuid references public.profiles(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (profile_id, product_id)
);

-- 29. Notifications Table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade not null,
  type public.notification_type not null default 'system'::public.notification_type,
  priority text not null check (priority in ('low', 'medium', 'high')) default 'low',
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamp with time zone,
  expires_at timestamp with time zone,
  is_deleted boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================================
-- Concurrency & Transaction Helper Functions
-- =====================================================================

-- Atomically reserves inventory using row-level locking (SELECT FOR UPDATE) to avoid race conditions.
create or replace function public.reserve_inventory(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_session_id text,
  p_profile_id uuid,
  p_expires_in_minutes integer default 15
)
returns boolean as $$
declare
  v_inventory_id uuid;
  v_available_qty integer;
  v_reserved_qty integer;
begin
  -- 1. Acquire row lock FOR UPDATE on inventory to serialize concurrent requests.
  select id, quantity into v_inventory_id, v_available_qty
  from public.inventory
  where product_id = p_product_id 
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null))
  for update;
  
  if not found then
    raise exception 'Inventory record not found';
  end if;
  
  -- 2. Fetch the sum of current active reservations.
  select coalesce(sum(quantity), 0) into v_reserved_qty
  from public.inventory_reservations
  where inventory_id = v_inventory_id
    and expires_at > now()
    and is_completed = false;
     
  -- 3. Reject if reservation quantity exceeds stock capacity.
  if (v_available_qty - v_reserved_qty) < p_quantity then
    return false;
  end if;
  
  -- 4. Insert hold reservation.
  insert into public.inventory_reservations (
    inventory_id,
    quantity,
    session_id,
    profile_id,
    expires_at
  ) values (
    v_inventory_id,
    p_quantity,
    p_session_id,
    p_profile_id,
    now() + (p_expires_in_minutes || ' minutes')::interval
  );
  
  -- 5. Record movement log.
  insert into public.inventory_movements (
    inventory_id,
    type,
    quantity,
    notes
  ) values (
    v_inventory_id,
    'reservation_hold'::public.inventory_movement_type,
    -p_quantity,
    coalesce('Held for session ' || p_session_id, 'Held for profile ' || p_profile_id::text)
  );
  
  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- Transactional redemption of coupons, enforcing boundaries and limits.
create or replace function public.redeem_coupon(
  p_coupon_code text,
  p_profile_id uuid,
  p_order_id uuid
)
returns boolean as $$
declare
  v_coupon_id uuid;
  v_is_active boolean;
  v_usage_limit integer;
  v_used_count integer;
  v_user_redemptions integer;
  v_per_user_limit integer;
  v_start_date timestamp with time zone;
  v_end_date timestamp with time zone;
begin
  select id, is_active, usage_limit, used_count, start_date, end_date, per_user_limit
  into v_coupon_id, v_is_active, v_usage_limit, v_used_count, v_start_date, v_end_date, v_per_user_limit
  from public.coupons
  where code = p_coupon_code
  for update;
  
  if not found then
    raise exception 'Coupon not found';
  end if;
  
  if not v_is_active then
    raise exception 'Coupon is inactive';
  end if;
  
  if v_start_date is not null and v_start_date > now() then
    raise exception 'Coupon validity has not started';
  end if;
  
  if v_end_date is not null and v_end_date < now() then
    raise exception 'Coupon has expired';
  end if;
  
  if v_usage_limit is not null and v_used_count >= v_usage_limit then
    raise exception 'Coupon usage limit reached';
  end if;
  
  if v_per_user_limit is not null and p_profile_id is not null then
    select count(*) into v_user_redemptions
    from public.coupon_redemptions
    where coupon_id = v_coupon_id and profile_id = p_profile_id;
     
    if v_user_redemptions >= v_per_user_limit then
      raise exception 'Per-user coupon limit reached';
    end if;
  end if;
  
  update public.coupons 
  set used_count = used_count + 1 
  where id = v_coupon_id;
  
  insert into public.coupon_redemptions (coupon_id, profile_id, order_id)
  values (v_coupon_id, p_profile_id, p_order_id);
  
  return true;
end;
$$ language plpgsql security definer set search_path = public;

-- Enforces one review check: validates purchase of products.
create or replace function public.check_user_purchased_product()
returns trigger as $$
declare
  v_purchased boolean;
begin
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on o.id = oi.order_id
    where o.profile_id = new.profile_id
      and oi.product_id = new.product_id
      and o.status = 'delivered'::public.order_status
  ) into v_purchased;
  
  if not v_purchased then
    raise exception 'You can only review products that have been delivered to your profile.';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger enforce_review_purchase_check
  before insert on public.reviews
  for each row execute procedure public.check_user_purchased_product();

-- =====================================================================
-- Row Level Security (RLS) Configuration
-- =====================================================================

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_options enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_variant_options enable row level security;
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.inventory_reservations enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.coupon_redemptions enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.orders enable row level security;
alter table public.order_status_history enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.notifications enable row level security;

-- Profiles Policies
create policy "Profiles select policy" on public.profiles 
  for select using (auth.uid() = id or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Profile owner update access" on public.profiles 
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Address Policies
create policy "Address owner select access" on public.addresses 
  for select using (auth.uid() = profile_id);
create policy "Address owner insert access" on public.addresses 
  for insert with check (auth.uid() = profile_id);
create policy "Address owner update access" on public.addresses 
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Address owner delete access" on public.addresses 
  for delete using (auth.uid() = profile_id);

-- Category Policies (Public read, admin/staff modification)
create policy "Categories public read access" on public.categories 
  for select using ((is_active = true and deleted_at is null) or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Categories admin write access" on public.categories 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Brands Policies
create policy "Brands public read access" on public.brands 
  for select using (deleted_at is null);
create policy "Brands admin write access" on public.brands 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Products Policies
create policy "Products public read access" on public.products 
  for select using ((status = 'active'::public.product_status and deleted_at is null) or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Products admin write access" on public.products 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Product Images, Options, Option Values, Variants, Variant Options
create policy "Product images public read" on public.product_images for select using (true);
create policy "Product images admin write" on public.product_images for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product options public read" on public.product_options for select using (true);
create policy "Product options admin write" on public.product_options for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product option values public read" on public.product_option_values for select using (true);
create policy "Product option values admin write" on public.product_option_values for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product variants public read" on public.product_variants for select using (true);
create policy "Product variants admin write" on public.product_variants for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product variant options public read" on public.product_variant_options for select using (true);
create policy "Product variant options admin write" on public.product_variant_options for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Inventory & Movements Policies (Staff/Admin read & write)
create policy "Inventory admin read" on public.inventory for select using (app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Inventory admin write" on public.inventory for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Movements admin read" on public.inventory_movements for select using (app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Movements admin write" on public.inventory_movements for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Inventory Reservations (Users see own, staff can manage)
create policy "Reservations owner select" on public.inventory_reservations 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Reservations admin manage" on public.inventory_reservations 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Carts Policies (Guest carts are restricted from RLS and managed server-side only)
create policy "Carts select own" on public.carts 
  for select using (auth.uid() = profile_id);
create policy "Carts insert" on public.carts 
  for insert with check (auth.uid() = profile_id);
create policy "Carts update own" on public.carts 
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);
create policy "Carts delete own" on public.carts 
  for delete using (auth.uid() = profile_id);

-- Cart Items Policies
create policy "Cart items owner access" on public.cart_items 
  for all using (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.profile_id = auth.uid()
    )
  );

-- Coupon Policies
create policy "Coupons active read access" on public.coupons 
  for select using (is_active = true or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Coupons admin write access" on public.coupons 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Coupon redemptions read own" on public.coupon_redemptions 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));

-- Shipping Methods
create policy "Shipping methods public read" on public.shipping_methods for select using (is_active = true);
create policy "Shipping methods admin write" on public.shipping_methods for all using (app.is_admin() or app.has_role('staff'::public.user_role));

-- Orders & Status Policies
create policy "Orders select own" on public.orders 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Orders insert validation" on public.orders 
  for insert with check (auth.uid() = profile_id);
create policy "Orders admin update" on public.orders 
  for update using (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Order status history select own" on public.order_status_history 
  for select using (
    exists (
      select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or app.is_admin() or app.has_role('staff'::public.user_role))
    )
  );
create policy "Order status history admin write" on public.order_status_history 
  for insert with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Order Items Policies
create policy "Order items select own" on public.order_items 
  for select using (
    exists (
      select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or app.is_admin() or app.has_role('staff'::public.user_role))
    )
  );

-- Payments Policies
create policy "Payments select own" on public.payments 
  for select using (
    exists (
      select 1 from public.orders o where o.id = order_id and (o.profile_id = auth.uid() or app.is_admin() or app.has_role('staff'::public.user_role))
    )
  );

-- Reviews (Public read, authenticated write)
create policy "Reviews read access" on public.reviews for select using (true);
create policy "Reviews write access" on public.reviews 
  for all using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- Wishlist Items Policies
create policy "Wishlist items owner read" on public.wishlist_items for select using (auth.uid() = profile_id);
create policy "Wishlist items owner insert" on public.wishlist_items for insert with check (auth.uid() = profile_id);
create policy "Wishlist items owner delete" on public.wishlist_items for delete using (auth.uid() = profile_id);

-- Notifications
create policy "Notifications owner access" on public.notifications 
  for select using (auth.uid() = profile_id and is_deleted = false);
create policy "Notifications owner update read" on public.notifications 
  for update using (auth.uid() = profile_id) with check (auth.uid() = profile_id);

-- =====================================================================
-- Database Performance Indexes
-- =====================================================================

create index idx_products_category on public.products(category_id);
create index idx_products_brand on public.products(brand_id);
create index idx_products_slug on public.products(slug);
create index idx_products_search on public.products using gin(search_vector);

create index idx_categories_parent on public.categories(parent_id);
create index idx_categories_slug on public.categories(slug);

create index idx_product_images_product on public.product_images(product_id);
create index idx_product_options_product on public.product_options(product_id);
create index idx_product_option_values_option on public.product_option_values(option_id);

create index idx_product_variants_product on public.product_variants(product_id);
create index idx_variant_options_value on public.product_variant_options(option_value_id);

create index idx_inventory_product on public.inventory(product_id);
create index idx_inventory_variant on public.inventory(variant_id);
create index idx_inventory_movements_inv on public.inventory_movements(inventory_id);
create index idx_inventory_reservations_inv on public.inventory_reservations(inventory_id);
create index idx_inventory_reservations_expiry on public.inventory_reservations(expires_at) where is_completed = false;

create index idx_carts_profile on public.carts(profile_id);
create index idx_carts_session on public.carts(session_id);
create index idx_cart_items_cart on public.cart_items(cart_id);

create index idx_orders_profile on public.orders(profile_id);
create index idx_orders_status on public.orders(status);
create index idx_orders_created on public.orders(created_at);
create index idx_order_status_history_order on public.order_status_history(order_id);
create index idx_order_items_order on public.order_items(order_id);

create index idx_payments_order on public.payments(order_id);
create index idx_payments_status on public.payments(status);
create index idx_payments_transaction on public.payments(transaction_id);

create index idx_coupon_redemptions_coupon on public.coupon_redemptions(coupon_id);
create index idx_coupon_redemptions_profile on public.coupon_redemptions(profile_id);

create index idx_reviews_product on public.reviews(product_id);
create index idx_reviews_profile on public.reviews(profile_id);

create index idx_wishlist_items_profile on public.wishlist_items(profile_id);

create index idx_notifications_profile on public.notifications(profile_id);
create index idx_notifications_unread on public.notifications(profile_id) where read_at is null and is_deleted = false;

-- =====================================================================
-- DB Triggers for Automatic Timestamps and Signup Synchronization
-- =====================================================================

-- Auto-update timestamps triggers
create trigger set_profiles_timestamp before update on public.profiles for each row execute procedure public.update_modified_column();
create trigger set_addresses_timestamp before update on public.addresses for each row execute procedure public.update_modified_column();
create trigger set_categories_timestamp before update on public.categories for each row execute procedure public.update_modified_column();
create trigger set_brands_timestamp before update on public.brands for each row execute procedure public.update_modified_column();
create trigger set_products_timestamp before update on public.products for each row execute procedure public.update_modified_column();
create trigger set_product_variants_timestamp before update on public.product_variants for each row execute procedure public.update_modified_column();
create trigger set_inventory_timestamp before update on public.inventory for each row execute procedure public.update_modified_column();
create trigger set_carts_timestamp before update on public.carts for each row execute procedure public.update_modified_column();
create trigger set_cart_items_timestamp before update on public.cart_items for each row execute procedure public.update_modified_column();
create trigger set_coupons_timestamp before update on public.coupons for each row execute procedure public.update_modified_column();
create trigger set_shipping_methods_timestamp before update on public.shipping_methods for each row execute procedure public.update_modified_column();
create trigger set_orders_timestamp before update on public.orders for each row execute procedure public.update_modified_column();
create trigger set_payments_timestamp before update on public.payments for each row execute procedure public.update_modified_column();
create trigger set_reviews_timestamp before update on public.reviews for each row execute procedure public.update_modified_column();

-- Auth Signup sync trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url, phone, role, is_active, metadata)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone),
    'customer'::public.user_role,
    true,
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Media Files Management Table
create table if not exists public.media_files (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  folder text not null default 'general',
  mime_type text not null default 'image/jpeg',
  size_bytes integer not null default 0,
  alt_text text,
  width integer,
  height integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Supplier Invitations Table
create table if not exists public.supplier_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  supplier_name text not null,
  token text unique not null,
  commission_rate text not null default '10.00',
  status text not null default 'pending',
  brand_ids jsonb not null default '[]'::jsonb,
  invited_by uuid,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Ensure suppliers table has profile_id column
alter table public.suppliers add column if not exists profile_id uuid references public.profiles(id) on delete set null;


