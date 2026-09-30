-- Цены на ремонт: «от 15 000 ₸ за замену экрана».
-- Применяется командой: npm run db:push
--
-- Почему цены живут в базе, а не в коде сайта: цену знает только мастерская.
-- Придумать её за неё нельзя — человек придёт с этой цифрой и будет прав.
-- Поэтому владелец вписывает цены в админке, и ровно они появляются на главной.
-- Пока не вписал ни одной — на сайте просто нет раздела с ценами. Пустой
-- заголовок «Цены» без единой строки хуже, чем его отсутствие.

create table if not exists public.prices (
  id uuid primary key default gen_random_uuid(),

  -- Вид техники. Список тот же, что у скидок: у каждого вида есть подпись
  -- на трёх языках в i18n.ts (t.kinds), и вида без подписи показать нечем.
  kind text not null check (
    kind in ('phone', 'tablet', 'watch', 'laptop', 'pc', 'monitor', 'other')
  ),

  -- Что чиним — словами владельца: «Замена экрана iPhone 13».
  -- Это не переводится: названия работ пишет мастерская, а не сайт.
  service text not null check (char_length(service) between 2 and 80),

  -- «От» скольки тенге. Именно «от»: точную сумму называют после
  -- бесплатной диагностики, и обещать её заранее нельзя.
  -- Границы — защита от опечатки: 50 ₸ и 900 000 000 ₸ одинаково неправда.
  amount int not null check (amount between 500 and 5000000),

  -- Необязательная приписка: «с оригинальным дисплеем» и тому подобное.
  note text check (note is null or char_length(note) <= 120),

  -- Выключенная цена остаётся у мастерской, но с сайта пропадает.
  -- Так сезонную строку можно вернуть, а не заводить заново.
  active boolean not null default true,

  created_at timestamptz not null default now()
);

-- Одну и ту же работу дважды в списке видеть незачем: на сайте это выглядит
-- как ошибка, а владелец не понимает, какую из двух строк он правит.
create unique index if not exists prices_kind_service_idx
  on public.prices (kind, lower(service));

alter table public.prices enable row level security;

-- Действующие цены видит кто угодно, даже не входя в аккаунт: они висят
-- на главной и написаны для посетителей. Выключенные видит только мастерская.
drop policy if exists "anyone reads live prices" on public.prices;
create policy "anyone reads live prices"
  on public.prices for select
  to anon, authenticated
  using (active or public.is_admin());

-- Ставить и менять цены может только владелец: это решение про деньги,
-- а не про ремонт конкретного устройства.
drop policy if exists "owner writes prices" on public.prices;
create policy "owner writes prices"
  on public.prices for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
