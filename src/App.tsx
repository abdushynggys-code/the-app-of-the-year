import { useEffect, useState } from 'react';
import { Route, Switch } from 'wouter';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { PageFade } from './components/PageFade';
import { SiteSchema } from './components/SiteSchema';
import { HomePage } from './pages/HomePage';
import { RequestPage } from './pages/RequestPage';
import { TrackPage } from './pages/TrackPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LangContext, type Lang } from './lib/i18n';
import { useReboot } from './lib/motion';
import { Boot } from './components/Boot';

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

  // Язык меняет не кнопка, а весь экран: он гаснет ступенями, меняет язык
  // в темноте и включается заново. Иначе каждая надпись на странице
  // перескакивает разом, и непонятно, что вообще произошло.
  const { rebooting, reboot } = useReboot();

  function switchLang(next: Lang) {
    if (next === lang) return;
    reboot(() => setLang(next));
  }

  return (
    <LangContext.Provider value={{ lang, setLang: switchLang }}>
      {rebooting && <Boot full />}
      <SiteSchema />
      <Header />
      <PageFade>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/request" component={RequestPage} />
          <Route path="/track" component={TrackPage} />
          <Route path="/admin" component={AdminPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </PageFade>
      <Footer />
    </LangContext.Provider>
  );
}
