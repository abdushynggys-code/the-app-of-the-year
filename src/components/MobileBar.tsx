import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { Icon } from './Art';

// Полоса действий внизу экрана телефона.
//
// Зачем она вообще нужна. Главная страница длинная: цены, отзывы, услуги,
// вопросы. Пока человек до всего этого доскроллил, кнопка «Оставить заявку»
// с обложки давно уехала вверх, а до подвала ещё далеко. Получалось так:
// человек прочитал всё, что мы написали, убедился — и в этот момент ему
// некуда нажать. Полоса снизу убирает этот разрыв: заявка и звонок под
// большим пальцем на любой высоте страницы.
//
// Только на телефоне (правило в index.css). На компьютере кнопка звонка
// и так стоит в шапке и никуда не уезжает — там полоса была бы шумом.
export function MobileBar() {
  const { t } = useLang();
  const [path] = useLocation();

  // На самой форме заявки полоса не нужна: она вела бы на страницу, где
  // человек уже стоит, и закрывала бы собой поля снизу.
  // В админке её тоже нет — это рабочий экран мастерской, а не витрина.
  if (path === '/request' || path === '/admin') return null;

  return (
    <div className="mobilebar">
      <Link href="/request" className="btn btn--primary mobilebar__main">
        {t.barRequest}
      </Link>
      <a
        className="btn btn--secondary mobilebar__icon"
        href={`tel:${SHOP.phoneRaw}`}
        aria-label={`${t.barCall}: ${SHOP.phone}`}
      >
        <Icon name="call" />
      </a>
      <a
        className="btn btn--secondary mobilebar__icon"
        href={SHOP.whatsapp}
        target="_blank"
        rel="noreferrer"
        aria-label="WhatsApp"
      >
        <Icon name="chat" />
      </a>
    </div>
  );
}
