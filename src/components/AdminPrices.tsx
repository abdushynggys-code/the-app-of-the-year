import { useState } from 'react';
import { useLang } from '../lib/i18n';
import { KINDS, type Kind } from '../lib/kinds';
import {
  addPrice,
  formatAmount,
  groupByKind,
  removePrice,
  setPriceActive,
  type Price,
} from '../lib/prices';

type Props = {
  prices: Price[];
  // Текст ошибки от базы. Чаще всего он значит одно: миграция ещё не
  // применена, таблицы нет.
  loadError: string;
  reload: () => void;
};

// Раздел «Цены» в админке: форма сверху, список ниже.
//
// Видит и меняет его только владелец. Цена — это обещание клиенту, и
// придумать её за мастерскую нельзя: поэтому в коде сайта нет ни одной
// суммы, все они приходят отсюда.
export function AdminPrices({ prices, loadError, reload }: Props) {
  const { t, lang } = useLang();

  const [kind, setKind] = useState<Kind>('phone');
  const [service, setService] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const failed = await addPrice({ kind, service, amount: Number(amount), note });
    setBusy(false);

    if (failed.error) {
      setError(failed.duplicate ? t.admin.priceDuplicate : failed.error);
      return;
    }

    // Вид техники оставляем: цены обычно вносят пачкой по одному виду,
    // и сбрасывать его на «Смартфоны» после каждой строки — лишний клик.
    setService('');
    setAmount('');
    setNote('');
    reload();
  }

  async function toggleActive(price: Price) {
    setWorkingId(price.id);
    const failed = await setPriceActive(price.id, !price.active);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  async function drop(price: Price) {
    if (!confirm(t.admin.priceDeleteAsk)) return;
    setWorkingId(price.id);
    const failed = await removePrice(price.id);
    setWorkingId('');
    if (failed) setError(failed);
    else reload();
  }

  const groups = groupByKind(prices);

  return (
    <>
      <div className="block" style={{ marginBottom: 40 }}>
        <span className="block__label">{t.admin.priceAdd}</span>

        <form className="dealform" onSubmit={submit}>
          <label className="field">
            <span>{t.admin.priceKind}</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {t.kinds[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>{t.admin.priceService}</span>
            <input
              value={service}
              onChange={(e) => setService(e.target.value)}
              placeholder={t.admin.priceServicePh}
              required
              minLength={2}
              maxLength={80}
            />
          </label>

          <label className="field dealform__percent">
            <span>{t.admin.priceAmount}</span>
            <input
              type="number"
              inputMode="numeric"
              min={500}
              max={5000000}
              step={100}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <small className="form__hint">{t.admin.priceAmountHint}</small>
          </label>

          <label className="field">
            <span>{t.admin.priceNote}</span>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t.admin.priceNotePh}
              maxLength={120}
            />
          </label>

          <button className="btn btn--primary" type="submit" disabled={busy}>
            {busy ? t.admin.priceAdding : t.admin.priceAdd}
          </button>
        </form>

        <p className="form__hint" style={{ marginTop: 16 }}>
          {t.admin.pricesHint}
        </p>
        {error && <p className="message message--error">{error}</p>}
        {loadError && (
          <p className="message message--error">
            {t.admin.priceNoTable} ({loadError})
          </p>
        )}
      </div>

      <div className="block">
        <span className="block__label">{t.admin.tabPrices}</span>
        {prices.length === 0 ? (
          <p className="empty">{t.admin.priceEmpty}</p>
        ) : (
          groups.map((group) => (
            <div key={group.kind} style={{ marginBottom: 24 }}>
              <p className="eyebrow">{t.kinds[group.kind]}</p>
              <div className="admin__list">
                {group.items.map((price) => (
                  <article key={price.id} className="card card--soft admin__row">
                    <div className="admin__main">
                      <p className="req__code">
                        {price.service}
                        {!price.active && (
                          <span className="tag tag--quiet">{t.admin.priceHidden}</span>
                        )}
                      </p>
                      <p className="req__meta">
                        {t.priceFromTpl.replace('{sum}', formatAmount(price.amount, lang))}
                        {price.note ? ` · ${price.note}` : ''}
                      </p>
                    </div>
                    <div className="btn-row">
                      <button
                        className="btn btn--secondary"
                        disabled={workingId === price.id}
                        onClick={() => toggleActive(price)}
                      >
                        {price.active ? t.admin.priceOff : t.admin.priceOn}
                      </button>
                      <button
                        className="btn btn--secondary"
                        disabled={workingId === price.id}
                        onClick={() => drop(price)}
                      >
                        {t.admin.priceDelete}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
