import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Подвал: контакты и ссылки на мессенджеры.
export function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div>
          <p className="footer__logo">RESET</p>
          <p className="footer__muted">{t.footer}</p>
        </div>

        <div className="footer__col">
          <p className="footer__label">{t.addressLabel}</p>
          <p>{t.address}</p>
          <p className="footer__muted">{t.hours}</p>
        </div>

        <div className="footer__col">
          <p className="footer__label">{t.phoneLabel}</p>
          <p>
            <a href={`tel:${SHOP.phoneRaw}`}>{SHOP.phone}</a>
          </p>
          <div className="footer__links">
            <a href={SHOP.whatsapp} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a href={SHOP.telegram} target="_blank" rel="noreferrer">
              Telegram
            </a>
            <a href={SHOP.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <a href={SHOP.map} target="_blank" rel="noreferrer">
              2ГИС
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
