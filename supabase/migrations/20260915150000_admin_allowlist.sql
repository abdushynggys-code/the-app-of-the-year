-- Список email, которым выдаётся админка автоматически.
-- Нужен, чтобы не искать user_id руками: человек регистрируется
-- (по email или через Google) — и сразу становится админом.
-- Применяется командой: npm run db:push

create table if not exists public.admin_emails (
  email text primary key,
  created_at timestamptz not null default now()
);

-- RLS включён, политик нет — значит, из браузера таблицу не прочитать
-- и не изменить. Работает с ней только триггер ниже (security definer).
alter table public.admin_emails enable row level security;

-- Кому выдаём доступ. Новых админов добавляй строкой сюда
-- (Table Editor → admin_emails → Insert row) — остальное произойдёт само.
insert into public.admin_emails (email)
values ('abdushynggys@gmail.com')
on conflict (email) do nothing;

-- При регистрации проверяем email по списку и выдаём админку.
create or replace function public.promote_admin_on_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1 from public.admin_emails e
    where lower(e.email) = lower(new.email)
  ) then
    insert into public.admins (user_id, email)
    values (new.id, new.email)
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_promote_admin on auth.users;
create trigger on_auth_user_created_promote_admin
  after insert on auth.users
  for each row execute function public.promote_admin_on_signup();

-- Если аккаунт уже был создан раньше — выдаём админку сразу.
insert into public.admins (user_id, email)
select u.id, u.email
from auth.users u
join public.admin_emails e on lower(e.email) = lower(u.email)
on conflict (user_id) do nothing;
