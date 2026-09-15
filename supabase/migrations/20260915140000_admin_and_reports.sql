-- Админка и сообщения об ошибках сайта.
-- Применяется командой: npm run db:push

-- ═══════════════════════════════════════════════════════════
-- 1) Кто админ
-- ═══════════════════════════════════════════════════════════
-- Строка в этой таблице = доступ к админке. Добавлять только вручную
-- через дашборд Supabase (Table Editor → admins → Insert row).
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Каждый видит только свою строку — так сайт понимает «я админ или нет».
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid());

-- Проверка «текущий пользователь — админ?».
-- security definer: функция читает admins в обход RLS, поэтому её можно
-- безопасно вызывать внутри политик других таблиц.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;

-- ═══════════════════════════════════════════════════════════
-- 2) Права админа на заявки
-- ═══════════════════════════════════════════════════════════
-- Админ видит все заявки и может менять статус.
drop policy if exists "admins read all requests" on public.repair_requests;
create policy "admins read all requests"
  on public.repair_requests for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins update requests" on public.repair_requests;
create policy "admins update requests"
  on public.repair_requests for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ═══════════════════════════════════════════════════════════
-- 3) Сообщения об ошибках сайта
-- ═══════════════════════════════════════════════════════════
create table if not exists public.site_reports (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  contact text,
  page text,
  user_agent text,
  status text not null default 'new' check (status in ('new', 'done')),
  created_at timestamptz not null default now()
);

create index if not exists site_reports_status_idx on public.site_reports (status, created_at desc);

alter table public.site_reports enable row level security;

-- Сообщить о проблеме может любой посетитель, даже без аккаунта.
drop policy if exists "anyone can report" on public.site_reports;
create policy "anyone can report"
  on public.site_reports for insert
  to anon, authenticated
  with check (char_length(trim(message)) between 1 and 2000);

-- Читать и закрывать сообщения может только админ.
drop policy if exists "admins read reports" on public.site_reports;
create policy "admins read reports"
  on public.site_reports for select
  to authenticated
  using (public.is_admin());

drop policy if exists "admins update reports" on public.site_reports;
create policy "admins update reports"
  on public.site_reports for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
