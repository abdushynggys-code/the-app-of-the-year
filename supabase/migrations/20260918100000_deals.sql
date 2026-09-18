-- Скидки, которые мастерская объявляет сама.
-- Применяется командой: npm run db:push

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),

  -- Сколько процентов. Верхняя граница — защита от опечатки вроде «500».
  percent int not null check (percent between 1 and 90),

  -- На какую технику. Видов может быть сразу несколько: «−5% на ноутбуки
  -- и мониторы» — это одна скидка, а не две. Список закрытый: на сайте
  -- у каждого вида есть перевод на три языка, и чего нет в списке —
  -- нечем подписать.
  kinds text[] not null check (
    array_length(kinds, 1) between 1 and 6
    and kinds <@ array['phone', 'tablet', 'watch', 'laptop', 'pc', 'monitor']
  ),

  -- Необязательная приписка: «при замене экрана» и тому подобное.
  note text check (note is null or char_length(note) <= 120),

  -- Выключенная скидка остаётся в списке у мастерской, но с сайта пропадает.
  -- Так сезонную акцию можно вернуть через год, а не заводить заново.
  active boolean not null default true,

  -- Последний день скидки. null — бессрочно.
  ends_on date,

  created_at timestamptz not null default now()
);

alter table public.deals enable row level security;

-- Действующие скидки видит кто угодно, даже не входя в аккаунт: они
-- висят на главной и написаны для посетителей. Выключенные и просроченные
-- видит только мастерская.
drop policy if exists "anyone reads live deals" on public.deals;
create policy "anyone reads live deals"
  on public.deals for select
  to anon, authenticated
  using (
    (active and (ends_on is null or ends_on >= current_date))
    or public.is_admin()
  );

-- Объявлять и снимать скидки может только владелец: это решение про цены,
-- а не про ремонт конкретного устройства.
drop policy if exists "owner writes deals" on public.deals;
create policy "owner writes deals"
  on public.deals for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
