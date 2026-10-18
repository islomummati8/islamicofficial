import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { createUserWithEmailAndPassword, getAuth, GoogleAuthProvider, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { doc, getDoc, getFirestore, serverTimestamp, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

(() => {
  const KAABA = { latitude: 21.422487, longitude: 39.826206 };
  const dhikrNames = ['Subhanalloh', 'Alhamdulillah', 'Allohu akbar', 'Istigfor'];
  const dhikrLabels = { Subhanalloh: 'Subhanalloh', Alhamdulillah: 'Alhamdulillah', 'Allohu akbar': 'Allohu akbar', Istigfor: 'Istig‘for' };
  const allowedCurrencies = ['UZS', 'USD', 'EUR', 'KGS', 'KZT', 'RUB', 'TRY'];
  const locationButton = document.getElementById('location-button');
  const locationStatus = document.getElementById('location-status');
  const qiblaResult = document.getElementById('qibla-result');
  const qiblaDistanceElement = document.getElementById('qibla-distance');
  const qiblaButton = document.getElementById('qibla-button');
  const qiblaStatus = document.getElementById('qibla-status');
  const compassElement = document.getElementById('qibla-compass');
  const compassFace = document.getElementById('compass-face');
  const qiblaNeedle = document.getElementById('qibla-needle');
  let qiblaBearing = null;
  let qiblaDistanceKm = null;
  let compassHeading = null;
  let compassDisplayDegree = null;
  let compassHeadingDetected = false;
  let qiblaStatusKey = 'qiblaCompassPrompt';
  let qiblaStatusValues = {};
  let orientationListening = false;
  const accountStatus = document.getElementById('account-status');
  const prayerNames = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
  const storagePrefix = 'io-daily-tools:';
  const translations = {
    en: {
      emailLogin: 'Sign in with email', language: 'Language', darkMode: 'Dark mode', lightMode: 'Light mode',
      privateSync: 'PRIVATE SYNC', emailSyncNote: 'Use your email and password to sync your personal tools on your devices.',
      emailAddress: 'Email address', password: 'Password', signIn: 'Sign in', createAccount: 'Create an account',
      forgotPassword: 'Forgot password?', signOut: 'Sign out', googleSync: 'Continue with Google', mainSite: 'Main site',
      dailyTools: 'Daily tools', prayerTimes: 'Prayer times', qibla: 'Qibla', tasbih: 'Tasbih', zakat: 'Zakat',
      hijriDate: 'Hijri date', heroEyebrow: 'Free · private · mobile-friendly', heroTitle: 'Helpful tools for',
      heroTitleAccent: 'daily worship', heroDescription: 'Check prayer times, find the Qibla, count dhikr and estimate zakat — all in one place.',
      exploreTools: 'Explore the tools', allInOne: 'All in one place', toolsCount: '5 useful tools', todaysDate: 'TODAY',
      hijriCalendarView: "Today's date in the Hijri calendar", dateLoading: 'Loading date…',
      moonSightingNote: 'Hijri dates may vary with local moon sighting.', forYou: 'FOR YOU', usefulTools: 'Useful tools',
      privacyLocation: 'Your location is requested only when you ask for it. Your data is not used for advertising or tracking.',
      locationBased: 'LOCATION BASED', prayerDescription: "Get today's prayer schedule based on your GPS location.",
      findLocation: 'Use my location', locationPermission: 'Location is used only with your permission.',
      prayerMethodNote: 'Calculation: Muslim World League. Times may differ slightly from your local mosque.',
      directionCard: 'DIRECTION', qiblaDirection: 'Qibla direction',
      qiblaDescription: 'Find the direction from your location to the Kaaba.',
      qiblaPrompt: 'Allow location above to calculate direction.',
      findQibla: 'Find Qibla', qiblaCompassPrompt: 'Allow location and compass access for live direction.',
      qiblaNorthOnly: 'Direction calculated from location; use Find Qibla to turn on live compass movement.',
      qiblaNote: 'The arrow follows your phone compass when available. Keep the phone flat and away from magnets.',
      locationDenied: 'Location access was denied. Allow it in your browser settings.',
      locationNotFound: 'Location could not be found. Check that GPS/location services are enabled.',
      locationTimedOut: 'Location request timed out. Try again with GPS enabled.',
      savedOnDevice: 'SAVED ON DEVICE', tasbihDescription: 'Count your dhikr. Counts are saved on this device.',
      addDhikr: '+ Dhikr', reset: 'Reset', target: 'Target', localCounts: 'Dhikr counts are saved on this device.',
      yourEstimate: 'YOUR ESTIMATE', zakatCalculator: 'Zakat calculator',
      zakatDescription: 'Enter nisab from a trusted local source, then estimate your zakatable assets.',
      currency: 'Currency', nisabMethod: 'Nisab basis', manualNisab: 'Enter nisab manually',
      goldNisab: 'Gold — 85 grams', silverNisab: 'Silver — 595 grams', metalPrice: 'Current metal price per gram',
      metalWeight: 'Nisab weight (grams)', nisabValue: 'Nisab value', selectedCurrency: 'in selected currency',
      nisabInfo: 'Nisab is commonly estimated as the value of 85 g of gold or 595 g of silver. Choose a basis and enter its current local price per gram, or enter the threshold manually. No live metal price is assumed.',
      cashBank: 'Cash and bank balances', assetsLabel: 'Value of zakatable gold, silver and trade goods',
      receivables: 'Recoverable receivables', debts: 'Debts due soon', zakatRate: 'Zakat rate (%)',
      howCalculated: 'How is this estimate calculated?',
      calculationDetails: 'Net zakatable assets = cash and bank balances + zakatable metals/trade goods + eligible receivables − debts due soon (not below zero). If this reaches the selected nisab and the applicable lunar-year conditions are met, the default estimate is 2.5% of net assets. You can change the rate above. This is a calculator, not a fatwa; asset and debt rulings may vary by school and circumstance.',
      netAssets: 'Net zakatable assets', estimatedZakat: 'Estimated zakat', enterNisab: 'Enter nisab',
      zakatDisclaimer: 'This is an estimate, not a fatwa. Nisab, eligible assets, debts and zakat timing can vary; consult a trusted scholar. Metal prices must be entered by you.',
      privacyMatters: 'Your privacy matters.', privacySummary: 'Tasbih and zakat data sync to your private account when you sign in; otherwise they stay on this device. GPS is used only when you request prayer times or Qibla.',
      pdfLibrary: 'PDF library', ibadatPlan: 'Worship plan', privacy: 'Privacy', invalidValue: 'Enter a valid value of zero or more.',
      pageTitle: 'Daily Islamic tools: prayer, Qibla and zakat | Islamic Official',
      localSaveError: 'Could not save this setting on this device.', localReadError: 'Could not read saved settings on this device.',
      checkValues: 'Check the entered values', nisabRequired: 'Enter nisab', belowNisab: ' · below nisab',
      targetLabel: 'Target: {target}', targetReached: ' · Target reached!', savedLocal: 'Saved on this device.',
      syncing: 'Syncing with your account…', synced: 'Your tasbih and zakat data was saved to your account.',
      loadingAccount: 'Loading your account data…', restored: 'Your saved tasbih and zakat data was restored.',
      firstSync: 'Your device data was saved to your account.', signInNote: 'Sign in with Google or email to sync your tasbih and zakat data across devices.',
      signedOut: 'You signed out. Data on this device remains saved.', emailCreated: 'Account created and signed in.',
      resetSent: 'Password reset email sent. Check your inbox.', emailInvalid: 'Enter a valid email address.',
      passwordShort: 'Password must be at least 6 characters.', authFailed: 'Authentication failed: {message}',
      emailAddressInUse: 'An account already exists for this email. Try signing in or use Google.',
      invalidCredentials: 'Email or password is incorrect.', weakPassword: 'Choose a stronger password (at least 6 characters).',
      passwordResetPrompt: 'Enter your email address first, then choose Forgot password.',
      nisabGoldMethod: 'Gold ({grams} g) × price per gram', nisabSilverMethod: 'Silver ({grams} g) × price per gram',
      nisabManualMethod: 'Nisab entered manually in the selected currency.',
      nisabPlaceholder: 'Enter nisab amount',
      qiblaBearing: 'Qibla is {degrees}° clockwise from north.', qiblaDistance: 'Kaaba is about {distance} km away.',
      qiblaPositioning: 'Finding your location…', qiblaCompassReady: 'Compass active · heading {degrees}°.',
      qiblaCompassUnavailable: 'Compass unavailable; showing direction from north.',
      qiblaCompassDenied: 'Compass access was denied. Allow motion/orientation access in browser settings.',
      compassLoading: 'Activating the device compass…',
      qiblaUnavailable: 'Your browser could not determine location.',
      prayerLoading: 'Loading prayer times…', prayerUnavailable: 'Prayer times could not be loaded.',
      dateUnavailable: 'This browser cannot display the Hijri calendar.', requestingLocation: 'Requesting your location…',
      prayerSuccess: 'Prayer schedule updated for your location.', locationError: 'Allow location access to continue.',
      dayFajr: 'Fajr', daySunrise: 'Sunrise', dayDhuhr: 'Dhuhr', dayAsr: 'Asr', dayMaghrib: 'Maghrib', dayIsha: 'Isha'
      ,existingAccount: 'I already have an account', signedIn: 'You are signed in.',
      unauthorizedDomain: 'This domain must be added to Firebase Authentication authorized domains.',
      networkError: 'Network error. Check your internet connection and try again.'
    },
    uz: {
      emailLogin: 'Email bilan kirish', language: 'Til', darkMode: 'Tungi rejim', lightMode: 'Kunduzgi rejim',
      privateSync: 'SHAXSIY SINXRONLASH', emailSyncNote: 'Vositalaringizni qurilmalar orasida sinxronlash uchun email va parolingizni kiriting.',
      emailAddress: 'Email manzili', password: 'Parol', signIn: 'Kirish', createAccount: 'Hisob yaratish',
      forgotPassword: 'Parolni unutdingizmi?', signOut: 'Chiqish', googleSync: 'Google bilan davom etish', mainSite: 'Asosiy sayt',
      dailyTools: 'Kundalik vositalar', prayerTimes: 'Namoz vaqtlari', qibla: 'Qibla', tasbih: 'Tasbeh', zakat: 'Zakot',
      hijriDate: 'Hijriy sana', heroEyebrow: 'Bepul · maxfiy · telefonda qulay', heroTitle: 'Kundalik ibodat uchun',
      heroTitleAccent: 'foydali vositalar', heroDescription: 'Namoz vaqtini tekshiring, qibla tomonni toping, zikrni sanang va zakotni hisoblang — barchasi bir joyda.',
      exploreTools: 'Vositalarni ko‘rish', allInOne: 'Barchasi bir joyda', toolsCount: '5 foydali vosita', todaysDate: 'BUGUNGI SANA',
      hijriCalendarView: 'Bugungi kunning hijriy taqvimdagi ko‘rinishi', dateLoading: 'Sana aniqlanmoqda…',
      moonSightingNote: 'Hijriy sana mahalliy hilol kuzatuviga qarab farq qilishi mumkin.', forYou: 'SIZ UCHUN', usefulTools: 'Foydali vositalar',
      privacyLocation: 'Joylashuv faqat so‘rov yuborganingizda olinadi. Ma’lumotlaringiz reklama yoki kuzatuv uchun ishlatilmaydi.',
      locationBased: 'JOYINGIZGA MOS', prayerDescription: 'GPS joylashuvingiz bo‘yicha bugungi namoz jadvalini oling.',
      findLocation: 'Joylashuvimni aniqlash', locationPermission: 'Joylashuv faqat ruxsatingiz bilan olinadi.',
      prayerMethodNote: 'Hisoblash: Muslim World League. Mahalliy masjid taqvimidan bir necha daqiqa farq qilishi mumkin.',
      directionCard: 'YO‘NALISH', qiblaDirection: 'Qibla yo‘nalishi',
      qiblaDescription: 'Turgan joyingizdan Ka’ba tomonga yo‘nalish burchagini aniqlang.',
      qiblaPrompt: 'Yo‘nalishni aniqlash uchun joylashuvga ruxsat bering.',
      findQibla: 'Qiblani aniqlash', qiblaCompassPrompt: 'Jonli yo‘nalish uchun joylashuv va kompasga ruxsat bering.',
      qiblaNorthOnly: 'Joylashuv bo‘yicha yo‘nalish hisoblandi; jonli kompas uchun “Qiblani aniqlash”ni bosing.',
      qiblaNote: 'Imkon bo‘lsa, strelka telefon kompasiga mos aylanadi. Telefonni tekis tuting va magnitlardan uzoqroq saqlang.',
      locationDenied: 'Joylashuvga ruxsat berilmadi. Brauzer sozlamalarida ruxsat bering.',
      locationNotFound: 'Joylashuv topilmadi. GPS yoki joylashuv xizmatlari yoqilganini tekshiring.',
      locationTimedOut: 'Joylashuv so‘rovi vaqti tugadi. GPS yoqilgan holda qayta urinib ko‘ring.',
      savedOnDevice: 'QURILMADA SAQLANADI', tasbihDescription: 'Zikrlaringizni sanang. Hisob shu qurilmada saqlanadi.',
      addDhikr: '+ Zikr', reset: 'Qayta boshlash', target: 'Maqsad', localCounts: 'Zikr hisoblari shu qurilmada saqlanadi.',
      yourEstimate: 'O‘ZINGIZ HISOBLANG', zakatCalculator: 'Zakot hisoblagichi',
      zakatDescription: 'Ishonchli mahalliy manbadan nisobni kiriting va zakotga tortiladigan mablag‘ni hisoblang.',
      currency: 'Valyuta', nisabMethod: 'Nisob asosi', manualNisab: 'Nisobni qo‘lda kiriting',
      goldNisab: 'Oltin — 85 gramm', silverNisab: 'Kumush — 595 gramm', metalPrice: 'Metallning joriy 1 gramm narxi',
      metalWeight: 'Nisob og‘irligi (gramm)', nisabValue: 'Nisob qiymati', selectedCurrency: 'tanlangan valyutada',
      nisabInfo: 'Nisob odatda 85 g oltin yoki 595 g kumush qiymati bilan belgilanadi. Asosni tanlab, mahalliy 1 gramm narxini kiriting yoki nisobni qo‘lda belgilang. Metall narxi avtomatik olinmaydi.',
      cashBank: 'Naqd pul va bankdagi mablag‘', assetsLabel: 'Zakotga tortiladigan oltin, kumush va savdo moli qiymati',
      receivables: 'Qaytishi kutilayotgan qarzlar', debts: 'Yaqin muddatda to‘lanadigan qarzlar', zakatRate: 'Zakot foizi (%)',
      howCalculated: 'Hisob qanday chiqariladi?',
      calculationDetails: 'Zakotga tortiladigan sof mablag‘ = naqd pul va bankdagi mablag‘ + zakotga tortiladigan metall/savdo moli + qaytishi kutiladigan qarzlar − yaqin muddatdagi qarzlar (noldan kam bo‘lmaydi). Mablag‘ tanlangan nisobga yetsa va tegishli hijriy yil shartlari bajarilsa, standart hisob sof mablag‘ning 2,5% ini oladi. Foizni yuqorida o‘zgartirishingiz mumkin. Bu hisoblagich fatvo emas; mol-mulk va qarz hukmlari mazhab hamda holatga qarab farqlanishi mumkin.',
      netAssets: 'Zakotga tortiladigan sof mablag‘', estimatedZakat: 'Taxminiy zakot', enterNisab: 'Nisobni kiriting',
      zakatDisclaimer: 'Bu taxminiy hisob, fatvo emas. Nisob, zakotga tortiladigan mol-mulk, qarz va zakot muddati bo‘yicha ishonchli olimdan maslahat oling. Metall narxini o‘zingiz kiriting.',
      privacyMatters: 'Maxfiyligingiz muhim.', privacySummary: 'Kirsangiz tasbeh va zakot ma’lumotlari shaxsiy hisobingizga sinxronlanadi, aks holda qurilmada qoladi. GPS faqat namoz va qibla so‘rovi uchun ishlatiladi.',
      pdfLibrary: 'PDF kutubxona', ibadatPlan: 'Ibodat rejasi', privacy: 'Maxfiylik', invalidValue: 'Nol yoki undan katta to‘g‘ri qiymat kiriting.',
      pageTitle: 'Kundalik islomiy vositalar: namoz, qibla va zakot | Islamic Official',
      localSaveError: 'Sozlamani qurilmada saqlab bo‘lmadi.', localReadError: 'Saqlangan sozlamani qurilmadan o‘qib bo‘lmadi.',
      checkValues: 'Kiritilgan qiymatlarni tekshiring', nisabRequired: 'Nisobni kiriting', belowNisab: ' · nisobga yetmadi',
      targetLabel: 'Maqsad: {target}', targetReached: ' · Maqsadga yetdingiz!', savedLocal: 'Qurilmada saqlandi.',
      syncing: 'Hisobingiz bilan sinxronlanmoqda…', synced: 'Tasbeh va zakot ma’lumotlari hisobingizga saqlandi.',
      loadingAccount: 'Hisobingizdagi ma’lumotlar yuklanmoqda…', restored: 'Saqlangan tasbeh va zakot ma’lumotlari tiklandi.',
      firstSync: 'Qurilmangizdagi ma’lumotlar hisobingizga saqlandi.', signInNote: 'Tasbeh va zakotni qurilmalar orasida sinxronlash uchun Google yoki email orqali kiring.',
      signedOut: 'Hisobdan chiqdingiz. Qurilmadagi ma’lumotlar saqlanib qoldi.', emailCreated: 'Hisob yaratildi va tizimga kirildi.',
      resetSent: 'Parolni tiklash xati yuborildi. Emailni tekshiring.', emailInvalid: 'To‘g‘ri email manzilini kiriting.',
      passwordShort: 'Parol kamida 6 ta belgidan iborat bo‘lsin.', authFailed: 'Kirish amalga oshmadi: {message}',
      emailAddressInUse: 'Bu email uchun hisob mavjud. Kirib ko‘ring yoki Google’dan foydalaning.',
      invalidCredentials: 'Email yoki parol noto‘g‘ri.', weakPassword: 'Kuchliroq parol tanlang (kamida 6 ta belgi).',
      passwordResetPrompt: 'Avval emailingizni kiriting, so‘ng “Parolni unutdingizmi?” ni bosing.',
      nisabGoldMethod: 'Oltin ({grams} g) × 1 gramm narxi', nisabSilverMethod: 'Kumush ({grams} g) × 1 gramm narxi',
      nisabManualMethod: 'Nisob tanlangan valyutada qo‘lda kiritiladi.',
      nisabPlaceholder: 'Nisob miqdorini kiriting',
      qiblaBearing: 'Qibla shimoldan soat mili bo‘yicha {degrees}° yo‘nalishda.', qiblaDistance: 'Ka’bagacha taxminan {distance} km.',
      qiblaPositioning: 'Joylashuvingiz aniqlanmoqda…', qiblaCompassReady: 'Kompas ishlayapti · yo‘nalish {degrees}°.',
      qiblaCompassUnavailable: 'Kompas mavjud emas; yo‘nalish shimolga nisbatan ko‘rsatilmoqda.',
      qiblaCompassDenied: 'Kompasga ruxsat berilmadi. Brauzer sozlamalarida harakat/yo‘nalish ruxsatini yoqing.',
      compassLoading: 'Qurilma kompasi yoqilmoqda…',
      qiblaUnavailable: 'Brauzer joylashuvni aniqlay olmadi.',
      prayerLoading: 'Namoz vaqtlari yuklanmoqda…', prayerUnavailable: 'Namoz vaqtlarini yuklab bo‘lmadi.',
      dateUnavailable: 'Brauzer hijriy taqvimni ko‘rsata olmaydi.', requestingLocation: 'Joylashuvingiz so‘ralmoqda…',
      prayerSuccess: 'Joylashuvingiz uchun namoz jadvali yangilandi.', locationError: 'Davom etish uchun joylashuvga ruxsat bering.',
      dayFajr: 'Bomdod', daySunrise: 'Quyosh', dayDhuhr: 'Peshin', dayAsr: 'Asr', dayMaghrib: 'Shom', dayIsha: 'Xufton'
      ,existingAccount: 'Hisobim bor, kirish', signedIn: 'Hisobga kirdingiz.',
      unauthorizedDomain: 'Bu domenni Firebase Authentication ruxsat etilgan domenlariga qo‘shish kerak.',
      networkError: 'Tarmoq xatosi. Internetni tekshirib, qayta urinib ko‘ring.'
    },
    ru: {
      emailLogin: 'Войти по email', language: 'Язык', darkMode: 'Тёмная тема', lightMode: 'Светлая тема',
      privateSync: 'ЛИЧНАЯ СИНХРОНИЗАЦИЯ', emailSyncNote: 'Войдите по email и паролю, чтобы синхронизировать личные инструменты между устройствами.',
      emailAddress: 'Адрес email', password: 'Пароль', signIn: 'Войти', createAccount: 'Создать аккаунт',
      forgotPassword: 'Забыли пароль?', signOut: 'Выйти', googleSync: 'Продолжить с Google', mainSite: 'Главный сайт',
      dailyTools: 'Ежедневные инструменты', prayerTimes: 'Время намаза', qibla: 'Кибла', tasbih: 'Тасбих', zakat: 'Закят',
      hijriDate: 'Дата хиджры', heroEyebrow: 'Бесплатно · конфиденциально · удобно на телефоне', heroTitle: 'Полезные инструменты для',
      heroTitleAccent: 'ежедневного поклонения', heroDescription: 'Проверяйте время намаза, находите киблу, считайте зикр и оценивайте закят — всё в одном месте.',
      exploreTools: 'Открыть инструменты', allInOne: 'Всё в одном месте', toolsCount: '5 полезных инструментов', todaysDate: 'СЕГОДНЯ',
      hijriCalendarView: 'Сегодняшняя дата по календарю хиджры', dateLoading: 'Загрузка даты…',
      moonSightingNote: 'Дата хиджры может отличаться в зависимости от местного наблюдения луны.', forYou: 'ДЛЯ ВАС', usefulTools: 'Полезные инструменты',
      privacyLocation: 'Местоположение запрашивается только по вашему запросу. Данные не используются для рекламы или отслеживания.',
      locationBased: 'ПО МЕСТОПОЛОЖЕНИЮ', prayerDescription: 'Получите расписание намаза на сегодня по GPS.',
      findLocation: 'Определить местоположение', locationPermission: 'Местоположение используется только с вашего разрешения.',
      prayerMethodNote: 'Расчёт: Muslim World League. Время может немного отличаться от расписания местной мечети.',
      directionCard: 'НАПРАВЛЕНИЕ', qiblaDirection: 'Направление киблы',
      qiblaDescription: 'Определите направление от вашего местоположения к Каабе.',
      qiblaPrompt: 'Разрешите доступ к местоположению, чтобы определить направление.',
      findQibla: 'Найти киблу', qiblaCompassPrompt: 'Разрешите доступ к местоположению и компасу для точного направления.',
      qiblaNorthOnly: 'Направление рассчитано по местоположению; нажмите «Найти киблу», чтобы включить компас.',
      qiblaNote: 'Стрелка поворачивается по компасу телефона, если он доступен. Держите телефон ровно и вдали от магнитов.',
      locationDenied: 'Доступ к местоположению запрещён. Разрешите его в настройках браузера.',
      locationNotFound: 'Местоположение не найдено. Проверьте, включены ли GPS/службы геолокации.',
      locationTimedOut: 'Время ожидания геолокации истекло. Повторите попытку с включённым GPS.',
      savedOnDevice: 'СОХРАНЯЕТСЯ НА УСТРОЙСТВЕ', tasbihDescription: 'Считайте зикр. Счёт сохраняется на этом устройстве.',
      addDhikr: '+ Зикр', reset: 'Сбросить', target: 'Цель', localCounts: 'Счёт зикра сохраняется на этом устройстве.',
      yourEstimate: 'ВАШ РАСЧЁТ', zakatCalculator: 'Калькулятор закята',
      zakatDescription: 'Введите нисаб из надёжного местного источника и оцените имущество для закята.',
      currency: 'Валюта', nisabMethod: 'Основа нисаба', manualNisab: 'Ввести нисаб вручную',
      goldNisab: 'Золото — 85 граммов', silverNisab: 'Серебро — 595 граммов', metalPrice: 'Текущая цена металла за грамм',
      metalWeight: 'Вес нисаба (граммы)', nisabValue: 'Сумма нисаба', selectedCurrency: 'в выбранной валюте',
      nisabInfo: 'Нисаб обычно оценивается как стоимость 85 г золота или 595 г серебра. Выберите основу и введите местную цену за грамм либо укажите сумму вручную. Актуальная цена металла автоматически не загружается.',
      cashBank: 'Наличные и средства на счетах', assetsLabel: 'Стоимость учитываемого золота, серебра и товаров',
      receivables: 'Ожидаемые к возврату долги', debts: 'Долги к ближайшей оплате', zakatRate: 'Ставка закята (%)',
      howCalculated: 'Как рассчитывается сумма?',
      calculationDetails: 'Чистое имущество для закята = наличные и средства на счетах + учитываемые металлы/товары + подлежащие возврату долги − ближайшие обязательства (не ниже нуля). Если сумма достигает выбранного нисаба и выполнены условия лунного года, стандартная оценка составляет 2,5% чистого имущества. Ставку можно изменить выше. Это калькулятор, а не фетва; правила могут различаться в зависимости от мазхаба и обстоятельств.',
      netAssets: 'Чистое имущество для закята', estimatedZakat: 'Оценка закята', enterNisab: 'Введите нисаб',
      zakatDisclaimer: 'Это оценка, а не фетва. Проконсультируйтесь с учёным по вопросам нисаба, имущества, долгов и срока выплаты. Цены на металлы вводятся вручную.',
      privacyMatters: 'Ваша конфиденциальность важна.', privacySummary: 'После входа данные тасбиха и закята синхронизируются с личным аккаунтом; иначе они остаются на устройстве. GPS используется только по запросу времени намаза или киблы.',
      pdfLibrary: 'Библиотека PDF', ibadatPlan: 'План поклонения', privacy: 'Конфиденциальность', invalidValue: 'Введите корректное значение не меньше нуля.',
      pageTitle: 'Ежедневные исламские инструменты: намаз, кибла и закят | Islamic Official',
      localSaveError: 'Не удалось сохранить настройку на устройстве.', localReadError: 'Не удалось прочитать сохранённые настройки.',
      checkValues: 'Проверьте введённые значения', nisabRequired: 'Введите нисаб', belowNisab: ' · ниже нисаба',
      targetLabel: 'Цель: {target}', targetReached: ' · Цель достигнута!', savedLocal: 'Сохранено на устройстве.',
      syncing: 'Синхронизация с аккаунтом…', synced: 'Данные тасбиха и закята сохранены в аккаунте.',
      loadingAccount: 'Загрузка данных аккаунта…', restored: 'Сохранённые данные тасбиха и закята восстановлены.',
      firstSync: 'Данные устройства сохранены в аккаунте.', signInNote: 'Войдите через Google или email, чтобы синхронизировать данные между устройствами.',
      signedOut: 'Вы вышли. Данные на устройстве сохранены.', emailCreated: 'Аккаунт создан, вход выполнен.',
      resetSent: 'Письмо для сброса пароля отправлено. Проверьте почту.', emailInvalid: 'Введите корректный адрес email.',
      passwordShort: 'Пароль должен содержать не менее 6 символов.', authFailed: 'Ошибка входа: {message}',
      emailAddressInUse: 'Для этого email уже есть аккаунт. Войдите или используйте Google.',
      invalidCredentials: 'Неверный email или пароль.', weakPassword: 'Выберите более надёжный пароль (не менее 6 символов).',
      passwordResetPrompt: 'Сначала введите email, затем нажмите «Забыли пароль?».',
      nisabGoldMethod: 'Золото ({grams} г) × цена за грамм', nisabSilverMethod: 'Серебро ({grams} г) × цена за грамм',
      nisabManualMethod: 'Нисаб вводится вручную в выбранной валюте.',
      nisabPlaceholder: 'Введите сумму нисаба',
      qiblaBearing: 'Кибла находится под углом {degrees}° по часовой стрелке от севера.', qiblaDistance: 'До Каабы примерно {distance} км.',
      qiblaPositioning: 'Определяем ваше местоположение…', qiblaCompassReady: 'Компас активен · направление {degrees}°.',
      qiblaCompassUnavailable: 'Компас недоступен; направление показано относительно севера.',
      qiblaCompassDenied: 'Доступ к компасу запрещён. Разрешите датчики движения/ориентации в настройках браузера.',
      compassLoading: 'Включаем компас устройства…',
      qiblaUnavailable: 'Браузер не смог определить местоположение.',
      prayerLoading: 'Загрузка времени намаза…', prayerUnavailable: 'Не удалось загрузить время намаза.',
      dateUnavailable: 'Этот браузер не может отобразить календарь хиджры.', requestingLocation: 'Запрашиваем ваше местоположение…',
      prayerSuccess: 'Расписание намаза обновлено для вашего местоположения.', locationError: 'Разрешите доступ к местоположению.',
      dayFajr: 'Фаджр', daySunrise: 'Восход', dayDhuhr: 'Зухр', dayAsr: 'Аср', dayMaghrib: 'Магриб', dayIsha: 'Иша'
      ,existingAccount: 'У меня уже есть аккаунт', signedIn: 'Вход выполнен.',
      unauthorizedDomain: 'Добавьте этот домен в список разрешённых доменов Firebase Authentication.',
      networkError: 'Ошибка сети. Проверьте подключение к интернету и повторите попытку.'
    }
  };
  let language = 'en';
  let selectedDhikr = 'Subhanalloh';
  let count = 0;
  let currentUser = null;
  let restoringCloudData = false;
  let cloudSaveTimer = null;
  let queueCloudSave = () => {};

  const setAccountStatus = (message, isError = false) => {
    accountStatus.textContent = message;
    accountStatus.hidden = !message;
    accountStatus.dataset.error = String(isError);
  };

  const t = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translations[language]?.[key] || translations.en[key] || key
  );
  const formatAngle = (degrees) => new Intl.NumberFormat(language, { maximumFractionDigits: 1 }).format(degrees);
  const renderQiblaReadout = () => {
    if (qiblaBearing === null) return;
    qiblaResult.textContent = t('qiblaBearing', { degrees: formatAngle(qiblaBearing) });
    qiblaDistanceElement.textContent = t('qiblaDistance', {
      distance: new Intl.NumberFormat(language, { maximumFractionDigits: qiblaDistanceKm < 10 ? 1 : 0 }).format(qiblaDistanceKm)
    });
    compassElement.setAttribute('aria-label', `${t('qiblaDirection')}: ${qiblaResult.textContent}`);
  };
  const setQiblaStatus = (key, values = {}, isError = false) => {
    qiblaStatusKey = key;
    qiblaStatusValues = values;
    qiblaStatus.textContent = t(key, values);
    qiblaStatus.classList.toggle('error-status', isError);
  };
  const setLanguage = (value) => {
    language = Object.hasOwn(translations, value) ? value : 'en';
    document.documentElement.lang = language;
    document.title = t('pageTitle');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (translations[language][key]) element.textContent = translations[language][key];
    });
    document.querySelectorAll('[data-prayer]').forEach((element) => {
      const prayerKey = `day${element.dataset.prayer}`;
      if (translations[language][prayerKey]) element.previousElementSibling.textContent = translations[language][prayerKey];
    });
    const mode = document.body.dataset.theme === 'dark' ? 'lightMode' : 'darkMode';
    document.getElementById('theme-toggle').textContent = t(mode);
    document.getElementById('theme-toggle').setAttribute('aria-pressed', String(document.body.dataset.theme === 'dark'));
    document.getElementById('email-dialog-title').textContent = t(isCreatingAccount ? 'createAccount' : 'emailLogin');
    emailSubmit.textContent = t(isCreatingAccount ? 'createAccount' : 'signIn');
    emailModeToggle.textContent = t(isCreatingAccount ? 'existingAccount' : 'createAccount');
    document.getElementById('language-select').value = language;
    document.getElementById('language-select').setAttribute('aria-label', t('language'));
    document.getElementById('zakat-nisab').placeholder = t('nisabPlaceholder');
    renderQiblaReadout();
    setQiblaStatus(qiblaStatusKey, qiblaStatusValues, qiblaStatus.classList.contains('error-status'));
    renderCount();
    calculateZakat();
    updateHijriDate();
  };
  const languageSelect = document.getElementById('language-select');
  const themeToggle = document.getElementById('theme-toggle');
  let initialLanguage = 'en';
  try {
    initialLanguage = localStorage.getItem(`${storagePrefix}language`) || 'en';
    const savedTheme = localStorage.getItem(`${storagePrefix}theme`);
    if (savedTheme === 'dark' || savedTheme === 'light') document.body.dataset.theme = savedTheme;
  } catch (error) {
    console.error('Til va mavzu sozlamalarini qurilmadan o‘qib bo‘lmadi.', error);
  }
  languageSelect.addEventListener('change', () => {
    setLanguage(languageSelect.value);
    try {
      localStorage.setItem(`${storagePrefix}language`, language);
    } catch (error) {
      console.error('Til sozlamasini qurilmada saqlab bo‘lmadi.', error);
    }
  });
  themeToggle.addEventListener('click', () => {
    document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    setLanguage(language);
    try {
      localStorage.setItem(`${storagePrefix}theme`, document.body.dataset.theme);
    } catch (error) {
      console.error('Mavzu sozlamasini qurilmada saqlab bo‘lmadi.', error);
    }
  });

  const getStoredCount = () => {
    try {
      const storedValue = localStorage.getItem(`${storagePrefix}${selectedDhikr}`)
        ?? (selectedDhikr === 'Istigfor' ? localStorage.getItem(`${storagePrefix}Istig‘for`) : null);
      const value = Number(storedValue);
      return Number.isSafeInteger(value) && value >= 0 ? value : 0;
    } catch (error) {
      console.error('Tasbeh hisobini qurilmadan o‘qib bo‘lmadi.', error);
      document.getElementById('counter-status').textContent = t('localCounts');
      return 0;
    }
  };

  const saveCount = () => {
    try {
      localStorage.setItem(`${storagePrefix}${selectedDhikr}`, String(count));
    } catch (error) {
      console.error('Tasbeh hisobini qurilmada saqlab bo‘lmadi.', error);
      document.getElementById('counter-status').textContent = t('localSaveError');
    }
    queueCloudSave();
  };

  const renderCount = () => {
    document.getElementById('selected-dhikr').textContent = dhikrLabels[selectedDhikr];
    document.getElementById('dhikr-count').textContent = new Intl.NumberFormat(language).format(count);
    const enteredTarget = Number(document.getElementById('dhikr-target').value);
    const target = Number.isInteger(enteredTarget) && enteredTarget >= 1 && enteredTarget <= 10000 ? enteredTarget : 33;
    document.getElementById('target-progress').textContent = `${t('targetLabel', { target: new Intl.NumberFormat(language).format(target) })}${count >= target ? t('targetReached') : ''}`;
  };

  document.querySelectorAll('[data-dhikr]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedDhikr = button.dataset.dhikr;
      count = getStoredCount();
      document.querySelectorAll('[data-dhikr]').forEach((choice) => {
        const isSelected = choice === button;
        choice.classList.toggle('is-selected', isSelected);
        choice.setAttribute('aria-pressed', String(isSelected));
      });
      renderCount();
    });
    button.setAttribute('aria-pressed', String(button.classList.contains('is-selected')));
  });

  document.getElementById('count-button').addEventListener('click', () => {
    count += 1;
    saveCount();
    renderCount();
  });
  document.getElementById('reset-count').addEventListener('click', () => {
    count = 0;
    saveCount();
    renderCount();
  });
  document.getElementById('dhikr-target').addEventListener('input', () => {
    const target = Number(document.getElementById('dhikr-target').value);
    renderCount();
    if (!Number.isInteger(target) || target < 1 || target > 10000) return;
    try {
      localStorage.setItem(`${storagePrefix}tasbihTarget`, String(target));
    } catch (error) {
      console.error('Tasbeh maqsadini qurilmada saqlab bo‘lmadi.', error);
      document.getElementById('counter-status').textContent = t('localSaveError');
      return;
    }
    queueCloudSave();
  });
  try {
    const savedTarget = Number(localStorage.getItem(`${storagePrefix}tasbihTarget`));
    if (Number.isInteger(savedTarget) && savedTarget >= 1 && savedTarget <= 10000) {
      document.getElementById('dhikr-target').value = String(savedTarget);
    }
  } catch (error) {
    console.error('Tasbeh maqsadini qurilmadan o‘qib bo‘lmadi.', error);
    document.getElementById('counter-status').textContent = t('localReadError');
  }
  document.querySelectorAll('#zakat-currency, #zakat-nisab, #zakat-cash, #zakat-assets, #zakat-receivable, #zakat-debt, #zakat-metal-price, #zakat-metal-grams, #zakat-rate')
    .forEach((input) => input.addEventListener('input', () => calculateZakat()));
  document.getElementById('zakat-method').addEventListener('change', () => {
    const method = document.getElementById('zakat-method').value;
    const grams = document.getElementById('zakat-metal-grams');
    if (method === 'gold') grams.value = '85';
    if (method === 'silver') grams.value = '595';
    calculateZakat();
  });
  document.getElementById('zakat-currency').addEventListener('change', () => calculateZakat());
  count = getStoredCount();
  renderCount();

  const updateHijriDate = () => {
    const now = new Date();
    try {
      document.getElementById('hijri-date').textContent = new Intl.DateTimeFormat(`${language}-u-ca-islamic`, {
        dateStyle: 'long'
      }).format(now);
    } catch (error) {
      console.error('Hijriy sanani ko‘rsatib bo‘lmadi.', error);
      document.getElementById('hijri-date').textContent = t('dateUnavailable');
    }
    document.getElementById('gregorian-date').textContent = new Intl.DateTimeFormat(language, {
      dateStyle: 'full'
    }).format(now);
  };
  updateHijriDate();

  const toRadians = (degrees) => degrees * Math.PI / 180;
  const toDegrees = (radians) => radians * 180 / Math.PI;
  const normalizeAngle = (degrees) => (degrees % 360 + 360) % 360;
  const getQiblaBearing = (latitude, longitude) => {
    const userLatitude = toRadians(latitude);
    const kaabaLatitude = toRadians(KAABA.latitude);
    const longitudeDifference = toRadians(KAABA.longitude - longitude);
    const y = Math.sin(longitudeDifference);
    const x = Math.cos(userLatitude) * Math.tan(kaabaLatitude)
      - Math.sin(userLatitude) * Math.cos(longitudeDifference);
    return (toDegrees(Math.atan2(y, x)) + 360) % 360;
  };
  const getDistanceToKaaba = (latitude, longitude) => {
    const latitudeDifference = toRadians(KAABA.latitude - latitude);
    const longitudeDifference = toRadians(KAABA.longitude - longitude);
    const arc = Math.sin(latitudeDifference / 2) ** 2
      + Math.cos(toRadians(latitude)) * Math.cos(toRadians(KAABA.latitude))
      * Math.sin(longitudeDifference / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc));
  };
  const updateQiblaPosition = (latitude, longitude) => {
    qiblaBearing = getQiblaBearing(latitude, longitude);
    qiblaDistanceKm = getDistanceToKaaba(latitude, longitude);
    qiblaNeedle.style.transform = `rotate(${qiblaBearing}deg)`;
    renderQiblaReadout();
  };
  const handleOrientation = (event) => {
    let heading;
    if (Number.isFinite(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    } else if (event.absolute === true && Number.isFinite(event.alpha)) {
      const screenAngle = Number.isFinite(screen.orientation?.angle)
        ? screen.orientation.angle
        : Number.isFinite(window.orientation) ? window.orientation : 0;
      heading = 360 - event.alpha + screenAngle;
    } else {
      return;
    }
    compassHeading = normalizeAngle(heading);
    compassFace.style.transform = `rotate(${-compassHeading}deg)`;
    if (qiblaBearing !== null) {
      const roundedHeading = Math.round(compassHeading);
      if (roundedHeading !== compassDisplayDegree) {
        compassDisplayDegree = roundedHeading;
        setQiblaStatus('qiblaCompassReady', { degrees: formatAngle(compassHeading) });
      }
    }
    if (!compassHeadingDetected) {
      compassHeadingDetected = true;
      window.dispatchEvent(new Event('qiblaheadingchange'));
    }
  };
  const activateCompass = async (permission) => {
    if (permission?.error || permission !== 'granted') {
      setQiblaStatus(permission === 'unsupported' ? 'qiblaCompassUnavailable' : 'qiblaCompassDenied', {}, permission !== 'unsupported');
      return;
    }
    if (!orientationListening) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      orientationListening = true;
    }
    if (compassHeading !== null) {
      setQiblaStatus('qiblaCompassReady', { degrees: formatAngle(compassHeading) });
      return;
    }
    setQiblaStatus('compassLoading');
    const headingAvailable = await new Promise((resolve) => {
      const onHeading = () => {
        window.clearTimeout(timeoutId);
        resolve(true);
      };
      const timeoutId = window.setTimeout(() => {
        window.removeEventListener('qiblaheadingchange', onHeading);
        resolve(compassHeading !== null);
      }, 2500);
      window.addEventListener('qiblaheadingchange', onHeading, { once: true });
    });
    if (!headingAvailable) setQiblaStatus('qiblaCompassUnavailable');
  };

  const showPrayerError = (message) => {
    locationStatus.textContent = message;
    locationStatus.classList.add('error-status');
  };

  const formatTime = (value) => {
    if (typeof value !== 'string') return null;
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (!match) return null;
    return `${match[1].padStart(2, '0')}:${match[2]}`;
  };

  const loadPrayerTimes = async (latitude, longitude) => {
    locationStatus.textContent = t('prayerLoading');
    const endpoint = new URL('https://api.aladhan.com/v1/timings');
    endpoint.searchParams.set('latitude', String(latitude));
    endpoint.searchParams.set('longitude', String(longitude));
    endpoint.searchParams.set('method', '3');
    const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Namoz vaqtlari xizmati HTTP ${response.status} xatosini qaytardi.`);
    const payload = await response.json();
    const timings = payload?.data?.timings;
    if (payload?.code !== 200 || !timings) throw new Error('Namoz vaqtlari xizmatidan yaroqli jadval kelmadi.');
    const parsedTimes = prayerNames.map((name) => [name, formatTime(timings[name])]);
    if (parsedTimes.some(([, time]) => !time)) throw new Error('Namoz vaqtlari jadvali to‘liq emas.');
    parsedTimes.forEach(([name, time]) => {
      const element = document.querySelector(`[data-prayer="${name}"]`);
      if (element) element.textContent = time;
    });
    locationStatus.textContent = t('prayerSuccess');
    locationStatus.classList.remove('error-status');
  };

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error(t('locationError')));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, (error) => {
      const messages = {
        1: t('locationDenied'),
        2: t('locationNotFound'),
        3: t('locationTimedOut')
      };
      reject(new Error(messages[error.code] || t('locationError')));
    }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 });
  });

  locationButton.addEventListener('click', async () => {
    locationButton.disabled = true;
    locationStatus.classList.remove('error-status');
    locationStatus.textContent = t('requestingLocation');
    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error('Qurilmadan yaroqli koordinatalar olinmadi.');
      }
      updateQiblaPosition(latitude, longitude);
      if (compassHeading === null) setQiblaStatus('qiblaNorthOnly');
      else setQiblaStatus('qiblaCompassReady', { degrees: formatAngle(compassHeading) });
      await loadPrayerTimes(latitude, longitude);
    } catch (error) {
      console.error('Joylashuvga asoslangan vositalarni yangilab bo‘lmadi.', error);
      showPrayerError(error instanceof Error ? error.message : t('prayerUnavailable'));
    } finally {
      locationButton.disabled = false;
    }
  });
  qiblaButton.addEventListener('click', async () => {
    qiblaButton.disabled = true;
    qiblaStatus.classList.remove('error-status');
    setQiblaStatus('qiblaPositioning');
    let permissionRequest;
    try {
      const orientationEvent = window.DeviceOrientationEvent;
      if (!orientationEvent) {
        permissionRequest = Promise.resolve('unsupported');
      } else if (typeof orientationEvent.requestPermission === 'function') {
        permissionRequest = orientationEvent.requestPermission().catch((error) => ({ error }));
      } else {
        permissionRequest = Promise.resolve('granted');
      }
    } catch (error) {
      permissionRequest = Promise.resolve({ error });
    }
    try {
      const position = await getLocation();
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error(t('qiblaUnavailable'));
      }
      updateQiblaPosition(latitude, longitude);
      await activateCompass(await permissionRequest);
    } catch (error) {
      console.error('Qibla yo‘nalishini aniqlab bo‘lmadi.', error);
      setQiblaStatus(error instanceof Error ? error.message : t('qiblaUnavailable'), {}, true);
    } finally {
      qiblaButton.disabled = false;
    }
  });

  const money = (amount, currency) => {
    if (!Number.isFinite(amount)) return '—';
    try {
      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'UZS' || currency === 'KZT' ? 0 : 2
      }).format(amount);
    } catch (error) {
      console.error(`Valyuta formatini ko‘rsatib bo‘lmadi: ${currency}`, error);
      return `${new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(amount)} ${currency}`;
    }
  };

  const calculateZakat = () => {
    const currency = document.getElementById('zakat-currency').value;
    const method = document.getElementById('zakat-method').value;
    const nisabInput = document.getElementById('zakat-nisab');
    const priceInput = document.getElementById('zakat-metal-price');
    const gramsInput = document.getElementById('zakat-metal-grams');
    const rateInput = document.getElementById('zakat-rate');
    const metalFieldsVisible = method !== 'manual';
    document.getElementById('metal-price-field').hidden = !metalFieldsVisible;
    document.getElementById('metal-grams-field').hidden = !metalFieldsVisible;
    document.getElementById('nisab-formula').textContent = method === 'gold'
      ? t('nisabGoldMethod', { grams: gramsInput.value || '85' })
      : method === 'silver'
        ? t('nisabSilverMethod', { grams: gramsInput.value || '595' })
        : t('nisabManualMethod');
    nisabInput.readOnly = metalFieldsVisible;
    gramsInput.value = gramsInput.value || (method === 'gold' ? '85' : method === 'silver' ? '595' : '');
    if (metalFieldsVisible) {
      const price = Number(priceInput.value);
      const grams = Number(gramsInput.value);
      nisabInput.value = Number.isFinite(price) && price > 0 && Number.isFinite(grams) && grams > 0
        ? String(price * grams)
        : '';
    }
    document.getElementById('zakat-rate-label').textContent = rateInput.value || '2.5';
    rateInput.setCustomValidity(Number(rateInput.value) > 0 && Number(rateInput.value) <= 100
      ? ''
      : 'Enter a rate greater than 0 and no more than 100.');
    const fieldIds = ['zakat-nisab', 'zakat-cash', 'zakat-assets', 'zakat-receivable', 'zakat-debt'];
    const amounts = Object.fromEntries(fieldIds.map((id) => {
      const input = document.getElementById(id);
      const amount = input.value.trim() === '' ? 0 : Number(input.value);
      input.setCustomValidity(Number.isFinite(amount) && amount >= 0 ? '' : t('invalidValue'));
      return [id, amount];
    }));
    const isValid = [...fieldIds, 'zakat-rate']
      .every((id) => document.getElementById(id).checkValidity())
      && (!metalFieldsVisible
        || (priceInput.value !== '' && Number(priceInput.value) > 0
          && gramsInput.value !== '' && Number(gramsInput.value) > 0));
    const net = Math.max(0, amounts['zakat-cash'] + amounts['zakat-assets']
      + amounts['zakat-receivable'] - amounts['zakat-debt']);
    document.getElementById('zakat-net').textContent = money(net, currency);
    const due = document.getElementById('zakat-due');
    if (!isValid) {
      due.textContent = t('checkValues');
    } else if (amounts['zakat-nisab'] <= 0) {
      due.textContent = t('nisabRequired');
    } else {
      due.textContent = money(net >= amounts['zakat-nisab'] ? net * Number(rateInput.value) / 100 : 0, currency);
      if (net < amounts['zakat-nisab']) due.textContent += t('belowNisab');
    }
    if (isValid) {
      try {
        localStorage.setItem(`${storagePrefix}zakatDraft`, JSON.stringify(getZakatDraft()));
      } catch (error) {
        console.error('Zakot hisob ma’lumotlarini qurilmada saqlab bo‘lmadi.', error);
        setAccountStatus(t('localSaveError'), true);
      }
      queueCloudSave();
    }
  };

  const zakatFieldMap = {
    nisab: 'zakat-nisab',
    cash: 'zakat-cash',
    assets: 'zakat-assets',
    receivable: 'zakat-receivable',
    debt: 'zakat-debt',
    metalPrice: 'zakat-metal-price',
    metalGrams: 'zakat-metal-grams',
    rate: 'zakat-rate'
  };
  const getZakatDraft = () => ({
    currency: document.getElementById('zakat-currency').value,
    method: document.getElementById('zakat-method').value,
    ...Object.fromEntries(Object.entries(zakatFieldMap).map(([key, id]) => {
      const value = document.getElementById(id).value.trim();
      return [key, value === '' ? null : Number(value)];
    }))
  });

  const setZakatDraft = (draft) => {
    if (!draft || !allowedCurrencies.includes(draft.currency)) return;
    document.getElementById('zakat-currency').value = draft.currency;
    document.getElementById('zakat-method').value = ['manual', 'gold', 'silver'].includes(draft.method)
      ? draft.method
      : 'manual';
    Object.entries(zakatFieldMap).forEach(([key, id]) => {
      const fallback = key === 'rate' ? 2.5 : null;
      const value = draft[key] === undefined ? fallback : draft[key];
      document.getElementById(id).value = value === null ? '' : String(value);
    });
    calculateZakat();
  };

  const restoreLocalZakatDraft = () => {
    try {
      const saved = localStorage.getItem(`${storagePrefix}zakatDraft`);
      if (saved) setZakatDraft(JSON.parse(saved));
    } catch (error) {
      console.error('Zakot hisob ma’lumotlarini qurilmadan o‘qib bo‘lmadi.', error);
      setAccountStatus(t('localReadError'), true);
    }
  };

  const readCloudData = () => {
    const tasbihCounts = Object.fromEntries(dhikrNames.map((name) => {
      const stored = Number(localStorage.getItem(`${storagePrefix}${name}`));
      return [name, Number.isSafeInteger(stored) && stored >= 0 ? stored : 0];
    }));
    return {
      tasbihCounts,
      selectedDhikr,
      tasbihTarget: Number(document.getElementById('dhikr-target').value) || 33,
      zakatDraft: getZakatDraft(),
      updatedAt: serverTimestamp()
    };
  };

  const applyCloudData = (data) => {
    if (data.tasbihCounts && typeof data.tasbihCounts === 'object') {
      dhikrNames.forEach((name) => {
        const saved = data.tasbihCounts[name];
        if (Number.isSafeInteger(saved) && saved >= 0 && saved <= 10000000) {
          localStorage.setItem(`${storagePrefix}${name}`, String(saved));
        }
      });
    }
    if (dhikrNames.includes(data.selectedDhikr)) selectedDhikr = data.selectedDhikr;
    if (Number.isInteger(data.tasbihTarget) && data.tasbihTarget >= 1 && data.tasbihTarget <= 10000) {
      document.getElementById('dhikr-target').value = String(data.tasbihTarget);
      localStorage.setItem(`${storagePrefix}tasbihTarget`, String(data.tasbihTarget));
    }
    document.querySelectorAll('[data-dhikr]').forEach((button) => {
      const selected = button.dataset.dhikr === selectedDhikr;
      button.classList.toggle('is-selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    count = getStoredCount();
    renderCount();
    if (data.zakatDraft && typeof data.zakatDraft === 'object') setZakatDraft(data.zakatDraft);
  };

  restoreLocalZakatDraft();
  calculateZakat();

  const firebaseConfig = {
    apiKey: 'AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY',
    authDomain: 'islamicofficial-9279f.firebaseapp.com',
    projectId: 'islamicofficial-9279f',
    storageBucket: 'islamicofficial-9279f.firebasestorage.app',
    messagingSenderId: '251823878076',
    appId: '1:251823878076:web:9eff3e9b8b01f6f827c5b9'
  };
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.setCustomParameters({ prompt: 'select_account' });
  const signInButton = document.getElementById('google-sign-in');
  const emailSignInButton = document.getElementById('email-sign-in');
  const signOutButton = document.getElementById('google-sign-out');
  const accountUser = document.getElementById('account-user');
  const emailDialog = document.getElementById('email-dialog');
  const emailForm = document.getElementById('email-auth-form');
  const emailModeToggle = document.getElementById('email-mode-toggle');
  const emailSubmit = document.getElementById('email-submit');
  let isCreatingAccount = false;
  setLanguage(initialLanguage);

  const showInlineEmailMessage = (message, isError = false) => {
    const inlineMessage = document.getElementById('email-auth-message');
    inlineMessage.textContent = message;
    inlineMessage.hidden = false;
    inlineMessage.dataset.error = String(isError);
    setAccountStatus(message, isError);
  };
  const showEmailError = (error) => {
    const messages = {
      'auth/email-already-in-use': t('emailAddressInUse'),
      'auth/invalid-credential': t('invalidCredentials'),
      'auth/wrong-password': t('invalidCredentials'),
      'auth/user-not-found': t('invalidCredentials'),
      'auth/weak-password': t('weakPassword'),
      'auth/invalid-email': t('emailInvalid'),
      'auth/unauthorized-domain': t('unauthorizedDomain'),
      'auth/network-request-failed': t('networkError')
    };
    const message = messages[error.code] || t('authFailed', { message: error.message || 'Firebase Authentication error.' });
    showInlineEmailMessage(message, true);
  };

  emailSignInButton.addEventListener('click', () => {
    document.getElementById('email-auth-message').hidden = true;
    emailDialog.showModal();
  });
  document.getElementById('email-dialog-close').addEventListener('click', () => emailDialog.close());
  emailDialog.addEventListener('click', (event) => {
    if (event.target === emailDialog) emailDialog.close();
  });
  emailModeToggle.addEventListener('click', () => {
    isCreatingAccount = !isCreatingAccount;
    document.getElementById('email-dialog-title').textContent = t(isCreatingAccount ? 'createAccount' : 'emailLogin');
    emailSubmit.textContent = t(isCreatingAccount ? 'createAccount' : 'signIn');
    emailModeToggle.textContent = t(isCreatingAccount ? 'existingAccount' : 'createAccount');
    document.getElementById('email-password').autocomplete = isCreatingAccount ? 'new-password' : 'current-password';
  });
  emailForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    document.getElementById('email-auth-message').hidden = true;
    const email = document.getElementById('email-address').value.trim();
    const password = document.getElementById('email-password').value;
    if (password.length < 6) {
      showInlineEmailMessage(t('passwordShort'), true);
      return;
    }
    emailSubmit.disabled = true;
    try {
      if (isCreatingAccount) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      emailDialog.close();
      setAccountStatus(isCreatingAccount ? t('emailCreated') : t('signedIn'));
    } catch (error) {
      console.error('Email orqali hisobga kirish amalga oshmadi.', error);
      showEmailError(error);
    } finally {
      emailSubmit.disabled = false;
    }
  });
  document.getElementById('password-reset').addEventListener('click', async () => {
    const email = document.getElementById('email-address').value.trim();
    if (!email || !document.getElementById('email-address').checkValidity()) {
      showInlineEmailMessage(t('passwordResetPrompt'), true);
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showInlineEmailMessage(t('resetSent'));
    } catch (error) {
      console.error('Parolni tiklash xatini yuborib bo‘lmadi.', error);
      showEmailError(error);
    }
  });

  const saveCloudData = async () => {
    if (!currentUser || restoringCloudData) return;
    const user = currentUser;
    try {
      await setDoc(doc(db, 'userTools', user.uid), readCloudData());
      if (currentUser?.uid === user.uid) {
        setAccountStatus(t('synced'));
      }
    } catch (error) {
      console.error('Shaxsiy vosita ma’lumotlarini Google hisobiga saqlab bo‘lmadi.', error);
      if (currentUser?.uid === user.uid) {
        setAccountStatus(t('authFailed', { message: error.message || 'Firestore error.' }), true);
      }
    }
  };

  queueCloudSave = () => {
    if (!currentUser || restoringCloudData) return;
    if (cloudSaveTimer) clearTimeout(cloudSaveTimer);
    setAccountStatus(t('syncing'));
    cloudSaveTimer = setTimeout(() => {
      cloudSaveTimer = null;
      void saveCloudData();
    }, 700);
  };

  signInButton.addEventListener('click', async () => {
    signInButton.disabled = true;
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google hisobi orqali kirishda xatolik yuz berdi.', error);
      showEmailError(error);
    } finally {
      signInButton.disabled = false;
    }
  });

  signOutButton.addEventListener('click', async () => {
    try {
      await signOut(auth);
      setAccountStatus(t('signedOut'));
    } catch (error) {
      console.error('Google hisobidan chiqishda xatolik yuz berdi.', error);
      showEmailError(error);
    }
  });

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    signInButton.hidden = Boolean(user);
    emailSignInButton.hidden = Boolean(user);
    signOutButton.hidden = !user;
    accountUser.hidden = !user;
    accountUser.textContent = user?.displayName || user?.email || '';
    if (!user) {
      if (!accountStatus.dataset.error) {
        setAccountStatus(t('signInNote'));
      }
      return;
    }
    restoringCloudData = true;
    setAccountStatus(t('loadingAccount'));
    try {
      const snapshot = await getDoc(doc(db, 'userTools', user.uid));
      if (currentUser?.uid !== user.uid) return;
      if (snapshot.exists()) {
        applyCloudData(snapshot.data());
        setAccountStatus(t('restored'));
      } else {
        await setDoc(doc(db, 'userTools', user.uid), readCloudData());
        setAccountStatus(t('firstSync'));
      }
    } catch (error) {
      console.error('Google hisobidagi shaxsiy ma’lumotlarni tiklab bo‘lmadi.', error);
      setAccountStatus(t('authFailed', { message: error.message || 'Firestore permission error.' }), true);
    } finally {
      restoringCloudData = false;
    }
  }, (error) => {
    console.error('Google hisobi holatini tekshirib bo‘lmadi.', error);
    setAccountStatus(t('authFailed', { message: error.message || 'Firebase Authentication error.' }), true);
  });
})();
