import { Fragment, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { Icon, PromoArt } from '../components/Art';
import { ProofStrip } from '../components/ProofStrip';
import { BrandStrip } from '../components/BrandStrip';
import { DealsStrip } from '../components/DealsStrip';
import { PriceList } from '../components/PriceList';
import { ReviewStrip } from '../components/ReviewStrip';
import { WorkStrip } from '../components/WorkStrip';
import { loadSiteImages, type SiteImages } from '../lib/siteImages';

// Главная. Порядок разделов выбран под один вопрос: что человек успевает
// понять за первые несколько секунд с телефона в руке. Ответить надо на
// четыре вещи — что чиним, сколько стоит, как записаться и почему нам можно
// верить, — поэтому сверху идут обложка с формой, оценка, частые поломки,
// цены и «как это работает». Услуги, марки и вопросы-ответы ушли ниже:
// это чтение для тех, кто уже заинтересовался.
export function HomePage() {
  const { t } = useLang();
  const [, navigate] = useLocation();

  // Фотографии, которые владелец поставил в админке. Пока их нет, на сайте
  // остаются рисунки — поэтому пустой ответ это норма, а не ошибка.
  const [images, setImages] = useState<SiteImages>({});
  useEffect(() => {
    let alive = true;
    void loadSiteImages().then((next) => {
      if (alive) setImages(next);
    });
    return () => {
      alive = false;
    };
  }, []);

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
      <section className="hero band--dark">
        {/* Фото обложки лежит под всем остальным и притушено: поверх него
            идёт белый заголовок, и на светлом снимке его было бы не прочитать.
            Пока фотографии нет, обложка остаётся просто чёрной. */}
        {images.hero && (
          <div
            className="hero__photo"
            style={{ backgroundImage: `url(${images.hero})` }}
            aria-hidden="true"
          />
        )}
        <div className="wrap hero__grid">
          <div data-parallax="-10">
            {/* Каждое слово — свой элемент: так заголовок можно набрать
                крупно и не бояться, что длинное слово распорет строку */}
            <h1 className="hero__title">
              {t.heroTitle.split(' ').map((word, i) => (
                <Fragment key={`${word}-${i}`}>
                  <span>{word}</span>{' '}
                </Fragment>
              ))}
            </h1>
            <p className="hero__text">{t.heroText}</p>
            {/* На телефоне эта пара кнопок скрыта (index.css): там то же
                действие уже стоит в карточке ниже и в полосе внизу экрана,
                а три одинаковые кнопки подряд не оставляют главной. */}
            <div className="hero__cta btn-row">
              <Link href="/request" className="btn btn--primary btn--lg">
                {t.barRequest}
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
                    aria-label={t.trackTitle}
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
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

        {/* Три факта прямо на обложке. Всё это написано и ниже по странице,
            но ниже — значит после свайпа. Оценку ставим не мы, и она
            единственная здесь проверяется по ссылке. */}
        <div className="wrap">
          <ul className="herotrust">
            <li>
              <b>{SHOP.rating}</b> {t.trustRating}
            </li>
            <li>{t.trustWarranty}</li>
            <li>{t.trustFree}</li>
          </ul>
        </div>
      </section>

      {/* ───── Хук: оценка и четыре обещания ───── */}
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

      {/* ───── Цены ─────
          Появляются, только когда владелец вписал их в админке. */}
      <PriceList />

      {/* ───── Как это работает ─────
          Раньше стояло девятым разделом — до него доходил один человек из
          многих. Теперь сразу после цен: «сколько стоит» и «что дальше
          делать» — это один вопрос, заданный дважды. */}
      <section className="band band--soft">
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

      {/* ───── Отзывы и фотографии из мастерской ─────
          Оба раздела пустые до тех пор, пока владелец не перенёс настоящие
          отзывы и не загрузил снимки. Придумывать их нельзя. */}
      <ReviewStrip />
      <WorkStrip images={images} />

      {/* ───── Скидки, если мастерская их объявила ───── */}
      <DealsStrip />

      {/* ───── Промо 1: бесплатная диагностика ───── */}
      <section className="band">
        <div className="wrap promo">
          <div className="promo__art" data-parallax="16">
            <PromoArt variant={0} src={images.workbench} />
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
            <PromoArt variant={1} src={images.warranty} />
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

      {/* ───── Вопросы и ответы ───── */}
      <section className="band">
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
            {t.barRequest}
          </Link>
        </div>
      </section>
    </main>
  );
}
