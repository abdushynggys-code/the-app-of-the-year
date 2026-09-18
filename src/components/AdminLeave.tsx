import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';
import { fillTemplate } from '../lib/whatsapp';

type Props = {
  email: string;
  // Владелец сам уйти не может: сначала он передаёт роль другому.
  isOwner: boolean;
  onLeft: () => void;
};

// Уход из админки. Два экрана подряд, и они спрашивают разное: первый — что
// пропадает прямо сейчас, второй — как вернуться (никак, только через
// владельца). Второе «вы уверены?» имеет смысл только тогда, когда добавляет
// новый факт, а не повторяет первое другими словами.
//
// Почему не window.confirm, которым пользуется остальная админка: у него
// нельзя подписать кнопки, и оба шага выглядели бы одинаковыми окошками
// «ОК / Отмена» — подряд это читается как залипший двойной клик.
export function AdminLeave({ email, isOwner, onLeft }: Props) {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);

  // Тот же приём, что в ReportProblem: настоящий <dialog> сам ловит Esc,
  // затемняет фон и держит фокус внутри.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (step > 0 && !el.open) el.showModal();
    if (step === 0 && el.open) el.close();
  }, [step]);

  function close() {
    setStep(0);
    setError('');
  }

  async function leave() {
    setBusy(true);
    setError('');
    // Не обычный delete: правила доступа не разрешают удалять свою строку,
    // и такой delete тихо удалил бы ноль строк, ответив «всё хорошо».
    // Функция в базе умеет отказать словами — см. миграцию leave_admin.
    const { error: failed } = await supabase.rpc('leave_admin');
    setBusy(false);

    if (failed) {
      // Доступ не тронут — остаёмся на втором шаге и говорим почему.
      setError(failed.message);
      return;
    }

    setStep(0);
    onLeft();
  }

  if (isOwner) {
    // Кнопки нет вообще: владельцу сначала надо снять с себя роль,
    // и сказать об этом лучше заранее, чем отказом после нажатия.
    return <p className="adminnav__hint">{t.admin.leaveOwnerHint}</p>;
  }

  return (
    <>
      <button className="ghost" type="button" onClick={() => setStep(1)}>
        {t.admin.leaveBtn}
      </button>

      {createPortal(
        <dialog className="modal" ref={dialog} onClose={close}>
          <div className="modal__body">
            {step === 2 ? (
              <>
                <h2>{t.admin.leaveStep2Title}</h2>
                <p>{fillTemplate(t.admin.leaveStep2Text, { email })}</p>
                {error && <p className="message message--error">{error}</p>}
                <div className="btn-row" style={{ marginTop: 24 }}>
                  <button
                    className="btn btn--primary"
                    type="button"
                    disabled={busy}
                    onClick={leave}
                  >
                    {busy ? t.admin.saving : t.admin.leaveConfirm}
                  </button>
                  <button className="btn btn--secondary" type="button" onClick={() => setStep(1)}>
                    {t.admin.leaveBack}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>{t.admin.leaveStep1Title}</h2>
                <p>{t.admin.leaveStep1Text}</p>
                <div className="btn-row" style={{ marginTop: 24 }}>
                  <button className="btn btn--primary" type="button" onClick={() => setStep(2)}>
                    {t.admin.leaveNext}
                  </button>
                  <button className="btn btn--secondary" type="button" onClick={close}>
                    {t.report.close}
                  </button>
                </div>
              </>
            )}
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}

// Прощание. Отдельный экран, а не окошко: доступа в админку уже нет, и
// показывать его поверх списка заявок, который человеку больше не принадлежит,
// было бы странно.
//
// Из аккаунта не выходим намеренно. Этой же почтой человек сдаёт в ремонт
// свои устройства, и выкидывать его из собственных заявок заодно с админкой
// — лишнее. Доступ администратора уже убран в базе, сессия обычного клиента
// ничему не мешает.
export function AdminFarewell({ email }: { email: string }) {
  const { t } = useLang();
  const [, navigate] = useLocation();

  return (
    <main className="wrap wrap--narrow page">
      <div className="card card--soft done swap-in">
        <span className="done__mark" aria-hidden="true">
          ✓
        </span>
        <h1>{t.admin.leaveByeTitle}</h1>
        <p>{t.admin.leaveByeText}</p>
        <p className="done__account">
          {t.admin.leaveByeAccount}: <b>{email}</b>
        </p>
        {/* Уводим по нажатию, а не по таймеру: это единственный экран, где
            написано, что вернуть доступ может только владелец, и отнимать
            его на середине фразы нельзя. */}
        <button
          className="btn btn--primary"
          style={{ marginTop: 24 }}
          type="button"
          onClick={() => navigate('/')}
        >
          {t.backHome}
        </button>
      </div>
    </main>
  );
}
