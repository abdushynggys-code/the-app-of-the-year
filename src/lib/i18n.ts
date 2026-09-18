import type { DealKind } from './deals';
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

  heroTitle: string;
  heroText: string;

  proofEyebrow: string;
  proofReviews: string;
  proofTitle: string;
  proof: Pair[];

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

  // Полоса со скидками. Сами скидки объявляет владелец в админке —
  // тут только подписи вокруг них.
  dealsEyebrow: string;
  dealsUntil: string;
  kinds: Record<DealKind, string>;

  promos: Promo[];

  brandsEyebrow: string;
  brandsTitle: string;
  brandsText: string;

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
  fEmail: string;
  fEmailPh: string;
  fEmailHint: string;
  fDevice: string;
  fDevicePh: string;
  fModel: string;
  fModelPh: string;
  fModelHint: string;
  fProblem: string;
  fProblemPh: string;
  fSubmit: string;
  fSending: string;
  fOkTitle: string;
  fOkText: string;
  fOkCopy: string;
  fOkCopied: string;
  fOkTrack: string;
  fOkAccount: string;
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

  fLoginTitle: string;
  fLoginWhy: string;

  auth: {
    google: string;
    googleHint: string;
    or: string;
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
    email: string;
    model: string;
    problem: string;
    waSend: string;
    waReady: string;
    waWork: string;
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
    stepUndoAsk: string;
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

    tabAccess: string;
    requestAccess: string;
    requestSending: string;
    pendingTitle: string;
    pendingText: string;
    accessPending: string;
    accessAdmins: string;
    approve: string;
    reject: string;
    revoke: string;
    revokeAsk: string;
    roleOwner: string;
    roleAdmin: string;
    you: string;
    transferTitle: string;
    transferText: string;
    transferBtn: string;
    transferAsk: string;
    demoteBtn: string;
    demoteAsk: string;
    allowlistTitle: string;
    allowlistText: string;
    allowlistPh: string;
    allowlistAdd: string;
    allowlistAdding: string;
    allowlistEmpty: string;
    allowlistRemove: string;
    allowlistRemoveAsk: string;
    noPending: string;

    tabDeals: string;
    dealsHint: string;
    dealPercent: string;
    dealKinds: string;
    dealNote: string;
    dealNotePh: string;
    dealEnds: string;
    dealEndsHint: string;
    dealAdd: string;
    dealAdding: string;
    dealEmpty: string;
    dealPickKind: string;
    dealOn: string;
    dealOff: string;
    dealHidden: string;
    dealExpired: string;
    dealDelete: string;
    dealDeleteAsk: string;
    dealNoTable: string;
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

    heroTitle: 'Сломалось? Посмотрим бесплатно',
    heroText:
      'Смартфоны, планшеты, часы и ноутбуки в Астане. Без записи, каждый день с 10:00 до 20:00.',

    proofEyebrow: 'Оценка на 2ГИС',
    proofReviews: 'отзывов',
    proofTitle: 'Цену вы узнаёте до ремонта, а не после',
    proof: [
      {
        t: 'Осмотр ничего не стоит',
        d: 'Приходите без записи. Найдём причину и назовём точную сумму. Передумаете — заберёте устройство и не заплатите ничего.',
      },
      {
        t: 'Год гарантии',
        d: 'И на саму деталь, и на работу мастера. Вернётся та же поломка в течение года — принесите, доделаем без доплат.',
      },
      {
        t: '30–60 минут при вас',
        d: 'Экран и батарею меняем, пока вы ждёте. По сложному ремонту назовём срок сразу после диагностики.',
      },
      {
        t: 'Видно каждый этап',
        d: 'Оставите заявку на сайте — придёт код. По нему в любой момент видно, где сейчас ваше устройство.',
      },
    ],

    cardTabRepair: 'Ремонт',
    cardTabTrack: 'Проверить статус',
    cardDevice: 'Устройство',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'Что случилось',
    cardProblemPh: 'Разбит экран, не заряжается…',
    cardGo: 'Узнать цену',
    cardTrackPh: 'Код заявки: RS-482170',
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

    dealsEyebrow: 'Сейчас со скидкой',
    dealsUntil: 'до',
    kinds: {
      phone: 'Смартфоны',
      tablet: 'Планшеты',
      watch: 'Часы',
      laptop: 'Ноутбуки',
      pc: 'Компьютеры',
      monitor: 'Мониторы',
    },

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

    brandsEyebrow: 'Марки',
    brandsTitle: 'С какой техникой работаем',
    brandsText: 'Не нашли свою марку — позвоните или напишите, посмотрим.',

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
    ctaBandTitle: 'Принесите — разберёмся',
    ctaBandText:
      'Оставьте заявку, и мы перезвоним. Или просто заходите: Конаева 35/1, каждый день с 10:00 до 20:00.',

    formTitle: 'Заявка на ремонт',
    formText: 'Заполните форму — перезвоним и назовём срок. Диагностика бесплатная.',
    fName: 'Как вас зовут',
    fPhone: 'Номер телефона',
    fEmail: 'Почта (необязательно)',
    fEmailPh: 'name@mail.kz',
    fEmailHint: 'Если в ремонт едет сам телефон — напишем на почту.',
    fDevice: 'Устройство',
    fDevicePh: 'iPhone, Samsung, MacBook, Xiaomi…',
    fModel: 'Модель',
    fModelPh: '13 Pro, A54, Air M2, Redmi Note 12…',
    fModelHint: 'Модель важна: от неё зависят запчасть и цена. Она есть в настройках, в разделе «Об устройстве».',
    fProblem: 'Что случилось',
    fProblemPh: 'Разбит экран, не заряжается, упал в воду…',
    fSubmit: 'Отправить заявку',
    fSending: 'Отправляем…',
    fOkTitle: 'Заявка принята',
    fOkText: 'Перезвоним в рабочее время. Сохраните код — по нему можно проверить статус:',
    fOkCopy: 'Скопировать код',
    fOkCopied: 'Скопировано',
    fOkTrack: 'Проверить статус',
    fOkAccount:
      'Код можно потерять, аккаунт — нет. Войдите под этой почтой на любом устройстве, и ремонт найдётся сам:',
    fOkMore: 'Оставить ещё одну заявку',
    fErr: 'Не получилось отправить. Попробуйте ещё раз или напишите в WhatsApp.',
    fLoginHint: 'Войдите в аккаунт — и все заявки будут храниться в личном кабинете.',

    trackTitle: 'Статус ремонта',
    trackText: 'Введите код из заявки — покажем, на каком этапе ваше устройство.',
    trackPh: 'Например: RS-482170',
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

    fLoginTitle: 'Сначала войдите',
    fLoginWhy:
      'Тогда все ваши ремонты будут в одном месте — с любого телефона и компьютера. Статус по коду можно смотреть и без входа.',

    auth: {
      google: 'Войти через Google',
      googleHint: 'Вход через Google сейчас недоступен. Попробуйте по почте и паролю.',
      or: 'или',
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
        'Нажмите кнопку ниже — владелец получит запрос и сможет открыть доступ.',
      tabRequests: 'Заявки',
      tabHistory: 'История',
      tabReports: 'Ошибки сайта',
      empty: 'Пока пусто.',
      phone: 'Телефон',
      email: 'Почта',
      model: 'Модель',
      problem: 'Проблема',
      waSend: 'Написать в WhatsApp',
      waReady:
        'Здравствуйте, {name}! Ваш {device} готов — можно забирать. Мы на Конаева 35/1, ежедневно с 10:00 до 20:00. Код заявки {code}.',
      waWork:
        'Здравствуйте, {name}! Пишем по заявке {code} — {device}.',
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
      stepUndoAsk:
        'Снять этот этап и все следующие за ним? У клиента полоска ремонта откатится назад.',
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

      tabAccess: 'Доступы',
      requestAccess: 'Запросить доступ',
      requestSending: 'Отправляем…',
      pendingTitle: 'Ждём подтверждения',
      pendingText: 'Запрос ушёл владельцу. Как только он одобрит, админка откроется — обновите страницу.',
      accessPending: 'Запросы на доступ',
      accessAdmins: 'У кого есть доступ',
      approve: 'Одобрить',
      reject: 'Отклонить',
      revoke: 'Забрать доступ',
      revokeAsk: 'Забрать доступ у этого человека?',
      roleOwner: 'Владелец',
      roleAdmin: 'Админ',
      you: 'это вы',
      transferTitle: 'Владельцы',
      transferText: 'Владельцы одобряют доступы, ведут белый список и назначают других владельцев. Последнего владельца снять нельзя.',
      transferBtn: 'Сделать владельцем',
      transferAsk: 'Сделать этого человека владельцем? Он сможет одобрять доступы и назначать других владельцев.',
      demoteBtn: 'Снять владельца',
      demoteAsk: 'Снять роль владельца с этого человека?',
      allowlistTitle: 'Белый список',
      allowlistText: 'Кто в списке — заходит сразу, без одобрения. Если у человека уже есть аккаунт, доступ откроется тут же.',
      allowlistPh: 'почта@пример.kz',
      allowlistAdd: 'Добавить',
      allowlistAdding: 'Добавляем…',
      allowlistEmpty: 'Список пуст.',
      allowlistRemove: 'Убрать',
      allowlistRemoveAsk: 'Убрать email из списка? У того, кто уже вошёл, доступ останется — его забирают отдельно.',
      noPending: 'Новых запросов нет.',

      tabDeals: 'Скидки',
      dealsHint: 'Скидка появится на главной странице сайта, как только вы её объявите.',
      dealPercent: 'Скидка, %',
      dealKinds: 'На что',
      dealNote: 'Приписка',
      dealNotePh: 'При замене экрана',
      dealEnds: 'Последний день',
      dealEndsHint: 'Можно не указывать — тогда скидка бессрочная.',
      dealAdd: 'Объявить скидку',
      dealAdding: 'Объявляем…',
      dealEmpty: 'Скидок пока нет.',
      dealPickKind: 'Отметьте хотя бы один вид техники.',
      dealOn: 'Включить',
      dealOff: 'Выключить',
      dealHidden: 'выключена',
      dealExpired: 'срок вышел',
      dealDelete: 'Удалить',
      dealDeleteAsk: 'Удалить эту скидку? Вернуть её можно будет только заново.',
      dealNoTable: 'Таблица скидок ещё не создана в базе. Выполните в терминале: npm run db:push',
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

    heroTitle: 'Сынды ма? Тегін қараймыз',
    heroText:
      'Астанада смартфон, планшет, сағат және ноутбук. Жазылусыз, күн сайын 10:00-ден 20:00-ге дейін.',

    proofEyebrow: '2ГИС-тегі баға',
    proofReviews: 'пікір',
    proofTitle: 'Бағаны жөндеуден кейін емес, бұрын білесіз',
    proof: [
      {
        t: 'Қарау тегін',
        d: 'Жазылусыз келе беріңіз. Себебін тауып, нақты сомасын айтамыз. Ойыңыз өзгерсе — құрылғыңызды алып кетесіз, ештеңе төлемейсіз.',
      },
      {
        t: 'Бір жыл кепілдік',
        d: 'Бөлшекке де, шебердің жұмысына да. Сол ақау жыл ішінде қайталанса — әкеліңіз, қосымша ақысыз түзетеміз.',
      },
      {
        t: 'Көзіңізше 30–60 минут',
        d: 'Экран мен батареяны сіз күте тұрғанда ауыстырамыз. Күрделі жөндеудің мерзімін диагностикадан кейін бірден айтамыз.',
      },
      {
        t: 'Әр кезең көрініп тұрады',
        d: 'Сайтқа өтінім қалдырсаңыз — код келеді. Сол код арқылы құрылғыңыз қазір қай кезеңде екенін көресіз.',
      },
    ],

    cardTabRepair: 'Жөндеу',
    cardTabTrack: 'Күйін тексеру',
    cardDevice: 'Құрылғы',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'Не болды',
    cardProblemPh: 'Экраны сынған, қуат алмайды…',
    cardGo: 'Бағасын білу',
    cardTrackPh: 'Өтінім коды: RS-482170',
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

    dealsEyebrow: 'Қазір жеңілдікпен',
    dealsUntil: 'дейін',
    kinds: {
      phone: 'Смартфондар',
      tablet: 'Планшеттер',
      watch: 'Сағаттар',
      laptop: 'Ноутбуктер',
      pc: 'Компьютерлер',
      monitor: 'Мониторлар',
    },

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

    brandsEyebrow: 'Маркалар',
    brandsTitle: 'Қандай техникамен жұмыс істейміз',
    brandsText: 'Өз маркаңызды таппасаңыз — қоңырау шалыңыз немесе жазыңыз, қарап береміз.',

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
    ctaBandTitle: 'Әкеліңіз — қарап шығамыз',
    ctaBandText:
      'Өтінім қалдырыңыз, қоңырау шаламыз. Немесе жай ғана кіріңіз: Қонаев 35/1, күн сайын 10:00-ден 20:00-ге дейін.',

    formTitle: 'Жөндеуге өтінім',
    formText: 'Форманы толтырыңыз — қоңырау шалып, мерзімін айтамыз. Диагностика тегін.',
    fName: 'Атыңыз кім',
    fPhone: 'Телефон нөмірі',
    fEmail: 'Пошта (міндетті емес)',
    fEmailPh: 'name@mail.kz',
    fEmailHint: 'Жөндеуге телефонның өзі түссе — поштаға жазамыз.',
    fDevice: 'Құрылғы',
    fDevicePh: 'iPhone, Samsung, MacBook, Xiaomi…',
    fModel: 'Моделі',
    fModelPh: '13 Pro, A54, Air M2, Redmi Note 12…',
    fModelHint: 'Моделі маңызды: бөлшек пен баға соған байланысты. Ол параметрлердегі «Құрылғы туралы» бөлімінде жазылған.',
    fProblem: 'Не болды',
    fProblemPh: 'Экраны сынған, қуат алмайды, суға түсті…',
    fSubmit: 'Өтінім жіберу',
    fSending: 'Жіберілуде…',
    fOkTitle: 'Өтінім қабылданды',
    fOkText: 'Жұмыс уақытында қоңырау шаламыз. Кодты сақтаңыз — ол арқылы күйін тексересіз:',
    fOkCopy: 'Кодты көшіру',
    fOkCopied: 'Көшірілді',
    fOkTrack: 'Күйін тексеру',
    fOkAccount:
      'Кодты жоғалтып алуға болады, аккаунтты — жоқ. Кез келген құрылғыда осы поштамен кіріңіз, жөндеу өзі табылады:',
    fOkMore: 'Тағы бір өтінім қалдыру',
    fErr: 'Жіберілмеді. Қайталап көріңіз немесе WhatsApp-қа жазыңыз.',
    fLoginHint: 'Аккаунтқа кіріңіз — барлық өтінім жеке кабинетте сақталады.',

    trackTitle: 'Жөндеу күйі',
    trackText: 'Өтінімдегі кодты енгізіңіз — құрылғыңыз қай кезеңде екенін көрсетеміз.',
    trackPh: 'Мысалы: RS-482170',
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

    fLoginTitle: 'Алдымен кіріңіз',
    fLoginWhy:
      'Сонда барлық жөндеулеріңіз бір жерде болады — кез келген телефон мен компьютерден. Код арқылы күйін кірмей-ақ көруге болады.',

    auth: {
      google: 'Google арқылы кіру',
      googleHint: 'Google арқылы кіру қазір қолжетімсіз. Пошта мен құпиясөзді қолданып көріңіз.',
      or: 'немесе',
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
        'Төмендегі түймені басыңыз — иесі сұрау алып, рұқсат аша алады.',
      tabRequests: 'Өтінімдер',
      tabHistory: 'Тарих',
      tabReports: 'Сайт қателері',
      empty: 'Әзірге бос.',
      phone: 'Телефон',
      email: 'Пошта',
      model: 'Моделі',
      problem: 'Мәселе',
      waSend: 'WhatsApp-қа жазу',
      waReady:
        'Сәлеметсіз бе, {name}! {device} дайын — ала кетуіңізге болады. Біз Қонаев 35/1 мекенжайындамыз, күн сайын 10:00-ден 20:00-ге дейін. Өтінім коды {code}.',
      waWork:
        'Сәлеметсіз бе, {name}! {code} өтінімі бойынша жазып отырмыз — {device}.',
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
      stepUndoAsk:
        'Осы кезеңді және одан кейінгілерін алып тастайсыз ба? Клиенттегі жолақ артқа қайтады.',
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

      tabAccess: 'Рұқсаттар',
      requestAccess: 'Рұқсат сұрау',
      requestSending: 'Жіберіп жатырмыз…',
      pendingTitle: 'Растауды күтудеміз',
      pendingText: 'Сұрау иесіне жіберілді. Ол мақұлдаған бойда админ ашылады — бетті жаңартыңыз.',
      accessPending: 'Рұқсат сұраулары',
      accessAdmins: 'Кімде рұқсат бар',
      approve: 'Мақұлдау',
      reject: 'Бас тарту',
      revoke: 'Рұқсатты алу',
      revokeAsk: 'Бұл адамның рұқсатын аласыз ба?',
      roleOwner: 'Иесі',
      roleAdmin: 'Әкімші',
      you: 'бұл сіз',
      transferTitle: 'Иелер',
      transferText: 'Иелер рұқсаттарды мақұлдайды, ақ тізімді жүргізеді және басқа иелерді тағайындайды. Соңғы иені алып тастауға болмайды.',
      transferBtn: 'Иесі ету',
      transferAsk: 'Бұл адамды иесі етесіз бе? Ол рұқсат мақұлдап, басқа иелерді тағайындай алады.',
      demoteBtn: 'Иелікті алу',
      demoteAsk: 'Бұл адамнан иелік рөлін аласыз ба?',
      allowlistTitle: 'Ақ тізім',
      allowlistText: 'Тізімдегілер мақұлдаусыз бірден кіреді. Аккаунты бар болса, рұқсат сол сәтте ашылады.',
      allowlistPh: 'пошта@мысал.kz',
      allowlistAdd: 'Қосу',
      allowlistAdding: 'Қосып жатырмыз…',
      allowlistEmpty: 'Тізім бос.',
      allowlistRemove: 'Алып тастау',
      allowlistRemoveAsk: 'Email-ды тізімнен аласыз ба? Кіріп қойған адамның рұқсаты қалады — оны бөлек алады.',
      noPending: 'Жаңа сұраулар жоқ.',

      tabDeals: 'Жеңілдіктер',
      dealsHint: 'Жеңілдікті жарияласаңыз, ол сайттың басты бетінде көрінеді.',
      dealPercent: 'Жеңілдік, %',
      dealKinds: 'Не үшін',
      dealNote: 'Қосымша жазба',
      dealNotePh: 'Экран ауыстырғанда',
      dealEnds: 'Соңғы күні',
      dealEndsHint: 'Көрсетпесе де болады — онда жеңілдік мерзімсіз.',
      dealAdd: 'Жеңілдік жариялау',
      dealAdding: 'Жариялап жатырмыз…',
      dealEmpty: 'Әзірге жеңілдік жоқ.',
      dealPickKind: 'Кемінде бір техника түрін белгілеңіз.',
      dealOn: 'Қосу',
      dealOff: 'Өшіру',
      dealHidden: 'өшірулі',
      dealExpired: 'мерзімі бітті',
      dealDelete: 'Жою',
      dealDeleteAsk: 'Бұл жеңілдікті жоясыз ба? Қайтару үшін қайта жариялау керек.',
      dealNoTable: 'Жеңілдіктер кестесі базада әлі жоқ. Терминалда орындаңыз: npm run db:push',
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

    heroTitle: 'Broken? We will look for free',
    heroText:
      'Phones, tablets, watches and laptops in Astana. No appointment, every day from 10:00 to 20:00.',

    proofEyebrow: 'Rated on 2GIS',
    proofReviews: 'reviews',
    proofTitle: 'You learn the price before the repair, not after',
    proof: [
      {
        t: 'Looking costs you nothing',
        d: 'Walk in without an appointment. We find the cause and quote the exact sum. Change your mind and you take the device home having paid nothing.',
      },
      {
        t: 'One year of warranty',
        d: 'On the part and on the work alike. If the same fault returns within the year, bring it in and we put it right at no extra cost.',
      },
      {
        t: '30 to 60 minutes, in front of you',
        d: 'We change a screen or a battery while you wait. For a complex repair we give the timeline right after diagnostics.',
      },
      {
        t: 'You see every stage',
        d: 'Leave a request on the site and a code arrives. It shows where your device is at any moment.',
      },
    ],

    cardTabRepair: 'Repair',
    cardTabTrack: 'Track repair',
    cardDevice: 'Device',
    cardDevicePh: 'iPhone 13, MacBook Air…',
    cardProblem: 'What happened',
    cardProblemPh: 'Cracked screen, won’t charge…',
    cardGo: 'Get a price',
    cardTrackPh: 'Repair code: RS-482170',
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

    dealsEyebrow: 'On discount now',
    dealsUntil: 'until',
    kinds: {
      phone: 'Phones',
      tablet: 'Tablets',
      watch: 'Watches',
      laptop: 'Laptops',
      pc: 'Computers',
      monitor: 'Monitors',
    },

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

    brandsEyebrow: 'Makes',
    brandsTitle: 'What we work with',
    brandsText: 'Do not see yours? Call or message us and we will take a look.',

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
    ctaBandTitle: 'Bring it in and we will look',
    ctaBandText:
      'Leave a request and we will call you back. Or just walk in: Konaev 35/1, every day from 10:00 to 20:00.',

    formTitle: 'Book a repair',
    formText: 'Fill in the form and we will call you back with a timeline. Diagnostics are free.',
    fName: 'Your name',
    fPhone: 'Phone number',
    fEmail: 'Email (optional)',
    fEmailPh: 'name@mail.kz',
    fEmailHint: 'If the phone itself is being repaired, we will write to you instead.',
    fDevice: 'Device',
    fDevicePh: 'iPhone, Samsung, MacBook, Xiaomi…',
    fModel: 'Model',
    fModelPh: '13 Pro, A54, Air M2, Redmi Note 12…',
    fModelHint: 'The model decides the part and the price. You will find it in Settings, under About.',
    fProblem: 'What happened',
    fProblemPh: 'Cracked screen, won’t charge, fell in water…',
    fSubmit: 'Send request',
    fSending: 'Sending…',
    fOkTitle: 'Request received',
    fOkText: 'We will call you back during opening hours. Save this code — it shows your repair status:',
    fOkCopy: 'Copy code',
    fOkCopied: 'Copied',
    fOkTrack: 'Track repair',
    fOkAccount:
      'Codes get lost, accounts do not. Sign in with this email on any device and the repair will be waiting:',
    fOkMore: 'Send another request',
    fErr: 'That did not send. Please try again, or message us on WhatsApp.',
    fLoginHint: 'Sign in and every request you send is kept in your account.',

    trackTitle: 'Track your repair',
    trackText: 'Enter the code from your request and we will show you where your device is.',
    trackPh: 'e.g. RS-482170',
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

    fLoginTitle: 'Sign in first',
    fLoginWhy:
      'Then all your repairs stay in one place, on any phone or computer. You can still check a status by code without signing in.',

    auth: {
      google: 'Continue with Google',
      googleHint: 'Google sign-in is unavailable right now. Try email and password instead.',
      or: 'or',
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
        'Press the button below — the owner receives your request and can open access.',
      tabRequests: 'Repair requests',
      tabHistory: 'History',
      tabReports: 'Site problems',
      empty: 'Nothing here yet.',
      phone: 'Phone',
      email: 'Email',
      model: 'Model',
      problem: 'Problem',
      waSend: 'Message on WhatsApp',
      waReady:
        'Hello {name}! Your {device} is ready for pickup. We are at Konaev 35/1, every day from 10:00 to 20:00. Request code {code}.',
      waWork:
        'Hello {name}! Writing about request {code} — {device}.',
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
      stepUndoAsk:
        'Untick this step and every step after it? The progress bar rolls back for the customer.',
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

      tabAccess: 'Access',
      requestAccess: 'Request access',
      requestSending: 'Sending…',
      pendingTitle: 'Waiting for approval',
      pendingText: 'Your request went to the owner. The panel opens as soon as they approve it — refresh the page.',
      accessPending: 'Access requests',
      accessAdmins: 'Who has access',
      approve: 'Approve',
      reject: 'Reject',
      revoke: 'Revoke access',
      revokeAsk: 'Revoke this person access?',
      roleOwner: 'Owner',
      roleAdmin: 'Admin',
      you: 'you',
      transferTitle: 'Owners',
      transferText: 'Owners approve access, keep the allowlist and appoint other owners. The last owner cannot be stepped down.',
      transferBtn: 'Make owner',
      transferAsk: 'Make this person an owner? They will be able to approve access and appoint other owners.',
      demoteBtn: 'Remove owner role',
      demoteAsk: 'Remove the owner role from this person?',
      allowlistTitle: 'Allowlist',
      allowlistText: 'Anyone on this list gets in straight away, with no approval. If they already have an account, access opens immediately.',
      allowlistPh: 'name@example.kz',
      allowlistAdd: 'Add',
      allowlistAdding: 'Adding…',
      allowlistEmpty: 'The list is empty.',
      allowlistRemove: 'Remove',
      allowlistRemoveAsk: 'Remove this email from the list? Anyone already signed in keeps access — revoke that separately.',
      noPending: 'No new requests.',

      tabDeals: 'Deals',
      dealsHint: 'A deal shows up on the site’s front page as soon as you announce it.',
      dealPercent: 'Discount, %',
      dealKinds: 'Applies to',
      dealNote: 'Small print',
      dealNotePh: 'On screen replacement',
      dealEnds: 'Last day',
      dealEndsHint: 'Leave empty and the deal runs until you switch it off.',
      dealAdd: 'Announce deal',
      dealAdding: 'Announcing…',
      dealEmpty: 'No deals yet.',
      dealPickKind: 'Tick at least one kind of device.',
      dealOn: 'Switch on',
      dealOff: 'Switch off',
      dealHidden: 'switched off',
      dealExpired: 'expired',
      dealDelete: 'Delete',
      dealDeleteAsk: 'Delete this deal? Bringing it back means announcing it again.',
      dealNoTable: 'The deals table is not in the database yet. Run in the terminal: npm run db:push',
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
