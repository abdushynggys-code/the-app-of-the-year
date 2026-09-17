import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { useLang } from '../lib/i18n';

// Незаметная ссылка внизу сайта: посетитель сообщает, что сломалось.
// Пишет в таблицу site_reports — её читает админка.
export function ReportProblem() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  // Открываем и закрываем настоящий <dialog> — он сам ловит Esc и затемняет фон.
  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  function close() {
    setOpen(false);
    // Сбрасываем форму чуть позже, чтобы текст не мигал при закрытии.
    setTimeout(() => {
      setSent(false);
      setMessage('');
      setContact('');
      setError('');
    }, 200);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!isSupabaseConfigured) {
      setError(t.report.failed);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { error: insertError } = await supabase.from('site_reports').insert({
        message: message.trim(),
        contact: contact.trim() || null,
        // Полезно для починки: с какой страницы и с какого браузера пришло.
        page: window.location.pathname + window.location.search,
        user_agent: navigator.userAgent.slice(0, 300),
      });
      if (insertError) setError(t.report.failed);
      else setSent(true);
    } catch {
      setError(t.report.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button className="reportlink" onClick={() => setOpen(true)}>
        {t.report.link}
      </button>

      {/* Окно переносим в конец страницы. В разметке ссылка стоит внутри
          абзаца в подвале, а <dialog> внутри <p> — недопустимая вложенность:
          браузер ругается и может закрыть абзац раньше времени. */}
      {createPortal(
        <dialog className="modal" ref={dialog} onClose={close}>
          {sent ? (
            <div className="modal__body done">
              <span className="done__mark" aria-hidden="true">
                ✓
              </span>
              <h3>{t.report.okTitle}</h3>
              <p>{t.report.okText}</p>
              <button className="btn btn--primary" onClick={close} style={{ marginTop: 20 }}>
                {t.report.close}
              </button>
            </div>
          ) : (
            <form className="modal__body form" onSubmit={send}>
              <div>
                <h3>{t.report.title}</h3>
                <p className="form__hint" style={{ marginTop: 8 }}>
                  {t.report.text}
                </p>
              </div>

              <label className="field">
                <span>{t.report.message}</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.report.messagePh}
                  required
                  rows={4}
                  maxLength={2000}
                  autoFocus
                />
              </label>

              <label className="field">
                <span>{t.report.contact}</span>
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={t.report.contactPh}
                  maxLength={120}
                />
              </label>

              {error && <p className="message message--error">{error}</p>}

              <div className="btn-row">
                <button className="btn btn--primary" type="submit" disabled={busy}>
                  {busy ? t.report.sending : t.report.send}
                </button>
                <button className="btn btn--secondary" type="button" onClick={close}>
                  {t.report.close}
                </button>
              </div>
            </form>
          )}
        </dialog>,
        document.body,
      )}
    </>
  );
}
