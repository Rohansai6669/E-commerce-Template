-- =====================================================================
-- Hardened RLS, Triggers, Functions, and Performance Migration
-- =====================================================================

-- 1. Create custom schemas
create schema if not exists app;

-- 2. Custom SQL Authorization Helper Functions (housed in app schema)
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

-- 3. Automatic updated_at trigger helper
create or replace function public.update_modified_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql set search_path = public;

-- 4. Concurrency & Transaction Helper Functions
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
  -- Acquire row lock FOR UPDATE on inventory to serialize concurrent requests.
  select id, quantity into v_inventory_id, v_available_qty
  from public.inventory
  where product_id = p_product_id 
    and (variant_id = p_variant_id or (variant_id is null and p_variant_id is null))
  for update;
  
  if not found then
    raise exception 'Inventory record not found';
  end if;
  
  -- Fetch the sum of current active reservations.
  select coalesce(sum(quantity), 0) into v_reserved_qty
  from public.inventory_reservations
  where inventory_id = v_inventory_id
    and expires_at > now()
    and is_completed = false;
     
  -- Reject if reservation quantity exceeds stock capacity.
  if (v_available_qty - v_reserved_qty) < p_quantity then
    return false;
  end if;
  
  -- Insert hold reservation.
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
  
  -- Record movement log.
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
$$ language plpgsql security definer set search_path = public;

-- Trigger to enforce review purchase checks
create trigger enforce_review_purchase_check
  before insert on public.reviews
  for each row execute procedure public.check_user_purchased_product();

-- Auth Signup sync trigger function (Idempotent)
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
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

-- Listener for Supabase users created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
  for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Brands Policies
create policy "Brands public read access" on public.brands 
  for select using (deleted_at is null);
create policy "Brands admin write access" on public.brands 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Products Policies
create policy "Products public read access" on public.products 
  for select using ((status = 'active'::public.product_status and deleted_at is null) or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Products admin write access" on public.products 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Product Images, Options, Option Values, Variants, Variant Options
create policy "Product images public read" on public.product_images for select using (true);
create policy "Product images admin write" on public.product_images for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product options public read" on public.product_options for select using (true);
create policy "Product options admin write" on public.product_options for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product option values public read" on public.product_option_values for select using (true);
create policy "Product option values admin write" on public.product_option_values for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product variants public read" on public.product_variants for select using (true);
create policy "Product variants admin write" on public.product_variants for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Product variant options public read" on public.product_variant_options for select using (true);
create policy "Product variant options admin write" on public.product_variant_options for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Inventory & Movements Policies (Staff/Admin read & write)
create policy "Inventory admin read" on public.inventory for select using (app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Inventory admin write" on public.inventory for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Movements admin read" on public.inventory_movements for select using (app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Movements admin write" on public.inventory_movements for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Inventory Reservations (Users see own, staff can manage)
create policy "Reservations owner select" on public.inventory_reservations 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Reservations admin manage" on public.inventory_reservations 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

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
  )
  with check (
    exists (
      select 1 from public.carts c
      where c.id = cart_id and c.profile_id = auth.uid()
    )
  );

-- Coupon Policies
create policy "Coupons active read access" on public.coupons 
  for select using (is_active = true or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Coupons admin write access" on public.coupons 
  for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

create policy "Coupon redemptions read own" on public.coupon_redemptions 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));

-- Shipping Methods
create policy "Shipping methods public read" on public.shipping_methods for select using (is_active = true);
create policy "Shipping methods admin write" on public.shipping_methods for all using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

-- Orders & Status Policies
create policy "Orders select own" on public.orders 
  for select using (auth.uid() = profile_id or app.is_admin() or app.has_role('staff'::public.user_role));
create policy "Orders insert validation" on public.orders 
  for insert with check (auth.uid() = profile_id);
create policy "Orders admin update" on public.orders 
  for update using (app.is_admin() or app.has_role('staff'::public.user_role))
  with check (app.is_admin() or app.has_role('staff'::public.user_role));

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
-- Auto-update Timestamp Triggers (Applying updated_at)
-- =====================================================================

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
