-- Vitefait — core schema
-- Enums, tables, indexes. RLS is enabled here but policies live in 0003_rls.sql
-- so this file focuses purely on structure.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type plan_type as enum ('free', 'pro', 'annual');
create type menu_item_status as enum ('available', 'out_of_stock');
create type order_type as enum ('dine_in', 'delivery');
create type access_source as enum ('qr', 'link');
create type order_status as enum ('confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered');
create type commission_type as enum ('fixed', 'percentage', 'distance');
create type delivery_status as enum ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled');
create type analytics_event_type as enum ('qr_scan', 'link_click');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  slug text not null unique,
  logo_url text,
  cover_photo_url text,
  address text,
  phone text,
  email text,
  is_open boolean not null default true,
  plan plan_type not null default 'free',
  -- Commission configuration for the delivery module (feature 9). Made
  -- configurable per restaurant rather than hardcoded, as requested.
  delivery_commission_type commission_type not null default 'fixed',
  -- Default commission: 10 MAD fixed / 10% / 5 MAD per km — reasonable
  -- placeholder defaults, editable per restaurant in Settings.
  delivery_commission_value numeric(10, 2) not null default 10,
  created_at timestamptz not null default now()
);

create unique index restaurants_owner_user_id_idx on restaurants (owner_user_id);
create index restaurants_slug_idx on restaurants (slug);

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  photo_url text,
  category text not null default 'Divers',
  status menu_item_status not null default 'available',
  created_at timestamptz not null default now()
);

create index menu_items_restaurant_id_idx on menu_items (restaurant_id);
create index menu_items_category_idx on menu_items (restaurant_id, category);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  order_type order_type not null,
  access_source access_source not null,
  status order_status not null default 'confirmed',
  total_price numeric(10, 2) not null default 0 check (total_price >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index orders_restaurant_id_created_at_idx on orders (restaurant_id, created_at desc);
create index orders_restaurant_id_status_idx on orders (restaurant_id, status);
create index orders_customer_phone_idx on orders (restaurant_id, customer_phone);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  menu_item_id uuid references menu_items (id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0)
);

create index order_items_order_id_idx on order_items (order_id);

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------
create table offers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  title text not null,
  description text,
  photo_url text,
  price numeric(10, 2) check (price >= 0),
  start_date date not null default current_date,
  end_date date,
  created_at timestamptz not null default now(),
  constraint offers_date_range check (end_date is null or end_date >= start_date)
);

create index offers_restaurant_id_idx on offers (restaurant_id);
create index offers_active_range_idx on offers (restaurant_id, start_date, end_date);

-- ---------------------------------------------------------------------------
-- delivery_drivers
-- ---------------------------------------------------------------------------
create table delivery_drivers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  name text not null,
  phone text not null,
  is_active boolean not null default true
);

create index delivery_drivers_restaurant_id_idx on delivery_drivers (restaurant_id);

-- ---------------------------------------------------------------------------
-- deliveries
-- ---------------------------------------------------------------------------
create table deliveries (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders (id) on delete cascade,
  driver_id uuid references delivery_drivers (id) on delete set null,
  commission_type commission_type not null default 'fixed',
  commission_amount numeric(10, 2) not null default 0,
  status delivery_status not null default 'pending'
);

create index deliveries_order_id_idx on deliveries (order_id);
create index deliveries_driver_id_idx on deliveries (driver_id);

-- ---------------------------------------------------------------------------
-- analytics_events
-- ---------------------------------------------------------------------------
create table analytics_events (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  event_type analytics_event_type not null,
  created_at timestamptz not null default now()
);

create index analytics_events_restaurant_id_created_at_idx on analytics_events (restaurant_id, created_at desc);
create index analytics_events_type_idx on analytics_events (restaurant_id, event_type);

-- ---------------------------------------------------------------------------
-- whatsapp_campaigns
-- ---------------------------------------------------------------------------
create table whatsapp_campaigns (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants (id) on delete cascade,
  message text not null,
  target_segment text not null default 'all',
  sent_at timestamptz,
  recipients_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index whatsapp_campaigns_restaurant_id_idx on whatsapp_campaigns (restaurant_id);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null unique references restaurants (id) on delete cascade,
  plan plan_type not null default 'free',
  status subscription_status not null default 'active',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

create index subscriptions_restaurant_id_idx on subscriptions (restaurant_id);
create index subscriptions_stripe_customer_id_idx on subscriptions (stripe_customer_id);

-- Enable RLS on every table up front; policies are added in 0003_rls.sql
alter table restaurants enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table offers enable row level security;
alter table delivery_drivers enable row level security;
alter table deliveries enable row level security;
alter table analytics_events enable row level security;
alter table whatsapp_campaigns enable row level security;
alter table subscriptions enable row level security;
