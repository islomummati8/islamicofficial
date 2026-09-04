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
  getDoc,
  setDoc,
  increment,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

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
let adminArticlesUnsubscribe = null;
let uploadInProgress = false;

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

Object.assign(translations.uz, {
  pricingTitle: 'Premium imkoniyatlar', pricingText: "Sizga kerakli bilim va reklamasiz foydalanish imkoniyatlarini tanlang.",
  freePlan: 'Bepul', forever: ' / abadiy', freeFeature1: "Ochiq maqolalar va YouTube ma'ruzalar", freeFeature2: "Asosiy duolar va foydali materiallar", freeFeature3: 'Standart platforma imkoniyatlari', startFree: 'Boshlash',
  popular: 'Mashhur', proPlan: 'Premium Pro', perMonth: ' / oyiga', discount: 'chegirma narx', proFeature1: 'Reklamasiz foydalanish', proFeature2: 'Eksklyuziv namoz va taʼlim vositalari', proFeature3: 'Arab tili va Tajvid mashqlari', proFeature4: "Eksklyuziv PDF qo'llanmalar", subscribe: "Obuna bo'lish",
  familyPlan: 'Oila va hamkorlar', familyFeature1: "5 tagacha oila a'zosi uchun kirish", familyFeature2: 'Bolalar uchun xavfsiz filtr', familyFeature3: "Oila statistikasi va qo'llab-quvvatlash", contactUs: "Bog'lanish", newsletterTitle: "Yangiliklarga obuna bo'ling", newsletterText: "Yangi maqola va media materiallardan xabardor bo'lib boring.", usefulLinks: "Foydali havolalar", followUs: "Bizni kuzating", followText: "Rasmiy kanallarimiz orqali yangi ma'ruzalar va maqolalardan xabardor bo'ling"
});
Object.assign(translations.en, {
  pricingTitle: 'Premium access', pricingText: 'Choose the plan that gives you trusted knowledge and an ad-free experience.', freePlan: 'Free', forever: ' / forever', freeFeature1: 'Open articles and YouTube lectures', freeFeature2: 'Basic duas and useful materials', freeFeature3: 'Standard platform features', startFree: 'Get started', popular: 'Popular', proPlan: 'Premium Pro', perMonth: ' / month', discount: 'discount price', proFeature1: 'Ad-free experience', proFeature2: 'Exclusive prayer and learning tools', proFeature3: 'Arabic and Tajweed exercises', proFeature4: 'Exclusive PDF guides', subscribe: 'Subscribe', familyPlan: 'Family & partners', familyFeature1: 'Access for up to 5 family members', familyFeature2: 'Safe filter for children', familyFeature3: 'Family statistics and support', contactUs: 'Contact us', newsletterTitle: 'Join our newsletter', newsletterText: 'Get updates about new articles and media.', usefulLinks: 'Useful links', followUs: 'Follow us', followText: 'Follow our official channels for new lectures and articles.'
});
Object.assign(translations.ru, {
  pricingTitle: 'Премиум возможности', pricingText: 'Выберите доступ к знаниям и использованию платформы без рекламы.', freePlan: 'Бесплатный', forever: ' / навсегда', freeFeature1: 'Открытые статьи и лекции YouTube', freeFeature2: 'Основные дуа и полезные материалы', freeFeature3: 'Стандартные возможности платформы', startFree: 'Начать', popular: 'Популярный', proPlan: 'Premium Pro', perMonth: ' / месяц', discount: 'цена со скидкой', proFeature1: 'Без рекламы', proFeature2: 'Эксклюзивные молитвенные и учебные инструменты', proFeature3: 'Упражнения по арабскому и таджвиду', proFeature4: 'Эксклюзивные PDF-пособия', subscribe: 'Подписаться', familyPlan: 'Семья и партнеры', familyFeature1: 'Доступ для 5 членов семьи', familyFeature2: 'Безопасный фильтр для детей', familyFeature3: 'Семейная статистика и поддержка', contactUs: 'Связаться', newsletterTitle: 'Подпишитесь на новости', newsletterText: 'Получайте новости о новых статьях и медиа.', usefulLinks: 'Полезные ссылки', followUs: 'Мы в соцсетях', followText: 'Следите за официальными каналами и новыми лекциями.'
});
translations.uz.footerTagline = 'Islamic Official | Media & IT Portal';
translations.en.footerTagline = 'Islamic Official | Media & IT Portal';
translations.ru.footerTagline = 'Islamic Official | Медиа и IT портал';

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
    if (text[element.dataset.i18n]) element.textContent = text[element.dataset.i18n];
  });
  document.documentElement.lang = language;
  localStorage.setItem('site-language', language);
}

async function subscribeToNewsletter(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector('input[type="email"]')?.value.trim();
  const message = form.querySelector('.sent-message');
  if (!email) return;
  try {
    await addDoc(collection(db, 'newsletterSubscribers'), { email, createdAt: serverTimestamp() });
    form.reset();
    if (message) { message.textContent = 'Obuna muvaffaqiyatli saqlandi.'; message.style.display = 'block'; }
  } catch (error) {
    const failure = form.querySelector('.error-message');
    if (failure) { failure.textContent = error.message; failure.style.display = 'block'; }
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
  publicArticlesUnsubscribe = onSnapshot(articlesRef, renderPublicArticles, (error) => {
    console.error('Public Firestore read error:', error);
    list.innerHTML = `<div class="col-12"><div class="alert alert-danger">Maqolalarni yuklashda xatolik: ${escapeHtml(error.message)}</div></div>`;
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
  try {
    await action();
    closeAuthModal();
  } catch (error) {
    console.error('Firebase authentication error:', error);
    authMessage(error.message, true);
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

function renderPublicArticles(snapshot) {
  const list = document.getElementById('public-articles-list');
  if (!list) return;
  list.innerHTML = '';
  if (snapshot.empty) {
    list.innerHTML = '<div class="col-12"><div class="alert alert-light text-center">Hozircha maqolalar mavjud emas.</div></div>';
    return;
  }
  const documents = [...snapshot.docs].sort((a, b) => (b.data().createdAt?.seconds || 0) - (a.data().createdAt?.seconds || 0));
  documents.forEach((articleSnapshot) => {
    const article = articleSnapshot.data();
    const image = article.imageUrl || article.image || 'assets/img/blog/blog-post-1.webp';
    const sourceUrl = safeExternalUrl(article.sourceUrl);
    const group = article.imageOnly ? 'image' : sourceUrl ? 'link' : 'text';
    const card = document.createElement('div');
    card.className = 'col-xl-4 col-md-6 d-flex';
    card.dataset.articleGroup = group;
    card.innerHTML = `
      <article class="post-item position-relative h-100 shadow-sm w-100 overflow-hidden">
        <div class="post-img position-relative overflow-hidden">
          <img src="${escapeHtml(image)}" class="img-fluid w-100" alt="${escapeHtml(article.title)}" loading="lazy">
          <span class="post-date">${escapeHtml(article.category || 'Maqola')}</span>
        </div>
        <div class="post-content d-flex flex-column">
          <h3 class="post-title">${escapeHtml(article.title || 'Nomsiz maqola')}</h3>
          <div class="meta d-flex align-items-center">
            <i class="bi bi-person"></i><span class="ps-2">${escapeHtml(article.author || 'Admin')}</span>
              <span class="ms-auto"><i class="bi bi-eye"></i> <span class="article-card-views">${Number(article.views || 0).toLocaleString()}</span></span>
          </div>
          <hr>
          <p class="mb-3">${escapeHtml(article.summary || article.content || (article.imageOnly ? 'Faqat surat' : ''))}</p>
          <div class="d-flex justify-content-between align-items-center gap-2 mt-auto">
            ${sourceUrl ? `<a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="small text-secondary"><i class="bi bi-link-45deg"></i> Manbani ochish</a>` : '<span></span>'}
            <button type="button" class="btn btn-sm btn-outline-danger article-card-like" data-article-id="${escapeHtml(articleSnapshot.id)}"><i class="bi bi-heart"></i> <span>${Number(article.likes || 0)}</span></button>
          </div>
          <a href="article-details.html?id=${encodeURIComponent(articleSnapshot.id)}" class="readmore mt-auto" aria-label="Maqolani to'liq o'qish">
            <span>Davomini o'qish</span><i class="bi bi-arrow-right"></i>
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
    onSnapshot(likesRef, (likes) => { count.textContent = String(likes.size); }, (error) => {
      console.warn('Article likes unavailable:', error.message);
    });
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
  document.querySelectorAll('[data-article-filter]').forEach((button) => {
    button.onclick = () => {
      document.querySelectorAll('[data-article-filter]').forEach((item) => item.classList.toggle('active', item === button));
      document.querySelectorAll('#public-articles-list > [data-article-group]').forEach((card) => {
        card.classList.toggle('d-none', button.dataset.articleFilter !== 'all' && card.dataset.articleGroup !== button.dataset.articleFilter);
      });
    };
  });
}

function renderAdminArticles(snapshot) {
  const list = document.getElementById('admin-articles-list');
  if (!list) return;
  list.innerHTML = '';
  snapshot.forEach((articleSnapshot) => {
    const article = articleSnapshot.data();
    const row = document.createElement('div');
    row.className = 'border rounded p-2 mb-2';
    row.innerHTML = `<strong>${article.title || ''}</strong><p class="mb-2">${article.summary || article.content || ''}</p>`;
    const edit = document.createElement('button');
    edit.className = 'btn btn-sm btn-warning me-2';
    edit.textContent = 'Edit';
    edit.addEventListener('click', () => editArticle(articleSnapshot.id, article));
    const remove = document.createElement('button');
    remove.className = 'btn btn-sm btn-danger';
    remove.textContent = 'Delete';
    remove.addEventListener('click', () => deleteArticle(articleSnapshot.id));
    row.append(edit, remove);
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

async function deleteArticle(id) {
  if (!confirm("Ushbu maqolani o'chirishni tasdiqlaysizmi?")) return;
  try {
    await deleteDoc(doc(db, 'articles', id));
  } catch (error) {
    console.error('Firestore delete error:', error);
    authMessage(error.message, true);
  }
}

async function editArticle(id, article) {
  const title = prompt('Yangi sarlavha:', article.title || '');
  if (title === null || !title.trim()) return;
  const content = prompt('Yangi matn:', article.content || '');
  if (content === null || !content.trim()) return;
  try {
    await updateDoc(doc(db, 'articles', id), {
      title: title.trim(),
      content: content.trim(),
      summary: (article.summary || content).trim(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Firestore update error:', error);
    authMessage(error.message, true);
  }
}

function showAdminPanel(isAdmin) {
  const panel = document.getElementById('admin-panel');
  if (panel) panel.classList.toggle('d-none', !isAdmin);
  if (isAdmin) startArticleListener();
}

function applyPremiumState() {
  const active = localStorage.getItem('premium-active') === 'true';
  document.body.classList.toggle('premium-active', active);
  document.getElementById('premium-features')?.classList.toggle('d-none', !active);
}

async function redeemPremiumCode(event) {
  event.preventDefault();
  const input = document.getElementById('premium-code-input');
  const status = document.getElementById('premium-code-status');
  const code = input?.value.trim().toUpperCase();
  if (!code || !/^PREMIUM-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) {
    if (status) status.textContent = 'Kod formati noto‘g‘ri.';
    return;
  }
  try {
    const snapshot = await getDoc(doc(db, 'premiumCodes', code));
    const data = snapshot.data();
    if (!snapshot.exists() || data?.used || (data?.expiresAt?.toDate && data.expiresAt.toDate() < new Date())) {
      throw new Error('Kod yaroqsiz yoki allaqachon ishlatilgan.');
    }
    const user = auth.currentUser;
    if (!user) throw new Error('Premium kodini ishlatish uchun avval tizimga kiring.');
    await updateDoc(doc(db, 'premiumCodes', code), { used: true, redeemedBy: user.uid, redeemedAt: serverTimestamp() });
    localStorage.setItem('premium-active', 'true');
    if (status) { status.textContent = 'Premium muvaffaqiyatli faollashtirildi.'; status.className = 'small mt-2 text-success'; }
    document.body.classList.add('premium-active');
    document.getElementById('premium-features')?.classList.remove('d-none');
  } catch (error) {
    console.error('Premium code error:', error);
    if (status) { status.textContent = error.message; status.className = 'small mt-2 text-danger'; }
  }
}

async function generatePremiumCode() {
  const output = document.getElementById('generated-premium-code');
  if (auth.currentUser?.email?.toLowerCase() !== 'islomummati8@gmail.com') {
    if (output) output.textContent = 'Faqat admin kod yaratishi mumkin.';
    return;
  }
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const randomPart = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const code = `PREMIUM-${randomPart()}-${randomPart()}`;
  try {
    await setDoc(doc(db, 'premiumCodes', code), { used: false, createdAt: serverTimestamp() });
    if (output) output.textContent = code;
  } catch (error) {
    console.error('Premium code creation error:', error);
    if (output) output.textContent = 'Kod yaratishda xatolik: ' + error.message;
  }
}

async function loadPrayerTimes(latitude, longitude) {
    const output = document.getElementById('prayer-times-list');
    const location = document.getElementById('prayer-location');
    if (!output) return;
    output.innerHTML = '<p class="text-muted">Namoz vaqtlari yuklanmoqda...</p>';
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=3`);
      if (!response.ok) throw new Error('Namoz vaqtlari API xatosi.');
      const result = await response.json();
      const timings = result.data.timings;
      if (location) location.textContent = result.data.meta?.timezone || 'Joylashuv aniqlandi';
      output.innerHTML = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].map((name) =>
        `<div class="prayer-time"><span>${({ Fajr: 'Bomdod', Dhuhr: 'Peshin', Asr: 'Asr', Maghrib: 'Shom', Isha: 'Xufton' })[name]}</span><strong>${timings[name]}</strong></div>`
      ).join('');
    } catch (error) {
      output.innerHTML = `<p class="text-danger">${error.message}</p>`;
    }
}

function initializePrayerTimes() {
    if (!document.getElementById('prayer-times-list')) return;
    if (!navigator.geolocation) {
      loadPrayerTimes(41.3111, 69.2797);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => loadPrayerTimes(coords.latitude, coords.longitude),
      () => loadPrayerTimes(41.3111, 69.2797),
      { timeout: 8000 }
    );
}

async function uploadPdfBook(event) {
    event.preventDefault();
    const file = document.getElementById('pdf-book-file')?.files?.[0];
    const title = document.getElementById('pdf-book-title')?.value.trim();
    const status = document.getElementById('pdf-upload-status');
    if (!file || !title) return;
      const allowedBookTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedBookTypes.includes(file.type) || file.size > 20 * 1024 * 1024) {
      if (status) status.textContent = 'PDF, DOC yoki DOCX fayl (20 MB gacha) tanlang.';
      return;
    }
    try {
      const fileRef = ref(storage, `books/${Date.now()}-${file.name.replace(/[^\w.-]/g, '-')}`);
      await uploadBytes(fileRef, file, { contentType: file.type });
      const url = await getDownloadURL(fileRef);
      await setDoc(doc(db, 'books', String(Date.now())), { title, url, createdAt: serverTimestamp() });
      if (status) status.textContent = 'PDF muvaffaqiyatli yuklandi.';
      event.target.reset();
      loadBooks();
    } catch (error) {
      if (status) status.textContent = error.message;
    }
}

function loadBooks() {
    const list = document.getElementById('pdf-books-list');
    if (!list) return;
    onSnapshot(collection(db, 'books'), (snapshot) => {
      list.innerHTML = snapshot.docs.map((item) => {
        const book = item.data();
        return `<a class="pdf-book-card" href="${book.url}" target="_blank" rel="noopener"><i class="bi bi-file-earmark-pdf"></i><span>${book.title}</span><small>PDF yuklab olish</small></a>`;
      }).join('') || '<p class="text-muted">Hozircha kitoblar qo‘shilmagan.</p>';
    }, (error) => { list.innerHTML = `<p class="text-danger">${error.message}</p>`; });
}

function loadDuas() {
  const list = document.getElementById('duas-list');
  const categories = document.getElementById('dua-categories');
  if (!list || !categories) return;
  onSnapshot(collection(db, 'duas'), (snapshot) => {
    const items = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
    const names = ['Barchasi', ...new Set(items.map((item) => item.category).filter(Boolean))];
    categories.innerHTML = names.map((name, index) => `<button type="button" class="btn btn-sm ${index === 0 ? 'btn-success' : 'btn-outline-success'} dua-filter" data-category="${escapeHtml(name)}">${escapeHtml(name)}</button>`).join('');
    const render = (category = 'Barchasi') => {
      const filtered = category === 'Barchasi' ? items : items.filter((item) => item.category === category);
      list.innerHTML = filtered.map((item) => `<div class="col-md-6 dua-item"><article class="dua-card card h-100 border-0 shadow-sm p-4"><span class="badge text-bg-success align-self-start">${escapeHtml(item.category || 'Umumiy')}</span><h3 class="h5 mt-3">${escapeHtml(item.title)}</h3><div class="dua-scripture" dir="rtl">${escapeHtml(item.arabic || '')}</div><div class="dua-reading"><small>Lotincha o‘qilishi</small><p>${escapeHtml(item.transliteration || '')}</p></div>${item.text ? `<p class="dua-meaning"><small>Ma’nosi</small><br>${escapeHtml(item.text)}</p>` : ''}</article></div>`).join('') || '<p class="text-muted">Hozircha duo qo‘shilmagan.</p>';
    };
    render();
    categories.querySelectorAll('.dua-filter').forEach((button) => button.addEventListener('click', () => {
      categories.querySelectorAll('.dua-filter').forEach((item) => item.className = 'btn btn-sm btn-outline-success dua-filter');
      button.className = 'btn btn-sm btn-success dua-filter';
      render(button.dataset.category);
    }));
  }, (error) => { list.innerHTML = `<p class="text-danger">${escapeHtml(error.message)}</p>`; });
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
      createdAt: serverTimestamp()
    });
    event.target.reset();
    if (status) status.textContent = 'Duo muvaffaqiyatli publish qilindi.';
  } catch (error) {
    if (status) status.textContent = error.message;
  }
}

function initializeWorshipStats() {
  const output = document.getElementById('worship-stats');
  if (!output) return;
  const today = new Date().toISOString().slice(0, 10);
  const key = `worship-${today}`;
  const stats = JSON.parse(localStorage.getItem(key) || '{}');
  const actions = document.getElementById('worship-actions');
  if (actions) {
    actions.innerHTML = ['Bomdod', 'Peshin', 'Asr', 'Shom', 'Xufton', "Qur'on"].map((name) => `<div class="col-sm-6 col-lg-4"><button class="worship-action stat-action ${stats[name] ? 'is-done' : ''}" data-worship="${name}"><i class="bi ${stats[name] ? 'bi-check-circle-fill' : 'bi-circle'}"></i><span>${name}</span><small>${stats[name] ? 'Bajarildi' : 'Bajarildi deb belgilang'}</small></button></div>`).join('');
  }
  const render = () => {
    const done = Object.values(stats).filter(Boolean).length;
    output.innerHTML = `<div class="col-12"><div class="stats-summary"><div><small>Bugungi bajarilganlar</small><strong>${done}</strong></div><div class="stats-progress"><span style="width:${Math.min(100, done / 6 * 100)}%"></span></div><small>${done}/6 amal bajarildi</small></div></div>`;
  };
  document.querySelectorAll('.worship-action').forEach((button) => button.addEventListener('click', async () => {
    const name = button.dataset.worship;
    stats[name] = !stats[name];
    localStorage.setItem(key, JSON.stringify(stats));
    button.classList.toggle('is-done', stats[name]);
    button.querySelector('i').className = `bi ${stats[name] ? 'bi-check-circle-fill' : 'bi-circle'}`;
    button.querySelector('small').textContent = stats[name] ? 'Bajarildi' : 'Bajarildi deb belgilang';
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
    if (habitsList) habitsList.innerHTML = habits.map((habit, index) => `<div class="col-md-6"><button type="button" class="habit-card ${habit.done ? 'is-done' : ''}" data-habit-index="${index}"><i class="bi ${habit.done ? 'bi-check-circle-fill' : 'bi-circle'}"></i><span>${escapeHtml(habit.name)}</span><small>${habit.done ? 'Bugun bajarildi' : 'Bugun bajarildi deb belgilang'}</small></button></div>`).join('') || '<p class="text-muted">Hali odat qo‘shilmagan.</p>';
    habitsList?.querySelectorAll('[data-habit-index]').forEach((button) => button.addEventListener('click', () => {
      const habit = habits[Number(button.dataset.habitIndex)];
      habit.done = !habit.done;
      localStorage.setItem(habitKey, JSON.stringify(habits));
      renderHabits();
    }));
  };
  document.getElementById('habit-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = document.getElementById('habit-name');
    if (input.value.trim()) { habits.push({ name: input.value.trim(), done: false }); input.value = ''; localStorage.setItem(habitKey, JSON.stringify(habits)); renderHabits(); }
  });
  renderHabits();
}

document.addEventListener('DOMContentLoaded', () => {
  applyPremiumState();
  startPublicArticleListener();
  initializePrayerTimes();
  loadBooks();
  loadDuas();
  initializeWorshipStats();
  document.getElementById('dua-form')?.addEventListener('submit', publishDua);
  document.getElementById('pdf-upload-form')?.addEventListener('submit', uploadPdfBook);
  const serviceAd = document.getElementById('service-ad-modal');
  const closeServiceAd = () => {
    if (serviceAd) serviceAd.hidden = true;
  };
  if (serviceAd) {
    window.setTimeout(() => { serviceAd.hidden = false; }, 900);
    document.getElementById('service-ad-close')?.addEventListener('click', closeServiceAd);
    serviceAd.addEventListener('click', (event) => {
      if (event.target === serviceAd) closeServiceAd();
    });
  }
  document.getElementById('premium-code-form')?.addEventListener('submit', redeemPremiumCode);
  document.querySelectorAll('.newsletter-form-wrap').forEach((form) => form.addEventListener('submit', subscribeToNewsletter));
  document.getElementById('generate-premium-code')?.addEventListener('click', generatePremiumCode);
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
  if (savedTheme === 'dark') document.body.classList.add('dark-theme');
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('site-theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
  });
  const fontSteps = ['font-normal', 'font-large', 'font-xlarge', 'font-xxlarge'];
  let fontIndex = Number(localStorage.getItem('site-font-index') || 0);
  const applyFontSize = () => {
    document.body.classList.remove(...fontSteps);
    document.body.classList.add(fontSteps[fontIndex]);
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
    document.querySelector('body').classList.toggle('mobile-nav-active');
    mobileNavToggleBtn.classList.toggle('bi-list');
    mobileNavToggleBtn.classList.toggle('bi-x');
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