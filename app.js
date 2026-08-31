/* ========================================== */
/* ISLAMIC OFFICIAL PORTAL - MAIN APPLICATION JS */
/* Professional Darajadagi Interaktiv Skriptlar */
/* ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("Islamic Official Portal JavaScript muvaffaqiyatli yuklandi!");

    // 1. Jonli raqamli soatni ishga tushirish
    initDigitalClock();

    // 2. Mobil qurilmalar uchun navigatsiya menyusini boshqarish
    initMobileMenu();

    // 3. Maqolalar uchun kategoriya filtrlash tizimi
    initArticleFiltering();

    // 4. Interaktiv Qur'on audio pleerini boshqarish
    initAudioPlayer();

    // 5. Global qidiruv paneli mantiqiy amallari
    initGlobalSearch();
});

/* ========================================== */
/* 1. JONLI RAQAMLI SOAT                      */
/* ========================================== */
function initDigitalClock() {
    const clockElement = document.getElementById('live-digital-clock');
    if (!clockElement) return;

    setInterval(() => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        clockElement.textContent = `${hours}:${minutes}:${seconds}`;
    }, 1000);
}

/* ========================================== */
/* 2. MOBIL MENYU (RESPONSIVE TOGGLE)         */
/* ========================================== */
function initMobileMenu() {
    const menuBtn = document.getElementById('mobile-menu-btn');
    const mainNav = document.getElementById('main-nav');

    if (menuBtn && mainNav) {
        menuBtn.addEventListener('click', () => {
            // Dinamik ravishda mobil menyuni ko'rsatish/yashirish
            if (mainNav.style.display === 'block') {
                mainNav.style.display = 'none';
            } else {
                mainNav.style.display = 'block';
                mainNav.style.position = 'absolute';
                mainNav.style.top = '85px';
                mainNav.style.left = '0';
                mainNav.style.width = '100%';
                mainNav.style.backgroundColor = '#ffffff';
                mainNav.style.padding = '20px';
                mainNav.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
                mainNav.style.zIndex = '999';
            }
        });
    }
}

/* ========================================== */
/* 3. MAQOLALARNI KATEGoriya BO'YICA FILTRLASH */
/* ========================================== */
function initArticleFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const articles = document.querySelectorAll('.article-modern-card');

    if (filterButtons.length === 0 || articles.length === 0) return;

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Barcha tugmalardan active klassini olib tashlash
            filterButtons.forEach(b => b.classList.remove('active'));
            // Bosilgan tugmaga active klassini qo'shish
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            articles.forEach(article => {
                const articleCategory = article.getAttribute('data-category');
                
                if (filterValue === 'all' || articleCategory === filterValue) {
                    article.style.display = 'flex';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    });
}

/* ========================================== */
/* 4. INTERAKTIV QUR'ON AUDIO PLEER MANTig'I   */
/* ========================================== */
function initAudioPlayer() {
    const playlistItems = document.querySelectorAll('.playlist-item');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIconState = document.getElementById('play-icon-state');
    const currentTitle = document.getElementById('current-surah-title');
    const currentReciter = document.getElementById('current-reciter-name');
    const progressFilled = document.getElementById('progress-filled');
    const currentTimeEl = document.getElementById('current-time');
    const totalDurationEl = document.getElementById('total-duration');

    if (!playPauseBtn) return;

    let isPlaying = false;
    let progressPercent = 35;

    // Suralar ro'yxatidan birini tanlaganda
    playlistItems.forEach(item => {
        item.addEventListener('click', () => {
            playlistItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const title = item.getAttribute('data-title');
            const reciter = item.getAttribute('data-reciter');

            if (currentTitle) currentTitle.textContent = title;
            if (currentReciter) currentReciter.textContent = reciter;

            // Avtomatik ijro holatiga o'tkazish
            isPlaying = true;
            if (playIconState) playIconState.className = 'fa-solid fa-pause';
            progressPercent = 0;
            if (progressFilled) progressFilled.style.width = `${progressPercent}%`;
            if (currentTimeEl) currentTimeEl.textContent = '00:00';
            
            console.log(`Tanlangan sura ijro etilmoqda: ${title} (${reciter})`);
        });
    });

    // Play/Pause tugmasi bosilganda
    playPauseBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        if (isPlaying) {
            playIconState.className = 'fa-solid fa-pause';
            console.log("Audio pleer davom ettirilmoqda...");
        } else {
            playIconState.className = 'fa-solid fa-play';
            console.log("Audio pleer to'xtatib turilibdi.");
        }
    });
}

/* ========================================== */
/* 5. GLOBAL QIDIRUV TIZIMI                    */
/* ========================================== */
function initGlobalSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('global-search-input');

    if (searchForm && searchInput) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = searchInput.value.trim();
            if (query !== '') {
                alert(`"${query}" bo'yicha qidiruv amalga oshirildi. Ma'lumotlar bazasidan mos maqolalar qidirilmoqda...`);
                // Bu yerda kelgusida Firebase Firestore qidiruv so'rovlarini ulash mumkin
            } else {
                alert("Iltimos, qidirish uchun so'z kiriting!");
            }
        });
    }
}