import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { Icon, PromoArt } from '../components/Art';

// Главная: обложка с карточкой-формой, чипы, промо-полосы,
// услуги, шаги, вопросы-ответы и контакты.
export function HomePage() {
  const { t } = useLang();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<'repair' | 'track'>('repair');
  const [device, setDevice] = useState('');
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');

  // Карточка на обложке ничего не сохраняет — она просто уводит
  // на нужную страницу и переносит туда уже введённый текст.
  function go(e: React.FormEvent) {
    e.preventDefault();
    if (tab === 'track') {
      navigate(`/track?code=${encodeURIComponent(code.trim())}`);
      return;
    }
    const q = new URLSearchParams();
    if (device.trim()) q.set('device', device.trim());
    if (problem.trim()) q.set('problem', problem.trim());
    navigate(q.toString() ? `/request?${q}` : '/request');
  }

  return (
    <main>
      {/* ───── Обложка ───── */}
      <section className="hero">
        <div className="wrap hero__grid">
          <div>
            <p className="hero__badge">
              <b>★ {SHOP.rating}</b> {t.heroBadge}
            </p>
            <h1>{t.heroTitle}</h1>
            <p className="hero__text">{t.heroText}</p>
            <div className="hero__cta btn-row">
              <Link href="/request" className="btn btn--primary btn--lg">
                {t.nav.request}
              </Link>
              <a href={SHOP.whatsapp} className="btn btn--secondary btn--lg" target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
          </div>

          <form className="herocard" onSubmit={go}>
            <div className="tabs">
              <button
                type="button"
                className={tab === 'repair' ? 'is-active' : ''}
                onClick={() => setTab('repair')}
              >
                {t.cardTabRepair}
              </button>
              <button
                type="button"
                className={tab === 'track' ? 'is-active' : ''}
                onClick={() => setTab('track')}
              >
                {t.cardTabTrack}
              </button>
            </div>

            {tab === 'repair' ? (
              <div className="herocard__rows">
                <div className="inputrow">
                  <span className="inputrow__dot" />
                  <input
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    placeholder={t.cardDevicePh}
                    aria-label={t.cardDevice}
                    maxLength={80}
                  />
                </div>
                <div className="inputrow">
                  <span className="inputrow__dot inputrow__dot--round" />
                  <input
                    value={problem}
                    onChange={(e) => setProblem(e.target.value)}
                    placeholder={t.cardProblemPh}
                    aria-label={t.cardProblem}
                    maxLength={120}
                  />
                </div>
              </div>
            ) : (
              <div className="herocard__rows">
                <div className="inputrow">
                  <span className="inputrow__dot inputrow__dot--round" />
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t.cardTrackPh}
                    aria-label={t.cardTabTrack}
                    maxLength={12}
                  />
                </div>
              </div>
            )}

            <button className="btn btn--primary btn--block" type="submit">
              {tab === 'repair' ? t.cardGo : t.cardTrackGo}
            </button>

            <p className="herocard__note">{t.cardNote}</p>
          </form>
        </div>
      </section>

      {/* ───── Частые поломки ───── */}
      <section className="band band--tight band--soft">
        <div className="wrap">
          <p className="eyebrow">{t.chipsTitle}</p>
          <div className="chips">
            {t.chips.map((c) => (
              <Link key={c} href={`/request?problem=${encodeURIComponent(c)}`} className="chip">
                {c}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Промо 1: бесплатная диагностика ───── */}
      <section className="band">
        <div className="wrap promo">
          <div className="promo__art">
            <PromoArt variant={0} />
          </div>
          <div className="promo__body">
            <p className="eyebrow">{t.promos[0].eyebrow}</p>
            <h2>{t.promos[0].t}</h2>
            <p>{t.promos[0].d}</p>
            <Link href="/request" className="btn btn--primary">
              {t.promos[0].cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ───── Промо 2: гарантия (чёрная полоса) ───── */}
      <section className="band band--dark">
        <div className="wrap promo promo--flip">
          <div className="promo__art">
            <PromoArt variant={1} />
          </div>
          <div className="promo__body">
            <p className="eyebrow">{t.promos[1].eyebrow}</p>
            <h2>{t.promos[1].t}</h2>
            <p>{t.promos[1].d}</p>
            <a href={`tel:${SHOP.phoneRaw}`} className="btn btn--primary">
              {t.promos[1].cta}
            </a>
          </div>
        </div>
      </section>

      {/* ───── Услуги ───── */}
      <section className="band band--soft">
        <div className="wrap">
          <div className="band__head">
            <h2>{t.servicesTitle}</h2>
            <p>{t.servicesText}</p>
          </div>
          <div className="services">
            {t.services.map((s) => (
              <article key={s.t} className="service">
                <span className="service__icon">
                  <Icon name={s.icon} />
                </span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Как это работает ───── */}
      <section className="band">
        <div className="wrap">
          <div className="band__head">
            <h2>{t.stepsTitle}</h2>
          </div>
          <ol className="steps">
            {t.steps.map((s, i) => (
              <li key={s.t} className="step">
                <p className="step__num">{String(i + 1).padStart(2, '0')}</p>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───── Вопросы и ответы ───── */}
      <section className="band band--soft">
        <div className="wrap">
          <div className="band__head">
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq">
            {t.faq.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Контакты ───── */}
      <section className="band" id="contacts">
        <div className="wrap">
          <div className="band__head">
            <h2>{t.contactsTitle}</h2>
          </div>
          <div className="contacts">
            <div className="contacts__card">
              <p className="contacts__label">{t.addressLabel}</p>
              <p className="contacts__value">{t.address}</p>
              <a className="textlink" href={SHOP.map} target="_blank" rel="noreferrer">
                {t.openMap}
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
              <a className="textlink" href={SHOP.whatsapp} target="_blank" rel="noreferrer">
                {t.writeUs}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Призыв ───── */}
      <section className="band band--dark band--tight">
        <div className="wrap ctaband">
          <div>
            <h2>{t.ctaBandTitle}</h2>
            <p>{t.ctaBandText}</p>
          </div>
          <Link href="/request" className="btn btn--primary btn--lg">
            {t.nav.request}
          </Link>
        </div>
      </section>
    </main>
  );
}
