import { Link } from 'wouter';
import { useLang } from '../lib/i18n';

export function NotFoundPage() {
  const { t } = useLang();

  return (
    <main className="wrap wrap--narrow section">
      <h1 className="page__title">{t.notFound}</h1>
      <p className="page__text">
        <Link href="/" className="link">
          {t.backHome} →
        </Link>
      </p>
    </main>
  );
}
