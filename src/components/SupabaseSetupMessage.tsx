export function SupabaseSetupMessage() {
  return (
    <section className="card card--soft">
      <h3 style={{ marginBottom: 12 }}>Сначала подключи Supabase</h3>
      <p className="form__hint">
        Скопируй <code>.env.example</code> в <code>.env</code>, вставь URL и Publishable key
        своего проекта, затем выполни <code>npm run db:push</code>.
      </p>
    </section>
  );
}
