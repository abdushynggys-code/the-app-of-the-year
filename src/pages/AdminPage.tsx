import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { Auth } from '../components/Auth';
import { useLang, type Status } from '../lib/i18n';

type Req = {
  id: string;
  track_code: string;
  name: string;
  phone: string;
  device: string;
  problem: string;
  status: Status;
  created_at: string;
};

type Report = {
  id: string;
  message: string;
  contact: string | null;
  page: string | null;
  status: 'new' | 'done';
  created_at: string;
};

const ORDER: Status[] = ['new', 'diagnostics', 'repair', 'ready', 'done'];
const LOCALE: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };

export function AdminPage() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'requests' | 'reports'>('requests');
  const [requests, setRequests] = useState<Req[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [savingId, setSavingId] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [dbError, setDbError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [daysBack, setDaysBack] = useState(30);

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE[lang] ?? 'ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  // Count requests by status for dashboard stats
  const stats = {
    total: requests.length,
    new: requests.filter((r) => r.status === 'new').length,
    diagnostics: requests.filter((r) => r.status === 'diagnostics').length,
    repair: requests.filter((r) => r.status === 'repair').length,
    ready: requests.filter((r) => r.status === 'ready').length,
    done: requests.filter((r) => r.status === 'done').length,
  };

  // Filter requests: by search term, status, and date range
  const filtered = requests.filter((r) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const created = new Date(r.created_at);
    if (created < cutoff) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    const search = searchTerm.toLowerCase();
    return (
      r.track_code.toLowerCase().includes(search) ||
      r.name.toLowerCase().includes(search) ||
      r.phone.includes(search) ||
      r.device.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => handleSession(data.session?.user.email ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      handleSession(session?.user.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSession(mail: string | null) {
    setEmail(mail);
    if (!mail) {
      setIsAdmin(null);
      return;
    }
    // Спрашиваем базу, админ ли текущий пользователь.
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      // База не отвечает или миграции не применены — это не «нет доступа».
      // Показываем настоящую причину, иначе искать проблему невозможно.
      setDbError(error.message);
      setIsAdmin(false);
      return;
    }
    const ok = data === true;
    setIsAdmin(ok);
    if (ok) void loadAll();
  }

  async function loadAll() {
    const [r1, r2] = await Promise.all([
      supabase
        .from('repair_requests')
        .select('id, track_code, name, phone, device, problem, status, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('site_reports')
        .select('id, message, contact, page, status, created_at')
        .order('created_at', { ascending: false }),
    ]);
    setRequests((r1.data as Req[]) ?? []);
    setReports((r2.data as Report[]) ?? []);
  }

  async function setStatus(id: string, status: Status) {
    setSavingId(id);
    const { error } = await supabase.from('repair_requests').update({ status }).eq('id', id);
    if (!error) {
      setRequests((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    }
    setSavingId('');
  }

  async function closeReport(id: string) {
    setSavingId(id);
    const { error } = await supabase.from('site_reports').update({ status: 'done' }).eq('id', id);
    if (!error) {
      setReports((list) => list.map((r) => (r.id === id ? { ...r, status: 'done' } : r)));
    }
    setSavingId('');
  }

  async function signInGoogle() {
    setGoogleError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    // Провайдер ещё не включён в Supabase — показываем подсказку, а не пустой экран.
    if (error) setGoogleError(t.admin.googleHint);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="wrap wrap--narrow page">
        <SupabaseSetupMessage />
      </main>
    );
  }

  // ── Не вошёл ──
  if (!email) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.title}</h1>
          <p>{t.admin.signInText}</p>
        </div>

        <button className="btn btn--primary btn--lg btn--block" onClick={signInGoogle}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M17.6 9.2c0-.6-.05-1.2-.16-1.7H9v3.3h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5Z"
            />
            <path
              fill="currentColor"
              d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.3A9 9 0 0 0 9 18Z"
              opacity=".75"
            />
            <path
              fill="currentColor"
              d="M3.9 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l3-2.3Z"
              opacity=".5"
            />
            <path
              fill="currentColor"
              d="M9 3.6c1.3 0 2.5.5 3.4 1.3l2.6-2.6A9 9 0 0 0 .9 5l3 2.3C4.6 5.2 6.6 3.6 9 3.6Z"
              opacity=".85"
            />
          </svg>
          {t.admin.google}
        </button>

        {googleError && (
          <p className="message message--error" style={{ marginTop: 16 }}>
            {googleError}
          </p>
        )}

        <p className="form__hint" style={{ margin: '28px 0 16px', textAlign: 'center' }}>
          {t.admin.or}
        </p>
        <Auth />
      </main>
    );
  }

  // ── Вошёл, но не админ ──
  if (isAdmin === false) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.noAccess}</h1>
          <p>{t.admin.noAccessText}</p>
        </div>
        {dbError && (
          <p className="message message--error" style={{ marginBottom: 16 }}>
            {dbError}
          </p>
        )}
        <div className="card card--soft">
          <p className="form__hint">{email}</p>
          <button className="btn btn--secondary" style={{ marginTop: 16 }} onClick={() => supabase.auth.signOut()}>
            {t.signOut}
          </button>
        </div>
      </main>
    );
  }

  if (isAdmin === null) {
    return (
      <main className="wrap wrap--narrow page">
        <p className="empty">…</p>
      </main>
    );
  }

  // ── Админка ──
  const newReports = reports.filter((r) => r.status === 'new').length;

  return (
    <main className="wrap page">
      <div className="admin__head">
        <div>
          <h1>{t.admin.title}</h1>
          <p className="form__hint">
            {email} ·{' '}
            <button className="ghost" onClick={() => supabase.auth.signOut()}>
              {t.signOut}
            </button>
          </p>
        </div>
        <button className="btn btn--secondary" onClick={loadAll}>
          {t.admin.refresh}
        </button>
      </div>

      {/* Dashboard stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 32 }}>
        <div className="card card--soft" style={{ padding: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{stats.total}</p>
          <p style={{ fontSize: 12, color: 'var(--body)', margin: '4px 0 0' }}>Всего</p>
        </div>
        {(['new', 'diagnostics', 'repair', 'ready', 'done'] as const).map((s) => (
          <div key={s} className="card card--soft" style={{ padding: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 20, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>{stats[s]}</p>
            <p style={{ fontSize: 11, color: 'var(--body)', margin: '4px 0 0' }}>{t.statuses[s]}</p>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ maxWidth: 460, marginBottom: 32 }}>
        <button
          type="button"
          className={tab === 'requests' ? 'is-active' : ''}
          onClick={() => setTab('requests')}
        >
          {t.admin.tabRequests} ({requests.length})
        </button>
        <button
          type="button"
          className={tab === 'reports' ? 'is-active' : ''}
          onClick={() => setTab('reports')}
        >
          {t.admin.tabReports} ({newReports})
        </button>
      </div>

      {/* Search & filter — only for requests tab */}
      {tab === 'requests' && requests.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ flex: 1, minWidth: 200 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--body)' }}>
              Поиск (код, имя, телефон)
            </span>
            <input
              type="text"
              placeholder="RS-0001 или Иван"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-md)',
                fontFamily: 'inherit',
                fontSize: 14,
              }}
            />
          </label>

          <label style={{ minWidth: 140 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--body)' }}>
              Статус
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | '')}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-md)',
                fontFamily: 'inherit',
                fontSize: 14,
                backgroundColor: 'var(--canvas)',
              }}
            >
              <option value="">Все</option>
              <option value="new">{t.statuses.new}</option>
              <option value="diagnostics">{t.statuses.diagnostics}</option>
              <option value="repair">{t.statuses.repair}</option>
              <option value="ready">{t.statuses.ready}</option>
              <option value="done">{t.statuses.done}</option>
            </select>
          </label>

          <label style={{ minWidth: 120 }}>
            <span style={{ display: 'block', fontSize: 12, fontWeight: 500, marginBottom: 4, color: 'var(--body)' }}>
              Дней назад
            </span>
            <select
              value={daysBack}
              onChange={(e) => setDaysBack(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--hairline)',
                borderRadius: 'var(--r-md)',
                fontFamily: 'inherit',
                fontSize: 14,
                backgroundColor: 'var(--canvas)',
              }}
            >
              <option value={7}>7</option>
              <option value={14}>14</option>
              <option value={30}>30</option>
              <option value={90}>90</option>
              <option value={999}>Все</option>
            </select>
          </label>
        </div>
      )}

      {tab === 'requests' ? (
        filtered.length === 0 ? (
          <p className="empty">{requests.length === 0 ? t.admin.empty : 'Ничего не найдено'}</p>
        ) : (
          <div className="admin__list">
            {filtered.map((r) => (
              <article key={r.id} className="card card--soft admin__row">
                <div className="admin__main">
                  <p className="req__code">{r.track_code}</p>
                  <p className="req__device">
                    {r.device} · {r.name} ·{' '}
                    <a className="textlink" href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>
                      {r.phone}
                    </a>
                  </p>
                  <p className="admin__problem">{r.problem}</p>
                  <p className="req__meta">{fmt(r.created_at)}</p>
                </div>

                <label className="admin__status">
                  <span>{t.admin.statusLabel}</span>
                  <select
                    value={r.status}
                    disabled={savingId === r.id}
                    onChange={(e) => setStatus(r.id, e.target.value as Status)}
                  >
                    {ORDER.map((s) => (
                      <option key={s} value={s}>
                        {t.statuses[s]}
                      </option>
                    ))}
                  </select>
                </label>
              </article>
            ))}
          </div>
        )
      ) : reports.length === 0 ? (
        <p className="empty">{t.admin.empty}</p>
      ) : (
        <div className="admin__list">
          {reports.map((r) => (
            <article
              key={r.id}
              className="card card--soft admin__row"
              style={{ opacity: r.status === 'done' ? 0.55 : 1 }}
            >
              <div className="admin__main">
                <p className="admin__problem">{r.message}</p>
                <p className="req__meta">
                  {fmt(r.created_at)}
                  {r.page ? ` · ${t.admin.reportPage}: ${r.page}` : ''}
                  {r.contact ? ` · ${t.admin.reportContact}: ${r.contact}` : ''}
                </p>
              </div>

              {r.status === 'new' ? (
                <button
                  className="btn btn--secondary"
                  disabled={savingId === r.id}
                  onClick={() => closeReport(r.id)}
                >
                  {t.admin.markDone}
                </button>
              ) : (
                <p className="req__meta">{t.admin.doneLabel}</p>
              )}
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
