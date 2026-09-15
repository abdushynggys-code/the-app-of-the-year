-- Заявки на ремонт для сервисного центра RESET.
-- Применяется командой: npm run db:push

-- 1) Таблица заявок
create table if not exists public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  -- Если клиент вошёл в аккаунт — заявка привязана к нему. Гость оставляет заявку без входа.
  user_id uuid references auth.users (id) on delete set null,
  -- Короткий код: по нему гость смотрит статус без регистрации.
  track_code text not null unique,
  name text not null,
  phone text not null,
  device text not null,
  problem text not null,
  -- new → diagnostics → repair → ready → done
  status text not null default 'new'
    check (status in ('new', 'diagnostics', 'repair', 'ready', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists repair_requests_user_id_idx on public.repair_requests (user_id);
create index if not exists repair_requests_track_code_idx on public.repair_requests (track_code);

-- 2) Включаем защиту (без неё таблица закрыта)
alter table public.repair_requests enable row level security;

-- 3) Оставить заявку может любой — и гость, и вошедший клиент.
drop policy if exists "anyone can create a request" on public.repair_requests;
create policy "anyone can create a request"
  on public.repair_requests for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- 4) В личном кабинете клиент видит только свои заявки.
drop policy if exists "read own requests" on public.repair_requests;
create policy "read own requests"
  on public.repair_requests for select
  to authenticated
  using (user_id = auth.uid());

-- 5) Проверка статуса по коду — без регистрации.
-- security definer: функция сама читает таблицу и отдаёт ТОЛЬКО безопасные поля.
create or replace function public.request_status_by_code(code text)
returns table (
  track_code text,
  device text,
  status text,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select r.track_code, r.device, r.status, r.created_at, r.updated_at
  from public.repair_requests r
  where upper(r.track_code) = upper(trim(code))
  limit 1;
$$;

grant execute on function public.request_status_by_code(text) to anon, authenticated;

-- 6) updated_at обновляется сам при смене статуса
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists repair_requests_touch on public.repair_requests;
create trigger repair_requests_touch
  before update on public.repair_requests
  for each row execute function public.touch_updated_at();
