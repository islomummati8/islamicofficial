/**
 * ISLAMIC OFFICIAL - ARTICLES & INTERACTION ENGINE
 * Features: View Counter, Like/Dislike System, Admin Article Creation
 */

// Boshlang'ich maqolalar bazasi (Initial Data)
let defaultArticles = [
  {
    id: 1,
    title: "Ilm Olishning Islomdag'i O'rni va Fazilati",
    category: "Ma'rifat",
    author: "Abdurahmon",
    date: "2026-08-30",
    summary: "Ilm izlash har bir musulmon uchun farzdir. Ilm kishini jaholatdan qutqaradi va jamiyatni yuksaltiradi...",
    content: "Ilm izlash har bir musulmon uchun farzdir. Payg'ambarimiz (s.a.v.) ilmni Beshikdan qabrgacha izlang deganlar. Ushbu maqolada ilm olishning odoblari va fazilatlari haqida batafsil so'z yuritiladi.",
    views: 1420,
    likes: 350,
    dislikes: 12,
    image: "https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "Yaxshi Xulq — Mo'minning Chiroyi",
    category: "Odob-Axloq",
    author: "Abdulloh",
    date: "2026-08-28",
    summary: "Go'zal xulq egasi bo'lish qiyomat kuni tarozida eng og'ir keladigan amallardan biridir...",
    content: "Kishining chiroyi va ziynati uning go'zal axloqida ko'rinadi. Odamlarga hushmuomala bo'lish, ularning ozoriga sabr qilish insonni yuksak darajalarga ko mezon bo'ladi.",
    views: 980,
    likes: 245,
    dislikes: 5,
    image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=800&q=80"
  }
];

// LocalStorage'dan maqolalarni yuklash
function getStoredArticles() {
  const stored = localStorage.getItem('islamic_app_articles');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      return defaultArticles;
    }
  }
  localStorage.setItem('islamic_app_articles', JSON.stringify(defaultArticles));
  return defaultArticles;
}

// LocalStorage'ga saqlash
function saveArticles(articles) {
  localStorage.setItem('islamic_app_articles', JSON.stringify(articles));
}

document.addEventListener('DOMContentLoaded', () => {
  renderArticles();
  initArticleModal();
});

/* ==========================================================================
   1. MAQOLALARNI RENDERING QILISH VA INTERAKSIYALAR
   ========================================================================== */

function renderArticles() {
  const container = document.getElementById('articlesContainer');
  if (!container) return;

  const articles = getStoredArticles();

  if (articles.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center col-span-full py-8">Hozircha maqolalar mavjud emas.</p>`;
    return;
  }

  // Foydalanuvchi qaysi maqolalarga like/dislike bosganini aniqlash
  const userReactions = JSON.parse(localStorage.getItem('user_article_reactions') || '{}');

  container.innerHTML = articles.map(art => {
    const userState = userReactions[art.id] || null; // 'like' or 'dislike'
    
    return `
      <article class="article-card bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/60 shadow-sm flex flex-col">
        <img src="${art.image}" alt="${art.title}" class="w-full h-48 object-cover">
        
        <div class="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-2">
              <span class="bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full">${art.category}</span>
              <span class="text-slate-400 dark:text-slate-500">${art.date}</span>
            </div>

            <h3 class="font-bold text-lg text-slate-800 dark:text-white mb-2 line-clamp-2 hover:text-emerald-600 transition">
              ${art.title}
            </h3>

            <p class="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">
              ${art.summary}
            </p>
          </div>

          <!-- Bottom Meta & Actions -->
          <div class="pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <!-- Author & Views Count -->
            <div class="flex items-center space-x-3 space-x-reverse">
              <span class="font-medium text-slate-700 dark:text-slate-300">✍️ ${art.author}</span>
              <span class="flex items-center space-x-1 space-x-reverse" title="Ko'rishlar soni">
                <i class="fas font-normal fa-eye"></i>
                <span id="views-count-${art.id}">${art.views}</span>
              </span>
            </div>

            <!-- Like / Dislike Buttons -->
            <div class="flex items-center space-x-2 space-x-reverse">
              <button onclick="handleReaction(${art.id}, 'like')" 
                      class="like-btn px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 flex items-center space-x-1 space-x-reverse transition ${userState === 'like' ? 'active' : ''}">
                <i class="fas fa-thumbs-up"></i>
                <span id="likes-count-${art.id}">${art.likes}</span>
              </button>

              <button onclick="handleReaction(${art.id}, 'dislike')" 
                      class="dislike-btn px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center space-x-1 space-x-reverse transition ${userState === 'dislike' ? 'active' : ''}">
                <i class="fas fa-thumbs-down"></i>
                <span id="dislikes-count-${art.id}">${art.dislikes}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

/* ==========================================================================
   2. LIKE VA DISLIKE REAKSIYASI MANTIQI
   ========================================================================== */

function handleReaction(articleId, type) {
  let articles = getStoredArticles();
  const index = articles.findIndex(a => a.id === articleId);
  if (index === -1) return;

  let userReactions = JSON.parse(localStorage.getItem('user_article_reactions') || '{}');
  const currentState = userReactions[articleId];

  if (type === 'like') {
    if (currentState === 'like') {
      // Bekor qilish (Undo)
      articles[index].likes--;
      delete userReactions[articleId];
    } else {
      if (currentState === 'dislike') {
        articles[index].dislikes--;
      }
      articles[index].likes++;
      userReactions[articleId] = 'like';
    }
  } else if (type === 'dislike') {
    if (currentState === 'dislike') {
      // Bekor qilish (Undo)
      articles[index].dislikes--;
      delete userReactions[articleId];
    } else {
      if (currentState === 'like') {
        articles[index].likes--;
      }
      articles[index].dislikes++;
      userReactions[articleId] = 'dislike';
    }
  }

  saveArticles(articles);
  localStorage.setItem('user_article_reactions', JSON.stringify(userReactions));
  renderArticles();
}

/* ==========================================================================
   3. MAQOLA KO'RILGANDA VIEWS SANOQINI OSHIRISH
   ========================================================================== */

function incrementArticleView(articleId) {
  let articles = getStoredArticles();
  const index = articles.findIndex(a => a.id === articleId);
  if (index !== -1) {
    articles[index].views += 1;
    saveArticles(articles);
    const viewElem = document.getElementById(`views-count-${articleId}`);
    if (viewElem) viewElem.textContent = articles[index].views;
  }
}

/* ==========================================================================
   4. ADMINKA: YANGI MAQOLA QO'SHISH MODALI
   ========================================================================== */

function initArticleModal() {
  const form = document.getElementById('addArticleForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const title = document.getElementById('articleTitleInput').value.trim();
    const category = document.getElementById('articleCategoryInput').value.trim();
    const author = document.getElementById('articleAuthorInput').value.trim() || 'Abdurahmon';
    const summary = document.getElementById('articleSummaryInput').value.trim();
    const content = document.getElementById('articleContentInput').value.trim();
    const image = document.getElementById('articleImageInput').value.trim() || 'https://images.unsplash.com/photo-1585036156171-384164a8c675?auto=format&fit=crop&w=800&q=80';

    if (!title || !summary) {
      alert("Sarlavha va qisqacha mazmunni to'ldiring!");
      return;
    }

    const articles = getStoredArticles();
    const newArticle = {
      id: Date.now(),
      title,
      category: category || "Umumiy",
      author,
      date: new Date().toISOString().split('T')[0],
      summary,
      content,
      views: 1,
      likes: 0,
      dislikes: 0,
      image
    };

    articles.unshift(newArticle); // Ro'yxat boshiga qo'shish
    saveArticles(articles);
    renderArticles();

    // Reset Form & Close Modal
    form.reset();
    const modal = document.getElementById('addArticleModal');
    if (modal) modal.classList.add('hidden');
  });
}