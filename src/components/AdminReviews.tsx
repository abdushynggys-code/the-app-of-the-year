import { useState } from 'react';
import { useLang } from '../lib/i18n';
import {
  REVIEW_SOURCES,
  addReview,
  removeReview,
  setReviewActive,
  type Review,
  type ReviewSource,
} from '../lib/reviews';

type Props = {
  reviews: Review[];
  // Текст ошибки от базы. Чаще всего он значит одно: миграция ещё не
  // применена, таблицы нет.
  loadError: string;
  reload: () => void;
};

// Раздел «Отзывы» в админке.
//
// Здесь отзывы НЕ пишут — их переносят. Поле «откуда» обязательное и без
// варианта «сам придумал»: настоящий отзыв всегда откуда-то взят, и на
// сайте рядом с ним написано, откуда именно. Выдуманный отзыв люди идут
// проверять по ссылке, не находят, и мастерская теряет больше, чем
// получила бы от пустого раздела.
export function AdminReviews({ reviews, loadError, reload }: Props) {
  const { t } = useLang();

  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [rating, setRating] = useState('5');
  const [source, setSource] = useState<ReviewSource>('2gis');
  const [postedOn, setPostedOn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const failed = await addReview({
      author,
      body,
      rating: Number(rating),
      source,
      posted_on: postedOn,
    });
    setBusy(false);

    if (failed) {
      setError(failed);
      return;
    }

    // Источник оставляем: отзывы обычно переносят пачкой с одного места.
    setAuthor('');
    setBody('');
    setRating('5');
    setPostedOn('');
    reload();
  }

  async function toggleActive(review: Review) {
    setWorkingId(review.id);
    const failed = await setReviewActive(review.id, !review.active);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  async function drop(review: Review) {
    if (!confirm(t.admin.reviewDeleteAsk)) return;
    setWorkingId(review.id);
    const failed = await removeReview(review.id);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  return (
    <>
      <div className="block" style={{ marginBottom: 40 }}>
        <span className="block__label">{t.admin.reviewAdd}</span>

        <form className="dealform" onSubmit={submit}>
          <label className="field">
            <span>{t.admin.reviewSource}</span>
            <select value={source} onChange={(e) => setSource(e.target.value as ReviewSource)}>
              {REVIEW_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {t.reviewSources[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t.admin.reviewAuthor}</span>
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={t.admin.reviewAuthorPh}
              required
              minLength={2}
              maxLength={60}
            />
          </label>

          <label className="field">
            <span>{t.admin.reviewBody}</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t.admin.reviewBodyPh}
              required
              minLength={10}
              maxLength={600}
              rows={5}
            />
          </label>

          <label className="field dealform__percent">
            <span>{t.admin.reviewRating}</span>
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {'★'.repeat(n)}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t.admin.reviewDate}</span>
            <input type="date" value={postedOn} onChange={(e) => setPostedOn(e.target.value)} />
            <small className="form__hint">{t.admin.reviewDateHint}</small>
          </label>

          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? t.admin.reviewAdding : t.admin.reviewAdd}
          </button>
        </form>

        <p className="form__hint" style={{ marginTop: 16 }}>
          {t.admin.reviewsHint}
        </p>
        {error && <p className="message message--error">{error}</p>}
        {loadError && (
          <p className="message message--error">
            {t.admin.reviewNoTable} ({loadError})
          </p>
        )}
      </div>

      <div className="block">
        <span className="block__label">{t.admin.tabReviews}</span>
        {reviews.length === 0 ? (
          <p className="empty">{t.admin.reviewEmpty}</p>
        ) : (
          <div className="admin__list">
            {reviews.map((review) => (
              <article key={review.id} className="card card--soft admin__row">
                <div className="admin__main">
                  <p className="req__code">
                    {review.author} · {'★'.repeat(review.rating)}
                    {!review.active && <span className="tag tag--quiet">{t.admin.reviewHidden}</span>}
                  </p>
                  <p className="admin__problem">{review.body}</p>
                  <p className="req__meta">
                    {t.reviewSources[review.source]}
                    {review.posted_on ? ` · ${review.posted_on}` : ''}
                  </p>
                </div>
                <div className="btn-row">
                  <button
                    className="btn btn--secondary"
                    disabled={workingId === review.id}
                    onClick={() => toggleActive(review)}
                  >
                    {review.active ? t.admin.reviewOff : t.admin.reviewOn}
                  </button>
                  <button
                    className="btn btn--secondary"
                    disabled={workingId === review.id}
                    onClick={() => drop(review)}
                  >
                    {t.admin.reviewDelete}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
