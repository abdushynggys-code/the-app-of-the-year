import type { CSSProperties } from 'react';
import { REBOOT_OFF } from '../lib/motion';

type Props = {
  // full — слой на весь сайт: сначала гасит экран, потом включает.
  // Без него слой живёт внутри обложки и только включает.
  full?: boolean;
};

// Слой «экран включается»: три лампочки мигают в центре, сходятся в точку,
// из точки растягивается линия света, и две чёрные створки разъезжаются.
// Живёт отдельным файлом, потому что нужен в двух местах — на обложке при
// первом заходе и поверх всего сайта при смене языка. Вся анимация —
// в разделе 6 файла src/motion.css.
export function Boot({ full = false }: Props) {
  // Время гашения знает JS: он же отсчитывает момент, когда менять язык.
  // Отдаём его в CSS переменной, чтобы число не пришлось писать дважды.
  const style = { '--t0': `${REBOOT_OFF}ms` } as CSSProperties;

  return (
    <div className={full ? 'boot boot--full' : 'boot'} style={full ? style : undefined} aria-hidden="true">
      <span className="boot__leds">
        <i />
        <i />
        <i />
      </span>
      <span className="boot__line" />
    </div>
  );
}
