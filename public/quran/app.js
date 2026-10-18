(() => {
  const STORAGE = {
    theme: 'quran-reader-theme',
    mode: 'quran-reader-mode',
    fontSize: 'quran-reader-font-size',
    textSize: 'quran-reader-text-size',
    sizeMode: 'quran-reader-size-mode',
    pageScale: 'quran-reader-page-scale',
    spacing: 'quran-reader-spacing',
    tajweed: 'quran-reader-tajweed',
    bookmarks: 'quran-reader-bookmarks',
    lastRead: 'quran-reader-last-read'
  };
  const body = document.body;
  const surahSelect = document.getElementById('surah-select');
  const juzSelect = document.getElementById('juz-select');
  const modeSelect = document.getElementById('mode-select');
  const readerContent = document.getElementById('reader-content');
  const readerStatus = document.getElementById('reader-status');
  const searchInput = document.getElementById('quran-search');
  const searchResults = document.getElementById('search-results');
  const bookmarkPanel = document.getElementById('bookmarks');
  const bookmarkList = document.getElementById('bookmark-list');
  const bookmarkCount = document.getElementById('bookmark-count');
  const fontSizeOutput = document.getElementById('font-size-value');
  const reciterSelect = document.getElementById('reciter-select');
  const quranAudio = document.getElementById('quran-audio');
  const audioStatus = document.getElementById('audio-status');
  const audioDock = document.getElementById('audio-dock');
  const audioStartVerse = document.getElementById('audio-start-verse');
  const audioEndVerse = document.getElementById('audio-end-verse');
  const translationToggle = document.getElementById('translation-toggle');
  const translationSelect = document.getElementById('translation-select');
  let reciterData;
  let reciterRequest;
  let quran;
  let tajweedData;
  let tajweedRequest;
  let verses = [];
  let verseByKey = new Map();
  let selection = { type: 'surah', number: 1 };
  let currentPage = 1;
  let audioVerseTimings = [];
  let activeAudioVerseKey = null;
  let activeAudioSurah = null;
  let translationCache = new Map();
  let translationRequest = null;
  let verseRepeatCount = 1;
  let activeVerseRepeat = 1;
  let activeRangeRepeat = 1;
  let bookmarks = loadStored(STORAGE.bookmarks, []);
  let scrollObserver;
  let searchTimer;
  let speechRecognition;

  const tajweedClasses = new Set([
    'ham_wasl', 'laam_shamsiyah', 'madda_normal', 'madda_permissible',
    'madda_necessary', 'idgham_wo_ghunnah', 'slnt', 'ghunnah', 'qalaqah',
    'ikhafa', 'madda_obligatory', 'idgham_ghunnah', 'ikhafa_shafawi',
    'idgham_shafawi', 'iqlab', 'idgham_mutajanisayn', 'idgham_mutaqaribayn'
  ]);
  function loadStored(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (error) {
      console.error(`Could not read local Quran reader setting "${key}":`, error);
      return fallback;
    }
  }

  function parseTranslationText(markup) {
    const parsed = new DOMParser().parseFromString(markup, 'text/html');
    parsed.querySelectorAll('sup, script, style').forEach(element => element.remove());
    return parsed.body.textContent || '';
  }

  function saveStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Could not save local Quran reader setting "${key}":`, error);
      readerStatus.textContent = 'Sozlamani qurilmada saqlab bo‘lmadi. Brauzer xotira ruxsatlarini tekshiring.';
    }
    if ([STORAGE.bookmarks, STORAGE.lastRead].includes(key)) syncQuranAccount();
  }

  function syncQuranAccount() {
    const account = window.islamicSiteAccount;
    if (!account?.user) return;
    const lastRead = loadStored(STORAGE.lastRead, null);
    account.save('quran', { bookmarks, lastRead }).catch(error => {
      console.error('Could not sync Quran reading progress:', error);
      readerStatus.textContent = 'Oyatlar qurilmada saqlandi, lekin akkaunt bilan sinxronlanmadi.';
    });
  }

  function validateQuran(data) {
    if (!Array.isArray(data?.surahs) || data.surahs.length !== 114) {
      throw new Error('Qur’on matnida 114 ta sura topilmadi.');
    }
    let ayahCount = 0;
    const juzNumbers = new Set();
    data.surahs.forEach((surah, index) => {
      if (surah.number !== index + 1 || !Array.isArray(surah.ayahs) || !surah.ayahs.length) {
        throw new Error(`Qur’on ma’lumotida ${index + 1}-sura noto‘g‘ri.`);
      }
      surah.ayahs.forEach((ayah, ayahIndex) => {
        if (ayah.numberInSurah !== ayahIndex + 1 || !ayah.text || !Number.isInteger(ayah.juz) || !Number.isInteger(ayah.page)) {
          throw new Error(`${surah.number}:${ayahIndex + 1} oyat ma’lumoti to‘liq emas.`);
        }
        ayahCount += 1;
        juzNumbers.add(ayah.juz);
      });
    });
    if (ayahCount !== 6236 || juzNumbers.size !== 30 || data.surahs[113].ayahs.at(-1).numberInSurah !== 6) {
      throw new Error('Qur’on ma’lumoti 114 sura, 6236 oyat va 30 juz bo‘yicha tekshiruvdan o‘tmadi.');
    }
  }

  function makeSelections() {
    const surahOptions = quran.surahs.map(surah => {
      const option = document.createElement('option');
      option.value = String(surah.number);
      option.textContent = `${String(surah.number).padStart(3, '0')} · ${surah.englishName} · ${surah.ayahs.length} oyat`;
      return option;
    });
    surahSelect.replaceChildren(...surahOptions);
    juzSelect.replaceChildren(...Array.from({ length: 30 }, (_, index) => {
      const option = document.createElement('option');
      option.value = String(index + 1);
      option.textContent = `${index + 1}-juz`;
      return option;
    }));
  }

  function validateTajweedData(data) {
    if (!data?.ayahs || Object.keys(data.ayahs).length !== 6236 || !data.ayahs['1:1'] || !data.ayahs['114:6']) {
      throw new Error('Tajvidli matnda barcha 6 236 oyat topilmadi.');
    }
    const tokens = /<\/?tajweed(?: class=([a-z_]+))?>|[^<>]+|[<>]/g;
    for (const [key, markup] of Object.entries(data.ayahs)) {
      if (!verseByKey.has(key) || typeof markup !== 'string' || !markup) {
        throw new Error(`${key} oyatining tajvid ma’lumoti topilmadi.`);
      }
      const stack = [];
      for (const token of markup.matchAll(tokens)) {
        const value = token[0];
        if (value === '<' || value === '>') throw new Error(`${key} oyatida yaroqsiz belgi bor.`);
        if (value.startsWith('</')) {
          if (stack.pop() === undefined) throw new Error(`${key} oyatining tajvid belgilari noto‘g‘ri.`);
        } else if (value.startsWith('<')) {
          if (!tajweedClasses.has(token[1])) throw new Error(`${key} oyatida noma’lum tajvid belgisi bor.`);
          stack.push(token[1]);
        }
      }
      if (stack.length) throw new Error(`${key} oyatining tajvid belgisi yopilmagan.`);
    }
  }

  function renderTajweedMarkup(container, markup) {
    const parents = [container];
    const tokens = /<\/?tajweed(?: class=([a-z_]+))?>|[^<>]+|[<>]/g;
    for (const token of markup.matchAll(tokens)) {
      const value = token[0];
      if (value.startsWith('</')) {
        if (parents.length > 1) parents.pop();
      } else if (value.startsWith('<tajweed')) {
        const span = document.createElement('span');
        const rule = token[1];
        span.className = `tajweed-mark tajweed-${rule}`;
        span.dataset.rule = rule;
        parents[parents.length - 1].append(span);
        parents.push(span);
      } else {
        parents[parents.length - 1].append(document.createTextNode(value));
      }
    }
  }

  async function loadTajweedData() {
    if (tajweedData) return tajweedData;
    if (!tajweedRequest) {
      tajweedRequest = fetch('./quran-tajweed.json', { cache: 'force-cache' })
        .then(response => {
          if (!response.ok) throw new Error(`Tajvid ma’lumotini yuklashda HTTP ${response.status} javobi olindi.`);
          return response.json();
        })
        .then(data => {
          validateTajweedData(data);
          tajweedData = data;
          return data;
        })
        .catch(error => {
          tajweedRequest = null;
          throw error;
        });
    }
    return tajweedRequest;
  }

  async function loadReciters() {
    if (reciterData) return reciterData;
    if (!reciterRequest) {
      reciterRequest = fetch('https://api.quran.com/api/v4/resources/recitations?language=en')
        .then(response => {
          if (!response.ok) throw new Error(`Qori ro‘yxatini olishda HTTP ${response.status} javobi olindi.`);
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data.recitations) || !data.recitations.length) {
            throw new Error('Qori ro‘yxati bo‘sh qaytdi.');
          }
          reciterData = data.recitations;
          reciterSelect.replaceChildren(...reciterData.map(reciter => {
            const option = document.createElement('option');
            option.value = String(reciter.id);
            option.textContent = `${reciter.reciter_name}${reciter.style ? ` · ${reciter.style}` : ''}`;
            return option;
          }));
          const savedReciter = loadStored('quran-reader-reciter', 7);
          if (reciterData.some(reciter => reciter.id === savedReciter)) {
            reciterSelect.value = String(savedReciter);
          }
          return reciterData;
        })
        .catch(error => {
          reciterRequest = null;
          throw error;
        });
    }
    return reciterRequest;
  }

  async function playSelectedSurah(startVerse = null) {
    const surahNumber = startVerse ? Number(startVerse.surah) : selection.type === 'surah' ? selection.number : currentVerses()[0]?.surah.number;
    if (!surahNumber) {
      audioStatus.textContent = 'Avval surani tanlang.';
      return;
    }
    const playButton = document.getElementById('play-surah');
    playButton.disabled = true;
    audioStatus.textContent = 'Qori qiroati yuklanmoqda…';
    quranAudio.pause();
    audioVerseTimings = [];
    activeAudioVerseKey = null;
    readerContent.querySelectorAll('.ayah.is-audio-active').forEach(ayah => {
      ayah.classList.remove('is-audio-active');
      ayah.removeAttribute('aria-current');
    });
    try {
      const reciters = await loadReciters();
      const reciter = reciters.find(item => item.id === Number(reciterSelect.value));
      if (!reciter) throw new Error('Tanlangan qori ro‘yxatda topilmadi.');
      const response = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciter.id}/${surahNumber}?segments=true`);
      if (!response.ok) throw new Error(`Qiroatni olishda HTTP ${response.status} javobi olindi.`);
      const data = await response.json();
      if (typeof data.audio_file?.audio_url !== 'string') throw new Error('Tanlangan sura qiroati topilmadi.');
      audioVerseTimings = Array.isArray(data.audio_file.timestamps)
        ? data.audio_file.timestamps.filter(timing =>
          verseByKey.has(timing.verse_key) &&
          Number.isFinite(timing.timestamp_from) &&
          Number.isFinite(timing.timestamp_to) &&
          timing.timestamp_to > timing.timestamp_from
        )
        : [];
      const isNewSurah = activeAudioSurah !== surahNumber;
      activeAudioSurah = surahNumber;
      populateAudioVerseRanges(surahNumber, isNewSurah);
      if (startVerse) {
        audioStartVerse.value = String(Number(startVerse.ayah));
        audioEndVerse.value = String(Number(startVerse.ayah));
      }
      activeRangeRepeat = Number(document.getElementById('audio-range-repeat').value);
      verseRepeatCount = Number(document.getElementById('audio-verse-repeat-count').value);
      activeVerseRepeat = verseRepeatCount;
      quranAudio.src = data.audio_file.audio_url;
      quranAudio.load();
      audioDock.hidden = false;
      body.classList.add('audio-player-active');
      document.getElementById('dock-surah').textContent = quran.surahs[surahNumber - 1].englishName;
      await quranAudio.play();
      const firstInRange = selectedAudioRange()[0];
      if (firstInRange) seekToTiming(firstInRange);
      audioStatus.textContent = `${reciter.reciter_name} · ${quran.surahs[surahNumber - 1].englishName}${audioVerseTimings.length ? '' : ' · Bu qiroatda oyat vaqt belgilari mavjud emas.'}`;
      if ('mediaSession' in navigator && typeof MediaMetadata === 'function') {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: quran.surahs[surahNumber - 1].englishName,
          artist: reciter.reciter_name,
          album: 'Qur’oni Karim'
        });
        try {
          navigator.mediaSession.setActionHandler('play', () => quranAudio.play());
          navigator.mediaSession.setActionHandler('pause', () => quranAudio.pause());
        } catch (error) {
          console.warn('Media session controls are unavailable in this browser:', error);
        }
      }
    } catch (error) {
      console.error('Could not play Quran recitation:', error);
      audioStatus.textContent = `${error.message} Internet aloqasini tekshirib, qayta urinib ko‘ring.`;
    } finally {
      playButton.disabled = false;
    }
  }

  function syncAudioVerse() {
    if (!audioVerseTimings.length) return;
    const time = quranAudio.currentTime * 1000;
    const timing = audioVerseTimings.find(item =>
      item.verse_key.split(':')[0] === String(activeAudioSurah) &&
      Number(item.verse_key.split(':')[1]) >= Number(audioStartVerse.value) &&
      Number(item.verse_key.split(':')[1]) <= Number(audioEndVerse.value) &&
      time >= item.timestamp_from && time < item.timestamp_to
    );
    updateAudioProgress();
    if (!timing) return;

    const verse = verseByKey.get(timing.verse_key);
    if (!verse) return;
    const verseChanged = activeAudioVerseKey !== timing.verse_key;
    if (verseChanged) {
      const previous = activeAudioVerseKey && document.getElementById(`ayah-${activeAudioVerseKey.replace(':', '-')}`);
      previous?.classList.remove('is-audio-active');
      previous?.removeAttribute('aria-current');
      activeAudioVerseKey = timing.verse_key;
      activeVerseRepeat = verseRepeatCount;
    }

    let article = document.getElementById(`ayah-${timing.verse_key.replace(':', '-')}`);
    if (!article) {
      if (modeSelect.value === 'mushaf') {
        currentPage = verse.ayah.page;
        renderReader();
      } else {
        setSelection('surah', verse.surah.number, verse.ayah.numberInSurah);
      }
      article = document.getElementById(`ayah-${timing.verse_key.replace(':', '-')}`);
    }
    if (!article) return;

    article.classList.add('is-audio-active');
    article.setAttribute('aria-current', 'true');
    document.getElementById('dock-verse').textContent = `${verse.surah.englishName} · ${verse.ayah.numberInSurah}-oyat`;
    if (verseChanged) article.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function populateAudioVerseRanges(surahNumber, reset = false) {
    const count = quran.surahs[surahNumber - 1].ayahs.length;
    const savedStart = reset ? 1 : Number(audioStartVerse.value) || 1;
    const savedEnd = reset ? count : Number(audioEndVerse.value) || count;
    const options = Array.from({ length: count }, (_, index) => {
      const option = document.createElement('option');
      option.value = String(index + 1);
      option.textContent = `${index + 1}-oyat`;
      return option;
    });
    audioStartVerse.replaceChildren(...options.map(option => option.cloneNode(true)));
    audioEndVerse.replaceChildren(...options.map(option => option.cloneNode(true)));
    audioStartVerse.value = String(Math.min(savedStart, count));
    audioEndVerse.value = String(Math.max(Number(audioStartVerse.value), Math.min(savedEnd, count)));
  }

  function selectedAudioRange() {
    const surah = activeAudioSurah;
    const start = Number(audioStartVerse.value);
    const end = Number(audioEndVerse.value);
    return audioVerseTimings.filter(item => {
      const [itemSurah, itemAyah] = item.verse_key.split(':').map(Number);
      return itemSurah === surah && itemAyah >= start && itemAyah <= end;
    });
  }

  function seekToTiming(timing, resume = !quranAudio.paused) {
    if (!timing) return;
    quranAudio.currentTime = timing.timestamp_from / 1000;
    if (resume) quranAudio.play().catch(error => {
      console.error('Could not resume Quran audio after seeking:', error);
      audioStatus.textContent = 'Audioni davom ettirib bo‘lmadi. Tinglash tugmasini qayta bosing.';
    });
    syncAudioVerse();
  }

  function moveAudioVerse(direction) {
    const range = selectedAudioRange();
    if (!range.length) return;
    const currentIndex = range.findIndex(item => item.verse_key === activeAudioVerseKey);
    const nextIndex = Math.max(0, Math.min(range.length - 1, (currentIndex < 0 ? 0 : currentIndex) + direction));
    seekToTiming(range[nextIndex]);
  }

  function formatAudioTime(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    const value = Math.max(0, Math.floor(seconds));
    return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  }

  function updateAudioProgress() {
    const progress = document.getElementById('audio-progress');
    if (Number.isFinite(quranAudio.duration) && quranAudio.duration > 0) {
      progress.value = String(Math.round(quranAudio.currentTime / quranAudio.duration * 1000));
    } else {
      progress.value = '0';
    }
    document.getElementById('dock-clock').textContent =
      `${formatAudioTime(quranAudio.currentTime)} / ${formatAudioTime(quranAudio.duration)}`;
  }

  function handleAudioTimeUpdate() {
    if (!audioVerseTimings.length) return;
    const time = quranAudio.currentTime * 1000;
    const current = audioVerseTimings.find(item => item.verse_key === activeAudioVerseKey);
    if (current && time >= current.timestamp_to && activeVerseRepeat !== 1) {
      if (activeVerseRepeat === 0 || activeVerseRepeat > 1) {
        if (activeVerseRepeat > 1) activeVerseRepeat -= 1;
        seekToTiming(current);
        return;
      }
    }
    const range = selectedAudioRange();
    const last = range.at(-1);
    if (last && time >= last.timestamp_to) {
      if (activeRangeRepeat === 0 || activeRangeRepeat > 1) {
        if (activeRangeRepeat > 1) activeRangeRepeat -= 1;
        seekToTiming(range[0]);
      } else {
        quranAudio.pause();
        quranAudio.currentTime = last.timestamp_to / 1000;
        audioStatus.textContent = 'Tanlangan oyatlar oralig‘i tugadi.';
      }
      return;
    }
    syncAudioVerse();
  }

  async function loadTranslation(chaptersToLoad = currentVerses().map(verse => verse.surah.number)) {
    const translationId = Number(translationSelect.value);
    const uniqueChapters = [...new Set(chaptersToLoad)];
    const missing = uniqueChapters.filter(number => !translationCache.has(`${translationId}:${number}`));
    if (!missing.length) return;
    if (translationRequest) await translationRequest;
    translationRequest = Promise.all(missing.map(async number => {
      const response = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${number}?translations=${translationId}&per_page=300`);
      if (!response.ok) throw new Error(`Tarjima ma’lumotini yuklashda HTTP ${response.status} javobi olindi.`);
      const data = await response.json();
      if (!Array.isArray(data.verses)) throw new Error('Tarjima oyatlari ro‘yxati yaroqsiz.');
      translationCache.set(`${translationId}:${number}`, new Map(data.verses.map(item => [
        item.verse_key,
        item.translations?.[0]?.text ? parseTranslationText(item.translations[0].text) : ''
      ])));
    })).finally(() => { translationRequest = null; });
    await translationRequest;
  }

  async function renderTranslations() {
    if (!translationToggle.checked || !quran) {
      readerContent.querySelectorAll('.ayah-translation').forEach(item => item.remove());
      return;
    }
    translationToggle.disabled = true;
    readerStatus.textContent = 'Tarjima yuklanmoqda…';
    try {
      const visible = currentVerses();
      await loadTranslation(visible.map(verse => verse.surah.number));
      visible.forEach(verse => {
        const article = document.getElementById(`ayah-${bookmarkKey(verse).replace(':', '-')}`);
        if (!article) return;
        let translation = article.querySelector('.ayah-translation');
        if (!translation) {
          translation = document.createElement('p');
          translation.className = 'ayah-translation';
          article.append(translation);
        }
        const text = translationCache.get(`${Number(translationSelect.value)}:${verse.surah.number}`)?.get(bookmarkKey(verse));
        translation.textContent = text || 'Tarjima topilmadi.';
        translation.lang = ({ '55': 'uz', '79': 'ru', '20': 'en' })[translationSelect.value] || 'uz';
        translation.dir = translation.lang === 'ar' ? 'rtl' : 'auto';
      });
      readerStatus.textContent = '';
    } catch (error) {
      console.error('Could not load Quran verse translations:', error);
      readerStatus.textContent = `${error.message} Tarjimasiz o‘qishda davom etishingiz mumkin.`;
    } finally {
      translationToggle.disabled = false;
    }
  }

  function renderTajweedPreviews() {
    if (!tajweedData) return;
    const sample = tajweedData.ayahs['1:1'];
    const preview = document.getElementById('preview-mushaf');
    preview.replaceChildren();
    renderTajweedMarkup(preview, sample);
  }

  async function applyTajweedPreset(preset) {
    if (!['off', 'mushaf'].includes(preset)) return;
    if (preset !== 'off') {
      readerStatus.textContent = 'Tajvidli matn yuklanmoqda…';
      try {
        await loadTajweedData();
        renderTajweedPreviews();
      } catch (error) {
        console.error('Could not load the verified tajweed Quran text:', error);
        readerStatus.textContent = `${error.message} Tajvidsiz matnni o‘qishda davom etishingiz mumkin.`;
        document.body.dataset.tajweed = 'off';
        document.querySelector('[data-preset="off"]').setAttribute('aria-pressed', 'true');
        return;
      }
    }
    body.dataset.tajweed = preset;
    saveStored(STORAGE.tajweed, preset);
    document.querySelectorAll('.tajweed-preset').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.preset === preset));
    });
    document.getElementById('reading-summary').textContent = `${themeLabel(body.dataset.theme)} · ${preset === 'off' ? 'tajvidsiz' : 'tajvidli'} · ${fontSummary()}`;
    if (quran) renderReader();
    readerStatus.textContent = '';
  }

  function themeLabel(theme) {
    return ({ paper: 'Oq sahifa', cream: 'Qaymoq rang', sepia: 'Sepiya', sage: 'Yumshoq yashil', dark: 'Tungi qoramtir', night: 'Iliq tungi' })[theme] || 'Qaymoq rang';
  }

  function fontSummary() {
    const sizeMode = document.querySelector('input[name="size-mode"]:checked')?.value || 'page';
    return sizeMode === 'page' ? `${fontSizeOutput.textContent} sahifa` : `${fontSizeOutput.textContent} matn`;
  }

  function updateSizeSettings() {
    const sizeMode = document.querySelector('input[name="size-mode"]:checked').value;
    const page = readerContent.querySelector('.reader-page');
    readerContent.dataset.sizeMode = sizeMode;
    if (page) page.style.zoom = sizeMode === 'page' ? `${loadStored(STORAGE.pageScale, 100)}%` : '100%';
    fontSizeOutput.textContent = sizeMode === 'page'
      ? `${loadStored(STORAGE.pageScale, 100)}%`
      : `${loadStored(STORAGE.textSize, loadStored(STORAGE.fontSize, 34))} px`;
    document.getElementById('font-down').setAttribute('aria-label', sizeMode === 'page' ? 'Sahifani kichraytirish' : 'Matnni kichraytirish');
    document.getElementById('font-up').setAttribute('aria-label', sizeMode === 'page' ? 'Sahifani kattalashtirish' : 'Matnni kattalashtirish');
    const textSize = loadStored(STORAGE.textSize, loadStored(STORAGE.fontSize, 34));
    body.style.setProperty('--arabic-size', `${textSize}px`);
    document.getElementById('reading-summary').textContent = `${themeLabel(body.dataset.theme)} · ${body.dataset.tajweed === 'off' ? 'tajvidsiz' : 'tajvidli'} · ${fontSummary()}`;
  }

  function selectedVerses() {
    if (selection.type === 'surah') {
      return verses.filter(verse => verse.surah.number === selection.number);
    }
    return verses.filter(verse => verse.ayah.juz === selection.number);
  }

  function currentVerses() {
    if (modeSelect.value === 'mushaf') {
      return verses.filter(verse => verse.ayah.page === currentPage);
    }
    return selectedVerses();
  }

  function setSelection(type, number, preferredVerse) {
    selection = { type, number };
    if (type === 'surah') {
      surahSelect.value = String(number);
      const surah = quran.surahs[number - 1];
      currentPage = surah.ayahs[0].page;
      if (preferredVerse) currentPage = surah.ayahs[preferredVerse - 1].page;
    } else {
      juzSelect.value = String(number);
      const firstInJuz = verses.find(verse => verse.ayah.juz === number);
      if (firstInJuz) currentPage = firstInJuz.ayah.page;
    }
    if (modeSelect.value === 'mushaf') document.getElementById('progress-label').textContent = `${currentPage} / 604 sahifa`;
    renderReader();
  }

  function bookmarkKey(verse) {
    return `${verse.surah.number}:${verse.ayah.numberInSurah}`;
  }

  function renderSurahHeading(container, surah, startsAtBeginning) {
    const heading = document.createElement('header');
    heading.className = 'surah-heading';
    const arabicName = document.createElement('span');
    arabicName.className = 'surah-name-ar';
    arabicName.textContent = surah.name;
    arabicName.lang = 'ar';
    arabicName.dir = 'rtl';
    const transliteration = document.createElement('span');
    transliteration.className = 'surah-name-latin';
    transliteration.textContent = `${surah.number}. ${surah.englishName}`;
    heading.append(arabicName, transliteration);
    container.append(heading);

    if (startsAtBeginning && surah.number !== 1 && surah.number !== 9) {
      const basmala = document.createElement('p');
      basmala.className = 'basmala';
      basmala.lang = 'ar';
      basmala.dir = 'rtl';
      if (body.dataset.tajweed !== 'off' && tajweedData?.ayahs['1:1']) {
        renderTajweedMarkup(basmala, tajweedData.ayahs['1:1']);
      } else {
        basmala.textContent = quran.surahs[0].ayahs[0].text;
      }
      container.append(basmala);
    }
  }

  function renderVerse(verse) {
    const key = bookmarkKey(verse);
    const article = document.createElement('article');
    article.className = 'ayah';
    article.dataset.verse = key;
    article.id = `ayah-${key.replace(':', '-')}`;
    if (key === activeAudioVerseKey) {
      article.classList.add('is-audio-active');
      article.setAttribute('aria-current', 'true');
    }
    const text = document.createElement('span');
    text.className = 'ayah-text';
    text.setAttribute('role', 'button');
    text.tabIndex = 0;
    text.setAttribute('aria-label', `${verse.ayah.numberInSurah}-oyatni tinglash`);
    const verseKey = bookmarkKey(verse);
    if (body.dataset.tajweed !== 'off' && tajweedData?.ayahs[verseKey]) {
      renderTajweedMarkup(text, tajweedData.ayahs[verseKey]);
    } else {
      text.textContent = verse.ayah.text;
    }
    const number = document.createElement('button');
    number.className = 'ayah-number';
    number.type = 'button';
    number.dataset.bookmark = verseKey;
    number.textContent = new Intl.NumberFormat('ar-EG', { useGrouping: false }).format(verse.ayah.numberInSurah);
    number.setAttribute('aria-pressed', String(bookmarks.includes(verseKey)));
    number.setAttribute('aria-label', bookmarks.includes(verseKey) ? 'Saqlangan oyatni olib tashlash' : `${verse.ayah.numberInSurah}-oyatni saqlash`);
    const playButton = document.createElement('button');
    playButton.className = 'ayah-play-button';
    playButton.type = 'button';
    playButton.dataset.playVerse = verseKey;
    playButton.textContent = '▶';
    playButton.setAttribute('aria-label', 'Oyatni tinglash');
    const saveButton = document.createElement('button');
    saveButton.className = 'bookmark-button';
    saveButton.type = 'button';
    saveButton.dataset.bookmark = key;
    saveButton.setAttribute('aria-pressed', String(bookmarks.includes(key)));
    saveButton.setAttribute('aria-label', bookmarks.includes(key) ? 'Oyatni saqlanganlardan olib tashlash' : 'Oyatni saqlash');
    saveButton.textContent = bookmarks.includes(key) ? '★' : '☆';
    article.append(text, number, playButton, saveButton);
    return article;
  }

  function renderReader() {
    if (!quran) return;
    const visibleVerses = currentVerses();
    const page = document.createElement('div');
    page.className = 'reader-page';
    let activeSurah;
    let ayahList;
    visibleVerses.forEach(verse => {
      if (verse.surah.number !== activeSurah) {
        activeSurah = verse.surah.number;
        const group = document.createElement('section');
        group.className = 'surah-group';
        group.dataset.surah = String(activeSurah);
        renderSurahHeading(group, verse.surah, verse.ayah.numberInSurah === 1);
        ayahList = document.createElement('div');
        ayahList.className = 'ayah-list';
        ayahList.dataset.mode = modeSelect.value;
        ayahList.dataset.spacing = readerContent.dataset.spacing || 'relaxed';
        group.append(ayahList);
        page.append(group);
      }
      ayahList.append(renderVerse(verse));
    });
    readerContent.replaceChildren(page);
    readerContent.dataset.mode = modeSelect.value;
    readerContent.dataset.tajweed = body.dataset.tajweed || 'off';
    document.getElementById('tajweed-legend').hidden = body.dataset.tajweed === 'off';
    document.getElementById('horizontal-hint').hidden = modeSelect.value !== 'mushaf' || window.innerWidth > 820;
    const sizeMode = document.querySelector('input[name="size-mode"]:checked')?.value || 'page';
    readerContent.dataset.sizeMode = sizeMode;
    page.style.zoom = sizeMode === 'page' ? `${loadStored(STORAGE.pageScale, 100)}%` : '100%';
    document.getElementById('reader-title').textContent = modeSelect.value === 'mushaf'
      ? `Mushaf sahifasi ${currentPage}`
      : selection.type === 'surah'
        ? `${selection.number}. ${quran.surahs[selection.number - 1].englishName}`
        : `${selection.number}-juz`;
    document.getElementById('reader-subtitle').textContent = selection.type === 'surah'
      ? `SURA ${selection.number} · ${quran.surahs[selection.number - 1].ayahs.length} OYAT`
      : `JUZ ${selection.number} · ${visibleVerses.length} OYAT`;
    const representative = visibleVerses[0];
    document.getElementById('juz-label').textContent = representative ? `${representative.ayah.juz}-juz` : '';
    document.getElementById('page-label').textContent = representative ? `${representative.ayah.page}-sahifa` : '';
    document.getElementById('reading-progress').value = representative?.ayah.page ?? currentPage;
    document.getElementById('progress-label').textContent = representative
      ? `${representative.ayah.page} / 604 sahifa · ${representative.ayah.juz}-juz`
      : `${currentPage} / 604 sahifa`;
    document.getElementById('navigation-label').textContent = modeSelect.value === 'mushaf'
      ? `Sahifa ${currentPage} / 604`
      : selection.type === 'surah'
        ? `Sura ${selection.number} / 114`
        : `Juz ${selection.number} / 30`;
    document.getElementById('previous-button').disabled = modeSelect.value === 'mushaf'
      ? currentPage <= 1
      : selection.number <= 1;
    document.getElementById('next-button').disabled = modeSelect.value === 'mushaf'
      ? currentPage >= 604
      : selection.number >= (selection.type === 'surah' ? 114 : 30);
    observeVerses();
    if (translationToggle.checked) renderTranslations();
  }

  function observeVerses() {
    if (scrollObserver) scrollObserver.disconnect();
    if (!('IntersectionObserver' in window)) return;
    scrollObserver = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((first, second) => first.boundingClientRect.top - second.boundingClientRect.top)[0];
      if (!visible) return;
      const [surahNumber, ayahNumber] = visible.target.dataset.verse.split(':').map(Number);
      const verse = verseByKey.get(`${surahNumber}:${ayahNumber}`);
      if (!verse) return;
      saveStored(STORAGE.lastRead, { surah: surahNumber, ayah: ayahNumber });
      document.getElementById('resume-button').hidden = false;
      document.getElementById('reading-progress').value = verse.ayah.page;
      document.getElementById('progress-label').textContent = `${verse.ayah.page} / 604 sahifa · ${verse.ayah.juz}-juz`;
    }, { rootMargin: '-18% 0px -68% 0px' });
    readerContent.querySelectorAll('.ayah').forEach(ayah => scrollObserver.observe(ayah));
  }

  function updateBookmarks() {
    bookmarkCount.textContent = String(bookmarks.length);
    const saved = bookmarks.map(key => verseByKey.get(key)).filter(Boolean);
    if (!saved.length) {
      const empty = document.createElement('p');
      empty.className = 'bookmark-empty';
      empty.textContent = 'Hali saqlangan oyat yo‘q. O‘qish davomida ☆ tugmasini bosing.';
      bookmarkList.replaceChildren(empty);
      return;
    }
    const fragment = document.createDocumentFragment();
    saved.forEach(verse => {
      const button = document.createElement('button');
      button.className = 'bookmark-item';
      button.type = 'button';
      button.dataset.jump = bookmarkKey(verse);
      button.dir = 'auto';
      button.textContent = `${verse.surah.number}. ${verse.surah.englishName} · ${verse.ayah.numberInSurah}-oyat`;
      fragment.append(button);
    });
    bookmarkList.replaceChildren(fragment);
  }

  function normalizedArabic(text) {
    return text.normalize('NFD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').toLocaleLowerCase();
  }

  function showSearchResults(query) {
    const cleaned = query.trim();
    searchResults.replaceChildren();
    if (!cleaned) {
      searchResults.hidden = true;
      return;
    }
    const reference = cleaned.match(/^(\d{1,3})\s*[:.]\s*(\d{1,3})$/);
    let matches;
    if (reference) {
      const verse = verseByKey.get(`${Number(reference[1])}:${Number(reference[2])}`);
      matches = verse ? [verse] : [];
    } else {
      const normalized = normalizedArabic(cleaned);
      matches = verses.filter(verse =>
        `${verse.surah.number} ${verse.surah.englishName} ${verse.surah.name}`.toLocaleLowerCase().includes(cleaned.toLocaleLowerCase())
        || normalizedArabic(verse.ayah.text).includes(normalized)
      ).slice(0, 30);
    }
    const fragment = document.createDocumentFragment();
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'search-empty';
      empty.textContent = 'Mos oyat topilmadi. Sura nomi, oyat manzili (masalan, 2:255) yoki arabcha matnni kiriting.';
      fragment.append(empty);
    } else {
      matches.forEach(verse => {
        const button = document.createElement('button');
        button.className = 'search-result';
        button.type = 'button';
        button.dataset.jump = bookmarkKey(verse);
        const location = document.createElement('strong');
        location.textContent = `${verse.surah.englishName} · ${verse.ayah.numberInSurah}-oyat`;
        const snippet = document.createElement('span');
        snippet.textContent = verse.ayah.text;
        snippet.lang = 'ar';
        snippet.dir = 'rtl';
        button.append(location, snippet);
        fragment.append(button);
      });
    }
    searchResults.append(fragment);
    searchResults.hidden = false;
  }

  function jumpToVerse(key) {
    const verse = verseByKey.get(key);
    if (!verse) return;
    modeSelect.value = 'scroll';
    body.dataset.mode = 'scroll';
    saveStored(STORAGE.mode, 'scroll');
    currentPage = verse.ayah.page;
    setSelection('surah', verse.surah.number, verse.ayah.numberInSurah);
    searchResults.hidden = true;
    searchInput.value = '';
    requestAnimationFrame(() => document.getElementById(`ayah-${key.replace(':', '-')}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }

  function moveSelection(direction) {
    if (modeSelect.value === 'mushaf') {
      currentPage += direction;
      renderReader();
      readerContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setSelection(selection.type, selection.number + direction);
    document.getElementById('reader-content').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function loadQuran() {
    readerStatus.textContent = 'Qur’onning to‘liq matni yuklanmoqda…';
    try {
      const response = await fetch('./quran.json', { cache: 'force-cache' });
      if (!response.ok) throw new Error(`Qur’on matnini yuklashda HTTP ${response.status} javobi olindi.`);
      const data = await response.json();
      validateQuran(data);
      quran = data;
      verses = quran.surahs.flatMap(surah => surah.ayahs.map(ayah => ({ surah, ayah })));
      verseByKey = new Map(verses.map(verse => [bookmarkKey(verse), verse]));
      makeSelections();
      const theme = loadStored(STORAGE.theme, 'cream');
      const mode = loadStored(STORAGE.mode, 'scroll');
      const spacing = loadStored(STORAGE.spacing, 'relaxed');
      const sizeMode = loadStored(STORAGE.sizeMode, 'page');
      const savedTajweed = loadStored(STORAGE.tajweed, 'off');
      const tajweedPreset = savedTajweed === 'off'
        ? 'off'
        : ['mushaf', 'classic', 'soft', 'contrast'].includes(savedTajweed) ? 'mushaf' : 'off';
      if (['paper', 'cream', 'sepia', 'sage', 'dark', 'night'].includes(theme)) {
        body.dataset.theme = theme;
        document.getElementById('theme-select').value = theme;
      }
      body.dataset.tajweed = tajweedPreset;
      saveStored(STORAGE.tajweed, tajweedPreset);
      document.querySelectorAll('.tajweed-preset').forEach(button => {
        button.setAttribute('aria-pressed', String(button.dataset.preset === tajweedPreset));
      });
      if (['scroll', 'mushaf', 'focus'].includes(mode)) {
        modeSelect.value = mode;
        body.dataset.mode = mode;
      }
      if (['page', 'text'].includes(sizeMode)) {
        document.querySelector(`input[name="size-mode"][value="${sizeMode}"]`).checked = true;
      }
      if (['normal', 'relaxed', 'wide'].includes(spacing)) {
        document.getElementById('spacing-select').value = spacing;
        readerContent.dataset.spacing = spacing;
      }
      const savedPageScale = loadStored(STORAGE.pageScale, 100);
      const savedTextSize = loadStored(STORAGE.textSize, loadStored(STORAGE.fontSize, 34));
      saveStored(STORAGE.pageScale, Number.isInteger(savedPageScale) ? Math.min(160, Math.max(70, savedPageScale)) : 100);
      saveStored(STORAGE.textSize, Number.isInteger(savedTextSize) ? Math.min(54, Math.max(22, savedTextSize)) : 34);
      updateSizeSettings();
      bookmarks = Array.isArray(bookmarks) ? bookmarks.filter(key => verseByKey.has(key)) : [];
      updateBookmarks();
      const lastRead = loadStored(STORAGE.lastRead, null);
      if (lastRead && verseByKey.has(`${lastRead.surah}:${lastRead.ayah}`)) {
        setSelection('surah', lastRead.surah, lastRead.ayah);
        document.getElementById('resume-button').hidden = false;
      } else {
        setSelection('surah', 1);
      }
      readerStatus.textContent = '';
      if (body.dataset.tajweed !== 'off') applyTajweedPreset(body.dataset.tajweed);
      if (window.islamicSiteAccount?.user) {
        window.dispatchEvent(new CustomEvent('islamic-account-changed', { detail: { user: window.islamicSiteAccount.user } }));
      }
    } catch (error) {
      console.error('Could not load the complete Quran text:', error);
      readerStatus.replaceChildren();
      const message = document.createElement('span');
      message.textContent = `${error.message} Sahifani yangilang yoki qayta urinib ko‘ring.`;
      const retry = document.createElement('button');
      retry.className = 'button button-secondary';
      retry.type = 'button';
      retry.textContent = 'Qayta yuklash';
      retry.addEventListener('click', loadQuran, { once: true });
      readerStatus.append(message, retry);
    }
  }

  surahSelect.addEventListener('change', () => setSelection('surah', Number(surahSelect.value)));
  juzSelect.addEventListener('change', () => setSelection('juz', Number(juzSelect.value)));
  modeSelect.addEventListener('change', () => {
    body.dataset.mode = modeSelect.value;
    if (modeSelect.value === 'mushaf') {
      const first = selectedVerses()[0];
      if (first) currentPage = first.ayah.page;
    }
    saveStored(STORAGE.mode, modeSelect.value);
    renderReader();
  });
  document.getElementById('theme-select').addEventListener('change', event => {
    body.dataset.theme = event.target.value;
    saveStored(STORAGE.theme, event.target.value);
    updateSizeSettings();
  });
  document.getElementById('spacing-select').addEventListener('change', event => {
    readerContent.dataset.spacing = event.target.value;
    saveStored(STORAGE.spacing, event.target.value);
  });
  document.getElementById('font-down').addEventListener('click', () => adjustFontSize(-2));
  document.getElementById('font-up').addEventListener('click', () => adjustFontSize(2));
  document.querySelectorAll('input[name="size-mode"]').forEach(input => {
    input.addEventListener('change', event => {
      saveStored(STORAGE.sizeMode, event.target.value);
      updateSizeSettings();
      renderReader();
    });
  });
  function adjustFontSize(change) {
    if (document.querySelector('input[name="size-mode"]:checked').value === 'page') {
      const current = loadStored(STORAGE.pageScale, 100);
      const next = Math.min(160, Math.max(70, current + Math.sign(change) * 10));
      saveStored(STORAGE.pageScale, next);
    } else {
      const current = loadStored(STORAGE.textSize, 34);
      const next = Math.min(54, Math.max(22, current + change));
      saveStored(STORAGE.textSize, next);
      saveStored(STORAGE.fontSize, next);
    }
    updateSizeSettings();
    const page = readerContent.querySelector('.reader-page');
    if (page) page.style.zoom = document.querySelector('input[name="size-mode"]:checked').value === 'page'
      ? `${loadStored(STORAGE.pageScale, 100)}%`
      : '100%';
  }

  document.getElementById('settings-open').addEventListener('click', async () => {
    document.getElementById('reader-settings').showModal();
    try {
      await loadTajweedData();
      renderTajweedPreviews();
    } catch (error) {
      console.error('Could not prepare tajweed style previews:', error);
      readerStatus.textContent = `${error.message} Rangli tajvid namunalarini yuklab bo‘lmadi.`;
    }
  });
  document.getElementById('reader-settings').addEventListener('click', event => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
  document.querySelectorAll('.tajweed-preset').forEach(button => {
    button.addEventListener('click', () => applyTajweedPreset(button.dataset.preset));
  });
  window.addEventListener('islamic-account-changed', async event => {
    const account = window.islamicSiteAccount;
    if (!event.detail?.user || !account || !quran) return;
    try {
      const cloud = await account.load('quran');
      if (cloud?.data && typeof cloud.data === 'object') {
        const remoteBookmarks = Array.isArray(cloud.data.bookmarks) ? cloud.data.bookmarks.filter(key => verseByKey.has(key)) : [];
        bookmarks = [...new Set([...bookmarks, ...remoteBookmarks])].slice(0, 1000);
        saveStored(STORAGE.bookmarks, bookmarks);
        const localLastRead = loadStored(STORAGE.lastRead, null);
        const remoteLastRead = cloud.data.lastRead;
        if (!localLastRead && remoteLastRead && verseByKey.has(`${remoteLastRead.surah}:${remoteLastRead.ayah}`)) {
          saveStored(STORAGE.lastRead, remoteLastRead);
        }
        updateBookmarks();
      }
      await account.save('quran', { bookmarks, lastRead: loadStored(STORAGE.lastRead, null) });
    } catch (error) {
      console.error('Could not restore Quran account data:', error);
      readerStatus.textContent = 'Akkauntdagi Qur’on saqlanganlarini yuklab bo‘lmadi.';
    }
  });
  document.getElementById('play-surah').addEventListener('click', playSelectedSurah);
  reciterSelect.addEventListener('change', () => saveStored('quran-reader-reciter', Number(reciterSelect.value)));
  translationToggle.addEventListener('change', renderTranslations);
  translationSelect.addEventListener('change', () => {
    translationCache.clear();
    renderTranslations();
  });
  document.getElementById('audio-play-pause').addEventListener('click', () => {
    if (!quranAudio.src) {
      playSelectedSurah();
      return;
    }
    if (quranAudio.paused) quranAudio.play().catch(error => {
      console.error('Could not resume Quran audio:', error);
      audioStatus.textContent = 'Audioni ishga tushirib bo‘lmadi. Qayta urinib ko‘ring.';
    });
    else quranAudio.pause();
  });
  document.getElementById('audio-stop').addEventListener('click', () => {
    quranAudio.pause();
    quranAudio.currentTime = 0;
    updateAudioProgress();
    activeAudioVerseKey = null;
    readerContent.querySelectorAll('.ayah.is-audio-active').forEach(ayah => {
      ayah.classList.remove('is-audio-active');
      ayah.removeAttribute('aria-current');
    });
    document.getElementById('dock-verse').textContent = 'Ijro to‘xtatildi';
  });
  document.getElementById('audio-previous-verse').addEventListener('click', () => moveAudioVerse(-1));
  document.getElementById('audio-next-verse').addEventListener('click', () => moveAudioVerse(1));
  document.getElementById('audio-repeat-verse').addEventListener('click', event => {
    const enabled = event.currentTarget.getAttribute('aria-pressed') !== 'true';
    event.currentTarget.setAttribute('aria-pressed', String(enabled));
    event.currentTarget.setAttribute('aria-label', enabled ? 'Oyatni takrorlashni o‘chirish' : 'Oyatni takrorlashni yoqish');
    document.getElementById('audio-verse-repeat-count').value = enabled ? '0' : '1';
    verseRepeatCount = enabled ? 0 : 1;
    activeVerseRepeat = verseRepeatCount;
  });
  document.getElementById('audio-speed').addEventListener('change', event => {
    quranAudio.playbackRate = Number(event.target.value);
  });
  document.getElementById('audio-progress').addEventListener('input', event => {
    if (Number.isFinite(quranAudio.duration)) {
      quranAudio.currentTime = quranAudio.duration * Number(event.target.value) / 1000;
      syncAudioVerse();
    }
  });
  document.getElementById('audio-settings-toggle').addEventListener('click', event => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    document.getElementById('audio-range-settings').hidden = !expanded;
  });
  audioStartVerse.addEventListener('change', () => {
    if (Number(audioStartVerse.value) > Number(audioEndVerse.value)) audioEndVerse.value = audioStartVerse.value;
    activeRangeRepeat = Number(document.getElementById('audio-range-repeat').value);
    const first = selectedAudioRange()[0];
    if (first) seekToTiming(first);
  });
  audioEndVerse.addEventListener('change', () => {
    if (Number(audioEndVerse.value) < Number(audioStartVerse.value)) audioStartVerse.value = audioEndVerse.value;
    activeRangeRepeat = Number(document.getElementById('audio-range-repeat').value);
  });
  document.getElementById('audio-range-repeat').addEventListener('change', event => {
    activeRangeRepeat = Number(event.target.value);
  });
  document.getElementById('audio-verse-repeat-count').addEventListener('change', event => {
    verseRepeatCount = Number(event.target.value);
    activeVerseRepeat = verseRepeatCount;
    document.getElementById('audio-repeat-verse').setAttribute('aria-pressed', String(activeVerseRepeat === 0));
  });
  quranAudio.addEventListener('timeupdate', handleAudioTimeUpdate);
  quranAudio.addEventListener('timeupdate', updateAudioProgress);
  quranAudio.addEventListener('loadedmetadata', updateAudioProgress);
  quranAudio.addEventListener('play', () => {
    document.getElementById('audio-play-pause').textContent = 'Ⅱ';
    document.getElementById('audio-play-pause').setAttribute('aria-label', 'Pauza');
  });
  quranAudio.addEventListener('pause', () => {
    document.getElementById('audio-play-pause').textContent = '▶';
    document.getElementById('audio-play-pause').setAttribute('aria-label', 'Tinglash');
  });

  document.getElementById('voice-search').addEventListener('click', () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      readerStatus.textContent = 'Bu brauzer ovozli qidiruvni qo‘llamaydi. Matn orqali qidirishingiz mumkin.';
      return;
    }
    speechRecognition?.abort();
    speechRecognition = new Recognition();
    speechRecognition.lang = 'ar-SA';
    speechRecognition.interimResults = false;
    speechRecognition.maxAlternatives = 1;
    readerStatus.textContent = 'Arabcha ovozli qidiruv tinglanmoqda…';
    speechRecognition.onresult = event => {
      searchInput.value = event.results[0][0].transcript;
      showSearchResults(searchInput.value);
      readerStatus.textContent = 'Ovoz matnga aylantirildi. Natijani tanlang. Brauzerning nutq xizmati ishlatilishi mumkin.';
      searchResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    speechRecognition.onerror = event => {
      readerStatus.textContent = event.error === 'not-allowed'
        ? 'Ovozli qidiruv uchun mikrofon ruxsati berilmadi.'
        : `Ovozli qidiruv amalga oshmadi (${event.error}). Matn orqali qidiring.`;
    };
    speechRecognition.onend = () => {
      if (readerStatus.textContent === 'Arabcha ovozli qidiruv tinglanmoqda…') {
        readerStatus.textContent = 'Ovoz aniqlanmadi. Qayta urinib ko‘ring yoki matn orqali qidiring.';
      }
    };
    try {
      speechRecognition.start();
    } catch (error) {
      console.error('Voice Quran search could not start:', error);
      readerStatus.textContent = 'Ovozli qidiruvni boshlab bo‘lmadi. Mikrofon ruxsatlarini tekshiring.';
    }
  });

  const orientationToggle = document.getElementById('orientation-toggle');
  orientationToggle.addEventListener('click', async () => {
    const readerCard = document.querySelector('.reader-card');
    if (document.fullscreenElement) {
      try {
        screen.orientation?.unlock();
        await document.exitFullscreen();
      } catch (error) {
        console.error('Could not exit reader fullscreen:', error);
        readerStatus.textContent = 'To‘liq ekrandan chiqib bo‘lmadi. Qurilmaning Esc yoki orqaga qaytish tugmasini bosing.';
      }
      return;
    }
    try {
      await readerCard.requestFullscreen();
      if (screen.orientation?.lock) {
        try {
          await screen.orientation.lock('landscape');
        } catch (error) {
          console.warn('Landscape orientation lock is unavailable:', error);
          readerStatus.textContent = 'To‘liq ekran yoqildi. Telefonni yonbosh aylantiring; sahifani chap-o‘ngga surishingiz mumkin.';
        }
      } else {
        readerStatus.textContent = 'To‘liq ekran yoqildi. Telefonni yonbosh aylantiring; sahifani chap-o‘ngga surishingiz mumkin.';
      }
    } catch (error) {
      console.error('Could not enable landscape reader mode:', error);
      readerStatus.textContent = 'Gorizontal rejimni avtomatik yoqib bo‘lmadi. Qurilma ekranini yonbosh aylantiring yoki sahifani chap-o‘ngga suring.';
    }
  });
  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    orientationToggle.setAttribute('aria-pressed', String(active));
    orientationToggle.textContent = active ? 'Gorizontal rejimdan chiqish' : '↻ Gorizontal o‘qish';
  });
  window.addEventListener('resize', () => {
    document.getElementById('horizontal-hint').hidden = modeSelect.value !== 'mushaf' || window.innerWidth > 820;
  });

  document.getElementById('previous-button').addEventListener('click', () => moveSelection(-1));
  document.getElementById('next-button').addEventListener('click', () => moveSelection(1));
  document.getElementById('resume-button').addEventListener('click', () => {
    const lastRead = loadStored(STORAGE.lastRead, null);
    if (lastRead) jumpToVerse(`${lastRead.surah}:${lastRead.ayah}`);
  });
  searchInput.addEventListener('input', () => {
    window.clearTimeout(searchTimer);
    searchTimer = window.setTimeout(() => showSearchResults(searchInput.value), 160);
  });
  searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      window.clearTimeout(searchTimer);
      showSearchResults(searchInput.value);
      searchResults.querySelector('.search-result')?.click();
    }
    if (event.key === 'Escape') searchResults.hidden = true;
  });

  readerContent.addEventListener('keydown', event => {
    if (!['Enter', ' '].includes(event.key)) return;
    const text = event.target.closest('.ayah-text');
    if (!text) return;
    event.preventDefault();
    const ayah = text.closest('.ayah');
    const [surah, ayahNumber] = ayah.dataset.verse.split(':').map(Number);
    setSelection('surah', surah, ayahNumber);
    playSelectedSurah({ surah, ayah: ayahNumber });
  });
  readerContent.addEventListener('click', event => {
    const playButton = event.target.closest('[data-play-verse]');
    if (playButton) {
      const [surah, ayah] = playButton.dataset.playVerse.split(':').map(Number);
      setSelection('surah', surah, ayah);
      playSelectedSurah({ surah, ayah });
      return;
    }
    const ayahText = event.target.closest('.ayah-text');
    if (ayahText) {
      const [surah, ayah] = ayahText.closest('.ayah').dataset.verse.split(':').map(Number);
      setSelection('surah', surah, ayah);
      playSelectedSurah({ surah, ayah });
      return;
    }
    const saveButton = event.target.closest('[data-bookmark]');
    if (!saveButton) return;
    const key = saveButton.dataset.bookmark;
    bookmarks = bookmarks.includes(key) ? bookmarks.filter(item => item !== key) : [...bookmarks, key];
    saveStored(STORAGE.bookmarks, bookmarks);
    updateBookmarks();
    const verse = verseByKey.get(key);
    readerContent.querySelectorAll(`[data-bookmark="${key}"]`).forEach(currentButton => {
      const isSaved = bookmarks.includes(key);
      currentButton.setAttribute('aria-pressed', String(isSaved));
      currentButton.setAttribute('aria-label', currentButton.classList.contains('ayah-number')
        ? (isSaved ? 'Saqlangan oyatni olib tashlash' : `${verse.ayah.numberInSurah}-oyatni saqlash`)
        : (isSaved ? 'Oyatni saqlanganlardan olib tashlash' : 'Oyatni saqlash'));
      if (currentButton.classList.contains('bookmark-button')) currentButton.textContent = isSaved ? '★' : '☆';
    });
    if (verse) readerStatus.textContent = bookmarks.includes(key) ? 'Oyat qurilmangizda saqlandi.' : 'Oyat saqlanganlardan olib tashlandi.';
  });
  bookmarkList.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) jumpToVerse(button.dataset.jump);
  });
  searchResults.addEventListener('click', event => {
    const button = event.target.closest('[data-jump]');
    if (button) jumpToVerse(button.dataset.jump);
  });
  document.getElementById('bookmarks-toggle').addEventListener('click', event => {
    const expanded = event.currentTarget.getAttribute('aria-expanded') !== 'true';
    event.currentTarget.setAttribute('aria-expanded', String(expanded));
    bookmarkPanel.hidden = !expanded;
    if (expanded) bookmarkPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.getElementById('bookmarks-close').addEventListener('click', () => {
    bookmarkPanel.hidden = true;
    document.getElementById('bookmarks-toggle').setAttribute('aria-expanded', 'false');
  });

  loadQuran();
})();
