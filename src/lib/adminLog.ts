import { supabase } from './supabase';

// Журнал доступов: кто и когда кого пустил в админку, снял роль или
// переписал номер заказа. Пишут его триггеры в базе, а не приложение —
// мимо триггера доступ не выдать, и подделать запись с фронта нельзя.
//
// Читает только владелец, так решают правила доступа. Удалять записи не
// может никто: политики на delete нет намеренно.

export type LogRow = {
  id: number;
  at: string;
  actor_email: string | null;
  action: string;
  subject: string | null;
  detail: string | null;
};

// Показываем последние двести событий. Больше на экран всё равно не читают,
// а таблица растёт годами.
const LIMIT = 200;

export async function loadLog(): Promise<{ rows: LogRow[]; error: string }> {
  const { data, error } = await supabase
    .from('admin_log')
    .select('id, at, actor_email, action, subject, detail')
    .order('at', { ascending: false })
    .limit(LIMIT);

  if (error) return { rows: [], error: error.message };
  return { rows: (data ?? []) as LogRow[], error: '' };
}
