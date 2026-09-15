-- Проверка (ничего не меняет): что лежит в белом списке и кто сейчас владелец.
-- Нужна была, чтобы убедиться — гость не может удалить запись из списка.

do $do$
declare
  mails text;
  owners text;
begin
  select coalesce(string_agg(email, ', '), 'ПУСТО') into mails from public.admin_emails;
  select coalesce(string_agg(email || ' [' || role || '/' || status || ']', ', '), 'НЕТ')
    into owners from public.admins;

  raise notice 'БЕЛЫЙ СПИСОК: %', mails;
  raise notice 'ДОСТУПЫ: %', owners;
end
$do$;
