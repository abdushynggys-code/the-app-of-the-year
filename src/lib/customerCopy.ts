import type { Lang } from './i18n';

// Copy for the customer journey, kept together across all three languages.
type CustomerCopy = {
  eyebrow: string; title: string; accent: string; intro: string;
  explore: string; before: string; after: string; preview: string; previewHint: string;
  bookingTitle: string; bookingHint: string; continue: string; trackHint: string;
  servicesLabel: string; serviceCta: string; priceTitle: string; priceText: string;
  nextTitle: string; nextText: string; directTitle: string; directText: string;
  selected: string; loading: string; phoneError: string; requiredError: string;
  connectionError: string; skip: string;
  pauseMotion: string; playMotion: string;
};

export const CUSTOMER_COPY: Record<Lang, CustomerCopy> = {
  en: {
    pauseMotion: 'Pause motion', playMotion: 'Play motion',
    eyebrow: 'RESET / DEVICE CARE IN ASTANA',
    title: 'Your everyday.', accent: 'Back to life.',
    intro: 'The messages, the work, the little things. Get back to what matters with a repair you can feel good about.',
    explore: 'Explore repairs', before: 'Before', after: 'After', preview: 'A fresh start for your screen',
    previewHint: 'An illustration of the difference a repair can make.',
    bookingTitle: 'Let’s get it working again.', bookingHint: 'Tell us a little. We’ll take it from here.',
    continue: 'Continue to booking', trackHint: 'Enter the code you received when you booked your repair.',
    servicesLabel: 'A SECOND LIFE FOR YOUR TECH', serviceCta: 'Discuss this repair',
    priceTitle: 'A clear price. Your decision.',
    priceText: 'Every model is different. Tell us about yours, and we’ll confirm the cost after free diagnostics. You approve the repair before work starts.',
    nextTitle: 'What happens next?', nextText: 'We discuss the issue, diagnose your device for free, and agree the price and timing with you.',
    directTitle: 'Prefer to talk first?', directText: 'Ask about your repair on WhatsApp. No account needed.',
    selected: 'Your repair', loading: 'Preparing your booking…',
    phoneError: 'Enter a valid phone number with 10–15 digits.', requiredError: 'Please fill in your name, device, model and the issue.',
    connectionError: 'We couldn’t check this repair right now. Please try again.', skip: 'Skip to content',
  },
  ru: {
    pauseMotion: 'Остановить анимацию', playMotion: 'Включить анимацию',
    eyebrow: 'RESET / СЕРВИСНЫЙ ЦЕНТР В АСТАНЕ',
    title: 'Ваша привычная жизнь.', accent: 'Снова на связи.',
    intro: 'Переписки, работа и важные мелочи. Вернитесь к тому, что любите, с ремонтом, которому можно доверять.',
    explore: 'Выбрать ремонт', before: 'До', after: 'После', preview: 'Новая жизнь вашего экрана',
    previewHint: 'Иллюстрация того, как ремонт меняет устройство.',
    bookingTitle: 'Вернём технику к жизни.', bookingHint: 'Расскажите о поломке. Дальше поможем мы.',
    continue: 'Перейти к заявке', trackHint: 'Введите код, который вы получили при оформлении заявки.',
    servicesLabel: 'ВТОРАЯ ЖИЗНЬ ВАШЕЙ ТЕХНИКИ', serviceCta: 'Обсудить ремонт',
    priceTitle: 'Понятная цена. Решение за вами.',
    priceText: 'Каждая модель особенная. Расскажите о своей — после бесплатной диагностики назовём стоимость. Начнём ремонт только после согласования.',
    nextTitle: 'Что будет дальше?', nextText: 'Обсудим поломку, бесплатно проверим устройство и согласуем с вами цену и сроки.',
    directTitle: 'Хотите сначала поговорить?', directText: 'Спросите о ремонте в WhatsApp. Аккаунт не нужен.',
    selected: 'Ваш ремонт', loading: 'Готовим вашу заявку…',
    phoneError: 'Введите корректный номер телефона: от 10 до 15 цифр.', requiredError: 'Заполните имя, устройство, модель и описание поломки.',
    connectionError: 'Сейчас не удалось проверить статус. Попробуйте ещё раз.', skip: 'Перейти к содержимому',
  },
  kk: {
    pauseMotion: 'Анимацияны тоқтату', playMotion: 'Анимацияны қосу',
    eyebrow: 'RESET / АСТАНАДАҒЫ СЕРВИС ОРТАЛЫҒЫ',
    title: 'Күнделікті өміріңіз.', accent: 'Қайта байланыста.',
    intro: 'Хабарламалар, жұмыс және маңызды сәттер. Сенімді жөндеумен өзіңізге маңызды істерге оралыңыз.',
    explore: 'Жөндеуді таңдау', before: 'Дейін', after: 'Кейін', preview: 'Экраныңызға жаңа өмір',
    previewHint: 'Жөндеудің нәтижесін көрсететін иллюстрация.',
    bookingTitle: 'Құрылғыны қайта іске қосайық.', bookingHint: 'Ақауды сипаттаңыз. Әрі қарай көмектесеміз.',
    continue: 'Өтінімге өту', trackHint: 'Өтінім бергенде алған кодты енгізіңіз.',
    servicesLabel: 'ТЕХНИКАҢЫЗҒА ЕКІНШІ ӨМІР', serviceCta: 'Жөндеуді талқылау',
    priceTitle: 'Нақты баға. Шешім өзіңізде.',
    priceText: 'Әр модель әртүрлі. Құрылғыңыз туралы айтыңыз — тегін диагностикадан кейін бағасын хабарлаймыз. Жөндеуді келісіміңізден кейін бастаймыз.',
    nextTitle: 'Әрі қарай не болады?', nextText: 'Ақауды талқылап, құрылғыны тегін тексереміз. Баға мен мерзімді сізбен келісеміз.',
    directTitle: 'Алдымен сөйлескіңіз келе ме?', directText: 'Жөндеу туралы WhatsApp-та сұраңыз. Аккаунт қажет емес.',
    selected: 'Сіздің жөндеуіңіз', loading: 'Өтініміңізді дайындап жатырмыз…',
    phoneError: 'Дұрыс телефон нөмірін енгізіңіз: 10–15 сан.', requiredError: 'Атыңызды, құрылғыны, модельді және ақауды толтырыңыз.',
    connectionError: 'Қазір мәртебені тексеру мүмкін болмады. Қайта көріңіз.', skip: 'Мазмұнға өту',
  },
};
