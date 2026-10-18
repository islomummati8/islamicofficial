const CACHE_KEY = 'islamic-official-currency-rates-v1';
const FAVORITES_KEY = 'islamic-official-currency-favorites-v1';
const LANG_KEY = 'site-language';
const THEME_KEY = 'currency-rates-theme-v1';
const popularCodes = ['USD', 'EUR', 'RUB', 'UZS', 'KZT', 'TRY', 'GBP', 'CNY', 'AED', 'KGS', 'JPY', 'CHF', 'CAD', 'AUD', 'SAR', 'INR', 'KRW', 'SGD', 'THB', 'AZN'];
const searchTitles = {
  uz: 'Valyuta kurslari bugun | Dollar, rubl, euro va konvertor',
  en: 'Currency exchange rates | USD, EUR, RUB converter',
  ru: 'Курсы валют сегодня | доллар, евро, рубль и конвертер',
  ar: 'أسعار العملات اليوم | الدولار واليورو والروبل'
};
const searchDescriptions = {
  uz: 'Rasmiy markaziy banklar e’lon qilgan valyuta kurslarini tekshiring, valyutalarni taqqoslang va summani hisoblang.',
  en: 'Check official exchange rates from supported central banks, compare currencies, and convert amounts using published rates.',
  ru: 'Проверяйте официальные курсы поддерживаемых центральных банков, сравнивайте валюты и рассчитывайте суммы.',
  ar: 'تابع أسعار الصرف الرسمية من البنوك المركزية المدعومة، وقارن العملات واحسب المبالغ.'
};
const locationCurrencyByCountry = {
  USD: 'US,EC,SV,PA,TL,FM,MH,PW,PR,GU,VI,AS,MP',
  EUR: 'AD,AT,AX,BE,BL,CY,DE,EE,ES,FI,FR,GF,GP,GR,HR,IE,IT,LT,LU,LV,MC,ME,MF,MT,MQ,NL,PM,PT,RE,SI,SK,SM,TF,VA,YT',
  RUB: 'RU',
  GBP: 'GB,GG,IM,JE,GS,FK,GI',
  JPY: 'JP',
  AZN: 'AZ',
  BDT: 'BD',
  BHD: 'BH',
  BND: 'BN',
  BRL: 'BR',
  BYN: 'BY',
  CAD: 'CA',
  CHF: 'CH,LI',
  CNY: 'CN',
  CUP: 'CU',
  CZK: 'CZ',
  DKK: 'DK,FO,GL',
  DZD: 'DZ',
  EGP: 'EG',
  AFN: 'AF',
  ARS: 'AR',
  GEL: 'GE',
  HKD: 'HK',
  HUF: 'HU',
  IDR: 'ID',
  ILS: 'IL,PS',
  INR: 'IN,BT',
  IQD: 'IQ',
  IRR: 'IR',
  ISK: 'IS',
  JOD: 'JO',
  AUD: 'AU,CC,CX,KI,NR,NF,TV',
  KGS: 'KG',
  KHR: 'KH',
  KRW: 'KR',
  KWD: 'KW',
  KZT: 'KZ',
  LAK: 'LA',
  LBP: 'LB',
  LYD: 'LY',
  MAD: 'MA,EH',
  MDL: 'MD',
  MMK: 'MM',
  MNT: 'MN',
  MXN: 'MX',
  MYR: 'MY',
  NOK: 'NO,BV,SJ',
  NZD: 'NZ,CK,NU,PN,TK',
  OMR: 'OM',
  PHP: 'PH',
  PKR: 'PK',
  PLN: 'PL',
  QAR: 'QA',
  RON: 'RO',
  RSD: 'RS',
  AMD: 'AM',
  SAR: 'SA',
  SDG: 'SD',
  SEK: 'SE',
  SGD: 'SG',
  SYP: 'SY',
  THB: 'TH',
  TJS: 'TJ',
  TMT: 'TM',
  TND: 'TN',
  TRY: 'TR',
  UAH: 'UA',
  AED: 'AE',
  UZS: 'UZ',
  UYU: 'UY',
  VES: 'VE',
  VND: 'VN',
  XDR: '',
  YER: 'YE',
  ZAR: 'ZA,LS,NA,SZ'
};
const countryCurrency = Object.fromEntries(Object.entries(locationCurrencyByCountry)
  .flatMap(([currency, countries]) => countries.split(',').filter(Boolean).map((country) => [country, currency])));
const currencyByTimeZone = {
  'Asia/Tashkent': 'UZ', 'Europe/Moscow': 'RU', 'Europe/Istanbul': 'TR',
  'Europe/London': 'GB', 'Asia/Dubai': 'AE', 'Asia/Almaty': 'KZ',
  'Asia/Bishkek': 'KG', 'Asia/Shanghai': 'CN', 'Asia/Kolkata': 'IN',
  'Asia/Tokyo': 'JP', 'Asia/Seoul': 'KR', 'Asia/Bangkok': 'TH',
  'Asia/Singapore': 'SG', 'America/New_York': 'US', 'America/Toronto': 'CA',
  'Australia/Sydney': 'AU', 'Europe/Berlin': 'DE', 'Europe/Paris': 'FR'
};
function detectBrowserCountry() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (currencyByTimeZone[timeZone]) return currencyByTimeZone[timeZone];
  for (const locale of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    try {
      const region = new Intl.Locale(locale).region;
      if (region && countryCurrency[region]) return region;
    } catch (error) {
      console.warn('Browser locale could not be parsed for currency detection:', error);
    }
  }
  return currencyByTimeZone[timeZone] || 'US';
}
const browserCountry = detectBrowserCountry();
const browserCurrency = countryCurrency[browserCountry] || 'USD';
const EURO_AREA_COUNTRIES = new Set(['AD', 'AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MC', 'ME', 'MT', 'NL', 'PT', 'SI', 'SK', 'SM', 'VA']);
const ECB_CURRENCIES = ['AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'GBP', 'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'RUB', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'];
const rateProviders = {
  uz: {
    base: 'UZS',
    url: 'https://cbu.uz/en/arkhiv-kursov-valyut/json/',
    link: 'https://cbu.uz/en/arkhiv-kursov-valyut/json/',
    labelKey: 'sourceUz',
    cacheKey: `${CACHE_KEY}:uz`
  },
  eu: {
    base: 'EUR',
    url: 'https://data-api.ecb.europa.eu/service/data/EXR/',
    link: 'https://data.ecb.europa.eu/data/datasets/EXR/EXR',
    labelKey: 'sourceEu',
    cacheKey: `${CACHE_KEY}:eu`
  },
  ca: {
    base: 'CAD',
    url: 'https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json?recent=1',
    link: 'https://www.bankofcanada.ca/valet/docs',
    labelKey: 'sourceCa',
    cacheKey: `${CACHE_KEY}:ca`
  }
};
function providerForCountry(countryCode) {
  if (countryCode === 'UZ') return 'uz';
  if (countryCode === 'CA') return 'ca';
  if (EURO_AREA_COUNTRIES.has(countryCode)) return 'eu';
  return null;
}
let activeProviderId = providerForCountry(browserCountry) || 'uz';
let baseCurrencyCode = rateProviders[activeProviderId].base;
let savedLanguage = 'en';
let savedTheme = 'system';
try {
  const storedLanguage = localStorage.getItem(LANG_KEY);
  if (['uz', 'ru', 'en', 'ar'].includes(storedLanguage)) savedLanguage = storedLanguage;
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (['light', 'dark'].includes(storedTheme)) savedTheme = storedTheme;
} catch (error) {
  console.warn('Saved currency display preferences could not be read:', error);
}

const copy = {
  uz: {
    official: 'Rasmiy manba', language: 'Til', home: 'Asosiy sayt',
    sourceUz: 'O‘zbekiston Respublikasi Markaziy banki', sourceEu: 'Yevropa Markaziy banki', sourceCa: 'Kanada banki',
    sourceUnsupported: 'Bu hudud uchun mahalliy markaziy bank manbasi hozircha qo‘llanmaydi',
    sourceFallback: 'Mahalliy markaziy bank manbasi hali qo‘llanmaydi. Quyidagi kurslar {source}dan.',
    profileHomeCurrency: 'Mahalliy valyuta', profileFavorites: 'Saqlangan valyutalar', profilePair: 'Konvertor juftligi', profileSource: 'Kurs manbasi',
    accountEyebrow: 'Siz uchun qulayliklar', accountTitle: 'Google bilan kiring',
    accountBenefits: 'Sevimli valyutalar, konvertor juftligi, til va rang sozlamalarini qurilmalar orasida saqlang.',
    signInGoogle: 'Google bilan kirish', signInEmail: 'Email bilan kirish', emailLogin: 'Email bilan kirish',
    emailRegister: 'Hisob yaratish', emailLabel: 'Email', passwordLabel: 'Parol',
    emailWorking: 'Hisob tekshirilmoqda…', emailError: 'Email yoki parolni tekshiring va qayta urinib ko‘ring.',
    emailRegisterError: 'Hisob yaratilmadi. Email to‘g‘riligini tekshiring yoki bu email avval ro‘yxatdan o‘tgan bo‘lishi mumkin.',
    signOut: 'Chiqish', accountReady: '{name} sifatida kirdingiz',
    accountWorking: 'Hisobga ulanmoqda…', accountError: 'Hisobga kirib bo‘lmadi. Google oynasidagi xabarni tekshiring.',
    accountSyncError: 'Hisob sozlamalarini sinxronlab bo‘lmadi. Keyinroq qayta urinib ko‘ring.',
    heroTitle: 'Valyuta kurslari', heroText: 'Rasmiy kurslarni kuzating, valyutalarni taqqoslang va hisob-kitobni tez bajaring.',
    published: 'Kurs sanasi:', loading: 'Yuklanmoqda…', toolLabel: 'Qulay hisob-kitob', converterTitle: 'Valyuta konvertori',
    refresh: 'Kursni yangilash', amountLabel: 'Miqdor', fromLabel: 'Dan', toLabel: 'Ga', resultLabel: 'Hisoblangan qiymat',
    copy: 'Nusxalash', converterNote: 'Hisob-kitob Markaziy bankning rasmiy kurslari asosida. Ayirboshlash shoxobchasi kurslari va komissiyalar farq qilishi mumkin.',
    dailyRates: 'Kunlik ma’lumotlar', tableTitle: 'Rasmiy kurslar', searchLabel: 'Valyuta qidirish',
    historyEyebrow: 'Rasmiy kunlik ma’lumotlar', historyTitle: 'Valyuta kurslari tarixi',
    historyCurrency: 'Valyuta', history30: '30 kun', history90: '90 kun', history365: '1 yil',
    historyRefresh: 'Grafikni yangilash', historyDownload: 'PNG rasmni yuklab olish',
    historyExportError: 'Grafik rasmini yuklab bo‘lmadi. Qayta urinib ko‘ring.',
    historyLoading: 'Rasmiy tarixiy kurslar yuklanmoqda…', historyError: 'Tarixiy kurslarni olib bo‘lmadi. Keyinroq qayta urinib ko‘ring.',
    historyUnavailable: 'Bu manbada tanlangan valyuta uchun tarixiy ma’lumot yo‘q.',
    historyIncrease: 'Tanlangan davrda {percent}% ko‘tarildi', historyDecrease: 'Tanlangan davrda {percent}% pasaydi',
    historyNoChange: 'Tanlangan davrda sezilarli o‘zgarish yo‘q', historySourceNote: 'Tarixiy qiymatlar yuqorida ko‘rsatilgan rasmiy manbadan olinadi. Dam olish kunlari yangi kurs bo‘lmasligi mumkin.',
    searchPlaceholder: 'Valyuta yoki kodni qidiring…', fromSearchPlaceholder: 'Manba valyutasini izlash…',
    toSearchPlaceholder: 'Maqsad valyutasini izlash…', allCurrencies: 'Barcha valyutalar', popular: 'Ommabop',
    autoRefreshNote: 'Kurslar har daqiqada tekshiriladi; tanlangan manba yangi qiymat e’lon qilganda yangilanadi.',
    favorites: 'Saqlanganlar', currencyHead: 'Valyuta', codeHead: 'Kod', unitHead: 'Birlik', rateHead: '{base} kursi',
    changeHead: 'O‘zgarish', actions: 'Amallar', sourcePrefix: 'Ma’lumot manbasi:', sourceNote: 'Keltirilgan kurslar rasmiy hisob-kitob kurslari bo‘lib, bank yoki ayirboshlash shoxobchasidagi sotib olish/sotish narxini anglatmaydi.',
    infoOfficialTitle: 'Rasmiy manba', infoOfficialText: 'Kurslar sahifada ko‘rsatilgan tegishli markaziy bankning ochiq ma’lumotlaridan olinadi.',
    infoDateTitle: 'E’lon qilingan sana', infoDateText: 'Dam olish va bayram kunlari yangi kurs e’lon qilinmasligi mumkin. Har doim kurs sanasini tekshiring.',
    infoCalcTitle: 'Hisob-kitob uchun', infoCalcText: 'Konvertor taxminiy natija beradi; amaliy ayirboshlashda moliya tashkilotining kursi qo‘llanadi.',
    footerTitle: 'Valyuta kurslari', footerDisclaimer: 'Mustaqil ma’lumot sahifasi · rasmiy kurslar manbaga bog‘liq holda yangilanadi',
    privacy: 'Valyuta sahifasi maxfiyligi', retrying: 'Kurslar yangilanmoqda…', offline: 'Ulanish vaqtincha mavjud emas. Saqlangan kurslar ko‘rsatilmoqda; kurs sanasini tekshiring.',
    noCache: 'Valyuta kurslarini olib bo‘lmadi. Internetni tekshirib, qayta urinib ko‘ring.',
    stale: 'Kurs sanasi bugungi kundan oldin. Bu oxirgi e’lon qilingan rasmiy kurs; bugungi yangi kurs hali chiqmagan bo‘lishi mumkin.',
    noResults: 'Mos valyuta topilmadi.', noFavorites: 'Saqlangan valyuta yo‘q. Yulduz tugmasini bosib valyuta saqlang.',
    use: 'Konvertorda ishlatish', addFavorite: 'Saqlanganlarga qo‘shish', removeFavorite: 'Saqlanganlardan olib tashlash',
    count: '{count} ta valyuta', copied: 'Natija nusxalandi.', copyError: 'Nusxalab bo‘lmadi.',
    invalidAmount: 'Nol yoki undan katta miqdor kiriting.', missingRate: 'Tanlangan valyuta kursi mavjud emas.',
    retry: 'Qayta urinish', storageError: 'Tanlangan valyutani qurilmada saqlab bo‘lmadi.', uzs: 'O‘zbekiston so‘mi',
    changeUp: 'Oldingi kursdan yuqori', changeDown: 'Oldingi kursdan past', unchanged: 'O‘zgarish yo‘q',
    locationButton: 'Joylashuvim bo‘yicha', locating: 'Joylashuv aniqlanmoqda…', locationSuccess: '{country}: {currency} tanlandi.',
    locationDenied: 'Joylashuv ruxsati berilmadi. Valyutani ro‘yxatdan o‘zingiz tanlang.',
    locationUnavailable: 'Joylashuvni aniqlab bo‘lmadi. Joylashuv sozlamalarini tekshirib, qayta urinib ko‘ring.',
    locationUnsupported: 'Bu brauzer joylashuvni qo‘llamaydi. Valyutani ro‘yxatdan tanlang.',
    locationNoRate: '{country} uchun rasmiy markaziy bank ma’lumot manbasi hali qo‘llanmaydi. Hozirgi kurs manbasi saqlanadi.',
    locationPrivacy: 'Hudud brauzer sozlamalaridan taxmin qilinadi. Avval joylashuvga ruxsat bergan bo‘lsangiz, aniqroq tanlash uchun koordinatalar OpenStreetMap’ga bir marta yuborilishi mumkin; biz ularni saqlamaymiz.',
    themeDark: 'Tungi rejimni yoqish', themeLight: 'Yorug‘ rejimni yoqish',
    helpLabel: 'Valyuta kurslari haqida', faqTitle: 'Kursni izlash va tushunish',
    faqSearchTitle: 'Kerakli valyutani qanday topaman?', faqSearchText: 'Qidiruvga valyuta nomi, xalqaro kodi yoki nomining boshqa tildagi shaklini yozing. Masalan: dollar, USD, евро, рубль yoki tenge.',
    faqOfficialTitle: 'Kurs qayerdan olinadi?', faqOfficialPrefix: 'Kurslar sahifada ko‘rsatilgan rasmiy manbadan olinadi;', faqOfficialSuffix: 'kuzatuv sanasi ham ko‘rsatiladi.',
    faqExchangeTitle: 'Bu ayirboshlash shoxobchasidagi narxmi?', faqExchangeText: 'Yo‘q. Rasmiy hisob-kitob kursi bank yoki ayirboshlash shoxobchasining sotib olish/sotish narxi, spredi yoki komissiyasidan farq qilishi mumkin.'
  },
  en: {
    official: 'Official source', language: 'Language', home: 'Main site',
    sourceUz: 'Central Bank of the Republic of Uzbekistan', sourceEu: 'European Central Bank', sourceCa: 'Bank of Canada',
    sourceUnsupported: 'A local central-bank feed is not supported for this region yet',
    sourceFallback: 'A local central-bank feed is not supported for this region yet. Rates below are from {source}.',
    profileHomeCurrency: 'Local currency', profileFavorites: 'Saved currencies', profilePair: 'Converter pair', profileSource: 'Rate source',
    accountEyebrow: 'Your account benefits', accountTitle: 'Sign in with Google',
    accountBenefits: 'Sync favorite currencies, your converter pair, language, and theme across devices.',
    signInGoogle: 'Continue with Google', signInEmail: 'Continue with email', emailLogin: 'Sign in with email',
    emailRegister: 'Create account', emailLabel: 'Email', passwordLabel: 'Password',
    emailWorking: 'Checking your account…', emailError: 'Check your email and password, then try again.',
    emailRegisterError: 'Could not create the account. Check the email or sign in if it is already registered.',
    signOut: 'Sign out', accountReady: 'Signed in as {name}',
    accountWorking: 'Connecting your account…', accountError: 'Could not sign in. Check the message in the Google window.',
    accountSyncError: 'Could not sync account preferences. Please try again later.',
    heroTitle: 'Currency rates', heroText: 'Check official rates, compare currencies, and convert amounts in seconds.',
    published: 'Rate date:', loading: 'Loading…', toolLabel: 'Quick calculation', converterTitle: 'Currency converter',
    refresh: 'Refresh rates', amountLabel: 'Amount', fromLabel: 'From', toLabel: 'To', resultLabel: 'Converted amount',
    copy: 'Copy', converterNote: 'Conversion uses official Central Bank rates. Cash exchange rates and fees may differ.',
    dailyRates: 'Daily data', tableTitle: 'Official exchange rates', searchLabel: 'Search currencies',
    historyEyebrow: 'Official daily data', historyTitle: 'Exchange-rate history',
    historyCurrency: 'Currency', history30: '30 days', history90: '90 days', history365: '1 year',
    historyRefresh: 'Refresh chart', historyDownload: 'Download PNG image',
    historyExportError: 'Could not download the chart image. Please try again.',
    historyLoading: 'Loading official rate history…', historyError: 'Could not load rate history. Please try again later.',
    historyUnavailable: 'No historical data is available for this currency from the selected source.',
    historyIncrease: 'Up {percent}% for this period', historyDecrease: 'Down {percent}% for this period',
    historyNoChange: 'No meaningful change during this period', historySourceNote: 'Historical values come from the official source shown above. Rates may not be published on holidays.',
    searchPlaceholder: 'Search by currency or code…', fromSearchPlaceholder: 'Search source currency…',
    toSearchPlaceholder: 'Search target currency…', allCurrencies: 'All currencies', popular: 'Popular',
    autoRefreshNote: 'Rates are checked every minute; values update when the selected source publishes them.',
    favorites: 'Favorites', currencyHead: 'Currency', codeHead: 'Code', unitHead: 'Unit', rateHead: 'Rate in {base}',
    changeHead: 'Change', actions: 'Actions', sourcePrefix: 'Data source:', sourceNote: 'These are official reference rates, not bank or exchange-office buy/sell prices.',
    infoOfficialTitle: 'Official source', infoOfficialText: 'Rates come from the relevant central bank’s open data source shown on this page.',
    infoDateTitle: 'Publication date', infoDateText: 'Rates may not be published on weekends or holidays. Always check the rate date.',
    infoCalcTitle: 'For calculation', infoCalcText: 'The converter is an estimate; financial institutions apply their own exchange rates.',
    footerTitle: 'Currency rates', footerDisclaimer: 'Independent information page · official rates update as published by the source',
    privacy: 'Currency page privacy', retrying: 'Refreshing rates…', offline: 'Connection unavailable. Showing saved rates; check their publication date.',
    noCache: 'Could not load currency rates. Check your internet connection and try again.',
    stale: 'The rate date is earlier than today. This is the latest published official rate; a new rate may not yet be available.',
    noResults: 'No matching currency found.', noFavorites: 'No saved currencies yet. Save one using the star button.',
    use: 'Use in converter', addFavorite: 'Add to favorites', removeFavorite: 'Remove from favorites',
    count: '{count} currencies', copied: 'Result copied.', copyError: 'Could not copy the result.',
    invalidAmount: 'Enter an amount of zero or more.', missingRate: 'The selected currency rate is unavailable.',
    retry: 'Try again', storageError: 'Could not save this preference on your device.', uzs: 'Uzbekistani soʻm',
    changeUp: 'Higher than previous rate', changeDown: 'Lower than previous rate', unchanged: 'No change',
    locationButton: 'Use my location', locating: 'Detecting your location…', locationSuccess: '{country}: {currency} selected.',
    locationDenied: 'Location permission was denied. Select a currency from the list instead.',
    locationUnavailable: 'Could not detect your location. Check your location settings and try again.',
    locationUnsupported: 'This browser does not support location. Select a currency from the list.',
    locationNoRate: 'An official central-bank feed for {country} is not supported yet. The current rate source has been kept.',
    locationPrivacy: 'Your region is estimated from browser settings. If you previously granted location permission, coordinates may be sent once to OpenStreetMap for a more accurate choice; we do not store them.',
    themeDark: 'Turn on dark mode', themeLight: 'Turn on light mode',
    helpLabel: 'About currency rates', faqTitle: 'Find and understand exchange rates',
    faqSearchTitle: 'How do I find a currency?', faqSearchText: 'Search by its name, international code, or a name in another language. For example: dollar, USD, евро, рубль, or tenge.',
    faqOfficialTitle: 'Where do the rates come from?', faqOfficialPrefix: 'Rates come from the official data source of', faqOfficialSuffix: 'and the observation date is shown.',
    faqExchangeTitle: 'Are these cash exchange prices?', faqExchangeText: 'No. Official reference rates can differ from bank or exchange-office buy/sell prices, spreads, and fees.'
  },
  ru: {
    official: 'Официальный источник', language: 'Язык', home: 'Основной сайт',
    sourceUz: 'Центральный банк Республики Узбекистан', sourceEu: 'Европейский центральный банк', sourceCa: 'Банк Канады',
    sourceUnsupported: 'Источник местного центрального банка для этого региона пока не поддерживается',
    sourceFallback: 'Источник местного центрального банка пока не поддерживается. Ниже показаны курсы: {source}.',
    profileHomeCurrency: 'Местная валюта', profileFavorites: 'Сохранённые валюты', profilePair: 'Пара конвертера', profileSource: 'Источник курса',
    accountEyebrow: 'Преимущества аккаунта', accountTitle: 'Войдите через Google',
    accountBenefits: 'Синхронизируйте избранные валюты, пару конвертера, язык и тему на разных устройствах.',
    signInGoogle: 'Войти через Google', signInEmail: 'Войти по email', emailLogin: 'Войти с email',
    emailRegister: 'Создать аккаунт', emailLabel: 'Email', passwordLabel: 'Пароль',
    emailWorking: 'Проверяем аккаунт…', emailError: 'Проверьте email и пароль и попробуйте ещё раз.',
    emailRegisterError: 'Не удалось создать аккаунт. Проверьте email или войдите, если он уже зарегистрирован.',
    signOut: 'Выйти', accountReady: 'Вы вошли как {name}',
    accountWorking: 'Подключаем аккаунт…', accountError: 'Не удалось войти. Проверьте сообщение в окне Google.',
    accountSyncError: 'Не удалось синхронизировать настройки аккаунта. Попробуйте позже.',
    heroTitle: 'Курсы валют', heroText: 'Проверяйте официальные курсы, сравнивайте валюты и быстро конвертируйте суммы.',
    published: 'Дата курса:', loading: 'Загрузка…', toolLabel: 'Быстрый расчёт', converterTitle: 'Конвертер валют',
    refresh: 'Обновить курсы', amountLabel: 'Сумма', fromLabel: 'Из', toLabel: 'В', resultLabel: 'Результат конвертации',
    copy: 'Копировать', converterNote: 'Расчёт основан на официальных курсах Центрального банка. Курсы обменных пунктов и комиссии могут отличаться.',
    dailyRates: 'Ежедневные данные', tableTitle: 'Официальные курсы', searchLabel: 'Поиск валют',
    historyEyebrow: 'Официальные ежедневные данные', historyTitle: 'История курсов валют',
    historyCurrency: 'Валюта', history30: '30 дней', history90: '90 дней', history365: '1 год',
    historyRefresh: 'Обновить график', historyDownload: 'Скачать PNG',
    historyExportError: 'Не удалось скачать изображение графика. Попробуйте ещё раз.',
    historyLoading: 'Загружаем официальную историю курсов…', historyError: 'Не удалось загрузить историю курсов. Попробуйте позже.',
    historyUnavailable: 'У выбранного источника нет исторических данных для этой валюты.',
    historyIncrease: 'За период рост на {percent}%', historyDecrease: 'За период снижение на {percent}%',
    historyNoChange: 'За период существенных изменений нет', historySourceNote: 'Исторические данные поступают из указанного выше официального источника. В праздничные дни курс может не публиковаться.',
    searchPlaceholder: 'Введите название или код валюты…', fromSearchPlaceholder: 'Поиск исходной валюты…',
    toSearchPlaceholder: 'Поиск целевой валюты…', allCurrencies: 'Все валюты', popular: 'Популярные',
    autoRefreshNote: 'Курсы проверяются каждую минуту; значения обновляются после публикации выбранного источника.',
    favorites: 'Избранное', currencyHead: 'Валюта', codeHead: 'Код', unitHead: 'Единица', rateHead: 'Курс в {base}',
    changeHead: 'Изменение', actions: 'Действия', sourcePrefix: 'Источник данных:', sourceNote: 'Это официальные учётные курсы, а не цены покупки или продажи в банках и обменных пунктах.',
    infoOfficialTitle: 'Официальный источник', infoOfficialText: 'Курсы получены из открытых данных соответствующего центрального банка, указанного на странице.',
    infoDateTitle: 'Дата публикации', infoDateText: 'В выходные и праздничные дни новый курс может не публиковаться. Всегда проверяйте дату курса.',
    infoCalcTitle: 'Для расчёта', infoCalcText: 'Конвертер показывает примерный результат; финансовые организации применяют собственные курсы.',
    footerTitle: 'Курсы валют', footerDisclaimer: 'Отдельная информационная страница · курсы обновляются по мере публикации источником',
    privacy: 'Конфиденциальность страницы валют', retrying: 'Обновление курсов…', offline: 'Нет подключения. Показаны сохранённые курсы; проверьте дату публикации.',
    noCache: 'Не удалось загрузить курсы валют. Проверьте интернет и попробуйте ещё раз.',
    stale: 'Дата курса раньше сегодняшней. Это последний опубликованный официальный курс; новый курс может ещё не быть опубликован.',
    noResults: 'Валюта не найдена.', noFavorites: 'Сохранённых валют пока нет. Добавьте валюту кнопкой со звездой.',
    use: 'Использовать в конвертере', addFavorite: 'Добавить в избранное', removeFavorite: 'Удалить из избранного',
    count: '{count} валют', copied: 'Результат скопирован.', copyError: 'Не удалось скопировать результат.',
    invalidAmount: 'Введите сумму не меньше нуля.', missingRate: 'Курс выбранной валюты недоступен.',
    retry: 'Повторить', storageError: 'Не удалось сохранить настройку на устройстве.', uzs: 'Узбекский сум',
    changeUp: 'Выше предыдущего курса', changeDown: 'Ниже предыдущего курса', unchanged: 'Без изменений',
    locationButton: 'Определить по геолокации', locating: 'Определяем местоположение…', locationSuccess: '{country}: выбрана валюта {currency}.',
    locationDenied: 'Доступ к геолокации запрещён. Выберите валюту из списка вручную.',
    locationUnavailable: 'Не удалось определить местоположение. Проверьте настройки и повторите попытку.',
    locationUnsupported: 'Этот браузер не поддерживает геолокацию. Выберите валюту из списка.',
    locationNoRate: 'Источник официальных данных центрального банка для {country} пока не поддерживается. Текущий источник курсов сохранён.',
    locationPrivacy: 'Регион определяется по настройкам браузера. Если вы ранее разрешили геолокацию, координаты могут быть отправлены один раз в OpenStreetMap для более точного выбора; мы их не сохраняем.',
    themeDark: 'Включить тёмную тему', themeLight: 'Включить светлую тему',
    helpLabel: 'О курсах валют', faqTitle: 'Поиск и понимание курсов валют',
    faqSearchTitle: 'Как найти нужную валюту?', faqSearchText: 'Введите название валюты, международный код или название на другом языке. Например: доллар, USD, евро, рубль или тенге.',
    faqOfficialTitle: 'Откуда берутся курсы?', faqOfficialPrefix: 'Курсы поступают из официального источника данных', faqOfficialSuffix: 'дата наблюдения указана на странице.',
    faqExchangeTitle: 'Это курс наличного обмена?', faqExchangeText: 'Нет. Официальный учётный курс может отличаться от цен покупки и продажи, спредов и комиссий банков или обменных пунктов.'
  },
  ar: {
    official: 'مصدر رسمي', language: 'اللغة', home: 'الموقع الرئيسي',
    sourceUz: 'البنك المركزي لجمهورية أوزبكستان', sourceEu: 'البنك المركزي الأوروبي', sourceCa: 'بنك كندا',
    sourceUnsupported: 'مصدر البنك المركزي المحلي غير مدعوم لهذه المنطقة بعد',
    sourceFallback: 'مصدر البنك المركزي المحلي غير مدعوم لهذه المنطقة بعد. الأسعار أدناه من {source}.',
    profileHomeCurrency: 'العملة المحلية', profileFavorites: 'العملات المحفوظة', profilePair: 'زوج التحويل', profileSource: 'مصدر السعر',
    accountEyebrow: 'مزايا الحساب', accountTitle: 'سجّل الدخول باستخدام Google',
    accountBenefits: 'زامن العملات المفضلة وزوج التحويل واللغة والمظهر بين أجهزتك.',
    signInGoogle: 'المتابعة باستخدام Google', signInEmail: 'المتابعة بالبريد الإلكتروني', emailLogin: 'تسجيل الدخول بالبريد الإلكتروني',
    emailRegister: 'إنشاء حساب', emailLabel: 'البريد الإلكتروني', passwordLabel: 'كلمة المرور',
    emailWorking: 'جارٍ التحقق من الحساب…', emailError: 'تحقق من البريد الإلكتروني وكلمة المرور ثم حاول مجددًا.',
    emailRegisterError: 'تعذر إنشاء الحساب. تحقق من البريد الإلكتروني أو سجّل الدخول إذا كان مسجلًا بالفعل.',
    signOut: 'تسجيل الخروج', accountReady: 'تم تسجيل الدخول باسم {name}',
    accountWorking: 'جارٍ ربط الحساب…', accountError: 'تعذر تسجيل الدخول. تحقق من الرسالة في نافذة Google.',
    accountSyncError: 'تعذرت مزامنة إعدادات الحساب. حاول مرة أخرى لاحقًا.',
    heroTitle: 'أسعار العملات', heroText: 'تابع الأسعار الرسمية وقارن العملات وحوّل المبالغ بسرعة.',
    published: 'تاريخ السعر:', loading: 'جارٍ التحميل…', toolLabel: 'حساب سريع', converterTitle: 'محول العملات',
    refresh: 'تحديث الأسعار', amountLabel: 'المبلغ', fromLabel: 'من', toLabel: 'إلى', resultLabel: 'المبلغ بعد التحويل',
    copy: 'نسخ', converterNote: 'يعتمد الحساب على الأسعار الرسمية للبنك المركزي. قد تختلف أسعار الصرافة والرسوم.',
    dailyRates: 'بيانات يومية', tableTitle: 'الأسعار الرسمية', searchLabel: 'البحث عن العملات',
    historyEyebrow: 'بيانات يومية رسمية', historyTitle: 'سجل أسعار الصرف',
    historyCurrency: 'العملة', history30: '30 يومًا', history90: '90 يومًا', history365: 'سنة واحدة',
    historyRefresh: 'تحديث الرسم البياني', historyDownload: 'تنزيل صورة PNG',
    historyExportError: 'تعذر تنزيل صورة الرسم البياني. حاول مرة أخرى.',
    historyLoading: 'جارٍ تحميل سجل الأسعار الرسمي…', historyError: 'تعذر تحميل سجل الأسعار. حاول مرة أخرى لاحقًا.',
    historyUnavailable: 'لا تتوفر بيانات تاريخية لهذه العملة من المصدر المحدد.',
    historyIncrease: 'ارتفاع {percent}% خلال هذه الفترة', historyDecrease: 'انخفاض {percent}% خلال هذه الفترة',
    historyNoChange: 'لا يوجد تغير ملحوظ خلال هذه الفترة', historySourceNote: 'تأتي القيم التاريخية من المصدر الرسمي الموضح أعلاه. قد لا تُنشر أسعار جديدة في العطلات.',
    searchPlaceholder: 'ابحث باسم العملة أو رمزها…', fromSearchPlaceholder: 'ابحث عن عملة المصدر…',
    toSearchPlaceholder: 'ابحث عن العملة المستهدفة…', allCurrencies: 'كل العملات', popular: 'الأكثر استخدامًا',
    autoRefreshNote: 'يتم التحقق من الأسعار كل دقيقة؛ وتتحدث القيم عند نشرها من المصدر المحدد.',
    favorites: 'المفضلة', currencyHead: 'العملة', codeHead: 'الرمز', unitHead: 'الوحدة', rateHead: 'السعر بـ {base}',
    changeHead: 'التغيير', actions: 'الإجراءات', sourcePrefix: 'مصدر البيانات:', sourceNote: 'هذه أسعار مرجعية رسمية وليست أسعار البيع والشراء لدى البنوك أو مكاتب الصرافة.',
    infoOfficialTitle: 'مصدر رسمي', infoOfficialText: 'تأتي الأسعار من مصدر البيانات المفتوحة للبنك المركزي المعني والمذكور في الصفحة.',
    infoDateTitle: 'تاريخ النشر', infoDateText: 'قد لا تُنشر أسعار جديدة في العطل ونهاية الأسبوع. تحقق دائمًا من تاريخ السعر.',
    infoCalcTitle: 'للحساب فقط', infoCalcText: 'يعرض المحول نتيجة تقديرية؛ وتطبق المؤسسات المالية أسعارها الخاصة.',
    footerTitle: 'أسعار العملات', footerDisclaimer: 'صفحة معلومات مستقلة · تُحدّث الأسعار عند نشرها من المصدر',
    privacy: 'خصوصية صفحة العملات', retrying: 'جارٍ تحديث الأسعار…', offline: 'الاتصال غير متاح. يتم عرض الأسعار المحفوظة؛ تحقق من تاريخها.',
    noCache: 'تعذر تحميل أسعار العملات. تحقق من الاتصال وحاول مرة أخرى.',
    stale: 'تاريخ السعر أقدم من اليوم. هذا آخر سعر رسمي منشور؛ قد لا يكون السعر الجديد قد نُشر بعد.',
    noResults: 'لم يتم العثور على عملة مطابقة.', noFavorites: 'لا توجد عملات محفوظة. أضف عملة باستخدام زر النجمة.',
    use: 'استخدم في المحول', addFavorite: 'أضف إلى المفضلة', removeFavorite: 'إزالة من المفضلة',
    count: '{count} عملة', copied: 'تم نسخ النتيجة.', copyError: 'تعذر نسخ النتيجة.',
    invalidAmount: 'أدخل مبلغًا يساوي صفرًا أو أكثر.', missingRate: 'سعر العملة المحددة غير متاح.',
    retry: 'حاول مجددًا', storageError: 'تعذر حفظ هذا الإعداد على جهازك.', uzs: 'السوم الأوزبكي',
    changeUp: 'أعلى من السعر السابق', changeDown: 'أقل من السعر السابق', unchanged: 'دون تغيير',
    locationButton: 'حسب موقعي', locating: 'جارٍ تحديد الموقع…', locationSuccess: 'تم اختيار {currency} لـ {country}.',
    locationDenied: 'لم يُسمح بالوصول إلى الموقع. اختر العملة من القائمة يدويًا.',
    locationUnavailable: 'تعذر تحديد الموقع. تحقق من إعدادات الموقع وحاول مرة أخرى.',
    locationUnsupported: 'هذا المتصفح لا يدعم الموقع الجغرافي. اختر العملة من القائمة.',
    locationNoRate: 'مصدر بيانات البنك المركزي الرسمي لـ {country} غير مدعوم بعد. تم الإبقاء على مصدر الأسعار الحالي.',
    locationPrivacy: 'يتم تقدير المنطقة من إعدادات المتصفح. إذا منحت إذن الموقع مسبقًا، فقد تُرسل الإحداثيات مرة واحدة إلى OpenStreetMap لاختيار أدق؛ ولا نحفظها.',
    themeDark: 'تفعيل الوضع الداكن', themeLight: 'تفعيل الوضع الفاتح',
    helpLabel: 'حول أسعار العملات', faqTitle: 'البحث عن الأسعار وفهمها',
    faqSearchTitle: 'كيف أجد العملة المطلوبة؟', faqSearchText: 'ابحث باسم العملة أو رمزها الدولي أو اسمها بلغة أخرى، مثل الدولار أو USD أو اليورو أو الروبل أو التنغي.',
    faqOfficialTitle: 'ما مصدر الأسعار؟', faqOfficialPrefix: 'تأتي الأسعار من مصدر البيانات الرسمي لـ', faqOfficialSuffix: 'ويظهر تاريخ الرصد في الصفحة.',
    faqExchangeTitle: 'هل هذه أسعار الصرافة النقدية؟', faqExchangeText: 'لا. قد تختلف الأسعار المرجعية الرسمية عن أسعار البيع والشراء والعمولات لدى البنوك ومكاتب الصرافة.'
  }
};

const elements = {
  language: document.getElementById('currency-language'),
  date: document.getElementById('published-date'),
  alert: document.getElementById('currency-alert'),
  amount: document.getElementById('convert-amount'),
  from: document.getElementById('convert-from'),
  to: document.getElementById('convert-to'),
  result: document.getElementById('conversion-result'),
  copy: document.getElementById('copy-result'),
  search: document.getElementById('currency-search'),
  rows: document.getElementById('currency-rows'),
  count: document.getElementById('rates-count'),
  favoriteCount: document.getElementById('favorite-count'),
  refresh: document.getElementById('refresh-rates'),
  theme: document.getElementById('currency-theme-toggle'),
  location: document.getElementById('location-currency'),
  locationStatus: document.getElementById('currency-location-status'),
  fromSearch: document.getElementById('convert-from-search'),
  toSearch: document.getElementById('convert-to-search'),
  signIn: document.getElementById('currency-sign-in'),
  emailToggle: document.getElementById('currency-email-toggle'),
  emailForm: document.getElementById('currency-email-form'),
  email: document.getElementById('currency-email'),
  password: document.getElementById('currency-password'),
  emailLogin: document.getElementById('currency-email-login'),
  emailRegister: document.getElementById('currency-email-register'),
  emailStatus: document.getElementById('currency-email-status'),
  signOut: document.getElementById('currency-sign-out'),
  accountStatus: document.getElementById('currency-account-status'),
  profile: document.getElementById('currency-profile'),
  profileName: document.getElementById('currency-profile-name'),
  profileEmail: document.getElementById('currency-profile-email'),
  profileHome: document.getElementById('currency-profile-home'),
  profileFavorites: document.getElementById('currency-profile-favorites'),
  profilePair: document.getElementById('currency-profile-pair'),
  profileSource: document.getElementById('currency-profile-source'),
  sourceLabel: document.getElementById('currency-source-label'),
  sourceLink: document.getElementById('currency-source-link'),
  rateHeading: document.getElementById('currency-rate-heading'),
  historyCurrency: document.getElementById('history-currency'),
  historyStatus: document.getElementById('history-status'),
  historyWrap: document.getElementById('history-chart-wrap'),
  historyChart: document.getElementById('history-chart'),
  historyLabel: document.getElementById('history-rate-label'),
  historyChange: document.getElementById('history-change'),
  historyRefresh: document.getElementById('history-refresh'),
  historyDownload: document.getElementById('history-download'),
  faqSource: document.getElementById('faq-source-label')
};

let language = savedLanguage;
let rates = [];
let rateDate = '';
let selectedCountryCode = browserCountry;
let selectedLocalCurrency = browserCurrency;
let filter = 'popular';
let favorites = readFavorites();
let latestResult = '';
let selectorsInitialized = false;
let themeMode = savedTheme;
let preferredFrom = 'USD';
let preferredTo = browserCurrency === 'USD' ? 'EUR' : browserCurrency;
let accountClient = null;
let accountConnectPromise = null;
let accountUser = null;
let applyingAccountPreferences = false;
let refreshInProgress = false;
let accountSaveTimer = 0;
let lastSavedAccountPreferences = '';
let ratesOffline = false;
let historyDays = 30;
let historySeries = [];
let historyRequestId = 0;

function readFavorites() {
  try {
    const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((code) => typeof code === 'string') : [];
  } catch (error) {
    console.warn('Currency favorites could not be read:', error);
    return [];
  }
}

function accountPreferences() {
  return {
    favoriteCurrencies: favorites,
    fromCode: elements.from.value || preferredFrom,
    toCode: elements.to.value || preferredTo,
    homeCurrency: selectedLocalCurrency,
    language,
    theme: themeMode
  };
}

function updateAccountStatus() {
  if (!accountUser) {
    elements.accountStatus.textContent = '';
    elements.signIn.hidden = false;
    elements.emailToggle.hidden = false;
    elements.signOut.hidden = true;
    elements.profile.hidden = true;
    return;
  }
  const name = accountUser.displayName || accountUser.email || accountUser.uid;
  elements.accountStatus.textContent = text('accountReady').replace('{name}', name);
  elements.signIn.hidden = true;
  elements.emailToggle.hidden = true;
  elements.emailForm.hidden = true;
  elements.signOut.hidden = false;
  elements.profile.hidden = false;
  renderCurrencyProfile();
}

function renderCurrencyProfile() {
  if (!elements.profile || !accountUser) return;
  elements.profileName.textContent = accountUser.displayName || accountUser.email || accountUser.uid;
  elements.profileEmail.textContent = accountUser.email || '';
  elements.profileHome.textContent = `${selectedLocalCurrency} · ${currencyDisplayName(selectedLocalCurrency, language)}`;
  elements.profileFavorites.textContent = formatNumber(favorites.length);
  elements.profilePair.textContent = `${elements.from.value || preferredFrom} → ${elements.to.value || preferredTo}`;
  elements.profileSource.textContent = text(rateProviders[activeProviderId].labelKey);
}

function applyAccountPreferences(preferences) {
  if (!preferences) return;
  applyingAccountPreferences = true;
  const remoteFavorites = Array.isArray(preferences.favoriteCurrencies)
    ? preferences.favoriteCurrencies.filter((code) => typeof code === 'string' && /^[A-Z]{3}$/.test(code))
    : [];
  favorites = [...new Set([...favorites, ...remoteFavorites])].slice(0, 100);
  if (typeof preferences.fromCode === 'string' && /^[A-Z]{3}$/.test(preferences.fromCode)) preferredFrom = preferences.fromCode;
  if (typeof preferences.toCode === 'string' && /^[A-Z]{3}$/.test(preferences.toCode)) preferredTo = preferences.toCode;
  if (typeof preferences.homeCurrency === 'string' && /^[A-Z]{3}$/.test(preferences.homeCurrency)) {
    selectedLocalCurrency = preferences.homeCurrency;
  }
  if (['uz', 'ru', 'en', 'ar'].includes(preferences.language)) setLanguage(preferences.language);
  if (['light', 'dark'].includes(preferences.theme)) {
    themeMode = preferences.theme;
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch (error) {
      console.warn('Synced currency theme could not be saved locally:', error);
    }
    applyTheme();
  }
  if (selectorsInitialized) {
    renderRateSelectors();
    updateConversion();
  }
  saveFavorites();
  renderRates();
  applyingAccountPreferences = false;
  saveAccountPreferences();
}

async function getAccountClient() {
  if (!accountConnectPromise) {
    accountConnectPromise = import('./currency-account.js')
      .then(({ connectCurrencyAccount }) => connectCurrencyAccount())
      .then((client) => {
        accountClient = client;
        accountUser = client.user;
        updateAccountStatus();
        return client;
      })
      .catch((error) => {
        accountConnectPromise = null;
        throw error;
      });
  }
  return accountConnectPromise;
}

async function initializeAccount() {
  try {
    const client = await getAccountClient();
    if (client.user) {
      try {
        applyAccountPreferences(await client.loadPreferences());
      } catch (error) {
        console.error('Currency account preferences could not be loaded:', error);
        elements.accountStatus.textContent = text('accountSyncError');
      }
    }
  } catch (error) {
    console.error('Currency account initialization failed:', error);
    elements.accountStatus.textContent = text('accountError');
  }
}

function saveAccountPreferences() {
  if (!accountClient || !accountUser || applyingAccountPreferences) return;
  const preferences = accountPreferences();
  const serialized = JSON.stringify(preferences);
  if (serialized === lastSavedAccountPreferences) return;
  window.clearTimeout(accountSaveTimer);
  accountSaveTimer = window.setTimeout(async () => {
    try {
      await accountClient.savePreferences(preferences);
      lastSavedAccountPreferences = serialized;
    } catch (error) {
      console.error('Currency account preferences could not be saved:', error);
      elements.accountStatus.textContent = text('accountSyncError');
    }
  }, 350);
}

function text(key) {
  return copy[language]?.[key] || copy.uz[key] || '';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function setLanguage(nextLanguage) {
  language = copy[nextLanguage] ? nextLanguage : 'en';
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  elements.language.value = language;
  try {
    localStorage.setItem(LANG_KEY, language);
  } catch (error) {
    console.warn('Language preference could not be saved:', error);
  }
  document.querySelectorAll('[data-i18n]').forEach((node) => {
    node.textContent = text(node.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((node) => {
    node.placeholder = text(node.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((node) => {
    node.setAttribute('aria-label', text(node.dataset.i18nAriaLabel));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((node) => {
    node.setAttribute('title', text(node.dataset.i18nTitle));
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const label = button.querySelector('[data-i18n]');
    if (label) label.textContent = text(label.dataset.i18n);
  });
  document.title = searchTitles[language];
  const description = document.querySelector('meta[name="description"]');
  const socialTitle = document.querySelector('meta[property="og:title"]');
  const socialDescription = document.querySelector('meta[property="og:description"]');
  if (description) description.content = searchDescriptions[language];
  if (socialTitle) socialTitle.content = searchTitles[language];
  if (socialDescription) socialDescription.content = searchDescriptions[language];
  updateSourceMetadata();
  renderRateSelectors();
  renderHistoryCurrencyOptions();
  renderRates();
  if (historySeries.length) renderHistoryChart(historySeries, elements.historyCurrency.value);
  updateConversion();
  updateThemeButton();
  updateAccountStatus();
  renderCurrencyProfile();
  saveAccountPreferences();
}

function applyTheme() {
  const dark = themeMode === 'dark'
    || (themeMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.body.classList.toggle('currency-dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  updateThemeButton();
}

function updateThemeButton() {
  const dark = document.body.classList.contains('currency-dark');
  const label = text(dark ? 'themeLight' : 'themeDark');
  elements.theme.setAttribute('aria-label', label);
  elements.theme.title = label;
  elements.theme.innerHTML = `<i class="bi ${dark ? 'bi-sun' : 'bi-moon-stars'}" aria-hidden="true"></i>`;
}

function localizedName(rate) {
  if (!rate) return text('uzs');
  const key = language === 'ru' ? 'CcyNm_RU' : language === 'en' || language === 'ar' ? 'CcyNm_EN' : 'CcyNm_UZ';
  return rate[key] || rate.CcyNm_EN || rate.CcyNm_UZ || rate.Ccy || '';
}

function currencyEntries() {
  return [{
    Ccy: baseCurrencyCode,
    CcyNm_UZ: currencyDisplayName(baseCurrencyCode, 'uz-UZ'),
    CcyNm_RU: currencyDisplayName(baseCurrencyCode, 'ru-RU'),
    CcyNm_EN: currencyDisplayName(baseCurrencyCode, 'en'),
    Nominal: '1', Rate: '1', Diff: '0', Date: rateDate
  }, ...rates];
}

function readUnitRate(code) {
  if (code === baseCurrencyCode) return 1;
  const rate = rates.find((item) => item.Ccy === code);
  if (!rate) return null;
  const nominal = Number(rate.Nominal);
  const value = Number(rate.Rate);
  if (!Number.isFinite(nominal) || nominal <= 0 || !Number.isFinite(value) || value <= 0) return null;
  return value / nominal;
}

function renderRateSelectors() {
  if (!elements.from || !elements.to) return;
  if (!rates.length) {
    const baseOption = `<option value="${escapeHtml(baseCurrencyCode)}">${escapeHtml(`${baseCurrencyCode} — ${currencyDisplayName(baseCurrencyCode, language)}`)}</option>`;
    elements.from.innerHTML = baseOption;
    elements.to.innerHTML = baseOption;
    return;
  }
  const entries = currencyEntries().sort((first, second) => {
    if (first.Ccy === baseCurrencyCode) return -1;
    if (second.Ccy === baseCurrencyCode) return 1;
    const rankDifference = popularCodes.indexOf(first.Ccy) - popularCodes.indexOf(second.Ccy);
    if (rankDifference !== 0) {
      if (popularCodes.includes(first.Ccy)) return -1;
      if (popularCodes.includes(second.Ccy)) return 1;
    }
    return localizedName(first).localeCompare(localizedName(second), language);
  });
  function populate(select, search, fallback) {
    const current = selectorsInitialized ? select.value : fallback;
    const query = search.value.trim().toLocaleLowerCase();
    const matches = query
      ? entries.filter((entry) => searchText(entry).includes(query))
      : entries;
    const selectedEntry = entries.find((entry) => entry.Ccy === current);
    if (query && !matches.length && selectedEntry) matches.push(selectedEntry);
    const visible = selectedEntry && !matches.some((entry) => entry.Ccy === current)
      ? [selectedEntry, ...matches]
      : matches;
    select.innerHTML = visible.map((item) =>
      `<option value="${escapeHtml(item.Ccy)}">${escapeHtml(item.Ccy)} — ${escapeHtml(localizedName(item))}</option>`
    ).join('');
    select.value = visible.some((item) => item.Ccy === current) ? current : visible[0]?.Ccy || '';
  }
  populate(elements.from, elements.fromSearch, preferredFrom);
  populate(elements.to, elements.toSearch, preferredTo);
  selectorsInitialized = true;
  renderCurrencyProfile();
}

function formatNumber(value, options = {}) {
  const locale = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US', ar: 'ar' }[language];
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return new Intl.NumberFormat('en-US', options).format(value);
  }
}

function formatRate(value) {
  return formatNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: value >= 100 ? 2 : 4 });
}

function currencyDisplayName(code, locale = language) {
  try {
    return new Intl.DisplayNames([locale], { type: 'currency' }).of(code) || code;
  } catch (error) {
    console.warn(`Could not localize currency name for ${code}:`, error);
    return code;
  }
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      reject(new Error(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable'));
    }, {
      enableHighAccuracy: false,
      maximumAge: 300000,
      timeout: 12000
    });
  });
}

async function detectLocationCurrency(silent = false) {
  if (!rates.length) {
    if (!silent) elements.locationStatus.textContent = text('noCache');
    return;
  }
  elements.location.disabled = true;
  if (!silent) elements.locationStatus.textContent = text('locating');
  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
      || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      throw new Error('unavailable');
    }
    const endpoint = new URL('https://nominatim.openstreetmap.org/reverse');
    endpoint.search = new URLSearchParams({
      format: 'jsonv2',
      lat: String(latitude),
      lon: String(longitude),
      zoom: '3',
      addressdetails: '1'
    });
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let place;
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: 'application/json', 'Accept-Language': language },
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Location lookup returned HTTP ${response.status}.`);
      place = await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
    const address = place?.address || {};
    const countryCode = String(address.country_code || '').toUpperCase();
    const code = countryCurrency[countryCode];
    const countryName = address.country || countryCode;
    const providerId = providerForCountry(countryCode);
    selectedCountryCode = countryCode;
    if (!code || !providerId) {
      updateRateWarnings();
      if (!silent) elements.locationStatus.textContent = text('locationNoRate').replace('{country}', countryName);
      return;
    }
    if (providerId !== activeProviderId) {
      activeProviderId = providerId;
      baseCurrencyCode = rateProviders[providerId].base;
      rates = [];
      rateDate = '';
      selectorsInitialized = false;
      updateSourceMetadata();
      await loadRates();
    }
    if (!rates.some((rate) => rate.Ccy === code) && code !== baseCurrencyCode) {
      if (!silent) elements.locationStatus.textContent = text('locationNoRate').replace('{country}', countryName);
      return;
    }
    selectedCountryCode = countryCode;
    selectedLocalCurrency = code;
    preferredFrom = rates.some((rate) => rate.Ccy === 'USD') ? 'USD' : baseCurrencyCode;
    preferredTo = code;
    elements.fromSearch.value = '';
    elements.toSearch.value = '';
    renderRateSelectors();
    elements.from.value = preferredFrom;
    elements.to.value = code;
    elements.amount.value = '1';
    updateConversion();
    renderCurrencyProfile();
    updateRateWarnings();
    if (!silent) {
      elements.locationStatus.textContent = text('locationSuccess')
        .replace('{country}', countryName)
        .replace('{currency}', code);
    }
    saveAccountPreferences();
  } catch (error) {
    if (error.message === 'denied') {
      if (!silent) elements.locationStatus.textContent = text('locationDenied');
    } else if (error.message === 'unsupported') {
      if (!silent) elements.locationStatus.textContent = text('locationUnsupported');
    } else {
      console.warn('Location-based currency selection failed:', error);
      if (!silent) elements.locationStatus.textContent = text('locationUnavailable');
    }
  } finally {
    elements.location.disabled = false;
  }
}

async function detectPreviouslyAllowedLocation() {
  if (!navigator.permissions?.query || !navigator.geolocation) return;
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    if (permission.state === 'granted') await detectLocationCurrency(true);
  } catch (error) {
    console.warn('Existing location permission could not be checked:', error);
  }
}

function updateConversion() {
  if (!rates.length) {
    elements.result.textContent = '—';
    elements.copy.disabled = true;
    latestResult = '';
    return;
  }

  const amount = Number(elements.amount.value);
  if (!elements.amount.value.trim() || !Number.isFinite(amount) || amount < 0) {
    elements.result.textContent = text('invalidAmount');
    elements.copy.disabled = true;
    latestResult = '';
    return;
  }
  const fromRate = readUnitRate(elements.from.value);
  const toRate = readUnitRate(elements.to.value);
  if (!fromRate || !toRate) {
    elements.result.textContent = text('missingRate');
    elements.copy.disabled = true;
    latestResult = '';
    return;
  }
  const value = amount * fromRate / toRate;
  if (!Number.isFinite(value)) {
    elements.result.textContent = text('missingRate');
    elements.copy.disabled = true;
    latestResult = '';
    return;
  }
  const digits = value >= 1000 ? 2 : value >= 1 ? 4 : 6;
  latestResult = `${formatNumber(value, { maximumFractionDigits: digits })} ${elements.to.value}`;
  elements.result.textContent = latestResult;
  elements.copy.disabled = false;
}

function parsePublishedDate(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value || ''));
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(date.getTime())
    || date.getFullYear() !== Number(year)
    || date.getMonth() !== Number(month) - 1
    || date.getDate() !== Number(day)
    ? null
    : date;
}

function todayLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function showAlert(message, isError = false) {
  elements.alert.textContent = message;
  elements.alert.classList.toggle('d-none', !message);
  elements.alert.classList.toggle('is-error', isError);
}

function updateSourceMetadata() {
  const provider = rateProviders[activeProviderId];
  elements.sourceLabel.textContent = text(provider.labelKey);
  document.getElementById('currency-source-chip-label').textContent = text(provider.labelKey);
  elements.sourceLink.href = provider.link;
  elements.sourceLink.textContent = text(provider.labelKey);
  elements.faqSource.textContent = text(provider.labelKey);
  elements.rateHeading.textContent = text('rateHead').replace('{base}', baseCurrencyCode);
  document.getElementById('hero-default-coin').textContent = baseCurrencyCode;
}

function buildRatesUrl(providerId) {
  const provider = rateProviders[providerId];
  if (providerId !== 'eu') return provider.url;
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - 14 * 86400000);
  const toIsoDate = (date) => date.toISOString().slice(0, 10);
  const seriesKey = `D.${ECB_CURRENCIES.join('+')}.EUR.SP00.A`;
  const url = new URL(`${provider.url}${seriesKey}`);
  url.search = new URLSearchParams({
    startPeriod: toIsoDate(startDate),
    endPeriod: toIsoDate(endDate),
    format: 'jsondata'
  });
  return url.href;
}

function toPublishedDate(isoDate) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(isoDate || ''));
  if (!match) return '';
  return `${match[3]}.${match[2]}.${match[1]}`;
}

function makeCurrencyNameFields(code) {
  return {
    CcyNm_UZ: currencyDisplayName(code, 'uz-UZ'),
    CcyNm_RU: currencyDisplayName(code, 'ru-RU'),
    CcyNm_EN: currencyDisplayName(code, 'en')
  };
}

function normalizeEcbRates(payload) {
  const dimensions = payload?.structure?.dimensions;
  const currencyValues = dimensions?.series?.find((dimension) => dimension.id === 'CURRENCY')?.values;
  const periods = dimensions?.observation?.find((dimension) => dimension.id === 'TIME_PERIOD')?.values;
  const series = payload?.dataSets?.[0]?.series;
  if (!Array.isArray(currencyValues) || !Array.isArray(periods) || !series) {
    throw new Error('The European Central Bank response did not contain the expected series data.');
  }
  const valuesByCurrency = new Map();
  for (const [key, entry] of Object.entries(series)) {
    const currencyIndex = Number(key.split(':')[1]);
    const currencyCode = currencyValues[currencyIndex]?.id;
    if (!/^[A-Z]{3}$/.test(currencyCode || '')) continue;
    const observations = Object.entries(entry.observations || {})
      .map(([index, observation]) => ({
        date: typeof periods[Number(index)] === 'string' ? periods[Number(index)] : periods[Number(index)]?.id,
        value: Number(observation?.[0])
      }))
      .filter((observation) => /^\d{4}-\d{2}-\d{2}$/.test(observation.date || '')
        && Number.isFinite(observation.value) && observation.value > 0)
      .sort((first, second) => first.date.localeCompare(second.date));
    if (observations.length) valuesByCurrency.set(currencyCode, observations);
  }
  const latestDate = [...valuesByCurrency.values()]
    .flatMap((observations) => observations.map((observation) => observation.date))
    .sort()
    .at(-1);
  if (!latestDate) throw new Error('The European Central Bank did not return a current observation.');
  return [...valuesByCurrency.entries()].flatMap(([code, observations]) => {
    const currentIndex = observations.findIndex((observation) => observation.date === latestDate);
    if (currentIndex < 0) return [];
    const current = observations[currentIndex];
    const previous = observations[currentIndex - 1];
    const rate = 1 / current.value;
    const diff = previous ? rate - (1 / previous.value) : Number.NaN;
    return [{
      Ccy: code,
      ...makeCurrencyNameFields(code),
      Nominal: '1',
      Rate: String(rate),
      Diff: String(diff),
      Date: toPublishedDate(latestDate)
    }];
  });
}

function normalizeBankOfCanadaRates(payload) {
  const observations = payload?.observations;
  if (!Array.isArray(observations)) {
    throw new Error('The Bank of Canada response did not contain an observations list.');
  }
  const datedRows = observations.filter((row) => /^\d{4}-\d{2}-\d{2}$/.test(row?.d || ''));
  const latestDate = datedRows.map((row) => row.d).sort().at(-1);
  const current = datedRows.find((row) => row.d === latestDate);
  const previous = datedRows.filter((row) => row.d < latestDate).sort((a, b) => b.d.localeCompare(a.d))[0];
  if (!current) throw new Error('The Bank of Canada did not return a current observation.');
  return Object.entries(current).flatMap(([seriesCode, observation]) => {
    const match = /^FX([A-Z]{3})CAD$/.exec(seriesCode);
    const rate = Number(observation?.v);
    if (!match || !Number.isFinite(rate) || rate <= 0) return [];
    const previousRate = Number(previous?.[seriesCode]?.v);
    return [{
      Ccy: match[1],
      ...makeCurrencyNameFields(match[1]),
      Nominal: '1',
      Rate: String(rate),
      Diff: String(Number.isFinite(previousRate) && previousRate > 0 ? rate - previousRate : Number.NaN),
      Date: toPublishedDate(latestDate)
    }];
  });
}

async function fetchRateData(providerId, signal) {
  const response = await fetch(buildRatesUrl(providerId), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal
  });
  if (!response.ok) throw new Error(`${text(rateProviders[providerId].labelKey)} returned HTTP ${response.status}.`);
  const body = await response.json();
  if (providerId === 'eu') return normalizeEcbRates(body);
  if (providerId === 'ca') return normalizeBankOfCanadaRates(body);
  if (!Array.isArray(body)) throw new Error('The Central Bank of Uzbekistan returned an unexpected response.');
  return body;
}

function sourceFallbackMessage() {
  return providerForCountry(selectedCountryCode)
    ? ''
    : text('sourceFallback').replace('{source}', text(rateProviders[activeProviderId].labelKey));
}

function updateRateWarnings() {
  const published = parsePublishedDate(rateDate);
  showAlert([
    ratesOffline ? text('offline') : '',
    published && published < todayLocal() ? text('stale') : '',
    sourceFallbackMessage()
  ].filter(Boolean).join(' '));
}

function applyRateData(data, savedAt = new Date().toISOString()) {
  if (!Array.isArray(data) || !data.length) throw new Error('The currency data response was empty.');
  const validRates = data.filter((item) => {
    const nominal = Number(item?.Nominal);
    const rate = Number(item?.Rate);
    return /^[A-Z]{3}$/.test(item?.Ccy || '')
      && Number.isFinite(nominal) && nominal > 0
      && Number.isFinite(rate) && rate > 0
      && parsePublishedDate(item.Date);
  });
  if (!validRates.length) throw new Error('The currency data response did not contain valid rates.');
  baseCurrencyCode = rateProviders[activeProviderId].base;
  const date = validRates[0].Date;
  rates = validRates.filter((item) => item.Date === date && item.Ccy !== baseCurrencyCode);
  rateDate = date;
  elements.date.textContent = formatPublishedDate(date);
  updateSourceMetadata();
  if (selectorsInitialized && !rates.some((item) => item.Ccy === preferredFrom) && preferredFrom !== baseCurrencyCode) {
    preferredFrom = baseCurrencyCode === 'USD' ? 'EUR' : 'USD';
  }
  if (selectorsInitialized && !rates.some((item) => item.Ccy === preferredTo) && preferredTo !== baseCurrencyCode) {
    preferredTo = baseCurrencyCode;
  }
  try {
    localStorage.setItem(rateProviders[activeProviderId].cacheKey, JSON.stringify({ rates, rateDate, baseCurrencyCode, savedAt }));
  } catch (error) {
    console.warn('Currency rates could not be cached:', error);
  }
  renderRateSelectors();
  renderHistoryCurrencyOptions();
  renderRates();
  updateConversion();
  ratesOffline = false;
  updateRateWarnings();
  loadCurrencyHistory();
}

function formatPublishedDate(value) {
  const date = parsePublishedDate(value);
  if (!date) return value || text('noCache');
  const locale = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB', ar: 'ar' }[language];
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

async function loadRates(silent = false) {
  if (refreshInProgress) return;
  refreshInProgress = true;
  if (!silent) {
    elements.refresh.disabled = true;
    elements.refresh.querySelector('span').textContent = text('retrying');
    showAlert('');
  }
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  const provider = rateProviders[activeProviderId];
  try {
    applyRateData(await fetchRateData(activeProviderId, controller.signal));
  } catch (error) {
    if (silent && rates.length) {
      console.warn('Automatic currency rate refresh failed; keeping the last displayed rates:', error);
      return;
    }
    console.error(`${text(provider.labelKey)} rate request failed:`, error);
    let cached = null;
    try {
      cached = JSON.parse(localStorage.getItem(provider.cacheKey)
        || (activeProviderId === 'uz' ? localStorage.getItem(CACHE_KEY) : 'null')
        || 'null');
    } catch (cacheError) {
      console.warn('Saved currency rates could not be read:', cacheError);
    }
    if (cached?.rates && cached?.rateDate) {
      rates = cached.rates;
      rateDate = cached.rateDate;
      baseCurrencyCode = provider.base;
      elements.date.textContent = formatPublishedDate(rateDate);
      updateSourceMetadata();
      renderRateSelectors();
      renderHistoryCurrencyOptions();
      renderRates();
      updateConversion();
      ratesOffline = true;
      updateRateWarnings();
      loadCurrencyHistory();
    } else {
      elements.date.textContent = text('noCache');
      elements.rows.innerHTML = `<tr><td colspan="6" class="currency-table-message">${escapeHtml(text('noCache'))}</td></tr>`;
      showAlert(text('noCache'), true);
      elements.copy.disabled = true;
    }
  } finally {
    window.clearTimeout(timeout);
    refreshInProgress = false;
    if (!silent) {
      elements.refresh.disabled = false;
      elements.refresh.querySelector('span').textContent = text('refresh');
    }
  }
}

function searchText(rate) {
  const normalized = (value) => String(value || '').toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const aliases = {
    USD: 'dollar dollar dollar США доллар dollar америка aqsh amerika',
    EUR: 'euro евро evro yevro yevropa',
    RUB: 'ruble rubl рубль rossiya rossiya rubli russia',
    KZT: 'tenge тенге tengе qozogiston kazakhstan',
    TRY: 'lira лира turkiya turkey',
    CNY: 'yuan юань xitoy china',
    GBP: 'pound funt фунт angliya britain',
    AED: 'dirham дирхам arab emirates',
    KGS: 'som som qirgiz somi kyrgyzstan',
    JPY: 'yen iyena иена yaponiya japan',
    UZS: 'uzbekistani so‘m uzbek som сум uzbekistan'
  };
  return normalized([
    rate.Ccy, rate.CcyNm_UZ, rate.CcyNm_UZC, rate.CcyNm_RU, rate.CcyNm_EN, aliases[rate.Ccy]
  ].join(' '));
}

function visibleRates() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  return currencyEntries().filter((rate) => {
    if (!query && filter === 'popular' && !popularCodes.includes(rate.Ccy)) return false;
    if (filter === 'favorites' && !favorites.includes(rate.Ccy)) return false;
    if (!query) return true;
    return searchText(rate).includes(query);
  });
}

function renderRates() {
  if (!rates.length) return;
  const shown = visibleRates();
  elements.favoriteCount.textContent = String(favorites.length);
  elements.count.textContent = text('count').replace('{count}', formatNumber(shown.length));
  if (!shown.length) {
    const emptyMessage = filter === 'favorites' && !favorites.length ? text('noFavorites') : text('noResults');
    elements.rows.innerHTML = `<tr><td colspan="6" class="currency-table-message">${escapeHtml(emptyMessage)}</td></tr>`;
    return;
  }
  elements.rows.innerHTML = shown.map((rate) => {
    const nominal = Number(rate.Nominal);
    const perUnit = Number(rate.Rate) / nominal;
    const diff = Number(rate.Diff);
    const isFavorite = favorites.includes(rate.Ccy);
    const changeClass = !Number.isFinite(diff) || diff === 0 ? 'flat' : diff > 0 ? 'up' : 'down';
    const changeLabel = changeClass === 'up' ? text('changeUp') : changeClass === 'down' ? text('changeDown') : text('unchanged');
    const formattedDiff = Number.isFinite(diff) ? `${diff > 0 ? '+' : ''}${formatRate(diff)}` : '—';
    const formattedNominal = formatNumber(nominal, { maximumFractionDigits: 4 });
    return `<tr>
      <td><div class="currency-name-cell"><span class="currency-flag"><i class="bi bi-currency-exchange" aria-hidden="true"></i></span><span><strong>${escapeHtml(localizedName(rate))}</strong><small>${escapeHtml(rate.Ccy)}</small></span></div></td>
      <td><span class="currency-code">${escapeHtml(rate.Ccy)}</span></td>
      <td class="text-end">${formattedNominal}</td>
      <td class="text-end"><span class="currency-rate-value">${formatRate(perUnit)}</span></td>
      <td class="text-end"><span class="currency-change ${changeClass}" title="${escapeHtml(changeLabel)}">${formattedDiff}</span></td>
      <td><div class="currency-row-actions">
        <button type="button" data-use="${escapeHtml(rate.Ccy)}" aria-label="${escapeHtml(text('use'))}" title="${escapeHtml(text('use'))}"><i class="bi bi-arrow-left-right" aria-hidden="true"></i></button>
        <button type="button" data-favorite="${escapeHtml(rate.Ccy)}" class="${isFavorite ? 'is-favorite' : ''}" aria-label="${escapeHtml(isFavorite ? text('removeFavorite') : text('addFavorite'))}" title="${escapeHtml(isFavorite ? text('removeFavorite') : text('addFavorite'))}"><i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i></button>
      </div></td>
    </tr>`;
  }).join('');
}

function renderHistoryCurrencyOptions() {
  const options = currencyEntries()
    .filter((rate) => rate.Ccy !== baseCurrencyCode)
    .sort((first, second) => localizedName(first).localeCompare(localizedName(second), language));
  if (!options.length) {
    elements.historyCurrency.replaceChildren();
    return;
  }
  const selected = options.some((rate) => rate.Ccy === elements.historyCurrency.value)
    ? elements.historyCurrency.value
    : options.some((rate) => rate.Ccy === 'USD') ? 'USD' : options[0].Ccy;
  elements.historyCurrency.innerHTML = options.map((rate) =>
    `<option value="${escapeHtml(rate.Ccy)}">${escapeHtml(rate.Ccy)} — ${escapeHtml(localizedName(rate))}</option>`
  ).join('');
  elements.historyCurrency.value = selected;
}

function isoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function historyCacheKey(providerId, code, days) {
  return `currency-history-v1:${providerId}:${code}:${days}`;
}

function readHistoryCache(key) {
  try {
    const cached = JSON.parse(localStorage.getItem(key) || 'null');
    if (Array.isArray(cached?.points) && Date.now() - cached.savedAt < 6 * 60 * 60 * 1000) {
      return cached.points;
    }
  } catch (error) {
    console.warn('Saved currency history could not be read:', error);
  }
  return null;
}

function writeHistoryCache(key, points) {
  try {
    localStorage.setItem(key, JSON.stringify({ points, savedAt: Date.now() }));
  } catch (error) {
    console.warn('Currency history could not be cached:', error);
  }
}

async function fetchHistoryPoints(providerId, code, days, signal) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  const startDate = isoDate(start);
  const endDate = isoDate(end);

  if (providerId === 'eu') {
    const url = `${rateProviders.eu.url}D.${encodeURIComponent(code)}.EUR.SP00.A?startPeriod=${startDate}&endPeriod=${endDate}&format=csvdata`;
    const response = await fetch(url, { headers: { Accept: 'text/csv' }, cache: 'no-store', signal });
    if (!response.ok) throw new Error(`European Central Bank history returned HTTP ${response.status}.`);
    const rows = (await response.text()).trim().split(/\r?\n/).slice(1);
    return rows.flatMap((row) => {
      const columns = row.split(',');
      const value = Number(columns[7]);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(columns[6] || '') || !Number.isFinite(value) || value <= 0) return [];
      return [{ date: columns[6], value: 1 / value }];
    });
  }

  if (providerId === 'ca') {
    const url = `https://www.bankofcanada.ca/valet/observations/group/FX_RATES_DAILY/json?start_date=${startDate}&end_date=${endDate}`;
    const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal });
    if (!response.ok) throw new Error(`Bank of Canada history returned HTTP ${response.status}.`);
    const payload = await response.json();
    const seriesKey = `FX${code}CAD`;
    return (payload.observations || []).flatMap((row) => {
      const value = Number(row?.[seriesKey]?.v);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(row?.d || '') || !Number.isFinite(value) || value <= 0) return [];
      return [{ date: row.d, value }];
    });
  }

  const sampleCount = Math.min(30, Math.max(15, Math.ceil(days / 12)));
  const dates = Array.from({ length: sampleCount }, (_, index) => {
    const date = new Date(start);
    date.setDate(date.getDate() + Math.round((days * index) / (sampleCount - 1)));
    return isoDate(date);
  });
  const points = [];
  for (let offset = 0; offset < dates.length; offset += 4) {
    const batch = await Promise.allSettled(dates.slice(offset, offset + 4).map(async (date) => {
      const url = `https://cbu.uz/en/arkhiv-kursov-valyut/json/${encodeURIComponent(code)}/${date}/`;
      const response = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store', signal });
      if (!response.ok) throw new Error(`Central Bank of Uzbekistan history returned HTTP ${response.status}.`);
      const data = await response.json();
      const item = Array.isArray(data) ? data.find((entry) => entry.Ccy === code) : null;
      const published = parsePublishedDate(item?.Date);
      const nominal = Number(item?.Nominal);
      const value = Number(item?.Rate) / nominal;
      if (!published || !Number.isFinite(value) || value <= 0) return null;
      return { date: isoDate(published), value };
    }));
    for (const result of batch) {
      if (result.status === 'fulfilled' && result.value) points.push(result.value);
      else if (result.status === 'rejected' && result.reason?.name !== 'AbortError') {
        console.warn('A historical CBU rate observation could not be loaded:', result.reason);
      }
    }
  }
  return points;
}

function renderHistoryChart(points, code) {
  if (!points.length) {
    elements.historyWrap.classList.remove('has-data');
    elements.historyDownload.disabled = true;
    elements.historyStatus.textContent = text('historyUnavailable');
    elements.historyChart.replaceChildren();
    elements.historyLabel.textContent = `${code} · ${baseCurrencyCode}`;
    elements.historyChange.textContent = '—';
    return;
  }
  const sorted = [...new Map(points.map((point) => [point.date, point])).values()]
    .sort((first, second) => first.date.localeCompare(second.date));
  if (sorted.length < 2) {
    elements.historyWrap.classList.remove('has-data');
    elements.historyDownload.disabled = true;
    elements.historyStatus.textContent = text('historyUnavailable');
    elements.historyChart.replaceChildren();
    return;
  }

  const width = 800;
  const height = 300;
  const plot = { left: 82, right: 775, top: 22, bottom: 244 };
  const values = sorted.map((point) => point.value);
  const minimum = Math.min(...values);
  const maximum = Math.max(...values);
  const spread = maximum - minimum || maximum * 0.02 || 1;
  const low = minimum - spread * 0.12;
  const high = maximum + spread * 0.12;
  const x = (index) => plot.left + (sorted.length === 1 ? 0 : index * (plot.right - plot.left) / (sorted.length - 1));
  const y = (value) => plot.bottom - (value - low) * (plot.bottom - plot.top) / (high - low);
  const line = sorted.map((point, index) => `${index ? 'L' : 'M'} ${x(index).toFixed(2)} ${y(point.value).toFixed(2)}`).join(' ');
  const area = `${line} L ${x(sorted.length - 1).toFixed(2)} ${plot.bottom} L ${plot.left} ${plot.bottom} Z`;
  const locale = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-GB', ar: 'ar' }[language];
  const formatter = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' });
  const grid = Array.from({ length: 4 }, (_, index) => {
    const value = high - (high - low) * index / 3;
    const yPosition = plot.top + (plot.bottom - plot.top) * index / 3;
    return `<line class="history-grid-line" x1="${plot.left}" y1="${yPosition}" x2="${plot.right}" y2="${yPosition}"></line><text class="history-axis-label" x="${plot.left - 10}" y="${yPosition + 4}" text-anchor="end">${escapeHtml(formatRate(value))}</text>`;
  }).join('');
  const labelIndices = [...new Set([0, Math.floor((sorted.length - 1) / 2), sorted.length - 1])];
  const dates = labelIndices.map((index) => {
    const date = parsePublishedDate(toPublishedDate(sorted[index].date));
    return `<text class="history-axis-label" x="${x(index)}" y="${height - 18}" text-anchor="${index === 0 ? 'start' : index === sorted.length - 1 ? 'end' : 'middle'}">${escapeHtml(date ? formatter.format(date) : sorted[index].date)}</text>`;
  }).join('');
  const circles = sorted.map((point, index) =>
    `<circle class="history-point" cx="${x(index)}" cy="${y(point.value)}" r="${sorted.length < 20 ? 4 : 2.5}"><title>${escapeHtml(formatter.format(parsePublishedDate(toPublishedDate(point.date))))} · ${escapeHtml(formatRate(point.value))} ${escapeHtml(baseCurrencyCode)}</title></circle>`
  ).join('');
  elements.historyChart.innerHTML = `<defs><linearGradient id="history-area-gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#087b55" stop-opacity=".22"></stop><stop offset="100%" stop-color="#087b55" stop-opacity=".01"></stop></linearGradient></defs>${grid}<path class="history-area" d="${area}"></path><path class="history-line" d="${line}"></path>${circles}${dates}`;
  elements.historyChart.setAttribute('aria-label', `${text('historyTitle')}: ${code} in ${baseCurrencyCode}`);
  elements.historyWrap.classList.add('has-data');
  elements.historyDownload.disabled = false;
  elements.historyStatus.textContent = '';
  const first = sorted[0].value;
  const last = sorted[sorted.length - 1].value;
  const percent = first ? ((last - first) / first) * 100 : 0;
  const changeKey = percent > 0.005 ? 'historyIncrease' : percent < -0.005 ? 'historyDecrease' : 'historyNoChange';
  elements.historyChange.textContent = text(changeKey).replace('{percent}', formatNumber(Math.abs(percent), { maximumFractionDigits: 2 }));
  elements.historyLabel.textContent = `1 ${code} = ${formatRate(last)} ${baseCurrencyCode} · ${formatPublishedDate(toPublishedDate(sorted[sorted.length - 1].date))}`;
}

async function loadCurrencyHistory(forceRefresh = false) {
  const code = elements.historyCurrency.value;
  if (!rates.length || !code) {
    elements.historyStatus.textContent = text('historyLoading');
    elements.historyChart.replaceChildren();
    elements.historyDownload.disabled = true;
    elements.historyRefresh.disabled = !rates.length;
    return;
  }
  const requestId = ++historyRequestId;
  const key = historyCacheKey(activeProviderId, code, historyDays);
  const cached = forceRefresh ? null : readHistoryCache(key);
  if (cached) {
    historySeries = cached;
    renderHistoryChart(historySeries, code);
    return;
  }
  const keepExistingChart = elements.historyWrap.classList.contains('has-data');
  if (!keepExistingChart) elements.historyWrap.classList.remove('has-data');
  elements.historyStatus.textContent = text('historyLoading');
  if (!keepExistingChart) elements.historyChart.replaceChildren();
  elements.historyLabel.textContent = `${code} · ${baseCurrencyCode}`;
  elements.historyChange.textContent = '—';
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25000);
  try {
    const points = await fetchHistoryPoints(activeProviderId, code, historyDays, controller.signal);
    if (requestId !== historyRequestId) return;
    historySeries = [...new Map(points.map((point) => [point.date, point])).values()]
      .sort((first, second) => first.date.localeCompare(second.date));
    if (historySeries.length < 2) throw new Error(text('historyUnavailable'));
    writeHistoryCache(key, historySeries);
    renderHistoryChart(historySeries, code);
  } catch (error) {
    if (requestId !== historyRequestId) return;
    console.error('Currency history could not be loaded:', error);
    if (keepExistingChart) {
      showAlert(error.message === text('historyUnavailable') ? text('historyUnavailable') : text('historyError'), true);
    } else {
      elements.historyStatus.textContent = error.message === text('historyUnavailable')
        ? text('historyUnavailable')
        : text('historyError');
      elements.historyChart.replaceChildren();
    }
  } finally {
    window.clearTimeout(timeout);
    elements.historyRefresh.disabled = false;
    elements.historyRefresh.classList.remove('is-loading');
  }
}

function downloadHistoryChart() {
  if (elements.historyDownload.disabled || !elements.historyChart.childElementCount) return;
  const svg = elements.historyChart.cloneNode(true);
  const namespace = 'http://www.w3.org/2000/svg';
  const styles = getComputedStyle(document.body);
  const card = elements.historyWrap.closest('.currency-history-card');
  const backgroundColor = getComputedStyle(card).backgroundColor;
  const background = document.createElementNS(namespace, 'rect');
  background.setAttribute('width', '800');
  background.setAttribute('height', '300');
  background.setAttribute('fill', backgroundColor);
  const style = document.createElementNS(namespace, 'style');
  style.textContent = `.history-grid-line{stroke:${styles.getPropertyValue('--currency-line')}}.history-axis-label{fill:${styles.getPropertyValue('--currency-muted')};font:12px Arial,sans-serif}.history-line{fill:none;stroke:${styles.getPropertyValue('--currency-green')};stroke-width:3}.history-point{fill:${backgroundColor};stroke:${styles.getPropertyValue('--currency-green')};stroke-width:3}`;
  svg.insertBefore(background, svg.firstChild);
  svg.insertBefore(style, background.nextSibling);
  svg.setAttribute('xmlns', namespace);
  svg.setAttribute('width', '1600');
  svg.setAttribute('height', '600');
  const imageUrl = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' }));
  const image = new Image();
  image.onload = () => {
    URL.revokeObjectURL(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    if (!context) {
      showAlert(text('historyExportError'), true);
      return;
    }
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) {
        showAlert(text('historyExportError'), true);
        return;
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `currency-${elements.historyCurrency.value}-${historyDays}d.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }, 'image/png');
  };
  image.onerror = (error) => {
    URL.revokeObjectURL(imageUrl);
    console.error('Currency history chart image export failed:', error);
    showAlert(text('historyExportError'), true);
  };
  image.src = imageUrl;
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.warn('Currency favorites could not be saved:', error);
    showAlert(text('storageError'), true);
  }
  saveAccountPreferences();
  renderCurrencyProfile();
}

async function signInToCurrencyAccount() {
  elements.signIn.disabled = true;
  elements.accountStatus.textContent = text('accountWorking');
  try {
    const client = await getAccountClient();
    const { user } = await client.signIn();
    await finishCurrencySignIn(client, user);
  } catch (error) {
    console.error('Google currency sign-in failed:', error);
    elements.accountStatus.textContent = text('accountError');
  } finally {
    elements.signIn.disabled = false;
  }
}

async function finishCurrencySignIn(client, user) {
  accountUser = user;
  updateAccountStatus();
  elements.emailStatus.textContent = '';
  let preferences;
  try {
    preferences = await client.loadPreferences();
  } catch (error) {
    console.error('Signed-in currency preferences could not be loaded:', error);
    elements.accountStatus.textContent = text('accountSyncError');
    return;
  }
  applyAccountPreferences(preferences);
  try {
    const savedPreferences = accountPreferences();
    await client.savePreferences(savedPreferences);
    lastSavedAccountPreferences = JSON.stringify(savedPreferences);
  } catch (error) {
    console.error('Initial currency preferences could not be saved:', error);
    elements.accountStatus.textContent = text('accountSyncError');
  }
}

async function signInWithEmail(createAccount = false) {
  const email = elements.email.value.trim();
  const password = elements.password.value;
  const submitButton = createAccount ? elements.emailRegister : elements.emailLogin;
  submitButton.disabled = true;
  elements.emailLogin.disabled = true;
  elements.emailRegister.disabled = true;
  elements.emailStatus.textContent = text('emailWorking');
  try {
    const client = await getAccountClient();
    const result = createAccount
      ? await client.registerWithEmail(email, password)
      : await client.signInWithEmail(email, password);
    await finishCurrencySignIn(client, result.user);
  } catch (error) {
    console.error(`Currency email ${createAccount ? 'registration' : 'sign-in'} failed:`, error);
    elements.emailStatus.textContent = text(createAccount ? 'emailRegisterError' : 'emailError');
  } finally {
    elements.emailLogin.disabled = false;
    elements.emailRegister.disabled = false;
  }
}

async function signOutOfCurrencyAccount() {
  elements.signOut.disabled = true;
  try {
    const client = await getAccountClient();
    await client.signOut();
    accountUser = null;
    lastSavedAccountPreferences = '';
    elements.emailForm.hidden = true;
    elements.emailStatus.textContent = '';
    elements.password.value = '';
    updateAccountStatus();
  } catch (error) {
    console.error('Currency account sign-out failed:', error);
    elements.accountStatus.textContent = text('accountSyncError');
  } finally {
    elements.signOut.disabled = false;
  }
}

function initializeCurrencyPage() {
  document.getElementById('current-year').textContent = String(new Date().getFullYear());
  elements.language.addEventListener('change', () => setLanguage(elements.language.value));
  elements.theme.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('currency-dark') ? 'light' : 'dark';
    themeMode = nextTheme;
    try {
      localStorage.setItem(THEME_KEY, themeMode);
    } catch (error) {
      console.warn('Currency theme preference could not be saved:', error);
    }
    applyTheme();
    saveAccountPreferences();
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (themeMode === 'system') applyTheme();
  });
  elements.location.addEventListener('click', () => detectLocationCurrency());
  elements.amount.addEventListener('input', updateConversion);
  elements.fromSearch.addEventListener('input', () => {
    renderRateSelectors();
    updateConversion();
  });
  elements.toSearch.addEventListener('input', () => {
    renderRateSelectors();
    updateConversion();
  });
  elements.from.addEventListener('change', () => {
    elements.fromSearch.value = '';
    preferredFrom = elements.from.value;
    renderRateSelectors();
    updateConversion();
    saveAccountPreferences();
  });
  elements.to.addEventListener('change', () => {
    elements.toSearch.value = '';
    preferredTo = elements.to.value;
    renderRateSelectors();
    updateConversion();
    saveAccountPreferences();
  });
  elements.search.addEventListener('input', renderRates);
  elements.refresh.addEventListener('click', () => loadRates());
  elements.signIn.addEventListener('click', signInToCurrencyAccount);
  elements.emailToggle.addEventListener('click', () => {
    elements.emailForm.hidden = !elements.emailForm.hidden;
    elements.emailStatus.textContent = '';
    if (!elements.emailForm.hidden) elements.email.focus();
  });
  elements.emailForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (elements.emailForm.reportValidity()) signInWithEmail(false);
  });
  elements.emailRegister.addEventListener('click', () => {
    if (elements.emailForm.reportValidity()) signInWithEmail(true);
  });
  elements.signOut.addEventListener('click', signOutOfCurrencyAccount);
  elements.historyCurrency.addEventListener('change', loadCurrencyHistory);
  elements.historyRefresh.addEventListener('click', () => {
    elements.historyRefresh.disabled = true;
    elements.historyRefresh.classList.add('is-loading');
    loadCurrencyHistory(true);
  });
  elements.historyDownload.addEventListener('click', downloadHistoryChart);
  document.querySelectorAll('[data-history-days]').forEach((button) => {
    button.addEventListener('click', () => {
      historyDays = Number(button.dataset.historyDays);
      document.querySelectorAll('[data-history-days]').forEach((option) => {
        option.classList.toggle('active', option === button);
        option.setAttribute('aria-pressed', String(option === button));
      });
      loadCurrencyHistory();
    });
  });
  document.getElementById('swap-currencies').addEventListener('click', () => {
    const previousFrom = elements.from.value;
    elements.from.value = elements.to.value;
    elements.to.value = previousFrom;
    preferredFrom = elements.from.value;
    preferredTo = elements.to.value;
    elements.fromSearch.value = '';
    elements.toSearch.value = '';
    renderRateSelectors();
    updateConversion();
    saveAccountPreferences();
  });
  elements.rows.addEventListener('click', (event) => {
    const favoriteButton = event.target.closest('[data-favorite]');
    if (favoriteButton) {
      const { favorite: code } = favoriteButton.dataset;
      favorites = favorites.includes(code) ? favorites.filter((item) => item !== code) : [...favorites, code];
      saveFavorites();
      renderRates();
      return;
    }
    const useButton = event.target.closest('[data-use]');
    if (useButton) {
      const code = useButton.dataset.use;
      elements.from.value = code === baseCurrencyCode ? 'USD' : code;
      elements.to.value = baseCurrencyCode;
      preferredFrom = elements.from.value;
      preferredTo = elements.to.value;
      elements.fromSearch.value = '';
      elements.toSearch.value = '';
      renderRateSelectors();
      elements.amount.value = '1';
      updateConversion();
      saveAccountPreferences();
      document.getElementById('converter-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  document.querySelectorAll('[data-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      filter = button.dataset.filter;
      document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
      renderRates();
    });
  });
  elements.copy.addEventListener('click', async () => {
    if (!latestResult) return;
    try {
      await navigator.clipboard.writeText(latestResult);
      elements.copy.querySelector('span').textContent = text('copied');
      window.setTimeout(() => { elements.copy.querySelector('span').textContent = text('copy'); }, 1600);
    } catch (error) {
      console.error('Currency result copy failed:', error);
      showAlert(text('copyError'), true);
    }
  });
  elements.language.value = language;
  applyTheme();
  setLanguage(language);
  initializeAccount();
  loadRates().then(detectPreviouslyAllowedLocation);
  window.setInterval(() => {
    if (document.visibilityState === 'visible') loadRates(true);
  }, 60_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') loadRates(true);
  });
}

initializeCurrencyPage();
