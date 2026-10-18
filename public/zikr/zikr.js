(() => {
  const storageKey = 'islamic-official-smart-zikr-v1';
  const builtInDhikr = [
    { id: 'subhanallah', arabic: 'سُبْحَانَ اللهِ', latin: 'Subhanalloh', meaning: 'Alloh barcha nuqsonlardan pokdir.' },
    { id: 'alhamdulillah', arabic: 'الْحَمْدُ لِلَّهِ', latin: 'Alhamdulillah', meaning: 'Hamd va shukr Allohgadir.' },
    { id: 'allahuakbar', arabic: 'اللهُ أَكْبَرُ', latin: 'Allohu akbar', meaning: 'Alloh ulug‘dir.' },
    { id: 'astaghfirullah', arabic: 'أَسْتَغْفِرُ اللهَ', latin: 'Astag‘firulloh', meaning: 'Allohdan mag‘firat so‘rayman.' }
  ];
  function localDayKey(date = new Date()) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  const defaultState = { counts: {}, customDhikr: [], agentHistory: [], active: builtInDhikr[0].id, target: 0, vibration: true, sound: false, theme: 'light', reminder: '', remindedOn: '', day: localDayKey() };
  let state = readState();
  let reminderTimer;
  let accountSaveTimer;

  function readState() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      const sameDay = saved.day === localDayKey();
      return {
        ...defaultState,
        ...saved,
        counts: sameDay && saved.counts && typeof saved.counts === 'object' ? saved.counts : {},
        customDhikr: Array.isArray(saved.customDhikr) ? saved.customDhikr.filter(isValidCustomDhikr).slice(0, 100) : [],
        agentHistory: normalizeAgentHistory(saved.agentHistory),
        day: localDayKey()
      };
    } catch (error) {
      console.error('Could not read private zikr data:', error);
      return { ...defaultState };
    }
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      syncZikrAccount();
    } catch (error) {
      console.error('Could not save private zikr data:', error);
      document.getElementById('counter-status').textContent = 'Hisoblagichni qurilmada saqlab bo‘lmadi; brauzer xotirasini tekshiring.';
    }
  }

  function isValidCustomDhikr(item) {
    return item && typeof item.id === 'string' && item.id.startsWith('custom-')
      && ['arabic', 'latin', 'meaning'].every(key => typeof item[key] === 'string' && item[key].length > 0)
      && item.arabic.length <= 500 && item.latin.length <= 100 && item.meaning.length <= 240
      && (item.target === undefined || Number.isInteger(item.target) && item.target >= 1 && item.target <= 99999)
      && (item.planTime === undefined || /^([01]\d|2[0-3]):[0-5]\d$/.test(item.planTime));
  }

  function allDhikr() {
    return [...builtInDhikr, ...state.customDhikr];
  }

  function activeDhikr() {
    return allDhikr().find(item => item.id === state.active) || builtInDhikr[0];
  }

  function normalizeAgentHistory(history) {
    if (!Array.isArray(history)) return [];
    let characters = 0;
    return history.filter(message => message && ['user', 'assistant'].includes(message.role)
      && typeof message.content === 'string' && message.content.trim() && message.content.length <= 2000)
      .slice(-12)
      .reverse()
      .filter(message => {
        if (characters + message.content.length > 6000) return false;
        characters += message.content.length;
        return true;
      })
      .reverse();
  }

  function countFor(id = state.active) {
    const value = Number(state.counts[id]);
    return Number.isInteger(value) && value >= 0 ? value : 0;
  }

  function targetValue() {
    const selectedTarget = activeDhikr().target;
    const value = Number(selectedTarget ?? state.target);
    return Number.isInteger(value) && value > 0 ? value : 0;
  }

  function renderCount() {
    const count = countFor();
    const target = targetValue();
    const ring = document.getElementById('counter-ring');
    document.getElementById('count').textContent = new Intl.NumberFormat('uz-UZ').format(count);
    ring.style.setProperty('--progress', `${target ? Math.min(100, count / target * 100) : 0}%`);
    ring.setAttribute('aria-valuenow', String(count));
    ring.setAttribute('aria-valuemax', String(target || count + 1));
    const total = Object.values(state.counts).reduce((sum, value) => sum + (Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : 0), 0);
    document.getElementById('today-total').textContent = new Intl.NumberFormat('uz-UZ').format(total);
    document.getElementById('today-selected').textContent = new Intl.NumberFormat('uz-UZ').format(count);
  }

  function renderSelection() {
    const selected = activeDhikr();
    document.getElementById('zikr-select').value = selected.id;
    document.getElementById('selected-arabic').textContent = selected.arabic;
    document.getElementById('selected-transliteration').textContent = selected.latin;
    document.getElementById('selected-meaning').textContent = selected.meaning;
    document.querySelectorAll('.dhikr-card').forEach(card => {
      card.setAttribute('aria-pressed', String(card.dataset.dhikr === selected.id));
    });
    const selectedTarget = selected.target ?? state.target;
    const targetSelect = document.getElementById('target-select');
    targetSelect.value = ['0', '33', '99'].includes(String(selectedTarget)) ? String(selectedTarget) : 'custom';
    const customTarget = document.getElementById('custom-target');
    customTarget.hidden = targetSelect.value !== 'custom';
    if (targetSelect.value === 'custom') customTarget.value = String(selectedTarget);
    renderCount();
  }

  function renderAdhkar() {
    const list = document.getElementById('adhkar-list');
    list.replaceChildren(...allDhikr().map(item => {
      const entry = document.createElement('div');
      entry.className = 'dhikr-entry';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dhikr-card';
      button.dataset.dhikr = item.id;
      button.setAttribute('aria-pressed', String(item.id === state.active));
      const arabic = document.createElement('span');
      arabic.className = 'arabic';
      arabic.lang = 'ar';
      arabic.dir = 'rtl';
      arabic.textContent = item.arabic;
      const title = document.createElement('strong');
      title.textContent = item.latin;
      const meaning = document.createElement('small');
      meaning.textContent = item.meaning;
      const add = document.createElement('span');
      add.className = 'add-label';
      add.textContent = 'Tanlash va sanash →';
      button.append(arabic, title, meaning, add);
      button.addEventListener('click', () => {
        state.active = item.id;
        document.getElementById('zikr-select').value = item.id;
        persist();
        renderSelection();
        document.getElementById('tasbih').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      entry.append(button);
      if (item.id.startsWith('custom-')) {
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'dhikr-remove';
        remove.textContent = 'Shaxsiy zikrni o‘chirish';
        remove.setAttribute('aria-label', `${item.latin} zikrini o‘chirish`);
        remove.addEventListener('click', () => {
          state.customDhikr = state.customDhikr.filter(custom => custom.id !== item.id);
          if (state.active === item.id) state.active = builtInDhikr[0].id;
          delete state.counts[item.id];
          persist();
          renderAdhkar();
          renderSelection();
        });
        entry.append(remove);
      }
      return entry;
    }));
  }

  function syncZikrAccount() {
    const account = window.islamicSiteAccount;
    if (account?.user) {
      window.clearTimeout(accountSaveTimer);
      accountSaveTimer = window.setTimeout(() => account.save('zikr', state).catch(error => {
        console.error('Could not sync personal zikr data:', error);
        document.getElementById('counter-status').textContent = 'Hisob qurilmada saqlandi, lekin akkaunt bilan sinxronlanmadi.';
      }), 500);
    }
  }

  function makeCustomId() {
    return `custom-${crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`;
  }

  function addPersonalDhikr(item) {
    if (state.customDhikr.length >= 100) {
      document.getElementById('custom-dhikr-status').textContent = 'Shaxsiy zikrlar ro‘yxati 100 ta bilan cheklangan.';
      return false;
    }
    if (!isValidCustomDhikr(item)) return false;
    state.customDhikr.push(item);
    document.getElementById('zikr-select').replaceChildren(...allDhikr().map(dhikrItem => new Option(dhikrItem.latin, dhikrItem.id)));
    state.active = item.id;
    persist();
    renderAdhkar();
    renderSelection();
    return true;
  }

  function parseAgentPlan(response) {
    const cleaned = response.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed) || parsed.length > 8) {
      throw new Error('Agent zikr rejasini kutilgan formatda qaytarmadi.');
    }
    return parsed.map(item => {
      const source = builtInDhikr.find(dhikrItem => dhikrItem.id === item.id);
      if (!source || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)
        || !Number.isInteger(item.target) || item.target < 1 || item.target > 99999) {
        throw new Error('Agent yaroqsiz zikr yoki vaqt qaytardi. Rejani qayta tuzing.');
      }
      return { source, time: item.time, target: item.target };
    });
  }

  function renderAgentHistory() {
    const conversation = document.getElementById('zikr-agent-conversation');
    conversation.replaceChildren();
    state.agentHistory.forEach(message => {
      const article = document.createElement('article');
      article.className = `zikr-agent-message ${message.role}`;
      const speaker = document.createElement('strong');
      speaker.textContent = message.role === 'user' ? 'Siz' : 'Zikr yordamchisi';
      const text = document.createElement('p');
      text.textContent = message.content;
      article.append(speaker, text);
      conversation.append(article);
    });
    conversation.scrollTop = conversation.scrollHeight;
  }

  async function requestZikrAgentPlan() {
    const request = document.getElementById('zikr-agent-request').value.trim();
    const status = document.getElementById('zikr-agent-status');
    const results = document.getElementById('zikr-agent-results');
    if (!request) {
      status.textContent = 'Agentga topshiriq yozing.';
      return;
    }
    if (request.length > 2000) {
      status.textContent = 'Topshiriqni 2000 belgidan qisqaroq yozing.';
      return;
    }
    const button = document.getElementById('zikr-agent-run');
    button.disabled = true;
    status.textContent = 'Suhbat va oldingi so‘rovlar hisobga olinib, javob tayyorlanmoqda…';
    results.replaceChildren();
    try {
      const { requestZikrPlan } = await import('./ai-client.js?v=3');
      const history = normalizeAgentHistory(state.agentHistory);
      const response = await requestZikrPlan(request, history);
      const plan = parseAgentPlan(JSON.stringify(response.plan));
      const answer = response.reply.trim();
      if (!answer) throw new Error('AI javobi bo‘sh qaytdi. Qayta urinib ko‘ring.');
      if (state.customDhikr.length + plan.length > 100) {
        throw new Error('Shaxsiy zikrlar ro‘yxati 100 ta bilan cheklangan. Avval ayrimlarini o‘chiring.');
      }
      const assistantMessage = plan.length
        ? `${answer}\nReja: ${plan.map(({ source, time, target }) => `${time} ${source.latin} — ${target} marta`).join('; ')}`
        : answer;
      state.agentHistory = normalizeAgentHistory([
        ...history,
        { role: 'user', content: request },
        { role: 'assistant', content: assistantMessage }
      ]);
      persist();
      renderAgentHistory();
      document.getElementById('zikr-agent-request').value = '';
      const additions = plan.map(({ source, time, target }) => ({
        id: makeCustomId(),
        arabic: source.arabic,
        latin: `${source.latin} · ${time}`,
        meaning: `${source.meaning} Shaxsiy reja: ${target} marta.`,
        sourceId: source.id,
        planTime: time,
        target
      }));
      if (additions.length) {
        state.customDhikr.push(...additions);
        state.active = additions[0].id;
        document.getElementById('zikr-select').replaceChildren(...allDhikr().map(item => new Option(item.latin, item.id)));
        persist();
        renderAdhkar();
        renderSelection();
        additions.forEach(({ latin, planTime, target }) => {
          const card = document.createElement('article');
          card.className = 'zikr-agent-result';
          const text = document.createElement('span');
          text.textContent = `${planTime} · ${latin.replace(` · ${planTime}`, '')} · ${target} marta`;
          const saved = document.createElement('small');
          saved.textContent = 'Shaxsiy zikrlar ro‘yxatiga qo‘shildi.';
          card.append(text, saved);
          results.append(card);
        });
        status.textContent = `${answer} ${plan.length} ta zikr shaxsiy ro‘yxatga qo‘shildi.`;
      } else {
        status.textContent = answer;
      }
      if (response.model) status.textContent += ` · ${response.model}`;
    } catch (error) {
      console.error('Could not create personal zikr plan:', error);
      status.textContent = error.message;
    } finally {
      button.disabled = false;
    }
  }

  function playClickTone() {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(.035, context.currentTime + .01);
      gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .08);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + .09);
      oscillator.addEventListener('ended', () => context.close(), { once: true });
    } catch (error) {
      console.error('Could not play optional zikr counter sound:', error);
      document.getElementById('counter-status').textContent = 'Bu brauzer tovushli sanashni qo‘llamaydi.';
    }
  }

  function increment(amount) {
    const next = Math.max(0, countFor() + amount);
    state.counts[state.active] = next;
    persist();
    renderCount();
    if (amount > 0 && state.sound) playClickTone();
    const target = targetValue();
    if (amount > 0 && target && next >= target && countFor() - amount < target) {
      document.getElementById('counter-status').textContent = `Shaxsiy ${target} talik maqsadingizga yetdingiz. Xohlasangiz, davom eting yoki sanagichni yangilang.`;
      if (state.vibration && navigator.vibrate) navigator.vibrate([20, 40, 20]);
    } else {
      document.getElementById('counter-status').textContent = 'Hisob ushbu qurilmada saqlandi.';
      if (amount > 0 && state.vibration && navigator.vibrate) navigator.vibrate(12);
    }
  }

  function dateParts(date) {
    const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
      year: 'numeric', month: 'numeric', day: 'numeric'
    });
    return Object.fromEntries(formatter.formatToParts(date).map(part => [part.type, Number(part.value)]));
  }

  function renderCalendar() {
    const today = new Date();
    document.getElementById('gregorian-date').textContent = new Intl.DateTimeFormat('uz-UZ', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    }).format(today);
    try {
      document.getElementById('hijri-date').textContent = new Intl.DateTimeFormat('uz-UZ-u-ca-islamic-umalqura', {
        day: 'numeric', month: 'long', year: 'numeric'
      }).format(today);
      const events = [
        { month: 9, day: 1, name: 'Ramazon boshlanishi' },
        { month: 10, day: 1, name: 'Ramazon hayiti' },
        { month: 12, day: 10, name: 'Qurbon hayiti' }
      ];
      const upcoming = [];
      for (let offset = 0; offset <= 370 && upcoming.length < 3; offset += 1) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
        const parts = dateParts(date);
        const event = events.find(item => item.month === parts.month && item.day === parts.day);
        if (event) upcoming.push({ ...event, date });
      }
      const list = document.getElementById('upcoming-dates');
      list.replaceChildren(...upcoming.map(item => {
        const card = document.createElement('article');
        card.className = 'date-item';
        const name = document.createElement('strong');
        name.textContent = item.name;
        const date = document.createElement('span');
        date.textContent = new Intl.DateTimeFormat('uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' }).format(item.date);
        const hijri = document.createElement('small');
        const parts = dateParts(item.date);
        hijri.textContent = `${parts.day}/${parts.month}/${parts.year} hijriy`;
        card.append(name, date, hijri);
        return card;
      }));
      if (!upcoming.length) throw new Error('Kelgusi hijriy sanalar topilmadi.');
    } catch (error) {
      console.error('Could not calculate local Hijri calendar dates:', error);
      document.getElementById('hijri-date').textContent = 'Hijriy taqvim bu brauzerda qo‘llanmaydi.';
      document.getElementById('upcoming-dates').replaceChildren(Object.assign(document.createElement('p'), {
        textContent: 'Hijriy taqvimni ko‘rsatib bo‘lmadi. Qurilma brauzerini yangilang.'
      }));
    }
  }

  function renderReminder() {
    const enabled = Boolean(state.reminder);
    document.getElementById('reminder-time').value = state.reminder || '08:00';
    document.getElementById('reminder-toggle').textContent = enabled ? 'Eslatma yoqilgan' : 'Eslatmani yoqish';
    document.getElementById('reminder-off').hidden = !enabled;
    document.getElementById('reminder-status').textContent = enabled
      ? `${state.reminder} da eslatma yoqildi. Bildirishnoma faqat sahifa ochiq turganda yuboriladi.`
      : 'Eslatma faqat sahifa ochiq turganda ishlaydi. Push xabari uchun ruxsat so‘raladi.';
  }

  async function enableReminder() {
    const time = document.getElementById('reminder-time').value;
    if (!/^\d{2}:\d{2}$/.test(time)) {
      document.getElementById('reminder-status').textContent = 'Eslatma vaqtini tanlang.';
      return;
    }
    if (!('Notification' in window)) {
      document.getElementById('reminder-status').textContent = 'Bu brauzer bildirishnomalarni qo‘llamaydi. Eslatma yoqilmadi.';
      return;
    }
    let permission = Notification.permission;
    if (permission === 'default') permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      document.getElementById('reminder-status').textContent = 'Bildirishnoma ruxsati berilmadi. Brauzer sozlamasidan ruxsat berib qayta urinib ko‘ring.';
      return;
    }
    state.reminder = time;
    state.remindedOn = '';
    persist();
    renderReminder();
  }

  function checkReminder() {
    if (!state.reminder || !('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const today = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    if (time !== state.reminder || state.remindedOn === today) return;
    state.remindedOn = today;
    persist();
    new Notification('Zikr vaqti', { body: 'O‘zingizga ajratgan sokin daqiqalarni eslang.', icon: './icon.svg' });
  }

  document.getElementById('zikr-select').replaceChildren(...allDhikr().map(item => new Option(item.latin, item.id)));
  document.getElementById('zikr-select').value = state.active;
  document.getElementById('target-select').value = ['0', '33', '99'].includes(String(state.target)) ? String(state.target) : 'custom';
  document.getElementById('custom-target').hidden = document.getElementById('target-select').value !== 'custom';
  if (document.getElementById('target-select').value === 'custom') document.getElementById('custom-target').value = String(state.target);
  document.getElementById('haptic-toggle').setAttribute('aria-pressed', String(state.vibration));
  document.getElementById('haptic-toggle').textContent = state.vibration ? '⌁ Tebranish yoqilgan' : '⌁ Tebranish o‘chiq';
  document.getElementById('sound-toggle').setAttribute('aria-pressed', String(state.sound));
  document.getElementById('sound-toggle').textContent = state.sound ? '♪ Ovoz yoqilgan' : '♪ Ovoz o‘chiq';
  document.body.dataset.theme = state.theme === 'dark' ? 'dark' : 'light';
  document.getElementById('theme-toggle').setAttribute('aria-pressed', String(state.theme === 'dark'));
  renderAdhkar();
  renderSelection();
  renderAgentHistory();
  renderCalendar();
  renderReminder();

  document.getElementById('custom-dhikr-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const item = {
      id: makeCustomId(),
      arabic: String(form.get('arabic') || '').trim(),
      latin: String(form.get('latin') || '').trim(),
      meaning: String(form.get('meaning') || '').trim()
    };
    if (!addPersonalDhikr(item)) {
      document.getElementById('custom-dhikr-status').textContent = 'Matnlarni tekshiring; zikrlar ro‘yxati to‘la bo‘lishi ham mumkin.';
      return;
    }
    event.currentTarget.reset();
    document.getElementById('custom-dhikr-status').textContent = 'Zikr shaxsiy ro‘yxatingizga qo‘shildi.';
  });
  document.getElementById('zikr-agent-run').addEventListener('click', requestZikrAgentPlan);
  document.getElementById('zikr-agent-clear').addEventListener('click', () => {
    state.agentHistory = [];
    persist();
    renderAgentHistory();
    document.getElementById('zikr-agent-results').replaceChildren();
    document.getElementById('zikr-agent-status').textContent = 'Suhbat tarixi tozalandi.';
  });
  window.addEventListener('islamic-account-changed', async event => {
    const account = window.islamicSiteAccount;
    if (!event.detail?.user || !account) return;
    try {
      const cloud = await account.load('zikr');
      if (cloud?.data && typeof cloud.data === 'object') {
        const remote = cloud.data;
        const combinedCustom = new Map();
        [...(Array.isArray(remote.customDhikr) ? remote.customDhikr : []), ...state.customDhikr]
          .filter(isValidCustomDhikr)
          .forEach(item => combinedCustom.set(item.id, item));
        const sameDay = remote.day === localDayKey();
        const counts = sameDay && remote.counts && typeof remote.counts === 'object' ? { ...remote.counts } : {};
        if (state.day === localDayKey()) {
          Object.entries(state.counts).forEach(([id, value]) => {
            counts[id] = Math.max(Number(counts[id]) || 0, Number(value) || 0);
          });
        }
        state = {
          ...state,
          ...remote,
          counts,
          customDhikr: [...combinedCustom.values()].slice(0, 100),
          agentHistory: normalizeAgentHistory(
            Array.isArray(remote.agentHistory) && remote.agentHistory.length
              ? remote.agentHistory
              : state.agentHistory
          ),
          day: localDayKey()
        };
        if (!allDhikr().some(item => item.id === state.active)) state.active = builtInDhikr[0].id;
        document.getElementById('zikr-select').replaceChildren(...allDhikr().map(item => new Option(item.latin, item.id)));
        renderAdhkar();
        renderSelection();
        renderAgentHistory();
      }
      await account.save('zikr', state);
    } catch (error) {
      console.error('Could not synchronize personal zikr data with this account:', error);
      document.getElementById('counter-status').textContent = 'Zikrlar qurilmada saqlandi, akkaunt bilan sinxronlashda xato yuz berdi.';
    }
  });
  if (window.islamicSiteAccount?.user) {
    window.dispatchEvent(new CustomEvent('islamic-account-changed', { detail: { user: window.islamicSiteAccount.user } }));
  }

  document.getElementById('zikr-select').addEventListener('change', event => {
    state.active = event.target.value;
    persist();
    renderSelection();
  });
  document.getElementById('target-select').addEventListener('change', event => {
    const custom = event.target.value === 'custom';
    document.getElementById('custom-target').hidden = !custom;
    const target = custom ? Math.max(1, Number(document.getElementById('custom-target').value) || 1) : Number(event.target.value);
    const selected = activeDhikr();
    if (selected.id.startsWith('custom-') && selected.target !== undefined) selected.target = target;
    else state.target = target;
    persist();
    renderCount();
  });
  document.getElementById('custom-target').addEventListener('change', event => {
    const target = Number(event.target.value);
    if (!Number.isInteger(target) || target < 1 || target > 99999) {
      document.getElementById('counter-status').textContent = 'Maqsad 1 dan 99 999 gacha butun son bo‘lishi kerak.';
      return;
    }
    const selected = activeDhikr();
    if (selected.id.startsWith('custom-') && selected.target !== undefined) selected.target = target;
    else state.target = target;
    persist();
    renderCount();
  });
  document.getElementById('count-button').addEventListener('click', () => increment(1));
  document.getElementById('undo-count').addEventListener('click', () => increment(-1));
  document.getElementById('reset-counter').addEventListener('click', () => {
    state.counts[state.active] = 0;
    persist();
    renderCount();
    document.getElementById('counter-status').textContent = 'Tanlangan zikr sanog‘i qayta boshlandi.';
  });
  document.getElementById('haptic-toggle').addEventListener('click', event => {
    state.vibration = !state.vibration;
    event.currentTarget.setAttribute('aria-pressed', String(state.vibration));
    event.currentTarget.textContent = state.vibration ? '⌁ Tebranish yoqilgan' : '⌁ Tebranish o‘chiq';
    persist();
    if (state.vibration && navigator.vibrate) navigator.vibrate(12);
  });
  document.getElementById('sound-toggle').addEventListener('click', event => {
    state.sound = !state.sound;
    event.currentTarget.setAttribute('aria-pressed', String(state.sound));
    event.currentTarget.textContent = state.sound ? '♪ Ovoz yoqilgan' : '♪ Ovoz o‘chiq';
    persist();
    if (state.sound) playClickTone();
  });
  document.getElementById('theme-toggle').addEventListener('click', event => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.body.dataset.theme = state.theme;
    event.currentTarget.setAttribute('aria-pressed', String(state.theme === 'dark'));
    persist();
  });
  document.getElementById('reminder-toggle').addEventListener('click', enableReminder);
  document.getElementById('reminder-off').addEventListener('click', () => {
    state.reminder = '';
    persist();
    renderReminder();
  });
  document.getElementById('reminder-time').addEventListener('change', event => {
    if (state.reminder) {
      state.reminder = event.target.value;
      state.remindedOn = '';
      persist();
      renderReminder();
    }
  });
  checkReminder();
  reminderTimer = window.setInterval(checkReminder, 30000);
  window.addEventListener('pagehide', () => window.clearInterval(reminderTimer), { once: true });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./zikr-sw.js').catch(error => console.error('Could not enable offline zikr page:', error));
  }
})();
