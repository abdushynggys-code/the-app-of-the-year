import { useState } from 'react';
import { useLang } from '../lib/i18n';
import {
  DEAL_KINDS,
  addDeal,
  isLive,
  removeDeal,
  setDealActive,
  type Deal,
  type DealKind,
} from '../lib/deals';

type Props = {
  deals: Deal[];
  // Текст ошибки от базы. Чаще всего он значит одно: миграция ещё не
  // применена, таблицы нет.
  loadError: string;
  reload: () => void;
};

// Раздел «Скидки» в админке: форма сверху, список ниже. Скидка — это
// проценты плюс виды техники, на которые они распространяются. Видов может
// быть несколько сразу: «−5% на ноутбуки и мониторы» — одна скидка.
//
// Видит и меняет этот раздел только владелец: цена — его решение.
export function AdminDeals({ deals, loadError, reload }: Props) {
  const { t } = useLang();

  const [percent, setPercent] = useState('5');
  const [kinds, setKinds] = useState<DealKind[]>([]);
  const [note, setNote] = useState('');
  const [endsOn, setEndsOn] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');

  function toggleKind(kind: DealKind) {
    setKinds((list) => (list.includes(kind) ? list.filter((k) => k !== kind) : [...list, kind]));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (kinds.length === 0) {
      setError(t.admin.dealPickKind);
      return;
    }

    setBusy(true);
    setError('');
    const failed = await addDeal({ percent: Number(percent), kinds, note, ends_on: endsOn });
    setBusy(false);

    if (failed) {
      setError(failed);
      return;
    }

    // Форму очищаем полностью: следующая скидка почти наверняка про другое,
    // а незамеченные остатки прошлой — это скидка не на ту технику.
    setPercent('5');
    setKinds([]);
    setNote('');
    setEndsOn('');
    reload();
  }

  async function toggleActive(deal: Deal) {
    setWorkingId(deal.id);
    const failed = await setDealActive(deal.id, !deal.active);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  async function drop(deal: Deal) {
    if (!confirm(t.admin.dealDeleteAsk)) return;
    setWorkingId(deal.id);
    const failed = await removeDeal(deal.id);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  return (
    <>
      <div className="block" style={{ marginBottom: 40 }}>
        <span className="block__label">{t.admin.dealAdd}</span>

        <form className="dealform" onSubmit={submit}>
          <label className="field dealform__percent">
            <span>{t.admin.dealPercent}</span>
            <input
              type="number"
              min={1}
              max={90}
              required
              value={percent}
              onChange={(e) => setPercent(e.target.value)}
            />
          </label>

          <div className="field dealform__kinds">
            <span>{t.admin.dealKinds}</span>
            <div className="chips chips--pick">
              {DEAL_KINDS.map((kind) => (
                <button
                  key={kind}
                  type="button"
                  className={kinds.includes(kind) ? 'chip is-active' : 'chip'}
                  onClick={() => toggleKind(kind)}
                  aria-pressed={kinds.includes(kind)}
                >
                  {t.kinds[kind]}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>{t.admin.dealNote}</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.admin.dealNotePh}
              maxLength={120}
            />
          </label>

          <label className="field">
            <span>{t.admin.dealEnds}</span>
            <input type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
            <small className="form__hint">{t.admin.dealEndsHint}</small>
          </label>

          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? t.admin.dealAdding : t.admin.dealAdd}
          </button>
        </form>

        <p className="form__hint" style={{ marginTop: 16 }}>
          {t.admin.dealsHint}
        </p>
        {error && <p className="message message--error">{error}</p>}
        {/* Почти всегда это одно и то же: таблицы ещё нет, миграция не
            применена. Ответ базы дописываем рядом — на случай, если дело
            всё-таки в другом. */}
        {loadError && (
          <p className="message message--error">
            {t.admin.dealNoTable} ({loadError})
          </p>
        )}
      </div>

      <div className="block">
        <span className="block__label">{t.admin.tabDeals}</span>
        {deals.length === 0 ? (
          <p className="empty">{t.admin.dealEmpty}</p>
        ) : (
          <div className="admin__list">
            {deals.map((deal) => (
              <article key={deal.id} className="card card--soft admin__row">
                <div className="admin__main">
                  <p className="req__code">
                    −{deal.percent}% · {deal.kinds.map((k) => t.kinds[k]).join(' · ')}
                    {!deal.active && <span className="tag tag--quiet">{t.admin.dealHidden}</span>}
                    {deal.active && !isLive(deal) && (
                      <span className="tag tag--quiet">{t.admin.dealExpired}</span>
                    )}
                  </p>
                  {(deal.note || deal.ends_on) && (
                    <p className="req__meta">
                      {deal.note}
                      {deal.note && deal.ends_on ? ' · ' : ''}
                      {deal.ends_on ? `${t.dealsUntil} ${deal.ends_on}` : ''}
                    </p>
                  )}
                </div>
                <div className="btn-row">
                  <button
                    className="btn btn--secondary"
                    disabled={workingId === deal.id}
                    onClick={() => toggleActive(deal)}
                  >
                    {deal.active ? t.admin.dealOff : t.admin.dealOn}
                  </button>
                  <button
                    className="btn btn--secondary"
                    disabled={workingId === deal.id}
                    onClick={() => drop(deal)}
                  >
                    {t.admin.dealDelete}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
