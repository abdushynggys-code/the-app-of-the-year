import { useLang } from '../lib/i18n';
import type { AdminTab } from './AdminNav';

export type MoreRequest = {
  id: string;
  track_code: string;
  shop_no: string | null;
  device: string;
};

export type MoreNote = {
  id: string;
  track_code: string;
  notes: string;
};

type Props = {
  isOwner: boolean;
  newReports: number;
  pendingAccess: number;
  recent: MoreRequest[];
  notes: MoreNote[];
  onGo: (tab: AdminTab) => void;
  onOpenRequest: (id: string) => void;
};

// Три точки в углу меню: то, что нужно изредка, и потому не должно занимать
// место постоянно. Внутри — что нового, последние заявки, последние заметки
// и вход в журнал для владельца.
//
// Это <details>, а не своя выпадашка на useState: браузер сам открывает и
// закрывает его, сам делает доступным с клавиатуры и сам читает вслух
// «свёрнуто / развёрнуто». Меньше кода и ведёт себя правильнее.
export function AdminMore({
  isOwner,
  newReports,
  pendingAccess,
  recent,
  notes,
  onGo,
  onOpenRequest,
}: Props) {
  const { t } = useLang();

  return (
    <details className="more">
      <summary className="more__dots" aria-label={t.admin.moreMenu}>
        ⋯
      </summary>

      <div className="more__panel">
        <p className="more__label">{t.admin.moreNews}</p>
        {newReports === 0 && pendingAccess === 0 ? (
          <p className="more__quiet">{t.admin.moreQuiet}</p>
        ) : (
          <div className="more__rows">
            {newReports > 0 && (
              <button type="button" className="more__row" onClick={() => onGo('reports')}>
                {t.admin.tabReports}
                <b>{newReports}</b>
              </button>
            )}
            {pendingAccess > 0 && isOwner && (
              <button type="button" className="more__row" onClick={() => onGo('access')}>
                {t.admin.accessPending}
                <b>{pendingAccess}</b>
              </button>
            )}
          </div>
        )}

        <p className="more__label">{t.admin.moreRecent}</p>
        {recent.length === 0 ? (
          <p className="more__quiet">{t.admin.moreQuiet}</p>
        ) : (
          <div className="more__rows">
            {recent.map((r) => (
              <button
                key={r.id}
                type="button"
                className="more__row"
                onClick={() => onOpenRequest(r.id)}
              >
                <span>
                  {r.shop_no ? `№ ${r.shop_no}` : r.track_code}
                  <em>{r.device}</em>
                </span>
              </button>
            ))}
          </div>
        )}

        <p className="more__label">{t.admin.moreNotes}</p>
        {notes.length === 0 ? (
          <p className="more__quiet">{t.admin.moreNoNotes}</p>
        ) : (
          <div className="more__rows">
            {notes.map((n) => (
              <button
                key={n.id}
                type="button"
                className="more__row"
                onClick={() => onOpenRequest(n.id)}
              >
                <span>
                  {n.track_code}
                  <em>{n.notes}</em>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Журнал лежит здесь, а не отдельным пунктом меню: смотрят его редко,
            а занимал бы он место каждый день. Прятать его при этом нечего —
            читать журнал всё равно разрешено только владельцу, и решает это
            база, а не то, видно кнопку или нет. */}
        {isOwner && (
          <>
            <p className="more__label">{t.admin.moreOwner}</p>
            <div className="more__rows">
              <button type="button" className="more__row" onClick={() => onGo('log')}>
                {t.admin.tabLog}
              </button>
            </div>
          </>
        )}
      </div>
    </details>
  );
}
