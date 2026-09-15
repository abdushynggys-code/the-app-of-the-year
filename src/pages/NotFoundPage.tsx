import { Link } from 'wouter';
import { useLang } from '../lib/i18n';

export function NotFoundPage() {
  const { t } = useLang();

  return (
    <main className="wrap wrap--narrow page">
      <div className="page__head">
        <h1>{t.notFound}</h1>
        <p>{t.notFoundText}</p>
      </div>
      <Link href="/" className="btn btn--primary">
        {t.backHome}
      </Link>
    </main>
  );
}
