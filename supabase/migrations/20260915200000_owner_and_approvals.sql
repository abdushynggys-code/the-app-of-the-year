-- Роли и одобрение доступа в админку.
--
-- Владелец один. Он одобряет новых админов и может передать роль владельца
-- другому человеку — это нужно, чтобы после сдачи сайта отдать управление
-- хозяину мастерской, а самому остаться обычным админом или уйти совсем.
--
-- Применяется командой: npm run db:push

-- ── 1) Новые поля ────────────────────────────────────────────
alter table public.admins
  add column if not exists role text not null default 'admin',
  add column if not exists status text not null default 'approved',
  add column if not exists requested_at timestamptz not null default now(),
  add column if not exists approved_at timestamptz,
  add column if not exists approved_by uuid references auth.users (id) on delete set null;

do $do$
begin
  if not exists (select 1 from pg_constraint where conname = 'admins_role_check') then
    alter table public.admins add constraint admins_role_check check (role in ('owner', 'admin'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'admins_status_check') then
    alter table public.admins add constraint admins_status_check check (status in ('pending', 'approved'));
  end if;
end
$do$;

-- Владелец может быть только один: база не даст появиться второму.
create unique index if not exists admins_one_owner
  on public.admins ((role)) where role = 'owner';

-- ── 2) Кто есть кто ──────────────────────────────────────────
-- Ожидающие одобрения админами не считаются.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'approved'
  );
$fn$;

create or replace function public.is_owner()
returns boolean
language sql
security definer
stable
set search_path = public
as $fn$
  select exists (
    select 1 from public.admins a
    where a.user_id = auth.uid() and a.status = 'approved' and a.role = 'owner'
  );
$fn$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_owner() to authenticated;

-- ── 3) Правила доступа к самой таблице admins ────────────────
-- Свою строку видит каждый (чтобы понимать, одобрили его или нет),
-- все строки — только владелец.
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row"
  on public.admins for select
  to authenticated
  using (user_id = auth.uid() or public.is_owner());

-- Попросить доступ может любой вошедший — но только за себя и только
-- как «ожидающий». Выдать себе одобрение через эту политику нельзя.
drop policy if exists "request admin access" on public.admins;
create policy "request admin access"
  on public.admins for insert
  to authenticated
  with check (user_id = auth.uid() and status = 'pending' and role = 'admin');

-- Одобряет только владелец. Сделать кого-то владельцем обычным
-- изменением строки нельзя — для этого есть transfer_ownership.
drop policy if exists "owner manages access" on public.admins;
create policy "owner manages access"
  on public.admins for update
  to authenticated
  using (public.is_owner())
  with check (public.is_owner() and role = 'admin');

-- Забрать доступ может владелец. Строку владельца удалить нельзя,
-- иначе мастерская осталась бы без хозяина.
drop policy if exists "owner revokes access" on public.admins;
create policy "owner revokes access"
  on public.admins for delete
  to authenticated
  using (public.is_owner() and role <> 'owner');

-- ── 4) Передача роли владельца ───────────────────────────────
create or replace function public.transfer_ownership(new_owner uuid)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_owner() then
    raise exception 'Передать роль владельца может только владелец';
  end if;

  if new_owner = auth.uid() then
    raise exception 'Вы уже владелец';
  end if;

  if not exists (
    select 1 from public.admins
    where user_id = new_owner and status = 'approved'
  ) then
    raise exception 'Новым владельцем может стать только одобренный админ';
  end if;

  -- Порядок важен: сначала освобождаем роль, потом назначаем,
  -- иначе сработает запрет на двух владельцев.
  update public.admins set role = 'admin' where role = 'owner';
  update public.admins set role = 'owner' where user_id = new_owner;
end;
$fn$;

grant execute on function public.transfer_ownership(uuid) to authenticated;

-- ── 5) Первый вход ───────────────────────────────────────────
-- Первый человек из списка admin_emails становится владельцем,
-- остальные — сразу одобренными админами.
create or replace function public.promote_admin_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if exists (
    select 1 from public.admin_emails e
    where lower(e.email) = lower(new.email)
  ) then
    insert into public.admins (user_id, email, role, status, approved_at)
    values (
      new.id,
      new.email,
      case when exists (select 1 from public.admins where role = 'owner')
        then 'admin' else 'owner' end,
      'approved',
      now()
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$fn$;

drop trigger if exists on_auth_user_created_promote_admin on auth.users;
create trigger on_auth_user_created_promote_admin
  after insert on auth.users
  for each row execute function public.promote_admin_on_signup();

-- Если аккаунт из списка уже был создан раньше — выдаём доступ сейчас.
-- Владельцем становится только самый первый аккаунт: подзапрос видит
-- таблицу такой, какой она была до начала вставки, поэтому без нумерации
-- строк здесь могло бы появиться сразу два владельца.
insert into public.admins (user_id, email, role, status, approved_at)
select
  u.id,
  u.email,
  case
    when exists (select 1 from public.admins where role = 'owner') then 'admin'
    when row_number() over (order by u.created_at) = 1 then 'owner'
    else 'admin'
  end,
  'approved',
  now()
from auth.users u
join public.admin_emails e on lower(e.email) = lower(u.email)
on conflict (user_id) do nothing;
