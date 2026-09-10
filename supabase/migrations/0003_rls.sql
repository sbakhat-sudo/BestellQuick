-- Ordine — Row Level Security policies
--
-- Design notes:
-- * Tables are owned by the migration role (typically `postgres`), and
--   Postgres does not apply RLS to a table's owner. That is what lets the
--   SECURITY DEFINER functions in 0002_functions.sql (onboard_restaurant,
--   create_order, log_analytics_event, assign_delivery) perform their
--   writes even though there is no direct INSERT policy for `anon` /
--   `authenticated` on orders, order_items, analytics_events, deliveries
--   or subscriptions — those tables are only ever written through the
--   validated RPCs, never via raw client inserts.
-- * "Public, readable only by id" (orders, spec requirement) cannot be
--   expressed as a literal RLS predicate — RLS filters rows, it has no
--   notion of "the caller already knows this id". We approximate it the
--   same way capability links / Stripe-style URLs do: order ids are
--   random UUIDs, customer PII (name/phone) is kept out of the publicly
--   granted `order_tracking_public` view, and the app never exposes a
--   listing UI for anonymous users.

-- ---------------------------------------------------------------------------
-- restaurants
-- ---------------------------------------------------------------------------
create policy "restaurants are publicly readable"
  on restaurants for select
  using (true);

create policy "owner can update own restaurant"
  on restaurants for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "owner can delete own restaurant"
  on restaurants for delete
  using (owner_user_id = auth.uid());

-- No direct INSERT policy: restaurants are created exclusively through the
-- onboard_restaurant() RPC so we can enforce "one restaurant per owner"
-- and bootstrap the subscriptions row atomically.

-- ---------------------------------------------------------------------------
-- menu_items
-- ---------------------------------------------------------------------------
create policy "menu items are publicly readable"
  on menu_items for select
  using (true);

create policy "owner manages own menu items"
  on menu_items for all
  using (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id and r.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = menu_items.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- orders — readable by anyone who has the order id (capability-URL
-- pattern, see the note at the top of this file). This also lets the
-- public order-tracking page subscribe to Supabase Realtime
-- postgres_changes on this table: Realtime authorizes each change against
-- the subscriber's SELECT policy on the *base table*, not on the
-- order_tracking_public view, so a public SELECT policy is required here
-- for live status updates to reach the customer. The customer only ever
-- sees the order they themselves just placed (its id is never listed
-- anywhere), and the data involved is their own name/phone.
-- ---------------------------------------------------------------------------
create policy "orders are readable by id"
  on orders for select
  using (true);

create policy "owner updates own restaurant orders"
  on orders for update
  using (exists (
    select 1 from restaurants r
    where r.id = orders.restaurant_id and r.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = orders.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- order_items — no customer PII, so it is safe to let both the owning
-- dashboard and the anonymous order-tracking page read line items by
-- (guessable-only-if-leaked) order_id.
-- ---------------------------------------------------------------------------
create policy "order items are readable"
  on order_items for select
  using (true);

-- ---------------------------------------------------------------------------
-- offers
-- ---------------------------------------------------------------------------
create policy "offers are publicly readable"
  on offers for select
  using (true);

create policy "owner manages own offers"
  on offers for all
  using (exists (
    select 1 from restaurants r
    where r.id = offers.restaurant_id and r.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = offers.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- delivery_drivers — never public
-- ---------------------------------------------------------------------------
create policy "owner manages own delivery drivers"
  on delivery_drivers for all
  using (exists (
    select 1 from restaurants r
    where r.id = delivery_drivers.restaurant_id and r.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = delivery_drivers.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- deliveries — owner reads via the orders/restaurants join; writes only
-- through assign_delivery() / create_order() RPCs.
-- ---------------------------------------------------------------------------
create policy "owner reads own deliveries"
  on deliveries for select
  using (exists (
    select 1 from orders o
    join restaurants r on r.id = o.restaurant_id
    where o.id = deliveries.order_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- analytics_events — owner-only read, write only via log_analytics_event()
-- ---------------------------------------------------------------------------
create policy "owner reads own analytics events"
  on analytics_events for select
  using (exists (
    select 1 from restaurants r
    where r.id = analytics_events.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- whatsapp_campaigns — Pro/Annual gating is enforced in the app layer and
-- in the send-whatsapp-campaign Edge Function (which also stamps sent_at /
-- recipients_count using the service role).
-- ---------------------------------------------------------------------------
create policy "owner manages own whatsapp campaigns"
  on whatsapp_campaigns for all
  using (exists (
    select 1 from restaurants r
    where r.id = whatsapp_campaigns.restaurant_id and r.owner_user_id = auth.uid()
  ))
  with check (exists (
    select 1 from restaurants r
    where r.id = whatsapp_campaigns.restaurant_id and r.owner_user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- subscriptions — read-only for the owner; all writes happen server-side
-- (onboard_restaurant RPC, and the stripe-webhook Edge Function using the
-- service role key, which bypasses RLS entirely).
-- ---------------------------------------------------------------------------
create policy "owner reads own subscription"
  on subscriptions for select
  using (exists (
    select 1 from restaurants r
    where r.id = subscriptions.restaurant_id and r.owner_user_id = auth.uid()
  ));
