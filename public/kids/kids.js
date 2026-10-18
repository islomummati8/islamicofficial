(() => {
  const easyQuestions = [
    { text: 'Qur’oni Karim nechta suradan iborat?', options: ['30 ta', '114 ta', '99 ta'], answer: 1, note: 'Qur’oni Karimda 114 ta sura bor.' },
    { text: 'Qaysi sura Qur’onning boshida keladi?', options: ['Al-Fotiha', 'Al-Ikhlos', 'An-Nas'], answer: 0, note: 'Al-Fotiha Qur’onning birinchi surasidir.' },
    { text: 'Musulmonlar qaysi oyda ro‘za tutadilar?', options: ['Ramazon oyida', 'Shavvol oyida', 'Safar oyida'], answer: 0, note: 'Ramazon ro‘za oyi hisoblanadi.' },
    { text: 'Salomlashganda qanday chiroyli so‘z aytamiz?', options: ['Xayrli tong', 'Assalomu alaykum', 'Marhamat'], answer: 1, note: '“Assalomu alaykum” — tinchlik tilashdir.' },
    { text: 'Yaxshi ishni boshlashda nima deymiz?', options: ['Bismillah', 'Alvido', 'Marhamat'], answer: 0, note: '“Bismillah” — Allohning nomi bilan boshlashdir.' },
    { text: 'Ka’ba qaysi shaharda joylashgan?', options: ['Madinada', 'Makkada', 'Quddusda'], answer: 1, note: 'Ka’ba Makkai Mukarramada joylashgan.' },
    { text: 'Ota-onamizga qanday munosabatda bo‘lish chiroyli?', options: ['Mehribon va hurmatli', 'E’tiborsiz', 'Qo‘pol'], answer: 0, note: 'Ota-onaga mehr va hurmat bilan muomala qilish go‘zal odobdir.' },
    { text: 'Payg‘ambarimiz Muhammad (s.a.v.)ga qaysi kitob nozil qilingan?', options: ['Tavrot', 'Zabur', 'Qur’on'], answer: 2, note: 'Qur’oni Karim Muhammad (s.a.v.)ga nozil qilingan.' },
    { text: 'Do‘stimizga yordam bersak, bu qanday ish bo‘ladi?', options: ['Yaxshi amal', 'Bekorchi ish', 'Yomon odat'], answer: 0, note: 'Boshqalarga yordam berish — mehribonlik va yaxshilik.' },
    { text: 'Biror narsa uchun minnatdor bo‘lsak, nima deymiz?', options: ['Kechirasiz', 'Rahmat', 'Xayr'], answer: 1, note: '“Rahmat” deyish chiroyli odobdir.' },
    { text: 'Bir kunda nechta farz namoz bor?', options: ['3 ta', '5 ta', '7 ta'], answer: 1, note: 'Musulmonlar kuniga besh vaqt farz namoz o‘qiydilar.' },
    { text: 'Namozda musulmonlar qaysi tomonga yuzlanadilar?', options: ['Ka’ba tomonga', 'Quyosh tomonga', 'Tog‘ tomonga'], answer: 0, note: 'Namozda qibla — Makkadagi Ka’ba tomonga yuzlaniladi.' },
    { text: 'Qaysi so‘z Allohni barcha nuqsonlardan pok deb ulug‘laydi?', options: ['Subhanalloh', 'Alvido', 'Marhamat'], answer: 0, note: '“Subhanalloh” Allohni pok deb ulug‘lash iborasidir.' },
    { text: 'Musulmonlar namozdan oldin odatda nima qiladilar?', options: ['Tahorat oladilar', 'Ovqat pishiradilar', 'Sayr qiladilar'], answer: 0, note: 'Namoz uchun tahorat olish poklanish amallaridan biridir.' },
    { text: 'Qaysi oyat-kitab musulmonlar uchun muqaddas kitob?', options: ['Qur’oni Karim', 'Ertaklar kitobi', 'Lug‘at'], answer: 0, note: 'Qur’oni Karim musulmonlarning muqaddas kitobidir.' },
    { text: 'Yaxshi gaplashish va rost so‘zlash qanday odat?', options: ['Go‘zal odob', 'Yomon odat', 'Bekorchi ish'], answer: 0, note: 'Rostgo‘ylik va muloyim so‘zlash go‘zal odoblardandir.' },
    { text: 'Ka’bani ko‘rish uchun musulmonlar qaysi shaharga boradilar?', options: ['Makkaga', 'Toshkentga', 'Qohiraga'], answer: 0, note: 'Ka’ba Makkai Mukarrama shahrida joylashgan.' },
    { text: 'Qur’on suralari nimaga bo‘lingan?', options: ['Oyatlar', 'Boblar', 'Sahna ko‘rinishlari'], answer: 0, note: 'Suralar oyatlardan tashkil topadi.' },
    { text: 'Birov xato qilsa, unga qanday munosabat yaxshi?', options: ['Muloyim tushuntirish', 'Masxara qilish', 'Jahl bilan gapirish'], answer: 0, note: 'Mehr bilan tushuntirish va kechirimli bo‘lish yaxshi odobdir.' },
    { text: 'Ramazon oyida musulmonlar qaysi ibodatni ado etadilar?', options: ['Ro‘za tutadilar', 'Hayit namozini har kuni o‘qiydilar', 'Haj qiladilar'], answer: 0, note: 'Ramazon oyida ro‘za tutish musulmonlar uchun muhim ibodatdir.' }
  ];
  const mediumQuestions = [
    { text: 'Qur’ondagi eng uzun sura qaysi?', options: ['Al-Baqara', 'Al-Ikhlos', 'Al-Kavsar'], answer: 0, note: 'Al-Baqara Qur’ondagi eng uzun suradir.' },
    { text: 'Qur’ondagi eng qisqa sura qaysi?', options: ['Al-Fil', 'Al-Kavsar', 'An-Nas'], answer: 1, note: 'Al-Kavsar surasi oyatlari soni jihatidan eng qisqa suradir.' },
    { text: 'Oyatul Kursiy qaysi surada keladi?', options: ['Al-Baqara', 'Maryam', 'Al-Fotiha'], answer: 0, note: 'Oyatul Kursiy Baqara surasining 255-oyatidir.' },
    { text: 'Vahiy olib kelgan farishta kim?', options: ['Jabroil', 'Mikoil', 'Isrofil'], answer: 0, note: 'Jabroil (a.s.) payg‘ambarlarga vahiy olib kelgan.' },
    { text: 'Hijratda Makka shahridan qaysi shaharga ko‘chilgan?', options: ['Toifga', 'Madinaga', 'Quddusga'], answer: 1, note: 'Payg‘ambar Muhammad (s.a.v.) va sahobalar Madinaga hijrat qilganlar.' },
    { text: 'Birinchi vahiy qaysi g‘orda nozil bo‘lgan?', options: ['Hiro g‘orida', 'Savr g‘orida', 'Uhud tog‘ida'], answer: 0, note: 'Birinchi vahiy Hiro g‘orida nozil bo‘lgan.' },
    { text: 'Qur’on necha juzga bo‘lingan?', options: ['20 juz', '30 juz', '40 juz'], answer: 1, note: 'Qur’on o‘qishni rejalashda odatda 30 juzga bo‘lib o‘rganiladi.' },
    { text: 'Ramazon tugagach qaysi hayit nishonlanadi?', options: ['Ramazon hayiti', 'Qurbon hayiti', 'Navro‘z'], answer: 0, note: 'Ramazon oyi yakunida Ramazon hayiti nishonlanadi.' },
    { text: 'Qurbon hayiti qaysi hijriy oyda bo‘ladi?', options: ['Muharram', 'Ramazon', 'Zulhijja'], answer: 2, note: 'Qurbon hayiti Zulhijja oyining 10-kunida bo‘ladi.' },
    { text: 'Fil voqeasi qaysi surada eslatiladi?', options: ['Al-Fil', 'Al-Masad', 'Al-Qadr'], answer: 0, note: 'Al-Fil surasida fil voqeasi haqida eslatiladi.' },
    { text: 'Qur’onning birinchi surasi qaysi?', options: ['Al-Fotiha', 'Al-Baqara', 'An-Nas'], answer: 0, note: 'Mushaf tartibida Qur’on Al-Fotiha surasi bilan boshlanadi.' },
    { text: 'Qur’onning oxirgi surasi qaysi?', options: ['Al-Falaq', 'An-Nas', 'Al-Ikhlos'], answer: 1, note: 'Mushaf tartibidagi oxirgi sura — An-Nas.' },
    { text: 'Ramazon oyidan oldin qaysi hijriy oy keladi?', options: ['Sha’bon', 'Shavvol', 'Zulqa’da'], answer: 0, note: 'Hijriy taqvimda Sha’bon oyidan keyin Ramazon keladi.' },
    { text: 'Dovud (a.s.)ga qaysi kitob berilgan?', options: ['Zabur', 'Tavrot', 'Injil'], answer: 0, note: 'Islomiy ta’limotda Zabur Dovud (a.s.)ga berilgan.' },
    { text: 'Muso (a.s.)ga qaysi kitob berilgan?', options: ['Injil', 'Tavrot', 'Zabur'], answer: 1, note: 'Islomiy ta’limotda Tavrot Muso (a.s.)ga berilgan.' },
    { text: 'Iso (a.s.)ga qaysi kitob berilgan?', options: ['Injil', 'Zabur', 'Tavrot'], answer: 0, note: 'Islomiy ta’limotda Injil Iso (a.s.)ga berilgan.' },
    { text: 'Hajning asosiy amallaridan biri Arafotda qaysi kuni ado etiladi?', options: ['Zulhijjaning 9-kuni', 'Ramazonning 1-kuni', 'Muharramning 10-kuni'], answer: 0, note: 'Hajdagi Arafot kuni Zulhijjaning 9-kunidir.' },
    { text: 'Ro‘za tutgan kishi quyosh botgach qaysi paytda og‘iz ochadi?', options: ['Shom vaqti', 'Bomdod vaqti', 'Peshin vaqti'], answer: 0, note: 'Quyosh botib, shom vaqti kirgach iftor qilinadi.' },
    { text: 'Madinaga hijratdan keyin qurilgan ilk masjid qaysi?', options: ['Qubo masjidi', 'Masjidul Harom', 'Masjidul Aqso'], answer: 0, note: 'Qubo masjidi Payg‘ambarimiz (s.a.v.) Madinaga hijrat qilganlarida qurilgan.' },
    { text: 'Islomning asosiy ruknlari nechta?', options: ['Besh', 'Uch', 'Yetti'], answer: 0, note: 'Islomning besh rukni bor.' }
  ];
  const hardQuestions = [
    { text: 'Qur’onda boshida “Bismillahir rohmanir rohiym” kelmaydigan sura qaysi?', options: ['At-Tavba', 'An-Naml', 'Al-Fotiha'], answer: 0, note: 'At-Tavba surasi boshida basmala yozilmagan.' },
    { text: 'Qaysi surada basmala sura boshidan tashqari oyat ichida ham keladi?', options: ['An-Naml', 'Al-Kavsar', 'Al-Asr'], answer: 0, note: 'An-Naml surasining 30-oyatida basmala bor.' },
    { text: 'Qur’ondagi eng uzun oyat qaysi surada?', options: ['Al-Baqara', 'Al-Fotiha', 'An-Nas'], answer: 0, note: 'Eng uzun oyat Baqara surasining 282-oyatidir.' },
    { text: 'Laylatul Qadr qaysi surada nomi bilan zikr qilingan?', options: ['Al-Qadr', 'Al-Fil', 'Al-Ma’un'], answer: 0, note: 'Laylatul Qadr Al-Qadr surasida zikr qilinadi.' },
    { text: 'Ibrohim (a.s.) Ka’baning poydevorini kim bilan ko‘targan?', options: ['Ismoil (a.s.)', 'Muso (a.s.)', 'Yunus (a.s.)'], answer: 0, note: 'Qur’onda Ibrohim va Ismoil (a.s.) Ka’baning poydevorini ko‘targanlari aytiladi.' },
    { text: '“Qul huvallohu ahad” qaysi suraning boshlanishidir?', options: ['Al-Ikhlos', 'Al-Falaq', 'Al-Kavsar'], answer: 0, note: 'Bu Al-Ikhlos surasining boshlanishidir.' },
    { text: 'Qur’onning 2-surasining nomi nima?', options: ['Al-Baqara', 'Oli Imron', 'An-Niso'], answer: 0, note: 'Mushaf tartibidagi ikkinchi sura — Al-Baqara.' },
    { text: 'Qur’onda “As’hobul fil” voqeasi qaysi surada bayon qilingan?', options: ['Al-Fil', 'Al-Qadr', 'Al-Humaza'], answer: 0, note: 'Bu voqea Al-Fil surasida eslatiladi.' },
    { text: 'Qur’onda “ikki dengiz orasidagi to‘siq” haqida qaysi surada so‘z boradi?', options: ['Ar-Rahmon', 'Al-Ikhlos', 'Al-Masad'], answer: 0, note: 'Ar-Rahmon surasida ikki dengiz va ular orasidagi to‘siq haqida aytiladi.' },
    { text: 'Qur’onda chumoli haqidagi voqea qaysi payg‘ambar qissasida keladi?', options: ['Sulaymon (a.s.)', 'Yusuf (a.s.)', 'Ayyub (a.s.)'], answer: 0, note: 'Chumoli voqeasi Sulaymon (a.s.) qissasida, An-Naml surasida keladi.' },
    { text: 'Payg‘ambarimiz Muhammad (s.a.v.)ga birinchi vahiy kelgan g‘or qaysi?', options: ['Hiro', 'Savr', 'Uhud'], answer: 0, note: 'Birinchi vahiy Hiro g‘orida kelgan.' },
    { text: '“Al-Fotiha” nomi qanday ma’noni bildiradi?', options: ['Ochuvchi', 'Yordam', 'Tong'], answer: 0, note: 'Al-Fotiha so‘zi “ochuvchi” ma’nosini bildiradi.' },
    { text: 'Qurbon hayiti hijriy taqvimning qaysi oyida bo‘ladi?', options: ['Zulhijja', 'Rajab', 'Safar'], answer: 0, note: 'Qurbon hayiti Zulhijja oyida bo‘ladi.' },
    { text: 'Qur’onda payg‘ambar Yusuf (a.s.) qissasi batafsil qaysi surada keladi?', options: ['Yusuf', 'Hud', 'Nuh'], answer: 0, note: 'Yusuf (a.s.) qissasi Yusuf surasida bayon qilingan.' },
    { text: 'Qur’onda 30-juz qaysi sura bilan tugaydi?', options: ['An-Nas', 'Al-Falaq', 'Al-Ikhlos'], answer: 0, note: 'Qur’onning oxirgi surasi An-Nas bo‘lib, 30-juz shu sura bilan tugaydi.' }
  ];
  const questionSets = { easy: easyQuestions, medium: mediumQuestions, hard: hardQuestions };
  const bestKey = 'islamic-kids-quiz-best-v2';
  const optionsElement = document.getElementById('answer-options');
  const questionText = document.getElementById('question-text');
  const nextButton = document.getElementById('next-question');
  const feedback = document.getElementById('answer-feedback');
  let questions = [];
  let difficulty = 'easy';
  let current = 0;
  let score = 0;
  let answered = false;

  function loadBest(level = difficulty) {
    try {
      const stored = localStorage.getItem(`${bestKey}-${level}`);
      const legacy = level === 'easy' ? localStorage.getItem('islamic-kids-quiz-best-v1') : null;
      const best = Number(stored || legacy || 0);
      return Number.isInteger(best) && best >= 0 ? best : 0;
    } catch (error) {
      console.error('Could not read children quiz best score:', error);
      return 0;
    }
  }

  function saveBest(best) {
    try {
      localStorage.setItem(`${bestKey}-${difficulty}`, String(best));
      syncKidsAccount();
    } catch (error) {
      console.error('Could not save children quiz best score:', error);
      feedback.textContent = 'Natijani qurilmada saqlab bo‘lmadi.';
    }
  }

  function syncKidsAccount() {
    const account = window.islamicSiteAccount;
    if (!account?.user) return;
    const bestScores = Object.fromEntries(Object.keys(questionSets).map(level => [level, loadBest(level)]));
    account.save('kids', { bestScores }).catch(error => {
      console.error('Could not sync children quiz scores:', error);
      feedback.textContent = 'Natija qurilmada saqlandi, akkaunt bilan sinxronlashmadi.';
    });
  }

  function startQuiz(level = difficulty) {
    difficulty = level;
    const pool = [...questionSets[difficulty]];
    for (let index = pool.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
    }
    questions = pool.slice(0, 10);
    current = 0;
    score = 0;
    nextButton.hidden = false;
    document.getElementById('restart-quiz').hidden = true;
    document.getElementById('best-score').textContent = String(loadBest());
    renderQuestion();
  }

  function renderQuestion() {
    answered = false;
    const question = questions[current];
    document.getElementById('question-number').textContent = `${current + 1} / ${questions.length}`;
    document.getElementById('quiz-progress').style.width = `${((current + 1) / questions.length) * 100}%`;
    questionText.textContent = question.text;
    feedback.textContent = '';
    feedback.removeAttribute('data-result');
    nextButton.disabled = true;
    nextButton.textContent = 'Javobni tanlang';
    optionsElement.replaceChildren(...question.options.map((label, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'answer-option';
      button.setAttribute('aria-pressed', 'false');
      const letter = document.createElement('span');
      letter.className = 'option-letter';
      letter.textContent = String.fromCharCode(65 + index);
      const text = document.createElement('span');
      text.textContent = label;
      button.append(letter, text);
      button.addEventListener('click', () => chooseAnswer(index));
      return button;
    }));
  }

  function finishQuiz() {
    questionText.textContent = `Ajoyib! ${questions.length} savoldan ${score} tasiga to‘g‘ri javob berdingiz.`;
    optionsElement.replaceChildren();
    document.getElementById('question-number').textContent = 'Yakunlandi';
    document.getElementById('quiz-progress').style.width = '100%';
    feedback.textContent = score === questions.length ? 'Barcha javoblar to‘g‘ri — barakalla!' : 'Yangi narsalar o‘rgandingiz. Yana bir bor urinib ko‘ring!';
    nextButton.hidden = true;
    document.getElementById('restart-quiz').hidden = false;
    const best = Math.max(loadBest(), score);
    saveBest(best);
    document.getElementById('best-score').textContent = String(best);
  }

  function chooseAnswer(index) {
    if (answered) return;
    answered = true;
    const question = questions[current];
    const correct = index === question.answer;
    if (correct) score += 1;
    optionsElement.querySelectorAll('.answer-option').forEach((button, optionIndex) => {
      button.disabled = true;
      button.setAttribute('aria-pressed', String(optionIndex === index));
      if (optionIndex === question.answer) button.classList.add('correct');
      else if (optionIndex === index) button.classList.add('incorrect');
    });
    feedback.textContent = `${correct ? 'To‘g‘ri! ' : 'Yaxshi urinish. '}${question.note}`;
    feedback.dataset.result = correct ? 'correct' : 'wrong';
    nextButton.disabled = false;
    nextButton.textContent = current === questions.length - 1 ? 'Natijani ko‘rish' : 'Keyingi savol →';
  }

  nextButton.addEventListener('click', () => {
    if (!answered) return;
    current += 1;
    if (current >= questions.length) finishQuiz();
    else renderQuestion();
  });
  document.getElementById('restart-quiz').addEventListener('click', () => {
    startQuiz();
  });

  document.getElementById('quiz-difficulty').addEventListener('change', event => startQuiz(event.target.value));
  document.getElementById('best-score').textContent = String(loadBest());
  startQuiz();
  window.addEventListener('islamic-account-changed', async event => {
    const account = window.islamicSiteAccount;
    if (!event.detail?.user || !account) return;
    try {
      const cloud = await account.load('kids');
      const remoteScores = cloud?.data?.bestScores || {};
      Object.keys(questionSets).forEach(level => {
        const remoteBest = Number(remoteScores[level]);
        if (Number.isInteger(remoteBest) && remoteBest >= 0) {
          const currentBest = loadBest(level);
          if (remoteBest > currentBest) {
            const previousDifficulty = difficulty;
            difficulty = level;
            saveBest(remoteBest);
            difficulty = previousDifficulty;
          }
        }
      });
      if (window.islamicSiteAccount?.user) {
        window.dispatchEvent(new CustomEvent('islamic-account-changed', { detail: { user: window.islamicSiteAccount.user } }));
      }
      document.getElementById('best-score').textContent = String(loadBest());
      syncKidsAccount();
    } catch (error) {
      console.error('Could not restore children quiz account progress:', error);
      feedback.textContent = 'Akkauntdagi test natijalarini yuklab bo‘lmadi.';
    }
  });
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./kids-sw.js').catch(error => console.error('Could not register offline kids lessons:', error));
  }
})();
