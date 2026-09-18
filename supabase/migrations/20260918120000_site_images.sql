-- Картинки самого сайта: их ставит владелец из админки, а видят все посетители.
-- Применяется командой: npm run db:push

-- Корзина открытая — в отличие от repair-photos, где лежат чужие устройства
-- и ссылки выдаются подписанные на час. Тут наоборот: это лицо мастерской,
-- картинку должен увидеть каждый, кто зашёл на сайт, в том числе без входа.
insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

-- Читать отдельно разрешать не нужно: у открытой корзины ссылка работает у всех.
-- А вот ставить и снимать картинки может только владелец: это решение
-- про то, как мастерская выглядит, а не про конкретный ремонт.
drop policy if exists "owner uploads site images" on storage.objects;
create policy "owner uploads site images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'site-images' and public.is_owner());

-- update обязателен: без него замена картинки в том же слоте (upsert) падает,
-- и владелец не понимает, почему новое фото не встаёт на место старого.
drop policy if exists "owner replaces site images" on storage.objects;
create policy "owner replaces site images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'site-images' and public.is_owner())
  with check (bucket_id = 'site-images' and public.is_owner());

drop policy if exists "owner deletes site images" on storage.objects;
create policy "owner deletes site images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'site-images' and public.is_owner());
