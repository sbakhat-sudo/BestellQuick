-- BestellQuick — simplify restaurant-assets storage policies
--
-- The previous policies matched the path's first folder segment against
-- restaurants.id via a JOIN back to restaurants (owner_user_id = auth.uid()).
-- On at least one live project this kept rejecting uploads with "new row
-- violates row-level security policy" even though the data checked out
-- (matching restaurant_id in the path, matching owner_user_id, a valid
-- Authorization header on the request) — every plausible cause we could
-- verify from the client side. Rather than keep chasing that, this
-- switches to the exact pattern Supabase's own docs recommend and that is
-- known to work reliably: key the folder directly off auth.uid(), with no
-- join needed. Objects are now stored as {auth.uid()}/{folder}/{filename}
-- instead of {restaurant_id}/{folder}/{filename} (see the matching change
-- in src/lib/storage.ts).

drop policy if exists "owner uploads own restaurant assets" on storage.objects;
drop policy if exists "owner updates own restaurant assets" on storage.objects;
drop policy if exists "owner deletes own restaurant assets" on storage.objects;

create policy "owner uploads own restaurant assets"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner updates own restaurant assets"
  on storage.objects for update
  using (
    bucket_id = 'restaurant-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "owner deletes own restaurant assets"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-assets'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
