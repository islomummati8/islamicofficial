(() => {
  const api = 'https://api.quran.com/api/v4';
  const offlineCacheName = 'islamic-official-quran-audio-v1';
  const offlineLimit = 50 * 1024 * 1024;
  const audio = document.getElementById('audio-player');
  const reciterSelect = document.getElementById('reciter-select');
  const surahSelect = document.getElementById('surah-select');
  const reciterList = document.getElementById('reciter-list');
  const status = document.getElementById('audio-status');
  const saveButton = document.getElementById('offline-save');
  const removeButton = document.getElementById('offline-remove');
  const search = document.getElementById('reciter-search');
  let reciters = [];
  let chapters = [];
  let currentAudioFile;

  function report(message, error = false) {
    status.textContent = message;
    status.dataset.error = String(error);
  }

  async function fetchJson(path) {
    const response = await fetch(`${api}${path}`);
    if (!response.ok) throw new Error(`Audio xizmati HTTP ${response.status} javobi qaytardi.`);
    return response.json();
  }

  function renderReciters(filter = '') {
    const query = filter.trim().toLocaleLowerCase();
    const visible = reciters.filter(reciter =>
      `${reciter.reciter_name} ${reciter.translated_name?.name || ''} ${reciter.style || ''}`.toLocaleLowerCase().includes(query));
    document.getElementById('reciter-count').textContent = `${visible.length} qori`;
    if (!visible.length) {
      reciterList.replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Qidiruv bo‘yicha qori topilmadi.' }));
      return;
    }
    reciterList.replaceChildren(...visible.map(reciter => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'reciter-option';
      button.dataset.reciter = String(reciter.id);
      button.setAttribute('aria-pressed', String(String(reciter.id) === reciterSelect.value));
      const avatar = document.createElement('span');
      avatar.className = 'reciter-avatar';
      avatar.textContent = '♪';
      const label = document.createElement('span');
      label.className = 'reciter-name';
      const name = document.createElement('strong');
      name.textContent = reciter.reciter_name;
      const style = document.createElement('small');
      style.textContent = reciter.style || 'Qiroat';
      label.append(name, style);
      button.append(avatar, label);
      button.addEventListener('click', () => {
        reciterSelect.value = String(reciter.id);
        reciterSelect.dispatchEvent(new Event('change'));
      });
      return button;
    }));
  }

  function updateReciterSelection() {
    document.querySelectorAll('.reciter-option').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.reciter === reciterSelect.value));
    });
  }

  async function updateOfflineState() {
    const file = currentAudioFile;
    if (!file?.audio_url || !('caches' in window)) {
      removeButton.hidden = true;
      return;
    }
    try {
      const cache = await caches.open(offlineCacheName);
      const saved = await cache.match(file.audio_url);
      removeButton.hidden = !saved;
      saveButton.disabled = Boolean(saved);
      saveButton.textContent = saved ? '✓ Oflayn saqlangan' : '⇩ Oflayn saqlash';
    } catch (error) {
      console.error('Could not check offline Quran audio:', error);
      report('Oflayn xotirani tekshirib bo‘lmadi. Brauzer xotira ruxsatlarini tekshiring.', true);
    }
  }

  async function loadTrack(autoplay = true) {
    const chapterId = Number(surahSelect.value);
    const reciterId = Number(reciterSelect.value);
    const reciter = reciters.find(item => item.id === reciterId);
    const chapter = chapters.find(item => item.id === chapterId);
    if (!reciter || !chapter) {
      report('Qori yoki sura ma’lumoti topilmadi. Sahifani yangilang.', true);
      return;
    }
    const playButton = document.getElementById('play-track');
    playButton.disabled = true;
    report('Qiroat manbasi topilmoqda…');
    try {
      const data = await fetchJson(`/chapter_recitations/${reciterId}/${chapterId}?segments=false`);
      if (typeof data.audio_file?.audio_url !== 'string') throw new Error('Tanlangan qori uchun ushbu sura qiroati topilmadi.');
      currentAudioFile = data.audio_file;
      audio.src = currentAudioFile.audio_url;
      audio.load();
      document.getElementById('track-title').textContent = chapter.name_simple;
      document.getElementById('track-byline').textContent = `${reciter.reciter_name}${reciter.style ? ` · ${reciter.style}` : ''}`;
      const sizeBytes = Number(currentAudioFile.file_size);
      document.getElementById('audio-size').textContent = Number.isFinite(sizeBytes) && sizeBytes > 0
        ? `Taxminiy hajm: ${(sizeBytes / (1024 * 1024)).toFixed(1)} MB. Oflayn xotirada saqlanadi.`
        : 'Oflayn nusxa faqat ushbu qurilmada saqlanadi.';
      await updateOfflineState();
      renderReciters(search.value);
      if (autoplay) {
        await audio.play();
        report('Qiroat ijro etilmoqda. Ekran o‘chiqdagi ijro brauzer va qurilmaga bog‘liq.');
      } else {
        report('Qiroat tayyor. Ijroni boshlash uchun tugmani bosing.');
      }
    } catch (error) {
      console.error('Could not load selected Quran audio:', error);
      report(`${error.message} Internet aloqasini tekshirib, qayta urinib ko‘ring.`, true);
    } finally {
      playButton.disabled = false;
    }
  }

  async function saveOffline() {
    if (!currentAudioFile?.audio_url) {
      await loadTrack(false);
      if (!currentAudioFile?.audio_url) return;
    }
    const expectedSize = Number(currentAudioFile.file_size);
    if (expectedSize > offlineLimit) {
      report(`Bu audio ${(expectedSize / (1024 * 1024)).toFixed(1)} MB. Oflayn saqlash limiti 50 MB; uni onlayn tinglashingiz mumkin.`, true);
      return;
    }
    saveButton.disabled = true;
    report('Audio qurilmaga yuklanmoqda. Bu biroz vaqt olishi mumkin…');
    try {
      if (!('caches' in window)) throw new Error('Bu brauzerda oflayn xotira qo‘llab-quvvatlanmaydi.');
      const estimate = await navigator.storage?.estimate?.();
      if (estimate?.quota && estimate.quota - estimate.usage < (expectedSize || 1) * 1.15) {
        throw new Error('Qurilmada audio uchun bo‘sh joy yetarli emas.');
      }
      const response = await fetch(currentAudioFile.audio_url, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`Audio faylini olishda HTTP ${response.status} javobi olindi.`);
      const cache = await caches.open(offlineCacheName);
      await cache.put(currentAudioFile.audio_url, response.clone());
      await updateOfflineState();
      report('Oflayn nusxa shu qurilmaga saqlandi. Endi internet bo‘lmaganda ham tinglashingiz mumkin.');
    } catch (error) {
      console.error('Could not save Quran audio offline:', error);
      saveButton.disabled = false;
      report(`${error.message} Brauzer xotirasini tekshiring yoki onlayn tinglang.`, true);
    }
  }

  async function removeOffline() {
    if (!currentAudioFile?.audio_url) return;
    try {
      const cache = await caches.open(offlineCacheName);
      await cache.delete(currentAudioFile.audio_url);
      await updateOfflineState();
      report('Oflayn nusxa ushbu qurilmadan o‘chirildi.');
    } catch (error) {
      console.error('Could not remove offline Quran audio:', error);
      report('Oflayn nusxani o‘chirib bo‘lmadi. Brauzer xotirasini tekshiring.', true);
    }
  }

  function registerMediaSession() {
    if (!('mediaSession' in navigator) || typeof MediaMetadata !== 'function') return;
    const chapter = chapters.find(item => item.id === Number(surahSelect.value));
    const reciter = reciters.find(item => item.id === Number(reciterSelect.value));
    if (!chapter || !reciter) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: chapter.name_simple,
      artist: reciter.reciter_name,
      album: 'Qur’oni Karim'
    });
    try {
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => changeChapter(-1));
      navigator.mediaSession.setActionHandler('nexttrack', () => changeChapter(1));
    } catch (error) {
      console.warn('Some background media controls are unavailable:', error);
    }
  }

  function changeChapter(delta) {
    const next = Math.min(chapters.length, Math.max(1, Number(surahSelect.value) + delta));
    if (next !== Number(surahSelect.value)) {
      surahSelect.value = String(next);
      loadTrack(true);
    }
  }

  async function initialize() {
    try {
      const [recitationData, chapterData] = await Promise.all([
        fetchJson('/resources/recitations?language=en'),
        fetchJson('/chapters?language=uz')
      ]);
      if (!Array.isArray(recitationData.recitations) || !recitationData.recitations.length) throw new Error('Qori ro‘yxati bo‘sh qaytdi.');
      if (!Array.isArray(chapterData.chapters) || chapterData.chapters.length !== 114) throw new Error('Qur’on suralari to‘liq yuklanmadi.');
      reciters = recitationData.recitations;
      chapters = chapterData.chapters;
      reciterSelect.replaceChildren(...reciters.map(reciter => new Option(
        `${reciter.reciter_name}${reciter.style ? ` · ${reciter.style}` : ''}`,
        String(reciter.id)
      )));
      surahSelect.replaceChildren(...chapters.map(chapter => new Option(
        `${chapter.id}. ${chapter.name_simple}`,
        String(chapter.id)
      )));
      reciterSelect.value = reciters.some(item => item.id === 7) ? '7' : String(reciters[0].id);
      renderReciters();
      document.getElementById('reciter-count').textContent = `${reciters.length} qori`;
      document.getElementById('play-track').addEventListener('click', () => loadTrack(true));
      document.getElementById('previous-track').addEventListener('click', () => changeChapter(-1));
      document.getElementById('next-track').addEventListener('click', () => changeChapter(1));
      reciterSelect.addEventListener('change', () => {
        updateReciterSelection();
        if (currentAudioFile) loadTrack(false);
      });
      surahSelect.addEventListener('change', () => loadTrack(false));
      search.addEventListener('input', () => renderReciters(search.value));
      saveButton.addEventListener('click', saveOffline);
      removeButton.addEventListener('click', removeOffline);
      audio.addEventListener('play', registerMediaSession);
      audio.addEventListener('ended', () => changeChapter(1));
      await loadTrack(false);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./audio-sw.js').catch(error => {
          console.error('Could not register offline audio service worker:', error);
          report('Oflayn pleyer funksiyasini yoqib bo‘lmadi; onlayn tinglash ishlaydi.', true);
        });
      }
    } catch (error) {
      console.error('Could not initialize Quran audio library:', error);
      report(`${error.message} Internet aloqasini tekshirib sahifani yangilang.`, true);
      document.getElementById('reciter-count').textContent = 'Yuklanmadi';
      reciterList.replaceChildren(Object.assign(document.createElement('p'), { className: 'loading', textContent: 'Qori ro‘yxatini yuklab bo‘lmadi. Sahifani yangilang.' }));
    }
  }

  initialize();
})();
