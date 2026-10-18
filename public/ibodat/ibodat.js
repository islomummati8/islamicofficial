(() => {
  const STORAGE_KEY = 'islamic-official:ibodat-path:v1';
  const HABITS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'quran', 'dhikr', 'dua', 'kindness'];
  const DEFAULT_STATE = {
    version: 1,
    entries: {},
    customHabits: [],
    qada: {
      prayerRemaining: 0,
      prayerCompleted: 0,
      prayerDailyTarget: 1,
      fastRemaining: 0,
      fastCompleted: 0,
      fastWeeklyTarget: 1,
      doneToday: {}
    },
    settings: { language: 'en', theme: 'light' }
  };
  const translations = {
    en: {
      skip: 'Skip to content', brandCaption: 'IBADAT PATH', navToday: 'Today', navPlan: 'My plan',
      navPrivacy: 'Privacy', languageLabel: 'Language', themeToggleAria: 'Toggle color theme', mainSite: 'Main site ↗',
      heroEyebrow: 'A gentle plan, made personal', heroTitle: 'Make room for', heroAccent: 'what matters.',
      heroDescription: "A calm place to keep up with today's worship and make steady progress on prayers or fasts you want to make up.",
      startToday: 'Start with today', todayLabel: 'TODAY', yourDay: 'YOUR DAY', statCompleted: 'Completed today',
      statStreak: 'Gentle streak', statNext: 'Prayer plan left', days: 'days', day: 'day',
      todayTitle: 'Small steps count.', todayIntro: 'Choose what belongs in your day. Your checklist is yours alone.',
      dailyTitle: 'Daily rhythm', dailyDescription: 'A gentle checklist, reset for each new day.',
      customHabitLabel: 'Add a personal habit', customHabitPlaceholder: 'Add a personal intention',
      addHabit: 'Add', removeHabit: 'Remove', removeHabitAria: 'Remove {habit}', customHabitLimit: 'You can add up to 5 personal habits.',
      weeklyTitle: 'Your last seven days', weeklyHint: 'One bar per day',
      focusKicker: 'ONE KIND STEP', focusTitle: 'Consistency over perfection.',
      focusDescription: 'Your plan can be small, flexible, and fully your own. A missed day is simply a chance to begin again.',
      focusLink: 'Shape a plan that fits ↗', gentleReminder: 'Take the next good step at a pace you can sustain.',
      planKicker: 'YOUR PERSONAL PLAN', planTitle: 'Progress, at your pace.',
      planIntro: 'Set your own estimates and daily goals. Nothing is uploaded or shared.',
      prayerPlanTitle: 'Make-up prayer plan', prayerPlanDescription: 'Use your own estimate of prayers to make up.',
      prayersRemaining: 'Individual prayers remaining (your estimate)', prayerUnits: 'individual prayers',
      prayersDaily: 'Your daily goal', prayerUnitsPerDay: 'prayers per day', estimatedTime: 'At this pace',
      completePrayerGoal: "Mark today's goal complete", prayerGoalDone: "Today's prayer goal is complete. Begin again tomorrow.", noPrayerGoal: 'No remaining prayer units in your plan.',
      prayerGoalMarked: '{count} prayer units marked complete. Keep going gently.',
      fastPlanTitle: 'Make-up fasting plan', fastPlanDescription: 'Track the days you personally want to make up.',
      fastsRemaining: 'Fasting days remaining (your estimate)', fastDays: 'days to fast',
      fastsWeekly: 'Your weekly goal', fastsPerWeek: 'fast days per week', weeks: 'weeks', week: 'week',
      completeFastGoal: 'Mark one fast complete', fastGoalDone: "Today's fast is already marked. Begin again tomorrow.", noFastGoal: 'No remaining fasting days in your plan.',
      fastGoalMarked: 'One fasting day marked complete. Keep going gently.',
      importantNote: 'A personal planning aid, not a religious ruling.',
      guidanceText: 'Estimates and practice can vary by circumstance and school of thought. For personal religious guidance, please consult a trusted scholar. Adjust your goals whenever you need.',
      privacyKicker: 'PRIVATE BY DESIGN', privacyTitle: 'Your plan stays with you.',
      privacyDescription: 'Your checklist and progress are saved only in this browser on this device. No account, location, or server sync is used.',
      exportPlan: 'Export backup', importPlan: 'Import backup', footerNote: 'A gentle reminder: small, steady steps matter.',
      saved: 'Saved privately on this device.', saveError: 'Could not save on this device. Check browser storage settings.',
      loadError: 'Saved plan could not be read. Your new changes will still be kept if storage is available.',
      exportError: 'Backup could not be created.', importError: 'That file is not a valid Ibodat Path backup.',
      importSuccess: 'Backup restored on this device.', importReadError: 'Could not read that file.',
      invalidNumber: 'Enter a whole number within the allowed range.', todayComplete: 'You completed {done} of {total} today.',
      todayProgress: '{done} of {total} complete', daysLeft: '{count} days', weeksLeft: '{count} weeks',
      prayerLabel: 'Fajr prayer', dhuhrLabel: 'Dhuhr prayer', asrLabel: 'Asr prayer', maghribLabel: 'Maghrib prayer',
      ishaLabel: 'Isha prayer', quranLabel: 'Quran reading', dhikrLabel: 'Dhikr', duaLabel: 'Dua',
      kindnessLabel: 'An act of kindness', prayerAria: 'Make-up prayer plan progress', fastAria: 'Make-up fasting plan progress'
    },
    uz: {
      skip: 'Asosiy mazmunga o‘tish', brandCaption: 'IBODAT REJASI', navToday: 'Bugun', navPlan: 'Rejam',
      navPrivacy: 'Maxfiylik', languageLabel: 'Til', themeToggleAria: 'Rang mavzusini almashtirish', mainSite: 'Asosiy sayt ↗',
      heroEyebrow: 'O‘zingizga mos, muloyim reja', heroTitle: 'Muhim narsalar uchun', heroAccent: 'joy ajrating.',
      heroDescription: 'Bugungi ibodatlarni kuzatish hamda qazo namoz yoki ro‘zalarni o‘zingizga mos sur’atda ado etishga yordam beruvchi sokin va shaxsiy reja.',
      startToday: 'Bugundan boshlash', todayLabel: 'BUGUN', yourDay: 'BUGUNGI KUN', statCompleted: 'Bugun bajarildi',
      statStreak: 'Izchil kunlar', statNext: 'Qazo namoz qoldi', days: 'kun', day: 'kun',
      todayTitle: 'Kichik qadamlar ham muhim.', todayIntro: 'Bugungi rejangizga mos bandlarni belgilang. Ro‘yxat faqat siz uchun.',
      dailyTitle: 'Kundalik ibodatlar', dailyDescription: 'Har kuni yangilanadigan muloyim eslatmalar.',
      customHabitLabel: 'Shaxsiy odat qo‘shish', customHabitPlaceholder: 'Masalan: ota-onamdan xabar olish',
      addHabit: 'Qo‘shish', removeHabit: 'O‘chirish', removeHabitAria: '{habit} odatini o‘chirish', customHabitLimit: 'Ko‘pi bilan 5 ta shaxsiy odat qo‘shishingiz mumkin.',
      weeklyTitle: 'So‘nggi 7 kuningiz', weeklyHint: 'Har ustun bir kunni ko‘rsatadi',
      focusKicker: 'BIR YAXSHI QADAM', focusTitle: 'Mukammallik emas, izchillik.',
      focusDescription: 'Rejangiz kichik, moslashuvchan va o‘zingizga tegishli bo‘lsin. Bir kun o‘tib ketsa, yangidan boshlash mumkin.',
      focusLink: 'O‘zingizga mos reja tuzing ↗', gentleReminder: 'Davom ettira oladigan sur’atda navbatdagi yaxshi qadamni tashlang.',
      planKicker: 'SHAXSIY REJANGIZ', planTitle: 'O‘zingizga mos sur’atda.',
      planIntro: 'Taxminiy miqdor va kunlik maqsadni o‘zingiz belgilang. Ma’lumotlar yuklanmaydi yoki ulashilmaydi.',
      prayerPlanTitle: 'Qazo namoz rejasi', prayerPlanDescription: 'Qazo namozlar sonini o‘zingiz taxminan kiriting.',
      prayersRemaining: 'Qolgan qazo farz namozlari (taxminingiz)', prayerUnits: 'farz namozi',
      prayersDaily: 'Kunlik maqsadingiz', prayerUnitsPerDay: 'namoz birligi / kun', estimatedTime: 'Shu sur’atda',
      completePrayerGoal: 'Bugungi maqsadni bajardim', prayerGoalDone: 'Bugungi qazo namoz maqsadi bajarildi. Ertaga yana davom eting.', noPrayerGoal: 'Rejada qolgan qazo namozi yo‘q.',
      prayerGoalMarked: '{count} ta namoz birligi bajarildi deb belgilandi. Shoshilmasdan davom eting.',
      fastPlanTitle: 'Qazo ro‘za rejasi', fastPlanDescription: 'Qazo tutmoqchi bo‘lgan kunlaringizni kuzating.',
      fastsRemaining: 'Qolgan qazo kunlari (taxminingiz)', fastDays: 'ro‘za kuni',
      fastsWeekly: 'Haftalik maqsadingiz', fastsPerWeek: 'ro‘za kuni / hafta', weeks: 'hafta', week: 'hafta',
      completeFastGoal: 'Bir kun ro‘zani bajardim', fastGoalDone: 'Bugungi ro‘za allaqachon belgilangan. Ertaga yana davom eting.', noFastGoal: 'Rejada qolgan qazo ro‘za kuni yo‘q.',
      fastGoalMarked: 'Bir kun ro‘za bajarildi deb belgilandi. Shoshilmasdan davom eting.',
      importantNote: 'Bu shaxsiy rejalashtirish vositasi, diniy fatvo emas.',
      guidanceText: 'Hisob va amaliyot holat hamda mazhabga qarab farq qilishi mumkin. Shaxsiy diniy maslahat uchun ishonchli olimga murojaat qiling. Maqsadlaringizni istalgan payt o‘zgartirishingiz mumkin.',
      privacyKicker: 'MAXFIYLIK BIRINCHI O‘RINDA', privacyTitle: 'Rejangiz o‘zingizda qoladi.',
      privacyDescription: 'Belgilaringiz va natijalaringiz faqat shu qurilmaning brauzerida saqlanadi. Hisob, joylashuv yoki server bilan sinxronlash yo‘q.',
      exportPlan: 'Zaxira nusxa olish', importPlan: 'Zaxira nusxani yuklash', footerNote: 'Eslatma: kichik, izchil qadamlar muhim.',
      saved: 'Qurilmada maxfiy saqlandi.', saveError: 'Qurilmada saqlanmadi. Brauzer xotirasi sozlamalarini tekshiring.',
      loadError: 'Saqlangan reja o‘qilmadi. Xotira ishlasa, yangi o‘zgarishlar saqlanadi.',
      exportError: 'Zaxira nusxa yaratilmadi.', importError: 'Bu Ibodat rejasi zaxira fayli emas.',
      importSuccess: 'Zaxira nusxa ushbu qurilmada tiklandi.', importReadError: 'Faylni o‘qib bo‘lmadi.',
      invalidNumber: 'Ruxsat etilgan oraliqdagi butun sonni kiriting.', todayComplete: 'Bugun {total} tadan {done} tasi bajarildi.',
      todayProgress: '{total} tadan {done} tasi bajarildi', daysLeft: '{count} kun', weeksLeft: '{count} hafta',
      prayerLabel: 'Bomdod namozi', dhuhrLabel: 'Peshin namozi', asrLabel: 'Asr namozi', maghribLabel: 'Shom namozi',
      ishaLabel: 'Xufton namozi', quranLabel: 'Qur’on tilovati', dhikrLabel: 'Zikr', duaLabel: 'Duo',
      kindnessLabel: 'Yaxshilik qilish', prayerAria: 'Qazo namoz rejasi jarayoni', fastAria: 'Qazo ro‘za rejasi jarayoni'
    },
    ru: {
      skip: 'Перейти к содержимому', brandCaption: 'ПЛАН ПОКЛОНЕНИЯ', navToday: 'Сегодня', navPlan: 'Мой план',
      navPrivacy: 'Приватность', languageLabel: 'Язык', themeToggleAria: 'Переключить цветовую тему', mainSite: 'Главный сайт ↗',
      heroEyebrow: 'Мягкий план, созданный для вас', heroTitle: 'Освободите место для', heroAccent: 'важного.',
      heroDescription: 'Спокойное место, чтобы следить за сегодняшним поклонением и постепенно восполнять молитвы или посты.',
      startToday: 'Начать с сегодняшнего дня', todayLabel: 'СЕГОДНЯ', yourDay: 'ВАШ ДЕНЬ', statCompleted: 'Выполнено сегодня',
      statStreak: 'Дней подряд', statNext: 'Осталось молитв', days: 'дней', day: 'день',
      todayTitle: 'Маленькие шаги важны.', todayIntro: 'Выберите подходящие дела на сегодня. Ваш список виден только вам.',
      dailyTitle: 'Ритм дня', dailyDescription: 'Мягкий список, который обновляется каждый день.',
      customHabitLabel: 'Добавить личную привычку', customHabitPlaceholder: 'Например: позвонить родителям',
      addHabit: 'Добавить', removeHabit: 'Удалить', removeHabitAria: 'Удалить привычку «{habit}»', customHabitLimit: 'Можно добавить не более 5 личных привычек.',
      weeklyTitle: 'Ваши последние 7 дней', weeklyHint: 'Один столбец — один день',
      focusKicker: 'ОДИН ДОБРЫЙ ШАГ', focusTitle: 'Постоянство важнее идеала.',
      focusDescription: 'Ваш план может быть небольшим, гибким и только вашим. Пропущенный день — повод начать снова.',
      focusLink: 'Составить подходящий план ↗', gentleReminder: 'Делайте следующий хороший шаг в устойчивом для вас темпе.',
      planKicker: 'ВАШ ЛИЧНЫЙ ПЛАН', planTitle: 'Продвигайтесь в своём темпе.',
      planIntro: 'Укажите собственные оценки и ежедневные цели. Ничего не загружается и не публикуется.',
      prayerPlanTitle: 'План восполнения молитв', prayerPlanDescription: 'Укажите собственную оценку пропущенных молитв.',
      prayersRemaining: 'Осталось отдельных молитв (ваша оценка)', prayerUnits: 'отдельных молитв',
      prayersDaily: 'Ваша цель на день', prayerUnitsPerDay: 'молитв в день', estimatedTime: 'При таком темпе',
      completePrayerGoal: 'Отметить цель на сегодня', prayerGoalDone: 'Цель по молитвам на сегодня выполнена. Продолжите завтра.', noPrayerGoal: 'В плане не осталось молитв для восполнения.',
      prayerGoalMarked: 'Отмечено выполненными молитв: {count}. Продолжайте спокойно.',
      fastPlanTitle: 'План восполнения поста', fastPlanDescription: 'Отслеживайте дни поста, которые хотите восполнить.',
      fastsRemaining: 'Осталось дней поста (ваша оценка)', fastDays: 'дней поста',
      fastsWeekly: 'Ваша цель на неделю', fastsPerWeek: 'дней поста в неделю', weeks: 'недель', week: 'неделя',
      completeFastGoal: 'Отметить один день поста', fastGoalDone: 'Пост на сегодня уже отмечен. Продолжите завтра.', noFastGoal: 'В плане не осталось дней поста для восполнения.',
      fastGoalMarked: 'Отмечен один день поста. Продолжайте спокойно.',
      importantNote: 'Личный планировщик, а не религиозное постановление.',
      guidanceText: 'Оценки и практика могут различаться в зависимости от обстоятельств и мазхаба. За личной религиозной консультацией обратитесь к доверенному учёному. Цели можно менять.',
      privacyKicker: 'КОНФИДЕНЦИАЛЬНОСТЬ В ОСНОВЕ', privacyTitle: 'Ваш план остаётся у вас.',
      privacyDescription: 'Список и прогресс хранятся только в браузере на этом устройстве. Аккаунт, геолокация и синхронизация с сервером не используются.',
      exportPlan: 'Скачать резервную копию', importPlan: 'Восстановить копию', footerNote: 'Напоминание: важны маленькие, постоянные шаги.',
      saved: 'Конфиденциально сохранено на устройстве.', saveError: 'Не удалось сохранить данные. Проверьте настройки хранилища браузера.',
      loadError: 'Не удалось прочитать план. Новые изменения сохранятся, если хранилище доступно.',
      exportError: 'Не удалось создать резервную копию.', importError: 'Этот файл не является резервной копией Ibodat Path.',
      importSuccess: 'Резервная копия восстановлена на этом устройстве.', importReadError: 'Не удалось прочитать файл.',
      invalidNumber: 'Введите целое число в допустимом диапазоне.', todayComplete: 'Сегодня выполнено {done} из {total}.',
      todayProgress: 'Выполнено {done} из {total}', daysLeft: '{count} дней', weeksLeft: '{count} недель',
      prayerLabel: 'Молитва Фаджр', dhuhrLabel: 'Молитва Зухр', asrLabel: 'Молитва Аср', maghribLabel: 'Молитва Магриб',
      ishaLabel: 'Молитва Иша', quranLabel: 'Чтение Корана', dhikrLabel: 'Зикр', duaLabel: 'Дуа',
      kindnessLabel: 'Доброе дело', prayerAria: 'Прогресс плана восполнения молитв', fastAria: 'Прогресс плана восполнения поста'
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const languageSelect = $('#language');
  const themeButton = $('#theme');
  const dailyStatus = $('#daily-status');
  const customHabitStatus = $('#custom-habit-status');
  const prayerStatus = $('#prayer-status');
  const fastStatus = $('#fast-status');
  const saveStatus = $('#save-status');
  let language = 'en';
  let storageAvailable = true;
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));

  const t = (key, values = {}) => Object.entries(values).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    translations[language]?.[key] || translations.en[key] || key
  );
  const localDateKey = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const shiftDate = (date, amount) => {
    const shifted = new Date(date);
    shifted.setDate(shifted.getDate() + amount);
    return shifted;
  };
  const todayKey = () => localDateKey();
  const formatNumber = (value) => new Intl.NumberFormat(language).format(value);
  const isWholeNumber = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
  const defaultToday = () => ({ habits: Object.fromEntries(HABITS.map((habit) => [habit, false])) });
  const habitKeys = () => [...HABITS, ...state.customHabits.map((habit) => habit.id)];
  const getTodayEntry = () => {
    state.entries[todayKey()] ||= defaultToday();
    habitKeys().forEach((habit) => {
      if (typeof state.entries[todayKey()].habits[habit] !== 'boolean') {
        state.entries[todayKey()].habits[habit] = false;
      }
    });
    return state.entries[todayKey()];
  };
  const getDoneToday = () => habitKeys().reduce((sum, habit) => sum + Number(getTodayEntry().habits[habit] === true), 0);
  const hasAnyHabit = (key) => Object.values(state.entries[key]?.habits || {}).some((done) => done === true);
  const streakCount = () => {
    const start = hasAnyHabit(todayKey()) ? new Date() : shiftDate(new Date(), -1);
    let streak = 0;
    for (let day = start; streak < 366; day.setDate(day.getDate() - 1)) {
      if (!hasAnyHabit(localDateKey(day))) break;
      streak += 1;
    }
    return streak;
  };
  const safeStorage = (operation) => {
    try {
      operation();
      return true;
    } catch (error) {
      console.error('Ibodat Path local storage operation failed.', error);
      storageAvailable = false;
      saveStatus.textContent = t('saveError');
      return false;
    }
  };
  const persist = (message = 'saved') => {
    if (!safeStorage(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(state)))) return false;
    storageAvailable = true;
    saveStatus.textContent = t(message);
    return true;
  };
  const validState = (value) => {
    if (!value || value.version !== 1 || typeof value.entries !== 'object' || !value.entries || Array.isArray(value.entries)
      || typeof value.qada !== 'object' || !value.qada || typeof value.settings !== 'object' || !value.settings) return false;
    const qada = value.qada;
    const customHabits = value.customHabits ?? [];
    if (!Array.isArray(customHabits) || customHabits.length > 5) return false;
    const customIds = new Set();
    if (!customHabits.every((habit) => {
      if (!habit || typeof habit.id !== 'string' || !/^custom-[a-z0-9-]{3,48}$/.test(habit.id)
        || typeof habit.label !== 'string' || habit.label.trim().length < 1 || habit.label.trim().length > 60
        || customIds.has(habit.id)) return false;
      customIds.add(habit.id);
      return true;
    })) return false;
    const validHabitKeys = new Set([...HABITS, ...customIds]);
    return isWholeNumber(qada.prayerRemaining, 0, 1000000)
      && isWholeNumber(qada.prayerCompleted, 0, 1000000)
      && isWholeNumber(qada.prayerDailyTarget, 1, 100)
      && isWholeNumber(qada.fastRemaining, 0, 100000)
      && isWholeNumber(qada.fastCompleted, 0, 100000)
      && isWholeNumber(qada.fastWeeklyTarget, 1, 7)
      && typeof qada.doneToday === 'object' && qada.doneToday !== null && !Array.isArray(qada.doneToday)
      && Object.entries(qada.doneToday).every(([date, done]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) && done && typeof done === 'object' && !Array.isArray(done)
        && (done.prayer === undefined || typeof done.prayer === 'boolean')
        && (done.fast === undefined || typeof done.fast === 'boolean'))
      && Object.entries(value.entries).every(([date, entry]) =>
        /^\d{4}-\d{2}-\d{2}$/.test(date) && entry && typeof entry.habits === 'object'
        && !Array.isArray(entry.habits)
        && HABITS.every((habit) => typeof entry.habits[habit] === 'boolean')
        && Object.entries(entry.habits).every(([habit, done]) => validHabitKeys.has(habit) && typeof done === 'boolean'))
      && ['en', 'uz', 'ru'].includes(value.settings.language)
      && ['light', 'dark'].includes(value.settings.theme);
  };
  const setTheme = (theme) => {
    document.body.dataset.theme = theme;
    themeButton.setAttribute('aria-pressed', String(theme === 'dark'));
    themeButton.textContent = theme === 'dark' ? '☀' : '◐';
  };
  const setLanguage = (nextLanguage) => {
    language = Object.hasOwn(translations, nextLanguage) ? nextLanguage : 'en';
    document.documentElement.lang = language;
    languageSelect.value = language;
    document.title = language === 'uz'
      ? 'Ibodat Path — ibodatlarni izchil rejalashtiring | Islamic Official'
      : language === 'ru'
        ? 'Ibodat Path — план поклонения в своём темпе | Islamic Official'
        : 'Ibodat Path — a calmer way to stay consistent | Islamic Official';
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      const key = element.dataset.i18n;
      if (translations[language][key]) element.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
      element.setAttribute('aria-label', t(element.dataset.i18nAria));
    });
    $('#custom-habit-input').placeholder = t('customHabitPlaceholder');
    renderDate();
    renderChecklist();
    renderPlans();
    renderProgress();
    if (!storageAvailable) saveStatus.textContent = t('saveError');
  };
  const renderDate = () => {
    const now = new Date();
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en';
    $('#date-heading').textContent = new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'long', day: 'numeric' }).format(now);
    $('#hero-day').textContent = new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(now);
    $('#hero-month').textContent = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(now);
    try {
      $('#hijri-date').textContent = new Intl.DateTimeFormat(`${locale}-u-ca-islamic`, { dateStyle: 'long' }).format(now);
    } catch (error) {
      console.error('Hijri date is not available in this browser.', error);
      $('#hijri-date').textContent = '';
    }
  };
  const renderChecklist = () => {
    const container = $('#checklist');
    container.replaceChildren();
    const entry = getTodayEntry();
    const checklistItems = [
      ...HABITS.map((habit) => ({ id: habit, label: t(`${habit}Label`) })),
      ...state.customHabits
    ];
    checklistItems.forEach(({ id, label: habitLabel }) => {
      const label = document.createElement('label');
      label.className = `check-item${entry.habits[id] ? ' is-complete' : ''}`;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = entry.habits[id];
      input.addEventListener('change', () => {
        entry.habits[id] = input.checked;
        label.classList.toggle('is-complete', input.checked);
        renderProgress();
        persist();
      });
      const text = document.createElement('span');
      text.textContent = habitLabel;
      label.append(input, text);
      container.append(label);
    });
    const customList = $('#custom-habit-list');
    customList.replaceChildren();
    state.customHabits.forEach((habit) => {
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'remove-habit';
      removeButton.textContent = `× ${habit.label}`;
      removeButton.setAttribute('aria-label', t('removeHabitAria', { habit: habit.label }));
      removeButton.addEventListener('click', () => {
        state.customHabits = state.customHabits.filter((item) => item.id !== habit.id);
        Object.values(state.entries).forEach((day) => delete day.habits[habit.id]);
        customHabitStatus.textContent = '';
        renderChecklist();
        renderProgress();
        persist();
      });
      customList.append(removeButton);
    });
  };
  const renderWeek = () => {
    const chart = $('#week-chart');
    chart.replaceChildren();
    const total = habitKeys().length;
    const locale = language === 'uz' ? 'uz-UZ' : language === 'ru' ? 'ru-RU' : 'en';
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = shiftDate(new Date(), -offset);
      const key = localDateKey(date);
      const done = habitKeys().reduce((sum, habit) => sum + Number(state.entries[key]?.habits?.[habit] === true), 0);
      const day = document.createElement('div');
      day.className = `week-day${offset === 0 ? ' is-today' : ''}`;
      day.setAttribute('role', 'img');
      day.setAttribute('aria-label', `${new Intl.DateTimeFormat(locale, { weekday: 'long', month: 'short', day: 'numeric' }).format(date)}: ${t('todayProgress', { done: formatNumber(done), total: formatNumber(total) })}`);
      const label = document.createElement('span');
      label.className = 'week-day-label';
      label.textContent = new Intl.DateTimeFormat(locale, { weekday: 'narrow' }).format(date);
      const track = document.createElement('span');
      track.className = 'week-day-track';
      const fill = document.createElement('span');
      fill.className = 'week-day-fill';
      fill.style.height = `${done / total * 100}%`;
      track.append(fill);
      const count = document.createElement('small');
      count.textContent = `${done}/${total}`;
      day.append(label, track, count);
      chart.append(day);
    }
  };
  const renderProgress = () => {
    const done = getDoneToday();
    const total = habitKeys().length;
    const ratio = done / total * 100;
    const copy = t('todayProgress', { done: formatNumber(done), total: formatNumber(total) });
    $('#daily-count').textContent = copy;
    $('#stat-completed').textContent = `${formatNumber(done)} / ${formatNumber(total)}`;
    $('#daily-progress-bar').style.width = `${ratio}%`;
    $('#daily-progress').setAttribute('aria-valuenow', String(done));
    $('#daily-progress').setAttribute('aria-valuemax', String(total));
    $('#daily-progress').setAttribute('aria-label', copy);
    dailyStatus.textContent = t('todayComplete', { done: formatNumber(done), total: formatNumber(total) });
    const streak = streakCount();
    $('#stat-streak').textContent = `${formatNumber(streak)} ${t('days')}`;
    $('#stat-remaining').textContent = formatNumber(state.qada.prayerRemaining);
    renderWeek();
  };
  const renderPlans = () => {
    const qada = state.qada;
    $('#prayers-remaining').value = String(qada.prayerRemaining);
    $('#prayers-daily').value = String(qada.prayerDailyTarget);
    $('#fasts-remaining').value = String(qada.fastRemaining);
    $('#fasts-weekly').value = String(qada.fastWeeklyTarget);
    const prayerDays = qada.prayerRemaining === 0 ? 0 : Math.ceil(qada.prayerRemaining / qada.prayerDailyTarget);
    const fastingWeeks = qada.fastRemaining === 0 ? 0 : Math.ceil(qada.fastRemaining / qada.fastWeeklyTarget);
    $('#prayer-days').textContent = t('daysLeft', { count: formatNumber(prayerDays) });
    $('#fast-weeks').textContent = t('weeksLeft', { count: formatNumber(fastingWeeks) });
    const prayerTotal = qada.prayerCompleted + qada.prayerRemaining;
    const fastTotal = qada.fastCompleted + qada.fastRemaining;
    const prayerPercent = prayerTotal ? qada.prayerCompleted / prayerTotal * 100 : 0;
    const fastPercent = fastTotal ? qada.fastCompleted / fastTotal * 100 : 0;
    $('#prayer-progress-bar').style.width = `${prayerPercent}%`;
    $('#fast-progress-bar').style.width = `${fastPercent}%`;
    $('#prayer-progress-bar').parentElement.setAttribute('role', 'progressbar');
    $('#prayer-progress-bar').parentElement.setAttribute('aria-label', t('prayerAria'));
    $('#prayer-progress-bar').parentElement.setAttribute('aria-valuemin', '0');
    $('#prayer-progress-bar').parentElement.setAttribute('aria-valuemax', String(Math.max(1, prayerTotal)));
    $('#prayer-progress-bar').parentElement.setAttribute('aria-valuenow', String(qada.prayerCompleted));
    $('#fast-progress-bar').parentElement.setAttribute('role', 'progressbar');
    $('#fast-progress-bar').parentElement.setAttribute('aria-label', t('fastAria'));
    $('#fast-progress-bar').parentElement.setAttribute('aria-valuemin', '0');
    $('#fast-progress-bar').parentElement.setAttribute('aria-valuemax', String(Math.max(1, fastTotal)));
    $('#fast-progress-bar').parentElement.setAttribute('aria-valuenow', String(qada.fastCompleted));
    const alreadyDone = qada.doneToday[todayKey()] || {};
    const prayerButton = $('#complete-prayer-plan');
    prayerButton.disabled = qada.prayerRemaining === 0 || alreadyDone.prayer === true;
    prayerButton.textContent = alreadyDone.prayer === true
      ? t('prayerGoalDone')
      : qada.prayerRemaining === 0 ? t('noPrayerGoal') : t('completePrayerGoal');
    const fastButton = $('#complete-fast-plan');
    fastButton.disabled = qada.fastRemaining === 0 || alreadyDone.fast === true;
    fastButton.textContent = alreadyDone.fast === true
      ? t('fastGoalDone')
      : qada.fastRemaining === 0 ? t('noFastGoal') : t('completeFastGoal');
    prayerStatus.textContent = '';
    fastStatus.textContent = '';
  };
  const parseInput = (selector, min, max) => {
    const input = $(selector);
    const value = Number(input.value);
    const valid = input.value.trim() !== '' && isWholeNumber(value, min, max);
    input.setAttribute('aria-invalid', String(!valid));
    return valid ? value : null;
  };
  const bindNumberInput = (selector, key, min, max, statusElement) => {
    const input = $(selector);
    const update = () => {
      const value = parseInput(selector, min, max);
      if (value === null) return;
      state.qada[key] = value;
      renderPlans();
      renderProgress();
      persist();
    };
    input.addEventListener('input', update);
    input.addEventListener('change', () => {
      if (parseInput(selector, min, max) === null) {
        statusElement.textContent = t('invalidNumber');
      } else {
        statusElement.textContent = '';
      }
    });
  };
  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!validState(parsed)) {
        saveStatus.textContent = t('loadError');
        console.error('Saved Ibodat Path data does not match the expected schema.');
        return;
      }
      state = { ...parsed, customHabits: parsed.customHabits || [] };
    } catch (error) {
      console.error('Could not load Ibodat Path data.', error);
      saveStatus.textContent = t('loadError');
    }
  };

  $('#complete-prayer-plan').addEventListener('click', () => {
    const qada = state.qada;
    const doneToday = qada.doneToday[todayKey()] || {};
    if (qada.prayerRemaining <= 0 || doneToday.prayer) return;
    const completed = Math.min(qada.prayerRemaining, qada.prayerDailyTarget);
    qada.prayerRemaining -= completed;
    qada.prayerCompleted += completed;
    qada.doneToday[todayKey()] = { ...doneToday, prayer: true };
    renderPlans();
    renderProgress();
    prayerStatus.textContent = t('prayerGoalMarked', { count: formatNumber(completed) });
    persist();
  });
  $('#complete-fast-plan').addEventListener('click', () => {
    const qada = state.qada;
    const doneToday = qada.doneToday[todayKey()] || {};
    if (qada.fastRemaining <= 0 || doneToday.fast) return;
    qada.fastRemaining -= 1;
    qada.fastCompleted += 1;
    qada.doneToday[todayKey()] = { ...doneToday, fast: true };
    renderPlans();
    renderProgress();
    fastStatus.textContent = t('fastGoalMarked');
    persist();
  });
  $('#custom-habit-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const input = $('#custom-habit-input');
    const label = input.value.trim();
    if (!label) {
      input.focus();
      return;
    }
    if (state.customHabits.length >= 5) {
      customHabitStatus.textContent = t('customHabitLimit');
      return;
    }
    const id = `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    state.customHabits.push({ id, label });
    input.value = '';
    customHabitStatus.textContent = '';
    renderChecklist();
    renderProgress();
    persist();
  });
  $('#export-data').addEventListener('click', () => {
    try {
      const file = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ibodat-path-${todayKey()}.json`;
      link.click();
      URL.revokeObjectURL(url);
      saveStatus.textContent = t('saved');
    } catch (error) {
      console.error('Could not export the Ibodat Path backup.', error);
      saveStatus.textContent = t('exportError');
    }
  });
  $('#import-trigger').addEventListener('click', () => $('#import-file').click());
  $('#import-file').addEventListener('change', async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (file.size > 1024 * 1024) throw new Error('Backup file exceeds 1 MB.');
      const imported = JSON.parse(await file.text());
      if (!validState(imported)) throw new Error('Backup schema is invalid.');
      state = { ...imported, customHabits: imported.customHabits || [] };
      setTheme(state.settings.theme);
      setLanguage(state.settings.language);
      if (persist('importSuccess')) {
        renderPlans();
        renderProgress();
      }
    } catch (error) {
      console.error('Could not import the Ibodat Path backup.', error);
      saveStatus.textContent = error instanceof SyntaxError || error.message === 'Backup schema is invalid.'
        || error.message === 'Backup file exceeds 1 MB.' ? t('importError') : t('importReadError');
    }
  });
  languageSelect.addEventListener('change', () => {
    state.settings.language = languageSelect.value;
    setLanguage(languageSelect.value);
    persist();
  });
  themeButton.addEventListener('click', () => {
    const theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
    state.settings.theme = theme;
    setTheme(theme);
    persist();
  });

  const savedRaw = (() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Could not access Ibodat Path storage.', error);
      storageAvailable = false;
      return null;
    }
  })();
  if (savedRaw) loadState();
  language = state.settings.language;
  setTheme(state.settings.theme);
  bindNumberInput('#prayers-remaining', 'prayerRemaining', 0, 1000000, prayerStatus);
  bindNumberInput('#prayers-daily', 'prayerDailyTarget', 1, 100, prayerStatus);
  bindNumberInput('#fasts-remaining', 'fastRemaining', 0, 100000, fastStatus);
  bindNumberInput('#fasts-weekly', 'fastWeeklyTarget', 1, 7, fastStatus);
  setLanguage(language);
  renderProgress();
  if (storageAvailable) saveStatus.textContent = t('saved');
})();
