-- Страховка: если владельца в базе нет, назначаем им первый аккаунт
-- из списка admin_emails. Такое возможно, если человек зарегистрировался
-- раньше, чем появились роли — тогда его строка осталась обычным админом.
-- Если владелец уже есть, миграция ничего не трогает.

do $do$
declare
  target uuid;
  target_mail text;
begin
  if exists (select 1 from public.admins where role = 'owner') then
    raise notice 'ПРОВЕРКА: владелец уже назначен, ничего не меняем';
    return;
  end if;

  select a.user_id, a.email into target, target_mail
  from public.admins a
  join public.admin_emails e on lower(e.email) = lower(a.email)
  order by a.requested_at
  limit 1;

  if target is null then
    raise notice 'ПРОВЕРКА: владельца нет и назначить некого (никто из списка ещё не регистрировался)';
    return;
  end if;

  update public.admins
  set role = 'owner',
      status = 'approved',
      approved_at = coalesce(approved_at, now())
  where user_id = target;

  raise notice 'ПРОВЕРКА: владельцем назначен %', target_mail;
end
$do$;
