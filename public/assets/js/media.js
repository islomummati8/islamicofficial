import { aiProviders, getAiApiKey, requestAiText, transcribeYouTubeVideo } from './ai-client.js?v=2026101103';
import { getApps, initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY",
  authDomain: "islamicofficial-9279f.firebaseapp.com",
  projectId: "islamicofficial-9279f",
  storageBucket: "islamicofficial-9279f.firebasestorage.app",
  messagingSenderId: "251823878076",
  appId: "1:251823878076:web:9eff3e9b8b01f6f827c5b9"
};

const app = getApps().find((firebaseApp) => firebaseApp.name === '[DEFAULT]')
  || initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const adminEmail = 'islomummati8@gmail.com';
const youtubeCaptionScope = 'https://www.googleapis.com/auth/youtube.force-ssl';
const youtubeCaptionScopeVerified = false;
let mediaUser = auth.currentUser;
const authProfileListeners = new Set();
let requestAnonymousSignIn = false;
let resolveMediaAuth;
let mediaAuthResolved = false;
const mediaAuthReady = new Promise((resolve) => {
  resolveMediaAuth = resolve;
});
onAuthStateChanged(auth, (user) => {
  mediaUser = user;
  authProfileListeners.forEach((listener) => listener(user));
  if (user) {
    if (!mediaAuthResolved) {
      mediaAuthResolved = true;
      resolveMediaAuth(user);
    } else {
      connectMediaLibrary(user);
    }
    return;
  }
  if (!requestAnonymousSignIn) {
    requestAnonymousSignIn = true;
    signInAnonymously(auth).then((credential) => {
      mediaUser = credential.user;
      if (!mediaAuthResolved) {
        mediaAuthResolved = true;
        resolveMediaAuth(credential.user);
      }
    }).catch((error) => {
      console.error('Anonymous media sign-in failed:', error);
      if (!mediaAuthResolved) {
        mediaAuthResolved = true;
        resolveMediaAuth(null);
      }
    });
  }
}, (error) => {
  console.error('Firebase media auth state error:', error);
  if (!mediaAuthResolved) {
    mediaAuthResolved = true;
    resolveMediaAuth(null);
  }
});
const videoList = document.getElementById('media-videos-list');
const status = document.getElementById('media-videos-status');
const queueList = document.getElementById('media-queue-list');
const queueCount = document.getElementById('media-queue-count');
const savedList = document.getElementById('media-saved-list');
const savedCount = document.getElementById('media-saved-count');
const playlistForm = document.getElementById('media-playlist-form');
const playlistName = document.getElementById('media-playlist-name');
const playlistList = document.getElementById('media-playlists-list');
const queueKey = 'islamic-media-queue-v1';
const savedKey = 'islamic-media-saved-v1';
const playlistsKey = 'islamic-media-playlists-v1';
const featuredVideo = {
  id: 'featured-farzand-tarbiyasi',
  kind: 'playlist',
  mediaId: 'PLTLa7Mcx7Crs',
  title: 'Islomda farzand tarbiyasi',
  creator: 'Abdulloh domla'
};
const players = new Map();
const listeners = new Set();
let videosById = new Map([[featuredVideo.id, featuredVideo]]);
let queue = readArray(queueKey);
let savedVideos = new Set(readArray(savedKey));
let playlists = readPlaylists();
let libraryRef = null;
let libraryUnsubscribe = null;
let cloudLibraryAvailable = false;
let libraryInitialized = false;
let resolveLibraryReady;
const libraryReady = new Promise((resolve) => {
  resolveLibraryReady = resolve;
});
let activeQueueIndex = -1;
let nextPlayerNumber = 0;
let watchTimeStorageAvailable = true;
let resolvePlayerApi;
let rejectPlayerApi;
const playerApiReady = new Promise((resolve, reject) => {
  resolvePlayerApi = () => {
    if (window.YT?.Player) resolve(window.YT);
    else reject(new Error('YouTube Player API yuklandi, lekin pleer mavjud emas.'));
  };
  rejectPlayerApi = reject;
});

function readArray(key) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error(`Could not read ${key} from local storage:`, error);
    return [];
  }
}

function readPlaylists() {
  try {
    const parsed = JSON.parse(localStorage.getItem(playlistsKey) || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((playlist) => playlist
        && typeof playlist.id === 'string'
        && typeof playlist.name === 'string'
        && Array.isArray(playlist.videoIds))
      : [];
  } catch (error) {
    console.error('Could not read media playlists from local storage:', error);
    return [];
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Could not save ${key} to local storage:`, error);
    if (status) status.textContent = 'Saqlash amalga oshmadi. Qurilma xotirasi yoki brauzer ruxsatlarini tekshiring.';
    return false;
  }
}

function formatWatchTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours} soat ${minutes} daqiqa ${seconds} soniya`;
}

function notify(message, isError = false) {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle('text-danger', isError);
  status.classList.toggle('text-success', !isError);
}

function closeVideoListeners() {
  listeners.forEach((unsubscribe) => unsubscribe());
  listeners.clear();
  players.forEach((entry) => entry.destroy());
  players.clear();
}

function readLibraryState(data = {}) {
  const validIds = (value, maxItems) => Array.isArray(value)
    ? value.filter((id) => typeof id === 'string' && id.length <= 160).slice(0, maxItems)
    : [];
  const storedPlaylists = Array.isArray(data.playlists) ? data.playlists : [];
  return {
    queue: validIds(data.queue, 100),
    saved: validIds(data.saved, 500),
    playlists: storedPlaylists
      .filter((item) => item && typeof item.id === 'string' && typeof item.name === 'string')
      .slice(0, 50)
      .map((item) => ({
        id: item.id.slice(0, 80),
        name: item.name.slice(0, 60),
        videoIds: validIds(item.videoIds, 100)
      }))
  };
}

function currentLibraryState() {
  return { queue: [...queue], saved: [...savedVideos], playlists: playlists.map((item) => ({ ...item, videoIds: [...item.videoIds] })) };
}

function storeLibraryLocally(state) {
  return writeLocal(queueKey, state.queue)
    && writeLocal(savedKey, state.saved)
    && writeLocal(playlistsKey, state.playlists);
}

function displayLibraryState(state) {
  queue = state.queue;
  savedVideos = new Set(state.saved);
  playlists = state.playlists;
  storeLibraryLocally(state);
  renderLibrary();
  updateAllSaveButtons();
}

function updateAllSaveButtons() {
  videoList?.querySelectorAll('.media-card[data-video-id]').forEach((card) => {
    const button = card.querySelector('.media-save-button');
    if (!button) return;
    const isSaved = savedVideos.has(card.dataset.videoId);
    button.classList.toggle('is-active', isSaved);
    button.setAttribute('aria-pressed', String(isSaved));
    button.innerHTML = isSaved
      ? '<i class="bi bi-bookmark-check-fill" aria-hidden="true"></i><span>Saqlandi</span>'
      : '<i class="bi bi-bookmark" aria-hidden="true"></i><span>Saqlash</span>';
  });
  videoList?.querySelectorAll('.media-playlist-select').forEach((select) => {
    const selected = select.value;
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = playlists.length ? 'Playlist tanlang' : 'Avval playlist yarating';
    select.append(placeholder);
    playlists.forEach((playlist) => {
      const option = document.createElement('option');
      option.value = playlist.id;
      option.textContent = playlist.name;
      select.append(option);
    });
    select.value = selected;
  });
}

async function updateLibrary(mutator, successMessage) {
  await libraryReady;
  const previous = currentLibraryState();
  const next = readLibraryState(mutator(previous));
  if (!storeLibraryLocally(next)) return false;
  displayLibraryState(next);
  const canSync = Boolean(libraryRef && cloudLibraryAvailable);
  if (canSync) {
    try {
      const committed = await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(libraryRef);
        const latest = readLibraryState(snapshot.exists() ? snapshot.data() : {});
        const updated = readLibraryState(mutator(latest));
        transaction.set(libraryRef, { ...updated, updatedAt: serverTimestamp() });
        return updated;
      });
      displayLibraryState(committed);
    } catch (error) {
      console.error('Could not sync media library with Firebase:', error);
      notify('Firebase bilan sinxronlash amalga oshmadi. O‘zgarishlar hozircha ushbu qurilmada saqlandi.', true);
      return true;
    }
    notify(successMessage);
    return true;
  }
  notify(`${successMessage} Ammo Firebase hozir ulanmagan — o‘zgarishlar ushbu qurilmadagina saqlandi.`, true);
  return true;
}

function connectMediaLibrary(user) {
  if (!user) {
    resolveLibraryReady();
    notify('Firebase hisobi ochilmadi; Media ro‘yxatlari hozircha ushbu qurilmada saqlanadi.', true);
    return;
  }
  libraryUnsubscribe?.();
  libraryRef = doc(db, 'userMedia', user.uid, 'library', 'main');
  cloudLibraryAvailable = true;
  let creatingInitialState = false;
  libraryUnsubscribe = onSnapshot(libraryRef, (snapshot) => {
    cloudLibraryAvailable = true;
    if (snapshot.exists()) {
      displayLibraryState(readLibraryState(snapshot.data()));
      if (!libraryInitialized) {
        libraryInitialized = true;
        resolveLibraryReady();
      }
      return;
    }
    if (creatingInitialState) return;
    creatingInitialState = true;
    const initialState = currentLibraryState();
    setDoc(libraryRef, { ...initialState, updatedAt: serverTimestamp() }).then(() => {
      cloudLibraryAvailable = true;
      if (!libraryInitialized) {
        libraryInitialized = true;
        resolveLibraryReady();
      }
    }).catch((error) => {
      console.error('Could not create Firebase media library:', error);
      cloudLibraryAvailable = false;
      notify('Firebase ro‘yxatini yaratib bo‘lmadi; vaqtincha qurilmada saqlanadi.', true);
      if (!libraryInitialized) {
        libraryInitialized = true;
        resolveLibraryReady();
      }
    });
  }, (error) => {
    console.error('Firebase media library listener failed:', error);
    cloudLibraryAvailable = false;
    notify('Firebase ro‘yxatlari o‘qilmadi. Qurilmadagi nusxa saqlanadi.', true);
    if (!libraryInitialized) {
      libraryInitialized = true;
      resolveLibraryReady();
    }
  });
}

mediaAuthReady.then(connectMediaLibrary);

function saveQueue() {
  return updateLibrary((state) => ({ ...state, queue }), 'Ijro navbati Firebase’ga saqlandi.');
}

function saveSavedVideos() {
  return updateLibrary((state) => ({ ...state, saved: [...savedVideos] }), 'Saqlangan videolar Firebase’ga yozildi.');
}

function savePlaylists() {
  return updateLibrary((state) => ({ ...state, playlists }), 'Playlistlar Firebase’ga saqlandi.');
}

function playVideo(videoId) {
  const entry = players.get(videoId);
  if (!entry?.player) {
    notify('Pleer hali tayyor emas. Bir ozdan keyin yana urinib ko‘ring.', true);
    return;
  }
  entry.column.scrollIntoView({ behavior: 'smooth', block: 'center' });
  entry.activate();
  entry.player.playVideo();
}

function renderLibrary() {
  if (queueCount) queueCount.textContent = String(queue.length);
  if (savedCount) savedCount.textContent = String(savedVideos.size);
  if (savedList) {
    savedList.replaceChildren();
    const storedVideos = [...savedVideos].map((id) => videosById.get(id)).filter(Boolean);
    if (!storedVideos.length) {
      const empty = document.createElement('p');
      empty.className = 'media-library-empty';
      empty.textContent = 'Hali saqlangan video yo‘q. Keyin ko‘rish uchun “Saqlash”ni bosing.';
      savedList.append(empty);
    }
    storedVideos.forEach((video) => {
      const item = document.createElement('div');
      item.className = 'media-library-row';
      const title = document.createElement('span');
      title.textContent = video.title;
      const play = document.createElement('button');
      play.type = 'button';
      play.className = 'media-small-button';
      play.innerHTML = '<i class="bi bi-play-fill" aria-hidden="true"></i> Ijro';
      play.addEventListener('click', () => playVideo(video.id));
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'media-small-button media-small-button-muted';
      remove.textContent = 'Olib tashlash';
      remove.addEventListener('click', () => {
        savedVideos.delete(video.id);
        saveSavedVideos();
        notify('Video saqlanganlar ro‘yxatidan olib tashlandi.');
      });
      item.append(title, play, remove);
      savedList.append(item);
    });
  }
  if (queueList) {
    queueList.replaceChildren();
    if (!queue.length) {
      const empty = document.createElement('p');
      empty.className = 'media-library-empty';
      empty.textContent = 'Navbat hozircha bo‘sh. Videodan “Navbatga” tugmasini tanlang.';
      queueList.append(empty);
    } else {
      queue.forEach((videoId, index) => {
        const video = videosById.get(videoId);
        if (!video) return;
        const row = document.createElement('div');
        row.className = 'media-library-row';
        const title = document.createElement('span');
        title.textContent = video.title;
        const actions = document.createElement('div');
        actions.className = 'media-library-row-actions';
        const play = document.createElement('button');
        play.type = 'button';
        play.className = 'media-small-button';
        play.innerHTML = '<i class="bi bi-play-fill" aria-hidden="true"></i> Ijro';
        play.addEventListener('click', () => playQueueIndex(index));
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'media-small-button media-small-button-muted';
        remove.setAttribute('aria-label', `${video.title}ni navbatdan o‘chirish`);
        remove.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
        remove.addEventListener('click', () => {
          queue.splice(index, 1);
          if (activeQueueIndex === index) activeQueueIndex = -1;
          else if (activeQueueIndex > index) activeQueueIndex -= 1;
          saveQueue();
        });
        const moveUp = document.createElement('button');
        moveUp.type = 'button';
        moveUp.className = 'media-small-button media-small-button-muted';
        moveUp.disabled = index === 0;
        moveUp.setAttribute('aria-label', `${video.title}ni navbatda yuqoriga ko‘chirish`);
        moveUp.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
        moveUp.addEventListener('click', () => {
          [queue[index - 1], queue[index]] = [queue[index], queue[index - 1]];
          if (activeQueueIndex === index) activeQueueIndex -= 1;
          else if (activeQueueIndex === index - 1) activeQueueIndex += 1;
          saveQueue();
        });
        const moveDown = document.createElement('button');
        moveDown.type = 'button';
        moveDown.className = 'media-small-button media-small-button-muted';
        moveDown.disabled = index === queue.length - 1;
        moveDown.setAttribute('aria-label', `${video.title}ni navbatda pastga ko‘chirish`);
        moveDown.innerHTML = '<i class="bi bi-arrow-down" aria-hidden="true"></i>';
        moveDown.addEventListener('click', () => {
          [queue[index], queue[index + 1]] = [queue[index + 1], queue[index]];
          if (activeQueueIndex === index) activeQueueIndex += 1;
          else if (activeQueueIndex === index + 1) activeQueueIndex -= 1;
          saveQueue();
        });
        actions.append(play, moveUp, moveDown, remove);
        row.append(title, actions);
        queueList.append(row);
      });
    }
  }

  if (playlistList) {
    playlistList.replaceChildren();
    if (!playlists.length) {
      const empty = document.createElement('p');
      empty.className = 'media-library-empty';
      empty.textContent = 'Hali playlist yaratilmagan.';
      playlistList.append(empty);
    }
    playlists.forEach((playlist) => {
      const card = document.createElement('div');
      card.className = 'media-playlist-item';
      const heading = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = playlist.name;
      const count = document.createElement('span');
      const playlistVideos = playlist.videoIds.map((id) => videosById.get(id)).filter(Boolean);
      count.textContent = `${playlistVideos.length} ta video`;
      heading.append(name, count);
      const details = document.createElement('details');
      details.className = 'media-playlist-details';
      const summary = document.createElement('summary');
      summary.textContent = 'Videolarni ko‘rish';
      const items = document.createElement('div');
      items.className = 'media-playlist-videos';
      if (!playlistVideos.length) {
        const empty = document.createElement('p');
        empty.className = 'media-library-empty';
        empty.textContent = 'Playlist bo‘sh.';
        items.append(empty);
      }
      playlistVideos.forEach((video) => {
        const row = document.createElement('div');
        row.className = 'media-library-row';
        const videoTitle = document.createElement('span');
        videoTitle.textContent = video.title;
        const videoActions = document.createElement('div');
        videoActions.className = 'media-library-row-actions';
        const playVideoButton = document.createElement('button');
        playVideoButton.type = 'button';
        playVideoButton.className = 'media-small-button';
        playVideoButton.textContent = 'Ijro';
        playVideoButton.addEventListener('click', () => playVideo(video.id));
        const removeVideo = document.createElement('button');
        removeVideo.type = 'button';
        removeVideo.className = 'media-small-button media-small-button-muted';
        removeVideo.setAttribute('aria-label', `${video.title}ni ${playlist.name} playlistidan o‘chirish`);
        removeVideo.innerHTML = '<i class="bi bi-x-lg" aria-hidden="true"></i>';
        removeVideo.addEventListener('click', () => {
          playlist.videoIds = playlist.videoIds.filter((id) => id !== video.id);
          savePlaylists();
        });
        videoActions.append(playVideoButton, removeVideo);
        row.append(videoTitle, videoActions);
        items.append(row);
      });
      details.append(summary, items);
      const actions = document.createElement('div');
      actions.className = 'media-playlist-actions';
      const addAll = document.createElement('button');
      addAll.type = 'button';
      addAll.className = 'media-small-button';
      addAll.textContent = 'Hammasini navbatga';
      addAll.disabled = playlistVideos.length === 0;
      addAll.addEventListener('click', () => {
        queue.push(...playlistVideos.slice(0, Math.max(0, 100 - queue.length)).map((video) => video.id));
        saveQueue();
      });
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'media-small-button media-small-button-muted';
      remove.textContent = 'O‘chirish';
      remove.addEventListener('click', () => {
        playlists = playlists.filter((item) => item.id !== playlist.id);
        savePlaylists();
      });
      actions.append(addAll, remove);
      card.append(heading, details, actions);
      playlistList.append(card);
    });
  }
  videoList?.querySelectorAll('.media-playlist-select').forEach((select) => {
    const selected = select.value;
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Playlist tanlang';
    select.append(placeholder);
    playlists.forEach((playlist) => {
      const option = document.createElement('option');
      option.value = playlist.id;
      option.textContent = playlist.name;
      select.append(option);
    });
    select.value = selected;
  });
}

function addToQueue(videoId) {
  if (!videosById.has(videoId)) return;
  if (queue.length >= 100) {
    notify('Ijro navbati 100 ta video bilan cheklangan.', true);
    return;
  }
  queue.push(videoId);
  saveQueue();
}

function playQueueIndex(index) {
  const videoId = queue[index];
  const entry = players.get(videoId);
  if (!videoId || !entry?.player) {
    notify('Pleer hali tayyor emas. Bir ozdan keyin yana urinib ko‘ring.', true);
    return;
  }
  activeQueueIndex = index;
  entry.column.scrollIntoView({ behavior: 'smooth', block: 'center' });
  entry.activate();
  entry.player.playVideo();
}

function playNextInQueue() {
  if (!queue.length) return;
  const nextIndex = activeQueueIndex < 0 ? 0 : activeQueueIndex + 1;
  if (nextIndex < queue.length) playQueueIndex(nextIndex);
}

function getProfileName(user) {
  const name = typeof user?.displayName === 'string' ? user.displayName.trim() : '';
  if (name) return name.slice(0, 40);
  const emailName = typeof user?.email === 'string' ? user.email.split('@')[0].trim() : '';
  return emailName ? emailName.slice(0, 40) : 'Mehmon';
}

function getSafeProfilePhoto(user) {
  if (typeof user?.photoURL !== 'string') return '';
  try {
    const photo = new URL(user.photoURL);
    return photo.protocol === 'https:' ? photo.href.slice(0, 2048) : '';
  } catch (error) {
    console.warn('Firebase profile photo URL is invalid:', error);
    return '';
  }
}

function createProfileAvatar(name, photoURL, className = '') {
  const avatar = document.createElement('span');
  avatar.className = `media-avatar ${className}`.trim();
  avatar.setAttribute('aria-hidden', 'true');
  const initials = document.createElement('span');
  initials.textContent = name.trim().slice(0, 1).toLocaleUpperCase('uz-UZ') || 'M';
  avatar.append(initials);
  if (photoURL) {
    const image = document.createElement('img');
    image.src = photoURL;
    image.alt = '';
    image.referrerPolicy = 'no-referrer';
    image.addEventListener('error', () => image.remove(), { once: true });
    avatar.prepend(image);
  }
  return avatar;
}

function hasYouTubeUrlTitle(title) {
  if (typeof title !== 'string') return false;
  try {
    const url = new URL(title);
    return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(url.hostname);
  } catch {
    return false;
  }
}

function cleanTranscript(rawText) {
  return rawText
    .replace(/^\uFEFF?WEBVTT[^\r\n]*\r?\n/i, '')
    .replace(/^\s*\d+\s*$/gm, '')
    .replace(/^\s*\d{1,2}:\d{2}(?::\d{2})?[.,]\d{3}\s+-->\s+.*$/gm, '')
    .replace(/<[^>]*>/g, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

async function loadYouTubeMetadata(video, titleElement, creatorElement, onLoaded) {
  if (!hasYouTubeUrlTitle(video.title) || !/^[A-Za-z0-9_-]{11}$/.test(video.mediaId)) return;
  titleElement.textContent = video.creator || 'YouTube videosi';
  creatorElement.textContent = `Muallif: ${video.creator || 'IslamicUmmah571'}`;
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 8000);
  try {
    const videoUrl = `https://www.youtube.com/watch?v=${encodeURIComponent(video.mediaId)}`;
    const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`, {
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`YouTube metadata HTTP ${response.status}`);
    const metadata = await response.json();
    if (!titleElement.isConnected) return;
    if (typeof metadata.title === 'string' && metadata.title.trim()) {
      video.title = metadata.title.trim();
      titleElement.textContent = video.title;
    }
    if (typeof metadata.author_name === 'string' && metadata.author_name.trim()) {
      video.creator = metadata.author_name.trim();
      creatorElement.textContent = `Muallif: ${video.creator}`;
    }
    onLoaded?.(metadata);
  } catch (error) {
    console.warn(`Could not load YouTube metadata for ${video.mediaId}:`, error);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function createMediaAiSummary(video, playerNumber) {
  const panel = document.createElement('section');
  panel.className = 'media-ai-summary';
  panel.hidden = true;
  const heading = document.createElement('h4');
  heading.innerHTML = '<i class="bi bi-stars" aria-hidden="true"></i> Video uchun AI xulosasi';
  const help = document.createElement('p');
  help.className = 'media-ai-summary-help';
  help.textContent = 'Ommaviy YouTube videosidan Gemini Flash yordamida transkriptni avtomatik olish mumkin. Video va so‘rov Google’ga yuboriladi; natijani tekshiring. Bu xizmat API kvotasi yoki to‘lov limitiga bog‘liq.';
  const apiSetupLink = document.createElement('a');
  apiSetupLink.className = 'media-ai-api-setup';
  apiSetupLink.href = 'https://console.cloud.google.com/auth/verification?project=islamicofficial-9279f';
  apiSetupLink.target = '_blank';
  apiSetupLink.rel = 'noopener noreferrer';
  apiSetupLink.textContent = 'YouTube ruxsati: Google tekshiruvini ko‘rish';
  const verificationNote = document.createElement('p');
  verificationNote.className = 'media-ai-verification-note';
  verificationNote.textContent = 'Google tekshiruvi tugamaguncha avtomatik olish o‘chiq; subtitr fayli yuklash ishlaydi.';
  verificationNote.hidden = true;
  const keyDisclosure = document.createElement('details');
  keyDisclosure.className = 'media-ai-key-disclosure';
  const keySummary = document.createElement('summary');
  keySummary.textContent = 'Gemini yoki OpenAI API kalitini sozlash';
  const keyForm = document.createElement('div');
  keyForm.className = 'media-ai-key-form';
  const providerLabel = document.createElement('label');
  providerLabel.textContent = 'AI provayderi';
  providerLabel.htmlFor = `media-ai-provider-${playerNumber}`;
  const providerSelect = document.createElement('select');
  providerSelect.id = providerLabel.htmlFor;
  providerSelect.className = 'form-select';
  Object.entries(aiProviders).forEach(([id, provider]) => {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = provider.name;
    providerSelect.append(option);
  });
  const keyLabel = document.createElement('label');
  keyLabel.textContent = 'API kaliti';
  keyLabel.htmlFor = `media-ai-key-${playerNumber}`;
  const keyInput = document.createElement('input');
  keyInput.id = keyLabel.htmlFor;
  keyInput.type = 'password';
  keyInput.className = 'form-control';
  keyInput.autocomplete = 'off';
  keyInput.spellcheck = false;
  keyInput.placeholder = 'API kalitini kiriting';
  const saveKeyButton = document.createElement('button');
  saveKeyButton.type = 'button';
  saveKeyButton.className = 'media-ai-save-key';
  saveKeyButton.textContent = 'Kalitni sessiyaga saqlash';
  const keyStatus = document.createElement('p');
  keyStatus.className = 'media-ai-status';
  keyStatus.setAttribute('role', 'status');
  const keyNotice = document.createElement('small');
  keyNotice.textContent = 'Kalit faqat shu brauzer sessiyasida saqlanadi. AI provayderi foydalanish uchun haq olishi mumkin; hech qachon akkaunt parolingizni kiritmang.';
  keyForm.append(providerLabel, providerSelect, keyLabel, keyInput, saveKeyButton, keyStatus, keyNotice);
  keyDisclosure.append(keySummary, keyForm);

  const form = document.createElement('form');
  form.className = 'media-ai-transcript-form';
  const transcript = document.createElement('textarea');
  transcript.maxLength = 50000;
  transcript.rows = 5;
  transcript.required = true;
  transcript.placeholder = 'Subtitr matni shu yerda ko‘rinadi (50 000 belgigacha)…';
  transcript.setAttribute('aria-label', `${video.title} video transkripti`);
  const transcriptFileLabel = document.createElement('label');
  transcriptFileLabel.className = 'media-ai-transcript-file-label';
  transcriptFileLabel.textContent = 'Subtitr faylini yuklash (.srt, .vtt yoki .txt)';
  const transcriptFile = document.createElement('input');
  transcriptFile.type = 'file';
  transcriptFile.accept = '.srt,.vtt,.txt,text/plain,text/vtt,application/x-subrip';
  transcriptFile.className = 'form-control';
  transcriptFile.setAttribute('aria-label', 'Video subtitr yoki transkript faylini tanlang');
  transcriptFileLabel.append(transcriptFile);
  const fetchCaptionsButton = document.createElement('button');
  fetchCaptionsButton.type = 'button';
  fetchCaptionsButton.className = 'media-ai-fetch-captions';
  fetchCaptionsButton.innerHTML = '<i class="bi bi-closed-captioning" aria-hidden="true"></i><span>YouTube subtitrini olish</span>';
  fetchCaptionsButton.hidden = video.kind !== 'video' || !/^[A-Za-z0-9_-]{11}$/.test(video.mediaId);
  const transcribeButton = document.createElement('button');
  transcribeButton.type = 'button';
  transcribeButton.className = 'media-ai-transcribe';
  transcribeButton.innerHTML = '<i class="bi bi-soundwave" aria-hidden="true"></i><span>Gemini Flash bilan transkript olish</span>';
  transcribeButton.hidden = video.kind !== 'video' || !/^[A-Za-z0-9_-]{11}$/.test(video.mediaId);
  const generateButton = document.createElement('button');
  generateButton.type = 'submit';
  generateButton.className = 'media-ai-generate';
  generateButton.innerHTML = '<i class="bi bi-stars" aria-hidden="true"></i><span>Xulosa tayyorlash</span>';
  const status = document.createElement('p');
  status.className = 'media-ai-status';
  status.setAttribute('role', 'status');
  const result = document.createElement('div');
  result.className = 'media-ai-result';
  result.hidden = true;
  result.setAttribute('aria-live', 'polite');
  form.append(transcribeButton, fetchCaptionsButton, transcriptFileLabel, transcript, generateButton, status, result);
  panel.append(heading, help, apiSetupLink, verificationNote, keyDisclosure, form);

  const updateCaptionAccess = (user) => {
    const adminSignedIn = user?.email?.toLowerCase() === adminEmail;
    fetchCaptionsButton.hidden = !youtubeCaptionScopeVerified
      || video.kind !== 'video'
      || !/^[A-Za-z0-9_-]{11}$/.test(video.mediaId)
      || !adminSignedIn;
    apiSetupLink.hidden = !adminSignedIn;
    verificationNote.hidden = !adminSignedIn || youtubeCaptionScopeVerified;
  };
  updateCaptionAccess(auth.currentUser || mediaUser);
  authProfileListeners.add(updateCaptionAccess);
  listeners.add(() => authProfileListeners.delete(updateCaptionAccess));

  transcribeButton.addEventListener('click', async () => {
    const apiKey = getAiApiKey('gemini');
    if (!apiKey) {
      providerSelect.value = 'gemini';
      keyDisclosure.open = true;
      status.textContent = 'Avval Gemini API kalitini sozlab, so‘ng transkript olishni bosing.';
      keyInput.focus();
      return;
    }
    transcribeButton.disabled = true;
    transcribeButton.querySelector('span').textContent = 'Transkript tayyorlanmoqda…';
    status.textContent = 'Gemini Flash ommaviy YouTube videosini tinglab, transkript tayyorlayapti…';
    try {
      const transcriptText = await transcribeYouTubeVideo(video.mediaId, apiKey);
      transcript.value = transcriptText.slice(0, transcript.maxLength);
      status.textContent = transcriptText.length > transcript.maxLength
        ? 'Transkript olindi, ammo 50 000 belgidan oshgani uchun qisqartirildi. Natijani tekshiring.'
        : 'AI transkripti tayyor. Aniqligini tekshirib, kerak bo‘lsa tahrirlang.';
      transcript.focus();
    } catch (error) {
      console.error(`Could not transcribe YouTube video ${video.id}:`, error);
      status.textContent = `Transkript olinmadi: ${error.message}`;
    } finally {
      transcribeButton.disabled = false;
      transcribeButton.querySelector('span').textContent = 'Gemini Flash bilan transkript olish';
    }
  });

  fetchCaptionsButton.addEventListener('click', async () => {
    if (!youtubeCaptionScopeVerified) {
      status.textContent = 'Google tekshiruvi yakunlanmaguncha YouTube’dan avtomatik subtitr olish o‘chiq. .srt yoki .vtt faylini yuklang.';
      return;
    }
    const signedInUser = auth.currentUser;
    if (!signedInUser || signedInUser.isAnonymous || signedInUser.email?.toLowerCase() !== adminEmail) {
      status.textContent = `YouTube subtitrini olish uchun ${adminEmail} admin Google hisobi bilan kiring.`;
      return;
    }
    fetchCaptionsButton.disabled = true;
    status.textContent = 'Google’dan YouTube kanaliga subtitr ruxsati so‘ralmoqda…';
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope(youtubeCaptionScope);
      const signInResult = await signInWithPopup(auth, provider);
      if (signInResult.user.email?.toLowerCase() !== adminEmail) {
        status.textContent = `Faqat ${adminEmail} admin hisobi bilan subtitr olish mumkin.`;
        return;
      }
      const oauthCredential = GoogleAuthProvider.credentialFromResult(signInResult);
      if (!oauthCredential?.accessToken) {
        throw new Error('Google OAuth’dan YouTube ruxsat tokeni olinmadi.');
      }
      status.textContent = 'Kanalda subtitr yo‘llari qidirilmoqda…';
      const captionsUrl = new URL('https://www.googleapis.com/youtube/v3/captions');
      captionsUrl.searchParams.set('part', 'snippet');
      captionsUrl.searchParams.set('videoId', video.mediaId);
      const captionsResponse = await fetch(captionsUrl, {
        headers: { Authorization: `Bearer ${oauthCredential.accessToken}` }
      });
      if (!captionsResponse.ok) {
        const responseText = await captionsResponse.text();
        throw new Error(responseText.slice(0, 500) || `YouTube API HTTP ${captionsResponse.status}`);
      }
      const captionsPayload = await captionsResponse.json();
      const captionTracks = Array.isArray(captionsPayload.items) ? captionsPayload.items : [];
      if (!captionTracks.length) {
        status.textContent = 'Bu videoda API orqali olinadigan subtitr topilmadi. Avtomatik subtitr YouTube API’da mavjud bo‘lmasligi mumkin.';
        return;
      }
      const captionTrack = captionTracks.find((item) => item.snippet?.trackKind === 'ASR')
        || captionTracks.find((item) => item.snippet?.language === 'uz')
        || captionTracks[0];
      status.textContent = `${captionTrack.snippet?.language || 'mavjud'} subtitri yuklanmoqda…`;
      const downloadUrl = new URL(`https://www.googleapis.com/youtube/v3/captions/${encodeURIComponent(captionTrack.id)}`);
      downloadUrl.searchParams.set('tfmt', 'srt');
      const downloadResponse = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${oauthCredential.accessToken}` }
      });
      if (!downloadResponse.ok) {
        const responseText = await downloadResponse.text();
        throw new Error(responseText.slice(0, 500) || `Subtitrni yuklashda YouTube API HTTP ${downloadResponse.status}`);
      }
      const transcriptText = cleanTranscript(await downloadResponse.text());
      if (!transcriptText) {
        status.textContent = 'Subtitr fayli bo‘sh yoki o‘qiladigan matn topilmadi.';
        return;
      }
      transcript.value = transcriptText.slice(0, transcript.maxLength);
      status.textContent = transcriptText.length > transcript.maxLength
        ? 'Subtitr yuklandi; AI so‘rovini cheklash uchun matn 50 000 belgiga qisqartirildi. Tekshirib chiqing.'
        : 'Subtitr yuklandi. AI’ga yuborishdan oldin matnni ko‘rib chiqing.';
    } catch (error) {
      console.error(`Could not fetch YouTube captions for ${video.id}:`, error);
      status.textContent = `Subtitr olinmadi: ${error.code === 'auth/popup-closed-by-user'
        ? 'ruxsat oynasi yopildi.'
        : error.message}. Google Cloud’da YouTube Data API v3 yoqilganini va kanal ruxsatini tekshiring.`;
    } finally {
      fetchCaptionsButton.disabled = false;
    }
  });

  transcriptFile.addEventListener('change', async () => {
    const file = transcriptFile.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      status.textContent = 'Subtitr fayli 1 MB dan kichik bo‘lishi kerak.';
      transcriptFile.value = '';
      return;
    }
    try {
      const rawText = await file.text();
      const cleanedText = cleanTranscript(rawText);
      if (!cleanedText) {
        status.textContent = 'Faylda o‘qiladigan subtitr matni topilmadi.';
        return;
      }
      transcript.value = cleanedText;
      status.textContent = cleanedText.length > transcript.maxLength
        ? 'Subtitr fayli yuklandi; matn 50 000 belgiga qisqartirildi.'
        : 'Subtitr fayli yuklandi. Xulosa tayyorlashdan oldin matnni ko‘rib chiqing.';
    } catch (error) {
      console.error(`Could not read transcript file for ${video.id}:`, error);
      status.textContent = 'Subtitr faylini o‘qib bo‘lmadi.';
    } finally {
      transcriptFile.value = '';
    }
  });

  saveKeyButton.addEventListener('click', () => {
    const key = keyInput.value.trim();
    if (key.length < 20) {
      keyStatus.textContent = 'API kaliti noto‘g‘ri yoki juda qisqa.';
      return;
    }
    try {
      sessionStorage.setItem(aiProviders[providerSelect.value].keyStorage, key);
      keyInput.value = '';
      keyStatus.textContent = `${aiProviders[providerSelect.value].name} kaliti faqat shu sessiya uchun saqlandi.`;
    } catch (error) {
      console.error('Could not store video summary API key:', error);
      keyStatus.textContent = 'Kalitni saqlab bo‘lmadi. Brauzer sozlamalarini tekshiring.';
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const transcriptText = transcript.value.trim();
    if (transcriptText.length < 80) {
      status.textContent = 'Xulosa uchun transkriptni to‘liqroq kiriting (kamida 80 belgi).';
      transcript.focus();
      return;
    }
    const providerId = providerSelect.value;
    const provider = aiProviders[providerId];
    const apiKey = getAiApiKey(providerId);
    if (!apiKey) {
      keyDisclosure.open = true;
      status.textContent = `${provider.name} API kalitini yuqoridagi sozlamada kiriting.`;
      keyInput.focus();
      return;
    }
    generateButton.disabled = true;
    generateButton.querySelector('span').textContent = 'Xulosa tayyorlanmoqda…';
    status.textContent = `${provider.name} javobini kuting…`;
    result.hidden = true;
    try {
      const prompt = [
        'O‘zbek tilida ushbu YouTube video transkriptiga tayangan holda aniq va ixcham xulosa yoz.',
        'Asosiy g‘oyalarni 4–7 bandda ber. Diniy manba, oyat, hadis yoki faktlarni transkriptda bo‘lmasa o‘zingdan qo‘shma.',
        'Transkript yetarli bo‘lmasa, bu haqda ochiq ayt. Faqat xulosani qaytar.',
        `Video sarlavhasi: ${video.title}`,
        '',
        'Transkript:',
        transcriptText
      ].join('\n');
      const text = await requestAiText(providerId, provider.models[0].id, apiKey, prompt);
      result.textContent = text;
      result.hidden = false;
      status.textContent = 'Xulosa tayyor. Mazmunini tekshirib o‘qing.';
    } catch (error) {
      console.error(`AI video summary failed for ${video.id}:`, error);
      status.textContent = `Xulosa tayyorlanmadi: ${error.message}`;
    } finally {
      generateButton.disabled = false;
      generateButton.querySelector('span').textContent = 'Xulosa tayyorlash';
    }
  });
  return panel;
}

function createVideoCard(video, isFeatured = false) {
  const column = document.createElement('div');
  column.className = isFeatured ? 'col-12' : 'col-12 col-md-6 col-xl-4';
  const card = document.createElement('article');
  card.className = 'card media-card';
  card.dataset.videoId = video.id;
  const playerNumber = nextPlayerNumber++;
  const iframe = document.createElement('iframe');
  iframe.id = `youtube-player-${playerNumber}`;
  const playerPath = video.kind === 'playlist' ? 'videoseries' : encodeURIComponent(video.mediaId);
  const iframeUrl = new URL(`https://www.youtube.com/embed/${playerPath}`);
  if (video.kind === 'playlist') iframeUrl.searchParams.set('list', video.mediaId);
  iframeUrl.searchParams.set('enablejsapi', '1');
  iframeUrl.searchParams.set('origin', location.origin);
  iframeUrl.searchParams.set('playsinline', '1');
  iframe.src = iframeUrl.toString();
  iframe.title = video.title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.allowFullscreen = true;
  iframe.loading = 'lazy';
  const playerStage = document.createElement('div');
  playerStage.className = 'media-player-stage';
  const thumbnailButton = document.createElement('button');
  thumbnailButton.type = 'button';
  thumbnailButton.className = 'media-player-thumbnail';
  thumbnailButton.setAttribute('aria-label', `${video.title} videosini ijro qilish`);
  if (video.kind === 'video' && /^[A-Za-z0-9_-]{11}$/.test(video.mediaId)) {
    const thumbnail = document.createElement('img');
    thumbnail.alt = '';
    thumbnail.loading = 'lazy';
    const thumbnailSizes = ['hqdefault', 'sddefault', 'mqdefault', 'default'];
    let thumbnailIndex = 0;
    const loadNextThumbnail = () => {
      thumbnailIndex += 1;
      if (thumbnailIndex < thumbnailSizes.length) {
        thumbnail.src = `https://i.ytimg.com/vi/${encodeURIComponent(video.mediaId)}/${thumbnailSizes[thumbnailIndex]}.jpg`;
        return;
      }
      thumbnail.remove();
      thumbnailButton.classList.add('media-player-thumbnail-fallback');
      const fallbackLabel = document.createElement('span');
      fallbackLabel.className = 'media-player-thumbnail-fallback-label';
      fallbackLabel.innerHTML = '<i class="bi bi-youtube" aria-hidden="true"></i><span>Videoning muqovasi yuklanmadi</span>';
      thumbnailButton.append(fallbackLabel);
    };
    thumbnail.addEventListener('error', loadNextThumbnail);
    thumbnail.addEventListener('load', () => {
      if (thumbnail.naturalWidth <= 120 && thumbnailIndex < thumbnailSizes.length - 1) loadNextThumbnail();
    });
    thumbnailButton.append(thumbnail);
    thumbnail.src = `https://i.ytimg.com/vi/${encodeURIComponent(video.mediaId)}/${thumbnailSizes[thumbnailIndex]}.jpg`;
  } else {
    thumbnailButton.classList.add('media-player-thumbnail-playlist');
    const playlistLabel = document.createElement('span');
    playlistLabel.textContent = 'YouTube playlist';
    thumbnailButton.append(playlistLabel);
  }
  const playIcon = document.createElement('span');
  playIcon.className = 'media-player-play-icon';
  playIcon.innerHTML = '<i class="bi bi-play-fill" aria-hidden="true"></i>';
  thumbnailButton.append(playIcon);
  let playbackRequested = false;
  thumbnailButton.addEventListener('click', () => {
    playbackRequested = true;
    players.get(video.id)?.player?.playVideo();
  });
  playerStage.append(iframe, thumbnailButton);

  const body = document.createElement('div');
  body.className = 'card-body';
  const heading = document.createElement('div');
  heading.className = 'media-video-heading';
  const badge = document.createElement('span');
  badge.className = 'badge text-bg-success mb-2';
  badge.textContent = video.kind === 'playlist' ? 'YouTube playlist' : 'YouTube video';
  const title = document.createElement('h3');
  const needsYouTubeMetadata = video.kind === 'video' && hasYouTubeUrlTitle(video.title);
  title.textContent = needsYouTubeMetadata ? video.creator || 'YouTube videosi' : video.title;
  heading.append(badge, title);
  if (video.creator || needsYouTubeMetadata) {
    const creator = document.createElement('p');
    creator.className = 'media-video-creator';
    creator.textContent = video.creator ? `Muallif: ${video.creator}` : 'Muallif: IslamicUmmah571';
    heading.append(creator);
    if (needsYouTubeMetadata) {
      loadYouTubeMetadata(video, title, creator, (metadata) => {
        if (isFeatured) {
          const featuredTitle = document.getElementById('media-featured-title');
          const featuredDescription = document.getElementById('media-featured-description');
          if (featuredTitle) featuredTitle.textContent = metadata.title || title.textContent;
          if (featuredDescription) featuredDescription.textContent = `Muallif: ${metadata.author_name}. Saqlash, yoqtirish, navbat va playlist boshqaruvlari videoning o‘zida.`;
        }
      });
    }
  }

  const watchTime = document.createElement('p');
  watchTime.className = 'watch-time mb-3';
  const watchTimeLabel = document.createElement('span');
  watchTimeLabel.textContent = `Ushbu qurilmadagi tomosha vaqti: ${formatWatchTime(0)}`;
  watchTime.append(watchTimeLabel);

  const actions = document.createElement('div');
  actions.className = 'media-video-actions';
  const likeButton = document.createElement('button');
  likeButton.type = 'button';
  likeButton.className = 'media-action-button media-like-button';
  likeButton.setAttribute('aria-label', `Islamic Official saytida ${video.title}ga yoqdi bildirish`);
  likeButton.setAttribute('aria-pressed', 'false');
  likeButton.innerHTML = '<i class="bi bi-heart" aria-hidden="true"></i><span>Yoqdi</span>';
  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'media-action-button media-save-button';
  const queueButton = document.createElement('button');
  queueButton.type = 'button';
  queueButton.className = 'media-action-button';
  queueButton.innerHTML = '<i class="bi bi-music-note-list" aria-hidden="true"></i><span>Navbatga</span>';
  queueButton.addEventListener('click', () => addToQueue(video.id));
  const playlistSelect = document.createElement('select');
  playlistSelect.className = 'media-playlist-select';
  playlistSelect.setAttribute('aria-label', `${video.title}ni playlistga qo‘shish`);
  const playlistPlaceholder = document.createElement('option');
  playlistPlaceholder.value = '';
  playlistPlaceholder.textContent = 'Playlist tanlang';
  playlistSelect.append(playlistPlaceholder);
  playlists.forEach((playlist) => {
    const option = document.createElement('option');
    option.value = playlist.id;
    option.textContent = playlist.name;
    playlistSelect.append(option);
  });
  const playlistButton = document.createElement('button');
  playlistButton.type = 'button';
  playlistButton.className = 'media-action-button';
  playlistButton.innerHTML = '<i class="bi bi-collection" aria-hidden="true"></i><span>Playlistga</span>';
  playlistButton.addEventListener('click', () => {
    const selected = playlists.find((item) => item.id === playlistSelect.value);
    if (!selected) {
      notify('Avval playlist tanlang yoki yangisini yarating.', true);
      playlistSelect.focus();
      return;
    }
    if (!selected.videoIds.includes(video.id)) {
        if (selected.videoIds.length >= 100) {
          notify('Playlistga 100 tadan ortiq video qo‘shib bo‘lmaydi.', true);
          return;
        }
        selected.videoIds.push(video.id);
      savePlaylists();
      notify(`“${selected.name}” playlistiga qo‘shildi.`);
    } else {
      notify('Bu video playlistda allaqachon bor.');
    }
  });
  const youtubeLink = document.createElement('a');
  youtubeLink.className = 'media-action-button media-youtube-link';
  youtubeLink.href = video.kind === 'playlist'
    ? `https://www.youtube.com/playlist?list=${encodeURIComponent(video.mediaId)}`
    : `https://www.youtube.com/watch?v=${encodeURIComponent(video.mediaId)}`;
  youtubeLink.target = '_blank';
  youtubeLink.rel = 'noopener noreferrer';
  youtubeLink.setAttribute('aria-label', `${video.title}ni YouTube’da ochish`);
  youtubeLink.innerHTML = '<i class="bi bi-box-arrow-up-right" aria-hidden="true"></i><span>YouTube’da ochish</span>';
  const summaryButton = document.createElement('button');
  summaryButton.type = 'button';
  summaryButton.className = 'media-action-button media-ai-summary-toggle';
  summaryButton.setAttribute('aria-expanded', 'false');
  summaryButton.setAttribute('aria-label', `${video.title} uchun AI xulosa tayyorlash`);
  summaryButton.innerHTML = '<i class="bi bi-stars" aria-hidden="true"></i><span>AI xulosa</span>';
  const primaryActions = document.createElement('div');
  primaryActions.className = 'media-action-primary';
  primaryActions.append(likeButton, saveButton, queueButton, summaryButton, youtubeLink);
  const playlistActions = document.createElement('div');
  playlistActions.className = 'media-playlist-controls';
  playlistActions.append(playlistSelect, playlistButton);
  actions.append(primaryActions, playlistActions);
  const aiSummaryPanel = createMediaAiSummary(video, playerNumber);
  summaryButton.addEventListener('click', () => {
    const open = aiSummaryPanel.hidden;
    aiSummaryPanel.hidden = !open;
    summaryButton.setAttribute('aria-expanded', String(open));
    if (open) {
      aiSummaryPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      aiSummaryPanel.querySelector('textarea').focus({ preventScroll: true });
    }
  });

  const commentsSection = document.createElement('section');
  commentsSection.className = 'media-comments';
  const commentsHeading = document.createElement('h4');
  commentsHeading.innerHTML = '<i class="bi bi-chat-dots" aria-hidden="true"></i> Izohlar';
  const commentsList = document.createElement('div');
  commentsList.className = 'media-comments-list';
  const commentsEmpty = document.createElement('p');
  commentsEmpty.className = 'media-library-empty';
  commentsEmpty.textContent = 'Izohlar yuklanmoqda…';
  commentsList.append(commentsEmpty);
  const commentForm = document.createElement('form');
  commentForm.className = 'media-comment-form';
  const commentIdentity = document.createElement('div');
  commentIdentity.className = 'media-comment-identity';
  const updateCommentIdentity = (user) => {
    const displayName = getProfileName(user);
    const photoURL = getSafeProfilePhoto(user);
    commentIdentity.replaceChildren(createProfileAvatar(displayName, photoURL), document.createTextNode(displayName));
    if (!user || user.isAnonymous) {
      const signInLink = document.createElement('a');
      signInLink.href = 'index.html#login-btn';
      signInLink.textContent = 'Google bilan kiring';
      signInLink.setAttribute('aria-label', 'Google hisobi bilan kirish sahifasiga o‘tish');
      commentIdentity.append(signInLink);
    }
  };
  updateCommentIdentity(auth.currentUser || mediaUser);
  authProfileListeners.add(updateCommentIdentity);
  listeners.add(() => authProfileListeners.delete(updateCommentIdentity));
  const commentInput = document.createElement('textarea');
  commentInput.maxLength = 1000;
  commentInput.rows = 2;
  commentInput.required = true;
  commentInput.placeholder = 'Fikr-mulohazangizni yozing (1000 belgigacha)…';
  commentInput.setAttribute('aria-label', `${video.title} uchun izoh`);
  const commentSubmit = document.createElement('button');
  commentSubmit.type = 'submit';
  commentSubmit.className = 'btn btn-success';
  commentSubmit.innerHTML = '<i class="bi bi-send me-1" aria-hidden="true"></i>Yuborish';
  const commentStatus = document.createElement('p');
  commentStatus.className = 'media-comment-status';
  commentStatus.setAttribute('role', 'status');
  commentForm.append(commentIdentity, commentInput, commentSubmit);
  commentsSection.append(commentsHeading, commentsList, commentForm, commentStatus);

  body.append(heading, watchTime, actions, aiSummaryPanel, commentsSection);
  card.append(playerStage, body);
  column.append(card);

  const updateSaveButton = () => {
    const isSaved = savedVideos.has(video.id);
    saveButton.classList.toggle('is-active', isSaved);
    saveButton.setAttribute('aria-pressed', String(isSaved));
    saveButton.innerHTML = isSaved
      ? '<i class="bi bi-bookmark-check-fill" aria-hidden="true"></i><span>Saqlandi</span>'
      : '<i class="bi bi-bookmark" aria-hidden="true"></i><span>Saqlash</span>';
  };
  updateSaveButton();
  saveButton.addEventListener('click', () => {
    if (savedVideos.has(video.id)) savedVideos.delete(video.id);
    else savedVideos.add(video.id);
    saveSavedVideos();
    updateSaveButton();
    notify(savedVideos.has(video.id) ? 'Video saqlanganlar ro‘yxatiga qo‘shildi.' : 'Video saqlanganlar ro‘yxatidan olib tashlandi.');
  });

  likeButton.addEventListener('click', async () => {
    const currentUser = auth.currentUser || mediaUser;
    if (!currentUser) {
      notify('Yoqdi belgilash uchun hisob tayyorlanmoqda. Birozdan keyin urinib ko‘ring.', true);
      return;
    }
    likeButton.disabled = true;
    const likeRef = doc(db, 'mediaVideos', video.id, 'likes', currentUser.uid);
    try {
      if (likeButton.getAttribute('aria-pressed') === 'true') {
        await deleteDoc(likeRef);
      } else {
        await setDoc(likeRef, { userId: currentUser.uid, createdAt: serverTimestamp() });
      }
    } catch (error) {
      console.error(`Could not update site like for ${video.id}:`, error);
      notify('Yoqdi belgisini saqlab bo‘lmadi. Qayta urinib ko‘ring.', true);
    } finally {
      likeButton.disabled = false;
    }
  });

  mediaAuthReady.then((currentUser) => {
    if (!column.isConnected) return;
    if (!currentUser) {
      likeButton.disabled = true;
      commentSubmit.disabled = true;
      commentStatus.textContent = 'Yoqdi va izohlar uchun Firebase mehmon hisobi yoqilmagan.';
      return;
    }
    likeButton.disabled = false;
    const ownLike = doc(db, 'mediaVideos', video.id, 'likes', currentUser.uid);
    const ownLikeUnsubscribe = onSnapshot(ownLike, (likeSnapshot) => {
      const liked = likeSnapshot.exists();
      likeButton.setAttribute('aria-pressed', String(liked));
      likeButton.classList.toggle('is-active', liked);
      const heart = likeButton.querySelector('i');
      heart.className = liked ? 'bi bi-heart-fill' : 'bi bi-heart';
    }, (error) => {
      console.error(`Could not load current user's like for ${video.id}:`, error);
      notify('Yoqdi holatini tekshirib bo‘lmadi.', true);
    });
    listeners.add(ownLikeUnsubscribe);
  });

  const commentsQuery = query(
    collection(db, 'mediaVideos', video.id, 'comments'),
    orderBy('createdAt', 'desc'),
    limit(20)
  );
  const commentsUnsubscribe = onSnapshot(commentsQuery, (snapshot) => {
    commentsList.replaceChildren();
    if (snapshot.empty) {
      const empty = document.createElement('p');
      empty.className = 'media-library-empty';
      empty.textContent = 'Birinchi izohni siz qoldiring.';
      commentsList.append(empty);
      return;
    }
    snapshot.docs.forEach((commentDoc) => {
      const comment = commentDoc.data();
      const item = document.createElement('article');
      item.className = 'media-comment';
      const commentName = typeof comment.displayName === 'string' && comment.displayName.trim()
        ? comment.displayName.trim().slice(0, 40)
        : 'Mehmon';
      const commentPhoto = typeof comment.photoURL === 'string' && comment.photoURL.startsWith('https://')
        ? comment.photoURL.slice(0, 2048)
        : '';
      const commentIdentity = document.createElement('div');
      commentIdentity.className = 'media-comment-author';
      commentIdentity.append(
        createProfileAvatar(commentName, commentPhoto),
        document.createElement('strong')
      );
      commentIdentity.querySelector('strong').textContent = commentName;
      const date = document.createElement('time');
      const created = comment.createdAt?.toDate?.();
      if (created) {
        date.dateTime = created.toISOString();
        date.textContent = new Intl.DateTimeFormat('uz-UZ', { dateStyle: 'medium', timeStyle: 'short' }).format(created);
      } else {
        date.textContent = 'Hozirgina';
      }
      const text = document.createElement('p');
      text.textContent = typeof comment.text === 'string' ? comment.text : '';
      commentIdentity.append(date);
      item.append(commentIdentity, text);
      commentsList.append(item);
    });
  }, (error) => {
    console.error(`Could not load comments for ${video.id}:`, error);
    commentsList.replaceChildren();
    const message = document.createElement('p');
    message.className = 'media-library-empty';
    message.textContent = 'Izohlarni yuklab bo‘lmadi.';
    commentsList.append(message);
  });
  listeners.add(commentsUnsubscribe);

  commentForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const currentUser = auth.currentUser || mediaUser;
    const text = commentInput.value.trim();
    if (!currentUser) {
      commentStatus.textContent = 'Izoh yozish uchun hisob tayyorlanmoqda. Qayta urinib ko‘ring.';
      return;
    }
    if (!text || text.length > 1000) {
      commentStatus.textContent = 'Izoh 1–1000 belgi oralig‘ida bo‘lishi kerak.';
      return;
    }
    commentSubmit.disabled = true;
    try {
      const displayName = typeof currentUser.displayName === 'string'
        ? currentUser.displayName.trim().slice(0, 40)
        : getProfileName(currentUser);
      const photoURL = getSafeProfilePhoto(currentUser);
      const commentData = {
        userId: currentUser.uid,
        displayName: displayName || 'Mehmon',
        text,
        createdAt: serverTimestamp()
      };
      if (photoURL) commentData.photoURL = photoURL;
      await addDoc(collection(db, 'mediaVideos', video.id, 'comments'), commentData);
      commentInput.value = '';
      commentStatus.textContent = 'Izohingiz yuborildi.';
    } catch (error) {
      console.error(`Could not submit comment for ${video.id}:`, error);
      commentStatus.textContent = 'Izohni yuborib bo‘lmadi. Qayta urinib ko‘ring.';
    } finally {
      commentSubmit.disabled = false;
    }
  });

  playerApiReady.then((youtube) => {
    if (!column.isConnected) return;
    const savedWatchKey = `media-watch-time:${video.id}`;
    let watchedMilliseconds = 0;
    try {
      const stored = localStorage.getItem(savedWatchKey);
      watchedMilliseconds = stored === null ? 0 : Number(stored);
    } catch (error) {
      watchTimeStorageAvailable = false;
      console.error('Could not read local video watch time:', error);
    }
    if (!Number.isSafeInteger(watchedMilliseconds) || watchedMilliseconds < 0) {
      console.warn(`Invalid local watch-time value for ${video.id}; starting at zero.`);
      watchedMilliseconds = 0;
    }
    watchTimeLabel.textContent = `Ushbu qurilmadagi tomosha vaqti: ${formatWatchTime(watchedMilliseconds)}`;

    let intervalId = null;
    let previousTick = 0;
    try {
      const player = new youtube.Player(iframe, {
        events: {
          onReady() {
            if (!column.isConnected) {
              player.destroy();
              return;
            }
            players.set(video.id, {
              player,
              column,
              activate() {
                playbackRequested = true;
              },
              destroy() {
                if (intervalId !== null) window.clearInterval(intervalId);
                player.destroy();
              }
            });
            if (playbackRequested) player.playVideo();
          },
          onStateChange(event) {
            if (event.data === youtube.PlayerState.PLAYING) thumbnailButton.hidden = true;
            if (event.data === youtube.PlayerState.PLAYING && intervalId === null) {
              previousTick = Date.now();
              intervalId = window.setInterval(() => {
                const now = Date.now();
                const elapsed = Math.min(1500, Math.max(0, now - previousTick));
                previousTick = now;
                if (document.visibilityState !== 'visible' || player.getPlayerState() !== youtube.PlayerState.PLAYING) return;
                watchedMilliseconds += elapsed;
                watchTimeLabel.textContent = `Ushbu qurilmadagi tomosha vaqti: ${formatWatchTime(watchedMilliseconds)}`;
                if (watchTimeStorageAvailable) {
                  try {
                    localStorage.setItem(savedWatchKey, String(Math.floor(watchedMilliseconds)));
                  } catch (error) {
                    watchTimeStorageAvailable = false;
                    console.error('Could not save local video watch time:', error);
                  }
                }
              }, 1000);
            } else if (event.data !== youtube.PlayerState.PLAYING && intervalId !== null) {
              window.clearInterval(intervalId);
              intervalId = null;
            }
            if (event.data === youtube.PlayerState.ENDED && queue[activeQueueIndex] === video.id) {
              playNextInQueue();
            }
          },
          onError(event) {
            console.error(`YouTube player error for ${video.id}:`, event.data);
            notify('Ba’zi video YouTube tomonidan ijro etilmadi. Videoning ko‘rish ruxsatlarini tekshiring.', true);
          }
        }
      });
    } catch (error) {
      console.error(`Could not initialize YouTube player for ${video.id}:`, error);
      notify('YouTube pleerini ishga tushirib bo‘lmadi: ' + error.message, true);
    }
  }).catch((error) => {
    console.error('YouTube player API error:', error);
    notify(error.message, true);
  });

  return column;
}

function renderVideos(snapshot) {
  if (!videoList) return;
  closeVideoListeners();
  videoList.replaceChildren();
  const orderedVideos = snapshot.docs
    .slice()
    .sort((a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0))
    .map((item) => ({ id: item.id, ...item.data() }));
  videosById = new Map(orderedVideos.map((video) => [video.id, video]));
  const featured = orderedVideos[0] || featuredVideo;
  if (!orderedVideos.length) videosById.set(featured.id, featured);
  const featuredMount = document.getElementById('featured-media-video');
  if (featuredMount) {
    featuredMount.replaceChildren();
    featuredMount.append(createVideoCard(featured, true));
  }
  const featuredTitle = document.getElementById('media-featured-title');
  const displayFeaturedTitle = hasYouTubeUrlTitle(featured.title) ? featured.creator || 'YouTube videosi' : featured.title;
  if (featuredTitle) featuredTitle.textContent = displayFeaturedTitle;
  const featuredDescription = document.getElementById('media-featured-description');
  if (featuredDescription) {
    featuredDescription.textContent = featured.creator
      ? `Muallif: ${featured.creator}. Saqlash, yoqtirish, navbat va playlist boshqaruvlari videoning o‘zida.`
      : 'Saqlash, yoqtirish, navbat va playlist boshqaruvlari videoning o‘zida.';
  }
  orderedVideos.slice(1).forEach((video) => videoList.append(createVideoCard(video)));
  if (snapshot.empty) {
    const message = document.createElement('p');
    message.className = 'text-muted';
    message.textContent = 'Hozircha admin qo‘shgan videolar yo‘q.';
    videoList.append(message);
  }
  renderLibrary();
}

if (typeof window !== 'undefined') {
  window.onYouTubeIframeAPIReady = resolvePlayerApi;
  if (window.YT?.Player) {
    resolvePlayerApi();
  } else {
    const existingApiScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingApiScript) {
      existingApiScript.addEventListener('error', () => rejectPlayerApi(new Error('YouTube player API yuklanmadi.')), { once: true });
    } else {
      const playerApiScript = document.createElement('script');
      playerApiScript.src = 'https://www.youtube.com/iframe_api';
      playerApiScript.onerror = () => rejectPlayerApi(new Error('YouTube player API yuklanmadi.'));
      document.head.append(playerApiScript);
    }
  }
}

playerApiReady.catch((error) => {
  console.error('YouTube player API error:', error);
  notify(error.message, true);
});

playlistForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = playlistName.value.trim();
  if (!name || name.length > 60) {
    notify('Playlist nomi 1–60 belgi bo‘lishi kerak.', true);
    return;
  }
  if (playlists.length >= 50) {
    notify('Eng ko‘pi bilan 50 ta playlist yaratish mumkin.', true);
    return;
  }
  playlists.push({ id: crypto.randomUUID(), name, videoIds: [] });
  if (await savePlaylists()) {
    playlistName.value = '';
    notify(`“${name}” playlisti yaratildi.`);
  }
});

document.getElementById('media-queue-clear')?.addEventListener('click', () => {
  queue = [];
  activeQueueIndex = -1;
  saveQueue();
});
document.getElementById('media-saved-clear')?.addEventListener('click', () => {
  savedVideos.clear();
  saveSavedVideos();
  notify('Saqlangan videolar ro‘yxati tozalandi.');
});

if (videoList) {
  onSnapshot(collection(db, 'mediaVideos'), renderVideos, (error) => {
    console.error('Media video load error:', error);
    notify('Videolarni yuklashda xatolik: ' + error.message, true);
  });
}
