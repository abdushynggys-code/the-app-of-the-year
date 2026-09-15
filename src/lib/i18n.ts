import { createContext, useContext } from 'react';

// Три языка: русский, казахский, английский. Переключатель — в шапке сайта.
export type Lang = 'ru' | 'kk' | 'en';

export const LANGS: { id: Lang; short: string; title: string }[] = [
  { id: 'ru', short: 'Rus', title: 'Русский' },
  { id: 'kk', short: 'Қаз', title: 'Қазақша' },
  { id: 'en', short: 'Eng', title: 'English' },
];

export type Status = 'new' | 'diagnostics' | 'repair' | 'ready' | 'done';

// Этапы ремонта. Мастер отмечает галочки в админке — клиент видит,
// как заполняется полоска. Порядок важен: по нему считается процент.
export type StepKey = 'accepted' | 'diagnosed' | 'approved' | 'repaired' | 'tested' | 'delivered';

export const STEP_ORDER: StepKey[] = [
  'accepted',
  'diagnosed',
  'approved',
  'repaired',
  'tested',
  'delivered',
];

type Pair = { t: string; d: string };
type Service = { icon: string; t: string; d: string };
type Faq = { q: string; a: string };
type Promo = { eyebrow: string; t: string; d: string; cta: string };

// Один словарь описывает все три языка — если забыть ключ, сборка упадёт с ошибкой.
export type Dict = {
  nav: { home: string; request: string; track: string };
  menu: string;

  heroBadge: string;
  heroTitle: string;
  heroText: string;

  cardTabRepair: string;
  cardTabTrack: string;
  cardDevice: string;
  cardDevicePh: string;
  cardProblem: string;
  cardProblemPh: string;
  cardGo: string;
  cardTrackPh: string;
  cardTrackGo: string;
  cardNote: string;

  chipsTitle: string;
  chips: string[];

  promos: Promo[];

  servicesTitle: string;
  servicesText: string;
  services: Service[];

  stepsTitle: string;
  steps: Pair[];

  faqTitle: string;
  faq: Faq[];

  contactsTitle: string;
  addressLabel: string;
  address: string;
  hoursLabel: string;
  hours: string;
  phoneLabel: string;
  writeUs: string;
  openMap: string;
  ctaBandTitle: string;
  ctaBandText: string;

  formTitle: string;
  formText: string;
  fName: string;
  fPhone: string;
  fDevice: string;
  fDevicePh: string;
  fProblem: string;
  fProblemPh: string;
  fSubmit: string;
  fSending: string;
  fOkTitle: string;
  fOkText: string;
  fOkCopy: string;
  fOkCopied: string;
  fOkTrack: string;
  fOkMore: string;
  fErr: string;
  fLoginHint: string;

  trackTitle: string;
  trackText: string;
  trackPh: string;
  trackBtn: string;
  trackNotFound: string;
  trackDevice: string;
  trackAccepted: string;
  trackUpdated: string;
  myTitle: string;
  myEmpty: string;
  signOut: string;
  orLogin: string;

  statuses: Record<Status, string>;
  statusHints: Record<Status, string>;
  repairSteps: Record<StepKey, string>;
  trackProgress: string;

  auth: {
    signin: string;
    signup: string;
    email: string;
    password: string;
    doSignin: string;
    doSignup: string;
    toSignup: string;
    toSignin: string;
    checkEmail: string;
    failed: string;
  };

  report: {
    link: string;
    title: string;
    text: string;
    message: string;
    messagePh: string;
    contact: string;
    contactPh: string;
    send: string;
    sending: string;
    okTitle: string;
    okText: string;
    close: string;
    failed: string;
  };

  admin: {
    title: string;
    signInText: string;
    google: string;
    googleHint: string;
    or: string;
    noAccess: string;
    noAccessText: string;
    tabRequests: string;
    tabHistory: string;
    tabReports: string;
    empty: string;
    phone: string;
    problem: string;
    statusLabel: string;
    saving: string;
    saved: string;
    reportPage: string;
    reportContact: string;
    markDone: string;
    doneLabel: string;
    refresh: string;

    statsTotal: string;
    statsActive: string;
    search: string;
    searchPh: string;
    filterStatus: string;
    filterAll: string;
    period: string;
    periodDays: string;
    periodAll: string;
    nothingFound: string;
    shown: string;
    more: string;

    notes: string;
    notesPh: string;
    notesSave: string;

    stepsLabel: string;
    pickedUp: string;

    photos: string;
    photoAdd: string;
    photoUploading: string;
    photoDelete: string;
    photoDeleteAsk: string;

    selected: string;
    bulkStep: string;
    bulkApply: string;
    clearSel: string;
  };

  backHome: string;
  notFound: string;
  notFoundText: string;
  footerAbout: string;
  footerNav: string;
  footerContacts: string;
  footerRights: string;
};

export const DICT: Record<Lang, Dict> = {
  /* ─────────────────────────── Русский ─────────────────────────── */
  ru: {
    nav: { home: 'Главная', request: 'Заявка', track: 'Статус ремонта' },
    menu: 'Меню',

    heroBadge: 'на 2ГИС · более 1200 отзывов',
    heroTitle: 'Ремонт, пока вы ждёте',
    heroText:
      'Телефоны, планшеты, часы и ноутбуки в Астане. Диагностика бесплатно и без записи — смотрим при вас.',

    cardTabRepair: 'Ремонт',
    cardTabTrack: 'Проверить статус',
    cardDevice: 'Устройство',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'Что случилось',
    cardProblemPh: 'Разбит экран, не заряжается…',
    cardGo: 'Узнать цену',
    cardTrackPh: 'Код заявки: RS-4821',
    cardTrackGo: 'Проверить',
    cardNote: 'Ответим в рабочее время — ежедневно с 10:00 до 20:00.',

    chipsTitle: 'Что чиним чаще всего',
    chips: [
      'Замена экрана',
      'Замена батареи',
      'Не заряжается',
      'Упал в воду',
      'Ремонт платы',
      'Разблокировка',
      'Апгрейд SSD',
      'Установка Windows',
    ],

    promos: [
      {
        eyebrow: 'Без записи',
        t: 'Диагностика бесплатная — и ни к чему не обязывает',
        d: 'Приходите когда удобно. Найдём причину, назовём точную цену. Не устроит — заберёте устройство и не заплатите ничего.',
        cta: 'Оставить заявку',
      },
      {
        eyebrow: 'Гарантия',
        t: 'Год гарантии на работу и запчасти',
        d: 'Ставим проверенные комплектующие, а не самое дешёвое с рынка. Если что-то пойдёт не так — возвращайтесь, доделаем без вопросов.',
        cta: 'Позвонить нам',
      },
    ],

    servicesTitle: 'Что мы чиним',
    servicesText: 'От разбитого экрана до пайки микросхем — всё в одной мастерской.',
    services: [
      {
        icon: 'phone',
        t: 'Смартфоны и планшеты',
        d: 'Экран, батарея, разъём зарядки, камеры и динамики.',
      },
      { icon: 'watch', t: 'Смарт-часы', d: 'Стекло, аккумулятор, кнопки, ремонт после падения.' },
      {
        icon: 'laptop',
        t: 'Ноутбуки и компьютеры',
        d: 'Чистка от пыли, клавиатура, матрица, ремонт цепей питания.',
      },
      { icon: 'lock', t: 'Разблокировка', d: 'Экран и аккаунты: iCloud, Samsung, Google, Mi, Huawei ID.' },
      { icon: 'drop', t: 'После воды', d: 'Ультразвуковая чистка платы и восстановление залитых устройств.' },
      { icon: 'chip', t: 'Ремонт плат', d: 'Пайка микросхем, контроллеры питания, поиск короткого замыкания.' },
      { icon: 'bolt', t: 'Апгрейд', d: 'SSD вместо HDD, больше оперативной памяти, установка Optibay.' },
      { icon: 'window', t: 'Установка систем', d: 'Windows, macOS, Ubuntu. Office, Adobe, Autodesk.' },
    ],

    stepsTitle: 'Как это работает',
    steps: [
      { t: 'Оставляете заявку', d: 'На сайте или в WhatsApp — коротко, что случилось.' },
      { t: 'Смотрим бесплатно', d: 'Находим причину и называем точную цену до начала работы.' },
      { t: 'Ремонтируем', d: 'Простое — при вас за 30–60 минут. Сложное — со сроком заранее.' },
      { t: 'Забираете', d: 'С гарантией на год. Код заявки покажет статус в любой момент.' },
    ],

    faqTitle: 'Частые вопросы',
    faq: [
      {
        q: 'Сколько занимает ремонт?',
        a: 'Замена экрана или батареи — обычно 30–60 минут, можно подождать у нас. Ремонт платы и сложные случаи занимают дольше: точный срок назовём сразу после диагностики.',
      },
      {
        q: 'Диагностика правда бесплатная?',
        a: 'Да. Записываться не нужно, платить за осмотр не нужно, соглашаться на ремонт тоже не обязательно. Скажем, что случилось и сколько будет стоить, — решение за вами.',
      },
      {
        q: 'Какая гарантия?',
        a: 'Год на выполненную работу и установленные запчасти. Если проблема вернётся — приносите, разберёмся без доплат.',
      },
      {
        q: 'Нужно ли записываться заранее?',
        a: 'Нет. Мы работаем ежедневно с 10:00 до 20:00 — приходите в любое удобное время. Заявка на сайте просто экономит время: мы заранее поймём, что готовить.',
      },
      {
        q: 'Телефон упал в воду. Что делать?',
        a: 'Не включайте и не ставьте на зарядку — именно это чаще всего добивает плату. Несите как можно быстрее: чем раньше мы начнём чистку, тем больше шансов спасти устройство.',
      },
      {
        q: 'Вы снимаете блокировку аккаунта?',
        a: 'Да, работаем с iCloud, Google, Samsung, Mi и Huawei ID. Понадобится подтверждение, что устройство ваше, — чек, коробка или документы о покупке.',
      },
    ],

    contactsTitle: 'Где нас найти',
    addressLabel: 'Адрес',
    address: 'ул. Динмухамед Конаев, 35/1, Есильский район, Астана',
    hoursLabel: 'Режим работы',
    hours: 'Ежедневно, 10:00 — 20:00',
    phoneLabel: 'Телефон',
    writeUs: 'Написать в WhatsApp',
    openMap: 'Открыть на 2ГИС',
    ctaBandTitle: 'Готовы починить?',
    ctaBandText: 'Оставьте заявку — перезвоним и назовём срок. Или просто приходите, мы на месте.',

    formTitle: 'Заявка на ремонт',
    formText: 'Заполните форму — перезвоним и назовём срок. Диагностика бесплатная.',
    fName: 'Как вас зовут',
    fPhone: 'Номер телефона',
    fDevice: 'Устройство',
    fDevicePh: 'например: iPhone 13, Samsung A54, MacBook Air',
    fProblem: 'Что случилось',
    fProblemPh: 'Разбит экран, не заряжается, упал в воду…',
    fSubmit: 'Отправить заявку',
    fSending: 'Отправляем…',
    fOkTitle: 'Заявка принята',
    fOkText: 'Перезвоним в рабочее время. Сохраните код — по нему можно проверить статус:',
    fOkCopy: 'Скопировать код',
    fOkCopied: 'Скопировано',
    fOkTrack: 'Проверить статус',
    fOkMore: 'Оставить ещё одну заявку',
    fErr: 'Не получилось отправить. Попробуйте ещё раз или напишите в WhatsApp.',
    fLoginHint: 'Войдите в аккаунт — и все заявки будут храниться в личном кабинете.',

    trackTitle: 'Статус ремонта',
    trackText: 'Введите код из заявки — покажем, на каком этапе ваше устройство.',
    trackPh: 'Например: RS-4821',
    trackBtn: 'Проверить',
    trackNotFound: 'Заявка с таким кодом не найдена. Проверьте код или позвоните нам.',
    trackDevice: 'Устройство',
    trackAccepted: 'Принята',
    trackUpdated: 'Обновлено',
    myTitle: 'Мои заявки',
    myEmpty: 'Здесь пока пусто. Оставьте первую заявку.',
    signOut: 'Выйти',
    orLogin: 'Войдите в аккаунт, чтобы видеть все свои заявки сразу',

    statuses: {
      new: 'Принята',
      diagnostics: 'Диагностика',
      repair: 'В ремонте',
      ready: 'Готово',
      done: 'Выдано',
    },
    statusHints: {
      new: 'Мы получили заявку и скоро свяжемся с вами.',
      diagnostics: 'Мастер ищет причину поломки. Скоро назовём точную цену.',
      repair: 'Устройство в работе.',
      ready: 'Можно забирать — ждём вас с 10:00 до 20:00.',
      done: 'Устройство выдано. Гарантия — один год.',
    },
    repairSteps: {
      accepted: 'Принята',
      diagnosed: 'Диагностика',
      approved: 'Цена согласована',
      repaired: 'Ремонт сделан',
      tested: 'Проверено',
      delivered: 'Выдано клиенту',
    },
    trackProgress: 'Ход ремонта',

    auth: {
      signin: 'Вход',
      signup: 'Регистрация',
      email: 'Email',
      password: 'Пароль (6+ символов)',
      doSignin: 'Войти',
      doSignup: 'Создать аккаунт',
      toSignup: 'Нет аккаунта? Зарегистрироваться',
      toSignin: 'Уже есть аккаунт? Войти',
      checkEmail: 'Готово. Проверьте почту, если нужно подтверждение.',
      failed: 'Что-то пошло не так. Попробуйте ещё раз.',
    },

    report: {
      link: 'Нашли ошибку на сайте?',
      title: 'Сообщить о проблеме',
      text: 'Что-то не открывается, съехало или выглядит неправильно? Напишите — починим.',
      message: 'Что не работает',
      messagePh: 'Например: на телефоне кнопка «Отправить» уезжает за край экрана',
      contact: 'Как с вами связаться (необязательно)',
      contactPh: 'email или телефон',
      send: 'Отправить',
      sending: 'Отправляем…',
      okTitle: 'Спасибо!',
      okText: 'Сообщение получено — разберёмся.',
      close: 'Закрыть',
      failed: 'Не получилось отправить. Попробуйте позже.',
    },

    admin: {
      title: 'Админка',
      signInText: 'Войдите, чтобы управлять заявками.',
      google: 'Войти через Google',
      googleHint: 'Если вход через Google не работает — включите провайдера в Supabase: Authentication → Providers → Google.',
      or: 'или по email',
      noAccess: 'Нет доступа',
      noAccessText:
        'Этот аккаунт не в списке администраторов. Добавьте его user_id в таблицу admins через дашборд Supabase.',
      tabRequests: 'Заявки',
      tabHistory: 'История',
      tabReports: 'Ошибки сайта',
      empty: 'Пока пусто.',
      phone: 'Телефон',
      problem: 'Проблема',
      statusLabel: 'Статус',
      saving: 'Сохраняем…',
      saved: 'Сохранено',
      reportPage: 'Страница',
      reportContact: 'Контакт',
      markDone: 'Отметить решённым',
      doneLabel: 'Решено',
      refresh: 'Обновить',

      statsTotal: 'Всего',
      statsActive: 'В работе',
      search: 'Поиск',
      searchPh: 'Код, имя, телефон или устройство',
      filterStatus: 'Статус',
      filterAll: 'Любой',
      period: 'Период',
      periodDays: 'дней',
      periodAll: 'Всё время',
      nothingFound: 'Ничего не найдено. Измените поиск или период.',
      shown: 'Показано',
      more: 'Показать ещё',

      notes: 'Заметки мастера',
      notesPh: 'Что нашли, какие запчасти нужны, что сказать клиенту…',
      notesSave: 'Сохранить заметку',

      stepsLabel: 'Этапы ремонта',
      pickedUp: 'Выдано',

      photos: 'Фото устройства',
      photoAdd: 'Добавить фото',
      photoUploading: 'Загружаем…',
      photoDelete: 'Удалить',
      photoDeleteAsk: 'Удалить это фото?',

      selected: 'Выбрано',
      bulkStep: 'Отметить этап у выбранных',
      bulkApply: 'Применить',
      clearSel: 'Снять выделение',
    },

    backHome: 'На главную',
    notFound: 'Такой страницы нет',
    notFoundText: 'Возможно, ссылка устарела. Вернитесь на главную — оттуда найдётся всё.',
    footerAbout: 'Сервисный центр по ремонту техники в Астане.',
    footerNav: 'Разделы',
    footerContacts: 'Контакты',
    footerRights: 'Все права защищены.',
  },

  /* ─────────────────────────── Қазақша ─────────────────────────── */
  kk: {
    nav: { home: 'Басты бет', request: 'Өтінім', track: 'Жөндеу күйі' },
    menu: 'Мәзір',

    heroBadge: '2ГИС-те · 1200-ден астам пікір',
    heroTitle: 'Күте тұрғанда жөндейміз',
    heroText:
      'Астанада телефон, планшет, сағат және ноутбук жөндеу. Диагностика тегін әрі жазылусыз — көзіңізше қараймыз.',

    cardTabRepair: 'Жөндеу',
    cardTabTrack: 'Күйін тексеру',
    cardDevice: 'Құрылғы',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'Не болды',
    cardProblemPh: 'Экраны сынған, қуат алмайды…',
    cardGo: 'Бағасын білу',
    cardTrackPh: 'Өтінім коды: RS-4821',
    cardTrackGo: 'Тексеру',
    cardNote: 'Жұмыс уақытында жауап береміз — күн сайын 10:00-ден 20:00-ге дейін.',

    chipsTitle: 'Жиі жөндейтініміз',
    chips: [
      'Экран ауыстыру',
      'Батарея ауыстыру',
      'Қуат алмайды',
      'Суға түсті',
      'Плата жөндеу',
      'Бұғаттан шығару',
      'SSD жаңарту',
      'Windows орнату',
    ],

    promos: [
      {
        eyebrow: 'Жазылусыз',
        t: 'Диагностика тегін әрі ешнәрсеге міндеттемейді',
        d: 'Қалаған уақытта келіңіз. Себебін тауып, нақты бағасын айтамыз. Келіспесеңіз — құрылғыңызды алып кетесіз, ештеңе төлемейсіз.',
        cta: 'Өтінім қалдыру',
      },
      {
        eyebrow: 'Кепілдік',
        t: 'Жұмыс пен бөлшекке бір жыл кепілдік',
        d: 'Базардағы ең арзанын емес, тексерілген бөлшектерді саламыз. Бірдеңе болса — қайта келіңіз, сұрақсыз түзетеміз.',
        cta: 'Қоңырау шалу',
      },
    ],

    servicesTitle: 'Не жөндейміз',
    servicesText: 'Сынған экраннан микросхема дәнекерлеуге дейін — бәрі бір шеберханада.',
    services: [
      {
        icon: 'phone',
        t: 'Смартфон және планшет',
        d: 'Экран, батарея, қуаттау ұясы, камера мен динамик.',
      },
      { icon: 'watch', t: 'Смарт-сағат', d: 'Шыны, аккумулятор, түймелер, құлағаннан кейінгі жөндеу.' },
      {
        icon: 'laptop',
        t: 'Ноутбук және компьютер',
        d: 'Шаңнан тазалау, пернетақта, матрица, қуат тізбегін жөндеу.',
      },
      { icon: 'lock', t: 'Бұғаттан шығару', d: 'Экран және аккаунттар: iCloud, Samsung, Google, Mi, Huawei ID.' },
      { icon: 'drop', t: 'Судан кейін', d: 'Платаны ультрадыбыспен тазалау және қалпына келтіру.' },
      { icon: 'chip', t: 'Плата жөндеу', d: 'Микросхема дәнекерлеу, қуат контроллері, қысқа тұйықталу.' },
      { icon: 'bolt', t: 'Жаңарту', d: 'HDD орнына SSD, көбірек жедел жады, Optibay орнату.' },
      { icon: 'window', t: 'Жүйе орнату', d: 'Windows, macOS, Ubuntu. Office, Adobe, Autodesk.' },
    ],

    stepsTitle: 'Қалай жұмыс істейді',
    steps: [
      { t: 'Өтінім қалдырасыз', d: 'Сайтта немесе WhatsApp-та — не болғанын қысқаша жазасыз.' },
      { t: 'Тегін қараймыз', d: 'Себебін тауып, жұмысқа кіріспес бұрын нақты бағасын айтамыз.' },
      { t: 'Жөндейміз', d: 'Қарапайымын — көзіңізше 30–60 минутта. Күрделісін — мерзімін айтып.' },
      { t: 'Аласыз', d: 'Бір жыл кепілдікпен. Өтінім коды күйін кез келген уақытта көрсетеді.' },
    ],

    faqTitle: 'Жиі қойылатын сұрақтар',
    faq: [
      {
        q: 'Жөндеу қанша уақыт алады?',
        a: 'Экран не батарея ауыстыру — әдетте 30–60 минут, бізде күте тұруға болады. Плата жөндеу мен күрделі жағдайлар ұзағырақ: нақты мерзімді диагностикадан кейін бірден айтамыз.',
      },
      {
        q: 'Диагностика шынымен тегін бе?',
        a: 'Иә. Жазылудың қажеті жоқ, қарағаны үшін төлемейсіз, жөндеуге келісу де міндетті емес. Не болғанын және қанша тұратынын айтамыз — шешім сіздікі.',
      },
      {
        q: 'Кепілдік қандай?',
        a: 'Атқарылған жұмысқа және салынған бөлшектерге бір жыл. Мәселе қайталанса — алып келіңіз, қосымша ақысыз шешеміз.',
      },
      {
        q: 'Алдын ала жазылу керек пе?',
        a: 'Жоқ. Күн сайын 10:00-ден 20:00-ге дейін жұмыс істейміз — қалаған уақытта келіңіз. Сайттағы өтінім уақытты үнемдейді: не дайындау керегін алдын ала білеміз.',
      },
      {
        q: 'Телефон суға түсті. Не істеу керек?',
        a: 'Қоспаңыз және қуаттауға қоймаңыз — көбіне дәл осы платаны біржола бүлдіреді. Мүмкіндігінше тез алып келіңіз: тазалауды неғұрлым ерте бастасақ, құтқару мүмкіндігі соғұрлым жоғары.',
      },
      {
        q: 'Аккаунт бұғатын шешесіздер ме?',
        a: 'Иә, iCloud, Google, Samsung, Mi және Huawei ID-мен жұмыс істейміз. Құрылғының сіздікі екенін растау қажет — чек, қорап немесе сатып алу құжаттары.',
      },
    ],

    contactsTitle: 'Бізді қайдан табасыз',
    addressLabel: 'Мекенжай',
    address: 'Дінмұхамед Қонаев көшесі, 35/1, Есіл ауданы, Астана',
    hoursLabel: 'Жұмыс кестесі',
    hours: 'Күн сайын, 10:00 — 20:00',
    phoneLabel: 'Телефон',
    writeUs: 'WhatsApp-қа жазу',
    openMap: '2ГИС-те ашу',
    ctaBandTitle: 'Жөндеуге дайынсыз ба?',
    ctaBandText: 'Өтінім қалдырыңыз — қоңырау шалып, мерзімін айтамыз. Немесе жай ғана келіңіз, біз орнымыздамыз.',

    formTitle: 'Жөндеуге өтінім',
    formText: 'Форманы толтырыңыз — қоңырау шалып, мерзімін айтамыз. Диагностика тегін.',
    fName: 'Атыңыз кім',
    fPhone: 'Телефон нөмірі',
    fDevice: 'Құрылғы',
    fDevicePh: 'мысалы: iPhone 13, Samsung A54, MacBook Air',
    fProblem: 'Не болды',
    fProblemPh: 'Экраны сынған, қуат алмайды, суға түсті…',
    fSubmit: 'Өтінім жіберу',
    fSending: 'Жіберілуде…',
    fOkTitle: 'Өтінім қабылданды',
    fOkText: 'Жұмыс уақытында қоңырау шаламыз. Кодты сақтаңыз — ол арқылы күйін тексересіз:',
    fOkCopy: 'Кодты көшіру',
    fOkCopied: 'Көшірілді',
    fOkTrack: 'Күйін тексеру',
    fOkMore: 'Тағы бір өтінім қалдыру',
    fErr: 'Жіберілмеді. Қайталап көріңіз немесе WhatsApp-қа жазыңыз.',
    fLoginHint: 'Аккаунтқа кіріңіз — барлық өтінім жеке кабинетте сақталады.',

    trackTitle: 'Жөндеу күйі',
    trackText: 'Өтінімдегі кодты енгізіңіз — құрылғыңыз қай кезеңде екенін көрсетеміз.',
    trackPh: 'Мысалы: RS-4821',
    trackBtn: 'Тексеру',
    trackNotFound: 'Мұндай кодпен өтінім табылмады. Кодты тексеріңіз немесе қоңырау шалыңыз.',
    trackDevice: 'Құрылғы',
    trackAccepted: 'Қабылданды',
    trackUpdated: 'Жаңартылды',
    myTitle: 'Менің өтінімдерім',
    myEmpty: 'Әзірге бос. Алғашқы өтінімді қалдырыңыз.',
    signOut: 'Шығу',
    orLogin: 'Барлық өтінімді бірден көру үшін аккаунтқа кіріңіз',

    statuses: {
      new: 'Қабылданды',
      diagnostics: 'Диагностика',
      repair: 'Жөндеуде',
      ready: 'Дайын',
      done: 'Берілді',
    },
    statusHints: {
      new: 'Өтінімді алдық, жақын арада хабарласамыз.',
      diagnostics: 'Шебер ақаудың себебін іздеп жатыр. Жақында нақты бағасын айтамыз.',
      repair: 'Құрылғы жұмыста.',
      ready: 'Алуға болады — 10:00-ден 20:00-ге дейін күтеміз.',
      done: 'Құрылғы берілді. Кепілдік — бір жыл.',
    },
    repairSteps: {
      accepted: 'Қабылданды',
      diagnosed: 'Диагностика жасалды',
      approved: 'Баға келісілді',
      repaired: 'Жөндеу бітті',
      tested: 'Тексерілді',
      delivered: 'Клиентке берілді',
    },
    trackProgress: 'Жөндеу барысы',

    auth: {
      signin: 'Кіру',
      signup: 'Тіркелу',
      email: 'Email',
      password: 'Құпиясөз (6+ таңба)',
      doSignin: 'Кіру',
      doSignup: 'Аккаунт құру',
      toSignup: 'Аккаунт жоқ па? Тіркеліңіз',
      toSignin: 'Аккаунт бар ма? Кіріңіз',
      checkEmail: 'Дайын. Растау қажет болса, поштаңызды тексеріңіз.',
      failed: 'Бірдеңе дұрыс болмады. Қайталап көріңіз.',
    },

    report: {
      link: 'Сайттан қате таптыңыз ба?',
      title: 'Мәселе туралы хабарлау',
      text: 'Бірдеңе ашылмай тұр, жылжып кеткен немесе дұрыс көрінбей ме? Жазыңыз — түзетеміз.',
      message: 'Не жұмыс істемейді',
      messagePh: 'Мысалы: телефонда «Жіберу» түймесі экраннан шығып кетеді',
      contact: 'Сізбен қалай байланысамыз (міндетті емес)',
      contactPh: 'email немесе телефон',
      send: 'Жіберу',
      sending: 'Жіберілуде…',
      okTitle: 'Рақмет!',
      okText: 'Хабарлама алынды — қарап шығамыз.',
      close: 'Жабу',
      failed: 'Жіберілмеді. Кейінірек қайталап көріңіз.',
    },

    admin: {
      title: 'Әкімші панелі',
      signInText: 'Өтінімдерді басқару үшін кіріңіз.',
      google: 'Google арқылы кіру',
      googleHint: 'Google арқылы кіру жұмыс істемесе — Supabase-те қосыңыз: Authentication → Providers → Google.',
      or: 'немесе email арқылы',
      noAccess: 'Қатынас жоқ',
      noAccessText:
        'Бұл аккаунт әкімшілер тізімінде жоқ. Supabase дашбордындағы admins кестесіне оның user_id-ін қосыңыз.',
      tabRequests: 'Өтінімдер',
      tabHistory: 'Тарих',
      tabReports: 'Сайт қателері',
      empty: 'Әзірге бос.',
      phone: 'Телефон',
      problem: 'Мәселе',
      statusLabel: 'Күйі',
      saving: 'Сақталуда…',
      saved: 'Сақталды',
      reportPage: 'Бет',
      reportContact: 'Байланыс',
      markDone: 'Шешілді деп белгілеу',
      doneLabel: 'Шешілді',
      refresh: 'Жаңарту',

      statsTotal: 'Барлығы',
      statsActive: 'Жұмыста',
      search: 'Іздеу',
      searchPh: 'Код, аты, телефон немесе құрылғы',
      filterStatus: 'Күйі',
      filterAll: 'Кез келген',
      period: 'Кезең',
      periodDays: 'күн',
      periodAll: 'Бүкіл уақыт',
      nothingFound: 'Ештеңе табылмады. Іздеуді немесе кезеңді өзгертіңіз.',
      shown: 'Көрсетілді',
      more: 'Тағы көрсету',

      notes: 'Шебердің жазбалары',
      notesPh: 'Не таптыңыз, қандай бөлшек керек, клиентке не айту керек…',
      notesSave: 'Жазбаны сақтау',

      stepsLabel: 'Жөндеу кезеңдері',
      pickedUp: 'Берілді',

      photos: 'Құрылғы фотосы',
      photoAdd: 'Фото қосу',
      photoUploading: 'Жүктеп жатырмыз…',
      photoDelete: 'Жою',
      photoDeleteAsk: 'Осы фотоны жоясыз ба?',

      selected: 'Таңдалды',
      bulkStep: 'Таңдалғандарға кезең белгілеу',
      bulkApply: 'Қолдану',
      clearSel: 'Таңдауды алып тастау',
    },

    backHome: 'Басты бетке',
    notFound: 'Мұндай бет жоқ',
    notFoundText: 'Сілтеме ескірген болуы мүмкін. Басты бетке оралыңыз — бәрі сол жерден табылады.',
    footerAbout: 'Астанадағы техника жөндеу сервис орталығы.',
    footerNav: 'Бөлімдер',
    footerContacts: 'Байланыс',
    footerRights: 'Барлық құқықтар қорғалған.',
  },

  /* ─────────────────────────── English ─────────────────────────── */
  en: {
    nav: { home: 'Home', request: 'Book a repair', track: 'Track repair' },
    menu: 'Menu',

    heroBadge: 'on 2GIS · more than 1,200 reviews',
    heroTitle: 'Repairs while you wait',
    heroText:
      'Phones, tablets, watches and laptops in Astana. Diagnostics are free and need no appointment — we look at your device with you.',

    cardTabRepair: 'Repair',
    cardTabTrack: 'Track repair',
    cardDevice: 'Device',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'What happened',
    cardProblemPh: 'Cracked screen, won’t charge…',
    cardGo: 'Get a price',
    cardTrackPh: 'Repair code: RS-4821',
    cardTrackGo: 'Check',
    cardNote: 'We reply during opening hours — every day, 10:00 to 20:00.',

    chipsTitle: 'What we fix most',
    chips: [
      'Screen replacement',
      'Battery replacement',
      'Won’t charge',
      'Water damage',
      'Board repair',
      'Account unlock',
      'SSD upgrade',
      'Windows install',
    ],

    promos: [
      {
        eyebrow: 'No appointment',
        t: 'Diagnostics are free, and you owe us nothing',
        d: 'Walk in whenever suits you. We find the cause and quote an exact price. Not happy with it? Take your device and pay nothing.',
        cta: 'Book a repair',
      },
      {
        eyebrow: 'Warranty',
        t: 'One year on labour and parts',
        d: 'We fit tested components, not the cheapest thing on the market. If something goes wrong, bring it back and we sort it out — no argument.',
        cta: 'Call us',
      },
    ],

    servicesTitle: 'What we repair',
    servicesText: 'From a cracked screen to microsoldering — all in one workshop.',
    services: [
      {
        icon: 'phone',
        t: 'Phones and tablets',
        d: 'Screens, batteries, charging ports, cameras and speakers.',
      },
      { icon: 'watch', t: 'Smart watches', d: 'Glass, battery, buttons, and repairs after a drop.' },
      {
        icon: 'laptop',
        t: 'Laptops and desktops',
        d: 'Dust cleaning, keyboards, displays and power circuitry.',
      },
      { icon: 'lock', t: 'Unlocking', d: 'Screens and accounts: iCloud, Samsung, Google, Mi, Huawei ID.' },
      { icon: 'drop', t: 'Water damage', d: 'Ultrasonic board cleaning and recovery of soaked devices.' },
      { icon: 'chip', t: 'Board repair', d: 'Microsoldering, power controllers, short-circuit hunting.' },
      { icon: 'bolt', t: 'Upgrades', d: 'SSD instead of HDD, more memory, Optibay installation.' },
      { icon: 'window', t: 'Software', d: 'Windows, macOS, Ubuntu. Office, Adobe, Autodesk.' },
    ],

    stepsTitle: 'How it works',
    steps: [
      { t: 'Send a request', d: 'Through the site or WhatsApp — just tell us what went wrong.' },
      { t: 'We look, free', d: 'We find the cause and quote the exact price before any work starts.' },
      { t: 'We repair it', d: 'Simple jobs in 30–60 minutes while you wait. Complex ones with a timeline agreed upfront.' },
      { t: 'You collect it', d: 'With a one-year warranty. Your repair code shows the status any time.' },
    ],

    faqTitle: 'Common questions',
    faq: [
      {
        q: 'How long does a repair take?',
        a: 'A screen or battery replacement usually takes 30–60 minutes and you can wait here. Board-level work and complicated cases take longer — we give you an exact timeline right after diagnostics.',
      },
      {
        q: 'Are diagnostics really free?',
        a: 'Yes. No appointment, no charge for looking, and no obligation to go ahead. We tell you what is wrong and what it costs — the decision is yours.',
      },
      {
        q: 'What warranty do I get?',
        a: 'One year on the work we do and the parts we fit. If the problem comes back, bring the device in and we deal with it at no extra cost.',
      },
      {
        q: 'Do I need to book ahead?',
        a: 'No. We are open every day from 10:00 to 20:00 — come whenever it suits you. A request on the site just saves time, because we know in advance what to prepare.',
      },
      {
        q: 'My phone got wet. What should I do?',
        a: 'Do not switch it on and do not put it on charge — that is what usually finishes off the board. Bring it in as fast as you can: the sooner we start cleaning, the better the chances of saving it.',
      },
      {
        q: 'Can you unlock an account?',
        a: 'Yes — we work with iCloud, Google, Samsung, Mi and Huawei ID. You will need to show the device is yours: a receipt, the box, or proof of purchase.',
      },
    ],

    contactsTitle: 'Where to find us',
    addressLabel: 'Address',
    address: '35/1 Dinmukhamed Konayev Street, Yesil district, Astana',
    hoursLabel: 'Opening hours',
    hours: 'Every day, 10:00 — 20:00',
    phoneLabel: 'Phone',
    writeUs: 'Message us on WhatsApp',
    openMap: 'Open in 2GIS',
    ctaBandTitle: 'Ready to get it fixed?',
    ctaBandText: 'Send a request and we will call you back with a timeline. Or just walk in — we are here.',

    formTitle: 'Book a repair',
    formText: 'Fill in the form and we will call you back with a timeline. Diagnostics are free.',
    fName: 'Your name',
    fPhone: 'Phone number',
    fDevice: 'Device',
    fDevicePh: 'e.g. iPhone 13, Samsung A54, MacBook Air',
    fProblem: 'What happened',
    fProblemPh: 'Cracked screen, won’t charge, fell in water…',
    fSubmit: 'Send request',
    fSending: 'Sending…',
    fOkTitle: 'Request received',
    fOkText: 'We will call you back during opening hours. Save this code — it shows your repair status:',
    fOkCopy: 'Copy code',
    fOkCopied: 'Copied',
    fOkTrack: 'Track repair',
    fOkMore: 'Send another request',
    fErr: 'That did not send. Please try again, or message us on WhatsApp.',
    fLoginHint: 'Sign in and every request you send is kept in your account.',

    trackTitle: 'Track your repair',
    trackText: 'Enter the code from your request and we will show you where your device is.',
    trackPh: 'e.g. RS-4821',
    trackBtn: 'Check',
    trackNotFound: 'No repair found with that code. Check the code, or give us a call.',
    trackDevice: 'Device',
    trackAccepted: 'Received',
    trackUpdated: 'Updated',
    myTitle: 'My repairs',
    myEmpty: 'Nothing here yet. Send your first request.',
    signOut: 'Sign out',
    orLogin: 'Sign in to see all of your repairs in one place',

    statuses: {
      new: 'Received',
      diagnostics: 'Diagnostics',
      repair: 'In repair',
      ready: 'Ready',
      done: 'Collected',
    },
    statusHints: {
      new: 'We have your request and will be in touch shortly.',
      diagnostics: 'A technician is finding the cause. We will quote an exact price soon.',
      repair: 'Your device is on the bench.',
      ready: 'Ready to collect — we are open 10:00 to 20:00.',
      done: 'Device collected. Warranty runs for one year.',
    },
    repairSteps: {
      accepted: 'Accepted',
      diagnosed: 'Diagnosed',
      approved: 'Price approved',
      repaired: 'Repaired',
      tested: 'Tested',
      delivered: 'Handed over',
    },
    trackProgress: 'Repair progress',

    auth: {
      signin: 'Sign in',
      signup: 'Create account',
      email: 'Email',
      password: 'Password (6+ characters)',
      doSignin: 'Sign in',
      doSignup: 'Create account',
      toSignup: 'No account yet? Create one',
      toSignin: 'Already have an account? Sign in',
      checkEmail: 'Done. Check your email if confirmation is needed.',
      failed: 'Something went wrong. Please try again.',
    },

    report: {
      link: 'Found a problem on this site?',
      title: 'Report a problem',
      text: 'Something not loading, out of place, or just looking wrong? Tell us and we will fix it.',
      message: 'What is not working',
      messagePh: 'For example: on my phone the Send button runs off the edge of the screen',
      contact: 'How to reach you (optional)',
      contactPh: 'email or phone',
      send: 'Send',
      sending: 'Sending…',
      okTitle: 'Thank you',
      okText: 'We have your message and will look into it.',
      close: 'Close',
      failed: 'That did not send. Please try again later.',
    },

    admin: {
      title: 'Admin',
      signInText: 'Sign in to manage repair requests.',
      google: 'Sign in with Google',
      googleHint: 'If Google sign-in fails, enable the provider in Supabase: Authentication → Providers → Google.',
      or: 'or with email',
      noAccess: 'No access',
      noAccessText:
        'This account is not on the admin list. Add its user_id to the admins table in the Supabase dashboard.',
      tabRequests: 'Repair requests',
      tabHistory: 'History',
      tabReports: 'Site problems',
      empty: 'Nothing here yet.',
      phone: 'Phone',
      problem: 'Problem',
      statusLabel: 'Status',
      saving: 'Saving…',
      saved: 'Saved',
      reportPage: 'Page',
      reportContact: 'Contact',
      markDone: 'Mark as done',
      doneLabel: 'Done',
      refresh: 'Refresh',

      statsTotal: 'Total',
      statsActive: 'In progress',
      search: 'Search',
      searchPh: 'Code, name, phone or device',
      filterStatus: 'Status',
      filterAll: 'Any',
      period: 'Period',
      periodDays: 'days',
      periodAll: 'All time',
      nothingFound: 'Nothing found. Try a different search or period.',
      shown: 'Showing',
      more: 'Show more',

      notes: 'Technician notes',
      notesPh: 'What you found, parts needed, what to tell the customer…',
      notesSave: 'Save note',

      stepsLabel: 'Repair steps',
      pickedUp: 'Collected',

      photos: 'Device photos',
      photoAdd: 'Add photo',
      photoUploading: 'Uploading…',
      photoDelete: 'Delete',
      photoDeleteAsk: 'Delete this photo?',

      selected: 'Selected',
      bulkStep: 'Mark step on selected',
      bulkApply: 'Apply',
      clearSel: 'Clear selection',
    },

    backHome: 'Back to home',
    notFound: 'This page does not exist',
    notFoundText: 'The link may be out of date. Head back to the home page and you will find everything from there.',
    footerAbout: 'Device repair service centre in Astana.',
    footerNav: 'Sections',
    footerContacts: 'Contact',
    footerRights: 'All rights reserved.',
  },
};

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({
  lang: 'ru',
  setLang: () => {},
});

// Короткий хелпер: const { t, lang, setLang } = useLang();
export function useLang() {
  const { lang, setLang } = useContext(LangContext);
  return { t: DICT[lang], lang, setLang };
}
