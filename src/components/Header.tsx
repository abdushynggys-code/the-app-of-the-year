import { Link, useLocation } from 'wouter';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Шапка сайта: логотип, меню, переключатель языка и кнопка звонка.
export function Header() {
  const { t, lang, setLang } = useLang();
  const [path] = useLocation();

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="logo">
          <span className="logo__mark">RESET</span>
          <span className="logo__sub">{SHOP.tagline}</span>
        </Link>

        <nav className="nav">
          <Link href="/" className={path === '/' ? 'nav__link is-active' : 'nav__link'}>
            {t.nav.home}
          </Link>
          <Link
            href="/request"
            className={path === '/request' ? 'nav__link is-active' : 'nav__link'}
          >
            {t.nav.request}
          </Link>
          <Link href="/track" className={path === '/track' ? 'nav__link is-active' : 'nav__link'}>
            {t.nav.track}
          </Link>
        </nav>

        <div className="header__actions">
          <button
            className="lang"
            onClick={() => setLang(lang === 'ru' ? 'kk' : 'ru')}
            title={lang === 'ru' ? 'Қазақ тіліне ауысу' : 'Переключить на русский'}
          >
            {t.langName}
          </button>
          <a className="btn btn--phone" href={`tel:${SHOP.phoneRaw}`}>
            {SHOP.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
