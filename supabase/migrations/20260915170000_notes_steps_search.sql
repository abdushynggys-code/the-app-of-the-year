-- Заметки мастера, чек-лист этапов, отметка о выдаче и быстрый поиск.
-- Применяется командой: npm run db:push

-- ── 1) Новые поля ────────────────────────────────────────────
-- notes  — только для мастеров, клиент их не видит никогда.
-- steps  — какие этапы уже сделаны: ["accepted","diagnosed",...].
-- picked_up_at — когда клиент забрал устройство.
alter table public.repair_requests
  add column if not exists notes text not null default '',
  add column if not exists steps jsonb not null default '["accepted"]'::jsonb,
  add column if not exists picked_up_at timestamptz;

alter table public.repair_requests
  alter column steps set default '["accepted"]'::jsonb;

-- ── 2) Поиск ─────────────────────────────────────────────────
-- Одна колонка, которую база собирает сама из кода, имени, телефона
-- и устройства. Искать по ней — одно условие вместо четырёх.
alter table public.repair_requests
  add column if not exists search_text text
  generated always as (
    lower(track_code || ' ' || name || ' ' || phone || ' ' || device)
  ) stored;

-- pg_trgm умеет искать «кусок слова» быстро, без перебора всей таблицы.
create extension if not exists pg_trgm;

create index if not exists repair_requests_search_idx
  on public.repair_requests using gin (search_text gin_trgm_ops);
create index if not exists repair_requests_status_idx
  on public.repair_requests (status);
create index if not exists repair_requests_created_idx
  on public.repair_requests (created_at desc);

-- ── 3) Статус считается из этапов ────────────────────────────
-- Один источник правды: мастер отмечает галочки, статус берётся
-- из самого дальнего отмеченного этапа. Руками статус не ставим.
create or replace function public.status_from_steps(steps jsonb)
returns text
language sql
immutable
as $$
  select coalesce(
    (
      select s.step_status
      from (values
        ('delivered', 'done',        6),
        ('tested',    'ready',       5),
        ('repaired',  'repair',      4),
        ('approved',  'repair',      3),
        ('diagnosed', 'diagnostics', 2),
        ('accepted',  'new',         1)
      ) as s(step_key, step_status, step_rank)
      where steps ? s.step_key
      order by s.step_rank desc
      limit 1
    ),
    'new'
  );
$$;

create or replace function public.sync_status_from_steps()
returns trigger
language plpgsql
as $$
begin
  new.status := public.status_from_steps(new.steps);
  -- Галочка «выдано» ставит дату выдачи, снятие галочки — убирает.
  if new.steps ? 'delivered' then
    new.picked_up_at := coalesce(new.picked_up_at, now());
  else
    new.picked_up_at := null;
  end if;
  return new;
end;
$$;

drop trigger if exists repair_requests_steps_sync on public.repair_requests;
create trigger repair_requests_steps_sync
  before insert or update of steps on public.repair_requests
  for each row execute function public.sync_status_from_steps();

-- Старым заявкам расставляем галочки по их нынешнему статусу.
update public.repair_requests
set steps = case status
  when 'diagnostics' then '["accepted","diagnosed"]'::jsonb
  when 'repair'      then '["accepted","diagnosed","approved"]'::jsonb
  when 'ready'       then '["accepted","diagnosed","approved","repaired","tested"]'::jsonb
  when 'done'        then '["accepted","diagnosed","approved","repaired","tested","delivered"]'::jsonb
  else '["accepted"]'::jsonb
end
where steps = '[]'::jsonb or steps is null;

-- ── 4) Что видит клиент ──────────────────────────────────────
-- Добавляем этапы, чтобы нарисовать полоску прогресса.
-- notes и телефон сюда НЕ попадают — это внутренняя кухня.
drop function if exists public.request_status_by_code(text);
create function public.request_status_by_code(code text)
returns table (
  track_code text,
  device text,
  status text,
  steps jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.track_code, r.device, r.status, r.steps, r.created_at, r.updated_at
  from public.repair_requests r
  where upper(r.track_code) = upper(trim(code))
  limit 1;
$$;

grant execute on function public.request_status_by_code(text) to anon, authenticated;

-- ── 5) Счётчики для админки ──────────────────────────────────
-- Считает база, а не браузер: цифры верные даже когда на экране
-- показана только одна страница заявок.
create or replace function public.admin_request_stats()
returns table (status text, n bigint)
language sql
security definer
set search_path = public
as $$
  select r.status, count(*)::bigint
  from public.repair_requests r
  where public.is_admin()
  group by r.status;
$$;

grant execute on function public.admin_request_stats() to authenticated;
