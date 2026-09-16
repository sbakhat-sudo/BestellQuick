-- BestellQuick — weekly opening hours
--
-- Purely informational/schedule data (shown to the owner in Settings and,
-- later, could drive the public menu page or an automated open/close
-- job) — it does NOT replace the existing `is_open` column, which stays
-- the single source of truth for "is this restaurant accepting orders
-- right now" (manual override, checked by create_order()). Stored as
-- jsonb keyed by day so the shape can evolve without a migration.

alter table restaurants
  add column weekly_hours jsonb not null default '{
    "mon": {"enabled": true, "open": "09:00", "close": "22:00"},
    "tue": {"enabled": true, "open": "09:00", "close": "22:00"},
    "wed": {"enabled": true, "open": "09:00", "close": "22:00"},
    "thu": {"enabled": true, "open": "09:00", "close": "22:00"},
    "fri": {"enabled": true, "open": "09:00", "close": "22:00"},
    "sat": {"enabled": true, "open": "09:00", "close": "22:00"},
    "sun": {"enabled": false, "open": "09:00", "close": "22:00"}
  }'::jsonb;
