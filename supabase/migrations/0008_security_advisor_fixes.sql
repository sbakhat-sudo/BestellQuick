-- BestellQuick — fixes for issues raised by Supabase's Security Advisor
--
-- 1. set_updated_at() had no `search_path` pinned, which the linter
--    flags because a mutable search_path on a trigger function is a
--    (minor, but easy to avoid) privilege-escalation vector.
-- 2. order_tracking_public / delivery_tracking_public were flagged as
--    "Security Definer View" — Postgres views run with the definer's
--    privileges by default. For order_tracking_public this was always
--    harmless in practice (orders already has a public "readable by id"
--    policy, see 0003_rls.sql), but for delivery_tracking_public it was
--    silently bypassing the owner-only policies on deliveries /
--    delivery_drivers. We switch both to security_invoker and add the
--    narrow public policies needed so the tracking page keeps working
--    under real RLS instead of a bypass — the same capability-URL
--    reasoning already used for orders/order_items.
-- 3. Every SECURITY DEFINER function was still executable by the
--    Postgres default PUBLIC grant (CREATE FUNCTION grants EXECUTE to
--    PUBLIC unless revoked — our explicit GRANTs only *added* roles, they
--    never removed that default). The functions themselves already guard
--    against misuse internally (auth.uid() checks), but this closes the
--    gap at the database privilege level too, as defense in depth.
-- 4. The storage.objects SELECT policy allowed listing every file in the
--    restaurant-assets bucket via the API. Public buckets already serve
--    individual objects by URL without going through RLS at all (that's
--    what bucket.public = true means), so this policy only ever enabled
--    *enumeration* of every restaurant's uploaded files — never needed
--    for the app to work. Dropping it does not affect getPublicUrl().

-- 1. Pin search_path on the trigger function
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2. Public read access for delivery info shown on the customer tracking
--    page, mirroring the existing orders/order_items pattern.
create policy "deliveries are readable" on deliveries for select using (true);
create policy "delivery driver contact info is readable" on delivery_drivers for select using (true);

alter view order_tracking_public set (security_invoker = true);
alter view delivery_tracking_public set (security_invoker = true);

-- 3. Lock down SECURITY DEFINER function execution to the intended roles.
revoke execute on function onboard_restaurant(text, text) from public;
revoke execute on function create_order(uuid, text, text, order_type, access_source, jsonb) from public;
revoke execute on function log_analytics_event(uuid, analytics_event_type) from public;
revoke execute on function assign_delivery(uuid, uuid, numeric) from public;

grant execute on function onboard_restaurant(text, text) to authenticated;
grant execute on function create_order(uuid, text, text, order_type, access_source, jsonb) to anon, authenticated;
grant execute on function log_analytics_event(uuid, analytics_event_type) to anon, authenticated;
grant execute on function assign_delivery(uuid, uuid, numeric) to authenticated;

-- 4. Stop allowing full bucket enumeration; public URL access is
--    unaffected (served by bucket.public = true, not this policy).
drop policy if exists "restaurant assets are publicly readable" on storage.objects;
