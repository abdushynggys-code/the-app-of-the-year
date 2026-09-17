import { useLang } from '../lib/i18n';
import { BRANDS } from '../lib/shop';

// Марки набраны крупно и текстом, а не логотипами. Две причины:
// чужие логотипы нельзя ставить без разрешения правообладателя, и текст
// находится поиском — «ремонт iPhone Астана» люди набирают именно так.
export function BrandStrip() {
  const { t } = useLang();

  return (
    <section className="band band--tight band--soft">
      <div className="wrap">
        <div className="band__head" data-reveal>
          <p className="eyebrow">{t.brandsEyebrow}</p>
          <h2>{t.brandsTitle}</h2>
          <p>{t.brandsText}</p>
        </div>

        <ul className="brands" data-reveal="stagger">
          {BRANDS.map((brand) => (
            <li key={brand}>{brand}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
