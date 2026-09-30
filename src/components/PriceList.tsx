import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { useLang } from '../lib/i18n';
import { CUSTOMER_COPY } from '../lib/customerCopy';
import { formatAmount, groupByKind, loadPrices, priceAround, type Price } from '../lib/prices';

// Show the owner's published prices, or explain how to get an exact quote.
//
// Перед каждой суммой стоит «от». Это не оговорка ради осторожности:
// точную цену называют после бесплатной диагностики, и написать её
// заранее означало бы пообещать то, чего мастер ещё не видел.
export function PriceList() {
  const { t, lang } = useLang();
  const [prices, setPrices] = useState<Price[]>([]);

  useEffect(() => {
    let alive = true;
    // Ошибку здесь не показываем: для посетителя «цен нет» и «база не
    // ответила» выглядят одинаково, а чинить всё равно не ему.
    void loadPrices().then((res) => {
      if (alive) setPrices(res.prices);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (prices.length === 0) return (
    <section className="band band--soft" id="prices">
      <div className="wrap price-explainer">
        <div><p className="eyebrow">{t.pricesEyebrow}</p><h2>{CUSTOMER_COPY[lang].priceTitle}</h2><p>{CUSTOMER_COPY[lang].priceText}</p></div>
        <Link href="/request" className="btn btn--primary btn--lg">{t.pricesCta}<span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );

  const groups = groupByKind(prices);

  // «от 15 000 ₸» по-русски и «15 000 ₸ бастап» по-казахски — одна и та же
  // строка словаря, разобранная на до и после. Крупная только сумма.
  function priceSum(amount: number) {
    const { before, after } = priceAround(t.priceFromTpl);
    return (
      <>
        <span className="pricerow__from">{before}</span>
        <b>{formatAmount(amount, lang)}</b>
        <span className="pricerow__from">{after}</span>
      </>
    );
  }

  return (
    <section className="band" id="prices">
      <div className="wrap">
        <div className="band__head" data-reveal>
          <p className="eyebrow">{t.pricesEyebrow}</p>
          <h2>{t.pricesTitle}</h2>
          <p>{t.pricesText}</p>
        </div>

        <div className="prices" data-reveal="stagger">
          {groups.map((group) => (
            <div key={group.kind} className="pricegroup">
              <h3 className="pricegroup__kind">{t.kinds[group.kind]}</h3>
              <ul className="pricegroup__list">
                {group.items.map((price) => (
                  <li key={price.id} className="pricerow">
                    <span className="pricerow__what">
                      {price.service}
                      {price.note && <em className="pricerow__note">{price.note}</em>}
                    </span>
                    <span className="pricerow__sum">{priceSum(price.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="prices__foot" data-reveal>
          <p className="prices__note">{t.pricesNote}</p>
          <Link href="/request" className="btn btn--primary">
            {t.pricesCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
