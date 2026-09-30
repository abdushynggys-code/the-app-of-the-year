import { isSupabaseConfigured, supabase } from './supabase';

// Отзывы клиентов. Владелец переносит в админку настоящие отзывы с 2ГИС,
// Google, Instagram или из переписки — и они появляются на главной.
//
// Выдумывать отзывы нельзя. Люди идут проверять на 2ГИС, и выдуманный
// отзыв там не находится — это стоит доверия дороже, чем стоил бы пустой
// раздел. Поэтому у каждого отзыва есть источник, он написан на сайте
// рядом с отзывом, и «ниоткуда» вписать нельзя.
//
// Все запросы к базе — здесь, чтобы страницы занимались только показом.

// Откуда отзыв. Список закрытый: у каждого источника есть подпись
// на трёх языках в i18n.ts, и источника без подписи показать нечем.
// Такой же список стоит в миграции.
export const REVIEW_SOURCES = ['2gis', 'google', 'instagram', 'whatsapp'] as const;

export type ReviewSource = (typeof REVIEW_SOURCES)[number];

export type Review = {
  id: string;
  author: string;
  body: string;
  rating: number;
  source: ReviewSource;
  posted_on: string | null;
  active: boolean;
  created_at: string;
};

// Черновик нового отзыва — то, что владелец ввёл в форме.
export type ReviewDraft = {
  author: string;
  body: string;
  rating: number;
  source: ReviewSource;
  posted_on: string;
};

const COLUMNS = 'id, author, body, rating, source, posted_on, active, created_at';

// all = true просит и снятые отзывы — такое отдаёт база только мастерской.
//
// Ошибку возвращаем отдельной строкой, а не бросаем: для посетителя
// «отзывов нет» не поломка, там просто не появится раздел.
export async function loadReviews(all = false): Promise<{ reviews: Review[]; error: string }> {
  if (!isSupabaseConfigured) return { reviews: [], error: '' };

  const { data, error } = await supabase
    .from('reviews')
    .select(COLUMNS)
    // Свежий отзыв полезнее старого: по нему видно, что мастерская работает
    // сейчас, а не работала когда-то. Даты может не быть — тогда в конец.
    .order('posted_on', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });

  if (error) return { reviews: [], error: error.message };

  const reviews = (data ?? []) as Review[];
  return { reviews: all ? reviews : reviews.filter((r) => r.active), error: '' };
}

// Дальше — только для владельца. Если он вдруг не владелец, запрос не
// упадёт молча: база вернёт ошибку по политике, и её покажет админка.
export async function addReview(draft: ReviewDraft): Promise<string> {
  const { error } = await supabase.from('reviews').insert({
    author: draft.author.trim(),
    body: draft.body.trim(),
    rating: draft.rating,
    source: draft.source,
    posted_on: draft.posted_on || null,
  });
  return error?.message ?? '';
}

export async function setReviewActive(id: string, active: boolean): Promise<string> {
  const { error } = await supabase.from('reviews').update({ active }).eq('id', id);
  return error?.message ?? '';
}

export async function removeReview(id: string): Promise<string> {
  const { error } = await supabase.from('reviews').delete().eq('id', id);
  return error?.message ?? '';
}
