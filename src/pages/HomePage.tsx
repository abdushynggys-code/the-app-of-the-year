import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { PromoArt } from '../components/Art';
import { RepairHero } from '../components/RepairHero';
import { ServicePicker } from '../components/ServicePicker';
import { ProofStrip } from '../components/ProofStrip';
import { BrandStrip } from '../components/BrandStrip';
import { DealsStrip } from '../components/DealsStrip';
import { PriceList } from '../components/PriceList';
import { ReviewStrip } from '../components/ReviewStrip';
import { WorkStrip } from '../components/WorkStrip';
import { loadSiteImages, type SiteImages } from '../lib/siteImages';

// Customer journey: choose a repair, understand the price, then book.
export function HomePage() {
  const { t } = useLang();

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

  return (
    <main>
      <RepairHero image={images.hero} />
      <ServicePicker />
      <ProofStrip />

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
