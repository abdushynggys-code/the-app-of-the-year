-- Владельцев теперь может быть несколько, а белым списком email
-- можно управлять прямо из админки.
-- Применяется командой: npm run db:push

-- ── 1) Снимаем ограничение «владелец только один» ────────────
drop index if exists public.admins_one_owner;

-- ── 2) Назначение и снятие роли владельца ────────────────────
-- Через обычное изменение строки роль не поменять (это запрещает политика),
-- поэтому роли меняются только здесь — с проверками.
drop function if exists public.transfer_ownership(uuid);

create or replace function public.set_admin_role(target uuid, new_role text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  owners int;
begin
  if not public.is_owner() then
    raise exception 'Менять роли может только владелец';
  end if;

  if new_role not in ('owner', 'admin') then
    raise exception 'Неизвестная роль: %', new_role;
  end if;

  if not exists (
    select 1 from public.admins where user_id = target and status = 'approved'
  ) then
    raise exception 'Сначала одобрите доступ этому человеку';
  end if;

  -- Последнего владельца снять нельзя: иначе мастерская останется
  -- без единого человека, который может раздавать доступы.
  if new_role = 'admin'
     and exists (select 1 from public.admins where user_id = target and role = 'owner')
  then
    select count(*) into owners from public.admins where role = 'owner';
    if owners <= 1 then
      raise exception 'Нельзя снять последнего владельца';
    end if;
  end if;

  update public.admins set role = new_role where user_id = target;
end;
$fn$;

grant execute on function public.set_admin_role(uuid, text) to authenticated;

-- ── 3) Белый список email ────────────────────────────────────
-- Кто в списке — получает доступ сразу, без одобрения.
drop policy if exists "owner reads allowlist" on public.admin_emails;
create policy "owner reads allowlist"
  on public.admin_emails for select
  to authenticated
  using (public.is_owner());

drop policy if exists "owner removes from allowlist" on public.admin_emails;
create policy "owner removes from allowlist"
  on public.admin_emails for delete
  to authenticated
  using (public.is_owner());

-- Добавление идёт через функцию: если человек уже зарегистрирован,
-- доступ открывается сразу, а не после повторной регистрации.
create or replace function public.add_admin_email(new_email text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  clean text := lower(trim(new_email));
begin
  if not public.is_owner() then
    raise exception 'Управлять белым списком может только владелец';
  end if;

  if clean !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'Это не похоже на email: %', new_email;
  end if;

  insert into public.admin_emails (email)
  values (clean)
  on conflict (email) do nothing;

  -- Уже зарегистрированным выдаём доступ сразу.
  insert into public.admins (user_id, email, role, status, approved_at)
  select u.id, u.email, 'admin', 'approved', now()
  from auth.users u
  where lower(u.email) = clean
  on conflict (user_id) do update
    set status = 'approved',
        approved_at = coalesce(admins.approved_at, now());
end;
$fn$;

grant execute on function public.add_admin_email(text) to authenticated;

-- Приводим то, что уже лежит в списке, к нижнему регистру,
-- чтобы сравнение с почтой аккаунта всегда совпадало.
update public.admin_emails
set email = lower(trim(email))
where email <> lower(trim(email));
