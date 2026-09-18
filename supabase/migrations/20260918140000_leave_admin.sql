-- Уйти из админки самому.
-- Применяется командой: npm run db:push

-- Зачем отдельная функция, а не обычный delete: правила доступа к таблице
-- admins разрешают удалять строки только владельцу и только не-владельцам
-- (политика "owner revokes access" в 20260915200000_owner_and_approvals.sql).
-- Свою строку не может удалить никто. А обычный delete под запретом RLS
-- не падает с ошибкой — он просто удаляет ноль строк и отвечает «всё хорошо».
-- То есть кнопка «убрать мой доступ» показала бы прощание, а доступ остался бы
-- на месте. Поэтому удаление живёт здесь, в функции, которая умеет отказать
-- словами.
create or replace function public.leave_admin()
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  my_role text;
  owners int;
begin
  select role into my_role
  from public.admins
  where user_id = auth.uid() and status = 'approved';

  if my_role is null then
    raise exception 'У вас и так нет доступа';
  end if;

  -- Владелец не уходит одним движением. Сначала он передаёт роль — иначе
  -- мастерская может остаться без единого человека, который раздаёт доступы,
  -- и починить это можно будет только руками в панели Supabase.
  if my_role = 'owner' then
    select count(*) into owners from public.admins where role = 'owner';
    if owners <= 1 then
      raise exception 'Нельзя уйти последнему владельцу: сначала назначьте другого';
    end if;
    raise exception 'Сначала снимите с себя роль владельца';
  end if;

  delete from public.admins where user_id = auth.uid();
end;
$fn$;

grant execute on function public.leave_admin() to authenticated;
