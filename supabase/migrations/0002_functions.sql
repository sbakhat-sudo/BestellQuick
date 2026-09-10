-- Ordine — RPC functions & triggers
--
-- Order placement and restaurant onboarding are implemented as SECURITY
-- DEFINER functions rather than plain table INSERTs from the client. This
-- keeps business rules (plan limits, price integrity, "restaurant is open")
-- enforced server-side in one atomic transaction, without needing a
-- separate microservice for what is still fairly simple logic.

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- onboard_restaurant: called once right after Supabase Auth sign-up
-- ---------------------------------------------------------------------------
create or replace function onboard_restaurant(p_name text, p_slug text)
returns restaurants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant restaurants;
begin
  if auth.uid() is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if exists (select 1 from restaurants where owner_user_id = auth.uid()) then
    raise exception 'RESTAURANT_ALREADY_EXISTS';
  end if;

  insert into restaurants (owner_user_id, name, slug)
  values (auth.uid(), p_name, p_slug)
  returning * into v_restaurant;

  insert into subscriptions (restaurant_id, plan, status)
  values (v_restaurant.id, 'free', 'active');

  return v_restaurant;
end;
$$;

grant execute on function onboard_restaurant(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- create_order: used by the public ordering page (/r/:slug), anonymous.
-- Validates the restaurant is open, enforces the Free plan's 100
-- orders/month cap, and recomputes prices server-side from menu_items
-- so a customer can never submit a tampered total.
-- ---------------------------------------------------------------------------
create or replace function create_order(
  p_restaurant_id uuid,
  p_customer_name text,
  p_customer_phone text,
  p_order_type order_type,
  p_access_source access_source,
  p_items jsonb -- [{ "menu_item_id": "uuid", "quantity": 2 }, ...]
)
returns orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant restaurants;
  v_plan_orders_this_month integer;
  v_order orders;
  v_total numeric(10, 2) := 0;
  v_item jsonb;
  v_menu_item menu_items;
  v_quantity integer;
begin
  select * into v_restaurant from restaurants where id = p_restaurant_id;
  if not found then
    raise exception 'RESTAURANT_NOT_FOUND';
  end if;

  if not v_restaurant.is_open then
    raise exception 'RESTAURANT_CLOSED';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_CART';
  end if;

  if v_restaurant.plan = 'free' then
    select count(*) into v_plan_orders_this_month
    from orders
    where restaurant_id = p_restaurant_id
      and created_at >= date_trunc('month', now());

    if v_plan_orders_this_month >= 100 then
      raise exception 'PLAN_LIMIT_REACHED';
    end if;
  end if;

  insert into orders (restaurant_id, customer_name, customer_phone, order_type, access_source, status, total_price)
  values (p_restaurant_id, p_customer_name, p_customer_phone, p_order_type, p_access_source, 'confirmed', 0)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    select * into v_menu_item
    from menu_items
    where id = (v_item->>'menu_item_id')::uuid
      and restaurant_id = p_restaurant_id
      and status = 'available';

    if not found then
      raise exception 'MENU_ITEM_UNAVAILABLE';
    end if;

    v_quantity := coalesce((v_item->>'quantity')::integer, 0);
    if v_quantity <= 0 then
      raise exception 'INVALID_QUANTITY';
    end if;

    insert into order_items (order_id, menu_item_id, quantity, unit_price)
    values (v_order.id, v_menu_item.id, v_quantity, v_menu_item.price);

    v_total := v_total + (v_menu_item.price * v_quantity);
  end loop;

  update orders set total_price = v_total where id = v_order.id
  returning * into v_order;

  if p_order_type = 'delivery' then
    insert into deliveries (order_id, commission_type, commission_amount, status)
    values (
      v_order.id,
      v_restaurant.delivery_commission_type,
      case
        when v_restaurant.delivery_commission_type = 'percentage'
          then round(v_total * v_restaurant.delivery_commission_value / 100, 2)
        when v_restaurant.delivery_commission_type = 'fixed'
          then v_restaurant.delivery_commission_value
        else 0 -- 'distance': computed once a driver/distance is assigned in the dashboard
      end,
      'pending'
    );
  end if;

  return v_order;
end;
$$;

grant execute on function create_order(uuid, text, text, order_type, access_source, jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- log_analytics_event: used by the public page to record QR scans / link
-- clicks. Kept as a function (rather than a raw insert policy) so we can
-- validate the restaurant exists without exposing insert on the raw table.
-- ---------------------------------------------------------------------------
create or replace function log_analytics_event(p_restaurant_id uuid, p_event_type analytics_event_type)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from restaurants where id = p_restaurant_id) then
    raise exception 'RESTAURANT_NOT_FOUND';
  end if;

  insert into analytics_events (restaurant_id, event_type)
  values (p_restaurant_id, p_event_type);
end;
$$;

grant execute on function log_analytics_event(uuid, analytics_event_type) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- assign_delivery: dashboard-only helper to (re)assign a driver and compute
-- the commission, including the 'distance' pricing mode (commission per km).
-- ---------------------------------------------------------------------------
create or replace function assign_delivery(
  p_order_id uuid,
  p_driver_id uuid,
  p_distance_km numeric default null
)
returns deliveries
language plpgsql
security definer
set search_path = public
as $$
declare
  v_restaurant_id uuid;
  v_restaurant restaurants;
  v_delivery deliveries;
  v_total numeric(10, 2);
begin
  select o.restaurant_id, o.total_price into v_restaurant_id, v_total
  from orders o where o.id = p_order_id;

  if v_restaurant_id is null then
    raise exception 'ORDER_NOT_FOUND';
  end if;

  if not exists (
    select 1 from restaurants r
    where r.id = v_restaurant_id and r.owner_user_id = auth.uid()
  ) then
    raise exception 'NOT_AUTHORIZED';
  end if;

  select * into v_restaurant from restaurants where id = v_restaurant_id;

  update deliveries
  set driver_id = p_driver_id,
      status = 'assigned',
      commission_type = v_restaurant.delivery_commission_type,
      commission_amount = case
        when v_restaurant.delivery_commission_type = 'percentage'
          then round(v_total * v_restaurant.delivery_commission_value / 100, 2)
        when v_restaurant.delivery_commission_type = 'fixed'
          then v_restaurant.delivery_commission_value
        when v_restaurant.delivery_commission_type = 'distance'
          then round(coalesce(p_distance_km, 0) * v_restaurant.delivery_commission_value, 2)
      end
  where order_id = p_order_id
  returning * into v_delivery;

  return v_delivery;
end;
$$;

grant execute on function assign_delivery(uuid, uuid, numeric) to authenticated;

-- ---------------------------------------------------------------------------
-- Public, PII-free views used by the live order tracking page
-- ---------------------------------------------------------------------------
create view order_tracking_public as
select id, restaurant_id, order_type, status, total_price, created_at, updated_at
from orders;

grant select on order_tracking_public to anon, authenticated;

create view delivery_tracking_public as
select d.order_id, d.status, dd.name as driver_name, dd.phone as driver_phone
from deliveries d
left join delivery_drivers dd on dd.id = d.driver_id;

grant select on delivery_tracking_public to anon, authenticated;
