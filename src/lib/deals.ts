import { isSupabaseConfigured, supabase } from './supabase';

// Скидки. Владелец объявляет в админке, скажем, −5% на ноутбуки и мониторы,
// и на главной появляется полоса с этой скидкой. Одна скидка может
// относиться сразу к нескольким видам техники, и действовать их может
// несколько сразу.
//
// Все запросы к базе — здесь, чтобы страницы занимались только показом.

// Виды техники, на которые бывает скидка. Список закрытый: у каждого вида
// есть подпись на трёх языках в i18n.ts (t.kinds), и вид без подписи
// показать было бы нечем. Такой же список стоит в миграции.
export const DEAL_KINDS = [
  'phone',
  'tablet',
  'watch',
  'laptop',
  'pc',
  'monitor',
  // «Остальное» — для техники, которой в списке нет: колонок, наушников,
  // приставок. Без него на них нельзя объявить скидку вообще.
  'other',
] as const;

export type DealKind = (typeof DEAL_KINDS)[number];

export type Deal = {
  id: string;
  percent: number;
  kinds: DealKind[];
  note: string | null;
  active: boolean;
  // Последний день скидки в виде 'ГГГГ-ММ-ДД' или null — бессрочно.
  ends_on: string | null;
  created_at: string;
};

// Черновик новой скидки — то, что владелец ввёл в форме.
export type DealDraft = {
  percent: number;
  kinds: DealKind[];
  note: string;
  ends_on: string;
};

const COLUMNS = 'id, percent, kinds, note, active, ends_on, created_at';

// Сегодняшняя дата в том же виде, в каком её хранит база. Через
// toISOString нельзя: он переводит время в UTC, и поздно вечером в Астане
// получился бы уже завтрашний день.
function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// Скидка действует, если она включена и срок ещё не вышел.
export function isLive(deal: Deal): boolean {
  return deal.active && (!deal.ends_on || deal.ends_on >= today());
}

// all = true просит все скидки, включая выключенные и просроченные, —
// такое отдаёт база только мастерской.
//
// Ошибку возвращаем отдельной строкой, а не бросаем: для сайта отсутствие
// скидок не поломка, там просто не появится полоса. А вот владельцу в
// админке текст ошибки нужен — по нему видно, что миграция ещё не
// применена (npm run db:push).
export async function loadDeals(all = false): Promise<{ deals: Deal[]; error: string }> {
  if (!isSupabaseConfigured) return { deals: [], error: '' };

  const { data, error } = await supabase
    .from('deals')
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  if (error) return { deals: [], error: error.message };

  const deals = (data ?? []) as Deal[];
  return { deals: all ? deals : deals.filter(isLive), error: '' };
}

// Дальше — только для владельца. Если он вдруг не владелец, запрос не
// упадёт молча: база вернёт ошибку по политике, и её покажет админка.
export async function addDeal(draft: DealDraft): Promise<string> {
  const { error } = await supabase.from('deals').insert({
    percent: draft.percent,
    kinds: draft.kinds,
    note: draft.note.trim() || null,
    ends_on: draft.ends_on || null,
  });
  return error?.message ?? '';
}

export async function setDealActive(id: string, active: boolean): Promise<string> {
  const { error } = await supabase.from('deals').update({ active }).eq('id', id);
  return error?.message ?? '';
}

export async function removeDeal(id: string): Promise<string> {
  const { error } = await supabase.from('deals').delete().eq('id', id);
  return error?.message ?? '';
}
