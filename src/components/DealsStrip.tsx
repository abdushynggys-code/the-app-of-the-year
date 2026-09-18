import { useEffect, useState } from 'react';
import { useLang } from '../lib/i18n';
import { loadDeals, type Deal } from '../lib/deals';

// Полоса со скидками на главной. Ничего не выдумывает: показывает ровно то,
// что владелец объявил в админке. Скидок нет — полосы нет, пустой заголовок
// «Сейчас со скидкой» был бы хуже, чем ничего.
export function DealsStrip() {
  const { t, lang } = useLang();
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    let alive = true;
    // Ошибку здесь не показываем: для посетителя «скидок нет» и «база не
    // ответила» выглядят одинаково, а чинить всё равно не ему.
    void loadDeals().then((res) => {
      if (alive) setDeals(res.deals);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (deals.length === 0) return null;

  const until = (iso: string) =>
    new Date(iso).toLocaleDateString(lang === 'kk' ? 'kk-KZ' : lang === 'en' ? 'en-GB' : 'ru-RU', {
      day: 'numeric',
      month: 'long',
    });

  return (
    <section className="band band--tight">
      <div className="wrap">
        <p className="eyebrow" data-reveal>
          {t.dealsEyebrow}
        </p>
        <ul className="deals" data-reveal="stagger">
          {deals.map((d) => (
            <li key={d.id} className="deal">
              <b className="deal__off">−{d.percent}%</b>
              <span className="deal__kinds">{d.kinds.map((k) => t.kinds[k]).join(' · ')}</span>
              {d.note && <span className="deal__note">{d.note}</span>}
              {d.ends_on && (
                <span className="deal__until">
                  {t.dealsUntil} {until(d.ends_on)}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
