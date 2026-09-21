-- Свой номер заказа у мастерской и журнал доступов.
-- Применяется командой: npm run db:push

-- ═══════════════════════════════════════════════════════════
-- 1) Второй номер заказа — тот, что мастерская пишет сама
-- ═══════════════════════════════════════════════════════════
-- У сайта номер случайный (RS-482170), и это не прихоть: по нему любой
-- гость смотрит статус без входа, а функция request_status_by_code не
-- ограничена по числу запросов. Будь номер по порядку — 1, 2, 3 — кто
-- угодно перебрал бы всю книгу заказов и прочитал, какое устройство и
-- в каком состоянии у каждого клиента.
--
-- Поэтому номер мастерской живёт отдельной колонкой и наружу не выходит:
-- ни в request_status_by_code, ни в том, что видит клиент у себя в
-- кабинете. Это внутренняя пометка, чтобы сойтись с журналом на бумаге.
alter table public.repair_requests add column if not exists shop_no text;

-- Рамки нестрогие: у мастерских бывает и «1024», и «A-12», и «12/09».
-- Ограничиваем только длину и набор символов — чтобы в номер не уехал
-- случайно вставленный абзац.
alter table public.repair_requests drop constraint if exists repair_requests_shop_no_check;
alter table public.repair_requests
  add constraint repair_requests_shop_no_check
  check (shop_no is null or shop_no ~ '^[A-Za-zА-Яа-я0-9 ./-]{1,24}$');

-- Номер не должен повторяться, иначе он перестаёт быть номером. Сравниваем
-- без учёта регистра: «a-12» и «A-12» для человека один и тот же заказ.
-- Частичный индекс — пустых номеров может быть сколько угодно.
create unique index if not exists repair_requests_shop_no_key
  on public.repair_requests (upper(shop_no))
  where shop_no is not null;

-- Поиск в админке идёт по одной готовой строке. Пересобираем её, чтобы
-- мастер мог найти заказ и по своему номеру тоже. Колонка вычисляемая,
-- поэтому старые строки пересчитаются сами — переносить ничего не надо.
-- coalesce обязателен: склейка с null дала бы null во всей строке.
drop index if exists public.repair_requests_search_idx;
alter table public.repair_requests drop column if exists search_text;
alter table public.repair_requests
  add column search_text text generated always as (
    lower(
      track_code || ' ' || name || ' ' || phone || ' ' || device
      || ' ' || coalesce(shop_no, '')
    )
  ) stored;

create index if not exists repair_requests_search_idx
  on public.repair_requests using gin (search_text gin_trgm_ops);

-- ═══════════════════════════════════════════════════════════
-- 2) Журнал: кто и когда трогал доступы
-- ═══════════════════════════════════════════════════════════
create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  -- Кто сделал. Может быть пусто: строку заводит и триггер на регистрации,
  -- у которого никакой сессии нет — тогда это сделал сам сайт.
  actor_id uuid,
  actor_email text,
  -- Что сделал: access.requested, access.approved, access.removed,
  -- role.owner, role.admin, order.number
  action text not null,
  -- Над кем или над чем: почта админа либо номер заказа.
  subject text,
  -- Короткая подробность. Личных данных клиента здесь нет и быть не должно:
  -- журнал читают, чтобы разобраться с доступами, а не с ремонтами.
  detail text
);

create index if not exists admin_log_at_idx on public.admin_log (at desc);

alter table public.admin_log enable row level security;

-- Читает только владелец. Писать не может никто: строки появляются из
-- триггеров ниже, а они security definer и правила обходят. Политики на
-- insert, update и delete нет намеренно — журнал, который можно
-- подчистить, не журнал.
drop policy if exists "owner reads log" on public.admin_log;
create policy "owner reads log"
  on public.admin_log for select
  to authenticated
  using (public.is_owner());

-- ═══════════════════════════════════════════════════════════
-- 3) Кто пишет в журнал
-- ═══════════════════════════════════════════════════════════
-- Триггеры, а не запись из приложения. Из приложения запись можно забыть
-- поставить в новом месте, а можно и подделать: ключ anon лежит во
-- фронтенде и виден любому. Триггер же срабатывает на самой строке —
-- мимо него доступ не выдать.
create or replace function public.log_admin_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  who text;
begin
  select u.email into who from auth.users u where u.id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.admin_log (actor_id, actor_email, action, subject, detail)
    values (
      auth.uid(),
      who,
      case when new.status = 'approved' then 'access.approved' else 'access.requested' end,
      new.email,
      new.role
    );
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Два поля — два отдельных события: по журналу должно быть видно,
    -- одобрили человека или поменяли ему роль.
    if new.status is distinct from old.status then
      insert into public.admin_log (actor_id, actor_email, action, subject, detail)
      values (auth.uid(), who, 'access.' || new.status, new.email, old.status);
    end if;
    if new.role is distinct from old.role then
      insert into public.admin_log (actor_id, actor_email, action, subject, detail)
      values (auth.uid(), who, 'role.' || new.role, new.email, old.role);
    end if;
    return new;
  end if;

  insert into public.admin_log (actor_id, actor_email, action, subject, detail)
  values (auth.uid(), who, 'access.removed', old.email, old.role);
  return old;
end;
$fn$;

drop trigger if exists admins_write_log on public.admins;
create trigger admins_write_log
  after insert or update or delete on public.admins
  for each row execute function public.log_admin_change();

-- Номер заказа меняют редко, и это как раз тот случай, когда потом важно
-- вспомнить кто. Пишем только номера, без имени и телефона клиента.
create or replace function public.log_shop_no_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
declare
  who text;
begin
  if new.shop_no is not distinct from old.shop_no then
    return new;
  end if;

  select u.email into who from auth.users u where u.id = auth.uid();

  insert into public.admin_log (actor_id, actor_email, action, subject, detail)
  values (
    auth.uid(),
    who,
    'order.number',
    new.track_code,
    coalesce(old.shop_no, '—') || ' → ' || coalesce(new.shop_no, '—')
  );
  return new;
end;
$fn$;

drop trigger if exists repair_requests_write_log on public.repair_requests;
create trigger repair_requests_write_log
  after update of shop_no on public.repair_requests
  for each row execute function public.log_shop_no_change();

-- Журнал только растёт. На бесплатном тарифе это не проблема: строка
-- весит около сотни байт, и даже десять событий в день — меньше мегабайта
-- за три года. Чистить его автоматически намеренно не стали: журнал,
-- который сам себя стирает, бесполезен ровно тогда, когда нужен.
