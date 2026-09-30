import { isSupabaseConfigured, supabase } from './supabase';
import { KINDS, type Kind } from './kinds';

// Цены на ремонт. Владелец вписывает их в админке — «Замена экрана, от 15 000 ₸» —
// и ровно эти строки появляются на главной.
//
// Придумать цену за мастерскую нельзя: человек придёт с этой цифрой, и он
// будет прав. Поэтому в коде нет ни одной суммы. Пока владелец не вписал
// ни одной цены, раздел на сайте просто не появляется.
//
// Все запросы к базе — здесь, чтобы страницы занимались только показом.

export type Price = {
  id: string;
  kind: Kind;
  service: string;
  amount: number;
  note: string | null;
  active: boolean;
  created_at: string;
};

// Черновик новой цены — то, что владелец ввёл в форме.
export type PriceDraft = {
  kind: Kind;
  service: string;
  amount: number;
  note: string;
};

const COLUMNS = 'id, kind, service, amount, note, active, created_at';

// Порядок видов техники на сайте — тот же, что в kinds.ts: сначала телефоны,
// «остальное» в конце. Сортировать по алфавиту нельзя: на трёх языках
// получились бы три разных порядка.
const ORDER = new Map<Kind, number>(KINDS.map((kind, i) => [kind, i]));

// Внутри вида — от дешёвого к дорогому. Так первая же строка отвечает
// на вопрос «от скольки», с которым человек и открыл раздел.
function compare(a: Price, b: Price): number {
  const byKind = (ORDER.get(a.kind) ?? 99) - (ORDER.get(b.kind) ?? 99);
  return byKind !== 0 ? byKind : a.amount - b.amount;
}

// Цены, сгруппированные по виду техники. Пустые группы не возвращаем:
// заголовок «Часы» без единой строки под ним выглядит как поломка.
export type PriceGroup = { kind: Kind; items: Price[] };

export function groupByKind(prices: Price[]): PriceGroup[] {
  return KINDS.map((kind) => ({
    kind,
    items: prices.filter((p) => p.kind === kind).sort(compare),
  })).filter((group) => group.items.length > 0);
}

// all = true просит и выключенные цены — такое отдаёт база только мастерской.
//
// Ошибку возвращаем отдельной строкой, а не бросаем: для посетителя
// «цен нет» не поломка, там просто не появится раздел. А владельцу в
// админке текст ошибки нужен — по нему видно, что миграция ещё не
// применена (npm run db:push).
export async function loadPrices(all = false): Promise<{ prices: Price[]; error: string }> {
  if (!isSupabaseConfigured) return { prices: [], error: '' };

  const { data, error } = await supabase.from('prices').select(COLUMNS);
  if (error) return { prices: [], error: error.message };

  const prices = ((data ?? []) as Price[]).sort(compare);
  return { prices: all ? prices : prices.filter((p) => p.active), error: '' };
}

// Дальше — только для владельца. Если он вдруг не владелец, запрос не
// упадёт молча: база вернёт ошибку по политике, и её покажет админка.
//
// duplicate — это не «что-то пошло не так», а понятный случай: такая работа
// для этого вида техники уже в списке. Ответ базы (23505 — нарушено
// «уникальное») владельцу ничего не скажет, поэтому разбираем его здесь,
// а админка покажет human-фразу «исправьте существующую строку».
export async function addPrice(draft: PriceDraft): Promise<{ error: string; duplicate: boolean }> {
  const { error } = await supabase.from('prices').insert({
    kind: draft.kind,
    service: draft.service.trim(),
    amount: draft.amount,
    note: draft.note.trim() || null,
  });
  if (!error) return { error: '', duplicate: false };
  return { error: error.message, duplicate: error.code === '23505' };
}

export async function setPriceActive(id: string, active: boolean): Promise<string> {
  const { error } = await supabase.from('prices').update({ active }).eq('id', id);
  return error?.message ?? '';
}

export async function removePrice(id: string): Promise<string> {
  const { error } = await supabase.from('prices').delete().eq('id', id);
  return error?.message ?? '';
}

// Цена словами: 15000 → «15 000». Пробел неразрывный — иначе на телефоне
// число переносится посреди себя и читается как две разные суммы.
export function formatAmount(amount: number, lang: string): string {
  const locale = lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-GB' : 'ru-RU';
  return amount.toLocaleString(locale).replace(/[\s,]/g, ' ');
}

// Что стоит до суммы и что после.
//
// Нужно это из-за казахского: «бастап» — послелог, он стоит ПОСЛЕ суммы
// («15 000 ₸ бастап»), а русское «от» и английское from — перед ней.
// Пока подпись и валюта лежали в словаре двумя отдельными строками,
// собрать из них правильную казахскую фразу было нельзя в принципе:
// порядок слов не хранится ни в одной из них. Поэтому в словаре теперь
// целый шаблон с меткой {sum}, а здесь он разбирается на две половины —
// сумму между ними страница набирает крупно и своим цветом.
export function priceAround(tpl: string): { before: string; after: string } {
  const at = tpl.indexOf('{sum}');
  // Метку забыли — не падаем и не показываем «{sum}» живому человеку:
  // сумма встаёт первой, подпись следом. Это хуже, но читаемо.
  if (at < 0) return { before: '', after: ` ${tpl}` };
  return { before: tpl.slice(0, at), after: tpl.slice(at + '{sum}'.length) };
}

