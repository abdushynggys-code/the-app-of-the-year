-- Отзывы клиентов на главной.
-- Применяется командой: npm run db:push
--
-- Сайт уже показывает оценку 2ГИС и ссылку на неё — это цифра, которую
-- поставили не мы. Но одна цифра ничего не рассказывает. Живые отзывы
-- рассказывают, и поэтому их просят первыми.
--
-- Придумывать отзывы нельзя. Совсем. Выдуманный отзыв — это обман клиента,
-- и его всегда видно: люди идут проверять на 2ГИС. Поэтому таблица устроена
-- так, чтобы владелец ПЕРЕНОСИЛ сюда настоящие отзывы: у каждой строки есть
-- источник, и на сайте рядом с отзывом написано, откуда он взят.
-- Пока владелец не перенёс ни одного — раздела с отзывами на сайте нет.

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),

  -- Имя автора так, как оно стоит под настоящим отзывом.
  author text not null check (char_length(author) between 2 and 60),

  -- Сам отзыв. Длинные не нужны: на телефоне их не дочитывают.
  body text not null check (char_length(body) between 10 and 600),

  -- Сколько звёзд поставил автор.
  rating int not null check (rating between 1 and 5),

  -- Откуда отзыв. Список закрытый: у каждого источника есть подпись
  -- на трёх языках, и источника без подписи показать нечем.
  -- Это и есть защита от выдумки — «ниоткуда» вписать нельзя.
  source text not null check (source in ('2gis', 'google', 'instagram', 'whatsapp')),

  -- Когда отзыв оставлен. null — если дата неизвестна.
  posted_on date,

  -- Снятый отзыв остаётся у мастерской, но с сайта пропадает.
  active boolean not null default true,

  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

-- Отзывы на главной читают все, в том числе не входя в аккаунт.
drop policy if exists "anyone reads live reviews" on public.reviews;
create policy "anyone reads live reviews"
  on public.reviews for select
  to anon, authenticated
  using (active or public.is_admin());

-- Переносить и снимать отзывы может только владелец: это лицо мастерской.
drop policy if exists "owner writes reviews" on public.reviews;
create policy "owner writes reviews"
  on public.reviews for all
  to authenticated
  using (public.is_owner())
  with check (public.is_owner());
