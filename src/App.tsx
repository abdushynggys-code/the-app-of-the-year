import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { RequestPage } from './pages/RequestPage';
import { TrackPage } from './pages/TrackPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LangContext, type Lang } from './lib/i18n';

const SAVED = ['ru', 'kk', 'en'];

// Здесь живут только маршруты и выбранный язык. Сами экраны — в src/pages/.
export default function App() {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    if (saved && SAVED.includes(saved)) return saved as Lang;
    // Первый заход: если браузер английский — показываем английский.
    return navigator.language.startsWith('en') ? 'en' : 'ru';
  });

  // Запоминаем выбор языка, чтобы он не сбрасывался при перезагрузке.
  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Header />
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/request" component={RequestPage} />
        <Route path="/track" component={TrackPage} />
        <Route component={NotFoundPage} />
      </Switch>
      <Footer />
    </LangContext.Provider>
  );
}
