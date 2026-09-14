-- Vite-Fait — ensure restaurant-assets bucket is actually public
--
-- 0004_storage.sql created the bucket with `insert ... on conflict (id) do
-- nothing`, which is correct for a fresh project but is a no-op if the
-- bucket already existed (e.g. created by hand in the dashboard, or by an
-- earlier partial migration run) with public = false. When that happens,
-- uploads still succeed (the insert policy only checks auth.uid()), but
-- every getPublicUrl() link 400s, because the public object-serving
-- endpoint refuses unauthenticated reads on a non-public bucket. This
-- statement is idempotent and safe to run any number of times.

update storage.buckets set public = true where id = 'restaurant-assets';
