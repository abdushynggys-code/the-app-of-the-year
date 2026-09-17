import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Полоса под обложкой. Человек с разбитым телефоном думает про одно:
// сколько это будет стоить и можно ли доверять. Поэтому сначала снимаем риск
// («узнать цену ничего не стоит»), а не хвалим себя, и заканчиваем ссылкой
// на 2ГИС — оценку там ставим не мы, её можно проверить самому.
//
// Все четыре обещания уже есть в тексте сайта ниже. Ничего нового
// здесь не обещается: выдумывать факты про живой сервис нельзя.
export function ProofStrip() {
  const { t } = useLang();

  return (
    <section className="band band--tight">
      <div className="wrap">
        <div className="band__head" data-reveal>
          <p className="eyebrow">{t.proofEyebrow}</p>
          <h2>{t.proofTitle}</h2>
        </div>

        <ul className="proof" data-reveal="stagger">
          {t.proof.map((p) => (
            <li key={p.t}>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </li>
          ))}
        </ul>

        <p className="proof__src" data-reveal>
          {t.proofSrc}{' '}
          <a className="textlink" href={SHOP.map} target="_blank" rel="noreferrer">
            {t.openMap}
          </a>
        </p>
      </div>
    </section>
  );
}
