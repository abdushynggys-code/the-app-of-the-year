import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { useLocation } from 'wouter';
import { useParallax, useReveal } from '../lib/motion';

// Обёртка вокруг маршрутов. Ключ — текущий путь: при переходе React делает
// новый <div>, и анимация появления проигрывается заново. Шапка и подвал
// живут снаружи, поэтому при переходе мигает только содержимое страницы.
export function PageFade({ children }: { children: ReactNode }) {
  const [path] = useLocation();
  const box = useRef<HTMLDivElement>(null);

  // Путь, который мы уже обработали. В StrictMode эффект запускается дважды —
  // сравнение с path делает повтор безвредным, а простой флаг «да/нет» нет.
  const seen = useRef(path);
  // Первый экран не анимируем: обложка должна появиться сразу, а не
  // выцветать из пустоты. Решение держим отдельным флагом, а не пересчитываем
  // на каждом рендере — иначе смена языка перезапускала бы появление страницы.
  const startPath = useRef(path);
  const moved = useRef(false);
  if (!moved.current && path !== startPath.current) moved.current = true;

  // Блоки при прокрутке и параллакс пересобираем на каждой странице.
  useReveal(path);
  useParallax(path);

  // Layout-эффект, а не обычный: прокрутку правим до отрисовки,
  // иначе на один кадр видно чужую позицию страницы.
  useLayoutEffect(() => {
    const changed = seen.current !== path;
    seen.current = path;
    if (!changed) return;

    // behavior: 'instant' сильнее, чем scroll-behavior: smooth у html,
    // поэтому новая страница не «едет» сверху, а сразу открыта с начала.
    window.scrollTo({ top: 0, behavior: 'instant' });
    // Фокус на новый экран — чтобы клавиатура и скринридер начали сверху.
    box.current?.focus({ preventScroll: true });
  }, [path]);

  return (
    <div
      className={moved.current ? 'pageview pageview--in' : 'pageview'}
      key={path}
      ref={box}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
