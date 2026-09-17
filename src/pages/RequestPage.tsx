import { useState } from 'react';
import { Link } from 'wouter';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Код заявки вида RS-482170 — по нему клиент смотрит статус без регистрации.
// Шесть цифр, а не четыре: четыре давали всего 9000 вариантов, и по закону
// парных дней совпадение появлялось уже на второй сотне заявок. В базе код
// объявлен уникальным, поэтому совпадение — это потерянная заявка.
function makeTrackCode() {
  return `RS-${Math.floor(100000 + Math.random() * 900000)}`;
}

// Карточка на главной может передать сюда уже заполненные поля.
function fromUrl(key: string) {
  return new URLSearchParams(window.location.search).get(key) ?? '';
}

export function RequestPage() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState(() => fromUrl('device'));
  const [model, setModel] = useState(() => fromUrl('model'));
  const [problem, setProblem] = useState(() => fromUrl('problem'));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <main className="wrap wrap--narrow page">
        <SupabaseSetupMessage />
      </main>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      // Если клиент вошёл — заявка привязана к аккаунту и попадёт в «Мои заявки».
      const { data: userData } = await supabase.auth.getUser();

      // Код придумываем случайно, поэтому он может совпасть с уже занятым.
      // Тогда база вернёт ошибку 23505 (нарушено «уникальное»), и мы просто
      // берём следующий код. Без этой петли заявка терялась, а человек видел
      // непонятное «что-то пошло не так».
      let trackCode = '';
      let failed: { code?: string } | null = null;

      for (let attempt = 0; attempt < 5; attempt++) {
        trackCode = makeTrackCode();
        const { error: insertError } = await supabase.from('repair_requests').insert({
          user_id: userData.user?.id ?? null,
          track_code: trackCode,
          name: name.trim(),
          phone: phone.trim(),
          // Пусто отправляем как null: в базе стоит проверка формата,
          // и пустая строка её не прошла бы.
          email: email.trim() || null,
          device: device.trim(),
          model: model.trim(),
          problem: problem.trim(),
        });

        failed = insertError;
        if (!insertError || insertError.code !== '23505') break;
      }

      if (failed) setError(t.fErr);
      else setCode(trackCode);
    } catch {
      setError(t.fErr);
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Браузер не разрешил копирование — код и так виден на экране.
    }
  }

  function reset() {
    setCode('');
    setName('');
    setPhone('');
    setEmail('');
    setDevice('');
    setModel('');
    setProblem('');
  }

  // Экран «заявка принята»
  if (code) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="card card--soft done swap-in">
          <span className="done__mark" aria-hidden="true">
            ✓
          </span>
          <h1>{t.fOkTitle}</h1>
          <p>{t.fOkText}</p>
          <p className="code">{code}</p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <button className="btn btn--secondary" onClick={copyCode} type="button">
              {copied ? t.fOkCopied : t.fOkCopy}
            </button>
            <Link href={`/track?code=${code}`} className="btn btn--primary">
              {t.fOkTrack}
            </Link>
          </div>
          <p style={{ marginTop: 20 }}>
            <button className="ghost" onClick={reset} type="button">
              {t.fOkMore}
            </button>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow page">
      <div className="page__head">
        <h1>{t.formTitle}</h1>
        <p>{t.formText}</p>
      </div>

      <form className="card card--soft form" onSubmit={submit}>
        <label className="field">
          <span>{t.fName}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
        </label>

        <label className="field">
          <span>{t.fPhone}</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+7 7__ ___ __ __"
            required
            maxLength={30}
          />
        </label>

        {/* Телефон чаще всего и есть то, что чинят — позвонить на него нельзя.
            Поэтому просим ещё и почту, но не делаем её обязательной. */}
        <label className="field">
          <span>{t.fEmail}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.fEmailPh}
            maxLength={120}
            autoComplete="email"
          />
          <small className="field__hint">{t.fEmailHint}</small>
        </label>

        <label className="field">
          <span>{t.fDevice}</span>
          <input
            value={device}
            onChange={(e) => setDevice(e.target.value)}
            placeholder={t.fDevicePh}
            required
            maxLength={80}
          />
        </label>

        {/* Марка мало что говорит: экран у 13 и у 13 Pro разный.
            Без модели мастер не закажет деталь заранее. */}
        <label className="field">
          <span>{t.fModel}</span>
          <input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder={t.fModelPh}
            required
            maxLength={80}
          />
          <small className="field__hint">{t.fModelHint}</small>
        </label>

        <label className="field">
          <span>{t.fProblem}</span>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder={t.fProblemPh}
            required
            rows={4}
            maxLength={800}
          />
        </label>

        {error && <p className="message message--error">{error}</p>}

        <button
          className={busy ? 'btn btn--primary btn--lg is-busy' : 'btn btn--primary btn--lg'}
          type="submit"
          disabled={busy}
        >
          {busy ? t.fSending : t.fSubmit}
        </button>

        <p className="form__hint">
          {t.fLoginHint}{' '}
          <Link href="/track" className="textlink">
            {t.nav.track}
          </Link>
        </p>
      </form>

      <p className="form__hint" style={{ marginTop: 24 }}>
        <a className="textlink" href={SHOP.whatsapp} target="_blank" rel="noreferrer">
          {t.writeUs}
        </a>
      </p>
    </main>
  );
}
