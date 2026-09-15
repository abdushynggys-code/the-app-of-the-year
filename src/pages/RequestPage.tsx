import { useState } from 'react';
import { Link } from 'wouter';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { useLang } from '../lib/i18n';
import { SHOP } from '../lib/shop';

// Код заявки вида RS-4821 — по нему клиент смотрит статус без регистрации.
function makeTrackCode() {
  return `RS-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function RequestPage() {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [device, setDevice] = useState('');
  const [problem, setProblem] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isSupabaseConfigured) {
    return (
      <main className="wrap wrap--narrow section">
        <SupabaseSetupMessage />
      </main>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      // Если клиент вошёл — привязываем заявку к аккаунту, чтобы она попала в «Мои заявки».
      const { data: userData } = await supabase.auth.getUser();
      const trackCode = makeTrackCode();

      const { error: insertError } = await supabase.from('repair_requests').insert({
        user_id: userData.user?.id ?? null,
        track_code: trackCode,
        name: name.trim(),
        phone: phone.trim(),
        device: device.trim(),
        problem: problem.trim(),
      });

      if (insertError) setError(t.fErr);
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
      // Если браузер не разрешил копирование — код и так виден на экране.
    }
  }

  function reset() {
    setCode('');
    setName('');
    setPhone('');
    setDevice('');
    setProblem('');
  }

  // Экран «спасибо» с кодом отслеживания
  if (code) {
    return (
      <main className="wrap wrap--narrow section">
        <div className="card card--success">
          <span className="card__check" aria-hidden="true">
            ✓
          </span>
          <h1>{t.fOkTitle}</h1>
          <p>{t.fOkText}</p>
          <p className="trackcode">{code}</p>
          <div className="form__row">
            <button className="btn btn--outline" onClick={copyCode} type="button">
              {copied ? t.fOkCopied : t.fOkCopy}
            </button>
            <Link href={`/track?code=${code}`} className="btn btn--primary">
              {t.fOkTrack}
            </Link>
          </div>
          <button className="ghost" onClick={reset} type="button">
            {t.fOkMore}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow section">
      <h1 className="page__title">{t.formTitle}</h1>
      <p className="page__text">{t.formText}</p>

      <form className="card form" onSubmit={submit}>
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

        <button className="btn btn--primary btn--lg" type="submit" disabled={busy}>
          {busy ? t.fSending : t.fSubmit}
        </button>

        <p className="form__hint">
          {t.fLoginHint} <Link href="/track">{t.nav.track} →</Link>
        </p>
      </form>

      <p className="page__text page__text--center">
        <a className="link" href={SHOP.whatsapp} target="_blank" rel="noreferrer">
          {t.writeUs} →
        </a>
      </p>
    </main>
  );
}
