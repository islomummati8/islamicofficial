/**
 * ISLAMIC OFFICIAL - MAIN APPLICATION CORE LOGIC
 * Features: Prayer Times API, Standalone Tasbeeh Counter, Quran API & Audio Player
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize App Modules
  autoDetectLanguage();
  initPrayerTimes();
  initTasbeeh();
  initQuranSection();
});

/* ==========================================================================
   1. PRAYER TIMES ENGINE (GPS & API INTEGRATION)
   ========================================================================== */

let currentCity = "Tashkent";
let currentCountry = "Uzbekistan";
async function initPrayerTimes() {
  const citySelect = document.getElementById('citySelect');
  if (citySelect) {
    citySelect.addEventListener('change', (e) => {
      const selected = e.target.value.split(',');
      currentCity = selected[0];
      currentCountry = selected[1] || 'Uzbekistan';
      fetchPrayerTimesByCity(currentCity, currentCountry);
    });
  }

  // Auto detect location via Browser Geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchPrayerTimesByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchPrayerTimesByCity(currentCity, currentCountry)
    );
  } else {
    fetchPrayerTimesByCity(currentCity, currentCountry);
  }
}
// Namoz vaqtlari modali
function openPrayerModal() {
    document.getElementById('prayerModal').classList.remove('hidden');
}
function closePrayerModal() {
    document.getElementById('prayerModal').classList.add('hidden');
}

// Admin Kabinet modali
function openAdminModal() {
    document.getElementById('adminAuthModal').classList.remove('hidden');
}
function closeAdminModal() {
    document.getElementById('adminAuthModal').classList.add('hidden');
}

// Yangi Maqola modali
function openCreateArticleModal() {
    document.getElementById('createArticleModal').classList.remove('hidden');
}
function closeCreateArticleModal() {
    document.getElementById('createArticleModal').classList.add('hidden');
}

// AI Chat vidjeti
function toggleAiChatModal() {
    const chatWindow = document.getElementById('aiChatWindow');
    chatWindow.classList.toggle('hidden');
}
async function fetchPrayerTimesByCity(city, country) {
  try {
    const res = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}&method=3`);
    const data = await res.json();
    if (data.code === 200) {
      renderPrayerTimes(data.data.timings);
    }
  } catch (err) {
    console.error("Prayer times fetch error:", err);
  }
}

async function fetchPrayerTimesByCoords(lat, lng) {
  try {
    const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=3`);
    const data = await res.json();
    if (data.code === 200) {
      renderPrayerTimes(data.data.timings);
    }
  } catch (err) {
    fetchPrayerTimesByCity(currentCity, currentCountry);
  }
}

function renderPrayerTimes(timings) {
  const map = {
    fajrTime: timings.Fajr,
    sunriseTime: timings.Sunrise,
    dhuhrTime: timings.Dhuhr,
    asrTime: timings.Asr,
    maghribTime: timings.Maghrib,
    ishaTime: timings.Isha
  };

  for (let id in map) {
    const el = document.getElementById(id);
    if (el) el.textContent = map[id];
  }

  highlightCurrentPrayer(timings);
}

function highlightCurrentPrayer(timings) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const parseMin = (timeStr) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const prayers = [
    { name: 'fajr', time: parseMin(timings.Fajr), elId: 'cardFajr' },
    { name: 'sunrise', time: parseMin(timings.Sunrise), elId: 'cardSunrise' },
    { name: 'dhuhr', time: parseMin(timings.Dhuhr), elId: 'cardDhuhr' },
    { name: 'asr', time: parseMin(timings.Asr), elId: 'cardAsr' },
    { name: 'maghrib', time: parseMin(timings.Maghrib), elId: 'cardMaghrib' },
    { name: 'isha', time: parseMin(timings.Isha), elId: 'cardIsha' }
  ];

  document.querySelectorAll('.prayer-card').forEach(card => card.classList.remove('active-prayer'));

  let activeIndex = prayers.length - 1;
  for (let i = 0; i < prayers.length; i++) {
    if (currentMinutes < prayers[i].time) {
      activeIndex = i === 0 ? prayers.length - 1 : i - 1;
      break;
    }
  }

  const activeCard = document.getElementById(prayers[activeIndex].elId);
  if (activeCard) activeCard.classList.add('active-prayer');
}

/* ==========================================================================
   2. STANDALONE ONLINE TASBEEH LOGIC
   ========================================================================== */

let tasbeehCount = 0;
let tasbeehTarget = 33;

function initTasbeeh() {
  const countDisplay = document.getElementById('tasbeehDisplay');
  const targetDisplay = document.getElementById('tasbeehTargetDisplay');
  const incrementBtn = document.getElementById('tasbeehBtn');
  const resetBtn = document.getElementById('tasbeehResetBtn');
  const targetSelect = document.getElementById('tasbeehTargetSelect');

  if (!incrementBtn) return;

  incrementBtn.addEventListener('click', () => {
    tasbeehCount++;
    if (countDisplay) countDisplay.textContent = tasbeehCount;

    // Haptic Vibration feedback on mobile devices
    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    // Target Reached logic
    if (tasbeehCount % tasbeehTarget === 0) {
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      showTasbeehNotification();
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      tasbeehCount = 0;
      if (countDisplay) countDisplay.textContent = 0;
    });
  }

  if (targetSelect) {
    targetSelect.addEventListener('change', (e) => {
      tasbeehTarget = parseInt(e.target.value) || 33;
      if (targetDisplay) targetDisplay.textContent = tasbeehTarget;
    });
  }
}
let dhikrCount = 0;
const dhikrData = {
    "SubhanAllah": { arabic: "سُبْحَانَ اللَّهِ", translation: "Allah aybu nuqsondan pokdir" },
    "Alhamdulillah": { arabic: "الْحَمْدُ لِلَّهِ", translation: "Hamd Allahgadir" },
    "Allahu Akbar": { arabic: "اللَّهُ أَكْبَرُ", translation: "Allah buyukdir" },
    "La ilaha illallah": { arabic: "لَا إِلٰهَ إِلَّا اللَّهُ", translation: "Allahdan o'zga iloh yo'q" },
    "Astaghfirullah": { arabic: "أَسْتَغْفِرُ اللَّهَ", translation: "Allohdan mag'firat so'rayman" },
    "Salavat": { arabic: "اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ", translation: "Allohim, Muhammadga salavot yo'lla" }
};

function incrementDhikrCount() {
    dhikrCount++;
    document.getElementById('dhikrCounterDisplay').innerText = dhikrCount;
    // Vibratsiya effekti (agar telefon qo'llab-quvvatlasa)
    if (navigator.vibrate) navigator.vibrate(40);
}

function resetDhikrCount() {
    dhikrCount = 0;
    document.getElementById('dhikrCounterDisplay').innerText = dhikrCount;
}

function changeDhikrText() {
    const selected = document.getElementById('dhikrSelect').value;
    const data = dhikrData[selected];
    if (data) {
        document.getElementById('currentDhikrArabic').innerText = data.arabic;
        document.getElementById('currentDhikrTranslation').innerText = data.translation;
    }
    resetDhikrCount();
}

function showTasbeehNotification() {
  const toast = document.getElementById('tasbeehToast');
  if (!toast) return;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

/* ==========================================================================
   3. HOLY QURAN ENGINE (API & AUDIO PLAYER)
   ========================================================================== */

let allSurahs = [];
const currentAudio = new Audio();

async function initQuranSection() {
  const surahContainer = document.getElementById('surahContainer');
  const searchInput = document.getElementById('searchSurahInput');

  if (!surahContainer) return;

  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    const data = await res.json();

    if (data.code === 200) {
      allSurahs = data.data;
      renderSurahs(allSurahs);
    }
  } catch (err) {
    console.error("Quran API Fetch Error:", err);
    surahContainer.innerHTML = `<p class="text-red-500 text-center col-span-full">Suralarni yuklashda xatolik yuz berdi.</p>`;
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const filtered = allSurahs.filter(s => 
        s.englishName.toLowerCase().includes(query) ||
        s.name.includes(query) ||
        s.number.toString() === query
      );
      renderSurahs(filtered);
    });
  }
}

function renderSurahs(surahs) {
  const container = document.getElementById('surahContainer');
  if (!container) return;

  if (surahs.length === 0) {
    container.innerHTML = `<p class="text-gray-500 text-center col-span-full py-8">Hech qanday sura topilmadi.</p>`;
    return;
  }

  container.innerHTML = surahs.map(surah => `
    <div onclick="playSurahAudio(${surah.number}, '${surah.englishName}')" 
         class="surah-card p-4 rounded-xl border border-emerald-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-emerald-600 transition cursor-pointer flex items-center justify-between shadow-sm">
      <div class="flex items-center space-x-4 space-x-reverse">
        <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center text-sm">
          ${surah.number}
        </div>
        <div>
          <h4 class="font-bold text-gray-800 dark:text-gray-100">${surah.englishName}</h4>
          <p class="text-xs text-gray-500 dark:text-gray-400">${surah.englishNameTranslation} • ${surah.numberOfAyahs} oyat</p>
        </div>
      </div>
      <div class="text-right">
        <span class="font-arabic text-xl font-bold text-emerald-700 dark:text-emerald-400">${surah.name}</span>
      </div>
    </div>
  `).join('');
}

function playSurahAudio(surahNumber, surahName) {
  const playerBar = document.getElementById('quranPlayerBar');
  const playerTitle = document.getElementById('playerSurahTitle');
  
  if (!playerBar) return;

  // Audio reciter API URL (Mishary Rashid Alafasy)
  const paddedNumber = surahNumber.toString().padStart(3, '0');
  currentAudio.src = `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afasi/${paddedNumber}.mp3`;
  
  if (playerTitle) playerTitle.textContent = `${surahNumber}. ${surahName}`;
  playerBar.classList.remove('hidden');
  
  currentAudio.play();
  updatePlayPauseIcon(true);
}

function toggleAudioPlay() {
  if (currentAudio.paused) {
    currentAudio.play();
    updatePlayPauseIcon(true);
  } else {
    currentAudio.pause();
    updatePlayPauseIcon(false);
  }
}

function updatePlayPauseIcon(isPlaying) {
  const playBtn = document.getElementById('audioPlayIcon');
  if (playBtn) {
    playBtn.className = isPlaying ? 'fas fa-pause' : 'fas fa-play';
  }
}

// Mobil menyuni ochish/yopish
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// Tema (Dark/Light mode) almashtirish
function toggleTheme() {
    const html = document.documentElement;
    const sunIcon = document.getElementById('themeIconSun');
    const moonIcon = document.getElementById('themeIconMoon');

    html.classList.toggle('dark');
    
    if (html.classList.contains('dark')) {
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
        localStorage.setItem('theme', 'dark');
    } else {
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
        localStorage.setItem('theme', 'light');
    }
}
function filterSurahs() {
    const input = document.getElementById('surahSearchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#surahListContainer > div');

    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        if (text.includes(input)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

// Faylni Base64 formatga o'tkazish (rasm yuklash uchun)
let uploadedArticleImage = "";
function encodeImageFileAsURL(element) {
    const file = element.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = function() {
            uploadedArticleImage = reader.result;
        }
        reader.readAsDataURL(file);
    }
}

// Maqolalarni chiroyli dizaynda ekranga chiqarish
function renderArticles(articlesArray) {
    const container = document.getElementById('articlesGridContainer');
    container.innerHTML = "";

    if (!articlesArray || articlesArray.length === 0) {
        container.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">Hozircha maqolalar mavjud emas.</div>`;
        return;
    }

    articlesArray.forEach((article, index) => {
        container.innerHTML += `
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col justify-between group transition hover:-translate-y-1">
                <div>
                    <!-- Rasm -->
                    <div class="h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                        <img src="${article.image || 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600'}" alt="Article" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <span class="absolute top-3 left-3 bg-brand-800 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow">${article.category}</span>
                    </div>
                    <!-- Matn qismi -->
                    <div class="p-5">
                        <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
                            <span><i data-lucide="user" class="w-3 h-3 inline mr-1"></i>${article.author}</span>
                            <span class="flex items-center gap-1"><i data-lucide="eye" class="w-3 h-3"></i>${article.views || 0}</span>
                        </div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">${article.title}</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">${article.content}</p>
                        
                        <!-- Batafsil o'qish tugmasi (Uzun maqolalar uchun) -->
                        <button onclick="openFullArticle(${index})" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                            Batafsil o'qish <i data-lucide="arrow-right" class="w-3 h-3"></i>
                        </button>
                    </div>
                </div>

                <!-- Pastki qism: Like, Dislike, Tahrirlash va O'chirish -->
                <div class="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 mt-4">
                    <div class="flex items-center gap-2">
                        <button onclick="likeArticle(${index})" class="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition">
                            <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i> <span>${article.likes || 0}</span>
                        </button>
                        <button onclick="dislikeArticle(${index})" class="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-500 hover:bg-rose-100 transition">
                            <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i> <span>${article.dislikes || 0}</span>
                        </button>
                    </div>
                    
                    <div class="flex items-center gap-1">
                        <!-- Tahrirlash -->
                        <button onclick="editArticle(${index})" class="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-brand-800 hover:text-white transition" title="Tahrirlash">
                            <i data-lucide="edit-3" class="w-4 h-4"></i>
                        </button>
                        <!-- O'chirish tugmasi -->
                        <button onclick="deleteArticle(${index})" class="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 hover:bg-rose-100 transition" title="O'chirish">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    lucide.createIcons();
}

// Maqolani o'chirish funksiyasi
function deleteArticle(index) {
    if (confirm("Haqiqatan ham bu maqolani o'chirmoqchimisiz?")) {
        articlesData.splice(index, 1);
        renderArticles(articlesData);
    }
}

// Maqolani to'liq o'qish oynasini ochish (Batafsil bosganda)
function openFullArticle(index) {
    const art = articlesData[index];
    art.views = (art.views || 0) + 1; // Ko'rishlar sonini bittaga oshiramiz
    renderArticles(articlesData);

    const modalHtml = `
        <div id="fullArticleModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span class="bg-brand-800 text-white text-xs font-bold px-3 py-1 rounded-full">${art.category}</span>
                    <button onclick="document.getElementById('fullArticleModal').remove()" class="text-slate-400 hover:text-slate-600">
                        <i data-lucide="x" class="w-5 h-5"></i>
                    </button>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-3">${art.title}</h2>
                <div class="flex items-center gap-4 text-xs text-slate-400 mb-4">
                    <span><i data-lucide="user" class="w-3.5 h-3.5 inline mr-1"></i>${art.author}</span>
                    <span><i data-lucide="eye" class="w-3.5 h-3.5 inline mr-1"></i>${art.views} ta ko'rish</span>
                </div>
                ${art.image ? `<div class="h-64 rounded-2xl overflow-hidden mb-4"><img src="${art.image}" class="w-full h-full object-cover"></div>` : ''}
                <div class="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                    ${art.content}
                </div>
                <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button onclick="document.getElementById('fullArticleModal').remove()" class="px-5 py-2.5 rounded-xl bg-brand-800 text-white text-xs font-bold hover:bg-brand-700 transition">Yopish</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    lucide.createIcons();
}