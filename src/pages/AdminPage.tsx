import { useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { Auth } from '../components/Auth';
import { useLang, STEP_ORDER, type Status, type StepKey } from '../lib/i18n';
import { AdminNav, type AdminTab } from '../components/AdminNav';
import { AdminDeals } from '../components/AdminDeals';
import { AdminImages } from '../components/AdminImages';
import { AdminFarewell } from '../components/AdminLeave';
import { loadSiteImages, SLOTS, type SiteImages } from '../lib/siteImages';
import { isLive, loadDeals, type Deal } from '../lib/deals';
import { canWhatsApp, fillTemplate, waLink } from '../lib/whatsapp';

type Req = {
  id: string;
  track_code: string;
  name: string;
  phone: string;
  email: string | null;
  device: string;
  model: string | null;
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

type Role = 'owner' | 'admin';

// Своя строка в таблице admins: одобрили меня или ещё нет, и в какой роли.
type Me = { user_id: string; email: string; role: Role; status: 'pending' | 'approved' };

type AccessRow = Me & { requested_at: string };

const PAGE = 25;
// В работе — всё, кроме выданного. Выданное уходит во вкладку «История»,
// чтобы список текущих заявок не рос бесконечно.
const ACTIVE: Status[] = ['new', 'diagnostics', 'repair', 'ready'];
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
  const [userId, setUserId] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const [checked, setChecked] = useState(false);
  const [access, setAccess] = useState<AccessRow[]>([]);
  const [requesting, setRequesting] = useState(false);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [dbError, setDbError] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [tab, setTab] = useState<AdminTab>('active');

  const [requests, setRequests] = useState<Req[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsError, setDealsError] = useState('');
  const [images, setImages] = useState<SiteImages>({});
  // Почту запоминаем прямо во флаге: прощальный экран должен назвать
  // аккаунт, а email к тому моменту уже может обнулиться.
  const [leftAs, setLeftAs] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState('');
  const [copiedId, setCopiedId] = useState('');

  // Поиск набирают быстрее, чем отвечает база: ждём паузу в 300 мс,
  // иначе на каждую букву уходил бы отдельный запрос.
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [days, setDays] = useState(30);

  // Открытая карточка ровно одна. Раньше это было множество, и за утро
  // список превращался в несколько экранов раскрытых панелей: следующую
  // заявку приходилось искать прокруткой.
  const [open, setOpen] = useState('');
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
    supabase.auth.getSession().then(({ data }) => handleSession(data.session?.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      handleSession(session?.user ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(id);
  }, [search]);

  useEffect(() => {
    if (me?.status === 'approved') void loadRequests(0);
  }, [query, statusFilter, days, me?.status, tab]);

  async function handleSession(user: { id: string; email?: string } | null) {
    setEmail(user?.email ?? null);
    setUserId(user?.id ?? null);
    if (!user) {
      setMe(null);
      setChecked(false);
      return;
    }

    // Читаем свою строку: она же говорит, одобрили нас и какая у нас роль.
    const { data, error } = await supabase
      .from('admins')
      .select('user_id, email, role, status')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      // База не отвечает или миграции не применены — это не «нет доступа».
      setDbError(error.message);
      setMe(null);
      setChecked(true);
      return;
    }

    const row = (data as Me) ?? null;
    setMe(row);
    setChecked(true);

    // Сняли с себя роль владельца — разделы «Скидки», «Картинки» и «Доступ»
    // исчезают из меню. Если стоять в одном из них, страница осталась бы
    // на разделе, которого больше нет в списке, а подложка меню уехала бы
    // к несуществующему пункту.
    if (row?.role !== 'owner' && ['deals', 'images', 'access'].includes(tab)) {
      setTab('active');
    }

    if (row?.status === 'approved') {
      void loadStats();
      void loadReports();
      if (row.role === 'owner') {
        void loadAccess();
        void loadAllowlist();
        void loadDealList();
        void loadImageList();
      }
    }
  }

  // Список видит только владелец — так решает сама база.
  async function loadAccess() {
    const { data } = await supabase
      .from('admins')
      .select('user_id, email, role, status, requested_at')
      .order('requested_at', { ascending: false });
    setAccess((data as AccessRow[]) ?? []);
  }

  async function requestAccess() {
    if (!userId || !email) return;
    setRequesting(true);
    const { error } = await supabase
      .from('admins')
      .insert({ user_id: userId, email, role: 'admin', status: 'pending' });
    if (!error) {
      setMe({ user_id: userId, email, role: 'admin', status: 'pending' });
      // Владелец и так увидит счётчик в разделе «Доступ», но заходить туда
      // каждый день никто не будет — поэтому ещё и письмо. Если почта не
      // настроена, запрос всё равно сохранён: молча пропускаем ошибку.
      void supabase.functions
        .invoke('notify', { body: { kind: 'access' } })
        .catch(() => {});
    } else setDbError(error.message);
    setRequesting(false);
  }

  async function approveAccess(id: string) {
    setSavingId(id);
    await supabase
      .from('admins')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: userId })
      .eq('user_id', id);
    await loadAccess();
    setSavingId('');
  }

  async function revokeAccess(id: string) {
    if (!confirm(t.admin.revokeAsk)) return;
    setSavingId(id);
    setDbError('');
    // .select() здесь обязателен. Правила доступа не дают удалить владельца,
    // но запрет RLS не ошибка: без select запрос ответил бы «всё хорошо»,
    // удалив ноль строк, и доступ остался бы у человека, которого уже
    // «убрали» на экране.
    const { data, error } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', id)
      .select('user_id');
    if (error || !data?.length) setDbError(error?.message ?? t.admin.revokeFailed);
    await loadAccess();
    setSavingId('');
  }

  // Роль меняет база — она же не даёт снять последнего владельца.
  async function setRole(id: string, role: Role) {
    // Снимаем роль с себя или с другого — вопросы разные: «с этого человека»
    // в свой адрес звучит так, будто нажал не туда.
    const ask =
      role === 'owner'
        ? t.admin.transferAsk
        : id === me?.user_id
          ? t.admin.demoteSelfAsk
          : t.admin.demoteAsk;
    if (!confirm(ask)) return;
    setSavingId(id);
    setDbError('');
    const { error } = await supabase.rpc('set_admin_role', { target: id, new_role: role });
    setSavingId('');
    if (error) {
      setDbError(error.message);
      return;
    }
    await loadAccess();
    // Могли снять роль с себя — перечитываем, кто мы теперь.
    const { data } = await supabase.auth.getUser();
    void handleSession(data.user ? { id: data.user.id, email: data.user.email } : null);
  }

  async function loadAllowlist() {
    const { data } = await supabase.from('admin_emails').select('email').order('email');
    setAllowlist(((data as { email: string }[]) ?? []).map((r) => r.email));
  }

  // Если человек с такой почтой уже зарегистрирован, база откроет
  // ему доступ сразу — не придётся регистрироваться заново.
  async function addEmail(e: React.FormEvent) {
    e.preventDefault();
    const mail = newEmail.trim();
    if (!mail) return;
    setAddingEmail(true);
    setDbError('');
    const { error } = await supabase.rpc('add_admin_email', { new_email: mail });
    setAddingEmail(false);
    if (error) {
      setDbError(error.message);
      return;
    }
    setNewEmail('');
    await loadAllowlist();
    await loadAccess();
  }

  async function removeEmail(mail: string) {
    if (!confirm(t.admin.allowlistRemoveAsk)) return;
    setDbError('');
    const { error } = await supabase.from('admin_emails').delete().eq('email', mail);
    if (error) setDbError(error.message);
    await loadAllowlist();
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

  // true — вместе с выключенными и просроченными: владельцу нужно видеть
  // всё, что он когда-то объявлял, а не только то, что висит на сайте.
  async function loadDealList() {
    const res = await loadDeals(true);
    setDeals(res.deals);
    setDealsError(res.error);
  }

  async function loadImageList() {
    setImages(await loadSiteImages());
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
        'id, track_code, name, phone, email, device, model, problem, status, steps, notes, picked_up_at, created_at',
      )
      .order('created_at', { ascending: false })
      .range(from, from + PAGE - 1);

    // Выданные заказы живут отдельно, в «Истории».
    if (tab === 'history') q = q.eq('status', 'done');
    else q = q.neq('status', 'done');

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
    if (!r.steps.includes(key)) {
      void saveSteps(r.id, stepsUpTo(key));
      return;
    }
    // Снять галочку значит снять и все следующие за ней: полоска у клиента
    // тут же откатится назад. Если теряется больше одного этапа, это почти
    // наверняка промах по соседней галочке — спрашиваем. Все остальные
    // необратимые действия в админке тоже спрашивают.
    if (r.steps.length - i > 1 && !confirm(t.admin.stepUndoAsk)) return;
    void saveSteps(r.id, STEP_ORDER.slice(0, i));
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
    setOpen((cur) => (cur === id ? '' : id));
    if (!photos[id]) void loadPhotos(id);
  }

  function togglePick(id: string) {
    setPicked((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function switchTab(next: AdminTab) {
    setTab(next);
    setPicked(new Set());
    setStatusFilter('');
    setSearch('');
    // В истории ищут старые заказы, поэтому период сразу «всё время»:
    // иначе поиск прошлогодней заявки не нашёл бы ничего.
    setDays(next === 'history' ? 9999 : 30);
  }

  // Нажатие делает сразу два дела: на телефоне начинается звонок,
  // а на компьютере tel: обычно ничего не открывает — зато номер уже в буфере.
  async function copyPhone(id: string, phone: string) {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      // Буфер недоступен — звонок всё равно сработает.
    }
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

  // Выше всех остальных проверок: доступа в базе уже нет, и обычная
  // отрисовка показала бы экран «попросите доступ» вместо прощания.
  if (leftAs) return <AdminFarewell email={leftAs} />;

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

  if (!checked) {
    return (
      <main className="wrap wrap--narrow page">
        <p className="empty">…</p>
      </main>
    );
  }

  // Доступа нет — но его можно попросить, владелец увидит запрос.
  if (!me) {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.noAccess}</h1>
          <p>{t.admin.noAccessText}</p>
        </div>
        {dbError && <p className="message message--error">{dbError}</p>}
        <div className="card card--soft">
          <p className="form__hint">{email}</p>
          <div className="btn-row" style={{ marginTop: 16 }}>
            <button className="btn btn--primary" disabled={requesting} onClick={requestAccess}>
              {requesting ? t.admin.requestSending : t.admin.requestAccess}
            </button>
            <button className="btn btn--secondary" onClick={() => supabase.auth.signOut()}>
              {t.signOut}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Запрос отправлен — ждём, пока владелец его откроет.
  if (me.status === 'pending') {
    return (
      <main className="wrap wrap--narrow page">
        <div className="page__head">
          <h1>{t.admin.pendingTitle}</h1>
          <p>{t.admin.pendingText}</p>
        </div>
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

  const newReports = reports.filter((r) => r.status === 'new').length;
  const activeTotal = ACTIVE.reduce((sum, s) => sum + (stats[s] ?? 0), 0);
  const doneTotal = stats.done ?? 0;
  const isOwner = me.role === 'owner';
  // В меню показываем число действующих скидок, а не всех в списке:
  // выключенная скидка на сайте не висит, и считать её нечестно.
  const liveDeals = deals.filter(isLive).length;
  // Сколько мест на сайте уже с фотографией, а не с рисунком.
  const filledSlots = SLOTS.filter((s) => images[s]).length;
  const pendingRows = access.filter((a) => a.status === 'pending');
  const approvedRows = access.filter((a) => a.status === 'approved');
  // Сколько всего владельцев. Нужно, чтобы сказать «роль нельзя снять»
  // до нажатия, а не показывать отказ базы после него.
  const owners = approvedRows.filter((a) => a.role === 'owner').length;

  function refreshAll() {
    void loadRequests(0);
    void loadStats();
    void loadReports();
    if (isOwner) {
      void loadDealList();
      void loadImageList();
    }
  }

  return (
    <main className="wrap page admin">
      <div className="admin__shell">
        <AdminNav
          tab={tab}
          onSwitch={switchTab}
          counts={{
            active: activeTotal,
            history: doneTotal,
            reports: newReports,
            deals: liveDeals,
            images: filledSlots,
            access: pendingRows.length,
          }}
          isOwner={isOwner}
          email={email}
          onSignOut={() => supabase.auth.signOut()}
          onRefresh={refreshAll}
          onLeft={() => setLeftAs(email ?? '')}
        />

        {/* key — чтобы раздел появлялся заново, а не подменялся молча */}
        <section className="admin__body swap-in" key={tab}>
          <h1 className="admin__title">{t.admin.title}</h1>

      {/* Счётчики заодно работают фильтром: нажал «Готово» — увидел только готовые */}
      {tab === 'active' && (
        <div className="stats">
          <button
            type="button"
            className={`stats__card${statusFilter === '' ? ' is-active' : ''}`}
            onClick={() => setStatusFilter('')}
          >
            <b>{activeTotal}</b>
            <span>{t.admin.statsActive}</span>
          </button>
          {ACTIVE.map((s) => (
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
      )}

      {tab === 'deals' ? (
        <AdminDeals deals={deals} loadError={dealsError} reload={loadDealList} />
      ) : tab === 'images' ? (
        <AdminImages images={images} reload={loadImageList} />
      ) : tab === 'access' ? (
        <>
          <div className="block" style={{ marginBottom: 40 }}>
            <span className="block__label">{t.admin.accessPending}</span>
            {pendingRows.length === 0 ? (
              <p className="empty">{t.admin.noPending}</p>
            ) : (
              <div className="admin__list">
                {pendingRows.map((a) => (
                  <article key={a.user_id} className="card card--soft admin__row">
                    <div className="admin__main">
                      <p className="req__code">{a.email}</p>
                      <p className="req__meta">{fmt(a.requested_at)}</p>
                    </div>
                    <div className="btn-row">
                      <button
                        className="btn btn--primary"
                        disabled={savingId === a.user_id}
                        onClick={() => approveAccess(a.user_id)}
                      >
                        {t.admin.approve}
                      </button>
                      <button
                        className="btn btn--secondary"
                        disabled={savingId === a.user_id}
                        onClick={() => revokeAccess(a.user_id)}
                      >
                        {t.admin.reject}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="block">
            <span className="block__label">{t.admin.accessAdmins}</span>
            <div className="admin__list">
              {approvedRows.map((a) => (
                <article key={a.user_id} className="card card--soft admin__row">
                  <div className="admin__main">
                    <p className="req__code">
                      {a.email}{' '}
                      <span className={a.role === 'owner' ? 'tag' : 'tag tag--quiet'}>
                        {a.role === 'owner' ? t.admin.roleOwner : t.admin.roleAdmin}
                      </span>
                      {a.user_id === me.user_id && (
                        <span className="tag tag--quiet">{t.admin.you}</span>
                      )}
                    </p>
                  </div>
                  <div className="btn-row">
                    {a.role === 'owner' ? (
                      <>
                        {/* Последнего владельца снять нельзя — так решает сама
                            база. Но узнавать об этом из отказа после нажатия
                            неприятно, поэтому кнопка гаснет заранее и рядом
                            написано, что делать: передать роль другому. */}
                        <button
                          className="btn btn--secondary"
                          disabled={savingId === a.user_id || owners < 2}
                          onClick={() => setRole(a.user_id, 'admin')}
                        >
                          {t.admin.demoteBtn}
                        </button>
                        {owners < 2 && <p className="form__hint">{t.admin.lastOwnerHint}</p>}
                      </>
                    ) : (
                      <>
                        <button
                          className="btn btn--secondary"
                          disabled={savingId === a.user_id}
                          onClick={() => setRole(a.user_id, 'owner')}
                        >
                          {t.admin.transferBtn}
                        </button>
                        <button
                          className="btn btn--secondary"
                          disabled={savingId === a.user_id}
                          onClick={() => revokeAccess(a.user_id)}
                        >
                          {t.admin.revoke}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <p className="form__hint" style={{ marginTop: 16 }}>
              <b>{t.admin.transferTitle}.</b> {t.admin.transferText}
            </p>
          </div>

          <div className="block" style={{ marginTop: 40 }}>
            <span className="block__label">{t.admin.allowlistTitle}</span>

            <form
              onSubmit={addEmail}
              style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}
            >
              <label className="field" style={{ flex: 1, minWidth: 220 }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t.admin.allowlistPh}
                />
              </label>
              <button className="btn btn--primary" type="submit" disabled={addingEmail}>
                {addingEmail ? t.admin.allowlistAdding : t.admin.allowlistAdd}
              </button>
            </form>

            {allowlist.length === 0 ? (
              <p className="empty">{t.admin.allowlistEmpty}</p>
            ) : (
              <div className="admin__list">
                {allowlist.map((mail) => (
                  <article key={mail} className="card card--soft admin__row">
                    <div className="admin__main">
                      <p className="req__code">{mail}</p>
                    </div>
                    <button className="btn btn--secondary" onClick={() => removeEmail(mail)}>
                      {t.admin.allowlistRemove}
                    </button>
                  </article>
                ))}
              </div>
            )}

            <p className="form__hint" style={{ marginTop: 16 }}>
              {t.admin.allowlistText}
            </p>
          </div>

          {dbError && (
            <p className="message message--error" style={{ marginTop: 20 }}>
              {dbError}
            </p>
          )}
        </>
      ) : tab !== 'reports' ? (
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
            {/* Выбор статуса жил тут вторым экземпляром: счётчики наверху
                делают ровно то же самое и делают это одним нажатием. Два
                органа управления на одно состояние — это не выбор,
                а вопрос «а какой из них сейчас главный». */}
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
                // Первый неотмеченный этап и есть «что дальше». Выдано —
                // значит дальше ничего, кнопки не будет.
                const nextStep = STEP_ORDER.find((k) => !r.steps.includes(k));
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
                          {r.model ? `${r.device} ${r.model}` : r.device} · {r.name}
                        </span>
                        <span className="reqrow__meta">{fmt(r.created_at)}</span>
                        <span className="reqrow__bar" aria-hidden="true">
                          <i style={{ width: `${pct}%` }} />
                        </span>
                        {/* Счётчик этапов рядом со статусом: база сводит и
                            «цену согласовали», и «починили» в один статус
                            «в ремонте», и без счётчика две галочки из шести
                            выглядели так, будто нажатие не сработало. */}
                        <span className="reqrow__status">
                          {t.statuses[r.status]} · {r.steps.length}/{STEP_ORDER.length}
                        </span>
                      </button>
                      <a
                        className="reqrow__tel"
                        href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}
                        title={r.phone}
                        onClick={() => copyPhone(r.id, r.phone)}
                      >
                        {copiedId === r.id ? t.fOkCopied : r.phone}
                      </a>
                      {/* Самое частое действие за день — сдвинуть ремонт на шаг
                          вперёд. Раньше ради него надо было раскрыть карточку и
                          найти нужную галочку среди шести одинаковых. Теперь
                          следующий шаг подписан прямо в строке и нажимается
                          сразу: ничего открывать не нужно. */}
                      {nextStep && (
                        <button
                          type="button"
                          className="btn btn--primary reqrow__next"
                          disabled={savingId === r.id}
                          onClick={() => saveSteps(r.id, stepsUpTo(nextStep))}
                        >
                          {t.repairSteps[nextStep]}
                        </button>
                      )}
                    </div>

                    {open === r.id && (
                      <div className="reqrow__detail">
                        <p className="admin__problem">{r.problem}</p>

                        {/* Телефон клиента может лежать тут же в ремонте —
                            тогда письмо единственный способ с ним связаться. */}
                        {r.email && (
                          <p className="req__meta">
                            {t.admin.email}:{' '}
                            <a className="textlink" href={`mailto:${r.email}`}>
                              {r.email}
                            </a>
                          </p>
                        )}

                        {/* Готовое сообщение клиенту: мастер только нажимает «отправить».
                            Текст зависит от статуса — чаще всего это «готов, забирайте». */}
                        {canWhatsApp(r.phone) && (
                          <p>
                            <a
                              className="btn btn--subtle"
                              href={waLink(
                                r.phone,
                                fillTemplate(
                                  r.status === 'ready' ? t.admin.waReady : t.admin.waWork,
                                  {
                                    name: r.name,
                                    device: r.model ? `${r.device} ${r.model}` : r.device,
                                    code: r.track_code,
                                  },
                                ),
                              )}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {t.admin.waSend}
                            </a>
                          </p>
                        )}

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
        </section>
      </div>
    </main>
  );
}
