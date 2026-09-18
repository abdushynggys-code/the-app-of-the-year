import { useEffect, useRef, useState } from 'react';

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

// ─── Включение экрана ───
// Обложка «включается», как починенный телефон. Играть это на каждый заход
// нельзя: человек возвращается на сайт за номером и часами работы, и на
// четвёртый раз красивая заставка превращается в помеху. Поэтому один раз
// за вкладку.
//
// Флаг в sessionStorage, а не в переменной модуля: переменная умирает при
// перезагрузке, и тот, кто просто обновил страницу, ждал бы включения снова.
const BOOT_KEY = 'reset:booted';

export function useBootOnce(): boolean {
  // Считаем один раз и больше не пересчитываем. Если бы ответ менялся между
  // рендерами, React выдернул бы створки прямо посреди анимации. Заодно это
  // избавляет от вызова matchMedia на каждое нажатие клавиши в форме.
  const show = useRef<boolean | null>(null);

  if (show.current === null) {
    let first = true;
    try {
      first = !sessionStorage.getItem(BOOT_KEY);
    } catch {
      // В приватном режиме хранилище бывает закрыто — тогда просто показываем.
      first = true;
    }
    show.current = first && !calm();
  }

  const on = show.current;

  useEffect(() => {
    if (!on) return;
    // Пишем в эффекте, а не в рендере: StrictMode вызывает рендер дважды,
    // и запись прямо в нём погасила бы анимацию на втором проходе.
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      // Не записалось — не страшно, просто покажем ещё раз.
    }
  }, [on]);

  return on;
}

// ─── Перезагрузка экрана ───
// То же включение, но сначала экран гаснет. Нужно это вот зачем: когда
// человек меняет язык, разом меняется каждая надпись на странице. Если
// делать подмену на глазах, текст просто прыгает — непонятно, что
// произошло и что теперь читать. Поэтому экран гаснет, меняется в темноте
// и включается обратно: получается одно понятное событие вместо рывка.
//
// Хук намеренно ничего не знает про язык. reboot(fn) читается как
// «сделай fn в темноте», и так же можно завернуть любую будущую крупную
// смену — тему, город, валюту. Сам слой рисует компонент Boot.

// Сколько экран гаснет. Столько же ждёт CSS (--t0 у .boot--full): значение
// уезжает туда через инлайн-стиль, чтобы число жило в одном месте.
export const REBOOT_OFF = 760;
// Включение: лампочки (0–420) → линия (380–780) → створки (650–1030).
const REBOOT_ON = 1030;

// Прокрутку на время анимации выключаем. Отменяем именно события, а не
// ставим overflow: hidden: от него пропадает полоса прокрутки и страница
// дёргается вбок ровно в тот момент, когда должна быть неподвижной.
const SCROLL_KEYS = [
  ' ',
  'PageUp',
  'PageDown',
  'Home',
  'End',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
];

function holdScroll(): () => void {
  const stop = (e: Event) => e.preventDefault();
  const stopKey = (e: KeyboardEvent) => {
    if (SCROLL_KEYS.includes(e.key)) e.preventDefault();
  };

  // passive: false обязательно — без него браузер игнорирует preventDefault
  // у прокрутки и просто предупреждает об этом в консоли.
  window.addEventListener('wheel', stop, { passive: false });
  window.addEventListener('touchmove', stop, { passive: false });
  window.addEventListener('keydown', stopKey);

  return () => {
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
    window.removeEventListener('keydown', stopKey);
  };
}

export function useReboot() {
  const [rebooting, setRebooting] = useState(false);
  // Таймеры и снятие блокировки держим в ref: если человек уйдёт со
  // страницы посреди анимации, прокрутка должна вернуться, а таймеры —
  // не дёрнуть setState у размонтированного компонента.
  const cleanup = useRef<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      cleanup.current.forEach((fn) => fn());
      cleanup.current = [];
    };
  }, []);

  function reboot(change: () => void) {
    // Человек попросил систему поменьше двигать картинку — меняем сразу.
    if (calm()) {
      change();
      return;
    }
    // Уже гаснем: второе нажатие не начинает анимацию заново, иначе на
    // быстрых кликах экран мигал бы бесконечно.
    if (rebooting) return;

    setRebooting(true);
    const release = holdScroll();
    const dark = window.setTimeout(change, REBOOT_OFF);
    const done = window.setTimeout(() => {
      setRebooting(false);
      release();
    }, REBOOT_OFF + REBOOT_ON);

    cleanup.current = [
      release,
      () => window.clearTimeout(dark),
      () => window.clearTimeout(done),
    ];
  }

  return { rebooting, reboot };
}
