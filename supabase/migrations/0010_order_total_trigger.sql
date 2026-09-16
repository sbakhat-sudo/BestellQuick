-- BestellQuick — defensive total_price recompute trigger on order_items
--
-- create_order() (0002_functions.sql) already computes and stores
-- orders.total_price atomically when an order is placed, so this trigger
-- is not required for the current app flow. It's added as a safety net for
-- any future path that touches order_items directly (a dashboard line-item
-- editor, a manual fix in the SQL editor, etc.) so total_price never drifts
-- out of sync. search_path is pinned and the function runs as INVOKER
-- (not DEFINER): order_items is only ever written from inside
-- create_order(), which is already SECURITY DEFINER, so the trigger
-- inherits that context automatically and does not need its own elevated
-- privileges.

create or replace function recompute_order_total()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update orders
  set total_price = (
        select coalesce(sum(quantity * unit_price), 0)
        from order_items
        where order_id = coalesce(new.order_id, old.order_id)
      ),
      updated_at = now()
  where id = coalesce(new.order_id, old.order_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists order_items_recompute_total on order_items;

create trigger order_items_recompute_total
  after insert or update or delete on order_items
  for each row execute function recompute_order_total();
