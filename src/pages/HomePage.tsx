import { Link } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Главная страница: экран-обложка, преимущества, услуги, как это работает, контакты.
export function HomePage() {
  const { t } = useLang();

  return (
    <main>
      {/* Обложка */}
      <section className="hero">
        <div className="hero__inner">
          <p className="hero__badge">
            <span className="hero__stars">★ {SHOP.rating}</span> {t.ratingText}
          </p>
          <h1 className="hero__title">{t.heroTitle}</h1>
          <p className="hero__text">{t.heroText}</p>
          <div className="hero__cta">
            <Link href="/request" className="btn btn--primary btn--lg">
              {t.heroCta}
            </Link>
            <a href={`tel:${SHOP.phoneRaw}`} className="btn btn--outline btn--lg">
              {t.heroCall} {SHOP.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="section">
        <div className="wrap">
          <h2 className="section__title">{t.perksTitle}</h2>
          <div className="grid grid--4">
            {t.perks.map((p) => (
              <article key={p.t} className="perk">
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Услуги */}
      <section className="section section--alt">
        <div className="wrap">
          <h2 className="section__title">{t.servicesTitle}</h2>
          <div className="grid grid--4">
            {t.services.map((s) => (
              <article key={s.t} className="service">
                <span className="service__icon" aria-hidden="true">
                  {s.icon}
                </span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="section">
        <div className="wrap">
          <h2 className="section__title">{t.stepsTitle}</h2>
          <ol className="steps">
            {t.steps.map((s, i) => (
              <li key={s.t} className="step">
                <span className="step__num">{i + 1}</span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="section__cta">
            <Link href="/request" className="btn btn--primary btn--lg">
              {t.heroCta}
            </Link>
          </div>
        </div>
      </section>

      {/* Контакты */}
      <section className="section section--alt" id="contacts">
        <div className="wrap">
          <h2 className="section__title">{t.contactsTitle}</h2>
          <div className="contacts">
            <div className="contacts__card">
              <p className="contacts__label">{t.addressLabel}</p>
              <p className="contacts__value">{t.address}</p>
              <a className="link" href={SHOP.map} target="_blank" rel="noreferrer">
                {t.openMap} →
              </a>
            </div>
            <div className="contacts__card">
              <p className="contacts__label">{t.hoursLabel}</p>
              <p className="contacts__value">{t.hours}</p>
            </div>
            <div className="contacts__card">
              <p className="contacts__label">{t.phoneLabel}</p>
              <p className="contacts__value">
                <a href={`tel:${SHOP.phoneRaw}`}>{SHOP.phone}</a>
              </p>
              <a className="link" href={SHOP.whatsapp} target="_blank" rel="noreferrer">
                {t.writeUs} →
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
