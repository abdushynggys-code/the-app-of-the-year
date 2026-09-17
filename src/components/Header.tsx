import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LANGS, useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Шапка: логотип, меню, переключатель языка на три положения, кнопка звонка.
export function Header() {
  const { t, lang, setLang } = useLang();
  const [path] = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/request', label: t.nav.request },
    { href: '/track', label: t.nav.track },
  ];

  return (
    <header className="header">
      <div className="header__inner">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          RESET<span>.</span>
        </Link>

        <nav className={open ? 'nav is-open' : 'nav'}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? 'nav__link is-active' : 'nav__link'}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <div className="langs" role="group" aria-label="Language" data-lang={lang}>
            <span className="langs__pill" aria-hidden="true" />
            {LANGS.map((l) => (
              <button
                key={l.id}
                className={l.id === lang ? 'is-active' : ''}
                onClick={() => setLang(l.id)}
                title={l.title}
                aria-pressed={l.id === lang}
              >
                {l.short}
              </button>
            ))}
          </div>

          <a className="btn btn--primary" href={`tel:${SHOP.phoneRaw}`}>
            {SHOP.phone}
          </a>
        </div>

        <button
          className="burger"
          onClick={() => setOpen((v) => !v)}
          aria-label={t.menu}
          aria-expanded={open}
        >
          <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
            <path
              d={open ? 'M2 2l14 10M16 2L2 12' : 'M0 1h18M0 7h18M0 13h18'}
              stroke="currentColor"
              strokeWidth="1.8"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </header>
  );
}
