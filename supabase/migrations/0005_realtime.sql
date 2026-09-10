-- Ordine — enable Realtime on the orders table so the public order
-- tracking page (/r/:slug/order/:orderId) receives live status updates via
-- postgres_changes, without any page refresh.

alter publication supabase_realtime add table orders;
