import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import {
  collection,
  getDocs,
  getFirestore
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
import { uploadBookFile, loadBookFile } from '../assets/js/firestore-pdf-store.js';

const projectId = 'islamicofficial-9279f';
const adminEmail = 'islomummati8@gmail.com';
const firebaseConfig = {
  apiKey: 'AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY',
  authDomain: 'islamicofficial-9279f.firebaseapp.com',
  projectId,
  storageBucket: 'islamicofficial-9279f.firebasestorage.app',
  messagingSenderId: '251823878076',
  appId: '1:251823878076:web:9eff3e9b8b01f6f827c5b9'
};
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.setCustomParameters({ prompt: 'select_account' });
const db = getFirestore(firebaseApp);
let currentAdmin = null;
let uploadInProgress = false;

const translations = {
  uz: {
    pageTitle: 'Islomiy elektron kutubxona | Islamic Official', metaDescription: 'Foydali islomiy elektron kitoblarni qidiring, brauzerda qulay o‘qing, saqlang va PDF shaklida yuklab oling.',
    brandLabel: 'Elektron kutubxona', homeLink: 'Asosiy sayt', languageLabel: 'Til', eyebrow: 'Bilimga qulay yo‘l',
    heroTitle: 'O‘qing, izlang, ilm ulashing', heroDescription: 'Kerakli kitobni tez toping, telefon yoki kompyuteringizda o‘qing va keyin davom ettirish uchun saqlab qo‘ying.',
    explore: 'Kutubxonani ko‘rish', collectionLabel: 'Tanlangan manbalar', libraryTitle: 'Kitoblar kutubxonasi',
    libraryDescription: 'Mavzu yoki kitob nomini yozing. Sevimlilaringiz va yaqinda o‘qiganlaringiz ushbu qurilmada saqlanadi.',
    booksLabel: 'kitob', searchPlaceholder: 'Kitob nomi yoki mavzu bo‘yicha qidirish', categoryLabel: 'Mavzu',
    allCategories: 'Barcha mavzular', sortLabel: 'Saralash', sortNewest: 'Yangi qo‘shilgan',
    sortTitle: 'Nom bo‘yicha (A–Z)', filterAll: 'Barcha kitoblar', filterSaved: 'Saqlanganlar',
    filterRecent: 'O‘qishni davom ettirish', loading: 'Kitoblar yuklanmoqda…', backLibrary: 'Kutubxonaga qaytish',
    share: 'Ulashish', download: 'Yuklab olish', privacy: 'Maxfiylik siyosati',
    featureMobile: 'Har qurilmada qulay', featureMobileText: 'Telefon, planshet va kompyuterda foydalaning.',
    featureSave: 'O‘qishni davom ettiring', featureSaveText: 'Saqlangan va yaqinda ochilgan kitoblar shu qurilmada eslab qolinadi.',
    featureSimple: 'Sodda va qulay', featureSimpleText: 'Kerakli manbani qidiring, onlayn o‘qing yoki faylni yuklab oling.',
    footerHome: 'Islamic Official saytiga qaytish', empty: 'Hozircha kutubxonada kitob yo‘q.',
    noResults: 'Bu qidiruvga mos kitob topilmadi.', noSaved: 'Saqlangan kitoblar hali yo‘q.',
    noRecent: 'Yaqinda o‘qilgan kitob yo‘q. Kutubxonadan birini tanlang.',
    loadError: 'Kitoblarni yuklab bo‘lmadi. Internet aloqasini tekshirib, sahifani yangilang.',
    fileLoading: 'Kitob fayli yuklanmoqda…', fileLoadError: 'Kitob faylini yuklab bo‘lmadi:',
    read: 'O‘qish', pdf: 'PDF hujjat', document: 'Elektron hujjat', save: 'Sevimlilarga saqlash',
    removeSave: 'Saqlanganlardan olib tashlash', noPreview: 'Bu faylni brauzerda ko‘rib bo‘lmaydi. Yuklab oling yoki alohida oynada oching.',
    readerTitle: 'Kitobni o‘qish', countOne: 'kitob', countMany: 'kitob', shareCopied: 'Havola nusxalandi.',
    shareError: 'Havolani nusxalab ulashing:', unnamed: 'Nomsiz kitob', categoryFallback: 'Umumiy',
    saveError: 'Saqlangan kitoblar ro‘yxatini ushbu qurilmada saqlab bo‘lmadi.',
    accountLogin: 'Kirish', accountLogout: 'Chiqish', signedInAs: 'Hisob:',
    accountDialogTitle: 'Kutubxonaga kiring', loginRequired: 'PDF faylni yuklab olish uchun Google yoki email orqali kiring.',
    signInGoogle: 'Google bilan davom etish', orLabel: 'yoki email orqali', emailSignIn: 'Kirish',
    emailRegister: 'Ro‘yxatdan o‘tish', emailLabel: 'Email manzilingiz', passwordLabel: 'Parol (kamida 6 belgi)',
    forgotPassword: 'Parolni unutdingizmi?', accountSuccess: 'Hisobga muvaffaqiyatli kirdingiz.',
    resetSent: 'Parolni tiklash havolasi emailingizga yuborildi.', readerViewLabel: 'PDF ko‘rinishi',
    readerFitWidth: 'Sahifa kengligiga mos', readerFitPage: 'Butun sahifa', readerActualSize: 'Haqiqiy o‘lcham (100%)',
    readerFullscreen: 'To‘liq ekran', readerDownloadNote: 'PDF yuklab olish uchun Google yoki email orqali kiring.',
    readerExitFullscreen: 'To‘liq ekrandan chiqish', readerOpenTab: 'Yangi oynada ochish',
    pdfReaderError: 'PDF ko‘ruvchi ishga tushmadi. Faylni yangi oynada ochib ko‘ring.',
    readerPaperColor: 'Varaq rangi', readerPaperWhite: 'Oq', readerPaperWarm: 'Iliq oq',
    readerPaperYellow: 'Och sariq', readerPaperGreen: 'Och yashil', readerPaperBlue: 'Och ko‘k',
    readerPaperGray: 'Och kulrang', readerPaperRose: 'Och pushti', readerPaperSepia: 'Sepiya',
    readerFirstPage: 'Birinchi bet', readerPreviousPage: 'Oldingi bet', readerNextPage: 'Keyingi bet',
    readerLastPage: 'Oxirgi bet', readerPageLabel: 'Bet', readerResumePosition: 'Betni eslab qolish',
    readerRotateScreen: 'Ekranni gorizontal aylantirish', readerOrientationSet: 'Ekran gorizontal holatga o‘tkazildi.',
    readerOrientationReset: 'Ekran yo‘nalishi tiklandi.', readerOrientationUnsupported: 'Bu qurilmada avtomatik aylantirish ishlamaydi. Telefonni qo‘lda aylantiring.',
    readerOrientationError: 'Ekranni aylantirish uchun to‘liq ekran rejimiga ruxsat bering.',
    adminLink: 'Boshqaruv', adminKicker: 'Faqat administrator uchun', adminTitle: 'Kitoblarni boshqarish',
    adminDescription: 'Kitoblar kutubxonasi boshqaruvi faqat ruxsatli hisob uchun ochiq.',
    adminClose: 'Yopish', adminSignedOut: 'Admin paneliga kirish uchun administrator Google hisobidan foydalaning.',
    adminGoogle: 'Google orqali kirish', adminLogout: 'Chiqish', adminDenied: 'Bu Google hisobi administrator sifatida ruxsat etilmagan.',
    adminSignedIn: 'Administrator sifatida kirdingiz:', adminLoginError: 'Kirishda xatolik:',
    adminUploadTitle: 'Yangi kitob yuklash', adminUploadDescription: '20 MB gacha PDF fayl Firestore’ning bepul kvotasi doirasida saqlanadi. Sarlavha va teglar qidiruvni osonlashtiradi.',
    adminBookTitle: 'Kitob nomi', adminAuthor: 'Muallif (ixtiyoriy)', adminCategory: 'Mavzu (ixtiyoriy)',
    adminTags: 'Qidiruv teglari (vergul bilan; # ixtiyoriy)', adminTagsPlaceholder: '#nurul yaqin, aqida, islom',
    adminDescriptionField: 'Qisqa izoh (ixtiyoriy)', adminPdfFile: 'PDF fayl (20 MB gacha)',
    adminUploadButton: 'Yuklash', adminBooksTitle: 'Yuklangan kitoblar',
    adminUploadProgress: 'Yuklanmoqda…', adminUploadSuccess: 'Kitob yuklandi va kutubxonaga qo‘shildi.',
    adminUploadError: 'Yuklash amalga oshmadi:', adminDelete: 'O‘chirish', adminOpen: 'Ochish',
    adminNoBooks: 'Hozircha yuklangan kitob yo‘q.', adminBooksError: 'Kitoblar ro‘yxatini yuklab bo‘lmadi:',
    adminConfirmDelete: 'Ushbu kitobni kutubxonadan o‘chirasizmi?', adminBadFile: '20 MB gacha bo‘lgan PDF faylni tanlang.',
    adminStorageHelp: 'PDF Firebase Firestore orqali bepul kvota doirasida saqlanadi.'
  },
  en: {
    pageTitle: 'Islamic digital library | Islamic Official', metaDescription: 'Find useful Islamic books, read them in your browser, save favorites, and download PDFs.',
    brandLabel: 'Digital library', homeLink: 'Main site', languageLabel: 'Language', eyebrow: 'Knowledge, made accessible',
    heroTitle: 'Read, discover, and share knowledge', heroDescription: 'Find a book, read it on your phone or computer, and save it to continue later.',
    explore: 'Browse the library', collectionLabel: 'Curated resources', libraryTitle: 'Book library',
    libraryDescription: 'Search by title or topic. Favorites and recently opened books are saved on this device.',
    booksLabel: 'books', searchPlaceholder: 'Search by book title or topic', categoryLabel: 'Topic',
    allCategories: 'All topics', sortLabel: 'Sort', sortNewest: 'Recently added',
    sortTitle: 'Title (A–Z)', filterAll: 'All books', filterSaved: 'Saved',
    filterRecent: 'Continue reading', loading: 'Loading books…', backLibrary: 'Back to library',
    share: 'Share', download: 'Download', privacy: 'Privacy policy',
    featureMobile: 'Works on every device', featureMobileText: 'Read on your phone, tablet, or computer.',
    featureSave: 'Pick up where you left off', featureSaveText: 'Saved and recently opened books are remembered on this device.',
    featureSimple: 'Simple and convenient', featureSimpleText: 'Find a resource, read online, or download the file.',
    footerHome: 'Back to Islamic Official', empty: 'There are no books in the library yet.',
    noResults: 'No books match your search.', noSaved: 'You have not saved any books yet.',
    noRecent: 'No recently opened books. Choose one from the library.',
    loadError: 'Books could not be loaded. Check your connection and refresh the page.',
    fileLoading: 'Loading the book file…', fileLoadError: 'Could not load the book file:',
    read: 'Read', pdf: 'PDF document', document: 'Digital document', save: 'Save to favorites',
    removeSave: 'Remove from saved', noPreview: 'This file cannot be previewed in your browser. Download it or open it in a new tab.',
    readerTitle: 'Read book', countOne: 'book', countMany: 'books', shareCopied: 'Link copied.',
    shareError: 'Copy and share this link:', unnamed: 'Untitled book', categoryFallback: 'General',
    saveError: 'Could not save your book list on this device.',
    accountLogin: 'Sign in', accountLogout: 'Sign out', signedInAs: 'Account:',
    accountDialogTitle: 'Sign in to the library', loginRequired: 'Sign in with Google or email to download this PDF.',
    signInGoogle: 'Continue with Google', orLabel: 'or use email', emailSignIn: 'Sign in',
    emailRegister: 'Create account', emailLabel: 'Email address', passwordLabel: 'Password (at least 6 characters)',
    forgotPassword: 'Forgot password?', accountSuccess: 'You are signed in.',
    resetSent: 'A password reset link was sent to your email.', readerViewLabel: 'PDF view',
    readerFitWidth: 'Fit width', readerFitPage: 'Fit page', readerActualSize: 'Actual size (100%)',
    readerFullscreen: 'Full screen', readerDownloadNote: 'Sign in with Google or email to download the PDF.',
    readerExitFullscreen: 'Exit full screen', readerOpenTab: 'Open in new tab',
    pdfReaderError: 'The PDF reader could not start. Try opening the file in a new tab.',
    readerPaperColor: 'Page color', readerPaperWhite: 'White', readerPaperWarm: 'Warm white',
    readerPaperYellow: 'Pale yellow', readerPaperGreen: 'Pale green', readerPaperBlue: 'Pale blue',
    readerPaperGray: 'Light gray', readerPaperRose: 'Pale rose', readerPaperSepia: 'Sepia',
    readerFirstPage: 'First page', readerPreviousPage: 'Previous page', readerNextPage: 'Next page',
    readerLastPage: 'Last page', readerPageLabel: 'Page', readerResumePosition: 'Remember reading position',
    readerRotateScreen: 'Rotate screen to landscape', readerOrientationSet: 'Screen rotated to landscape.',
    readerOrientationReset: 'Screen orientation restored.', readerOrientationUnsupported: 'Automatic rotation is not supported on this device. Rotate it manually.',
    readerOrientationError: 'Allow full-screen mode to rotate the screen.',
    adminLink: 'Manage books', adminKicker: 'Administrator only', adminTitle: 'Manage books',
    adminDescription: 'Book library management is available only to the authorized account.',
    adminClose: 'Close', adminSignedOut: 'Use the administrator Google account to access this panel.',
    adminGoogle: 'Sign in with Google', adminLogout: 'Sign out', adminDenied: 'This Google account is not authorized as an administrator.',
    adminSignedIn: 'Signed in as administrator:', adminLoginError: 'Sign-in failed:',
    adminUploadTitle: 'Upload a book', adminUploadDescription: 'PDFs up to 20 MB are stored within Firestore’s free quota. A clear title and tags make them easier to find.',
    adminBookTitle: 'Book title', adminAuthor: 'Author (optional)', adminCategory: 'Topic (optional)',
    adminTags: 'Search tags (comma-separated; # is optional)', adminTagsPlaceholder: '#nurul yaqin, aqidah, islam',
    adminDescriptionField: 'Short description (optional)', adminPdfFile: 'PDF file (up to 20 MB)',
    adminUploadButton: 'Upload', adminBooksTitle: 'Uploaded books',
    adminUploadProgress: 'Uploading…', adminUploadSuccess: 'Book uploaded and added to the library.',
    adminUploadError: 'Upload failed:', adminDelete: 'Delete', adminOpen: 'Open',
    adminNoBooks: 'No books have been uploaded yet.', adminBooksError: 'Could not load the book list:',
    adminConfirmDelete: 'Delete this book from the library?', adminBadFile: 'Choose a PDF file up to 20 MB.',
    adminStorageHelp: 'PDFs are stored through Firestore within its free quota.'
  },
  ru: {
    pageTitle: 'Исламская электронная библиотека | Islamic Official', metaDescription: 'Ищите полезные исламские книги, читайте в браузере, сохраняйте и скачивайте PDF.',
    brandLabel: 'Электронная библиотека', homeLink: 'Главный сайт', languageLabel: 'Язык', eyebrow: 'Знания становятся ближе',
    heroTitle: 'Читайте, ищите и делитесь знаниями', heroDescription: 'Найдите нужную книгу, читайте с телефона или компьютера и сохраните, чтобы продолжить позже.',
    explore: 'Открыть библиотеку', collectionLabel: 'Подборка материалов', libraryTitle: 'Библиотека книг',
    libraryDescription: 'Ищите по названию или теме. Избранное и недавно открытые книги сохраняются на этом устройстве.',
    booksLabel: 'книг', searchPlaceholder: 'Поиск по названию книги или теме', categoryLabel: 'Тема',
    allCategories: 'Все темы', sortLabel: 'Сортировка', sortNewest: 'Сначала новые',
    sortTitle: 'По названию (А–Я)', filterAll: 'Все книги', filterSaved: 'Сохранённые',
    filterRecent: 'Продолжить чтение', loading: 'Загрузка книг…', backLibrary: 'Вернуться в библиотеку',
    share: 'Поделиться', download: 'Скачать', privacy: 'Политика конфиденциальности',
    featureMobile: 'Удобно на любом устройстве', featureMobileText: 'Читайте с телефона, планшета или компьютера.',
    featureSave: 'Продолжайте чтение', featureSaveText: 'Избранные и недавно открытые книги сохраняются на этом устройстве.',
    featureSimple: 'Просто и удобно', featureSimpleText: 'Найдите нужный материал, читайте онлайн или скачайте файл.',
    footerHome: 'Вернуться на сайт Islamic Official', empty: 'В библиотеке пока нет книг.',
    noResults: 'По вашему запросу книги не найдены.', noSaved: 'Вы ещё не сохраняли книги.',
    noRecent: 'Недавно открытых книг нет. Выберите книгу в библиотеке.',
    loadError: 'Не удалось загрузить книги. Проверьте подключение и обновите страницу.',
    fileLoading: 'Загрузка файла книги…', fileLoadError: 'Не удалось загрузить файл книги:',
    read: 'Читать', pdf: 'PDF-документ', document: 'Электронный документ', save: 'В избранное',
    removeSave: 'Убрать из сохранённых', noPreview: 'Этот файл нельзя открыть в браузере. Скачайте его или откройте в новой вкладке.',
    readerTitle: 'Чтение книги', countOne: 'книга', countMany: 'книг', shareCopied: 'Ссылка скопирована.',
    shareError: 'Скопируйте и отправьте эту ссылку:', unnamed: 'Книга без названия', categoryFallback: 'Общее',
    saveError: 'Не удалось сохранить список книг на этом устройстве.',
    accountLogin: 'Войти', accountLogout: 'Выйти', signedInAs: 'Аккаунт:',
    accountDialogTitle: 'Войти в библиотеку', loginRequired: 'Войдите через Google или email, чтобы скачать PDF.',
    signInGoogle: 'Продолжить с Google', orLabel: 'или по email', emailSignIn: 'Войти',
    emailRegister: 'Регистрация', emailLabel: 'Адрес электронной почты', passwordLabel: 'Пароль (не менее 6 символов)',
    forgotPassword: 'Забыли пароль?', accountSuccess: 'Вы вошли в аккаунт.',
    resetSent: 'Ссылка для сброса пароля отправлена на вашу почту.', readerViewLabel: 'Вид PDF',
    readerFitWidth: 'По ширине', readerFitPage: 'Вся страница', readerActualSize: 'Фактический размер (100%)',
    readerFullscreen: 'На весь экран', readerDownloadNote: 'Войдите через Google или email, чтобы скачать PDF.',
    readerExitFullscreen: 'Выйти из полноэкранного режима', readerOpenTab: 'Открыть в новой вкладке',
    pdfReaderError: 'Не удалось запустить просмотрщик PDF. Попробуйте открыть файл в новой вкладке.',
    readerPaperColor: 'Цвет страницы', readerPaperWhite: 'Белый', readerPaperWarm: 'Тёплый белый',
    readerPaperYellow: 'Светло-жёлтый', readerPaperGreen: 'Светло-зелёный', readerPaperBlue: 'Светло-голубой',
    readerPaperGray: 'Светло-серый', readerPaperRose: 'Светло-розовый', readerPaperSepia: 'Сепия',
    readerFirstPage: 'Первая страница', readerPreviousPage: 'Предыдущая страница', readerNextPage: 'Следующая страница',
    readerLastPage: 'Последняя страница', readerPageLabel: 'Страница', readerResumePosition: 'Запоминать страницу',
    readerRotateScreen: 'Повернуть экран горизонтально', readerOrientationSet: 'Экран повернут горизонтально.',
    readerOrientationReset: 'Ориентация экрана восстановлена.', readerOrientationUnsupported: 'Автоповорот не поддерживается. Поверните устройство вручную.',
    readerOrientationError: 'Разрешите полноэкранный режим для поворота экрана.',
    adminLink: 'Управление', adminKicker: 'Только для администратора', adminTitle: 'Управление книгами',
    adminDescription: 'Управление библиотекой доступно только разрешённой учётной записи.',
    adminClose: 'Закрыть', adminSignedOut: 'Для входа используйте Google-аккаунт администратора.',
    adminGoogle: 'Войти через Google', adminLogout: 'Выйти', adminDenied: 'Этот Google-аккаунт не имеет прав администратора.',
    adminSignedIn: 'Вход выполнен как администратор:', adminLoginError: 'Ошибка входа:',
    adminUploadTitle: 'Загрузить книгу', adminUploadDescription: 'PDF до 20 МБ хранится в пределах бесплатной квоты Firestore. Название и теги упрощают поиск.',
    adminBookTitle: 'Название книги', adminAuthor: 'Автор (необязательно)', adminCategory: 'Тема (необязательно)',
    adminTags: 'Теги для поиска (через запятую; # необязателен)', adminTagsPlaceholder: '#нур аль якин, акыдa, ислам',
    adminDescriptionField: 'Краткое описание (необязательно)', adminPdfFile: 'PDF-файл (до 20 МБ)',
    adminUploadButton: 'Загрузить', adminBooksTitle: 'Загруженные книги',
    adminUploadProgress: 'Загрузка…', adminUploadSuccess: 'Книга загружена и добавлена в библиотеку.',
    adminUploadError: 'Не удалось загрузить:', adminDelete: 'Удалить', adminOpen: 'Открыть',
    adminNoBooks: 'Книги пока не загружены.', adminBooksError: 'Не удалось загрузить список книг:',
    adminConfirmDelete: 'Удалить эту книгу из библиотеки?', adminBadFile: 'Выберите PDF-файл размером до 20 МБ.',
    adminStorageHelp: 'PDF-файлы хранятся через Firestore в пределах бесплатной квоты.'
  },
  ar: {
    pageTitle: 'المكتبة الإسلامية الرقمية | Islamic Official', metaDescription: 'ابحث عن الكتب الإسلامية واقرأها في المتصفح واحفظها ونزّل ملفات PDF.',
    brandLabel: 'المكتبة الرقمية', homeLink: 'الموقع الرئيسي', languageLabel: 'اللغة', eyebrow: 'المعرفة أقرب إليك',
    heroTitle: 'اقرأ وابحث وشارك المعرفة', heroDescription: 'اعثر على الكتاب المناسب واقرأه على هاتفك أو حاسوبك واحفظه للمتابعة لاحقًا.',
    explore: 'تصفح المكتبة', collectionLabel: 'مصادر مختارة', libraryTitle: 'مكتبة الكتب',
    libraryDescription: 'ابحث باسم الكتاب أو موضوعه. تُحفظ المفضلة والكتب المفتوحة مؤخرًا على هذا الجهاز.',
    booksLabel: 'كتاب', searchPlaceholder: 'ابحث باسم الكتاب أو موضوعه', categoryLabel: 'الموضوع',
    allCategories: 'كل الموضوعات', sortLabel: 'ترتيب', sortNewest: 'الأحدث أولًا',
    sortTitle: 'الاسم (أ–ي)', filterAll: 'كل الكتب', filterSaved: 'المحفوظات',
    filterRecent: 'متابعة القراءة', loading: 'جارٍ تحميل الكتب…', backLibrary: 'العودة إلى المكتبة',
    share: 'مشاركة', download: 'تنزيل', privacy: 'سياسة الخصوصية',
    featureMobile: 'مناسب لكل الأجهزة', featureMobileText: 'اقرأ على الهاتف أو الجهاز اللوحي أو الحاسوب.',
    featureSave: 'تابع القراءة', featureSaveText: 'تُحفظ الكتب المفضلة والمفتوحة مؤخرًا على هذا الجهاز.',
    featureSimple: 'بسيط ومريح', featureSimpleText: 'ابحث عن المصدر واقرأه عبر الإنترنت أو نزّل الملف.',
    footerHome: 'العودة إلى موقع Islamic Official', empty: 'لا توجد كتب في المكتبة حاليًا.',
    noResults: 'لم يتم العثور على كتب مطابقة لبحثك.', noSaved: 'لم تحفظ أي كتب بعد.',
    noRecent: 'لا توجد كتب مفتوحة مؤخرًا. اختر كتابًا من المكتبة.',
    loadError: 'تعذر تحميل الكتب. تحقق من الاتصال وأعد تحميل الصفحة.',
    fileLoading: 'جارٍ تحميل ملف الكتاب…', fileLoadError: 'تعذر تحميل ملف الكتاب:',
    read: 'قراءة', pdf: 'مستند PDF', document: 'مستند رقمي', save: 'حفظ في المفضلة',
    removeSave: 'إزالة من المحفوظات', noPreview: 'لا يمكن معاينة هذا الملف في المتصفح. نزّله أو افتحه في علامة تبويب جديدة.',
    readerTitle: 'قراءة الكتاب', countOne: 'كتاب', countMany: 'كتب', shareCopied: 'تم نسخ الرابط.',
    shareError: 'انسخ هذا الرابط وشاركه:', unnamed: 'كتاب بلا عنوان', categoryFallback: 'عام',
    saveError: 'تعذر حفظ قائمة الكتب على هذا الجهاز.',
    accountLogin: 'تسجيل الدخول', accountLogout: 'تسجيل الخروج', signedInAs: 'الحساب:',
    accountDialogTitle: 'تسجيل الدخول إلى المكتبة', loginRequired: 'سجّل الدخول عبر Google أو البريد الإلكتروني لتنزيل PDF.',
    signInGoogle: 'المتابعة باستخدام Google', orLabel: 'أو عبر البريد الإلكتروني', emailSignIn: 'تسجيل الدخول',
    emailRegister: 'إنشاء حساب', emailLabel: 'البريد الإلكتروني', passwordLabel: 'كلمة المرور (6 أحرف على الأقل)',
    forgotPassword: 'هل نسيت كلمة المرور؟', accountSuccess: 'تم تسجيل الدخول.',
    resetSent: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.', readerViewLabel: 'عرض PDF',
    readerFitWidth: 'ملاءمة العرض', readerFitPage: 'ملاءمة الصفحة', readerActualSize: 'الحجم الأصلي (100%)',
    readerFullscreen: 'ملء الشاشة', readerDownloadNote: 'سجّل الدخول عبر Google أو البريد الإلكتروني لتنزيل PDF.',
    readerExitFullscreen: 'الخروج من وضع ملء الشاشة', readerOpenTab: 'فتح في علامة تبويب جديدة',
    pdfReaderError: 'تعذّر تشغيل قارئ PDF. جرّب فتح الملف في علامة تبويب جديدة.',
    readerPaperColor: 'لون الصفحة', readerPaperWhite: 'أبيض', readerPaperWarm: 'أبيض دافئ',
    readerPaperYellow: 'أصفر فاتح', readerPaperGreen: 'أخضر فاتح', readerPaperBlue: 'أزرق فاتح',
    readerPaperGray: 'رمادي فاتح', readerPaperRose: 'وردي فاتح', readerPaperSepia: 'بني داكن',
    readerFirstPage: 'الصفحة الأولى', readerPreviousPage: 'الصفحة السابقة', readerNextPage: 'الصفحة التالية',
    readerLastPage: 'الصفحة الأخيرة', readerPageLabel: 'الصفحة', readerResumePosition: 'تذكّر موضع القراءة',
    readerRotateScreen: 'تدوير الشاشة أفقيًا', readerOrientationSet: 'تم تدوير الشاشة أفقيًا.',
    readerOrientationReset: 'تمت استعادة اتجاه الشاشة.', readerOrientationUnsupported: 'التدوير التلقائي غير مدعوم. أدر الجهاز يدويًا.',
    readerOrientationError: 'اسمح بوضع ملء الشاشة لتدوير الجهاز.',
    adminLink: 'الإدارة', adminKicker: 'للمسؤول فقط', adminTitle: 'إدارة الكتب',
    adminDescription: 'إدارة المكتبة متاحة للحساب المصرّح له فقط.',
    adminClose: 'إغلاق', adminSignedOut: 'استخدم حساب Google الخاص بالمسؤول للدخول.',
    adminGoogle: 'تسجيل الدخول عبر Google', adminLogout: 'تسجيل الخروج', adminDenied: 'حساب Google هذا غير مصرح له كمسؤول.',
    adminSignedIn: 'تم تسجيل الدخول كمسؤول:', adminLoginError: 'تعذر تسجيل الدخول:',
    adminUploadTitle: 'رفع كتاب', adminUploadDescription: 'يُحفظ ملف PDF حتى 20 ميغابايت ضمن الحصة المجانية في Firestore. يساعد العنوان والوسوم في البحث.',
    adminBookTitle: 'عنوان الكتاب', adminAuthor: 'المؤلف (اختياري)', adminCategory: 'الموضوع (اختياري)',
    adminTags: 'وسوم البحث (مفصولة بفواصل؛ # اختياري)', adminTagsPlaceholder: '#نور اليقين، عقيدة، إسلام',
    adminDescriptionField: 'وصف مختصر (اختياري)', adminPdfFile: 'ملف PDF (حتى 20 ميغابايت)',
    adminUploadButton: 'رفع', adminBooksTitle: 'الكتب المرفوعة',
    adminUploadProgress: 'جارٍ الرفع…', adminUploadSuccess: 'تم رفع الكتاب وإضافته إلى المكتبة.',
    adminUploadError: 'فشل الرفع:', adminDelete: 'حذف', adminOpen: 'فتح',
    adminNoBooks: 'لم يتم رفع أي كتب بعد.', adminBooksError: 'تعذر تحميل قائمة الكتب:',
    adminConfirmDelete: 'هل تريد حذف هذا الكتاب من المكتبة؟', adminBadFile: 'اختر ملف PDF لا يتجاوز 20 ميغابايت.',
    adminStorageHelp: 'يتم حفظ ملفات PDF عبر Firestore ضمن الحصة المجانية.'
  }
};

const SAVED_KEY = 'islamic-books-saved-v1';
const RECENT_KEY = 'islamic-books-recent-v1';
const PDF_PROGRESS_KEY = 'islamic-books-pdf-progress-v1';
const PDF_RESUME_KEY = 'islamic-books-pdf-resume-v1';
const PDF_PAPER_KEY = 'islamic-books-pdf-paper-v1';
const PDF_PAPER_COLORS = ['white', 'warm', 'yellow', 'green', 'blue', 'gray', 'rose', 'sepia'];
const PDF_PAPER_LABEL_KEYS = {
  white: 'readerPaperWhite',
  warm: 'readerPaperWarm',
  yellow: 'readerPaperYellow',
  green: 'readerPaperGreen',
  blue: 'readerPaperBlue',
  gray: 'readerPaperGray',
  rose: 'readerPaperRose',
  sepia: 'readerPaperSepia'
};
const storedLanguage = localStorage.getItem('site-language');
let language = Object.hasOwn(translations, storedLanguage) ? storedLanguage : 'en';
let resumePdfPosition = localStorage.getItem(PDF_RESUME_KEY) !== 'false';
const storedPaperColor = localStorage.getItem(PDF_PAPER_KEY);
let pdfPaperColor = PDF_PAPER_COLORS.includes(storedPaperColor) ? storedPaperColor : 'white';
let books = [];
let activeFilter = 'all';
let activeBook = null;
let libraryState = 'loading';
let pendingDownloadBook = null;
let emailAuthMode = 'login';
let pdfjsPromise = null;
let activePdfDocument = null;
let pdfPageObserver = null;
const pdfRenderTasks = new Map();
let pdfRenderGeneration = 0;
let currentPdfPage = 1;
let pdfScrollTimer = 0;
let orientationLocked = false;

const elements = {
  grid: document.getElementById('book-grid'),
  status: document.getElementById('library-status'),
  count: document.getElementById('book-count'),
  savedCount: document.getElementById('saved-count'),
  search: document.getElementById('book-search'),
  category: document.getElementById('category-filter'),
  sort: document.getElementById('sort-select'),
  reader: document.getElementById('reader'),
  readerTitle: document.getElementById('reader-title'),
  readerMeta: document.getElementById('reader-meta'),
  readerFrame: document.getElementById('book-frame'),
  pdfReader: document.getElementById('pdfjs-reader'),
  readerPaperOptions: document.getElementById('reader-paper-options'),
  readerViewOptions: document.getElementById('reader-view-options'),
  readerOpenFile: document.getElementById('reader-open-file'),
  readerNotice: document.getElementById('reader-notice'),
  readerDownload: document.getElementById('reader-download'),
  readerShare: document.getElementById('reader-share'),
  readerViewMode: document.getElementById('reader-view-mode'),
  readerFrameWrap: document.getElementById('reader-frame-wrap'),
  readerPageNav: document.getElementById('reader-page-nav'),
  readerPageNumber: document.getElementById('reader-page-number'),
  readerPageCount: document.getElementById('reader-page-count'),
  readerPageStatus: document.getElementById('reader-page-status'),
  readerResumePosition: document.getElementById('reader-resume-position'),
  readerFirstPage: document.getElementById('reader-first-page'),
  readerPreviousPage: document.getElementById('reader-previous-page'),
  readerNextPage: document.getElementById('reader-next-page'),
  readerLastPage: document.getElementById('reader-last-page'),
  readerRotateScreen: document.getElementById('reader-rotate-screen'),
  accountDialog: document.getElementById('account-dialog'),
  accountDialogStatus: document.getElementById('account-dialog-status')
};

function text(key) {
  return translations[language][key] || translations.uz[key] || key;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);
}

function readStorage(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value.filter((entry) => typeof entry === 'string') : [];
  } catch (error) {
    console.error(`Could not read library storage "${key}":`, error);
    return [];
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Could not save library storage "${key}":`, error);
    elements.status.textContent = text('saveError') || error.message;
  }
}

function safeBookUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function updateReaderTabLink() {
  if (!activeBook || !isPdf(activeBook) || elements.readerOpenFile.hidden) return;
  const url = new URL(location.pathname, location.origin);
  url.searchParams.set('id', activeBook.id);
  url.searchParams.set('readerFullscreen', '1');
  url.searchParams.set('readerPaper', pdfPaperColor);
  url.searchParams.set('readerView', elements.readerViewMode.value);
  if (currentPdfPage > 1) url.searchParams.set('page', String(currentPdfPage));
  elements.readerOpenFile.href = url.href;
}

function normalized(value) {
  return String(value || '').toLocaleLowerCase(language).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function setLanguage(nextLanguage) {
  language = Object.hasOwn(translations, nextLanguage) ? nextLanguage : 'uz';
  localStorage.setItem('site-language', language);
  document.documentElement.lang = language;
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-text]').forEach((element) => {
    const key = element.dataset.text;
    if (translations[language][key]) element.textContent = text(key);
  });
  document.querySelectorAll('[data-placeholder]').forEach((element) => {
    element.placeholder = text(element.dataset.placeholder);
  });
  document.getElementById('language-select').value = language;
  document.getElementById('language-select').setAttribute('aria-label', text('languageLabel') || 'Language');
  elements.readerPaperOptions.setAttribute('aria-label', text('readerPaperColor'));
  updatePaperColorOptions();
  elements.readerViewOptions.setAttribute('aria-label', text('readerViewLabel'));
  updateReaderViewOptions();
  [
    [elements.readerFirstPage, 'readerFirstPage'],
    [elements.readerPreviousPage, 'readerPreviousPage'],
    [elements.readerNextPage, 'readerNextPage'],
    [elements.readerLastPage, 'readerLastPage']
  ].forEach(([button, key]) => {
    button.setAttribute('aria-label', text(key));
    button.title = text(key);
  });
  elements.readerPageNumber.setAttribute('aria-label', text('readerPageLabel'));
  elements.readerRotateScreen.setAttribute('aria-label', text('readerRotateScreen'));
  elements.readerRotateScreen.title = text('readerRotateScreen');
  elements.readerResumePosition.checked = resumePdfPosition;
  document.getElementById('email-submit').textContent = text(emailAuthMode === 'register' ? 'emailRegister' : 'emailSignIn');
  elements.status.textContent = libraryState === 'loading'
    ? text('loading')
    : libraryState === 'error'
      ? text('loadError')
      : '';
  renderCategories();
  renderBooks();
  if (activeBook) showReader(activeBook, false, activePdfDocument ? currentPdfPage : null);
  updateAdminState(currentAdmin);
  updateMetadata();
}

function setPdfPaperColor(color) {
  if (!PDF_PAPER_COLORS.includes(color)) return;
  pdfPaperColor = color;
  elements.pdfReader.dataset.paper = color;
  updatePaperColorOptions();
  try {
    localStorage.setItem(PDF_PAPER_KEY, color);
  } catch (error) {
    console.error('Could not save the PDF page color preference:', error);
  }
  updateReaderTabLink();
}

function updatePaperColorOptions() {
  elements.readerPaperOptions.querySelectorAll('[data-paper-color]').forEach((button) => {
    const color = button.dataset.paperColor;
    const selected = color === pdfPaperColor;
    button.setAttribute('aria-checked', String(selected));
    button.tabIndex = selected ? 0 : -1;
    button.title = text(PDF_PAPER_LABEL_KEYS[color]);
    button.setAttribute('aria-label', `${text('readerPaperColor')}: ${text(PDF_PAPER_LABEL_KEYS[color])}`);
  });
}

function updateReaderViewOptions(mode = elements.readerViewMode.value) {
  elements.readerViewOptions.querySelectorAll('[data-reader-view]').forEach((button) => {
    const selected = button.dataset.readerView === mode;
    button.setAttribute('aria-checked', String(selected));
    button.tabIndex = selected ? 0 : -1;
    button.title = button.querySelector('[data-text]').textContent;
  });
  updateReaderTabLink();
}

function updateMetadata() {
  const canonicalUrl = new URL('/', 'https://books.islamicofficial.com');
  const title = activeBook ? `${activeBook.title || text('unnamed')} | ${text('readerTitle')} | Islamic Official` : text('pageTitle');
  document.title = title;
  const description = document.querySelector('meta[name="description"]');
  const descriptionValue = activeBook
    ? `${activeBook.description || `${activeBook.title || text('unnamed')} ${isPdf(activeBook) ? 'PDF' : ''} ${activeBook.author ? `— ${activeBook.author}.` : ''} ${text('readerTitle')}. ${text('pageTitle')}.`}`.slice(0, 300)
    : text('metaDescription');
  if (description) description.content = descriptionValue;
  const openGraphTitle = document.querySelector('meta[property="og:title"]');
  const openGraphDescription = document.querySelector('meta[property="og:description"]');
  if (openGraphTitle) openGraphTitle.content = title;
  if (openGraphDescription) openGraphDescription.content = descriptionValue;
  const canonical = document.querySelector('link[rel="canonical"]');
  if (activeBook) canonicalUrl.searchParams.set('id', activeBook.id);
  if (canonical) canonical.href = canonicalUrl.href;
  const openGraphUrl = document.querySelector('meta[property="og:url"]');
  if (openGraphUrl) openGraphUrl.content = canonicalUrl.href;
  const keywords = document.querySelector('meta[name="keywords"]');
  if (keywords) {
    keywords.dataset.defaults ||= keywords.content;
    if (activeBook) {
      const bookTerms = [activeBook.title, activeBook.author, activeBook.category, ...(Array.isArray(activeBook.tags) ? activeBook.tags : [])]
        .filter(Boolean).join(', ');
      keywords.content = `${bookTerms}, PDF, Islamic book, islomiy kitob, ${keywords.dataset.defaults}`;
    } else {
      keywords.content = keywords.dataset.defaults;
    }
  }
  const structuredData = document.getElementById('book-structured-data');
  if (structuredData) {
    structuredData.textContent = activeBook ? JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Book',
      name: activeBook.title || text('unnamed'),
      ...(activeBook.author ? { author: { '@type': 'Person', name: activeBook.author } } : {}),
      ...(activeBook.description ? { description: activeBook.description } : {}),
      bookFormat: 'https://schema.org/EBook',
      encodingFormat: isPdf(activeBook) ? 'application/pdf' : activeBook.contentType || 'application/octet-stream',
      inLanguage: document.documentElement.lang,
      url: canonicalUrl.href,
      isAccessibleForFree: true,
      publisher: { '@type': 'Organization', name: 'Islamic Official' }
    }) : '';
  }
}

function isPdf(book) {
  if (book.contentType === 'application/pdf') return true;
  try {
    return decodeURIComponent(new URL(book.url).pathname).toLowerCase().endsWith('.pdf');
  } catch {
    return false;
  }
}

function formatBytes(bytes) {
  const size = Number(bytes);
  if (!Number.isFinite(size) || size <= 0) return '';
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function getFilteredBooks() {
  const query = normalized(elements.search.value.trim());
  const category = elements.category.value;
  const saved = readStorage(SAVED_KEY);
  const recent = readStorage(RECENT_KEY);
  let results = books.filter((book) => {
    const bookIdentity = normalized([book.title, book.fileName].join(' ')).replace(/\s+/g, '');
    const searchAliases = [];
    if (bookIdentity.includes('nurulyaqin') || bookIdentity.includes('nurulyakin')) {
      searchAliases.push('nurul yaqin nurulyaqin nurul yakin nuril yaqin nurilyaqin nuril yakin nurul yaqeen');
    }
    if (bookIdentity.includes('faroiz') || bookIdentity.includes('faraiz') || bookIdentity.includes('faroyiz')) {
      searchAliases.push('faroiz faroyiz faraiz faroiz faraiz');
    }
    const searchable = normalized([
      book.title, book.category, book.author, book.description, book.fileName,
      ...(Array.isArray(book.tags) ? book.tags : []),
      ...searchAliases,
      isPdf(book) ? 'PDF pdf portable document'
        : book.contentType === 'application/epub+zip' ? 'EPUB ebook' : ''
    ].join(' '));
    const matchesQuery = !query || query.split(/\s+/).every((term) => searchable.includes(term));
    return matchesQuery
      && (category === 'all' || book.category === category)
      && (activeFilter !== 'saved' || saved.includes(book.id))
      && (activeFilter !== 'recent' || recent.includes(book.id));
  });
  if (elements.sort.value === 'title') {
    results.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), language));
  } else {
    results.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }
  if (activeFilter === 'recent') {
    results.sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id));
  }
  return results;
}

function renderCategories() {
  const selected = elements.category.value || 'all';
  const categories = [...new Set(books.map((book) => String(book.category || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, language));
  elements.category.replaceChildren();
  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = text('allCategories');
  elements.category.append(all);
  categories.forEach((category) => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    elements.category.append(option);
  });
  elements.category.value = categories.includes(selected) ? selected : 'all';
}

function renderBooks() {
  const saved = readStorage(SAVED_KEY);
  const results = getFilteredBooks();
  elements.count.textContent = String(books.length);
  elements.savedCount.textContent = String(saved.length);
  elements.grid.replaceChildren();
  if (!books.length) {
    elements.grid.innerHTML = `<div class="empty-state"><i class="bi bi-journal-bookmark" aria-hidden="true"></i>${text('empty')}</div>`;
    return;
  }
  if (!results.length) {
    const message = activeFilter === 'saved' ? text('noSaved') : activeFilter === 'recent' ? text('noRecent') : text('noResults');
    elements.grid.innerHTML = `<div class="empty-state"><i class="bi bi-search" aria-hidden="true"></i>${message}</div>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  results.forEach((book) => {
    const url = safeBookUrl(book.url);
    const isSaved = saved.includes(book.id);
    const pdf = isPdf(book);
    const card = document.createElement('article');
    card.className = 'book-card';
    card.innerHTML = `
      <div class="book-card-top">
        <span class="book-cover"><i class="bi ${pdf ? 'bi-file-earmark-pdf' : 'bi-file-earmark-text'}" aria-hidden="true"></i></span>
        <button class="favorite-button ${isSaved ? 'is-saved' : ''}" type="button" data-favorite="${escapeHtml(book.id)}" aria-label="${escapeHtml(text(isSaved ? 'removeSave' : 'save'))}" aria-pressed="${isSaved}">
          <i class="bi ${isSaved ? 'bi-bookmark-heart-fill' : 'bi-bookmark-heart'}" aria-hidden="true"></i>
        </button>
      </div>
      <h3>${escapeHtml(book.title || text('unnamed'))}</h3>
      ${book.category ? `<span class="book-category">${escapeHtml(book.category)}</span>` : ''}
      ${Array.isArray(book.tags) && book.tags.length ? `<div class="book-tags" aria-label="${escapeHtml(text('adminTags'))}">${book.tags.map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('')}</div>` : ''}
      <div class="book-card-footer"><span class="format-label"><i class="bi bi-file-earmark" aria-hidden="true"></i>${pdf ? text('pdf') : text('document')}</span><span>${escapeHtml(formatBytes(book.fileSize))}</span></div>
      <div class="book-card-actions">
        <button class="card-button read-button" type="button" data-read="${escapeHtml(book.id)}"><i class="bi bi-book-half" aria-hidden="true"></i>${text('read')}</button>
        ${(url || book.storageType === 'firestore-chunks')
          ? `<button class="card-button download-button" type="button" data-download="${escapeHtml(book.id)}"><i class="bi bi-download" aria-hidden="true"></i>${text('download')}</button>`
          : ''}
      </div>`;
    fragment.append(card);
  });
  elements.grid.append(fragment);
}

function updateBookQuery(bookId, page = 1, replace = false) {
  const url = new URL(location.href);
  if (bookId) {
    url.searchParams.set('id', bookId);
    if (resumePdfPosition && page > 1) url.searchParams.set('page', String(page));
    else url.searchParams.delete('page');
  } else {
    url.searchParams.delete('id');
    url.searchParams.delete('page');
  }
  if (replace) history.replaceState({}, '', url);
  else history.pushState({}, '', url);
}

function readPdfProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(PDF_PROGRESS_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch (error) {
    console.error('Could not read saved PDF reading positions:', error);
    return {};
  }
}

function savedPdfPage(bookId) {
  const page = Number(readPdfProgress()[bookId]);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function initialPdfPage(book, updateUrl) {
  const url = new URL(location.href);
  const isDirectPageLink = !updateUrl && url.searchParams.get('id') === book.id;
  if (isDirectPageLink) {
    const requestedPage = Number(url.searchParams.get('page'));
    if (Number.isInteger(requestedPage) && requestedPage > 0) return requestedPage;
  }
  return resumePdfPosition ? savedPdfPage(book.id) : 1;
}

function savePdfPage(bookId, page) {
  const progress = readPdfProgress();
  progress[bookId] = page;
  const recentIds = Object.keys(progress).filter((id) => id !== bookId).slice(-99);
  const boundedProgress = Object.fromEntries(recentIds.map((id) => [id, progress[id]]));
  boundedProgress[bookId] = page;
  try {
    localStorage.setItem(PDF_PROGRESS_KEY, JSON.stringify(boundedProgress));
  } catch (error) {
    console.error('Could not save the PDF reading position:', error);
  }
}

function setCurrentPdfPage(page, updateUrl = true) {
  if (!activePdfDocument) return;
  currentPdfPage = Math.max(1, Math.min(activePdfDocument.numPages, Math.trunc(page) || 1));
  elements.readerPageNumber.value = String(currentPdfPage);
  elements.readerPageNumber.max = String(activePdfDocument.numPages);
  elements.readerPageCount.textContent = String(activePdfDocument.numPages);
  elements.readerFirstPage.disabled = currentPdfPage === 1;
  elements.readerPreviousPage.disabled = currentPdfPage === 1;
  elements.readerNextPage.disabled = currentPdfPage === activePdfDocument.numPages;
  elements.readerLastPage.disabled = currentPdfPage === activePdfDocument.numPages;
  if (resumePdfPosition && activeBook) {
    savePdfPage(activeBook.id, currentPdfPage);
  }
  if (updateUrl && activeBook) {
    updateBookQuery(activeBook.id, currentPdfPage, true);
  }
  updateReaderTabLink();
}

function goToPdfPage(page, behavior = null) {
  if (!activePdfDocument) return;
  const targetPage = Math.max(1, Math.min(activePdfDocument.numPages, Math.trunc(Number(page)) || 1));
  const pageElement = elements.pdfReader.querySelector(`[data-page-number="${targetPage}"]`);
  if (!pageElement) return;
  const readerBounds = elements.pdfReader.getBoundingClientRect();
  const pageBounds = pageElement.getBoundingClientRect();
  elements.pdfReader.scrollTo({
    top: elements.pdfReader.scrollTop + pageBounds.top - readerBounds.top,
    behavior: behavior || (Math.abs(targetPage - currentPdfPage) <= 2 ? 'smooth' : 'auto')
  });
  setCurrentPdfPage(targetPage);
  renderPdfPage(targetPage, pageElement, pdfRenderGeneration);
}

function updatePdfPageFromScroll() {
  if (!activePdfDocument || !activeBook) return;
  const readerBounds = elements.pdfReader.getBoundingClientRect();
  const center = readerBounds.top + readerBounds.height / 2;
  let closestPage = currentPdfPage;
  let closestDistance = Infinity;
  elements.pdfReader.querySelectorAll('.pdfjs-page').forEach((pageElement) => {
    const bounds = pageElement.getBoundingClientRect();
    const distance = Math.abs((bounds.top + bounds.height / 2) - center);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestPage = Number(pageElement.dataset.pageNumber);
    }
  });
  if (closestPage !== currentPdfPage) setCurrentPdfPage(closestPage);
}

function showReaderPageStatus(message) {
  elements.readerPageStatus.textContent = message;
  elements.readerPageStatus.hidden = false;
  window.clearTimeout(showReaderPageStatus.timeout);
  showReaderPageStatus.timeout = window.setTimeout(() => {
    elements.readerPageStatus.hidden = true;
  }, 5000);
}

async function bookFileUrl(book) {
  const directUrl = safeBookUrl(book.url);
  if (directUrl) return directUrl;
  if (book.storageType !== 'firestore-chunks') return '';
  if (!book.fileUrlPromise) {
    book.fileUrlPromise = loadBookFile(db, book).then((url) => {
      book.objectUrl = url;
      return url;
    }).finally(() => {
      delete book.fileUrlPromise;
    });
  }
  await book.fileUrlPromise;
  return book.objectUrl;
}

async function downloadBook(book) {
  if (!auth.currentUser) {
    pendingDownloadBook = book;
    elements.accountDialogStatus.textContent = text('loginRequired');
    elements.accountDialog.showModal();
    document.getElementById('account-email').focus();
    return;
  }
  try {
    const url = await bookFileUrl(book);
    if (!url) throw new Error(text('loadError'));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${String(book.title || text('unnamed')).replace(/[\\/:*?"<>|]/g, '-')}${isPdf(book) ? '.pdf' : ''}`;
    if (!url.startsWith('blob:')) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    }
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    if (book.objectUrl && activeBook?.id !== book.id) {
      window.setTimeout(() => {
        URL.revokeObjectURL(book.objectUrl);
        delete book.objectUrl;
      }, 60000);
    }
  } catch (error) {
    console.error('Book download failed:', error);
    elements.status.textContent = `${text('fileLoadError')} ${error.message}`;
  }
}

async function showReader(book, updateUrl = true, requestedPage = null) {
  resetPdfReader();
  const startPage = requestedPage || initialPdfPage(book, updateUrl);
  activeBook = book;
  currentPdfPage = startPage;
  if (updateUrl) updateBookQuery(book.id, startPage);
  const recent = readStorage(RECENT_KEY).filter((id) => id !== book.id);
  writeStorage(RECENT_KEY, [book.id, ...recent].slice(0, 30));
  elements.reader.hidden = false;
  elements.readerTitle.textContent = book.title || text('unnamed');
  elements.readerMeta.textContent = [book.category, isPdf(book) ? text('pdf') : text('document')].filter(Boolean).join(' · ');
  elements.readerFrameWrap.hidden = true;
  elements.readerFrame.hidden = true;
  elements.pdfReader.hidden = true;
  elements.readerPageNav.hidden = true;
  elements.readerPageStatus.hidden = true;
  elements.readerOpenFile.hidden = true;
  elements.readerNotice.hidden = false;
  elements.readerNotice.textContent = book.storageType === 'firestore-chunks'
    ? text('fileLoading')
    : text('noPreview');
  elements.readerShare.onclick = () => shareBook(book);
  renderBooks();
  updateMetadata();
  if (updateUrl) elements.reader.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const url = await bookFileUrl(book);
    if (activeBook?.id !== book.id) {
      if (book.objectUrl) {
        URL.revokeObjectURL(book.objectUrl);
        delete book.objectUrl;
      }
      return;
    }
    if (!url) throw new Error(text('loadError'));
    if (isPdf(book)) {
      elements.readerNotice.hidden = true;
      elements.readerFrameWrap.hidden = false;
      elements.readerFrame.title = `${book.title || text('unnamed')} — ${text('readerTitle')}`;
      elements.readerOpenFile.hidden = false;
      updateReaderTabLink();
      try {
        await renderPdfDocument(url, book);
        if (activeBook?.id !== book.id) return;
        elements.pdfReader.hidden = false;
        elements.readerPageNav.hidden = false;
        goToPdfPage(startPage, 'auto');
      } catch (error) {
        if (activeBook?.id !== book.id) return;
        console.error('PDF.js reader unavailable; using the browser PDF viewer:', error);
        elements.readerNotice.hidden = false;
        elements.readerNotice.textContent = text('pdfReaderError');
        elements.readerFrame.hidden = false;
        elements.readerPageNav.hidden = true;
        setReaderView(elements.readerViewMode.value, url);
      }
    } else {
      elements.readerNotice.hidden = false;
      elements.readerNotice.textContent = text('noPreview');
    }
    elements.status.textContent = '';
  } catch (error) {
    if (activeBook?.id !== book.id) return;
    console.error('Book reader load failed:', error);
    elements.readerNotice.hidden = false;
    elements.readerNotice.textContent = `${text('fileLoadError')} ${error.message}`;
  }
}

function setReaderView(mode, url = activeBook?.objectUrl || safeBookUrl(activeBook?.url)) {
  elements.readerViewMode.value = mode;
  updateReaderViewOptions(mode);
  if (!activeBook || !isPdf(activeBook) || !url) return;
  const view = mode === 'page' ? 'Fit' : mode === 'actual' ? '' : 'FitH';
  elements.readerFrame.src = `${url}#toolbar=0&navpanes=0${view ? `&view=${view}` : '&zoom=100'}`;
  if (activePdfDocument) renderPdfPages();
}

function loadPdfJs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs')
      .then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';
        return pdfjs;
    }).catch((error) => {
      pdfjsPromise = null;
      throw error;
    });
  }
  return pdfjsPromise;
}

function resetPdfReader() {
  pdfRenderGeneration += 1;
  pdfPageObserver?.disconnect();
  pdfPageObserver = null;
  for (const task of pdfRenderTasks.values()) task.cancel?.();
  pdfRenderTasks.clear();
  if (activePdfDocument) {
    activePdfDocument.destroy().catch((error) => console.error('Could not close PDF document:', error));
    activePdfDocument = null;
  }
  elements.pdfReader.replaceChildren();
}

async function renderPdfDocument(url, book) {
  const pdfjs = await loadPdfJs();
  const loadingTask = pdfjs.getDocument({ url });
  const pdf = await loadingTask.promise;
  if (activeBook?.id !== book.id) {
    await pdf.destroy();
    return;
  }
  activePdfDocument = pdf;
  elements.pdfReader.replaceChildren();
  const pageElements = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdfjs-page';
    pageContainer.dataset.pageNumber = String(pageNumber);
    pageContainer.setAttribute('aria-label', `${pageNumber} / ${pdf.numPages}`);
    elements.pdfReader.append(pageContainer);
    pageElements.push(pageContainer);
  }
  if ('IntersectionObserver' in window) {
    pdfPageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          renderPdfPage(Number(entry.target.dataset.pageNumber), entry.target, pdfRenderGeneration);
        } else {
          unloadPdfPage(entry.target);
        }
      });
    }, { root: elements.pdfReader, rootMargin: '700px 0px' });
    pageElements.forEach((page) => pdfPageObserver.observe(page));
  } else {
    pageElements.forEach((page, index) => {
      if (index < 3) renderPdfPage(index + 1, page, pdfRenderGeneration);
    });
  }
}

function unloadPdfPage(container) {
  const pageNumber = Number(container.dataset.pageNumber);
  if (pageNumber === currentPdfPage) return;
  const request = pdfRenderTasks.get(pageNumber);
  if (request) {
    request.abandoned = true;
    request.cancel?.();
  }
  const canvas = container.querySelector('canvas');
  if (canvas) {
    canvas.width = 0;
    canvas.height = 0;
    container.replaceChildren();
    container.dataset.rendered = '';
  }
}

function renderPdfPages() {
  if (!activePdfDocument) return;
  const pages = [...elements.pdfReader.querySelectorAll('.pdfjs-page')];
  pdfRenderGeneration += 1;
  for (const task of pdfRenderTasks.values()) task.cancel?.();
  pdfRenderTasks.clear();
  pages.forEach((page) => {
    page.replaceChildren();
    page.dataset.rendered = '';
  });
  pages.forEach((page, index) => {
    const bounds = page.getBoundingClientRect();
    const readerBounds = elements.pdfReader.getBoundingClientRect();
    if (bounds.bottom >= readerBounds.top - 700 && bounds.top <= readerBounds.bottom + 700) {
      renderPdfPage(index + 1, page, pdfRenderGeneration);
    }
  });
}

async function renderPdfPage(pageNumber, container, generation) {
  if (!activePdfDocument || container.dataset.rendered === 'true' || pdfRenderTasks.has(pageNumber)) return;
  const request = { abandoned: false, cancel: null };
  pdfRenderTasks.set(pageNumber, request);
  try {
    const page = await activePdfDocument.getPage(pageNumber);
    if (!activePdfDocument || request.abandoned || generation !== pdfRenderGeneration || !container.isConnected) return;
    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(240, elements.readerFrameWrap.clientWidth - 28);
    const availableHeight = Math.max(320, elements.readerFrameWrap.clientHeight - 28);
    const mode = elements.readerViewMode.value;
    const fitWidthScale = availableWidth / baseViewport.width;
    const scale = mode === 'actual'
      ? 1
      : mode === 'page'
        ? Math.min(fitWidthScale, availableHeight / baseViewport.height)
        : fitWidthScale;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas is not available');
    const outputScale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.ceil(viewport.width * outputScale);
    canvas.height = Math.ceil(viewport.height * outputScale);
    canvas.style.width = `${Math.ceil(viewport.width)}px`;
    canvas.style.height = `${Math.ceil(viewport.height)}px`;
    const paper = document.createElement('div');
    paper.className = 'pdfjs-page-canvas';
    paper.append(canvas);
    container.replaceChildren(paper);
    const renderTask = page.render({
      canvasContext: context,
      viewport,
      transform: outputScale === 1 ? null : [outputScale, 0, 0, outputScale, 0, 0],
      background: '#ffffff'
    });
    request.cancel = () => renderTask.cancel();
    await renderTask.promise;
    if (generation === pdfRenderGeneration) container.dataset.rendered = 'true';
  } catch (error) {
    if (error.name !== 'RenderingCancelledException') {
      console.error(`Could not render PDF page ${pageNumber}:`, error);
      if (activeBook && activePdfDocument) {
        elements.readerNotice.hidden = false;
        elements.readerNotice.textContent = text('pdfReaderError');
        elements.pdfReader.hidden = true;
        elements.readerFrame.hidden = false;
        activePdfDocument.destroy().catch((destroyError) => console.error('Could not close failed PDF reader:', destroyError));
        activePdfDocument = null;
        for (const task of pdfRenderTasks.values()) task.cancel?.();
        pdfRenderTasks.clear();
        setReaderView(elements.readerViewMode.value);
      }
    }
  } finally {
    if (pdfRenderTasks.get(pageNumber) === request) pdfRenderTasks.delete(pageNumber);
  }
}

function closeReader(updateUrl = true) {
  resetPdfReader();
  if (orientationLocked) {
    screen.orientation.unlock();
    orientationLocked = false;
  }
  if (document.fullscreenElement) {
    document.exitFullscreen().catch((error) => console.error('Could not exit reader fullscreen:', error));
  }
  if (activeBook?.objectUrl) {
    URL.revokeObjectURL(activeBook.objectUrl);
    delete activeBook.objectUrl;
  }
  activeBook = null;
  elements.reader.hidden = true;
  elements.readerPageNav.hidden = true;
  elements.readerPageStatus.hidden = true;
  setReaderFullscreen(false);
  elements.readerFrame.src = 'about:blank';
  elements.readerFrame.hidden = true;
  elements.readerOpenFile.hidden = true;
  if (updateUrl) updateBookQuery('');
  updateMetadata();
  renderBooks();
}

function setReaderFullscreen(isFullscreen) {
  elements.reader.classList.toggle('is-fullscreen', isFullscreen);
  document.body.classList.toggle('reader-fullscreen-open', isFullscreen);
  const pageUrl = new URL(location.href);
  if (isFullscreen) pageUrl.searchParams.set('readerFullscreen', '1');
  else pageUrl.searchParams.delete('readerFullscreen');
  if (pageUrl.href !== location.href) history.replaceState(history.state, '', pageUrl);
  const button = document.getElementById('reader-fullscreen');
  button.setAttribute('aria-pressed', String(isFullscreen));
  button.innerHTML = `<i class="bi ${isFullscreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}" aria-hidden="true"></i><span data-text="reader${isFullscreen ? 'ExitFullscreen' : 'Fullscreen'}">${text(isFullscreen ? 'readerExitFullscreen' : 'readerFullscreen')}</span>`;
}

async function shareBook(book) {
  const shareUrl = new URL('/', location.origin);
  shareUrl.searchParams.set('id', book.id);
  if (resumePdfPosition && activeBook?.id === book.id && currentPdfPage > 1) {
    shareUrl.searchParams.set('page', String(currentPdfPage));
  }
  const shareData = { title: book.title || text('unnamed'), text: 'Islamic Official elektron kutubxonasi', url: shareUrl.href };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error('Native book sharing failed:', error);
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl.href);
    elements.status.textContent = text('shareCopied');
    window.setTimeout(() => { if (elements.status.textContent === text('shareCopied')) elements.status.textContent = ''; }, 3000);
  } catch (error) {
    console.error('Could not copy the book link:', error);
    window.prompt(text('shareError'), shareUrl.href);
  }
}

function toggleSaved(bookId) {
  const saved = readStorage(SAVED_KEY);
  writeStorage(SAVED_KEY, saved.includes(bookId) ? saved.filter((id) => id !== bookId) : [bookId, ...saved]);
  renderBooks();
}

function setAdminStatus(message, isError = false) {
  const status = document.getElementById('admin-upload-status');
  status.textContent = message;
  status.classList.toggle('is-error', isError);
  status.classList.toggle('is-success', !isError && Boolean(message));
}

function firebaseErrorMessage(error) {
  const code = error?.code ? `${error.code}: ` : '';
  return `${code}${error?.message || String(error)}`;
}

function renderAdminBooks() {
  const list = document.getElementById('admin-books-list');
  if (!currentAdmin || currentAdmin.email?.toLowerCase() !== adminEmail) return;
  list.replaceChildren();
  if (!books.length) {
    list.textContent = text('adminNoBooks');
    return;
  }
  [...books]
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .forEach((book) => {
      const row = document.createElement('article');
      row.className = 'admin-book-row';
      const details = document.createElement('div');
      details.className = 'admin-book-details';
      const title = document.createElement('strong');
      title.textContent = book.title || text('unnamed');
      const meta = document.createElement('span');
      meta.textContent = [book.category, ...(Array.isArray(book.tags) ? book.tags.map((tag) => `#${tag}`) : [])]
        .filter(Boolean).join(' · ');
      details.append(title, meta);
      row.append(details);
      const url = safeBookUrl(book.url);
      if (url || book.storageType === 'firestore-chunks') {
        const open = document.createElement('a');
        open.className = 'secondary-button';
        open.href = url || `/?id=${encodeURIComponent(book.id)}`;
        open.target = '_blank';
        open.rel = 'noopener noreferrer';
        open.textContent = text('adminOpen');
        row.append(open);
      }
      list.append(row);
    });
}

function updateAdminState(user) {
  currentAdmin = user;
  const isAdmin = Boolean(user && user.email?.trim().toLowerCase() === adminEmail);
  const loginButton = document.getElementById('account-login');
  const logoutButton = document.getElementById('account-logout');
  const accountName = document.getElementById('account-name');
  const accountStatus = document.getElementById('account-status');
  const adminButton = document.getElementById('admin-open');
  const adminPanel = document.getElementById('admin-panel');
  const tools = document.getElementById('admin-tools');
  loginButton.hidden = Boolean(user);
  logoutButton.hidden = !user;
  accountName.hidden = !user;
  accountName.textContent = user
    ? `${text('signedInAs')} ${user.displayName || user.email || ''}`
    : '';
  adminButton.hidden = !isAdmin;
  tools.hidden = !isAdmin;
  if (!isAdmin) adminPanel.hidden = true;
  accountStatus.hidden = true;
  accountStatus.textContent = '';

  if (isAdmin) {
    renderAdminBooks();
  }
  if (user && pendingDownloadBook) {
    const book = pendingDownloadBook;
    pendingDownloadBook = null;
    window.setTimeout(() => downloadBook(book), 0);
  }
}

function parseBookTags(value) {
  return [...new Set(value.split(',')
    .map((tag) => tag.trim().replace(/^#+/, '').replace(/\s+/g, ' '))
    .filter(Boolean)
    .map((tag) => tag.slice(0, 40)))].slice(0, 10);
}

async function uploadAdminBook(event) {
  event.preventDefault();
  if (uploadInProgress) return;
  if (!currentAdmin || currentAdmin.email?.toLowerCase() !== adminEmail) {
    setAdminStatus(text('adminDenied'), true);
    return;
  }

  const form = event.currentTarget;
  const file = document.getElementById('admin-book-file').files?.[0];
  const title = document.getElementById('admin-book-title').value.trim();
  const tags = parseBookTags(document.getElementById('admin-book-tags').value);
  if (!title || !file) return;
  if (!file.name.toLowerCase().endsWith('.pdf') || file.size <= 0 || file.size > 20 * 1024 * 1024) {
    setAdminStatus(text('adminBadFile'), true);
    return;
  }

  uploadInProgress = true;
  const button = document.getElementById('admin-upload-button');
  const progress = document.getElementById('admin-upload-progress');
  button.disabled = true;
  progress.hidden = false;
  progress.value = 0;
  setAdminStatus(text('adminUploadProgress'));

  try {
    await uploadBookFile(db, file, {
      title,
      author: document.getElementById('admin-book-author').value.trim(),
      category: document.getElementById('admin-book-category').value.trim(),
      tags,
      description: document.getElementById('admin-book-description').value.trim(),
      contentType: 'application/pdf'
    }, (completed, total) => {
      progress.value = total ? (completed / total) * 100 : 0;
      setAdminStatus(`${text('adminUploadProgress')} (${Math.floor(progress.value)}%)`);
    });
    await loadBooks();
    renderAdminBooks();
    form.reset();
    setAdminStatus(text('adminUploadSuccess'));
  } catch (error) {
    console.error('Admin PDF upload failed:', error);
    let message = `${text('adminUploadError')} ${firebaseErrorMessage(error)}`;
    if (error.cleanupError) message += `; fayl bo‘laklarini tozalashda xatolik: ${firebaseErrorMessage(error.cleanupError)}`;
    setAdminStatus(message, true);
  } finally {
    uploadInProgress = false;
    button.disabled = false;
    progress.hidden = true;
  }
}

document.getElementById('admin-open').addEventListener('click', () => {
  if (!currentAdmin || currentAdmin.email?.trim().toLowerCase() !== adminEmail) return;
  document.getElementById('admin-panel').hidden = false;
  document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
document.getElementById('admin-close').addEventListener('click', () => {
  document.getElementById('admin-panel').hidden = true;
});
function setAccountDialogStatus(message, isError = false) {
  elements.accountDialogStatus.textContent = message;
  elements.accountDialogStatus.classList.toggle('is-error', isError);
}

function openAccountDialog() {
  setAccountDialogStatus(pendingDownloadBook ? text('loginRequired') : '');
  if (!elements.accountDialog.open) elements.accountDialog.showModal();
}

document.getElementById('account-login').addEventListener('click', openAccountDialog);
document.getElementById('google-sign-in').addEventListener('click', async (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  setAccountDialogStatus(text('adminGoogle'));
  try {
    await signInWithPopup(auth, googleProvider);
    elements.accountDialog.close();
  } catch (error) {
    console.error('Books Google sign-in failed:', error);
    setAccountDialogStatus(`${text('adminLoginError')} ${firebaseErrorMessage(error)}`, true);
  } finally {
    button.disabled = false;
  }
});
document.querySelectorAll('[data-email-mode]').forEach((button) => {
  button.addEventListener('click', () => {
    emailAuthMode = button.dataset.emailMode;
    document.querySelectorAll('[data-email-mode]').forEach((item) => item.classList.toggle('active', item === button));
    document.getElementById('account-password').autocomplete = emailAuthMode === 'register' ? 'new-password' : 'current-password';
    document.getElementById('email-submit').textContent = text(emailAuthMode === 'register' ? 'emailRegister' : 'emailSignIn');
    document.getElementById('password-reset').hidden = emailAuthMode === 'register';
    setAccountDialogStatus('');
  });
});
document.getElementById('account-email-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = document.getElementById('email-submit');
  const email = document.getElementById('account-email').value.trim();
  const password = document.getElementById('account-password').value;
  submitButton.disabled = true;
  setAccountDialogStatus(emailAuthMode === 'register' ? text('emailRegister') : text('emailSignIn'));
  try {
    if (emailAuthMode === 'register') await createUserWithEmailAndPassword(auth, email, password);
    else await signInWithEmailAndPassword(auth, email, password);
    elements.accountDialog.close();
    setAccountDialogStatus('');
  } catch (error) {
    console.error('Books email authentication failed:', error);
    setAccountDialogStatus(`${text('adminLoginError')} ${firebaseErrorMessage(error)}`, true);
  } finally {
    submitButton.disabled = false;
  }
});
document.getElementById('password-reset').addEventListener('click', async () => {
  const email = document.getElementById('account-email').value.trim();
  if (!email) {
    document.getElementById('account-email').focus();
    setAccountDialogStatus(text('emailLabel'), true);
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    setAccountDialogStatus(text('resetSent'));
  } catch (error) {
    console.error('Books password reset failed:', error);
    setAccountDialogStatus(`${text('adminLoginError')} ${firebaseErrorMessage(error)}`, true);
  }
});
document.getElementById('account-logout').addEventListener('click', async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Books account sign-out failed:', error);
    const status = document.getElementById('account-status');
    status.hidden = false;
    status.textContent = `${text('adminLoginError')} ${firebaseErrorMessage(error)}`;
  }
});
document.getElementById('admin-upload-form').addEventListener('submit', uploadAdminBook);
onAuthStateChanged(auth, updateAdminState, (error) => {
  console.error('Books authentication state failed:', error);
  const status = document.getElementById('account-status');
  status.hidden = false;
  status.textContent = `${text('adminLoginError')} ${firebaseErrorMessage(error)}`;
});

document.getElementById('language-select').addEventListener('change', (event) => setLanguage(event.target.value));
document.getElementById('theme-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('books-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-toggle').innerHTML = `<i class="bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}" aria-hidden="true"></i>`;
});
document.addEventListener('keydown', (event) => {
  const target = event.target;
  if (event.key === '/' && !event.ctrlKey && !event.metaKey
    && !(target instanceof HTMLElement && (target.matches('input, textarea, select, [contenteditable="true"]')))) {
    event.preventDefault();
    elements.search.focus();
  } else if (event.key === 'Escape' && document.activeElement === elements.search) {
    elements.search.value = '';
    renderBooks();
  }
});
elements.search.addEventListener('input', renderBooks);
elements.category.addEventListener('change', renderBooks);
elements.sort.addEventListener('change', renderBooks);
elements.grid.addEventListener('click', (event) => {
  const favoriteButton = event.target.closest('[data-favorite]');
  if (favoriteButton) {
    toggleSaved(favoriteButton.dataset.favorite);
    return;
  }
  const downloadButton = event.target.closest('[data-download]');
  if (downloadButton) {
    const book = books.find((item) => item.id === downloadButton.dataset.download);
    if (book) downloadBook(book);
    return;
  }
  const readButton = event.target.closest('[data-read]');
  if (readButton) {
    const book = books.find((item) => item.id === readButton.dataset.read);
    if (book) showReader(book);
  }
});
document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
    renderBooks();
  });
});
document.getElementById('back-to-library').addEventListener('click', (event) => {
  event.preventDefault();
  closeReader();
  document.getElementById('library').scrollIntoView({ behavior: 'smooth' });
});
elements.readerDownload.addEventListener('click', () => {
  if (activeBook) downloadBook(activeBook);
});
elements.readerViewMode.addEventListener('change', () => {
  updateReaderViewOptions(elements.readerViewMode.value);
  if (activeBook) setReaderView(elements.readerViewMode.value);
});
elements.readerViewOptions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-reader-view]');
  if (!option) return;
  elements.readerViewMode.value = option.dataset.readerView;
  updateReaderViewOptions(elements.readerViewMode.value);
  if (activeBook) setReaderView(elements.readerViewMode.value);
});
elements.readerViewOptions.addEventListener('keydown', (event) => {
  const option = event.target.closest('[data-reader-view]');
  if (!option) return;
  const views = ['width', 'page', 'actual'];
  const currentIndex = views.indexOf(option.dataset.readerView);
  const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight') nextIndex += direction;
  else if (event.key === 'ArrowLeft') nextIndex -= direction;
  else if (event.key === 'ArrowDown') nextIndex += 1;
  else if (event.key === 'ArrowUp') nextIndex -= 1;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = views.length - 1;
  else return;
  event.preventDefault();
  nextIndex = (nextIndex + views.length) % views.length;
  const nextOption = elements.readerViewOptions.querySelector(`[data-reader-view="${views[nextIndex]}"]`);
  nextOption.focus();
  elements.readerViewMode.value = views[nextIndex];
  updateReaderViewOptions(views[nextIndex]);
  if (activeBook) setReaderView(views[nextIndex]);
});
elements.readerPaperOptions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-paper-color]');
  if (option) setPdfPaperColor(option.dataset.paperColor);
});
elements.readerPaperOptions.addEventListener('keydown', (event) => {
  const option = event.target.closest('[data-paper-color]');
  if (!option) return;
  const currentIndex = PDF_PAPER_COLORS.indexOf(option.dataset.paperColor);
  const direction = document.documentElement.dir === 'rtl' ? -1 : 1;
  let nextIndex = currentIndex;
  if (event.key === 'ArrowRight') nextIndex += direction;
  else if (event.key === 'ArrowLeft') nextIndex -= direction;
  else if (event.key === 'ArrowDown') nextIndex += 1;
  else if (event.key === 'ArrowUp') nextIndex -= 1;
  else if (event.key === 'Home') nextIndex = 0;
  else if (event.key === 'End') nextIndex = PDF_PAPER_COLORS.length - 1;
  else return;
  event.preventDefault();
  nextIndex = (nextIndex + PDF_PAPER_COLORS.length) % PDF_PAPER_COLORS.length;
  const nextOption = elements.readerPaperOptions.querySelector(`[data-paper-color="${PDF_PAPER_COLORS[nextIndex]}"]`);
  nextOption.focus();
  setPdfPaperColor(PDF_PAPER_COLORS[nextIndex]);
});
elements.readerPageNav.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button === elements.readerFirstPage) goToPdfPage(1);
  else if (button === elements.readerPreviousPage) goToPdfPage(currentPdfPage - 1);
  else if (button === elements.readerNextPage) goToPdfPage(currentPdfPage + 1);
  else if (button === elements.readerLastPage && activePdfDocument) goToPdfPage(activePdfDocument.numPages);
});
elements.readerPageNumber.addEventListener('change', () => {
  goToPdfPage(elements.readerPageNumber.value);
});
elements.readerPageNumber.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    goToPdfPage(elements.readerPageNumber.value);
    elements.readerPageNumber.blur();
  }
});
elements.readerResumePosition.addEventListener('change', () => {
  resumePdfPosition = elements.readerResumePosition.checked;
  try {
    localStorage.setItem(PDF_RESUME_KEY, String(resumePdfPosition));
  } catch (error) {
    console.error('Could not save the PDF resume preference:', error);
  }
  if (activeBook && activePdfDocument) {
    if (resumePdfPosition) savePdfPage(activeBook.id, currentPdfPage);
    updateBookQuery(activeBook.id, currentPdfPage, true);
  }
});
elements.pdfReader.addEventListener('scroll', () => {
  window.clearTimeout(pdfScrollTimer);
  pdfScrollTimer = window.setTimeout(updatePdfPageFromScroll, 120);
}, { passive: true });
let readerResizeTimer;
window.addEventListener('resize', () => {
  if (!activePdfDocument) return;
  const pageToKeep = currentPdfPage;
  window.clearTimeout(readerResizeTimer);
  readerResizeTimer = window.setTimeout(() => {
    renderPdfPages();
    goToPdfPage(pageToKeep, 'auto');
  }, 120);
});
document.getElementById('reader-fullscreen').addEventListener('click', async () => {
  const entering = !elements.reader.classList.contains('is-fullscreen');
  if (!entering && orientationLocked) {
    screen.orientation.unlock();
    orientationLocked = false;
  }
  if (!entering && document.fullscreenElement) {
    await document.exitFullscreen().catch((error) => console.error('Could not exit reader fullscreen:', error));
  }
  setReaderFullscreen(entering);
  if (entering && elements.reader.requestFullscreen && !document.fullscreenElement) {
    try {
      await elements.reader.requestFullscreen();
    } catch (error) {
      console.warn('Native full screen is unavailable; keeping the reader fitted to the window:', error);
    }
  }
});
elements.readerRotateScreen.addEventListener('click', async () => {
  if (orientationLocked) {
    screen.orientation.unlock();
    orientationLocked = false;
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch((error) => console.error('Could not exit reader fullscreen:', error));
    }
    setReaderFullscreen(false);
    showReaderPageStatus(text('readerOrientationReset'));
    return;
  }
  if (!screen.orientation?.lock || !elements.reader.requestFullscreen) {
    showReaderPageStatus(text('readerOrientationUnsupported'));
    return;
  }
  let enteredFullscreen = false;
  try {
    if (!document.fullscreenElement) {
      await elements.reader.requestFullscreen();
      enteredFullscreen = true;
    }
    await screen.orientation.lock('landscape');
    orientationLocked = true;
    setReaderFullscreen(true);
    showReaderPageStatus(text('readerOrientationSet'));
  } catch (error) {
    console.error('Could not rotate the reader screen:', error);
    if (enteredFullscreen && document.fullscreenElement) {
      await document.exitFullscreen().catch((exitError) => console.error('Could not exit reader fullscreen after orientation failure:', exitError));
      setReaderFullscreen(false);
    }
    showReaderPageStatus(['NotSupportedError', 'SecurityError'].includes(error.name)
      ? text('readerOrientationUnsupported')
      : text('readerOrientationError'));
  }
});
document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement === elements.reader) {
    setReaderFullscreen(true);
  } else if (!document.fullscreenElement) {
    if (orientationLocked) {
      screen.orientation.unlock();
      orientationLocked = false;
    }
    setReaderFullscreen(false);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && elements.reader.classList.contains('is-fullscreen')) {
    setReaderFullscreen(false);
  }
});
window.addEventListener('popstate', () => {
  const selectedId = new URL(location.href).searchParams.get('id');
  const book = books.find((item) => item.id === selectedId);
  if (book) showReader(book, false);
  else closeReader(false);
});
document.getElementById('year').textContent = String(new Date().getFullYear());
const savedTheme = localStorage.getItem('books-theme') === 'dark';
document.body.classList.toggle('dark', savedTheme);
document.getElementById('theme-toggle').innerHTML = `<i class="bi ${savedTheme ? 'bi-sun' : 'bi-moon-stars'}" aria-hidden="true"></i>`;
setPdfPaperColor(pdfPaperColor);
setLanguage(language);

async function loadBooks() {
  try {
    const snapshot = await getDocs(collection(db, 'books'));
    const loadedBooks = snapshot.docs.map((documentSnapshot) => ({
      id: documentSnapshot.id,
      ...documentSnapshot.data()
    }));

    libraryState = 'loaded';
    books = loadedBooks
      .filter((book) => (book.storageType === 'firestore-chunks')
        || (book.url && safeBookUrl(book.url)))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      const initialQuery = new URL(location.href).searchParams.get('q');
      if (initialQuery) elements.search.value = initialQuery.slice(0, 120);
    elements.status.textContent = '';
    renderCategories();
    renderBooks();
    renderAdminBooks();
    const pageUrl = new URL(location.href);
    const selectedId = pageUrl.searchParams.get('id');
    const selectedBook = books.find((book) => book.id === selectedId);
    if (selectedBook) {
      const requestedPaper = pageUrl.searchParams.get('readerPaper');
      if (PDF_PAPER_COLORS.includes(requestedPaper)) setPdfPaperColor(requestedPaper);
      const requestedView = pageUrl.searchParams.get('readerView');
      if (['width', 'page', 'actual'].includes(requestedView)) {
        elements.readerViewMode.value = requestedView;
        updateReaderViewOptions(requestedView);
      }
      await showReader(selectedBook, false);
      if (pageUrl.searchParams.get('readerFullscreen') === '1') setReaderFullscreen(true);
      if (pageUrl.searchParams.get('download') === '1') downloadBook(selectedBook);
    }
  } catch (error) {
    console.error('Books library Firestore read error:', error);
    libraryState = 'error';
    elements.status.textContent = `${text('loadError')} (${error.message})`;
    elements.grid.replaceChildren();
    if (currentAdmin?.email?.toLowerCase() === adminEmail) {
      const adminList = document.getElementById('admin-books-list');
      if (adminList) {
        adminList.textContent = `${text('adminBooksError')} ${error.message}`;
      }
    }
  }
}

loadBooks();
