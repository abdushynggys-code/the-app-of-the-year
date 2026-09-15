import { Link } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Подвал на чёрном: описание, разделы, контакты и мессенджеры.
export function Footer() {
  const { t } = useLang();

  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__grid">
          <div>
            <p className="footer__logo">RESET</p>
            <p>{t.footerAbout}</p>
            <p>{t.hours}</p>
          </div>

          <div>
            <h4>{t.footerNav}</h4>
            <ul>
              <li>
                <Link href="/">{t.nav.home}</Link>
              </li>
              <li>
                <Link href="/request">{t.nav.request}</Link>
              </li>
              <li>
                <Link href="/track">{t.nav.track}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t.footerContacts}</h4>
            <ul>
              <li>
                <a href={`tel:${SHOP.phoneRaw}`}>{SHOP.phone}</a>
              </li>
              <li>
                <a href={`mailto:${SHOP.email}`}>{SHOP.email}</a>
              </li>
              <li>{t.address}</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 RESET. {t.footerRights}</p>
          <div className="footer__social">
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
              2GIS
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
