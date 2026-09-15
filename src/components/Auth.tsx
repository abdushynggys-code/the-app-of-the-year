import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';
import { useLang } from '../lib/i18n';

// Вход и регистрация по email + паролю.
export function Auth() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const { error } = await (mode === 'signup'
        ? supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : supabase.auth.signInWithPassword({ email, password }));

      if (error) setMessage(error.message);
      else if (mode === 'signup') setMessage(t.auth.checkEmail);
    } catch {
      setMessage(t.auth.failed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card card--soft">
      <h3 style={{ marginBottom: 16 }}>
        {mode === 'signin' ? t.auth.signin : t.auth.signup}
      </h3>

      <form onSubmit={handleSubmit} className="form">
        <label className="field">
          <span>{t.auth.email}</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>{t.auth.password}</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </label>

        {message && <p className="message">{message}</p>}

        <button className="btn btn--primary" type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? t.auth.doSignin : t.auth.doSignup}
        </button>
      </form>

      <p style={{ marginTop: 16 }}>
        <button
          className="ghost"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? t.auth.toSignup : t.auth.toSignin}
        </button>
      </p>
    </section>
  );
}
