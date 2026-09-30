import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { LANGS, useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';
import { Icon } from './Art';
import { Logo } from './Logo';
import { useAdmin } from '../lib/useAdmin';
import { CUSTOMER_COPY } from '../lib/customerCopy';

// Шапка: логотип, меню, переключатель языка на три положения, кнопка звонка.
export function Header() {
  const { t, lang, setLang } = useLang();
  const [path] = useLocation();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLElement>(null);
  // Ссылка на админку появляется только у того, кому уже открыли доступ.
  // До ответа базы её нет: мигнуть ссылкой и убрать хуже, чем не показать.
  const { isAdmin } = useAdmin();

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/request', label: t.nav.request },
    { href: '/track', label: t.nav.track },
    ...(isAdmin ? [{ href: '/admin', label: t.nav.admin }] : []),
  ];

  // Открытое меню закрывается нажатием мимо него и клавишей Esc.
  //
  // Без этого на телефоне был тупик: меню перекрывает начало страницы,
  // и единственный способ его убрать — попасть в маленький крестик в углу.
  // Человек жмёт «куда-нибудь мимо», как во всех остальных приложениях,
  // ничего не происходит, и он жмёт ещё раз уже по ссылке под меню.
  //
  // pointerdown, а не click: закрыть надо в момент касания, до того как
  // браузер решит, что это было нажатие по тому, что лежит под меню.
  useEffect(() => {
    if (!open) return;

    const outside = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, [open]);

  return (
    <header className="header" ref={box}>
      <a className="skip-link" href="#main-content">{CUSTOMER_COPY[lang].skip}</a>
      <div className="header__inner">
        <Link href="/" className="logo" onClick={() => setOpen(false)}>
          <Logo />
          <span className="logo__text">
            RESET<span>.</span>
          </span>
        </Link>

        {/* Переключатель языка живёт внутри меню: в строке шапки на телефоне
            он не помещался вместе с номером и логотипом. */}
        <nav id="primary-navigation" className={open ? 'nav is-open' : 'nav'} aria-label={t.menu}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={path === l.href ? 'nav__link is-active' : 'nav__link'}
              aria-current={path === l.href ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}

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
        </nav>

        <div className="header__actions">
          {/* На узком экране остаётся только трубка, номер прячется */}
          <a
            className="btn btn--primary header__call"
            href={`tel:${SHOP.phoneRaw}`}
            aria-label={SHOP.phone}
          >
            <Icon name="call" />
            <span>{SHOP.phone}</span>
          </a>
        </div>

        <button
          className="burger"
          onClick={() => setOpen((v) => !v)}
          aria-label={t.menu}
          aria-expanded={open}
          aria-controls="primary-navigation"
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
