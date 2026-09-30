import type { CSSProperties, ReactNode } from 'react';
import { useLang } from '../lib/i18n';
import { AdminLeave } from './AdminLeave';

// 'log' в список пунктов ниже намеренно не попадает: в журнал заходят
// через три точки, а не каждый день мимо него.
export type AdminTab =
  | 'active'
  | 'history'
  | 'reports'
  | 'prices'
  | 'reviews'
  | 'deals'
  | 'images'
  | 'access'
  | 'log';

type Props = {
  tab: AdminTab;
  onSwitch: (next: AdminTab) => void;
  counts: Record<AdminTab, number>;
  isOwner: boolean;
  email: string;
  onSignOut: () => void;
  onRefresh: () => void;
  // Доступ уже убран в базе — страница показывает прощание.
  onLeft: () => void;
  // Три точки: то, что нужно изредка. Собирает их AdminPage.
  more: ReactNode;
};

// Боковое меню админки. Раньше все разделы, счётчики и фильтры лежали
// на одном экране подряд, и найти нужное было тяжело. Теперь разделы слева
// и не уезжают при прокрутке, а справа остаётся только текущий раздел.
export function AdminNav({
  tab,
  onSwitch,
  counts,
  isOwner,
  email,
  onSignOut,
  onRefresh,
  onLeft,
  more,
}: Props) {
  const { t } = useLang();

  const items: { id: AdminTab; label: string }[] = [
    { id: 'active', label: t.admin.tabRequests },
    { id: 'history', label: t.admin.tabHistory },
    { id: 'reports', label: t.admin.tabReports },
  ];
  // Цены, отзывы, скидки, картинки и доступы — решения владельца,
  // мастеру этих разделов не видно
  if (isOwner) {
    items.push({ id: 'prices', label: t.admin.tabPrices });
    items.push({ id: 'reviews', label: t.admin.tabReviews });
    items.push({ id: 'deals', label: t.admin.tabDeals });
    items.push({ id: 'images', label: t.admin.tabImages });
    items.push({ id: 'access', label: t.admin.tabAccess });
  }

  // Куда встать подложке. Раньше на каждый раздел было своё правило в CSS
  // с готовым процентом сдвига — и стоило добавить раздел в середину,
  // как подложка уезжала не на тот пункт. Теперь номер считает тот же код,
  // который строит список, и разъехаться им негде.
  // −1 бывает у журнала: его в списке нет, и подложке вставать некуда.
  const activeIndex = items.findIndex((item) => item.id === tab);
  const pillStyle = { '--nav-i': activeIndex } as CSSProperties;

  return (
    <aside className="adminnav" data-tab={tab}>
      <nav className="adminnav__list">
        {/* Подложка едет между пунктами, а не перекрашивается скачком */}
        {activeIndex >= 0 && <span className="adminnav__pill" style={pillStyle} aria-hidden="true" />}
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
        <div className="adminnav__tools">
          <button className="btn btn--subtle btn--block" type="button" onClick={onRefresh}>
            {t.admin.refresh}
          </button>
          {more}
        </div>
        <p className="adminnav__me">{email}</p>
        <p className="adminnav__role">
          {isOwner ? t.admin.roleOwner : t.admin.roleAdmin} ·{' '}
          <button className="ghost" onClick={onSignOut}>
            {t.signOut}
          </button>
        </p>
        {/* «Уйти из админки» стоит здесь, а не в разделе «Доступ»: раздел
            виден только владельцу, а уходят как раз не владельцы. */}
        <div className="adminnav__leave">
          <AdminLeave email={email} isOwner={isOwner} onLeft={onLeft} />
        </div>
      </div>
    </aside>
  );
}
