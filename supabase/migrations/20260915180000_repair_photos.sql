-- Фотографии устройств «до/после». Лежат в Supabase Storage,
-- корзина закрытая: без входа админом файл не открыть.
-- Применяется командой: npm run db:push

insert into storage.buckets (id, name, public)
values ('repair-photos', 'repair-photos', false)
on conflict (id) do nothing;

-- Файлы кладём в папку по номеру заявки: <id заявки>/<имя файла>.
drop policy if exists "admins read repair photos" on storage.objects;
create policy "admins read repair photos"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'repair-photos' and public.is_admin());

drop policy if exists "admins upload repair photos" on storage.objects;
create policy "admins upload repair photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'repair-photos' and public.is_admin());

drop policy if exists "admins delete repair photos" on storage.objects;
create policy "admins delete repair photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'repair-photos' and public.is_admin());
