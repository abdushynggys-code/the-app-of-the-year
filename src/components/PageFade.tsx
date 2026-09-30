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

    // Новая страница должна открыться с начала мгновенно, а не «ехать»
    // сверху: у html стоит scroll-behavior: smooth, и без этого переход
    // на форму заявки выглядел бы как прокрутка длинной главной.
    //
    // behavior: 'instant' здесь не годится. В Safari до 15.4 это значение
    // не существует, а лишнее значение в словаре ScrollToOptions —
    // не «проигнорируем», а TypeError: прокрутка не сработала бы вообще,
    // и человек попадал бы на новую страницу с её середины. Поэтому
    // гасим плавность на время самого вызова и сразу возвращаем.
    const root = document.documentElement;
    const was = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    root.style.scrollBehavior = was;
    // Фокус на новый экран — чтобы клавиатура и скринридер начали сверху.
    box.current?.focus({ preventScroll: true });
  }, [path]);

  return (
    <div
      id="main-content"
      className={moved.current ? 'pageview pageview--in' : 'pageview'}
      key={path}
      ref={box}
      tabIndex={-1}
    >
      {children}
    </div>
  );
}
