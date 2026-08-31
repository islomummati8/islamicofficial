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