-- Уборка проверочной заявки после переезда на этапы.
-- На чистой базе ничего не найдёт и ничего не сделает.

delete from public.repair_requests where track_code = 'RS-7001';
