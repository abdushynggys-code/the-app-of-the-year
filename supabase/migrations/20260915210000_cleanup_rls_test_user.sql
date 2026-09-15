-- Уборка: аккаунт, созданный при проверке правил доступа.
-- На чистой базе ничего не найдёт.

delete from public.admins
where email = 'reset-rls-check@mailinator.com';

delete from auth.users
where email = 'reset-rls-check@mailinator.com';
