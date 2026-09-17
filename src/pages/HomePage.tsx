import { Fragment, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { Icon, PromoArt } from '../components/Art';
import { ProofStrip } from '../components/ProofStrip';
import { BrandStrip } from '../components/BrandStrip';
import { useBootOnce } from '../lib/motion';

// Главная: обложка с карточкой-формой, чипы, промо-полосы,
// услуги, шаги, вопросы-ответы и контакты.
export function HomePage() {
  const { t } = useLang();
  const [, navigate] = useLocation();
  // Включение экрана: один раз за вкладку и только тем, кто не просил
  // систему уменьшить движение.
  const boot = useBootOnce();

  const [tab, setTab] = useState<'repair' | 'track'>('repair');
  const [device, setDevice] = useState('');
  const [problem, setProblem] = useState('');
  const [code, setCode] = useState('');
  // Пока вкладку не трогали, тело карточки не анимируем: на первой
  // загрузке сайт ничего не должен показывать «сам по себе».
  const [swapped, setSwapped] = useState(false);
  const rowsClass = swapped ? 'herocard__rows is-swapped' : 'herocard__rows';

  function pickTab(next: 'repair' | 'track') {
    setTab(next);
    setSwapped(true);
  }

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
      {/* ───── Обложка: чёрная панель ───── */}
      <section className={boot ? 'hero band--dark is-booting' : 'hero band--dark'}>
        {/* Створки и линия света. Слой чисто декоративный: кликов не ловит,
            для скринридера его нет, в покое створки уже разъехались. */}
        {boot && (
          <div className="hero__boot" aria-hidden="true">
            <span className="hero__boot-line" />
          </div>
        )}
        <div className="wrap hero__grid">
          <div data-parallax="-10">
            {/* Каждое слово — свой элемент, чтобы они вставали по очереди */}
            <h1 className="hero__title">
              {t.heroTitle.split(' ').map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  <span>{word}</span>{' '}
                </Fragment>
              ))}
            </h1>
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

          <form className="herocard" onSubmit={go} data-parallax="18">
            <div className="tabs" data-tab={tab}>
              <span className="tabs__pill" aria-hidden="true" />
              <button
                type="button"
                className={tab === 'repair' ? 'is-active' : ''}
                onClick={() => pickTab('repair')}
              >
                {t.cardTabRepair}
              </button>
              <button
                type="button"
                className={tab === 'track' ? 'is-active' : ''}
                onClick={() => pickTab('track')}
              >
                {t.cardTabTrack}
              </button>
            </div>

            {tab === 'repair' ? (
              <div className={rowsClass} key="repair">
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
              <div className={rowsClass} key="track">
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

      {/* ───── Хук: чем вы рискуете ───── */}
      <ProofStrip />

      {/* ───── Частые поломки ───── */}
      <section className="band band--tight band--soft">
        <div className="wrap">
          <p className="eyebrow" data-reveal>
            {t.chipsTitle}
          </p>
          <div className="chips" data-reveal="stagger">
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
          <div className="promo__art" data-parallax="16">
            <PromoArt variant={0} />
          </div>
          <div className="promo__body" data-reveal>
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
          <div className="promo__art" data-parallax="16">
            <PromoArt variant={1} />
          </div>
          <div className="promo__body" data-reveal>
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
          <div className="band__head" data-reveal>
            <h2>{t.servicesTitle}</h2>
            <p>{t.servicesText}</p>
          </div>
          <div className="services" data-reveal="stagger">
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

      {/* ───── Марки ───── */}
      <BrandStrip />

      {/* ───── Как это работает ───── */}
      <section className="band">
        <div className="wrap">
          <div className="band__head" data-reveal>
            <h2>{t.stepsTitle}</h2>
          </div>
          <ol className="steps" data-reveal="stagger">
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
          <div className="band__head" data-reveal>
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq" data-reveal="stagger">
            {t.faq.map((f) => (
              <details key={f.q}>
                <summary>
                  {f.q}
                  <span className="faq__mark" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Контакты ───── */}
      <section className="band" id="contacts">
        <div className="wrap">
          <div className="band__head" data-reveal>
            <h2>{t.contactsTitle}</h2>
          </div>
          <div className="contacts" data-reveal="stagger">
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
        <div className="wrap ctaband" data-reveal>
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
