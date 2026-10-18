/**
* Template Name: Islamic Official
* Template URL: https://islamicofficial.com/
* Updated: Feb 22 2025 with Bootstrap v5.3.3
* Author: Islamic Official
* License: https://bootstrapmade.com/license/
*/
// 1. firebase-app.js dan initializeApp ni import qilamiz
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

// 2. Auth kutubxonalarini import qilamiz
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithEmailAndPassword,
  signInAnonymously,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  setDoc,
  increment,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";
import { uploadBookFile } from './firestore-pdf-store.js';

// 3. Firebase loyihangizning sozlamalari (Config)
const firebaseConfig = {
  apiKey: "AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY",
  authDomain: "islamicofficial-9279f.firebaseapp.com",
  projectId: "islamicofficial-9279f",
  storageBucket: "islamicofficial-9279f.firebasestorage.app",
  messagingSenderId: "251823878076",
  appId: "1:251823878076:web:9eff3e9b8b01f6f827c5b9"
};

// 4. Firebase-ni ishga tushirish (Xatolikni yo'qotadigan asosiy qator)
const app = initializeApp(firebaseConfig);

// 5. Auth-ni Firebase App bilan bog'lash
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const appleProvider = new OAuthProvider('apple.com');
const db = getFirestore(app);
const storage = getStorage(app);
const articlesRef = collection(db, 'articles');
const adminEmail = 'islomummati8@gmail.com';
const visitorId = localStorage.getItem('islamic-visitor-id') || (() => {
  const id = crypto.randomUUID();
  localStorage.setItem('islamic-visitor-id', id);
  return id;
})();
let phoneConfirmation = null;
let publicArticlesUnsubscribe = null;
let publicArticlesSnapshot = null;
let publicArticleLikesUnsubs = [];
let publicArticleFilter = 'all';
let publicArticleQuery = '';
const SAVED_ARTICLES_KEY = 'islamic-saved-articles-v1';
let adminArticlesUnsubscribe = null;
let adminMediaVideosUnsubscribe = null;
let adminDuasUnsubscribe = null;
let adminHadithsUnsubscribe = null;
let adminBooksUnsubscribe = null;
let uploadInProgress = false;
let prayerCountdownTimer = null;
let prayerRequestSequence = 0;
let prayerGeocodeSequence = 0;
let prayerGeocodeLastRequest = 0;
let manualPrayerLocationPending = false;
let currentPrayerTimingContext = null;
let publicArticleSnapshot = null;
let loginInProgress = false;
let editingArticleId = null;

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Rasmni o‘qib bo‘lmadi.'));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error('Rasm fayli yaroqsiz.'));
      image.onload = () => {
        const maxSide = 2048;
        const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.78);
        if (dataUrl.length > 850000) {
          reject(new Error('Rasm siqilgandan keyin ham juda katta. Kichikroq rasm tanlang.'));
          return;
        }

        resolve(dataUrl);
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

const translations = {
  uz: { home: 'Bosh sahifa', articles: 'Maqolalar', about: 'Biz haqimizda', services: 'Xizmatlar', contact: 'Aloqa', start: 'Boshlash', title: 'Islomiy maqolalar', subtitle: "Saytimizdagi eng yangi ilmiy-ma'rifiy maqolalar", read: "Davomini o'qish", faqTitle: "Ko'p beriladigan savollar", faqSubtitle: "Platformamiz va faoliyatimiz haqida tez-tez beriladigan savollarga javob toping.", faq1Title: "01. Loyihaning asosiy maqsadi nima?", faq1Text: "Sof Islom ma'rifatini yoyish, diniy savodxonlikni oshirish va ishonchli manbalarni taqdim etish.", faq2Title: "02. Media kontentlar qanday saralanadi?", faq2Text: "Maqola va videolar mo'tabar manbalar asosida mavzular bo'yicha saralanadi.", faq3Title: "03. Ma'ruzalarni tomosha qilish bepulmi?", faq3Text: "Ha, maqolalar va media materiallar barcha foydalanuvchilar uchun ochiq.", benefitsTitle: "Nega aynan Islamic Official?", benefitsText: "Foydalanuvchilarimiz uchun qulay, ishonchli va doimiy yangilanib boruvchi manba.", benefit1: "Sof va xolis ma'lumotlar", benefit2: "Zamonaviy va qulay interfeys", benefit3: "Barcha qurilmalarda muvofiqlik", missionTitle: "Islomiy ma'rifat va ishonchli manbalar platformasi", missionText: "Platformamiz ishonchli diniy manbalar, maqolalar va foydali media kontent orqali ma'rifat ulashadi.", skillsTitle: "Zamonaviy bilim va foydali media", skillsText: "Maqolalar, videodarslar va raqamli resurslar orqali o'rganish uchun qulay muhit.", skillArticles: "Maqolalar", skillMedia: "Media darslar", skillSources: "Ishonchli manbalar", skillCommunity: "Hamjamiyat", mediaTitle: "Islamic Media", mediaSubtitle: "Abdulloh domlaning oila va farzand tarbiyasiga oid to'liq darsliklar to'plami.", mediaChannel: "Kanalga o'tish" },
  en: { home: 'Home', articles: 'Articles', about: 'About', services: 'Services', contact: 'Contact', start: 'Get Started', title: 'Islamic Articles', subtitle: 'The latest educational articles from our website', read: 'Read more', faqTitle: 'Frequently Asked Questions', faqSubtitle: 'Find answers to common questions about our platform and work.', faq1Title: '01. What is the main purpose of the project?', faq1Text: 'To share authentic Islamic knowledge, improve religious literacy, and provide trusted sources.', faq2Title: '02. How is media content selected?', faq2Text: 'Articles and videos are organized by topic using respected sources.', faq3Title: '03. Are the lectures free to watch?', faq3Text: 'Yes, all articles and media materials are open to everyone.', benefitsTitle: 'Why Islamic Official?', benefitsText: 'We aim to be a convenient, trusted, and regularly updated source for our users.', benefit1: 'Pure and objective information', benefit2: 'Modern and convenient interface', benefit3: 'Works on all devices', missionTitle: 'A platform for Islamic knowledge and trusted sources', missionText: 'We share knowledge through trusted religious sources, articles, and useful media content.', skillsTitle: 'Modern knowledge and useful media', skillsText: 'A convenient environment for learning through articles, video lessons, and digital resources.', skillArticles: 'Articles', skillMedia: 'Media lessons', skillSources: 'Trusted sources', skillCommunity: 'Community', mediaTitle: 'Islamic Media', mediaSubtitle: 'A complete course on family and child education by Abdulloh domla.', mediaChannel: 'Visit channel' },
  ru: { home: 'Главная', articles: 'Статьи', about: 'О нас', services: 'Услуги', contact: 'Контакты', start: 'Начать', title: 'Исламские статьи', subtitle: 'Новые научно-просветительские статьи', read: 'Читать далее', faqTitle: 'Часто задаваемые вопросы', faqSubtitle: 'Ответы на частые вопросы о нашей платформе и деятельности.', faq1Title: '01. Какова главная цель проекта?', faq1Text: 'Распространять достоверные исламские знания и предоставлять надежные источники.', faq2Title: '02. Как отбирается медиаконтент?', faq2Text: 'Статьи и видео распределяются по темам на основе авторитетных источников.', faq3Title: '03. Лекции бесплатны?', faq3Text: 'Да, статьи и медиаматериалы открыты для всех пользователей.', benefitsTitle: 'Почему Islamic Official?', benefitsText: 'Мы стремимся быть удобным, надежным и постоянно обновляемым источником.', benefit1: 'Чистая и объективная информация', benefit2: 'Современный удобный интерфейс', benefit3: 'Работает на всех устройствах', missionTitle: 'Платформа исламского просвещения и надежных источников', missionText: 'Мы делимся знаниями через надежные религиозные источники, статьи и полезный медиаконтент.', skillsTitle: 'Современные знания и полезное медиа', skillsText: 'Удобная среда обучения через статьи, видеолекции и цифровые ресурсы.', skillArticles: 'Статьи', skillMedia: 'Медиалекции', skillSources: 'Надежные источники', skillCommunity: 'Сообщество', mediaTitle: 'Исламское медиа', mediaSubtitle: 'Полный курс об обучении семьи и детей от Абдуллоха домлы.', mediaChannel: 'Перейти на канал' }
};
translations.ar = { ...translations.en, home: 'الرئيسية', articles: 'المقالات', about: 'من نحن', services: 'الخدمات', contact: 'اتصل بنا', start: 'ابدأ الآن', title: 'مقالات إسلامية', subtitle: 'أحدث المقالات التعليمية من موقعنا', read: 'اقرأ المزيد', faqTitle: 'الأسئلة الشائعة', benefitsTitle: 'لماذا Islamic Official؟', newsletterTitle: 'اشترك في نشرتنا البريدية', newsletterText: 'احصل على أخبار المقالات والمواد الإعلامية الجديدة.', usefulLinks: 'روابط مفيدة', followUs: 'تابعنا', followText: 'تابع قنواتنا الرسمية للمحاضرات والمقالات الجديدة.', pricingTitle: 'مزايا Premium', pricingText: 'اختر الخطة المناسبة للمعرفة الموثوقة والاستخدام بدون إعلانات.', freePlan: 'مجاني', forever: ' / إلى الأبد', popular: 'الأكثر شعبية', proPlan: 'Premium Pro', perMonth: ' / شهرياً', proFeature1: 'استخدام بدون إعلانات', proFeature2: 'أدوات الصلاة والتعليم', proFeature3: 'تمارين العربية والتجويد', proFeature4: 'أدلة PDF حصرية', subscribe: 'اشترك', familyPlan: 'العائلة والشركاء', contactUs: 'اتصل بنا' };
translations.ar.proFeature3 = 'قراءة القرآن الكريم كاملاً';
Object.assign(translations.ar, {
  navBooks: 'المكتبة', booksBrowseAll: 'تصفح جميع الكتب', booksReadOnline: 'اقرأ عبر الإنترنت',
  webApps: 'المواقع والتطبيقات', allWebApps: 'جميع المواقع والتطبيقات',
  navQuran: 'قارئ القرآن', navAudio: 'صوتيات القرآن', navKids: 'تعليم الأطفال',
  navZikr: 'الأذكار والتقويم', navFinance: 'الزكاة والتمويل', navMeros: 'حاسبة الميراث',
  articleSearchLabel: 'البحث في المقالات',
  articleSearchPlaceholder: 'ابحث بعنوان المقال أو موضوعه',
  articleSearchCount: 'عدد المقالات التي تم العثور عليها: {count}.',
  articleSearchEmpty: 'لا توجد مقالات تطابق هذا البحث.',
  savedArticles: 'المحفوظات', saveArticle: 'حفظ للقراءة لاحقًا',
  removeSavedArticle: 'إزالة من المحفوظات', noSavedArticles: 'لا توجد مقالات محفوظة بعد.',
  saveArticleError: 'تعذر حفظ المقال على هذا الجهاز.', savedArticleCount: 'المقالات المحفوظة: {count}.'
});

Object.assign(translations.uz, {
  pricingTitle: 'Premium imkoniyatlar', pricingText: "Sizga kerakli bilim va reklamasiz foydalanish imkoniyatlarini tanlang.",
  freePlan: 'Bepul', forever: ' / abadiy', freeFeature1: "Ochiq maqolalar va YouTube ma'ruzalar", freeFeature2: "Asosiy duolar va foydali materiallar", freeFeature3: 'Standart platforma imkoniyatlari', startFree: 'Boshlash',
  popular: 'Mashhur', proPlan: 'Premium Pro', perMonth: ' / oyiga', discount: 'chegirma narx', proFeature1: 'Reklamasiz foydalanish', proFeature2: 'Eksklyuziv namoz va taʼlim vositalari', proFeature3: 'Qur’oni Karimni to‘liq o‘qish', proFeature4: "Eksklyuziv PDF qo'llanmalar", subscribe: "Obuna bo'lish",
  familyPlan: 'Oila va hamkorlar', familyFeature1: "5 tagacha oila a'zosi uchun kirish", familyFeature2: 'Bolalar uchun xavfsiz filtr', familyFeature3: "Oila statistikasi va qo'llab-quvvatlash", contactUs: "Bog'lanish", newsletterTitle: "Yangiliklarga obuna bo'ling", newsletterText: "Yangi maqola va media materiallardan xabardor bo'lib boring.", usefulLinks: "Foydali havolalar", followUs: "Bizni kuzating", followText: "Rasmiy kanallarimiz orqali yangi ma'ruzalar va maqolalardan xabardor bo'ling"
});
Object.assign(translations.en, {
  pricingTitle: 'Premium access', pricingText: 'Choose the plan that gives you trusted knowledge and an ad-free experience.', freePlan: 'Free', forever: ' / forever', freeFeature1: 'Open articles and YouTube lectures', freeFeature2: 'Basic duas and useful materials', freeFeature3: 'Standard platform features', startFree: 'Get started', popular: 'Popular', proPlan: 'Premium Pro', perMonth: ' / month', discount: 'discount price', proFeature1: 'Ad-free experience', proFeature2: 'Exclusive prayer and learning tools', proFeature3: 'Complete Qur’an reader', proFeature4: 'Exclusive PDF guides', subscribe: 'Subscribe', familyPlan: 'Family & partners', familyFeature1: 'Access for up to 5 family members', familyFeature2: 'Safe filter for children', familyFeature3: 'Family statistics and support', contactUs: 'Contact us', newsletterTitle: 'Join our newsletter', newsletterText: 'Get updates about new articles and media.', usefulLinks: 'Useful links', followUs: 'Follow us', followText: 'Follow our official channels for new lectures and articles.'
});
Object.assign(translations.ru, {
  pricingTitle: 'Премиум возможности', pricingText: 'Выберите доступ к знаниям и использованию платформы без рекламы.', freePlan: 'Бесплатный', forever: ' / навсегда', freeFeature1: 'Открытые статьи и лекции YouTube', freeFeature2: 'Основные дуа и полезные материалы', freeFeature3: 'Стандартные возможности платформы', startFree: 'Начать', popular: 'Популярный', proPlan: 'Premium Pro', perMonth: ' / месяц', discount: 'цена со скидкой', proFeature1: 'Без рекламы', proFeature2: 'Эксклюзивные молитвенные и учебные инструменты', proFeature3: 'Полное чтение Корана', proFeature4: 'Эксклюзивные PDF-пособия', subscribe: 'Подписаться', familyPlan: 'Семья и партнеры', familyFeature1: 'Доступ для 5 членов семьи', familyFeature2: 'Безопасный фильтр для детей', familyFeature3: 'Семейная статистика и поддержка', contactUs: 'Связаться', newsletterTitle: 'Подпишитесь на новости', newsletterText: 'Получайте новости о новых статьях и медиа.', usefulLinks: 'Полезные ссылки', followUs: 'Мы в соцсетях', followText: 'Следите за официальными каналами и новыми лекциями.'
});
Object.assign(translations.uz, {
  navMedia: 'Media', appLinks: 'Ilova va kanallar', webApps: 'Web va ilovalar', allWebApps: 'Barcha web va ilovalar',
  navQuran: 'Qur’on o‘quvchisi', navAudio: 'Qur’on audio', navKids: 'Bolalar olami',
  navZikr: 'Zikr va taqvim', navFinance: 'Zakot va moliya', navMeros: 'Meros hisoblagichi',
  allArticles: 'Barcha maqolalar', guides: 'Qo‘llanmalar',
  openMenu: 'Menyuni ochish', language: 'Til', fontDecrease: 'Shriftni kichraytirish',
  fontIncrease: 'Shriftni kattalashtirish', darkMode: 'Qorong‘i rejimga o‘tish', lightMode: 'Yorug‘ rejimga o‘tish',
  prayerTimes: 'Namoz vaqtlari', duas: 'Duolar', hadiths: 'Hadislar', myWorship: 'Ibodatlarim',
  privacy: 'Maxfiylik siyosati', login: 'Kirish', prayerTrackerTitle: 'Shaxsiy ibodat va odatlar',
  prayerTrackerSubtitle: 'Faqat siz ko‘radigan kundalik nazorat va tahlil.',
  privacyNote: 'Bu ma’lumotlar faqat sizning qurilmangizda yoki akkauntingizda saqlanadi.',
  prayerFajr: 'Bomdod', prayerDhuhr: 'Peshin', prayerAsr: 'Asr', prayerMaghrib: 'Shom',
  prayerIsha: 'Xufton', prayerQuran: 'Qur’on', prayerDone: 'Bajarildi',
  prayerMarkDone: 'Bajarildi deb belgilang', prayerToday: 'Bugungi bajarilganlar',
  prayerActionsComplete: 'amal bajarildi', habitTitle: 'Odatlarim',
  habitPlaceholder: 'Yangi odat, masalan: 20 daqiqa Qur’on', addHabit: 'Odat qo‘shish',
  habitTodayDone: 'Bugun bajarildi', habitMarkDone: 'Bugun bajarildi deb belgilang',
  noHabits: 'Hali odat qo‘shilmagan.', egypt: 'Misr', hanafi: 'Hanafiy',
  otherSchools: 'Shofe’iy / Molikiy / Hanbaliy',
  prayerSearchCity: 'Shahar nomi', prayerSearchPlaceholder: 'Masalan, Samarqand, O‘zbekiston',
  prayerCityResults: 'Topilgan shaharlar',
  search: 'Qidirish', prayerMethod: 'Hisoblash usuli', asrSchool: 'Asr hisoblash mazhabi',
  useLocation: 'Joylashuvimni aniqlash', nextPrayer: 'Keyingi namozgacha',
  prayerGeocoding: 'Shahar koordinatalari aniqlanmoqda…',
  prayerCityNotFound: 'Bu shahar topilmadi. Shahar va davlat nomini birga kiriting.',
  prayerCityLookupFailed: 'Shaharni aniqlash xizmati ishlamadi. Birozdan so‘ng qayta urinib ko‘ring.',
  prayerSources: 'Shahar koordinatalari va namoz vaqtlari manbalari:',
  servicesTitle: 'Bizning yo‘nalishlarimiz',
  servicesText: 'Ishonchli bilim, media va zamonaviy raqamli imkoniyatlar bir platformada.',
  processTitle: 'Ma’lumotlarni tayyorlash bosqichlari',
  callTitle: 'Rasmiy kanallarimizga obuna bo‘ling!',
  callText: 'Eng so‘nggi ma’ruzalar, videodarslar va ma’rifiy maqolalardan doimiy xabardor bo‘lib boring.',
  callLinks: 'Ilova va rasmiy kanallar', share: 'Ulashish'
});
Object.assign(translations.en, {
  navMedia: 'Media', appLinks: 'Apps & channels', webApps: 'Web & apps', allWebApps: 'All web services and apps',
  navQuran: 'Qur’an reader', navAudio: 'Qur’an audio', navKids: 'Kids’ learning',
  navZikr: 'Dhikr & calendar', navFinance: 'Zakat & finance', navMeros: 'Inheritance calculator',
  allArticles: 'All articles', guides: 'Guides',
  openMenu: 'Open menu', language: 'Language', fontDecrease: 'Decrease font size',
  fontIncrease: 'Increase font size', darkMode: 'Switch to dark mode', lightMode: 'Switch to light mode',
  prayerTimes: 'Prayer times', duas: 'Duas', hadiths: 'Hadiths', myWorship: 'My worship',
  privacy: 'Privacy policy', login: 'Sign in', prayerTrackerTitle: 'Personal worship and habits',
  prayerTrackerSubtitle: 'A daily tracker and overview visible only to you.',
  privacyNote: 'This information is stored only on your device or in your account.',
  prayerFajr: 'Fajr', prayerDhuhr: 'Dhuhr', prayerAsr: 'Asr', prayerMaghrib: 'Maghrib',
  prayerIsha: 'Isha', prayerQuran: 'Qur’an', prayerDone: 'Completed',
  prayerMarkDone: 'Mark as completed', prayerToday: 'Completed today',
  prayerActionsComplete: 'actions completed', habitTitle: 'My habits',
  habitPlaceholder: 'New habit, e.g. 20 minutes of Qur’an', addHabit: 'Add habit',
  habitTodayDone: 'Completed today', habitMarkDone: 'Mark completed today',
  noHabits: 'No habits added yet.', egypt: 'Egypt', hanafi: 'Hanafi',
  otherSchools: 'Shafi‘i / Maliki / Hanbali',
  prayerSearchCity: 'City name', prayerSearchPlaceholder: 'For example, Samarkand, Uzbekistan',
  prayerCityResults: 'Matching cities',
  search: 'Search', prayerMethod: 'Calculation method', asrSchool: 'Asr calculation school',
  useLocation: 'Use my location', nextPrayer: 'Time until next prayer',
  prayerGeocoding: 'Finding the city coordinates…',
  prayerCityNotFound: 'City not found. Enter the city together with its country.',
  prayerCityLookupFailed: 'The city lookup service failed. Please try again shortly.',
  prayerSources: 'City coordinates and prayer-time source:',
  servicesTitle: 'Our areas',
  servicesText: 'Trusted knowledge, media, and modern digital tools in one platform.',
  processTitle: 'How content is prepared',
  callTitle: 'Follow our official channels!',
  callText: 'Stay up to date with lectures, video lessons, and educational articles.',
  callLinks: 'Apps and official channels', share: 'Share'
});
Object.assign(translations.ru, {
  navMedia: 'Медиа', appLinks: 'Приложения и каналы', webApps: 'Сайты и приложения', allWebApps: 'Все сайты и приложения',
  navQuran: 'Чтение Корана', navAudio: 'Аудио Корана', navKids: 'Обучение детей',
  navZikr: 'Зикр и календарь', navFinance: 'Закят и финансы', navMeros: 'Калькулятор наследства',
  allArticles: 'Все статьи', guides: 'Разделы',
  openMenu: 'Открыть меню', language: 'Язык', fontDecrease: 'Уменьшить шрифт',
  fontIncrease: 'Увеличить шрифт', darkMode: 'Включить темную тему', lightMode: 'Включить светлую тему',
  prayerTimes: 'Время намаза', duas: 'Дуа', hadiths: 'Хадисы', myWorship: 'Мои поклонения',
  privacy: 'Политика конфиденциальности', login: 'Войти', prayerTrackerTitle: 'Личные поклонения и привычки',
  prayerTrackerSubtitle: 'Ежедневный учет и статистика, доступные только вам.',
  privacyNote: 'Эти данные хранятся только на вашем устройстве или в вашей учетной записи.',
  prayerFajr: 'Фаджр', prayerDhuhr: 'Зухр', prayerAsr: 'Аср', prayerMaghrib: 'Магриб',
  prayerIsha: 'Иша', prayerQuran: 'Коран', prayerDone: 'Выполнено',
  prayerMarkDone: 'Отметить как выполненное', prayerToday: 'Выполнено сегодня',
  prayerActionsComplete: 'действий выполнено', habitTitle: 'Мои привычки',
  habitPlaceholder: 'Новая привычка, например: 20 минут чтения Корана', addHabit: 'Добавить привычку',
  habitTodayDone: 'Выполнено сегодня', habitMarkDone: 'Отметить выполненным сегодня',
  noHabits: 'Пока привычки не добавлены.', egypt: 'Египет', hanafi: 'Ханафитский',
  otherSchools: 'Шафиитский / Маликитский / Ханбалитский',
  prayerSearchCity: 'Название города', prayerSearchPlaceholder: 'Например, Самарканд, Узбекистан',
  prayerCityResults: 'Найденные города',
  search: 'Найти', prayerMethod: 'Метод расчета', asrSchool: 'Мазхаб для расчета Асра',
  useLocation: 'Определить мое местоположение', nextPrayer: 'До следующего намаза',
  prayerGeocoding: 'Определяем координаты города…',
  prayerCityNotFound: 'Город не найден. Укажите город вместе со страной.',
  prayerCityLookupFailed: 'Сервис поиска города недоступен. Повторите попытку позже.',
  prayerSources: 'Координаты города и источник времени намаза:',
  servicesTitle: 'Наши направления',
  servicesText: 'Достоверные знания, медиа и современные цифровые возможности на одной платформе.',
  processTitle: 'Как готовятся материалы',
  callTitle: 'Подписывайтесь на наши официальные каналы!',
  callText: 'Следите за новыми лекциями, видеоуроками и просветительскими статьями.',
  callLinks: 'Приложения и официальные каналы', share: 'Поделиться'
});
Object.assign(translations.uz, {
  heroKicker: 'Ilm · ma’rifat · kundalik hayot',
  heroDescription: 'O‘zbek tilidagi islomiy ma’rifiy maqolalar, video darslar va kundalik foydali resurslar.',
  heroArticles: 'Maqolalarni ko‘rish', heroVideos: 'Videolar',
  siteSearch: 'Saytdan qidirish', siteSearchPlaceholder: 'Masalan: namoz vaqti, Nurul Yaqin PDF yoki valyuta kursi',
  siteSearchResults: 'Qidiruv natijalari', heroImageAlt: 'Masjid va uning atrofidagi manzara',
  articlesTitle: 'Islomiy maqolalar', articlesSubtitle: 'Saytimizdagi eng yangi ilmiy-ma’rifiy maqolalar',
  articleGroups: 'Maqola guruhlari', articleFilterAll: 'Barchasi',
  articleFilterImages: 'Faqat suratlar', articleFilterText: 'To‘liq matnlar',
  articleFilterLinks: 'Havolali maqolalar', articlesLoading: 'Maqolalar yuklanmoqda...',
  articleSearchLabel: 'Maqolalardan qidirish',
  articleSearchPlaceholder: 'Maqola nomi yoki mavzusi bo‘yicha qidiring',
  articleSearchCount: '{count} ta maqola topildi.', articleSearchEmpty: 'Bu qidiruv bo‘yicha maqola topilmadi.',
  savedArticles: 'Saqlanganlar', saveArticle: 'Keyin o‘qish uchun saqlash',
  removeSavedArticle: 'Saqlanganlardan olib tashlash', noSavedArticles: 'Hali saqlangan maqola yo‘q.',
  saveArticleError: 'Maqolani qurilmada saqlab bo‘lmadi.', savedArticleCount: 'Saqlangan maqolalar: {count}.',
  serviceArticlesTitle: 'Diniy-ma’rifiy maqolalar', serviceArticlesText: 'Ishonchli manbalarga tayangan maqolalar to‘plami.',
  serviceMediaTitle: 'Islamic Media', serviceMediaText: 'Saralangan ma’ruzalar va foydali video darslar.',
  serviceAppsTitle: 'Mobil ilova va rasmiy sahifalar', serviceAppsText: 'Kundalik ibodat va o‘rganish uchun qulay dasturlar.',
  serviceLibraryTitle: 'Manbalar kutubxonasi', serviceLibraryText: 'Elektron kitoblar va o‘quv qo‘llanmalar.',
  processDescription: 'Ishonchli kontentni tayyorlash va foydalanuvchiga yetkazishning uch bosqichi.',
  step1Title: 'Manbani tekshirish va tanlash', step1Text: 'Materiallar mo‘tabar va e’tirof etilgan manbalardan saralanadi.',
  step1Feature1: 'Mo‘tabar manba', step1Feature2: 'Mavzuni aniqlash', step1Feature3: 'Dalillarni tekshirish',
  step2Title: 'Tahrir va ekspertiza', step2Text: 'Materiallar aqidaviy va imlo xatolaridan xoli bo‘lishi uchun tahrir qilinadi.',
  step2Feature1: 'Tahrir', step2Feature2: 'Ekspertiza', step2Feature3: 'Sifat nazorati',
  step3Title: 'Ommaga taqdim etish', step3Text: 'Tekshirilgan kontent sayt, ilova va ijtimoiy tarmoqlarda taqdim etiladi.',
  step3Feature1: 'Saytga joylash', step3Feature2: 'Qulay format', step3Feature3: 'Muntazam yangilash',
  contactDescription: 'Savol va takliflaringizni elektron pochta orqali yuboring.',
  contactPhone: 'Telefon', contactEmail: 'Elektron pochta',
  prayerEyebrow: 'Joyingizga mos jadval', prayerLocationLoading: 'Joylashuvingiz aniqlanmoqda…',
  prayerLoading: 'Namoz vaqtlari yuklanmoqda…', prayerError: 'Namoz vaqtlari hozircha olinmadi.',
  prayerDisclaimer: 'Namoz vaqtlari tanlangan hisoblash usuli bo‘yicha ko‘rsatiladi. Usul yoki mahalliy masjid taqvimiga qarab bir necha daqiqa farq qilishi mumkin.',
  prayerAppliedMethod: 'API qo‘llagan hisoblash usuli:', prayerCityRequired: 'Bu mamlakat nomi, shahar emas. Iltimos, shahar va mamlakatni kiriting (masalan, Qohira, Misr).',
  prayerLocationUnsupported: 'Bu qurilmada joylashuvni aniqlash ishlamaydi. Shahar nomini kiriting.',
  prayerGpsLocation: 'GPS joylashuvi', prayerCoordinatesLabel: 'Koordinatalar bo‘yicha joylashuv',
  prayerLocationDenied: 'Joylashuv ruxsati berilmadi. Shaharni qidirib tanlang yoki brauzer sozlamasida ruxsat bering.',
  prayerLocationUnavailable: 'Joylashuv aniqlanmadi. Shaharni qidirib tanlang yoki qayta urinib ko‘ring.',
  prayerApiTimeout: 'Namoz vaqtlari xizmati javobi kechikdi. Internetni tekshirib, qayta urinib ko‘ring.',
  prayerApiHttp: 'Namoz vaqtlari xizmati HTTP xatosini qaytardi.',
  prayerApiNoData: 'Namoz vaqtlari olinmadi. Birozdan so‘ng qayta urinib ko‘ring.',
  prayerApiMethodMismatch: 'Tanlangan hisoblash usuli API javobida tasdiqlanmadi. Jadval yangilanmadi.',
  methodMwl: 'Muslim World League', methodIsna: 'ISNA (Shimoliy Amerika)',
  methodKarachi: 'Karachi', methodUmmAlQura: 'Umm al-Qura',
  methodTurkey: 'Turkiya (Diyanet, tajribaviy)'
});
Object.assign(translations.en, {
  heroKicker: 'Knowledge · education · daily life',
  heroDescription: 'Islamic educational articles in Uzbek, video lessons, and useful daily resources.',
  heroArticles: 'Browse articles', heroVideos: 'Videos',
  siteSearch: 'Search the site', siteSearchPlaceholder: 'For example: prayer time, Nurul Yaqin PDF, or currency rates',
  siteSearchResults: 'Search results', heroImageAlt: 'Mosque and surrounding landscape',
  articlesTitle: 'Islamic articles', articlesSubtitle: 'The latest educational articles from our website',
  articleGroups: 'Article groups', articleFilterAll: 'All',
  articleFilterImages: 'Images only', articleFilterText: 'Full text',
  articleFilterLinks: 'Articles with links', articlesLoading: 'Loading articles...',
  articleSearchLabel: 'Search articles',
  articleSearchPlaceholder: 'Search by article title or topic',
  articleSearchCount: '{count} articles found.', articleSearchEmpty: 'No articles match this search.',
  savedArticles: 'Saved', saveArticle: 'Save for later',
  removeSavedArticle: 'Remove from saved', noSavedArticles: 'No saved articles yet.',
  saveArticleError: 'This article could not be saved on this device.', savedArticleCount: 'Saved articles: {count}.',
  serviceArticlesTitle: 'Islamic educational articles', serviceArticlesText: 'Articles based on trusted sources.',
  serviceMediaTitle: 'Islamic Media', serviceMediaText: 'Selected lectures and useful video lessons.',
  serviceAppsTitle: 'Mobile apps and official pages', serviceAppsText: 'Useful apps for daily worship and learning.',
  serviceLibraryTitle: 'Resource library', serviceLibraryText: 'E-books and study guides.',
  processDescription: 'Three steps for preparing trusted content and sharing it with users.',
  step1Title: 'Check and select sources', step1Text: 'Materials are selected from respected, recognized sources.',
  step1Feature1: 'Trusted source', step1Feature2: 'Define the topic', step1Feature3: 'Verify evidence',
  step2Title: 'Editing and review', step2Text: 'Materials are edited to remove doctrinal and spelling errors.',
  step2Feature1: 'Editing', step2Feature2: 'Expert review', step2Feature3: 'Quality control',
  step3Title: 'Publish for everyone', step3Text: 'Verified content is shared on the website, apps, and social networks.',
  step3Feature1: 'Publish online', step3Feature2: 'Accessible format', step3Feature3: 'Regular updates',
  contactDescription: 'Send your questions and suggestions by email.',
  contactPhone: 'Phone', contactEmail: 'Email',
  prayerEyebrow: 'Prayer times for your location', prayerLocationLoading: 'Finding your location…',
  prayerLoading: 'Loading prayer times…', prayerError: 'Prayer times are temporarily unavailable.',
  prayerDisclaimer: 'Times use the selected calculation method. They can differ by a few minutes from local mosque timetables.',
  prayerAppliedMethod: 'Calculation method confirmed by API:', prayerCityRequired: 'That result is a country, not a city. Enter a city and country (for example, Cairo, Egypt).',
  prayerLocationUnsupported: 'Location is unavailable on this device. Enter a city name.',
  prayerGpsLocation: 'GPS location', prayerCoordinatesLabel: 'Location by coordinates',
  prayerLocationDenied: 'Location permission was denied. Search for a city or allow location access in your browser settings.',
  prayerLocationUnavailable: 'Could not determine your location. Search for a city or try again.',
  prayerApiTimeout: 'The prayer-time service timed out. Check your connection and try again.',
  prayerApiHttp: 'The prayer-time service returned an HTTP error.',
  prayerApiNoData: 'Prayer times could not be loaded. Please try again shortly.',
  prayerApiMethodMismatch: 'The API did not confirm the selected calculation method. The schedule was not updated.',
  methodMwl: 'Muslim World League', methodIsna: 'ISNA (North America)',
  methodKarachi: 'Karachi', methodUmmAlQura: 'Umm al-Qura',
  methodTurkey: 'Turkey (Diyanet, experimental)'
});
Object.assign(translations.ru, {
  heroKicker: 'Знания · просвещение · повседневная жизнь',
  heroDescription: 'Исламские просветительские статьи на узбекском языке, видеоуроки и полезные материалы на каждый день.',
  heroArticles: 'Смотреть статьи', heroVideos: 'Видео',
  siteSearch: 'Поиск по сайту', siteSearchPlaceholder: 'Например: время намаза, Nurul Yaqin PDF или курс валют',
  siteSearchResults: 'Результаты поиска', heroImageAlt: 'Мечеть и окружающий пейзаж',
  articlesTitle: 'Исламские статьи', articlesSubtitle: 'Новые просветительские статьи на нашем сайте',
  articleGroups: 'Группы статей', articleFilterAll: 'Все',
  articleFilterImages: 'Только изображения', articleFilterText: 'Полные тексты',
  articleFilterLinks: 'Статьи со ссылками', articlesLoading: 'Загрузка статей...',
  articleSearchLabel: 'Поиск статей',
  articleSearchPlaceholder: 'Поиск по названию или теме статьи',
  articleSearchCount: 'Найдено статей: {count}.', articleSearchEmpty: 'По этому запросу статьи не найдены.',
  savedArticles: 'Сохраненные', saveArticle: 'Сохранить на потом',
  removeSavedArticle: 'Убрать из сохраненных', noSavedArticles: 'Сохраненных статей пока нет.',
  saveArticleError: 'Не удалось сохранить статью на этом устройстве.', savedArticleCount: 'Сохраненных статей: {count}.',
  serviceArticlesTitle: 'Исламские просветительские статьи', serviceArticlesText: 'Статьи на основе надежных источников.',
  serviceMediaTitle: 'Исламское медиа', serviceMediaText: 'Подборка лекций и полезных видеоуроков.',
  serviceAppsTitle: 'Мобильные приложения и официальные страницы', serviceAppsText: 'Приложения для ежедневного поклонения и обучения.',
  serviceLibraryTitle: 'Библиотека источников', serviceLibraryText: 'Электронные книги и учебные пособия.',
  processDescription: 'Три этапа подготовки достоверных материалов и их публикации.',
  step1Title: 'Проверка и выбор источников', step1Text: 'Материалы отбираются из авторитетных и признанных источников.',
  step1Feature1: 'Надежный источник', step1Feature2: 'Определение темы', step1Feature3: 'Проверка доводов',
  step2Title: 'Редактирование и экспертиза', step2Text: 'Материалы редактируются для устранения ошибок в вероучении и правописании.',
  step2Feature1: 'Редактирование', step2Feature2: 'Экспертиза', step2Feature3: 'Контроль качества',
  step3Title: 'Публикация', step3Text: 'Проверенные материалы публикуются на сайте, в приложениях и соцсетях.',
  step3Feature1: 'Публикация на сайте', step3Feature2: 'Удобный формат', step3Feature3: 'Регулярные обновления',
  contactDescription: 'Отправьте вопросы и предложения по электронной почте.',
  contactPhone: 'Телефон', contactEmail: 'Электронная почта',
  prayerEyebrow: 'Расписание для вашего местоположения', prayerLocationLoading: 'Определяем местоположение…',
  prayerLoading: 'Загружаем время намаза…', prayerError: 'Время намаза пока недоступно.',
  prayerDisclaimer: 'Время рассчитано выбранным методом и может отличаться на несколько минут от расписания местной мечети.',
  prayerAppliedMethod: 'Метод расчета, подтвержденный API:', prayerCityRequired: 'Найдено название страны, а не города. Укажите город и страну (например, Каир, Египет).',
  prayerLocationUnsupported: 'На этом устройстве геолокация недоступна. Введите название города.',
  prayerGpsLocation: 'Местоположение по GPS', prayerCoordinatesLabel: 'Местоположение по координатам',
  prayerLocationDenied: 'Нет разрешения на геолокацию. Найдите город или разрешите доступ в настройках браузера.',
  prayerLocationUnavailable: 'Не удалось определить местоположение. Найдите город или попробуйте еще раз.',
  prayerApiTimeout: 'Сервис времени намаза не ответил вовремя. Проверьте интернет и повторите попытку.',
  prayerApiHttp: 'Сервис времени намаза вернул ошибку HTTP.',
  prayerApiNoData: 'Не удалось загрузить время намаза. Попробуйте позже.',
  prayerApiMethodMismatch: 'API не подтвердил выбранный метод расчета. Расписание не обновлено.',
  methodMwl: 'Всемирная мусульманская лига', methodIsna: 'ISNA (Северная Америка)',
  methodKarachi: 'Карачи', methodUmmAlQura: 'Умм аль-Кура',
  methodTurkey: 'Турция (Диянет, экспериментальный)'
});
Object.assign(translations.uz, {
  navBooks: 'Kutubxona', booksBrowseAll: 'Barcha kitoblarni ko‘rish',
  booksReadOnline: 'Onlayn o‘qish',
  pdfBooksTitle: 'PDF kitoblar', pdfBooksDescription: 'Foydali kitoblarni onlayn o‘qing yoki yuklab oling.',
  pdfDownload: 'PDF faylni yuklab olish', booksEmpty: 'Hozircha kitoblar qo‘shilmagan.',
  booksLoadError: 'Kitoblarni yuklashda xatolik yuz berdi.', duasLoadError: 'Duolarni yuklashda xatolik yuz berdi.',
  booksLoading: 'Kitoblar yuklanmoqda...', duasLoading: 'Duolar yuklanmoqda...',
  duaSectionTitle: 'Duolar', duaSectionDescription: 'Kategoriyalar bo‘yicha foydali duolar',
  duaAll: 'Barchasi', duaReading: 'Lotincha o‘qilishi', duaMeaning: 'Ma’nosi',
  duasEmpty: 'Hozircha duolar qo‘shilmagan.', generalCategory: 'Umumiy',
  hadithSectionTitle: 'Kun hadisi va hadislar kutubxonasi',
  hadithSectionDescription: 'Har kuni manbasi ko‘rsatilgan hadis o‘qing. Matnlar kitob va hadis raqami bilan beriladi.',
  todayHadith: 'Bugungi hadis', hadithSearchPlaceholder: 'Hadis, kitob yoki raqam bo‘yicha qidirish',
  hadithLoading: 'Hadislar yuklanmoqda...', hadithEmpty: 'Hozircha hadislar qo‘shilmagan.',
  hadithLoadError: 'Hadislarni yuklashda xatolik yuz berdi.', hadithNoResults: 'Qidiruv bo‘yicha hadis topilmadi.',
  hadithSource: 'Manba', hadithGradeDefault: 'Manbasi ko‘rsatilgan', hadithTitleDefault: 'Hadis',
  featuredHadithGrade: 'Sahih',
  featuredHadithTitle: 'Niyat',
  featuredHadithTranslation: 'Amallar niyatga bog‘liq. Har bir kishiga niyat qilgan narsasi bo‘ladi.',
  featuredHadithSource: 'Sahih al-Buxoriy',
  articleLabel: 'Maqola', articleUntitled: 'Nomsiz maqola', articleImageOnly: 'Faqat surat',
  articleEmpty: 'Hozircha maqolalar mavjud emas.', articleOpenSource: 'Manbani ochish',
  articleReadMore: 'Davomini o‘qish', articleReadMoreAria: 'Maqolani to‘liq o‘qish',
  articleLoadError: 'Maqolalarni yuklashda xatolik yuz berdi.',
  searchNoSection: 'Mos bo‘lim topilmadi. Boshqa so‘z bilan qidiring.',
  searchNoResults: 'Mos natija topilmadi.', searchResultsCount: '{count} ta natija topildi.',
  searchPrayerDescription: 'Shahar bo‘yicha kunlik namoz jadvali', searchDuaDescription: 'Duo va kundalik zikrlar',
  searchHadithDescription: 'Manbali hadislar va qidiruv', searchWorshipDescription: 'Shaxsiy ibodat qaydlari va odatlar',
  searchBooksDescription: 'PDF kitoblar kutubxonasi', searchArticlesDescription: 'Saytdagi barcha maqolalarni ko‘rish',
  searchMediaDescription: 'Islomiy video darslar sahifasi', searchLinksDescription: 'Zikr ilovasi va ijtimoiy tarmoqlar',
  searchContactDescription: 'Bog‘lanish ma’lumotlari',
  footerLinksTitle: 'Foydali havolalar', footerPhone: 'Telefon:', footerPrivacy: 'Maxfiylik siyosati',
  footerApps: 'Ilova va rasmiy sahifalar', footerArticles: 'Diniy-ma’rifiy maqolalar',
  footerMedia: 'Islamic Media', footerChannels: 'Ilova va kanallar',
  copyright: 'Mualliflik huquqi', allRightsReserved: 'Barcha huquqlar himoyalangan',
  signInTitle: 'Islamic Official saytiga kirish', continueGoogle: 'Google orqali davom etish',
  continueApple: 'Apple orqali davom etish', continueAnonymous: 'Mehmon sifatida davom etish',
  emailPlaceholder: 'Elektron pochta', passwordPlaceholder: 'Parol',
  emailSignIn: 'Elektron pochta orqali kirish', phoneNumber: 'Telefon raqami (+996...)',
  smsCode: 'SMS kodi', verifyButton: 'Tasdiqlash', closeDialog: 'Yopish'
});
Object.assign(translations.en, {
  navBooks: 'Library', booksBrowseAll: 'Browse all books',
  booksReadOnline: 'Read online',
  pdfBooksTitle: 'PDF books', pdfBooksDescription: 'Read useful books online or download them.',
  pdfDownload: 'Download PDF', booksEmpty: 'No books have been added yet.',
  booksLoadError: 'Books could not be loaded.', duasLoadError: 'Duas could not be loaded.',
  booksLoading: 'Loading books...', duasLoading: 'Loading duas...',
  duaSectionTitle: 'Duas', duaSectionDescription: 'Useful duas by category',
  duaAll: 'All', duaReading: 'Transliteration', duaMeaning: 'Meaning',
  duasEmpty: 'No duas have been added yet.', generalCategory: 'General',
  duaMorning: 'Morning duas', duaEvening: 'Evening duas',
  hadithSectionTitle: 'Daily hadith and hadith library',
  hadithSectionDescription: 'Read a sourced hadith each day. References include the book and hadith number.',
  todayHadith: 'Today’s hadith', hadithSearchPlaceholder: 'Search by hadith, book, or number',
  hadithLoading: 'Loading hadiths...', hadithEmpty: 'No hadiths have been added yet.',
  hadithLoadError: 'Hadiths could not be loaded.', hadithNoResults: 'No hadiths match your search.',
  hadithSource: 'Source', hadithGradeDefault: 'Source provided', hadithTitleDefault: 'Hadith',
  featuredHadithTitle: 'Intention',
  featuredHadithGrade: 'Sahih',
  featuredHadithTranslation: 'Actions are judged by intentions, and each person will have only what they intended.',
  featuredHadithSource: 'Sahih al-Bukhari',
  articleLabel: 'Article', articleUntitled: 'Untitled article', articleImageOnly: 'Image only',
  articleEmpty: 'No articles are available yet.', articleOpenSource: 'Open source',
  articleReadMore: 'Read more', articleReadMoreAria: 'Read the full article',
  articleLoadError: 'Articles could not be loaded.',
  searchNoSection: 'No matching section. Try another search term.',
  searchNoResults: 'No matching results.', searchResultsCount: '{count} results found.',
  searchPrayerDescription: 'Daily prayer times by city', searchDuaDescription: 'Duas and daily remembrance',
  searchHadithDescription: 'Sourced hadiths and search', searchWorshipDescription: 'Personal worship tracker and habits',
  searchBooksDescription: 'PDF book library', searchArticlesDescription: 'Browse all website articles',
  searchMediaDescription: 'Islamic video lessons', searchLinksDescription: 'Zikr app and social channels',
  searchContactDescription: 'Contact information',
  footerLinksTitle: 'Useful links', footerPhone: 'Phone:', footerPrivacy: 'Privacy policy',
  footerApps: 'Apps and official pages', footerArticles: 'Islamic educational articles',
  footerMedia: 'Islamic Media', footerChannels: 'Apps and channels',
  copyright: 'Copyright', allRightsReserved: 'All rights reserved',
  signInTitle: 'Sign in to Islamic Official', continueGoogle: 'Continue with Google',
  continueApple: 'Continue with Apple', continueAnonymous: 'Continue as guest',
  emailPlaceholder: 'Email address', passwordPlaceholder: 'Password',
  emailSignIn: 'Sign in with email', phoneNumber: 'Phone number (+996...)',
  smsCode: 'SMS code', verifyButton: 'Verify', closeDialog: 'Close'
});
Object.assign(translations.ru, {
  navBooks: 'Библиотека', booksBrowseAll: 'Все книги',
  booksReadOnline: 'Читать онлайн',
  pdfBooksTitle: 'Книги в PDF', pdfBooksDescription: 'Читайте полезные книги онлайн или скачивайте их.',
  pdfDownload: 'Скачать PDF', booksEmpty: 'Книги пока не добавлены.',
  booksLoadError: 'Не удалось загрузить книги.', duasLoadError: 'Не удалось загрузить дуа.',
  booksLoading: 'Загрузка книг...', duasLoading: 'Загрузка дуа...',
  duaSectionTitle: 'Дуа', duaSectionDescription: 'Полезные дуа по категориям',
  duaAll: 'Все', duaReading: 'Транслитерация', duaMeaning: 'Значение',
  duasEmpty: 'Дуа пока не добавлены.', generalCategory: 'Общее',
  duaMorning: 'Утренние дуа', duaEvening: 'Вечерние дуа',
  hadithSectionTitle: 'Хадис дня и библиотека хадисов',
  hadithSectionDescription: 'Читайте хадисы с указанием источника. В ссылках указаны сборник и номер хадиса.',
  todayHadith: 'Хадис дня', hadithSearchPlaceholder: 'Поиск по хадису, сборнику или номеру',
  hadithLoading: 'Загрузка хадисов...', hadithEmpty: 'Хадисы пока не добавлены.',
  hadithLoadError: 'Не удалось загрузить хадисы.', hadithNoResults: 'По запросу хадисы не найдены.',
  hadithSource: 'Источник', hadithGradeDefault: 'Источник указан', hadithTitleDefault: 'Хадис',
  featuredHadithTitle: 'Намерение',
  featuredHadithGrade: 'Сахих',
  featuredHadithTranslation: 'Поистине, дела оцениваются по намерениям, и каждому человеку достанется то, что он намеревался совершить.',
  featuredHadithSource: 'Сахих аль-Бухари',
  articleLabel: 'Статья', articleUntitled: 'Статья без названия', articleImageOnly: 'Только изображение',
  articleEmpty: 'Статей пока нет.', articleOpenSource: 'Открыть источник',
  articleReadMore: 'Читать далее', articleReadMoreAria: 'Читать статью полностью',
  articleLoadError: 'Не удалось загрузить статьи.',
  searchNoSection: 'Раздел не найден. Попробуйте другой запрос.',
  searchNoResults: 'Ничего не найдено.', searchResultsCount: 'Найдено результатов: {count}.',
  searchPrayerDescription: 'Расписание намаза по городу', searchDuaDescription: 'Дуа и ежедневные поминания',
  searchHadithDescription: 'Поиск хадисов с источниками', searchWorshipDescription: 'Личные отметки и привычки',
  searchBooksDescription: 'Библиотека книг в PDF', searchArticlesDescription: 'Все статьи на сайте',
  searchMediaDescription: 'Страница исламских видеоуроков', searchLinksDescription: 'Приложение Zikr и соцсети',
  searchContactDescription: 'Контактная информация',
  footerLinksTitle: 'Полезные ссылки', footerPhone: 'Телефон:', footerPrivacy: 'Политика конфиденциальности',
  footerApps: 'Приложения и официальные страницы', footerArticles: 'Исламские просветительские статьи',
  footerMedia: 'Исламские медиа', footerChannels: 'Приложения и каналы',
  copyright: 'Авторские права', allRightsReserved: 'Все права защищены',
  signInTitle: 'Войти на сайт Islamic Official', continueGoogle: 'Продолжить с Google',
  continueApple: 'Продолжить с Apple', continueAnonymous: 'Продолжить как гость',
  emailPlaceholder: 'Электронная почта', passwordPlaceholder: 'Пароль',
  emailSignIn: 'Войти по электронной почте', phoneNumber: 'Номер телефона (+996...)',
  smsCode: 'Код из SMS', verifyButton: 'Подтвердить', closeDialog: 'Закрыть'
});
translations.uz.footerTagline = 'Islamic Official | Media & IT Portal';
translations.en.footerTagline = 'Islamic Official | Media & IT Portal';
translations.ru.footerTagline = 'Islamic Official | Медиа и IT портал';
Object.assign(translations.uz, {
  currencyRates: 'Valyuta kurslari',
  searchCurrencyDescription: 'Rasmiy kurslar, valyuta qidiruvi va konvertor',
  quranTitle: 'Qur’oni Karim o‘quvchisi',
  searchQuranDescription: '114 sura va 30 juzni ko‘zga qulay uslublarda o‘qing',
  financeTitle: 'Zakot va islomiy moliya',
  searchFinanceDescription: 'O‘zingiz kiritgan nisob va mol-mulk qiymati bilan taxminiy zakot hisobi',
  inheritanceTitle: 'Meros ulushi hisoblagichi',
  searchInheritanceDescription: 'Asosiy qarindoshlar uchun soddalashtirilgan meros taqsimoti',
  navDailyTools: 'Kundalik vositalar',
  dailyToolsTitle: 'Kundalik islomiy vositalar',
  searchDailyToolsDescription: 'Namoz vaqti, qibla, tasbeh, zakot hisoblagichi va hijriy sana',
  navIbodat: 'Ibodat rejasi',
  ibadatTitle: 'Shaxsiy ibodat va qazo rejasi',
  searchIbadatDescription: 'Kunlik ibodat ro‘yxati, qazo namoz va ro‘za rejasi'
});
Object.assign(translations.en, {
  currencyRates: 'Currency rates',
  searchCurrencyDescription: 'Official exchange rates, currency search, and converter',
  quranTitle: 'Complete Qur’an reader',
  searchQuranDescription: 'Read all 114 surahs and 30 juz in comfortable styles',
  financeTitle: 'Zakat and Islamic finance',
  searchFinanceDescription: 'Estimate zakat using the nisab and asset values you enter',
  inheritanceTitle: 'Islamic inheritance shares',
  searchInheritanceDescription: 'A simplified inheritance estimate for immediate relatives',
  navDailyTools: 'Daily tools',
  dailyToolsTitle: 'Daily Islamic tools',
  searchDailyToolsDescription: 'Prayer times, Qibla direction, tasbih, Zakat calculator, and Hijri date',
  navIbodat: 'Worship planner',
  ibadatTitle: 'Personal worship and make-up plan',
  searchIbadatDescription: 'Daily worship checklist and personal make-up prayer and fasting plan'
});
Object.assign(translations.ru, {
  currencyRates: 'Курсы валют',
  searchCurrencyDescription: 'Официальные курсы валют, поиск и конвертер',
  quranTitle: 'Полное чтение Корана',
  searchQuranDescription: 'Читайте все 114 сур и 30 джуз в удобном режиме',
  financeTitle: 'Закят и исламские финансы',
  searchFinanceDescription: 'Примерный расчёт закята по введённым вами нисабу и имуществу',
  inheritanceTitle: 'Доли исламского наследства',
  searchInheritanceDescription: 'Упрощённый пример распределения для ближайших родственников',
  navDailyTools: 'Полезные инструменты',
  dailyToolsTitle: 'Исламские инструменты на каждый день',
  searchDailyToolsDescription: 'Время намаза, кибла, тасбих, калькулятор закята и дата хиджры',
  navIbodat: 'План поклонения',
  ibadatTitle: 'Личный план поклонения и восполнения',
  searchIbadatDescription: 'Ежедневный список поклонения, план молитв и поста для восполнения'
});
Object.assign(translations.ar, {
  quranTitle: 'قارئ القرآن الكريم كاملاً',
  searchQuranDescription: 'اقرأ السور الـ114 والأجزاء الـ30 بأوضاع مريحة',
  financeTitle: 'الزكاة والتمويل الإسلامي',
  searchFinanceDescription: 'تقدير الزكاة باستخدام النصاب والأصول التي تدخلها',
  inheritanceTitle: 'حصص الميراث الإسلامي',
  searchInheritanceDescription: 'تقدير مبسط للورثة من الأقارب المباشرين',
  navDailyTools: 'أدوات يومية',
  dailyToolsTitle: 'أدوات إسلامية يومية',
  searchDailyToolsDescription: 'أوقات الصلاة والقبلة والتسبيح وحساب الزكاة والتاريخ الهجري',
  navIbodat: 'مخطط العبادة',
  ibadatTitle: 'خطة شخصية للعبادة والقضاء',
  searchIbadatDescription: 'قائمة العبادة اليومية وخطة شخصية لقضاء الصلاة والصيام'
});
let currentLanguage = ['uz', 'en', 'ru', 'ar'].includes(localStorage.getItem('site-language'))
  ? localStorage.getItem('site-language')
  : 'uz';

function getUiText(key) {
  return translations[currentLanguage]?.[key] || translations.uz[key] || '';
}

const contentTranslationLocales = [
  { id: 'en', label: 'English' },
  { id: 'ru', label: 'Русский' },
  { id: 'ar', label: 'العربية' }
];

function getLocalizedField(record, field, language = currentLanguage) {
  const translated = record?.translations?.[language]?.[field];
  return typeof translated === 'string' && translated.trim()
    ? translated
    : record?.[field] || '';
}

function readAdminTranslations(editorId, fields) {
  return Object.fromEntries(contentTranslationLocales.map(({ id }) => {
    const values = Object.fromEntries(fields.map((field) => {
      const input = document.getElementById(`${editorId}-${id}-${field}`);
      return [field, input?.value.trim() || ''];
    }).filter(([, value]) => value));
    return [id, values];
  }).filter(([, values]) => Object.keys(values).length));
}

function fillAdminTranslations(editorId, fields, translations = {}) {
  contentTranslationLocales.forEach(({ id }) => {
    fields.forEach((field) => {
      const input = document.getElementById(`${editorId}-${id}-${field}`);
      if (input) input.value = translations[id]?.[field] || '';
    });
  });
}

function initializeAdminTranslationEditor(editorId, contentType, sourceFields, translatedFields) {
  const root = document.getElementById(`${editorId}-translations-editor`);
  if (!root || root.dataset.ready === 'true') return;
  root.dataset.ready = 'true';
  const localizedPanels = contentTranslationLocales.map(({ id, label }) => `
    <details class="admin-translation-locale">
      <summary lang="${id}">${label}</summary>
      <div class="admin-translation-fields">
        ${translatedFields.map(({ key, label: fieldLabel, multiline }) => `
          <label class="admin-translation-field">
            <span>${fieldLabel}</span>
            ${multiline
              ? `<textarea id="${editorId}-${id}-${key}" class="form-control" lang="${id}" dir="auto" rows="${key === 'content' || key === 'translation' ? 6 : 3}" maxlength="12000"></textarea>`
              : `<input id="${editorId}-${id}-${key}" class="form-control" lang="${id}" dir="auto" type="text" maxlength="12000">`}
          </label>`).join('')}
      </div>
    </details>`).join('');
  root.innerHTML = `
    <div class="admin-translation-editor">
      <div class="admin-translation-heading">
        <div><strong><i class="bi bi-translate me-1" aria-hidden="true"></i>AI yordamida tarjima</strong>
        <p>O‘zbekcha matnni ingliz, rus va arab tillariga tarjima qiling. Natijani tekshirib, kerak bo‘lsa tahrirlang.</p></div>
        <button class="btn btn-outline-success" type="button" data-translate-content="${editorId}">
          <i class="bi bi-stars me-1" aria-hidden="true"></i>Uch tilga tarjima qilish
        </button>
      </div>
      <small class="admin-translation-status" id="${editorId}-translation-status" role="status" aria-live="polite"></small>
      <details class="admin-translation-review">
        <summary>Tarjimalarni ko‘rish va tahrirlash</summary>
        <div class="admin-translation-locales">${localizedPanels}</div>
      </details>
      <p class="admin-translation-disclaimer">AI tarjimasida xato bo‘lishi mumkin. Diniy matnlarni nashr qilishdan oldin tekshiring. Asl o‘zbekcha matn o‘zgarmaydi.</p>
    </div>`;
  root.querySelector(`[data-translate-content="${editorId}"]`)?.addEventListener('click', async (event) => {
    const button = event.currentTarget;
    const status = document.getElementById(`${editorId}-translation-status`);
    const source = Object.fromEntries(Object.entries(sourceFields)
      .map(([key, fieldId]) => [key, document.getElementById(fieldId)?.value.trim() || ''])
      .filter(([, value]) => value));
    if (!Object.keys(source).length) {
      status.textContent = 'Avval tarjima qilinadigan asosiy matnni kiriting.';
      return;
    }
    button.disabled = true;
    status.textContent = 'AI matnni ingliz, rus va arab tillariga tarjima qilmoqda…';
    try {
      const { translateAdminContent } = await import("./admin-ai.js?v=2026101114");
      const translations = await translateAdminContent(source, contentType);
      fillAdminTranslations(editorId, translatedFields.map(({ key }) => key), translations);
      root.querySelector('.admin-translation-review').open = true;
      status.textContent = 'Tarjimalar tayyor. Har bir tilni tekshiring; ular maqola bilan birga faqat nashr qilganda saqlanadi.';
    } catch (error) {
      console.error(`AI ${contentType} translation failed:`, error);
      status.textContent = `Tarjima bajarilmadi: ${error.message}`;
    } finally {
      button.disabled = false;
    }
  });
}

function applyLanguage(language) {
  const text = translations[language] || translations.uz;
  const selectors = {
    home: '#navmenu a[href="#hero"]', articles: '#navmenu a[href="#about"]',
    about: '#navmenu a[href="#about"]:nth-of-type(2)', services: '#navmenu a[href="#services"]',
    contact: '#navmenu a[href="#contact"]', start: '.btn-getstarted',
    title: '#about .section-title h2', subtitle: '#about .section-title p',
    read: '#about .readmore span'
  };
  Object.entries(selectors).forEach(([key, selector]) => {
    document.querySelectorAll(selector).forEach((element) => { element.textContent = text[key]; });
  });
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const translated = text[element.dataset.i18n] || translations.uz[element.dataset.i18n];
    if (translated) element.textContent = translated;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const translated = text[element.dataset.i18nPlaceholder] || translations.uz[element.dataset.i18nPlaceholder];
    if (translated) element.setAttribute('placeholder', translated);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const translated = text[element.dataset.i18nAriaLabel] || translations.uz[element.dataset.i18nAriaLabel];
    if (translated) element.setAttribute('aria-label', translated);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((element) => {
    const translated = text[element.dataset.i18nTitle] || translations.uz[element.dataset.i18nTitle];
    if (translated) element.setAttribute('title', translated);
  });
  document.querySelectorAll('[data-i18n-alt]').forEach((element) => {
    const translated = text[element.dataset.i18nAlt] || translations.uz[element.dataset.i18nAlt];
    if (translated) element.setAttribute('alt', translated);
  });
  currentLanguage = language;
  document.documentElement.lang = language;
  localStorage.setItem('site-language', language);
  const themeButton = document.getElementById('theme-toggle');
  if (themeButton) {
    const themeLabel = getUiText(document.body.classList.contains('dark-theme') ? 'lightMode' : 'darkMode');
    themeButton.setAttribute('aria-label', themeLabel);
    themeButton.title = themeLabel;
  }
  refreshWorshipLanguage();
  refreshPrayerTimesLanguage();
  document.dispatchEvent(new Event('site-language-change'));
}

function refreshWorshipLanguage() {
  const names = {
    Bomdod: 'prayerFajr', Peshin: 'prayerDhuhr', Asr: 'prayerAsr',
    Shom: 'prayerMaghrib', Xufton: 'prayerIsha', "Qur'on": 'prayerQuran'
  };
  document.querySelectorAll('.worship-action').forEach((button) => {
    const done = button.classList.contains('is-done');
    const name = names[button.dataset.worship] || button.dataset.worship;
    const label = button.querySelector('span');
    const status = button.querySelector('small');
    if (label) label.textContent = getUiText(name);
    if (status) status.textContent = getUiText(done ? 'prayerDone' : 'prayerMarkDone');
  });
  const summary = document.querySelector('#worship-stats .stats-summary');
  if (summary) {
    const count = summary.querySelector('strong')?.textContent || '0';
    const labels = summary.querySelectorAll('small');
    if (labels[0]) labels[0].textContent = getUiText('prayerToday');
    if (labels[1]) labels[1].textContent = `${count}/6 ${getUiText('prayerActionsComplete')}`;
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal && window.bootstrap) bootstrap.Modal.getOrCreateInstance(modal).hide();
}

function startPublicArticleListener() {
  const list = document.getElementById('public-articles-list');
  if (!list) return;
  if (publicArticlesUnsubscribe) return;
  publicArticlesUnsubscribe = onSnapshot(articlesRef, (snapshot) => {
    publicArticlesSnapshot = snapshot;
    renderPublicArticles(snapshot);
  }, (error) => {
    console.error('Public Firestore read error:', error);
    list.innerHTML = `<div class="col-12"><div class="alert alert-danger"><span data-i18n="articleLoadError">${getUiText('articleLoadError')}</span> ${escapeHtml(error.message)}</div></div>`;
  });
  document.addEventListener('site-language-change', () => {
    if (publicArticlesSnapshot) renderPublicArticles(publicArticlesSnapshot);
  });
}

function authMessage(message, isError = false) {
  const element = document.getElementById('auth-status');
  if (element) {
    element.textContent = message;
    element.className = `small mt-2 ${isError ? 'text-danger' : 'text-success'}`;
  } else {
    alert(message);
  }
}

async function signIn(action) {
  if (loginInProgress) return;
  loginInProgress = true;
  const buttons = ['google-login-btn', 'apple-login-btn', 'anonymous-login-btn']
    .map((id) => document.getElementById(id))
    .filter(Boolean);
  buttons.forEach((button) => { button.disabled = true; });
  try {
    await action();
    closeAuthModal();
  } catch (error) {
    console.error('Firebase authentication error:', error);
    const message = error.code === 'auth/cancelled-popup-request'
      ? 'Kirish oynasi qayta ishga tushdi. Iltimos, biroz kutib yana bir marta urinib ko‘ring.'
      : error.code === 'auth/popup-blocked'
        ? 'Brauzer kirish oynasini blokladi. Popup oynalariga ruxsat bering.'
        : error.message;
    authMessage(message, true);
  } finally {
    loginInProgress = false;
    buttons.forEach((button) => { button.disabled = false; });
  }
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

function safeExternalUrl(value) {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
}

function normalizePublicArticleSearch(value) {
  return String(value || '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’ʻʼ`]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getSavedArticleIds() {
  try {
    const value = JSON.parse(localStorage.getItem(SAVED_ARTICLES_KEY) || '[]');
    return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [];
  } catch (error) {
    console.warn('Saved articles could not be read:', error);
    return [];
  }
}

function updateSavedArticleCount() {
  const count = document.getElementById('saved-article-count');
  if (count) count.textContent = String(getSavedArticleIds().length);
}

function setArticleSaveButton(button, saved) {
  const key = saved ? 'removeSavedArticle' : 'saveArticle';
  const label = getUiText(key);
  button.setAttribute('aria-label', label);
  button.setAttribute('title', label);
  button.setAttribute('aria-pressed', String(saved));
  button.innerHTML = `<i class="bi ${saved ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus'}" aria-hidden="true"></i><span class="visually-hidden">${label}</span>`;
}

function applyPublicArticleFilters() {
  const query = normalizePublicArticleSearch(publicArticleQuery);
  const savedIds = new Set(getSavedArticleIds());
  let visibleCount = 0;
  document.querySelectorAll('#public-articles-list > [data-article-group]').forEach((card) => {
    const matchesGroup = publicArticleFilter === 'all'
      || (publicArticleFilter === 'saved'
        ? savedIds.has(card.dataset.articleId)
        : card.dataset.articleGroup === publicArticleFilter);
    const matchesQuery = !query || card.dataset.articleSearch.includes(query);
    const visible = matchesGroup && matchesQuery;
    card.classList.toggle('d-none', !visible);
    if (visible) visibleCount += 1;
  });

  const status = document.getElementById('public-article-search-status');
  if (status) {
    status.textContent = query
      ? visibleCount
        ? getUiText('articleSearchCount').replace('{count}', String(visibleCount))
        : getUiText('articleSearchEmpty')
      : publicArticleFilter === 'saved'
        ? visibleCount
          ? getUiText('savedArticleCount').replace('{count}', String(visibleCount))
          : getUiText('noSavedArticles')
        : '';
  }
  updateSavedArticleCount();
}

function initializePublicArticleControls() {
  document.querySelectorAll('[data-article-filter]').forEach((button) => {
    if (button.dataset.filterBound === 'true') return;
    button.dataset.filterBound = 'true';
    button.addEventListener('click', () => {
      publicArticleFilter = button.dataset.articleFilter;
      document.querySelectorAll('[data-article-filter]').forEach((item) => {
        item.classList.toggle('active', item === button);
      });
      applyPublicArticleFilters();
    });
  });

  const searchInput = document.getElementById('public-article-search');
  if (searchInput && searchInput.dataset.searchBound !== 'true') {
    searchInput.dataset.searchBound = 'true';
    publicArticleQuery = searchInput.value;
    searchInput.addEventListener('input', () => {
      publicArticleQuery = searchInput.value;
      applyPublicArticleFilters();
    });
  }
}

function renderPublicArticles(snapshot) {
  const list = document.getElementById('public-articles-list');
  if (!list) return;
  list.innerHTML = '';
  publicArticleLikesUnsubs.forEach((unsubscribe) => unsubscribe());
  publicArticleLikesUnsubs = [];
  if (snapshot.empty) {
    list.innerHTML = `<div class="col-12"><div class="alert alert-light text-center" data-i18n="articleEmpty">${getUiText('articleEmpty')}</div></div>`;
    return;
  }
  const documents = [...snapshot.docs].sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
  documents.forEach((articleSnapshot) => {
    const article = articleSnapshot.data();
    const titleText = getLocalizedField(article, 'title') || getUiText('articleUntitled');
    const summaryText = getLocalizedField(article, 'summary') || getLocalizedField(article, 'content');
    const image = article.imageUrl || article.image || 'assets/img/blog/blog-post-1.webp';
    const sourceUrl = safeExternalUrl(article.sourceUrl);
    const group = article.imageOnly ? 'image' : sourceUrl ? 'link' : 'text';
    const articleCategory = article.category
      ? escapeHtml(article.category)
      : `<span data-i18n="articleLabel">${getUiText('articleLabel')}</span>`;
    const articleSummary = summaryText;
    const summaryMarkup = articleSummary
      ? escapeHtml(articleSummary)
      : article.imageOnly
        ? `<span data-i18n="articleImageOnly">${getUiText('articleImageOnly')}</span>`
        : '';
    const card = document.createElement('div');
    card.className = 'col-xl-4 col-md-6 d-flex';
    card.dataset.articleGroup = group;
    card.dataset.articleId = articleSnapshot.id;
    card.dataset.articleSearch = normalizePublicArticleSearch(
      `${titleText} ${summaryText} ${article.category || ''} ${article.author || ''} ${sourceUrl}`
    );
    card.innerHTML = `
      <article class="post-item position-relative h-100 shadow-sm w-100 overflow-hidden">
        <div class="post-img position-relative overflow-hidden">
          <img src="${escapeHtml(image)}" class="img-fluid w-100" alt="${escapeHtml(titleText)}" loading="lazy">
          <span class="post-date">${articleCategory}</span>
        </div>
        <div class="post-content d-flex flex-column">
          <h3 class="post-title" dir="auto">${escapeHtml(titleText)}</h3>
          <div class="meta d-flex align-items-center">
            <i class="bi bi-person"></i><span class="ps-2">${escapeHtml(article.author || 'Admin')}</span>
              <span class="ms-auto"><i class="bi bi-eye"></i> <span class="article-card-views">${Number(article.views || 0).toLocaleString()}</span></span>
          </div>
          <hr>
          <p class="mb-3" dir="auto">${summaryMarkup}</p>
          <div class="d-flex justify-content-between align-items-center gap-2 mt-auto">
            ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="small text-secondary"><i class="bi bi-link-45deg"></i> <span data-i18n="articleOpenSource">${getUiText('articleOpenSource')}</span></a>` : '<span></span>'}
            <div class="d-flex align-items-center gap-2">
              <button type="button" class="btn btn-sm btn-outline-success article-card-save" data-article-id="${escapeHtml(articleSnapshot.id)}"></button>
              <button type="button" class="btn btn-sm btn-outline-danger article-card-like" data-article-id="${escapeHtml(articleSnapshot.id)}"><i class="bi bi-heart"></i> <span>${Number(article.likes || 0)}</span></button>
            </div>
          </div>
          <a href="article-details.html?id=${encodeURIComponent(articleSnapshot.id)}" class="readmore mt-auto" data-i18n-aria-label="articleReadMoreAria" aria-label="${getUiText('articleReadMoreAria')}">
            <span data-i18n="articleReadMore">${getUiText('articleReadMore')}</span><i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </article>`;
    list.appendChild(card);
    const viewKey = `viewed-${articleSnapshot.id}`;
    if (!localStorage.getItem(viewKey)) {
      const viewCount = card.querySelector('.article-card-views');
      localStorage.setItem(viewKey, 'true');
      updateDoc(doc(db, 'articles', articleSnapshot.id), { views: increment(1) })
        .then(() => {
          if (viewCount) viewCount.textContent = String(Number(viewCount.textContent || 0) + 1);
        })
        .catch((error) => console.warn('Article view counter unavailable:', error.message));
    }
  });
  document.querySelectorAll('#public-articles-list .readmore').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      window.location.assign(link.href);
    });
  });
  document.querySelectorAll('.article-card-like').forEach((button) => {
    const articleId = button.dataset.articleId;
    const count = button.querySelector('span');
    const likesRef = collection(db, 'articles', articleId, 'likes');
    if (localStorage.getItem(`liked-${articleId}`)) {
      button.classList.add('active');
    }
    publicArticleLikesUnsubs.push(onSnapshot(likesRef, (likes) => { count.textContent = String(likes.size); }, (error) => {
      console.warn('Article likes unavailable:', error.message);
    }));
    button.onclick = async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (button.disabled) return;
      button.disabled = true;
      try {
        await setDoc(doc(likesRef, visitorId), { createdAt: serverTimestamp() });
        localStorage.setItem(`liked-${articleId}`, 'true');
        button.classList.add('active');
      } catch (error) {
        console.error('Article like error:', error);
      } finally {
        button.disabled = false;
      }
    };
  });
  document.querySelectorAll('.article-card-save').forEach((button) => {
    const articleId = button.dataset.articleId;
    setArticleSaveButton(button, getSavedArticleIds().includes(articleId));
    button.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const savedIds = getSavedArticleIds();
      const isSaved = savedIds.includes(articleId);
      const nextSavedIds = isSaved
        ? savedIds.filter((id) => id !== articleId)
        : [...savedIds, articleId];
      try {
        localStorage.setItem(SAVED_ARTICLES_KEY, JSON.stringify(nextSavedIds));
        setArticleSaveButton(button, !isSaved);
        applyPublicArticleFilters();
      } catch (error) {
        console.error('Article save error:', error);
        const status = document.getElementById('public-article-search-status');
        if (status) status.textContent = getUiText('saveArticleError');
      }
    };
  });
  applyPublicArticleFilters();
}

function renderAdminArticles(snapshot) {
  const list = document.getElementById('admin-articles-list');
  if (!list) return;
  list.innerHTML = '';
  const search = document.getElementById('admin-article-search')?.value.trim().toLocaleLowerCase() || '';
  const visibleArticles = snapshot.docs.filter((item) => {
    const article = item.data();
    return `${article.title || ''} ${article.summary || ''}`.toLocaleLowerCase().includes(search);
  });
  const count = document.getElementById('admin-article-count');
  if (count) count.textContent = String(snapshot.size);
  if (!visibleArticles.length) {
    list.innerHTML = `<p class="admin-empty-state">${search ? 'Qidiruv bo‘yicha maqola topilmadi.' : 'Hozircha maqolalar yo‘q.'}</p>`;
    return;
  }
  visibleArticles.forEach((articleSnapshot) => {
    const article = articleSnapshot.data();
    const row = document.createElement('div');
    row.className = 'admin-record';
    const details = document.createElement('div');
    details.className = 'admin-record-details';
    const title = document.createElement('strong');
    title.textContent = article.title || 'Nomsiz maqola';
    const summary = document.createElement('p');
    summary.textContent = article.summary || article.content || 'Qisqacha mazmun yo‘q.';
    details.append(title, summary);
    const edit = document.createElement('button');
    edit.className = 'btn btn-sm btn-outline-success';
    edit.textContent = 'Tahrirlash';
    edit.addEventListener('click', () => editArticle(articleSnapshot.id, article));
    const remove = document.createElement('button');
    remove.className = 'btn btn-sm btn-outline-danger';
    remove.textContent = 'O‘chirish';
    remove.addEventListener('click', () => deleteArticle(articleSnapshot.id));
    const actions = document.createElement('div');
    actions.className = 'admin-record-actions';
    actions.append(edit, remove);
    row.append(details, actions);
    list.appendChild(row);
  });
}

function startArticleListener() {
  const list = document.getElementById('admin-articles-list');
  if (!list) return;
  if (adminArticlesUnsubscribe) return;
  adminArticlesUnsubscribe = onSnapshot(articlesRef, renderAdminArticles, (error) => {
    console.error('Firestore read error:', error);
    list.textContent = 'Maqolalarni yuklashda xatolik: ' + error.message;
  });
}

function renderAdminCollection(snapshot, listId, collectionName, titleField, counterId) {
  const list = document.getElementById(listId);
  if (!list) return;
  list.replaceChildren();
  const counter = counterId ? document.getElementById(counterId) : null;
  if (counter) counter.textContent = String(snapshot.size);
  if (snapshot.empty) {
    list.innerHTML = '<p class="admin-empty-state">Hozircha hech narsa qo‘shilmagan.</p>';
    return;
  }
  snapshot.docs.forEach((item) => {
    const data = item.data();
    const row = document.createElement('div');
    row.className = 'admin-record';
    const details = document.createElement('div');
    details.className = 'admin-record-details';
    const title = document.createElement('strong');
    title.textContent = data[titleField] || 'Nomsiz';
    const meta = document.createElement('p');
    meta.textContent = collectionName;
    details.append(title, meta);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-sm btn-outline-danger';
    remove.textContent = 'O‘chirish';
    remove.addEventListener('click', async () => {
      if (!confirm(`“${data[titleField] || 'Nomsiz'}” yozuvini o‘chirasizmi?`)) return;
      try {
        await deleteDoc(doc(db, collectionName, item.id));
      } catch (error) {
        console.error(`${collectionName} delete error:`, error);
        authMessage('O‘chirishda xatolik: ' + error.message, true);
      }
    });
    row.append(details, remove);
    list.append(row);
  });
}

function startAdminContentListeners() {
  if (!adminDuasUnsubscribe) {
    adminDuasUnsubscribe = onSnapshot(collection(db, 'duas'),
      (snapshot) => renderAdminCollection(snapshot, 'admin-duas-list', 'duas', 'title'),
      (error) => {
        console.error('Admin dua list error:', error);
        document.getElementById('admin-duas-list').textContent = 'Duolarni yuklashda xatolik: ' + error.message;
      });
  }
  if (!adminHadithsUnsubscribe) {
    adminHadithsUnsubscribe = onSnapshot(collection(db, 'hadiths'),
      (snapshot) => renderAdminCollection(snapshot, 'admin-hadiths-list', 'hadiths', 'title'),
      (error) => {
        console.error('Admin hadith list error:', error);
        document.getElementById('admin-hadiths-list').textContent = 'Hadislarni yuklashda xatolik: ' + error.message;
      });
  }
  if (!adminBooksUnsubscribe) {
    adminBooksUnsubscribe = onSnapshot(collection(db, 'books'), (snapshot) => {
      const list = document.getElementById('admin-books-list');
      if (!list) return;
      list.replaceChildren();
      if (snapshot.empty) {
        list.innerHTML = '<p class="admin-empty-state">Hozircha kitob yuklanmagan.</p>';
        return;
      }
      snapshot.docs.forEach((item) => {
        const book = item.data();
        const row = document.createElement('div');
        row.className = 'admin-record';
        const title = document.createElement('strong');
        title.textContent = book.title || 'Nomsiz kitob';
        const link = document.createElement('a');
        link.className = 'btn btn-sm btn-outline-success';
        link.href = safeExternalUrl(book.url) || '#';
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Kitobni ochish';
        row.append(title, link);
        list.append(row);
      });
    }, (error) => {
      console.error('Admin books list error:', error);
      document.getElementById('admin-books-list').textContent = 'Kitoblarni yuklashda xatolik: ' + error.message;
    });
  }
}

function parseYoutubeMediaUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:' || !['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'].includes(url.hostname)) return null;

  const playlistId = url.searchParams.get('list');
  if (playlistId && /^[A-Za-z0-9_-]{10,64}$/.test(playlistId)) {
    return { kind: 'playlist', mediaId: playlistId };
  }

  const videoId = url.hostname === 'youtu.be'
    ? url.pathname.split('/').filter(Boolean)[0]
    : url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1];
  return videoId && /^[A-Za-z0-9_-]{11}$/.test(videoId)
    ? { kind: 'video', mediaId: videoId }
    : null;
}

function renderAdminMediaVideos(snapshot) {
  const list = document.getElementById('admin-media-videos-list');
  if (!list) return;
  list.replaceChildren();
  const count = document.getElementById('admin-video-count');
  if (count) count.textContent = String(snapshot.size);
  if (snapshot.empty) {
    list.innerHTML = '<p class="admin-empty-state">Media sahifasida hozircha video yo‘q.</p>';
    return;
  }
  snapshot.forEach((videoSnapshot) => {
    const video = videoSnapshot.data();
    const row = document.createElement('div');
    row.className = 'border rounded p-2 mb-2 d-flex justify-content-between align-items-center gap-2';
    const details = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = video.title;
    const link = document.createElement('a');
    link.className = 'd-block small';
    link.href = video.kind === 'playlist'
      ? `https://www.youtube.com/playlist?list=${encodeURIComponent(video.mediaId)}`
      : `https://www.youtube.com/watch?v=${encodeURIComponent(video.mediaId)}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = video.kind === 'playlist' ? 'YouTube playlist' : 'YouTube video';
    details.append(title, link);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'btn btn-sm btn-danger';
    remove.textContent = 'O‘chirish';
    remove.addEventListener('click', async () => {
      if (!confirm(`“${video.title}” videoni o‘chirasizmi?`)) return;
      try {
        await deleteDoc(doc(db, 'mediaVideos', videoSnapshot.id));
      } catch (error) {
        console.error('Media video delete error:', error);
        authMessage('Videoni o‘chirishda xatolik: ' + error.message, true);
      }
    });
    row.append(details, remove);
    list.appendChild(row);
  });
}

function startAdminMediaVideosListener() {
  const list = document.getElementById('admin-media-videos-list');
  if (!list || adminMediaVideosUnsubscribe) return;
  adminMediaVideosUnsubscribe = onSnapshot(collection(db, 'mediaVideos'), renderAdminMediaVideos, (error) => {
    console.error('Media video list error:', error);
    list.textContent = 'Videolarni yuklashda xatolik: ' + error.message;
  });
}

async function addMediaVideo(event) {
  event.preventDefault();
  const titleInput = document.getElementById('media-video-title');
  const urlInput = document.getElementById('media-video-url');
  const status = document.getElementById('media-video-status');
  const title = titleInput?.value.trim();
  const youtubeMedia = urlInput ? parseYoutubeMediaUrl(urlInput.value.trim()) : null;
  if (!title || title.length > 120 || !youtubeMedia) {
    if (status) status.textContent = '1–120 belgidan iborat nom va yaroqli YouTube video/playlist havolasini kiriting.';
    return;
  }
  const button = event.submitter;
  if (button) button.disabled = true;
  try {
    await addDoc(collection(db, 'mediaVideos'), {
      title,
      ...youtubeMedia,
      createdAt: serverTimestamp()
    });
    event.target.reset();
    if (status) status.textContent = 'Video Media sahifasiga qo‘shildi.';
  } catch (error) {
    console.error('Media video create error:', error);
    if (status) status.textContent = 'Video qo‘shishda xatolik: ' + error.message;
  } finally {
    if (button) button.disabled = false;
  }
}

async function deleteArticle(id) {
  if (!confirm("Ushbu maqolani o'chirishni tasdiqlaysizmi?")) return;
  try {
    await deleteDoc(doc(db, 'articles', id));
  } catch (error) {
    console.error('Firestore delete error:', error);
    authMessage(error.message, true);
  }
}

function editArticle(id, article) {
  const modalElement = document.getElementById('article-edit-modal');
  const title = document.getElementById('article-edit-title');
  const content = document.getElementById('article-edit-content');
  const status = document.getElementById('article-edit-status');
  if (!modalElement || !title || !content || !window.bootstrap?.Modal) {
    authMessage('Maqola tahrirlash oynasini ochib bo‘lmadi.', true);
    return;
  }
  editingArticleId = id;
  editingArticleSummary = article.summary || '';
  title.value = article.title || '';
  content.value = article.content || '';
  document.getElementById('article-edit-summary').value = article.summary || '';
  document.getElementById('article-edit-category').value = article.category || '';
  initializeAdminTranslationEditor('article-edit', 'article', {
    title: 'article-edit-title',
    summary: 'article-edit-summary',
    content: 'article-edit-content'
  }, [
    { key: 'title', label: 'Sarlavha', multiline: false },
    { key: 'summary', label: 'Qisqacha mazmun', multiline: true },
    { key: 'content', label: 'Maqola matni', multiline: true }
  ]);
  fillAdminTranslations('article-edit', ['title', 'summary', 'content'], article.translations || {});
  status.textContent = '';
  const saveButton = document.getElementById('article-edit-save');
  saveButton.disabled = false;
  window.bootstrap.Modal.getOrCreateInstance(modalElement).show();
}

async function saveArticleEdit(event) {
  event.preventDefault();
  const title = document.getElementById('article-edit-title').value.trim();
  const content = document.getElementById('article-edit-content').value.trim();
  const summary = document.getElementById('article-edit-summary').value.trim();
  const category = document.getElementById('article-edit-category').value.trim();
  const status = document.getElementById('article-edit-status');
  const saveButton = document.getElementById('article-edit-save');
  if (!editingArticleId || !title || !content) {
    status.textContent = 'Sarlavha va maqola matnini kiriting.';
    return;
  }
  saveButton.disabled = true;
  status.textContent = 'Saqlanmoqda…';
  try {
    await updateDoc(doc(db, 'articles', editingArticleId), {
      title,
      content,
      summary: summary || (editingArticleSummary || content).trim(),
      category,
      translations: readAdminTranslations('article-edit', ['title', 'summary', 'content']),
      updatedAt: serverTimestamp()
    });
    const modalElement = document.getElementById('article-edit-modal');
    window.bootstrap.Modal.getOrCreateInstance(modalElement).hide();
    status.textContent = 'Maqola yangilandi.';
  } catch (error) {
    console.error('Firestore update error:', error);
    status.textContent = 'Maqolani saqlashda xatolik: ' + error.message;
    authMessage(error.message, true);
  } finally {
    saveButton.disabled = false;
  }
}

function showAdminPanel(isAdmin) {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.toggle('d-none', !isAdmin);
  if (isAdmin) {
    startArticleListener();
    startAdminMediaVideosListener();
    startAdminContentListeners();
  } else {
    adminArticlesUnsubscribe?.();
    adminArticlesUnsubscribe = null;
    adminMediaVideosUnsubscribe?.();
    adminMediaVideosUnsubscribe = null;
    adminDuasUnsubscribe?.();
    adminDuasUnsubscribe = null;
    adminHadithsUnsubscribe?.();
    adminHadithsUnsubscribe = null;
    adminBooksUnsubscribe?.();
    adminBooksUnsubscribe = null;
  }
}

const prayerNames = {
  Fajr: 'prayerFajr', Dhuhr: 'prayerDhuhr', Asr: 'prayerAsr',
  Maghrib: 'prayerMaghrib', Isha: 'prayerIsha'
};

function getPrayerName(key) {
  return getUiText(prayerNames[key]) || key;
}

function refreshPrayerTimesLanguage() {
  document.querySelectorAll('[data-prayer-name]').forEach((element) => {
    element.textContent = getPrayerName(element.dataset.prayerName);
  });
  if (currentPrayerTimingContext) {
    updatePrayerCountdown(
      currentPrayerTimingContext.timings,
      currentPrayerTimingContext.timezone,
      currentPrayerTimingContext.date
    );
  }
  const methodSelect = document.getElementById('prayer-calculation-method');
  const appliedMethod = document.getElementById('prayer-applied-method');
  if (appliedMethod && methodSelect) {
    appliedMethod.textContent = methodSelect.selectedOptions[0]?.textContent || '—';
  }
}

function getSavedPrayerLocation() {
  try {
    const location = JSON.parse(localStorage.getItem('prayer-location') || 'null');
    if (!location) return null;
    if (location.type === 'coordinates'
      && Number.isFinite(location.latitude) && location.latitude >= -90 && location.latitude <= 90
      && Number.isFinite(location.longitude) && location.longitude >= -180 && location.longitude <= 180) {
      return location;
    }
    if (location.type === 'address' && typeof location.address === 'string' && location.address.trim()) {
      return location;
    }
    console.warn('Saved prayer location has an invalid format.');
    return null;
  }
  catch (error) {
    console.warn('Saved prayer location is invalid:', error);
    return null;
  }
}

function prayerPreferences() {
  return {
    method: document.getElementById('prayer-calculation-method')?.value || '3',
    school: document.getElementById('prayer-asr-school')?.value || localStorage.getItem('prayer-school') || '1'
  };
}

function setPrayerStatus(message, isError = false) {
  const status = document.getElementById('prayer-status');
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('text-danger', isError);
}

function setPrayerLocation(location) {
  try {
    localStorage.setItem('prayer-location', JSON.stringify(location));
  } catch (error) {
    console.warn('Prayer location preference could not be saved:', error);
  }
  loadPrayerTimes(location);
}

function dateInTimeZone(timeZone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.day}-${values.month}-${values.year}`;
}

async function geocodePrayerAddress(query) {
  const delay = Math.max(0, 1100 - (Date.now() - prayerGeocodeLastRequest));
  if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
  prayerGeocodeLastRequest = Date.now();

  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    addressdetails: '1',
    limit: '1'
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: 'application/json' },
      referrerPolicy: 'strict-origin-when-cross-origin',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Geocoding API HTTP ${response.status}.`);
    const results = await response.json();
    const candidates = Array.isArray(results) ? results : [];
    const place = candidates.find((candidate) => {
      const latitude = Number(candidate.lat);
      const longitude = Number(candidate.lon);
      return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
        && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
        && candidate.addresstype !== 'country' && candidate.type !== 'country';
    });
    if (!place) {
      throw new Error(candidates.some((candidate) => candidate.addresstype === 'country' || candidate.type === 'country')
        ? 'Country selected.'
        : 'City not found.');
    }

    const address = place.address || {};
    const locality = address.city || address.town || address.village
      || address.municipality || address.hamlet || place.name || query;
    const label = address.country ? `${locality}, ${address.country}` : locality;
    return {
      latitude: Number(place.lat),
      longitude: Number(place.lon),
      label
    };
  } catch (error) {
    console.warn('Prayer city geocoding failed:', error);
    const message = error.message === 'City not found.'
      ? getUiText('prayerCityNotFound')
      : error.message === 'Country selected.'
        ? getUiText('prayerCityRequired')
        : getUiText('prayerCityLookupFailed');
    throw new Error(message);
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchPrayerDay(endpoint, params, date) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`https://api.aladhan.com/v1/${endpoint}/${date}?${params}`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${getUiText('prayerApiHttp')} ${response.status}.`);
    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(getUiText('prayerApiTimeout'));
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function loadPrayerTimes(location) {
  const output = document.getElementById('prayer-times-list');
  const locationLabel = document.getElementById('prayer-location');
  if (!output || !location) return;
  const requestId = ++prayerRequestSequence;
  output.innerHTML = `<p class="prayer-loading"><span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>${escapeHtml(getUiText('prayerLoading'))}</p>`;
  setPrayerStatus('');
  if (location.type === 'address') {
    const geocodeRequestId = ++prayerGeocodeSequence;
    if (location.source === 'manual') manualPrayerLocationPending = true;
    setPrayerStatus(getUiText('prayerGeocoding'));
    try {
      const coordinates = await geocodePrayerAddress(location.address);
      if (requestId !== prayerRequestSequence || geocodeRequestId !== prayerGeocodeSequence) return;
      const resolvedLocation = {
        type: 'coordinates',
        ...coordinates,
        source: location.source || 'manual'
      };
      try {
        localStorage.setItem('prayer-location', JSON.stringify(resolvedLocation));
      } catch (error) {
        console.warn('Geocoded prayer location could not be saved:', error);
      }
      if (location.source === 'manual') manualPrayerLocationPending = false;
      loadPrayerTimes(resolvedLocation);
    } catch (error) {
      if (requestId !== prayerRequestSequence || geocodeRequestId !== prayerGeocodeSequence) return;
      if (location.source === 'manual') manualPrayerLocationPending = false;
      console.error('Prayer location lookup error:', error);
      output.innerHTML = `<p class="prayer-error">${escapeHtml(getUiText('prayerError'))}</p>`;
      setPrayerStatus(error.message, true);
    }
    return;
  }
  const { method, school } = prayerPreferences();
  localStorage.setItem('prayer-method', method);
  localStorage.setItem('prayer-school', school);
  const params = new URLSearchParams({ method, school });
  params.set('latitude', String(location.latitude));
  params.set('longitude', String(location.longitude));
  try {
    const endpoint = 'timings';
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let requestedDate = dateInTimeZone(location.timezone || deviceTimezone);
    let result = await fetchPrayerDay(endpoint, params, requestedDate);
    if (result.code !== 200 || !result.data?.timings) throw new Error(result.status || getUiText('prayerApiNoData'));
    const responseTimezone = result.data.meta?.timezone || deviceTimezone;
    const locationDate = dateInTimeZone(responseTimezone);
    if (result.data.date?.gregorian?.date !== locationDate && requestedDate !== locationDate) {
      requestedDate = locationDate;
      result = await fetchPrayerDay(endpoint, params, requestedDate);
      if (result.code !== 200 || !result.data?.timings) throw new Error(result.status || getUiText('prayerApiNoData'));
    }
    if (requestId !== prayerRequestSequence) return;
    const timings = result.data.timings;
    const timezone = result.data.meta?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const returnedMethodId = Number(result.data.meta?.method?.id);
    if (returnedMethodId !== Number(method)) {
      throw new Error(getUiText('prayerApiMethodMismatch'));
    }
    const returnedDate = result.data.date?.gregorian?.date;
    if (returnedDate !== dateInTimeZone(timezone)) {
      throw new Error(getUiText('prayerApiNoData'));
    }
    try {
      localStorage.setItem('prayer-location', JSON.stringify({ ...location, timezone }));
    } catch (error) {
      console.warn('Prayer location timezone could not be saved:', error);
    }
    let resolvedLocation = location.type === 'coordinates'
      ? `${String(location.label || 'Joylashuv aniqlandi').replace(/[\s·]+$/g, '')} · ${timezone.replaceAll('_', ' ')}`
      : `${location.address} · ${timezone.replaceAll('_', ' ')}`;
    if (locationLabel) locationLabel.textContent = resolvedLocation;
    currentPrayerTimingContext = { timings, timezone, date: returnedDate };
    output.innerHTML = Object.entries(prayerNames).map(([key, name], index) =>
      `<div class="prayer-time" style="--prayer-order:${index}"><span data-prayer-name="${key}">${getUiText(name)}</span><strong>${escapeHtml(String(timings[key] || '--:--').split(' ')[0])}</strong></div>`
    ).join('');
    const methodSelect = document.getElementById('prayer-calculation-method');
    const appliedMethod = document.getElementById('prayer-applied-method');
    if (appliedMethod) appliedMethod.textContent = methodSelect?.selectedOptions?.[0]?.textContent || String(method);
    updatePrayerCountdown(timings, timezone, result.data.date?.gregorian?.date);
    if (location.type === 'coordinates' && location.source !== 'manual' && location.source !== 'default') {
      resolvePrayerLocationName(location, timezone, requestId, locationLabel);
    }
  } catch (error) {
    if (requestId !== prayerRequestSequence) return;
    console.error('Prayer times load error:', error);
    output.innerHTML = `<p class="prayer-error">${escapeHtml(getUiText('prayerError'))}</p>`;
    setPrayerStatus(error.message, true);
  }
}

async function resolvePrayerLocationName(location, timezone, requestId, output) {
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    localityLanguage: currentLanguage
  });
  try {
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?${params}`);
    if (!response.ok) throw new Error(`Joy nomini aniqlash xizmati HTTP ${response.status} qaytardi.`);
    const result = await response.json();
    if (requestId !== prayerRequestSequence) return;
    const locality = [...new Set([
      result.locality,
      result.city,
      result.principalSubdivision,
      result.countryName
    ].filter((part) => typeof part === 'string' && part.trim()))];
    const label = locality.length ? locality.join(', ') : 'Joylashuv nomi aniqlanmadi';
    const resolvedLocation = { ...location, label };
    try {
      localStorage.setItem('prayer-location', JSON.stringify(resolvedLocation));
    } catch (error) {
      console.warn('Resolved prayer location could not be saved:', error);
    }
    if (output) output.textContent = `${label} · ${timezone.replaceAll('_', ' ')}`;
  } catch (error) {
    console.warn('Prayer location name lookup failed:', error);
    if (requestId === prayerRequestSequence && output) {
      output.textContent = `${getUiText('prayerCoordinatesLabel')} · ${timezone.replaceAll('_', ' ')}`;
    }
  }
}

function wallClockToDate(dateString, timeString, timeZone) {
  const [day, month, year] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = desired;
  for (let i = 0; i < 3; i += 1) {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date(timestamp));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const displayed = Date.UTC(Number(values.year), Number(values.month) - 1, Number(values.day), Number(values.hour), Number(values.minute));
    timestamp += desired - displayed;
  }
  return new Date(timestamp);
}

function updatePrayerCountdown(timings, timezone, apiDate) {
  if (prayerCountdownTimer) clearInterval(prayerCountdownTimer);
  const entries = Object.entries(prayerNames).map(([key]) => [key, getPrayerName(key), timings[key]?.split(' ')[0]]);
  const tick = () => {
    const now = new Date();
    const today = apiDate || new Intl.DateTimeFormat('en-GB', { timeZone: timezone }).format(now).replaceAll('/', '-');
    const [day, month, year] = today.split('-').map(Number);
    const upcoming = entries.map(([key, name, time]) => ({
      name,
      date: wallClockToDate(today, time || '00:00', timezone)
    })).find((entry) => entry.date > now);
    const target = upcoming?.date || wallClockToDate(
      `${String(new Date(Date.UTC(year, month - 1, day + 1)).getUTCDate()).padStart(2, '0')}-${String(new Date(Date.UTC(year, month - 1, day + 1)).getUTCMonth() + 1).padStart(2, '0')}-${new Date(Date.UTC(year, month - 1, day + 1)).getUTCFullYear()}`,
      entries[0][2] || '00:00',
      timezone
    );
    const name = document.getElementById('next-prayer-name');
    const countdown = document.getElementById('next-prayer-countdown');
    if (name) name.textContent = upcoming?.name || getPrayerName('Fajr');
    if (countdown) {
      const seconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
      countdown.textContent = `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    }
    if (!upcoming && now.getTime() >= target.getTime()) {
      loadPrayerTimes(getSavedPrayerLocation() || {
        type: 'address', address: 'Tashkent, Uzbekistan', source: 'default'
      });
    }
  };
  tick();
  prayerCountdownTimer = setInterval(tick, 1000);
}

function initializePrayerTimes() {
  const list = document.getElementById('prayer-times-list');
  if (!list) return;
  const method = document.getElementById('prayer-calculation-method');
  const school = document.getElementById('prayer-asr-school');
  if (method) {
    const savedMethod = localStorage.getItem('prayer-method');
    method.value = [...method.options].some((option) => option.value === savedMethod)
      ? savedMethod
      : method.value || '3';
  }
  if (school) {
    const savedSchool = localStorage.getItem('prayer-school');
    school.value = [...school.options].some((option) => option.value === savedSchool)
      ? savedSchool
      : school.value || '1';
  }
  const form = document.getElementById('prayer-city-form');
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    const field = document.getElementById('prayer-city-input');
    const city = field?.value.trim().replace(/\s+/g, ' ');
    if (!city) {
      field?.focus();
      setPrayerStatus(getUiText('prayerCityRequired'), true);
      return;
    }
    const location = { type: 'address', address: city, source: 'manual' };
    if (field) field.value = city;
    setPrayerLocation(location);
  });
  [method, school].forEach((select) => select?.addEventListener('change', () => {
    let location = null;
    try { location = JSON.parse(localStorage.getItem('prayer-location') || 'null'); }
    catch (error) { console.warn('Saved prayer location is invalid:', error); }
    if (location) loadPrayerTimes(location);
  }));
  document.getElementById('prayer-use-location')?.addEventListener('click', () => {
    prayerGeocodeSequence += 1;
    manualPrayerLocationPending = false;
    if (!navigator.geolocation) {
      setPrayerStatus(getUiText('prayerLocationUnsupported'), true);
      return;
    }
    setPrayerStatus(getUiText('prayerLocationLoading'));
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      setPrayerLocation({
        type: 'coordinates',
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: getUiText('prayerGpsLocation'),
        source: 'auto'
      });
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? getUiText('prayerLocationDenied')
        : getUiText('prayerLocationUnavailable');
      setPrayerStatus(message, true);
    }, { timeout: 10000, maximumAge: 300000 });
  });
  const savedLocation = getSavedPrayerLocation();
  const isDefaultCity = savedLocation?.type === 'address'
    && savedLocation.address.trim().toLowerCase() === 'tashkent, uzbekistan';
  const isAutomaticLocation = savedLocation?.source === 'auto' || savedLocation?.source === 'default'
    || (savedLocation?.type === 'coordinates' && savedLocation.source !== 'manual');
  const shouldDetectLocation = !savedLocation || isDefaultCity || isAutomaticLocation;
  const initialLocation = shouldDetectLocation
    ? (isAutomaticLocation && savedLocation?.type === 'coordinates'
      ? savedLocation
      : {
        type: 'coordinates', latitude: 41.2995, longitude: 69.2401,
        label: 'Tashkent, Uzbekistan', timezone: 'Asia/Tashkent', source: 'default'
      })
    : savedLocation;
  if (initialLocation.type === 'address') {
    const field = document.getElementById('prayer-city-input');
    if (field) field.value = initialLocation.address.split(',')[0];
  } else if (initialLocation.source === 'default') {
    const field = document.getElementById('prayer-city-input');
    if (field) field.value = 'Tashkent';
  }
  loadPrayerTimes(initialLocation);

  if (shouldDetectLocation && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (manualPrayerLocationPending || getSavedPrayerLocation()?.source === 'manual') return;
      setPrayerLocation({
        type: 'coordinates',
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: getUiText('prayerGpsLocation'),
        source: 'auto'
      });
      setPrayerStatus('');
    }, (error) => {
      const message = error.code === error.PERMISSION_DENIED
        ? getUiText('prayerLocationDenied')
        : getUiText('prayerLocationUnavailable');
      setPrayerStatus(message, true);
    }, { timeout: 10000, maximumAge: 300000 });
  } else if (shouldDetectLocation) {
    setPrayerStatus(getUiText('prayerLocationUnsupported'), true);
  }
}

async function uploadPdfBook(event) {
  event.preventDefault();
  const file = document.getElementById('pdf-book-file')?.files?.[0];
  const title = document.getElementById('pdf-book-title')?.value.trim();
  const category = document.getElementById('pdf-book-category')?.value.trim() || '';
  const tags = [...new Set((document.getElementById('pdf-book-tags')?.value || '')
    .split(',')
    .map((tag) => tag.trim().replace(/^#+/, '').replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((tag) => tag.slice(0, 40)))].slice(0, 10);
  const status = document.getElementById('pdf-upload-status');
  if (!file || !title) return;
  const bookTypesByExtension = {
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  };
  const extension = file.name.split('.').pop()?.toLowerCase();
  const contentType = bookTypesByExtension[extension];
  if (!contentType || (file.type && file.type !== contentType) || file.size <= 0 || file.size > 20 * 1024 * 1024) {
    if (status) status.textContent = 'PDF, DOC yoki DOCX fayl (20 MB gacha) tanlang.';
    return;
  }
  const button = event.submitter;
  if (button) button.disabled = true;
  if (status) status.textContent = 'Fayl Firestore’ga saqlanmoqda…';
  try {
    await uploadBookFile(db, file, { title, category, tags, contentType }, (completed, total) => {
      if (status) status.textContent = `Fayl saqlanmoqda… ${Math.floor((completed / total) * 100)}%`;
    });
    if (status) status.textContent = 'Kitob muvaffaqiyatli yuklandi.';
    event.target.reset();
    loadBooks();
  } catch (error) {
    console.error('PDF book upload failed:', error);
    if (status) {
      status.textContent = error.cleanupError
        ? `${error.message} Fayl bo‘laklarini tozalashda ham xatolik yuz berdi: ${error.cleanupError.message}`
        : error.message;
    }
  } finally {
    if (button) button.disabled = false;
  }
}

function loadBooks() {
  const list = document.getElementById('pdf-books-list');
  if (!list) return;
  let books = [];
  const render = () => {
    list.innerHTML = books.map((book) =>
      `<article class="pdf-book-card">
        <i class="bi bi-file-earmark-pdf" aria-hidden="true"></i>
        <span>${escapeHtml(book.title)}</span>
        ${book.category ? `<small>${escapeHtml(book.category)}</small>` : ''}
        <div class="pdf-book-actions">
          <a class="btn btn-sm btn-success" href="https://books.islamicofficial.com/?id=${encodeURIComponent(book.id)}#reader">${getUiText('booksReadOnline')}</a>
          ${book.url
            ? `<a class="btn btn-sm btn-outline-success" href="${escapeHtml(book.url)}" target="_blank" rel="noopener noreferrer">${getUiText('pdfDownload')}</a>`
            : `<a class="btn btn-sm btn-outline-success" href="https://books.islamicofficial.com/?id=${encodeURIComponent(book.id)}&download=1#reader">${getUiText('pdfDownload')}</a>`}
        </div>
      </article>`
    ).join('') || `<p class="text-muted" data-i18n="booksEmpty">${getUiText('booksEmpty')}</p>`;
  };
  document.addEventListener('site-language-change', render);
  onSnapshot(collection(db, 'books'), (snapshot) => {
    books = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    render();
  }, (error) => {
    console.error('Books Firestore read error:', error);
    list.innerHTML = `<p class="text-danger"><span data-i18n="booksLoadError">${getUiText('booksLoadError')}</span> ${escapeHtml(error.message)}</p>`;
  });
}

function loadDuas() {
  const list = document.getElementById('duas-list');
  const categories = document.getElementById('dua-categories');
  if (!list || !categories) return;
  let items = [];
  let selectedCategory = '*';
  const categoryTranslation = (category) => ({
    'tongi duolar': 'duaMorning',
    'tonggi duolar': 'duaMorning',
    'tungi duolar': 'duaEvening',
    umumiy: 'generalCategory'
  })[String(category || '').trim().toLocaleLowerCase('uz')] || '';
  const categoryMarkup = (category) => {
    const key = categoryTranslation(category);
    return key
      ? `<span data-i18n="${key}">${getUiText(key)}</span>`
      : escapeHtml(category);
  };
  const render = () => {
    const names = [...new Set(items.map((item) => item.category).filter(Boolean))];
    categories.innerHTML = [
      `<button type="button" class="btn btn-sm ${selectedCategory === '*' ? 'btn-success' : 'btn-outline-success'} dua-filter" data-category="*" data-i18n="duaAll">${getUiText('duaAll')}</button>`,
      ...names.map((name) => `<button type="button" class="btn btn-sm ${selectedCategory === name ? 'btn-success' : 'btn-outline-success'} dua-filter" data-category="${escapeHtml(name)}">${categoryMarkup(name)}</button>`)
    ].join('');
    const filtered = selectedCategory === '*' ? items : items.filter((item) => item.category === selectedCategory);
    list.innerHTML = filtered.map((item) => `<div class="col-md-6 dua-item"><article class="dua-card card h-100 border-0 shadow-sm p-4"><span class="badge text-bg-success align-self-start">${categoryMarkup(item.category || 'Umumiy')}</span><h3 class="h5 mt-3" dir="auto">${escapeHtml(getLocalizedField(item, 'title'))}</h3><div class="dua-scripture" dir="rtl">${escapeHtml(item.arabic || '')}</div><div class="dua-reading"><small data-i18n="duaReading">${getUiText('duaReading')}</small><p dir="auto">${escapeHtml(getLocalizedField(item, 'transliteration'))}</p></div>${getLocalizedField(item, 'text') ? `<p class="dua-meaning" dir="auto"><small data-i18n="duaMeaning">${getUiText('duaMeaning')}</small><br>${escapeHtml(getLocalizedField(item, 'text'))}</p>` : ''}</article></div>`).join('')
      || `<p class="text-muted" data-i18n="duasEmpty">${getUiText('duasEmpty')}</p>`;
    categories.querySelectorAll('.dua-filter').forEach((button) => button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      render();
    }));
  };
  document.addEventListener('site-language-change', render);
  onSnapshot(collection(db, 'duas'), (snapshot) => {
    items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    if (selectedCategory !== '*' && !items.some((item) => item.category === selectedCategory)) selectedCategory = '*';
    render();
  }, (error) => {
    console.error('Duas Firestore read error:', error);
    list.innerHTML = `<p class="text-danger"><span data-i18n="duasLoadError">${getUiText('duasLoadError')}</span> ${escapeHtml(error.message)}</p>`;
  });
}

function renderHadithContent(hadith) {
  const sourceName = `<span${hadith.featured ? ' data-i18n="featuredHadithSource"' : ''}>${escapeHtml(hadith.source || '')}</span>`;
  const sourceUrl = safeExternalUrl(hadith.sourceUrl);
  const source = sourceUrl
    ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer">${sourceName}</a>`
    : `<strong>${sourceName}</strong>`;
  return `
    <span class="badge text-bg-success align-self-start">${hadith.featured
      ? `<span data-i18n="featuredHadithGrade">${getUiText('featuredHadithGrade')}</span>`
      : hadith.grade
        ? escapeHtml(hadith.grade)
      : `<span data-i18n="hadithGradeDefault">${getUiText('hadithGradeDefault')}</span>`}</span>
    <h4 class="h5 mt-3" dir="auto"${hadith.featured ? ' data-i18n="featuredHadithTitle"' : !hadith.title ? ' data-i18n="hadithTitleDefault"' : ''}>${escapeHtml(hadith.featured ? hadith.title : getLocalizedField(hadith, 'title') || getUiText('hadithTitleDefault'))}</h4>
    ${hadith.arabic ? `<p class="fs-4 lh-lg text-end" dir="rtl">${escapeHtml(hadith.arabic)}</p>` : ''}
    <p dir="auto"${hadith.featured ? ' data-i18n="featuredHadithTranslation"' : ''}>${escapeHtml(hadith.featured ? hadith.translation : getLocalizedField(hadith, 'translation'))}</p>
    <p class="small text-muted mb-0"><span data-i18n="hadithSource">${getUiText('hadithSource')}</span>: ${source}, ${escapeHtml(hadith.reference || '')}</p>`;
}

function renderHadithCard(hadith) {
  return `<article class="card border-0 shadow-sm h-100 p-4">${renderHadithContent(hadith)}</article>`;
}

function loadHadiths() {
  const dailyCard = document.getElementById('daily-hadith-card');
  const list = document.getElementById('hadiths-list');
  const search = document.getElementById('hadith-search');
  if (!dailyCard || !list) return;

  const featuredHadith = {
    title: getUiText('featuredHadithTitle'),
    translation: getUiText('featuredHadithTranslation'),
    source: getUiText('featuredHadithSource'),
    reference: '1',
    grade: getUiText('featuredHadithGrade'),
    sourceUrl: 'https://sunnah.com/bukhari:1',
    featured: true
  };
  let hadiths = [featuredHadith];
  const render = () => {
    featuredHadith.title = getUiText('featuredHadithTitle');
    featuredHadith.grade = getUiText('featuredHadithGrade');
    featuredHadith.translation = getUiText('featuredHadithTranslation');
    featuredHadith.source = getUiText('featuredHadithSource');
    const todayIndex = Math.floor(Date.now() / 86400000) % hadiths.length;
    dailyCard.innerHTML = `<span class="badge text-bg-success align-self-start" data-i18n="todayHadith">${getUiText('todayHadith')}</span>${renderHadithContent(hadiths[todayIndex])}`;
    const query = search?.value.trim().toLocaleLowerCase() || '';
    const filtered = hadiths.filter((hadith) =>
      [hadith.title, hadith.translation, hadith.arabic, hadith.source, hadith.reference, hadith.grade]
        .some((value) => String(value || '').toLocaleLowerCase().includes(query))
    );
    list.innerHTML = filtered.map((hadith) => `<div class="col-md-6">${renderHadithCard(hadith)}</div>`).join('')
      || `<p class="text-muted" data-i18n="hadithNoResults">${getUiText('hadithNoResults')}</p>`;
  };

  search?.addEventListener('input', render);
  document.addEventListener('site-language-change', render);
  onSnapshot(collection(db, 'hadiths'), (snapshot) => {
    const published = snapshot.docs
      .map((item) => ({ id: item.id, ...item.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
    hadiths = [featuredHadith, ...published];
    render();
  }, (error) => {
    console.error('Hadith Firestore read error:', error);
    dailyCard.innerHTML = `<p class="text-danger" data-i18n="hadithLoadError">${getUiText('hadithLoadError')}</p>`;
    list.innerHTML = `<p class="text-danger">${escapeHtml(error.message)}</p>`;
  });
}

async function publishDua(event) {
  event.preventDefault();
  const status = document.getElementById('dua-status');
  try {
    await addDoc(collection(db, 'duas'), {
      title: document.getElementById('dua-title').value.trim(),
      category: document.getElementById('dua-category').value.trim(),
      arabic: document.getElementById('dua-arabic').value.trim(),
      transliteration: document.getElementById('dua-transliteration').value.trim(),
      text: document.getElementById('dua-text').value.trim(),
      translations: readAdminTranslations('dua', ['title', 'transliteration', 'text']),
      createdAt: serverTimestamp()
    });
    event.target.reset();
    if (status) status.textContent = 'Duo muvaffaqiyatli publish qilindi.';
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

async function publishHadith(event) {
  event.preventDefault();
  const status = document.getElementById('hadith-status');
  const hadith = {
    title: document.getElementById('hadith-title')?.value.trim() || '',
    source: document.getElementById('hadith-source')?.value.trim() || '',
    reference: document.getElementById('hadith-reference')?.value.trim() || '',
    grade: document.getElementById('hadith-grade')?.value.trim() || '',
    arabic: document.getElementById('hadith-arabic')?.value.trim() || '',
    translation: document.getElementById('hadith-translation')?.value.trim() || '',
    translations: readAdminTranslations('hadith', ['title', 'translation'])
  };
  if (!hadith.title || !hadith.source || !hadith.reference || !hadith.grade || !hadith.translation) {
    if (status) status.textContent = 'Sarlavha, manba, raqam, daraja va tarjimani kiriting.';
    return;
  }

  try {
    await addDoc(collection(db, 'hadiths'), { ...hadith, createdAt: serverTimestamp() });
    event.target.reset();
    if (status) status.textContent = 'Manbali hadis muvaffaqiyatli nashr qilindi.';
  } catch (error) {
    console.error('Hadith publish error:', error);
    if (status) status.textContent = error.message;
  }
}

function initializeSiteSearch() {
  const form = document.getElementById('site-search-form');
  const input = document.getElementById('site-search-input');
  const results = document.getElementById('site-search-results');
  const status = document.getElementById('site-search-status');
  if (!form || !input || !results) return;

  const destinations = [
    { labelKey: 'dailyToolsTitle', descriptionKey: 'searchDailyToolsDescription', href: 'https://tools.islamicofficial.com/', priority: 4, keywords: 'kundalik vositalar islomiy vositalar namoz vaqti namoz vaqtlari qibla kibla qiblani topish qibla kompas compass direction tasbeh tasbih zikr hisoblagich zikr sanash zakot zakat zakot hisoblagich zakat kalkulyator zakat calculator zakat calculator zakah nisob nisab hijriy hijri hijri sana islamic date muslim daily tools prayer times prayer time salah timetable qibla finder tasbeeh counter dhikr counter dhikr adhkar zakat calculator charitable calculator Islamic tools Islamic utility мусульманские инструменты время намаза кибла тасбих закят исламский календарь' },
    { labelKey: 'ibadatTitle', descriptionKey: 'searchIbadatDescription', href: 'https://islamicofficial-ibadat.web.app/', priority: 4, keywords: 'ibodat ibodatlar ibodat reja ibodatlarim shaxsiy ibodat rejalashtirgich qazo namoz qazo namozlar qazo hisoblagich namozlarni qazo qilish qazo roza qazo ro‘za qazo roza reja qazo ro‘za reja farz namoz roza tutish ibodat odatlari kundalik ibodat ibodat kuzatuvchi worship planner worship tracker prayer planner make up prayer qada prayer qada tracker missed prayers prayer catch up prayer debt fasting planner make up fasting qada fasting missed fasts worship habits daily worship checklist worship streak عبادات قضاء الصلاة قضاء الصيام مخطط العبادة' },
    { labelKey: 'currencyRates', descriptionKey: 'searchCurrencyDescription', href: 'https://valyuta.islamicofficial.com/', priority: 3, arLabel: 'أسعار العملات', arDescription: 'أسعار الصرف الرسمية ومحول العملات', keywords: 'valyuta valyutalar valyuta kursi valyuta kurslari kurs kursi kurslar pul valyuta ayirboshlash almashtirish hisoblagich konvertor dollar dollar kursi dollar kursi dollor dollir yevro evro euro rubl rubl rubli ruble tenge tengе som so‘m somi qirgiz som qozogiston tangasi yuan funt frank lira dirham rupiya rupiy yen won dollari kursni usd eur rub gbp jpy azn bdt bhd bnd brl byn cad chf cny cup czk dkk dzd egp afn ars gel hkd huf idr ils inr iqd irr isk jod aud kgs khr krw kwd kzt lak lbp lyd mad mdl mmk mnt mxn myr nok nzd omr php pkr pln qar ron rsd amd sar sdg sek sgd syp thb tjs tmt tnd try uah aed uyu ves vnd xdr yer zar currency currencies exchange rate exchange rates currency converter convert money foreign exchange fx currency values dollars dollar rate pound sterling yen yuan lira dirham rupee rupees dinar franc krona krone peso real manat taka shekel rial peso bolivar dong اسعار صرف أسعار العملات عملة العملات الدولار اليورو روبل سعر курс валют курсы валюта валюты обмен валют курс доллара курс евро курс рубля конвертер валют доллары евро рубли фунт иена юань тенге сом динар рупия франк лира дирхам курс тенге курс сом купить валюту курс обмена курс валют uzs ozbek som ozbekistani som rate of exchange dollar exchange forex اسعار الصرف سعر الدولار تحويل العملات الدولار الأمريكي' },
    { labelKey: 'quranTitle', descriptionKey: 'searchQuranDescription', href: 'https://islamicofficial-quran.web.app/', priority: 6, keywords: 'qur’on quran quran karim quroni karim coran quran o‘qish qur’on o‘qish mushaf mushaf o‘quvchi sura surah sura tanlash oyat quran oyati juz juzlar para pora 30 juz 30 pora 114 sura al fatiha fotiha baqara yasin quran reader full quran read quran quran text quran juz quran surah quran online القرآن الكريم المصحف القرآن قراءة القرآن جزء سورة آية Коран читать Коран джуз сура аят' },
    { labelKey: 'financeTitle', descriptionKey: 'searchFinanceDescription', href: 'https://islamicofficial-finance.web.app/', priority: 5, keywords: 'zakot zakat zakah zakot hisoblash zakot kalkulyator zakat calculator nisob nisab oltin kumush moliya islomiy moliya halol aksiya investitsiya halol investitsiya crypto kripto shariah compliance zakat on gold business zakat finance' },
    { labelKey: 'inheritanceTitle', descriptionKey: 'searchInheritanceDescription', href: 'https://islamicofficial-meros.web.app/', priority: 5, keywords: 'meros merosxo‘r merosxo’r meros hisoblagich meros kalkulyator faraiz faroiz faroyiz meros taqsimoti vasiyat meros ulushi merosni taqsimlash inheritance estate share calculator islamic inheritance faraid heirs share میراث наследство наследники доля наследства' },
    { labelKey: 'prayerTimes', descriptionKey: 'searchPrayerDescription', href: '#prayer-times', keywords: 'namoz vaqti namoz vaqtlari vaqt taqvim bomdod peshin asr shom xufton' },
    { labelKey: 'duas', descriptionKey: 'searchDuaDescription', href: '#duas', keywords: 'duo duolar zikr zikrlar arabcha' },
    { labelKey: 'hadiths', descriptionKey: 'searchHadithDescription', href: '#hadith', keywords: 'hadis hadislar sunnat sahih buxoriy' },
    { labelKey: 'myWorship', descriptionKey: 'searchWorshipDescription', href: '#ibodat-statistikasi', keywords: 'ibodat namoz odat statistika hisoblagich' },
    { labelKey: 'pdfBooksTitle', descriptionKey: 'searchBooksDescription', href: '#pdf-books', searchKey: 'books', priority: 2, keywords: 'kitob kitoblar pdf qollanma qo‘llanma nurul yaqin nurulyaqin nuril yaqin nurilyaqin nurul yakin nuril yakin nurul yaqeen nurul yakin pdf nuril yaqin pdf faroiz faroyiz faroyz faraiz favoid faroiz pdf faraiz pdf islomiy kitoblar pdf elektron kutubxona pdf books islamic books book' },
    { labelKey: 'allArticles', descriptionKey: 'searchArticlesDescription', href: 'blog.html', keywords: 'maqola maqolalar blog ilm marifat ma’rifat' },
    { labelKey: 'mediaTitle', descriptionKey: 'searchMediaDescription', href: 'media.html', keywords: 'video videolar youtube media maruza ma’ruza dars' },
    { labelKey: 'appLinks', descriptionKey: 'searchLinksDescription', href: 'links.html', keywords: 'ilova app telegram instagram kanal youtube sahifa' },
    { labelKey: 'contact', descriptionKey: 'searchContactDescription', href: '#contact', keywords: 'aloqa email boglanish bog‘lanish' }
  ];
  const normalize = (value) => String(value || '')
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[‘’ʻʼ`]/g, "'")
    .replace(/[^\p{L}\p{N}'\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const findMatches = () => {
    const query = normalize(input.value);
    if (!query) return [];
    const terms = query.split(' ');
    return destinations
      .map((destination) => {
        const label = currentLanguage === 'ar' && destination.arLabel ? destination.arLabel : getUiText(destination.labelKey);
        const description = currentLanguage === 'ar' && destination.arDescription ? destination.arDescription : getUiText(destination.descriptionKey);
        const title = normalize(label);
        const searchableText = normalize(`${label} ${description} ${destination.keywords}`);
        const matches = terms.every((term) => searchableText.includes(term));
        const score = (title === query ? 3 : title.includes(query) ? 2 : 1) + (destination.priority || 0);
        return { destination: { ...destination, label, description }, matches, score };
      })
      .filter((result) => result.matches)
      .sort((first, second) => second.score - first.score)
      .slice(0, 6)
      .map((result) => result.destination);
  };

  const destinationHref = (destination) => {
    if (destination.searchKey === 'books') {
      const url = new URL('https://books.islamicofficial.com/');
      url.searchParams.set('q', input.value.trim());
      return url.href;
    }
    return destination.href;
  };

  const render = () => {
    const query = input.value.trim();
    const matches = findMatches();
    results.replaceChildren();
    input.setAttribute('aria-expanded', String(Boolean(query)));
    results.classList.toggle('d-none', !query);

    if (query && !matches.length) {
      const empty = document.createElement('div');
      empty.className = 'list-group-item text-muted';
      empty.textContent = getUiText('searchNoSection');
      results.append(empty);
    } else {
      matches.forEach((destination) => {
        const link = document.createElement('a');
        link.className = 'list-group-item list-group-item-action';
        link.href = destinationHref(destination);
        link.setAttribute('role', 'option');
        const title = document.createElement('strong');
        title.textContent = destination.label;
        const description = document.createElement('span');
        description.className = 'd-block small text-muted';
        description.textContent = destination.description;
        link.append(title, description);
        results.append(link);
      });
    }
    if (status) status.textContent = query
      ? matches.length ? getUiText('searchResultsCount').replace('{count}', String(matches.length)) : getUiText('searchNoResults')
      : '';
  };

  input.addEventListener('input', render);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const firstMatch = findMatches()[0];
    if (firstMatch) window.location.assign(destinationHref(firstMatch));
    else render();
  });
}

function initializeWorshipStats() {
  const output = document.getElementById('worship-stats');
  if (!output) return;
  const today = new Date().toISOString().slice(0, 10);
  const key = `worship-${today}`;
  const stats = JSON.parse(localStorage.getItem(key) || '{}');
  const actions = document.getElementById('worship-actions');
  if (actions) {
    const labels = {
      Bomdod: 'prayerFajr', Peshin: 'prayerDhuhr', Asr: 'prayerAsr',
      Shom: 'prayerMaghrib', Xufton: 'prayerIsha', "Qur'on": 'prayerQuran'
    };
    actions.innerHTML = Object.entries(labels).map(([name, keyName]) => {
      const done = Boolean(stats[name]);
      return `<div class="col-sm-6 col-lg-4"><button class="worship-action stat-action ${done ? 'is-done' : ''}" data-worship="${name}"><i class="bi ${done ? 'bi-check-circle-fill' : 'bi-circle'}"></i><span>${getUiText(keyName)}</span><small>${getUiText(done ? 'prayerDone' : 'prayerMarkDone')}</small></button></div>`;
    }).join('');
  }
  const render = () => {
    const done = Object.values(stats).filter(Boolean).length;
    output.innerHTML = `<div class="col-12"><div class="stats-summary"><div><small>${getUiText('prayerToday')}</small><strong>${done}</strong></div><div class="stats-progress"><span style="width:${Math.min(100, done / 6 * 100)}%"></span></div><small>${done}/6 ${getUiText('prayerActionsComplete')}</small></div></div>`;
  };
  document.querySelectorAll('.worship-action').forEach((button) => button.addEventListener('click', async () => {
    const name = button.dataset.worship;
    stats[name] = !stats[name];
    localStorage.setItem(key, JSON.stringify(stats));
    button.classList.toggle('is-done', stats[name]);
    button.querySelector('i').className = `bi ${stats[name] ? 'bi-check-circle-fill' : 'bi-circle'}`;
    button.querySelector('small').textContent = getUiText(stats[name] ? 'prayerDone' : 'prayerMarkDone');
    render();
    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'userStats', auth.currentUser.uid), { [`daily.${today}.${name}`]: stats[name], updatedAt: serverTimestamp() }, { merge: true });
      } catch (error) { console.warn('Shaxsiy statistika saqlanmadi:', error.message); }
    }
  }));
  render();
  const habitKey = `private-habits-${auth.currentUser?.uid || visitorId}`;
  const habits = JSON.parse(localStorage.getItem(habitKey) || '[]');
  const habitsList = document.getElementById('habits-list');
  const renderHabits = () => {
    if (habitsList) habitsList.innerHTML = habits.map((habit, index) => `<div class="col-md-6"><button type="button" class="habit-card ${habit.done ? 'is-done' : ''}" data-habit-index="${index}"><i class="bi ${habit.done ? 'bi-check-circle-fill' : 'bi-circle'}"></i><span>${escapeHtml(habit.name)}</span><small>${getUiText(habit.done ? 'habitTodayDone' : 'habitMarkDone')}</small></button></div>`).join('') || `<p class="text-muted">${getUiText('noHabits')}</p>`;
    habitsList?.querySelectorAll('[data-habit-index]').forEach((button) => button.addEventListener('click', () => {
      const habit = habits[Number(button.dataset.habitIndex)];
      habit.done = !habit.done;
      localStorage.setItem(habitKey, JSON.stringify(habits));
      renderHabits();
    }));
  };
  document.addEventListener('site-language-change', renderHabits);
  document.getElementById('habit-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('habit-name');
    if (input.value.trim()) { habits.push({ name: input.value.trim(), done: false }); input.value = ''; localStorage.setItem(habitKey, JSON.stringify(habits)); renderHabits(); }
  });
  renderHabits();
}

document.addEventListener('DOMContentLoaded', () => {
  initializePublicArticleControls();
  startPublicArticleListener();
  initializePrayerTimes();
  loadBooks();
  loadDuas();
  loadHadiths();
  initializeSiteSearch();
  initializeWorshipStats();
  document.getElementById('dua-form')?.addEventListener('submit', publishDua);
  document.getElementById('hadith-form')?.addEventListener('submit', publishHadith);
  initializeAdminTranslationEditor('article', 'article', {
    title: 'article-title',
    summary: 'article-summary',
    content: 'article-content'
  }, [
    { key: 'title', label: 'Sarlavha', multiline: false },
    { key: 'summary', label: 'Qisqacha mazmun', multiline: true },
    { key: 'content', label: 'Maqola matni', multiline: true }
  ]);
  initializeAdminTranslationEditor('dua', 'dua', {
    title: 'dua-title',
    transliteration: 'dua-transliteration',
    text: 'dua-text'
  }, [
    { key: 'title', label: 'Sarlavha', multiline: false },
    { key: 'transliteration', label: 'O‘qilishi', multiline: true },
    { key: 'text', label: 'Ma’nosi', multiline: true }
  ]);
  initializeAdminTranslationEditor('hadith', 'hadith', {
    title: 'hadith-title',
    translation: 'hadith-translation'
  }, [
    { key: 'title', label: 'Sarlavha', multiline: false },
    { key: 'translation', label: 'Tarjima yoki mazmun', multiline: true }
  ]);
  document.getElementById('pdf-upload-form')?.addEventListener('submit', uploadPdfBook);
  document.getElementById('media-video-form')?.addEventListener('submit', addMediaVideo);
  const articleEditModal = document.getElementById('article-edit-modal');
  document.getElementById('article-edit-form')?.addEventListener('submit', saveArticleEdit);
  articleEditModal?.addEventListener('hidden.bs.modal', () => {
    editingArticleId = null;
    editingArticleSummary = '';
    document.getElementById('article-edit-form')?.reset();
  });
  document.getElementById('admin-article-search')?.addEventListener('input', (event) => {
    const query = event.target.value.trim().toLocaleLowerCase();
    document.querySelectorAll('#admin-articles-list .admin-record').forEach((row) => {
      row.classList.toggle('d-none', !row.textContent.toLocaleLowerCase().includes(query));
    });
  });
  document.querySelectorAll('[data-admin-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      const activeId = tab.dataset.adminTab;
      document.querySelectorAll('[data-admin-tab]').forEach((item) => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      document.querySelectorAll('.admin-tab-panel').forEach((panel) => {
        const active = panel.id === activeId;
        panel.classList.toggle('d-none', !active);
        panel.hidden = !active;
      });
    });
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = [...document.querySelectorAll('[data-admin-tab]')];
      const current = tabs.indexOf(tab);
      const next = event.key === 'Home' ? 0
        : event.key === 'End' ? tabs.length - 1
          : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[next].focus();
      tabs[next].click();
    });
  });
  const languageSelect = document.getElementById('language-select');
  if (languageSelect) {
    languageSelect.value = localStorage.getItem('site-language') || 'uz';
    if (!translations[languageSelect.value]) languageSelect.value = 'uz';
    languageSelect.addEventListener('change', () => {
      applyLanguage(languageSelect.value);
      document.documentElement.dir = languageSelect.value === 'ar' ? 'rtl' : 'ltr';
    });
    applyLanguage(languageSelect.value);
  }
  const savedTheme = localStorage.getItem('site-theme');
  const themeButton = document.getElementById('theme-toggle');
  const applyTheme = (isDark) => {
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
    if (themeButton) {
      themeButton.setAttribute('aria-pressed', String(isDark));
      themeButton.setAttribute('aria-label', getUiText(isDark ? 'lightMode' : 'darkMode'));
      themeButton.title = getUiText(isDark ? 'lightMode' : 'darkMode');
      themeButton.innerHTML = `<i class="bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}" aria-hidden="true"></i>`;
    }
  };
  applyTheme(savedTheme === 'dark');
  themeButton?.addEventListener('click', () => applyTheme(!document.body.classList.contains('dark-theme')));
  const fontSteps = ['font-scale-0', 'font-scale-1', 'font-scale-2', 'font-scale-3'];
  const savedFontIndex = Number(localStorage.getItem('site-font-index') || 0);
  let fontIndex = Number.isInteger(savedFontIndex) ? Math.min(fontSteps.length - 1, Math.max(0, savedFontIndex)) : 0;
  const applyFontSize = () => {
    document.documentElement.classList.remove(...fontSteps);
    document.documentElement.classList.add(fontSteps[fontIndex]);
    localStorage.setItem('site-font-index', String(fontIndex));
  };
  applyFontSize();
  document.getElementById('font-increase')?.addEventListener('click', () => { fontIndex = Math.min(fontSteps.length - 1, fontIndex + 1); applyFontSize(); });
  document.getElementById('font-decrease')?.addEventListener('click', () => { fontIndex = Math.max(0, fontIndex - 1); applyFontSize(); });
  document.getElementById('share-site-btn')?.addEventListener('click', async () => {
    const shareData = { title: document.title, text: 'Islamic Official saytiga tashrif buyuring', url: location.href };
    if (navigator.share) await navigator.share(shareData);
    else await navigator.clipboard.writeText(location.href);
  });
  document.querySelectorAll('[data-media-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('[data-media-filter]').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('.media-item').forEach((item) => {
        item.classList.toggle('d-none', button.dataset.mediaFilter !== 'all' && item.dataset.mediaLanguage !== button.dataset.mediaFilter);
      });
    });
  });
  document.getElementById('google-login-btn')?.addEventListener('click', () => signIn(() => signInWithPopup(auth, googleProvider)));
  document.getElementById('apple-login-btn')?.addEventListener('click', () => signIn(() => signInWithPopup(auth, appleProvider)));
  document.getElementById('anonymous-login-btn')?.addEventListener('click', () => signIn(() => signInAnonymously(auth)));
  document.getElementById('email-login-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    signIn(() => signInWithEmailAndPassword(auth, document.getElementById('login-email').value.trim(), document.getElementById('login-password').value));
  });
  document.getElementById('phone-send-btn')?.addEventListener('click', async () => {
    try {
      if (!window.recaptchaVerifier) window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      phoneConfirmation = await signInWithPhoneNumber(auth, document.getElementById('login-phone').value.trim(), window.recaptchaVerifier);
      document.getElementById('phone-code-group')?.classList.remove('d-none');
      authMessage('SMS kodi yuborildi.');
    } catch (error) {
      console.error('Phone authentication error:', error);
      authMessage(error.message, true);
    }
  });
  document.getElementById('phone-verify-btn')?.addEventListener('click', () => signIn(() => phoneConfirmation.confirm(document.getElementById('login-phone-code').value.trim())));
  document.getElementById('article-image')?.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    const preview = document.getElementById('article-image-preview');
    if (!file || !preview) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      event.target.value = '';
      preview.src = '';
      preview.classList.add('d-none');
      authMessage('Rasm JPG, PNG yoki WEBP bo‘lishi va 5 MB dan oshmasligi kerak.', true);
      return;
    }
    preview.src = URL.createObjectURL(file);
    preview.classList.remove('d-none');
  });
  document.getElementById('article-image-only')?.addEventListener('change', (event) => {
    ['article-title', 'article-summary', 'article-content'].forEach((id) => {
      const field = document.getElementById(id);
      if (field) field.required = !event.target.checked;
    });
  });
  document.getElementById('article-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (uploadInProgress) return;
    uploadInProgress = true;
    const saveButton = event.target.querySelector('button[type="submit"]');
    if (saveButton) saveButton.disabled = true;
    try {
      const imageFile = document.getElementById('article-image')?.files?.[0];
      let imageUrl = document.getElementById('article-image-url')?.value.trim() || '';
      if (imageUrl && !/^https?:\/\//i.test(imageUrl)) throw new Error('Rasm URL http:// yoki https:// bilan boshlanishi kerak.');
      if (imageFile) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(imageFile.type) || imageFile.size > 5 * 1024 * 1024) {
          throw new Error('Rasm JPG, PNG yoki WEBP bo‘lishi va 5 MB dan oshmasligi kerak.');
        }
        imageUrl = await compressImage(imageFile);
      }
      const imageOnly = document.getElementById('article-image-only')?.checked || false;
      const title = document.getElementById('article-title').value.trim();
      const summary = document.getElementById('article-summary').value.trim();
      const content = document.getElementById('article-content').value.trim();
      const sourceUrl = document.getElementById('article-source-url')?.value.trim() || '';
      if (imageOnly && !imageUrl) throw new Error('Faqat surat uchun rasm tanlang.');
      if (!imageOnly && !title) throw new Error('Sarlavha kiriting.');
      if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) throw new Error('Havola http:// yoki https:// bilan boshlanishi kerak.');
      await addDoc(articlesRef, {
        title: imageOnly ? (title || 'Yangi surat') : title,
        summary: imageOnly ? (summary || 'Faqat surat') : summary,
        content: imageOnly ? '' : content,
        category: document.getElementById('article-category')?.value.trim() || 'Umumiy',
        imageUrl,
        imageOnly,
        sourceUrl,
        translations: readAdminTranslations('article', ['title', 'summary', 'content']),
        likes: 0,
        views: 0,
        author: auth.currentUser?.displayName || auth.currentUser?.email || 'Admin',
        createdAt: serverTimestamp()
      });
      event.target.reset();
      document.getElementById('article-image-preview')?.classList.add('d-none');
      authMessage("Maqola qo'shildi.");
    } catch (error) {
      console.error('Firestore create error:', error);
      const message = error.code === 'storage/unknown' || error.code === 'storage/retry-limit-exceeded'
        ? 'Rasm yuklanmadi. Firebase Storage Rules/CORS sozlamalarini tekshiring.'
        : error.message;
      authMessage(message, true);
    } finally {
      uploadInProgress = false;
      if (saveButton) saveButton.disabled = false;
    }
  });
});

onAuthStateChanged(auth, (user) => {
  const authContainer = document.getElementById('auth-btn-container');
  const isAdmin = Boolean(user && user.email === adminEmail);
  showAdminPanel(isAdmin);
  if (!authContainer) return;
  if (user) {
    authContainer.innerHTML = `<button class="btn btn-outline-light" id="logout-btn">${user.displayName || user.email || 'Account'}${isAdmin ? ' (Admin)' : ''}</button>`;
    document.getElementById('logout-btn').addEventListener('click', () => signOut(auth));
  } else {
    if (adminArticlesUnsubscribe) {
      adminArticlesUnsubscribe();
      adminArticlesUnsubscribe = null;
    }
    if (adminMediaVideosUnsubscribe) {
      adminMediaVideosUnsubscribe();
      adminMediaVideosUnsubscribe = null;
    }
    authContainer.innerHTML = '<button id="login-btn" class="btn btn-primary ms-3" data-bs-toggle="modal" data-bs-target="#authModal">Sign In</button>';
  }
});

// Admin tugmalarini yashirish/ko'rsatish yordamchi funksiyasi
function showAdminControls(enable) {
  const adminElements = document.querySelectorAll('.admin-only');
  adminElements.forEach(el => {
    el.style.display = enable ? 'block' : 'none';
  });
}
(function() {
  "use strict";

  /**
   * Apply .scrolled class to the body as the page is scrolled down
   */
  function toggleScrolled() {
    const selectBody = document.querySelector('body');
    const selectHeader = document.querySelector('#header');
   if (!selectBody || !selectHeader) return;
   if (!selectHeader.classList.contains('scroll-up-sticky') && !selectHeader.classList.contains('sticky-top') && !selectHeader.classList.contains('fixed-top')) return;
    window.scrollY > 100 ? selectBody.classList.add('scrolled') : selectBody.classList.remove('scrolled');
  }

  document.addEventListener('scroll', toggleScrolled);
  window.addEventListener('load', toggleScrolled);

  /**
   * Mobile nav toggle
   */
  const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');

  function mobileNavToogle() {
    const isOpen = document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
    mobileNavToggleBtn.setAttribute('aria-expanded', String(isOpen));
    mobileNavToggleBtn.setAttribute('aria-label', isOpen ? 'Menyuni yopish' : 'Menyuni ochish');
  }
  if (mobileNavToggleBtn) {
    mobileNavToggleBtn.addEventListener('click', mobileNavToogle);
  }

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.mobile-nav-active')) {
        mobileNavToogle();
      }
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-nav-active')) {
        mobileNavToogle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function(e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) {
    scrollTop.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function(swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Frequently Asked Questions Toggle
   */
  document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle').forEach((faqItem) => {
    faqItem.addEventListener('click', () => {
      faqItem.parentNode.classList.toggle('faq-active');
    });
  });

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function(direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Init isotope layout and filters
   */
  document.querySelectorAll('.isotope-layout').forEach(function(isotopeItem) {
    let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
    let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
    let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

    let initIsotope;
    imagesLoaded(isotopeItem.querySelector('.isotope-container'), function() {
      initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
        itemSelector: '.isotope-item',
        layoutMode: layout,
        filter: filter,
        sortBy: sort
      });
    });

    isotopeItem.querySelectorAll('.isotope-filters li').forEach(function(filters) {
      filters.addEventListener('click', function() {
        isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
        this.classList.add('filter-active');
        initIsotope.arrange({
          filter: this.getAttribute('data-filter')
        });
        if (typeof aosInit === 'function') {
          aosInit();
        }
      }, false);
    });

  });

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function(e) {
    const hash = window.location.hash.split('&')[0];
    if (hash && /^#[A-Za-z][A-Za-z0-9_-]*$/.test(hash)) {
      if (document.querySelector(hash)) {
        setTimeout(() => {
          let section = document.querySelector(hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;
      let position = window.scrollY + 200;
      if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    })
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();