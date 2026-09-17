import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Полоса сразу под чёрной обложкой. Первым делом — оценка: её ставим не мы,
// а клиенты, и любой может открыть 2ГИС и проверить. Потом четыре обещания.
//
// Всё, что здесь написано, уже сказано в тексте сайта ниже. Про живой
// сервисный центр ничего выдумывать нельзя: ни срока работы, ни числа
// ремонтов, ни сертификатов. Цифры берём из shop.ts, чтобы они нигде
// не разъехались.
export function ProofStrip() {
  const { t } = useLang();

  return (
    <section className="band proof">
      <div className="wrap">
        <div className="proof__rating" data-reveal>
          <p className="eyebrow">{t.proofEyebrow}</p>
          <p className="proof__score">
            <b>{SHOP.rating}</b>
            <span>
              {SHOP.reviews} {t.proofReviews}
            </span>
          </p>
          <a className="btn btn--subtle" href={SHOP.map} target="_blank" rel="noreferrer">
            {t.openMap}
          </a>
        </div>

        <div className="band__head" data-reveal>
          <h2>{t.proofTitle}</h2>
        </div>

        <ul className="proof__list" data-reveal="stagger">
          {t.proof.map((p) => (
            <li key={p.t}>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
