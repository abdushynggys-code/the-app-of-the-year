import { useLang } from '../lib/i18n';
import type { LogRow } from '../lib/adminLog';

type Props = {
  rows: LogRow[];
  loadError: string;
  lang: string;
};

const LOCALE: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };

// Журнал доступов. Видит только владелец — и не потому, что раздел спрятан
// в трёх точках, а потому что так решают правила доступа в базе. Спрятан он
// просто чтобы не мозолить глаза: заходят сюда раз в месяц.
export function AdminLog({ rows, loadError, lang }: Props) {
  const { t } = useLang();

  const when = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE[lang] ?? 'ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Незнакомое событие показываем как есть. Журнал, который молчит о том,
  // чего не понял, хуже журнала с непонятной строкой.
  const label = (action: string) => t.admin.logActions[action] ?? action;

  return (
    <div className="block">
      <span className="block__label">{t.admin.tabLog}</span>
      <p className="form__hint" style={{ marginBottom: 24 }}>
        {t.admin.logHint}
      </p>

      {loadError && <p className="message message--error">{t.admin.logNoTable} ({loadError})</p>}

      {rows.length === 0 && !loadError ? (
        <p className="empty">{t.admin.logEmpty}</p>
      ) : (
        <div className="logrows">
          {rows.map((row) => (
            <article key={row.id} className="logrow">
              <span className="logrow__when">{when(row.at)}</span>
              <span className="logrow__what">
                <b>{label(row.action)}</b>
                {row.subject && <span className="logrow__who">{row.subject}</span>}
              </span>
              {/* Кто сделал. Пусто — значит это сделал сам сайт: строку в
                  admins заводит ещё и триггер при регистрации, а у него
                  никакой сессии нет. */}
              <span className="logrow__by">{row.actor_email ?? t.admin.logBySite}</span>
              {row.detail && <span className="logrow__detail">{row.detail}</span>}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
