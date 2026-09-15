import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { Auth } from '../components/Auth';
import { useLang, STEP_ORDER, type Status, type StepKey } from '../lib/i18n';

type Req = {
  id: string;
  track_code: string;
  name: string;
  phone: string;
  device: string;
  problem: string;
  status: Status;
  steps: StepKey[];
  notes: string;
  picked_up_at: string | null;
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

type Photo = { path: string; url: string };

const PAGE = 25;
const STATUSES: Status[] = ['new', 'diagnostics', 'repair', 'ready', 'done'];
const PERIODS = [7, 30, 90, 9999];
const LOCALE: Record<string, string> = { ru: 'ru-RU', kk: 'kk-KZ', en: 'en-GB' };

// Этапы идут по порядку: отметил «Проверено» — значит всё, что раньше, тоже сделано.
// Поэтому полоска у клиента заполняется слитно, без дырок посередине.
function stepsUpTo(key: StepKey): StepKey[] {
  return STEP_ORDER.slice(0, STEP_ORDER.indexOf(key) + 1);
}

export function AdminPage() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [dbError, setDbError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [tab, setTab] = useState<'requests' | 'reports'>('requests');

  const [requests, setRequests] = useState<Req[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');

  // Поиск набирают быстрее, чем отвечает база: ждём паузу в 300 мс,
  // иначе на каждую букву уходил бы отдельный запрос.
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [days, setDays] = useState(30);

  const [open, setOpen] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [bulkStep, setBulkStep] = useState<StepKey | ''>('');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [photos, setPhotos] = useState<Record<string, Photo[]>>({});
  const [photoBusy, setPhotoBusy] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadFor = useRef('');

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(LOCALE[lang] ?? 'ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => handleSession(data.session?.user.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      handleSession(session?.user.email ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (isAdmin) void loadRequests(0);
  }, [query, statusFilter, days, isAdmin]);

  async function handleSession(mail: string | null) {
    setEmail(mail);
    if (!mail) {
      setIsAdmin(null);
      return;
    }
    const { data, error } = await supabase.rpc('is_admin');
    if (error) {
      // База не отвечает или миграции не применены — это не «нет доступа».
      setDbError(error.message);
      setIsAdmin(false);
      return;
    }
    const ok = data === true;
    setIsAdmin(ok);
    if (ok) {
      void loadStats();
      void loadReports();
    }
  }

  // Считает база и сразу по всем заявкам — цифры верные, даже когда
  // на экране показана только первая страница.
  async function loadStats() {
    const { data } = await supabase.rpc('admin_request_stats');
    const next: Record<string, number> = {};
    for (const row of (data as { status: string; n: number }[] | null) ?? []) {
      next[row.status] = Number(row.n);
    }
    setStats(next);
  }

  async function loadReports() {
    const { data } = await supabase
      .from('site_reports')
      .select('id, message, contact, page, status, created_at')
      .order('created_at', { ascending: false });
    setReports((data as Report[]) ?? []);
  }

  // Фильтрует и режет на страницы сама база: из сети приходит 25 строк,
  // а не вся таблица. Поэтому тысяча заявок открывается так же быстро, как десять.
  async function loadRequests(from: number) {
    setLoading(true);
    let q = supabase
      .from('repair_requests')
      .select(
        'id, track_code, name, phone, device, problem, status, steps, notes, picked_up_at, created_at',
      )
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    if (statusFilter) q = q.eq('status', statusFilter);
    if (query) q = q.ilike('search_text', `%${query.toLowerCase()}%`);
    if (days < 9999) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      q = q.gte('created_at', cutoff.toISOString());
    }

    const { data } = await q;
    const rows = (data as Req[]) ?? [];
    setRequests((list) => (from === 0 ? rows : [...list, ...rows]));
    setHasMore(rows.length === PAGE);
    setLoading(false);
  }

  function patch(id: string, fields: Partial<Req>) {
    setRequests((list) => list.map((r) => (r.id === id ? { ...r, ...fields } : r)));
  }

  // Статус считает база по галочкам — забираем его обратно, чтобы не гадать.
  async function saveSteps(id: string, steps: StepKey[]) {
    setSavingId(id);
    const { data } = await supabase
      .from('repair_requests')
      .update({ steps })
      .eq('id', id)
      .select('id, status, steps, picked_up_at')
      .single();
    if (data) patch(id, data as Partial<Req>);
    setSavingId('');
    void loadStats();
  }

  function toggleStep(r: Req, key: StepKey) {
    const i = STEP_ORDER.indexOf(key);
    void saveSteps(r.id, r.steps.includes(key) ? STEP_ORDER.slice(0, i) : stepsUpTo(key));
  }

  async function applyBulk() {
    if (!bulkStep || picked.size === 0) return;
    setSavingId('bulk');
    const { data } = await supabase
      .from('repair_requests')
      .update({ steps: stepsUpTo(bulkStep) })
      .in('id', [...picked])
      .select('id, status, steps, picked_up_at');
    for (const row of (data as Partial<Req>[] | null) ?? []) {
      if (row.id) patch(row.id, row);
    }
    setPicked(new Set());
    setBulkStep('');
    setSavingId('');
    void loadStats();
  }

  async function saveNote(id: string) {
    setSavingId(id);
    const notes = drafts[id] ?? '';
    const { error } = await supabase.from('repair_requests').update({ notes }).eq('id', id);
    if (!error) {
      patch(id, { notes });
      setDrafts((d) => {
        const next = { ...d };
        delete next[id];
        return next;
      });
    }
    setSavingId('');
  }

  // Корзина закрытая, поэтому на каждое фото просим временную ссылку.
  async function loadPhotos(id: string) {
    const { data } = await supabase.storage.from('repair-photos').list(id, { limit: 30 });
    const names = (data ?? []).filter((f) => f.id).map((f) => `${id}/${f.name}`);
    if (names.length === 0) {
      setPhotos((p) => ({ ...p, [id]: [] }));
      return;
    }
    const { data: signed } = await supabase.storage
      .from('repair-photos')
      .createSignedUrls(names, 3600);
    setPhotos((p) => ({
      ...p,
      [id]: (signed ?? [])
        .filter((s) => s.signedUrl)
        .map((s) => ({ path: s.path ?? '', url: s.signedUrl as string })),
    }));
  }

  async function uploadPhoto(file: File) {
    const id = uploadFor.current;
    if (!id) return;
    setPhotoBusy(id);
    const ext = file.name.split('.').pop() ?? 'jpg';
    await supabase.storage
      .from('repair-photos')
      .upload(`${id}/${crypto.randomUUID()}.${ext}`, file);
    await loadPhotos(id);
    setPhotoBusy('');
  }

  async function deletePhoto(id: string, path: string) {
    if (!confirm(t.admin.photoDeleteAsk)) return;
    setPhotoBusy(id);
    await supabase.storage.from('repair-photos').remove([path]);
    await loadPhotos(id);
    setPhotoBusy('');
  }

  function toggleOpen(id: string) {
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else {
        next.add(id);
        if (!photos[id]) void loadPhotos(id);
      }
      return next;
    });
  }

  function togglePick(id: string) {
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function closeReport(id: string) {
    setSavingId(id);
    const { error } = await supabase.from('site_reports').update({ status: 'done' }).eq('id', id);
    if (!error) setReports((l) => l.map((r) => (r.id === id ? { ...r, status: 'done' } : r)));
    setSavingId('');
  }

  async function signInGoogle() {
    setGoogleError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    });
    if (error) setGoogleError(t.admin.googleHint);
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="wrap wrap--narrow page">
        <SupabaseSetupMessage />
      </main>
    );
  }

  if (!email) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.title}</h1>
          <p>{t.admin.signInText}</p>
        </div>
        <button className="btn btn--primary btn--lg btn--block" onClick={signInGoogle}>
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

  if (isAdmin === false) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.noAccess}</h1>
          <p>{t.admin.noAccessText}</p>
        </div>
        {dbError && <p className="message message--error">{dbError}</p>}
        <div className="card card--soft">
          <p className="form__hint">{email}</p>
          <button
            className="btn btn--secondary"
            style={{ marginTop: 16 }}
            onClick={() => supabase.auth.signOut()}
          >
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

  const newReports = reports.filter((r) => r.status === 'new').length;
  const total = STATUSES.reduce((sum, s) => sum + (stats[s] ?? 0), 0);

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
        <button
          className="btn btn--secondary"
          onClick={() => {
            void loadRequests(0);
            void loadStats();
            void loadReports();
          }}
        >
          {t.admin.refresh}
        </button>
      </div>

      {/* Счётчики заодно работают фильтром: нажал «Готово» — увидел только готовые */}
      <div className="stats">
        <button
          type="button"
          className={`stats__card${statusFilter === '' ? ' is-active' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <b>{total}</b>
          <span>{t.admin.statsTotal}</span>
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            className={`stats__card${statusFilter === s ? ' is-active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === s ? '' : s)}
          >
            <b>{stats[s] ?? 0}</b>
            <span>{t.statuses[s]}</span>
          </button>
        ))}
      </div>

      <div className="tabs" style={{ maxWidth: 460, marginBottom: 24 }}>
        <button
          type="button"
          className={tab === 'requests' ? 'is-active' : ''}
          onClick={() => setTab('requests')}
        >
          {t.admin.tabRequests} ({total})
        </button>
        <button
          type="button"
          className={tab === 'reports' ? 'is-active' : ''}
          onClick={() => setTab('reports')}
        >
          {t.admin.tabReports} ({newReports})
        </button>
      </div>

      {tab === 'requests' ? (
        <>
          <div className="filters">
            <label className="field field--grow">
              <span>{t.admin.search}</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.admin.searchPh}
              />
            </label>
            <label className="field">
              <span>{t.admin.filterStatus}</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | '')}
              >
                <option value="">{t.admin.filterAll}</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t.statuses[s]}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>{t.admin.period}</span>
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                {PERIODS.map((d) => (
                  <option key={d} value={d}>
                    {d === 9999 ? t.admin.periodAll : `${d} ${t.admin.periodDays}`}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {picked.size > 0 && (
            <div className="bulkbar">
              <b>
                {t.admin.selected}: {picked.size}
              </b>
              <select
                value={bulkStep}
                onChange={(e) => setBulkStep(e.target.value as StepKey | '')}
              >
                <option value="">{t.admin.bulkStep}</option>
                {STEP_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {t.repairSteps[k]}
                  </option>
                ))}
              </select>
              <button
                className="btn btn--primary"
                disabled={!bulkStep || savingId === 'bulk'}
                onClick={applyBulk}
              >
                {t.admin.bulkApply}
              </button>
              <button className="ghost" onClick={() => setPicked(new Set())}>
                {t.admin.clearSel}
              </button>
            </div>
          )}

          {requests.length === 0 ? (
            <p className="empty">{loading ? '…' : t.admin.nothingFound}</p>
          ) : (
            <div className="admin__list">
              {requests.map((r) => {
                const pct = Math.round((r.steps.length / STEP_ORDER.length) * 100);
                const draft = drafts[r.id];
                return (
                  <article key={r.id} className="card card--soft reqrow">
                    <div className="reqrow__top">
                      <input
                        type="checkbox"
                        className="reqrow__pick"
                        checked={picked.has(r.id)}
                        onChange={() => togglePick(r.id)}
                        aria-label={r.track_code}
                      />
                      <button
                        type="button"
                        className="reqrow__summary"
                        onClick={() => toggleOpen(r.id)}
                      >
                        <span className="reqrow__code">
                          {r.track_code}
                          {r.picked_up_at && <span className="tag">{t.admin.pickedUp}</span>}
                          {r.notes && <span className="tag tag--quiet">{t.admin.notes}</span>}
                        </span>
                        <span className="reqrow__who">
                          {r.device} · {r.name}
                        </span>
                        <span className="reqrow__meta">{fmt(r.created_at)}</span>
                        <span className="reqrow__bar" aria-hidden="true">
                          <i style={{ width: `${pct}%` }} />
                        </span>
                        <span className="reqrow__status">{t.statuses[r.status]}</span>
                      </button>
                      <a className="reqrow__tel" href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>
                        {r.phone}
                      </a>
                    </div>

                    {open.has(r.id) && (
                      <div className="reqrow__detail">
                        <p className="admin__problem">{r.problem}</p>

                        <div className="block">
                          <span className="block__label">{t.admin.stepsLabel}</span>
                          <div className="steplist">
                            {STEP_ORDER.map((k) => (
                              <label key={k} className="steplist__item">
                                <input
                                  type="checkbox"
                                  checked={r.steps.includes(k)}
                                  disabled={savingId === r.id}
                                  onChange={() => toggleStep(r, k)}
                                />
                                <span>{t.repairSteps[k]}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div className="block">
                          <span className="block__label">{t.admin.notes}</span>
                          <textarea
                            rows={3}
                            placeholder={t.admin.notesPh}
                            value={draft ?? r.notes}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [r.id]: e.target.value }))
                            }
                          />
                          {draft !== undefined && draft !== r.notes && (
                            <button
                              className="btn btn--primary"
                              style={{ marginTop: 10 }}
                              disabled={savingId === r.id}
                              onClick={() => saveNote(r.id)}
                            >
                              {savingId === r.id ? t.admin.saving : t.admin.notesSave}
                            </button>
                          )}
                        </div>

                        <div className="block">
                          <span className="block__label">{t.admin.photos}</span>
                          <div className="photos">
                            {(photos[r.id] ?? []).map((p) => (
                              <figure key={p.path} className="photos__item">
                                <img src={p.url} alt="" loading="lazy" />
                                <button
                                  type="button"
                                  title={t.admin.photoDelete}
                                  onClick={() => deletePhoto(r.id, p.path)}
                                >
                                  ×
                                </button>
                              </figure>
                            ))}
                            <button
                              type="button"
                              className="photos__add"
                              disabled={photoBusy === r.id}
                              onClick={() => {
                                uploadFor.current = r.id;
                                fileInput.current?.click();
                              }}
                            >
                              {photoBusy === r.id ? t.admin.photoUploading : `+ ${t.admin.photoAdd}`}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadPhoto(f);
              e.target.value = '';
            }}
          />

          {requests.length > 0 && (
            <p className="form__hint" style={{ marginTop: 20, textAlign: 'center' }}>
              {t.admin.shown}: {requests.length}
              {hasMore && (
                <>
                  {' · '}
                  <button
                    className="ghost"
                    disabled={loading}
                    onClick={() => void loadRequests(requests.length)}
                  >
                    {loading ? '…' : t.admin.more}
                  </button>
                </>
              )}
            </p>
          )}
        </>
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
