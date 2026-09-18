// Свои иконки и иллюстрации — простая геометрия, только линии, без цвета.
// Цвет берётся из currentColor, поэтому они работают и на белом, и на чёрном фоне.

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

// Маленькие иконки услуг — 24×24.
export function Icon({ name }: { name: string }) {
  const common = { width: 28, height: 28, viewBox: '0 0 24 24', 'aria-hidden': true };

  switch (name) {
    case 'phone':
      return (
        <svg {...common}>
          <rect x="6" y="2" width="12" height="20" rx="2.5" {...S} />
          <path d="M10.5 18.5h3" {...S} />
        </svg>
      );
    case 'watch':
      return (
        <svg {...common}>
          <rect x="7" y="6" width="10" height="12" rx="2.5" {...S} />
          <path d="M9.5 6V3.5h5V6M9.5 18v2.5h5V18M12 10v2.5l1.5 1" {...S} />
        </svg>
      );
    case 'laptop':
      return (
        <svg {...common}>
          <rect x="4" y="5" width="16" height="11" rx="1.5" {...S} />
          <path d="M2 19h20" {...S} />
        </svg>
      );
    case 'lock':
      return (
        <svg {...common}>
          <rect x="4.5" y="10" width="15" height="10" rx="2" {...S} />
          <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2.5" {...S} />
        </svg>
      );
    case 'drop':
      return (
        <svg {...common}>
          <path d="M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10Z" {...S} />
          <path d="M9.5 13.5a2.5 2.5 0 0 0 2.5 2.5" {...S} />
        </svg>
      );
    case 'chip':
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" {...S} />
          <path
            d="M10 7V4M14 7V4M10 20v-3M14 20v-3M7 10H4M7 14H4M20 10h-3M20 14h-3"
            {...S}
          />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2 5 13.5h6L10 22l8-11.5h-6L13 2Z" {...S} />
        </svg>
      );
    case 'call':
      return (
        <svg {...common}>
          <path
            d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"
            {...S}
          />
        </svg>
      );
    case 'window':
      return (
        <svg {...common}>
          <rect x="3" y="4.5" width="18" height="15" rx="2" {...S} />
          <path d="M3 9h18M12 9v10.5" {...S} />
        </svg>
      );
    default:
      return null;
  }
}

// Большие иллюстрации для промо-блоков — формат 4:3, только линии.
// Первая: телефон на верстаке под лупой. Вторая: печать гарантии поверх платы.
//
// src — фотография, которую владелец поставил в админке. Пока её нет,
// остаётся рисунок: пустая рамка на месте картинки выглядела бы поломкой,
// а рисунок — осознанным решением.
export function PromoArt({ variant, src }: { variant: 0 | 1; src?: string }) {
  if (src) return <img className="art art--photo" src={src} alt="" loading="lazy" />;

  if (variant === 0) {
    return (
      <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
        {/* верстак */}
        <path d="M30 240h340" {...S} strokeWidth={2} />
        {/* телефон */}
        <rect x="120" y="90" width="110" height="150" rx="10" {...S} strokeWidth={2} />
        <path d="M120 118h110M120 212h110" {...S} />
        {/* трещина на экране */}
        <path d="M150 130l22 28-14 12 26 26" {...S} />
        {/* лупа */}
        <circle cx="262" cy="120" r="46" {...S} strokeWidth={2} />
        <path d="M296 154l38 38" {...S} strokeWidth={2} />
        <path d="M246 120h32M262 104v32" {...S} />
        {/* отвёртка */}
        <path d="M58 226l44-44M96 176l14 14-10 10-14-14z" {...S} />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
      {/* плата */}
      <rect x="40" y="70" width="230" height="170" rx="8" {...S} strokeWidth={2} />
      <rect x="72" y="104" width="62" height="52" rx="4" {...S} />
      <rect x="166" y="104" width="46" height="34" rx="4" {...S} />
      <path
        d="M72 186h48M72 202h78M72 218h34M166 156v30h46M212 186h26"
        {...S}
      />
      <path d="M134 116h32M134 132h32M212 118h26" {...S} />
      {/* печать «1 год» */}
      <circle cx="292" cy="196" r="58" {...S} strokeWidth={2} />
      <circle cx="292" cy="196" r="48" {...S} />
      <text
        x="292"
        y="204"
        textAnchor="middle"
        fontSize="30"
        fontWeight="700"
        fill="currentColor"
        stroke="none"
      >
        1
      </text>
      <path d="M292 138v-1M350 196h1M292 254v1M234 196h-1" {...S} />
    </svg>
  );
}
