-- Ordine — Storage bucket for restaurant/menu/offer images
--
-- Single public bucket, objects namespaced as:
--   restaurant-assets/{restaurant_id}/logo/...
--   restaurant-assets/{restaurant_id}/cover/...
--   restaurant-assets/{restaurant_id}/menu/...
--   restaurant-assets/{restaurant_id}/offers/...
-- The first path segment after the bucket is always the restaurant_id,
-- which lets us check ownership generically for writes.

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

create policy "restaurant assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'restaurant-assets');

create policy "owner uploads own restaurant assets"
  on storage.objects for insert
  with check (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1 from restaurants r
      where r.owner_user_id = auth.uid()
        and r.id::text = (storage.foldername(name))[1]
    )
  );

create policy "owner updates own restaurant assets"
  on storage.objects for update
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1 from restaurants r
      where r.owner_user_id = auth.uid()
        and r.id::text = (storage.foldername(name))[1]
    )
  );

create policy "owner deletes own restaurant assets"
  on storage.objects for delete
  using (
    bucket_id = 'restaurant-assets'
    and exists (
      select 1 from restaurants r
      where r.owner_user_id = auth.uid()
        and r.id::text = (storage.foldername(name))[1]
    )
  );
