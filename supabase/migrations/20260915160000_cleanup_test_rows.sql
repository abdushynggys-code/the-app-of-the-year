-- Уборка: строки, созданные при проверке базы после первого db push.
-- На чистой базе эта миграция просто ничего не найдёт.

delete from public.repair_requests
where track_code in ('RS-9901', 'RS-9902', 'RS-9903', 'RS-9911');

delete from public.site_reports
where user_agent = 'setup-test';
