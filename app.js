// app.js - To'liq JavaScript kod

// ================= THEME TOGGLE =================
function toggleTheme() {
    const html = document.documentElement;
    html.classList.toggle('dark');
    const sunIcon = document.getElementById('themeIconSun');
    const moonIcon = document.getElementById('themeIconMoon');
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

// ================= LANGUAGE =================
function changeLanguage(lang) {
    localStorage.setItem('language', lang);
    applyLanguage(lang);
}

function applyLanguage(lang) {
    // languages.js fayldan tarjimalarni olish
    if (typeof translations !== 'undefined' && translations[lang]) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (translations[lang][key]) {
                el.textContent = translations[lang][key];
            }
        });
        // Placeholderlar
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (translations[lang][key]) {
                el.placeholder = translations[lang][key];
            }
        });
    }
}

// ================= MOBILE MENU =================
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

// ================= PRAYER TIMES =================
let prayerData = {
    fajr: '--:--',
    sunrise: '--:--',
    dhuhr: '--:--',
    asr: '--:--',
    maghrib: '--:--',
    isha: '--:--'
};

function detectUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                document.getElementById('userLocationText').textContent = `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
                getPrayerTimes(lat, lon);
            },
            error => {
                document.getElementById('userLocationText').textContent = 'Toshkent';
                getPrayerTimes(41.2995, 69.2401);
            }
        );
    } else {
        document.getElementById('userLocationText').textContent = 'Toshkent';
        getPrayerTimes(41.2995, 69.2401);
    }
}

async function getPrayerTimes(lat, lon) {
    try {
        const date = new Date();
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const response = await fetch(`https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=2`);
        const data = await response.json();
        
        if (data.data) {
            const timings = data.data.timings;
            document.getElementById('timeFajr').textContent = timings.Fajr.substring(0, 5);
            document.getElementById('timeSunrise').textContent = timings.Sunrise.substring(0, 5);
            document.getElementById('timeDhuhr').textContent = timings.Dhuhr.substring(0, 5);
            document.getElementById('timeAsr').textContent = timings.Asr.substring(0, 5);
            document.getElementById('timeMaghrib').textContent = timings.Maghrib.substring(0, 5);
            document.getElementById('timeIsha').textContent = timings.Isha.substring(0, 5);
            
            prayerData = {
                fajr: timings.Fajr.substring(0, 5),
                sunrise: timings.Sunrise.substring(0, 5),
                dhuhr: timings.Dhuhr.substring(0, 5),
                asr: timings.Asr.substring(0, 5),
                maghrib: timings.Maghrib.substring(0, 5),
                isha: timings.Isha.substring(0, 5)
            };
            
            document.getElementById('prayerLocationName').textContent = data.data.meta.timezone;
            updateNextPrayer();
        }
    } catch (error) {
        console.error('Namoz vaqtlarini yuklashda xatolik:', error);
    }
}

function updateNextPrayer() {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const prayers = [
        { name: 'Bamdod', time: prayerData.fajr },
        { name: 'Peshin', time: prayerData.dhuhr },
        { name: 'Asr', time: prayerData.asr },
        { name: 'Shom', time: prayerData.maghrib },
        { name: 'Xufton', time: prayerData.isha }
    ];
    
    let nextPrayer = null;
    let nextTime = null;
    
    for (const prayer of prayers) {
        if (prayer.time > currentTime) {
            nextPrayer = prayer;
            break;
        }
    }
    
    if (!nextPrayer) {
        nextPrayer = prayers[0];
        nextPrayer.time = '24:00';
    }
    
    const targetTime = nextPrayer.time.split(':');
    const targetHour = parseInt(targetTime[0]);
    const targetMin = parseInt(targetTime[1]);
    
    let diffMs = (targetHour * 3600 + targetMin * 60) - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
    if (diffMs < 0) diffMs += 24 * 3600;
    
    const hours = Math.floor(diffMs / 3600);
    const mins = Math.floor((diffMs % 3600) / 60);
    const secs = Math.floor(diffMs % 60);
    
    document.getElementById('nextPrayerCountdown').textContent = 
        `${nextPrayer.name}ga: ${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

setInterval(updateNextPrayer, 1000);

function openPrayerModal() {
    document.getElementById('prayerModal').classList.remove('hidden');
    generateMonthlyPrayerTable();
}

function closePrayerModal() {
    document.getElementById('prayerModal').classList.add('hidden');
}

function generateMonthlyPrayerTable() {
    const container = document.getElementById('monthlyPrayerTableContainer');
    const days = 30;
    let html = '<table class="w-full"><thead><tr class="text-left text-brand-800 dark:text-emerald-400">';
    html += '<th class="py-1">Kun</th><th>Bamdod</th><th>Quyosh</th><th>Peshin</th><th>Asr</th><th>Shom</th><th>Xufton</th>';
    html += '</tr></thead><tbody>';
    
    for (let i = 1; i <= days; i++) {
        const hour = (5 + i % 24).toString().padStart(2, '0');
        html += `<tr class="border-t border-slate-100 dark:border-slate-800">
            <td class="py-1 font-medium">${i}</td>
            <td>05:${(30 + i % 60).toString().padStart(2, '0')}</td>
            <td>06:${(45 + i % 60).toString().padStart(2, '0')}</td>
            <td>12:${(20 + i % 60).toString().padStart(2, '0')}</td>
            <td>15:${(40 + i % 60).toString().padStart(2, '0')}</td>
            <td>18:${(10 + i % 60).toString().padStart(2, '0')}</td>
            <td>19:${(50 + i % 60).toString().padStart(2, '0')}</td>
        </tr>`;
    }
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// ================= QURAN SURAH LIST =================
let surahs = [];
let currentSurahIndex = 0;
let audioPlayer = document.getElementById('globalAudioElement');
let isPlaying = false;

async function loadSurahs() {
    try {
        const response = await fetch('https://api.alquran.cloud/v1/surah');
        const data = await response.json();
        
        if (data.data) {
            surahs = data.data;
            displaySurahs(surahs);
        }
    } catch (error) {
        console.error('Suralarni yuklashda xatolik:', error);
        document.getElementById('surahListContainer').innerHTML = `
            <div class="col-span-full text-center py-12 text-red-500">
                <i data-lucide="alert-circle" class="w-8 h-8 mx-auto mb-2"></i>
                <span>Suralarni yuklashda xatolik yuz berdi</span>
            </div>
        `;
    }
}

function displaySurahs(surahList) {
    const container = document.getElementById('surahListContainer');
    container.innerHTML = '';
    
    surahList.forEach((surah, index) => {
        const card = document.createElement('div');
        card.className = 'bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer';
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="text-xs text-slate-400 font-mono">#${surah.number}</span>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">${surah.englishName}</h3>
                    <p class="text-sm text-slate-500 dark:text-slate-400">${surah.englishNameTranslation}</p>
                </div>
                <span class="text-sm font-arabic text-brand-800 dark:text-emerald-400">${surah.name}</span>
            </div>
            <div class="mt-2 flex gap-2 text-xs">
                <span class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">${surah.revelationType}</span>
                <span class="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-full">${surah.numberOfAyahs} oyat</span>
                <button onclick="playSurah(${surah.number}, ${index})" class="px-3 py-1 bg-brand-800 text-white rounded-lg hover:bg-brand-700 transition">
                    <i data-lucide="play" class="w-3 h-3 inline"></i> Tinglash
                </button>
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

function filterSurahs() {
    const searchTerm = document.getElementById('surahSearchInput').value.toLowerCase();
    const filtered = surahs.filter(surah => 
        surah.englishName.toLowerCase().includes(searchTerm) ||
        surah.name.includes(searchTerm) ||
        surah.number.toString().includes(searchTerm)
    );
    displaySurahs(filtered);
}

function playSurah(surahNumber, index) {
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${surahNumber}.mp3`;
    audioPlayer.src = audioUrl;
    audioPlayer.play();
    isPlaying = true;
    currentSurahIndex = index;
    
    document.getElementById('stickyAudioPlayer').classList.remove('translate-y-full');
    document.getElementById('playerSurahNumber').textContent = surahNumber.toString().padStart(2, '0');
    document.getElementById('playerSurahName').textContent = surahs[index].englishName;
    document.getElementById('playerReciterName').textContent = 'Mishary Rashid Alafasy';
    document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'pause');
    lucide.createIcons();
    
    // Audio event listeners
    audioPlayer.addEventListener('timeupdate', updateProgress);
    audioPlayer.addEventListener('loadedmetadata', updateDuration);
}

function togglePlayAudio() {
    if (isPlaying) {
        audioPlayer.pause();
        document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'play');
    } else {
        audioPlayer.play();
        document.getElementById('mainPlayIcon').setAttribute('data-lucide', 'pause');
    }
    isPlaying = !isPlaying;
    lucide.createIcons();
}

function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    document.getElementById('audioProgressBar').value = progress || 0;
    document.getElementById('audioCurrentTime').textContent = formatTime(audioPlayer.currentTime);
}

function updateDuration() {
    document.getElementById('audioDuration').textContent = formatTime(audioPlayer.duration);
}

function formatTime(seconds) {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function playPreviousSurah() {
    if (currentSurahIndex > 0) {
        playSurah(currentSurahIndex, currentSurahIndex - 1);
    }
}

function playNextSurah() {
    if (currentSurahIndex < surahs.length - 1) {
        playSurah(currentSurahIndex + 1, currentSurahIndex + 1);
    }
}

function closeAudioPlayer() {
    audioPlayer.pause();
    isPlaying = false;
    document.getElementById('stickyAudioPlayer').classList.add('translate-y-full');
}

// ================= DHIKR COUNTER =================
let dhikrCount = 0;
let dhikrTarget = 33;
let dhikrSoundEnabled = true;

const dhikrData = {
    'SubhanAllah': { ar: 'سُبْحَانَ اللَّهِ', tr: 'Allah aybu nuqsondan pokdir' },
    'Alhamdulillah': { ar: 'الْحَمْدُ لِلَّهِ', tr: 'Allahga hamd bo\'lsin' },
    'Allahu Akbar': { ar: 'اللَّهُ أَكْبَرُ', tr: 'Allah buyukdir' },
    'La ilaha illallah': { ar: 'لَا إِلٰهَ إِلَّا اللَّهُ', tr: 'Allahdan o\'zga iloh yo\'q' },
    'Astaghfirullah': { ar: 'أَسْتَغْفِرُ اللَّهَ', tr: 'Allahdan mag\'firat so\'rayman' },
    'Salavat': { ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', tr: 'Allohim, Muhammad alayhissalomga salovot yubor' }
};

function changeDhikrText() {
    const select = document.getElementById('dhikrSelect');
    const selected = select.value;
    const data = dhikrData[selected];
    document.getElementById('currentDhikrArabic').textContent = data.ar;
    document.getElementById('currentDhikrTranslation').textContent = data.tr;
    resetDhikrCount();
}

function incrementDhikrCount() {
    dhikrCount++;
    document.getElementById('dhikrCounterDisplay').textContent = dhikrCount;
    
    if (dhikrCount >= dhikrTarget) {
        if (dhikrSoundEnabled) {
            // Vibratsiya
            if (navigator.vibrate) navigator.vibrate(200);
            // Audio play
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.value = 0.3;
            osc.start();
            setTimeout(() => osc.stop(), 150);
        }
        dhikrCount = 0;
        document.getElementById('dhikrCounterDisplay').textContent = '0';
        // Animatsiya effekti
        document.querySelector('.rounded-full').classList.add('ring-4', 'ring-gold-400', 'ring-offset-4');
        setTimeout(() => {
            document.querySelector('.rounded-full').classList.remove('ring-4', 'ring-gold-400', 'ring-offset-4');
        }, 300);
    }
}

function resetDhikrCount() {
    dhikrCount = 0;
    document.getElementById('dhikrCounterDisplay').textContent = '0';
}

function toggleDhikrSound() {
    dhikrSoundEnabled = !dhikrSoundEnabled;
    const btn = document.getElementById('dhikrSoundBtn');
    if (dhikrSoundEnabled) {
        btn.innerHTML = '<i data-lucide="volume-2" class="w-4 h-4"></i>';
    } else {
        btn.innerHTML = '<i data-lucide="volume-x" class="w-4 h-4"></i>';
    }
    lucide.createIcons();
}

// ================= ARTICLES (Firebase CRUD) =================
let articles = [];
let isAdmin = false;

async function loadArticles() {
    try {
        // Firebase orqali yuklash
        if (typeof db !== 'undefined') {
            const snapshot = await db.collection('articles').orderBy('createdAt', 'desc').get();
            articles = [];
            snapshot.forEach(doc => {
                articles.push({ id: doc.id, ...doc.data() });
            });
        } else {
            // Demo ma'lumotlar
            articles = [
                { id: '1', title: 'Islomda sabrning fazilati', author: 'Abdulloh', category: 'Odob-axloq', content: 'Sabr...', image: '', createdAt: Date.now() },
                { id: '2', title: 'Tavba qilishning ahamiyati', author: 'Muhammad', category: 'Aqida', content: 'Tavba...', image: '', createdAt: Date.now() }
            ];
        }
        displayArticles(articles);
    } catch (error) {
        console.error('Maqolalarni yuklashda xatolik:', error);
    }
}

function displayArticles(articlesList) {
    const container = document.getElementById('articlesGridContainer');
    container.innerHTML = '';
    
    if (articlesList.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-slate-400">
                <i data-lucide="file-text" class="w-8 h-8 mx-auto mb-2"></i>
                <span>Hozircha maqolalar mavjud emas</span>
            </div>
        `;
        return;
    }
    
    articlesList.forEach(article => {
        const card = document.createElement('div');
        card.className = 'bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg transition';
        card.innerHTML = `
            ${article.image ? `<img src="${article.image}" alt="${article.title}" class="w-full h-48 object-cover">` : ''}
            <div class="p-4">
                <span class="text-xs text-brand-800 dark:text-emerald-400 font-semibold">${article.category || 'Umumiy'}</span>
                <h3 class="text-lg font-bold text-slate-900 dark:text-white mt-1">${article.title}</h3>
                <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-3">${article.content.substring(0, 150)}...</p>
                <div class="mt-3 flex items-center justify-between text-xs text-slate-400">
                    <span>✍️ ${article.author || 'Admin'}</span>
                    <span>📅 ${article.createdAt ? new Date(article.createdAt).toLocaleDateString() : 'Noma\'lum'}</span>
                </div>
                ${isAdmin ? `
                <div class="mt-3 flex gap-2">
                    <button onclick="editArticle('${article.id}')" class="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs hover:bg-blue-600 transition">
                        <i data-lucide="edit-2" class="w-3 h-3 inline"></i> Tahrirlash
                    </button>
                    <button onclick="deleteArticle('${article.id}')" class="px-3 py-1 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 transition">
                        <i data-lucide="trash-2" class="w-3 h-3 inline"></i> O'chirish
                    </button>
                </div>
                ` : ''}
            </div>
        `;
        container.appendChild(card);
    });
    
    lucide.createIcons();
}

async function handleArticleSubmit(event) {
    event.preventDefault();
    
    const title = document.getElementById('articleTitleInput').value;
    const author = document.getElementById('articleAuthorInput').value;
    const category = document.getElementById('articleCategoryInput').value;
    const content = document.getElementById('articleContentInput').value;
    const image = document.getElementById('articleImageInput').value;
    const editId = document.getElementById('editArticleId').value;
    
    const articleData = {
        title, author, category, content, image,
        updatedAt: Date.now()
    };
    
    try {
        if (editId) {
            // Tahrirlash
            if (typeof db !== 'undefined') {
                await db.collection('articles').doc(editId).update(articleData);
            } else {
                const index = articles.findIndex(a => a.id === editId);
                if (index !== -1) articles[index] = { ...articles[index], ...articleData };
            }
        } else {
            // Yangi qo'shish
            articleData.createdAt = Date.now();
            if (typeof db !== 'undefined') {
                await db.collection('articles').add(articleData);
            } else {
                articleData.id = Date.now().toString();
                articles.unshift(articleData);
            }
        }
        
        closeCreateArticleModal();
        loadArticles();
        showNotification(editId ? 'Maqola tahrirlandi' : 'Maqola qo\'shildi', 'success');
    } catch (error) {
        console.error('Maqolani saqlashda xatolik:', error);
        showNotification('Xatolik yuz berdi', 'error');
    }
}

function editArticle(id) {
    const article = articles.find(a => a.id === id);
    if (!article) return;
    
    document.getElementById('articleTitleInput').value = article.title;
    document.getElementById('articleAuthorInput').value = article.author;
    document.getElementById('articleCategoryInput').value = article.category;
    document.getElementById('articleContentInput').value = article.content;
    document.getElementById('articleImageInput').value = article.image || '';
    document.getElementById('editArticleId').value = id;
    document.getElementById('editArticleIdContainer').classList.remove('hidden');
    
    document.querySelector('#createArticleModal h3').textContent = 'Maqolani Tahrirlash';
    document.querySelector('#createArticleModal button[type="submit"]').textContent = 'Saqlash';
    
    openCreateArticleModal();
}

async function deleteArticle(id) {
    if (!confirm('Ushbu maqolani o\'chirishga ishonchingiz komilmi?')) return;
    
    try {
        if (typeof db !== 'undefined') {
            await db.collection('articles').doc(id).delete();
        } else {
            articles = articles.filter(a => a.id !== id);
        }
        loadArticles();
        showNotification('Maqola o\'chirildi', 'success');
    } catch (error) {
        console.error('Maqolani o\'chirishda xatolik:', error);
        showNotification('Xatolik yuz berdi', 'error');
    }
}

function openCreateArticleModal() {
    document.getElementById('createArticleModal').classList.remove('hidden');
    document.getElementById('editArticleIdContainer').classList.add('hidden');
    document.querySelector('#createArticleModal h3').textContent = 'Yangi Maqola Chop Etish';
    document.querySelector('#createArticleModal button[type="submit"]').textContent = 'Chop etish';
}

function closeCreateArticleModal() {
    document.getElementById('createArticleModal').classList.add('hidden');
    document.getElementById('articleTitleInput').value = '';
    document.getElementById('articleAuthorInput').value = '';
    document.getElementById('articleCategoryInput').value = 'Odob-axloq';
    document.getElementById('articleContentInput').value = '';
    document.getElementById('articleImageInput').value = '';
    document.getElementById('editArticleId').value = '';
}

function encodeImageFileAsURL(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('articleImageInput').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// ================= ADMIN AUTH =================
async function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('adminEmailInput').value;
    const password = document.getElementById('adminPasswordInput').value;
    
    try {
        if (typeof auth !== 'undefined') {
            await auth.signInWithEmailAndPassword(email, password);
            isAdmin = true;
            document.getElementById('addArticleAdminBtn').classList.remove('hidden');
            closeAdminModal();
            showNotification('Admin kirish muvaffaqiyatli', 'success');
            loadArticles();
        } else {
            // Demo admin
            if (email === 'admin@islamicofficial.com' && password === 'admin123') {
                isAdmin = true;
                document.getElementById('addArticleAdminBtn').classList.remove('hidden');
                closeAdminModal();
                showNotification('Admin kirish muvaffaqiyatli', 'success');
                loadArticles();
            } else {
                showNotification('Email yoki parol noto\'g\'ri', 'error');
            }
        }
    } catch (error) {
        console.error('Kirish xatoligi:', error);
        showNotification('Kirish xatoligi: ' + error.message, 'error');
    }
}

function openAdminModal() {
    document.getElementById('adminAuthModal').classList.remove('hidden');
}

function closeAdminModal() {
    document.getElementById('adminAuthModal').classList.add('hidden');
}

// ================= AI CHAT =================
function toggleAiChatModal() {
    const window = document.getElementById('aiChatWindow');
    window.classList.toggle('hidden');
}

function handleAiChatSubmit(event) {
    event.preventDefault();
    const input = document.getElementById('aiChatInput');
    const message = input.value.trim();
    if (!message) return;
    
    const messagesContainer = document.getElementById('aiChatMessages');
    
    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'bg-brand-800 text-white p-3 rounded-2xl rounded-tr-none max-w-[85%] ml-auto leading-relaxed';
    userMsg.textContent = message;
    messagesContainer.appendChild(userMsg);
    
    input.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Bot response (simulated)
    setTimeout(() => {
        const responses = [
            'Bu savol bo\'yicha Qur\'onda va hadislarda ko\'plab ma\'lumotlar mavjud.',
            'Bu masalaga oid manbalarni ko\'rib chiqishingizni tavsiya qilaman.',
            'Islomda bu mavzu muhim ahamiyatga ega. Tafsilotli ma\'lumot uchun maqolalar bo\'limiga murojaat qiling.',
            'Bu haqda ko\'proq ma\'lumot olish uchun Qur\'on tafsirlarini o\'qishingiz mumkin.',
            'Sizning savolingizga javob berish uchun manbalarni tekshirib ko\'ray...'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const botMsg = document.createElement('div');
        botMsg.className = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 p-3 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed';
        botMsg.innerHTML = `🤖 ${randomResponse}`;
        messagesContainer.appendChild(botMsg);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 1000);
}

// ================= NOTIFICATION =================
function showNotification(message, type = 'success') {
    const colors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        warning: 'bg-amber-500',
        info: 'bg-blue-500'
    };
    
    const div = document.createElement('div');
    div.className = `fixed top-20 right-4 ${colors[type] || 'bg-slate-700'} text-white px-6 py-3 rounded-xl shadow-lg z-50 text-sm font-medium transition-all duration-500`;
    div.textContent = message;
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.style.opacity = '0';
        setTimeout(() => div.remove(), 500);
    }, 3000);
}

// ================= HIJRI DATE =================
async function getHijriDate() {
    try {
        const response = await fetch('https://api.aladhan.com/v1/gToH?date=' + new Date().toISOString().split('T')[0]);
        const data = await response.json();
        if (data.data) {
            document.getElementById('hijriDateText').textContent = 
                `${data.data.hijri.day}-${data.data.hijri.month.en}, ${data.data.hijri.year}`;
        }
    } catch (error) {
        console.error('Hijriy sanani yuklashda xatolik:', error);
    }
}

// ================= INIT =================
document.addEventListener('DOMContentLoaded', function() {
    // Theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.getElementById('themeIconSun').classList.remove('hidden');
        document.getElementById('themeIconMoon').classList.add('hidden');
    }
    
    // Language
    const savedLanguage = localStorage.getItem('language') || 'uz';
    document.getElementById('languageSelect').value = savedLanguage;
    applyLanguage(savedLanguage);
    
    // Load data
    detectUserLocation();
    loadSurahs();
    loadArticles();
    getHijriDate();
    
    // Auto close modals on backdrop click
    document.querySelectorAll('.fixed.inset-0').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
});