import { useLang } from '../lib/i18n';

export type AdminTab = 'active' | 'history' | 'reports' | 'deals' | 'access';

type Props = {
  tab: AdminTab;
  onSwitch: (next: AdminTab) => void;
  counts: Record<AdminTab, number>;
  isOwner: boolean;
  email: string;
  onSignOut: () => void;
  onRefresh: () => void;
};

// Боковое меню админки. Раньше все разделы, счётчики и фильтры лежали
// на одном экране подряд, и найти нужное было тяжело. Теперь разделы слева
// и не уезжают при прокрутке, а справа остаётся только текущий раздел.
export function AdminNav({ tab, onSwitch, counts, isOwner, email, onSignOut, onRefresh }: Props) {
  const { t } = useLang();

  const items: { id: AdminTab; label: string }[] = [
    { id: 'active', label: t.admin.tabRequests },
    { id: 'history', label: t.admin.tabHistory },
    { id: 'reports', label: t.admin.tabReports },
  ];
  // Скидки и доступы — решения владельца, мастеру этих разделов не видно
  if (isOwner) {
    items.push({ id: 'deals', label: t.admin.tabDeals });
    items.push({ id: 'access', label: t.admin.tabAccess });
  }

  return (
    <aside className="adminnav" data-tab={tab}>
      <nav className="adminnav__list">
        {/* Подложка едет между пунктами, а не перекрашивается скачком */}
        <span className="adminnav__pill" aria-hidden="true" />
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === tab ? 'adminnav__item is-active' : 'adminnav__item'}
            onClick={() => onSwitch(item.id)}
            aria-current={item.id === tab ? 'page' : undefined}
          >
            {item.label}
            <span className="adminnav__count">{counts[item.id]}</span>
          </button>
        ))}
      </nav>

      <div className="adminnav__foot">
        <button className="btn btn--subtle btn--block" type="button" onClick={onRefresh}>
          {t.admin.refresh}
        </button>
        <p className="adminnav__me">{email}</p>
        <p className="adminnav__role">
          {isOwner ? t.admin.roleOwner : t.admin.roleAdmin} ·{' '}
          <button className="ghost" onClick={onSignOut}>
            {t.signOut}
          </button>
        </p>
      </div>
    </aside>
  );
}
