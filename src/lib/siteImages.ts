import { isSupabaseConfigured, supabase } from './supabase';

// Картинки сайта, которые владелец меняет сам из админки.
//
// Пока он ничего не загрузил, на месте картинок остаются нарисованные
// сцены из Art.tsx — сайт выглядит ровно так же, как сегодня. Это важно:
// пустая рамка вместо фотографии хуже, чем аккуратный рисунок.

// Места, куда можно поставить фотографию. Список закрытый: у каждого слота
// своё место в вёрстке и своя подпись на трёх языках.
export const SLOTS = ['hero', 'workbench', 'warranty'] as const;

export type Slot = (typeof SLOTS)[number];

export type SiteImages = Partial<Record<Slot, string>>;

const BUCKET = 'site-images';

// Имя файла = имя слота. Слот один — картинка одна, поэтому отдельная
// таблица в базе не нужна: хранилище само и есть список.
function slotOf(fileName: string): Slot | null {
  const name = fileName.split('.')[0] as Slot;
  return SLOTS.includes(name) ? name : null;
}

// Что сейчас стоит на сайте.
//
// Сначала спрашиваем список и только потом строим ссылки. Наоборот нельзя:
// getPublicUrl никуда не ходит и не ошибается — он просто склеивает строку,
// и на несуществующий файл честно вернёт ссылку, по которой ничего нет.
// Получилась бы битая картинка вместо рисунка.
export async function loadSiteImages(): Promise<SiteImages> {
  if (!isSupabaseConfigured) return {};

  const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 50 });
  if (error || !data) return {};

  const out: SiteImages = {};
  for (const file of data) {
    const slot = slotOf(file.name);
    if (!slot) continue;
    const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(file.name).data;
    // Ссылка на слот не меняется при замене картинки, поэтому браузер и CDN
    // продолжали бы показывать старое фото. Время правки в хвосте ссылки
    // делает её новой ровно тогда, когда картинку действительно заменили.
    const stamp = file.updated_at ? `?v=${Date.parse(file.updated_at)}` : '';
    out[slot] = `${publicUrl}${stamp}`;
  }
  return out;
}

// Дальше — только для владельца, так решает сама база.
export async function uploadSlot(slot: Slot, file: File): Promise<string> {
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${slot}.${ext}`, file, { upsert: true, contentType: file.type });
  return error?.message ?? '';
}

// Удаляем все расширения слота: владелец мог поставить jpg, а потом png —
// тогда в корзине лежат два файла, и старый бы снова всплыл.
export async function clearSlot(slot: Slot): Promise<string> {
  const { data } = await supabase.storage.from(BUCKET).list('', { limit: 50 });
  const paths = (data ?? []).filter((f) => slotOf(f.name) === slot).map((f) => f.name);
  if (paths.length === 0) return '';
  const { error } = await supabase.storage.from(BUCKET).remove(paths);
  return error?.message ?? '';
}
