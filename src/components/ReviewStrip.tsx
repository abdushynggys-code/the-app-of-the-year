import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';
import { loadReviews, type Review } from '../lib/reviews';
import { SHOP } from '../lib/shop';

// Отзывы на главной. Показывает ровно те, которые владелец перенёс в
// админку из 2ГИС и других мест. Ни одного — раздела нет: оценка 2ГИС
// выше по странице и так стоит, и пустая рамка «Отзывы» её только портит.
//
// Рядом с каждым отзывом написано, откуда он взят, и внизу стоит ссылка
// на 2ГИС. Это и есть вся защита от «сами себе написали»: проверить
// можно в два нажатия, и мы сами предлагаем это сделать.

// Звёзды рисуем текстом, а не иконкой: пять svg на каждый отзыв — это
// лишний вес ради того, что символ показывает точно так же.
function Stars({ rating }: { rating: number }) {
  const full = Math.max(1, Math.min(5, rating));
  return (
    <span className="review__stars" aria-label={`${full}/5`}>
      <span aria-hidden="true">{'★'.repeat(full)}</span>
      <span aria-hidden="true" className="review__stars-off">
        {'★'.repeat(5 - full)}
      </span>
    </span>
  );
}

export function ReviewStrip() {
  const { t, lang } = useLang();
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    let alive = true;
    void loadReviews().then((res) => {
      if (alive) setReviews(res.reviews);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (reviews.length === 0) return null;

  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-GB' : 'ru-RU', {
      month: 'long',
      year: 'numeric',
    });

  return (
    <section className="band band--tight">
      <div className="wrap">
        <div className="band__head" data-reveal>
          <p className="eyebrow">{t.reviewsEyebrow}</p>
          <h2>{t.reviewsTitle}</h2>
        </div>

        <ul className="reviews" data-reveal="stagger">
          {reviews.map((review) => (
            <li key={review.id} className="review">
              <Stars rating={review.rating} />
              <blockquote className="review__body">{review.body}</blockquote>
              <p className="review__who">
                <b>{review.author}</b>
                <span>
                  {t.reviewSources[review.source]}
                  {review.posted_on ? ` · ${when(review.posted_on)}` : ''}
                </span>
              </p>
            </li>
          ))}
        </ul>

        <p className="reviews__foot" data-reveal>
          <a className="textlink" href={SHOP.map} target="_blank" rel="noreferrer">
            {t.reviewsAll}
          </a>
        </p>
      </div>
    </section>
  );
}
