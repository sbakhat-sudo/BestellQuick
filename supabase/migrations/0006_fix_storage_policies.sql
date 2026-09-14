-- Vite-Fait — idempotent re-creation of the restaurant-assets storage
-- policies. Safe to run multiple times: an earlier partial run of
-- 0004_storage.sql (e.g. one that errored out before creating every
-- policy) can leave the bucket in an inconsistent state where some
-- policies exist and others don't. This drops and recreates all four
-- unconditionally so the end state is always correct.

insert into storage.buckets (id, name, public)
values ('restaurant-assets', 'restaurant-assets', true)
on conflict (id) do nothing;

drop policy if exists "restaurant assets are publicly readable" on storage.objects;
drop policy if exists "owner uploads own restaurant assets" on storage.objects;
drop policy if exists "owner updates own restaurant assets" on storage.objects;
drop policy if exists "owner deletes own restaurant assets" on storage.objects;

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
