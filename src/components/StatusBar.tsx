import { useLang, type Status } from '../lib/i18n';

// Порядок этапов ремонта — по нему рисуем полоску прогресса.
const ORDER: Status[] = ['new', 'diagnostics', 'repair', 'ready', 'done'];

export function StatusBar({ status }: { status: Status }) {
  const { t } = useLang();
  const current = Math.max(0, ORDER.indexOf(status));

  return (
    <ol className="statusbar" aria-label={t.statuses[status]}>
      {ORDER.map((s, i) => {
        const state = i < current ? 'is-done' : i === current ? 'is-current' : '';
        return (
          <li key={s} className={`statusbar__step ${state}`}>
            <span className="statusbar__dot" aria-hidden="true">
              {i < current ? '✓' : i + 1}
            </span>
            <span className="statusbar__label">{t.statuses[s]}</span>
          </li>
        );
      })}
    </ol>
  );
}
