import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { Auth } from '../components/Auth';
import { RepairProgress } from '../components/RepairProgress';
import { useLang, type Status, type StepKey } from '../lib/i18n';

type PublicRequest = {
  track_code: string;
  device: string;
  status: Status;
  steps: StepKey[];
  created_at: string;
  updated_at: string;
};

type OwnRequest = PublicRequest & { id: string; problem: string };

const LOCALE: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(LOCALE[lang] ?? 'ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TrackPage() {
  const { t, lang } = useLang();
  const [code, setCode] = useState('');
  const [found, setFound] = useState<PublicRequest | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState<string | null>(null);
  const [mine, setMine] = useState<OwnRequest[]>([]);

  // Код может прийти ссылкой с главной или сразу после заявки: /track?code=RS-4821
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('code');
    if (fromUrl) {
      setCode(fromUrl);
      void lookup(fromUrl);
    }
  }, []);

  // Следим за входом в аккаунт, чтобы показать «Мои заявки».
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      if (data.session) void loadMine();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user.email ?? null);
      if (session) void loadMine();
      else setMine([]);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function loadMine() {
    const { data } = await supabase
      .from('repair_requests')
      .select('id, track_code, device, problem, status, steps, created_at, updated_at')
      .order('created_at', { ascending: false });
    setMine((data as OwnRequest[]) ?? []);
  }

  async function lookup(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setBusy(true);
    setNotFound(false);
    setFound(null);
    try {
      // Читаем через функцию в базе — она отдаёт только безопасные поля.
      const { data, error } = await supabase.rpc('request_status_by_code', { code: clean });
      const row = (data as PublicRequest[] | null)?.[0];
      if (error || !row) setNotFound(true);
      else setFound(row);
    } catch {
      setNotFound(true);
    } finally {
      setBusy(false);
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="wrap wrap--narrow page">
        <SupabaseSetupMessage />
      </main>
    );
  }

  return (
    <main className="wrap wrap--narrow page">
      <div className="page__head">
        <h1>{t.trackTitle}</h1>
        <p>{t.trackText}</p>
      </div>

      <form
        className="trackform"
        onSubmit={(e) => {
          e.preventDefault();
          void lookup(code);
        }}
      >
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t.trackPh}
          maxLength={12}
          required
          aria-label={t.trackTitle}
        />
        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? '…' : t.trackBtn}
        </button>
      </form>

      {notFound && (
        <p className="message message--error" style={{ marginTop: 16 }}>
          {t.trackNotFound}
        </p>
      )}

      {found && (
        <article className="card card--soft" style={{ marginTop: 24 }}>
          <p className="req__code">{found.track_code}</p>
          <p className="req__device">
            {t.trackDevice}: {found.device}
          </p>
          <RepairProgress steps={found.steps} />
          <p className="req__hint">{t.statusHints[found.status]}</p>
          <p className="req__meta">
            {t.trackAccepted}: {formatDate(found.created_at, lang)} · {t.trackUpdated}:{' '}
            {formatDate(found.updated_at, lang)}
          </p>
        </article>
      )}

      {/* Личный кабинет: все свои заявки сразу */}
      <section style={{ marginTop: 56 }}>
        {!email ? (
          <>
            <p className="form__hint" style={{ marginBottom: 16 }}>
              {t.orLogin}
            </p>
            <Auth />
          </>
        ) : (
          <>
            <div className="page__head" style={{ marginBottom: 20 }}>
              <h2>{t.myTitle}</h2>
              <p>
                {email} ·{' '}
                <button className="ghost" onClick={() => supabase.auth.signOut()}>
                  {t.signOut}
                </button>
              </p>
            </div>

            {mine.length === 0 ? (
              <p className="empty">{t.myEmpty}</p>
            ) : (
              mine.map((r) => (
                <article key={r.id} className="card card--soft">
                  <p className="req__code">{r.track_code}</p>
                  <p className="req__device">
                    {t.trackDevice}: {r.device}
                  </p>
                  <RepairProgress steps={r.steps} />
                  <p className="req__hint">{t.statusHints[r.status]}</p>
                  <p className="req__meta">
                    {t.trackAccepted}: {formatDate(r.created_at, lang)}
                  </p>
                </article>
              ))
            )}
          </>
        )}
      </section>
    </main>
  );
}
