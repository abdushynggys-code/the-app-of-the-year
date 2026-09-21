import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './supabase';

// «Я админ?» — один вопрос, который нужен в двух местах: шапке сайта, чтобы
// показать ссылку на админку, и самой админке. Раньше ответ знала только
// AdminPage и держала его у себя.
//
// Спрашиваем свою строку в admins, а не функцию is_admin: строка заодно
// говорит роль, а она нужна, чтобы отличить владельца от мастера.

export type AdminRole = 'owner' | 'admin';

export type AdminMe = {
  user_id: string;
  email: string;
  role: AdminRole;
  status: 'pending' | 'approved';
};

export function useAdmin() {
  const [me, setMe] = useState<AdminMe | null>(null);
  // Пока не спросили — не знаем. Разница важна для шапки: ссылку нельзя
  // показывать «на всякий случай», а потом убирать, когда придёт ответ.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecked(true);
      return;
    }

    let alive = true;

    async function ask(userId: string | null) {
      if (!userId) {
        if (alive) {
          setMe(null);
          setChecked(true);
        }
        return;
      }

      const { data } = await supabase
        .from('admins')
        .select('user_id, email, role, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (!alive) return;
      setMe((data as AdminMe) ?? null);
      setChecked(true);
    }

    void supabase.auth.getSession().then(({ data }) => ask(data.session?.user.id ?? null));

    // Вошёл или вышел — ответ меняется. Без этого ссылка на админку висела бы
    // в шапке и после выхода из аккаунта.
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      ask(session?.user.id ?? null),
    );

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return {
    me,
    checked,
    // Доступ есть только у одобренных: у того, кто ещё ждёт ответа, ссылки
    // быть не должно — она вела бы на экран «ваш запрос рассматривается».
    isAdmin: me?.status === 'approved',
    isOwner: me?.status === 'approved' && me.role === 'owner',
  };
}
