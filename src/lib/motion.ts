import { useEffect } from 'react';

// Анимации при прокрутке. Вся идея: JavaScript только измеряет и ставит
// пометки, а решает, что именно нарисовать, — CSS в motion.css.

const REDUCED = '(prefers-reduced-motion: reduce)';
// Ниже 1001px обложка становится в одну колонку — параллакс там не нужен
// и на телефоне только дёргает прокрутку.
const WIDE = '(min-width: 1001px)';

// Метку ставим сразу при загрузке файла, до первой отрисовки React.
// Без неё CSS ничего не прячет: если скрипт не выполнится, человек увидит
// обычную страницу, а не пустоту. Прятать текст без права его показать нельзя.
document.documentElement.classList.add('js');

// Человек попросил систему поменьше двигать картинку — слушаемся.
function calm() {
  return window.matchMedia(REDUCED).matches;
}

// Блоки с data-reveal проявляются, когда доезжают до экрана.
// Показали один раз — обратно не прячем: перечитывать мигающий текст неприятно.
export function useReveal(dep: string) {
  useEffect(() => {
    const quiet = calm();
    let io: IntersectionObserver | null = null;

    if (!quiet) {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            entry.target.classList.add('is-in');
            io?.unobserve(entry.target);
          }
        },
        // Небольшой отступ снизу: блок появляется чуть раньше нижнего края,
        // а не ровно в тот момент, когда его уже видно.
        { rootMargin: '0px 0px -8% 0px' },
      );
    }

    const scan = () => {
      const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
      nodes.forEach((node) => (io ? io.observe(node) : node.classList.add('is-in')));
    };

    // Правок бывает много подряд — пересчитываем один раз за кадр.
    let queued = false;
    const later = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    };

    scan();

    // Блоки появляются и позже первой отрисовки: например, когда с экрана
    // «заявка принята» возвращаются к форме. Такой блок тоже надо показать,
    // иначе он навсегда останется прозрачным. За классами не следим —
    // пометку is-in ставим мы сами, и это гоняло бы проверку по кругу.
    const watcher = new MutationObserver(later);
    watcher.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ['data-reveal'],
    });

    return () => {
      watcher.disconnect();
      io?.disconnect();
    };
  }, [dep]);
}

// Параллакс: соседние блоки едут с разной скоростью, и появляется глубина.
// В data-parallax лежит размах в пикселях: больше число — сильнее отстаёт.
export function useParallax(dep: string) {
  useEffect(() => {
    if (calm()) return;

    const layers = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]')).map(
      (el) => ({ el, strength: Number(el.dataset.parallax) || 0 }),
    );
    if (layers.length === 0) return;

    const wide = window.matchMedia(WIDE);
    let waiting = false;
    let live = false;

    const draw = () => {
      waiting = false;
      const vh = window.innerHeight;

      // Сначала всё измеряем, потом всё записываем. Если перемешать,
      // браузер пересчитывает раскладку на каждом блоке и прокрутка дёргается.
      const plan = layers.map((layer) => {
        const box = layer.el.getBoundingClientRect();
        // 0 — середина блока на середине экрана, 1 — внизу, -1 — вверху.
        const center = (box.top + box.height / 2 - vh / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, center));
        // Целые пиксели: на дробных заголовок становится мыльным.
        return { el: layer.el, y: Math.round(-clamped * layer.strength) };
      });

      for (const item of plan) item.el.style.setProperty('--py', `${item.y}px`);
    };

    const onScroll = () => {
      if (waiting) return;
      waiting = true;
      // Рисуем не чаще, чем обновляется экран.
      requestAnimationFrame(draw);
    };

    const stop = () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      layers.forEach((layer) => layer.el.style.removeProperty('--py'));
    };

    // Окно можно растянуть и сузить — следим за шириной, а не проверяем её
    // один раз. Иначе после поворота планшета параллакс либо не включится,
    // либо останется висеть на узком экране вместе со сдвигом.
    const sync = () => {
      if (wide.matches === live) return;
      live = wide.matches;
      if (!live) {
        stop();
        return;
      }
      draw();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    };

    sync();
    wide.addEventListener('change', sync);

    return () => {
      wide.removeEventListener('change', sync);
      stop();
    };
  }, [dep]);
}
