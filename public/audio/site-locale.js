(() => {
  const languages = [
    { code: 'uz', label: 'O‘zbekcha' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'ar', label: 'العربية' }
  ];
  const common = {
    'Asosiy sayt ↗': ['Main site ↗', 'Главный сайт ↗', 'الموقع الرئيسي ↗'],
    'Islamic Official': ['Islamic Official', 'Islamic Official', 'Islamic Official'],
    'Qur’on o‘qish ↗': ['Read Qur’an ↗', 'Читать Коран ↗', 'قراءة القرآن ↗'],
    'Qur’onni o‘qish ↗': ['Read Qur’an ↗', 'Читать Коран ↗', 'قراءة القرآن ↗'],
    'Tilni tanlang': ['Choose language', 'Выберите язык', 'اختر اللغة'],
    'Qur’on o‘qish': ['Read Qur’an', 'Читать Коран', 'قراءة القرآن'],
    'Tungi rejimni yoqish': ['Enable dark mode', 'Включить тёмную тему', 'تفعيل الوضع الداكن'],
    'Tungi rejim': ['Dark mode', 'Тёмная тема', 'الوضع الداكن'],
    'Yorug‘ rejimni yoqish': ['Enable light mode', 'Включить светлую тему', 'تفعيل الوضع الفاتح'],
    'Qayta boshlash': ['Reset', 'Сбросить', 'إعادة التعيين'],
    'Yopish': ['Close', 'Закрыть', 'إغلاق'],
    'Hisoblash': ['Calculate', 'Рассчитать', 'احسب'],
    'Natija': ['Result', 'Результат', 'النتيجة'],
    'Qidirish': ['Search', 'Поиск', 'بحث'],
    'Sura': ['Surah', 'Сура', 'السورة'],
    'Qori': ['Reciter', 'Чтец', 'القارئ'],
    'Audio kutubxonasi ↗': ['Audio library ↗', 'Аудиотека ↗', 'مكتبة الصوتيات ↗'],
    'Google bilan kirish': ['Sign in with Google', 'Войти через Google', 'تسجيل الدخول عبر Google'],
    'Google hisobidan chiqish': ['Sign out', 'Выйти', 'تسجيل الخروج'],
    'Akkaunt ulanmoqda…': ['Connecting account…', 'Подключение аккаунта…', 'جارٍ ربط الحساب…'],
    'Kirish amalga oshmadi. Firebase ruxsatlari va internetni tekshiring.': ['Sign-in failed. Check Firebase authorization and your connection.', 'Не удалось войти. Проверьте разрешения Firebase и подключение.', 'تعذر تسجيل الدخول. تحقق من إعدادات Firebase والاتصال.'],
    'Akkaunt holatini tekshirib bo‘lmadi.': ['Could not check account status.', 'Не удалось проверить статус аккаунта.', 'تعذر التحقق من حالة الحساب.'],
    'Google hisobi hozircha mavjud emas.': ['Google sign-in is currently unavailable.', 'Вход через Google сейчас недоступен.', 'تسجيل الدخول عبر Google غير متاح حالياً.']
  };
  const translations = {
    audio: {
      'Qorilar': ['Reciters', 'Чтецы', 'القراء'],
      'Pleyer': ['Player', 'Плеер', 'المشغل'],
      'QUR’ON AUDIO': ['QUR’AN AUDIO', 'АУДИО КОРАНА', 'صوتيات القرآن'],
      'QUR’ON QIROATLARI': ['QUR’AN RECITATIONS', 'ЧТЕНИЕ КОРАНА', 'تلاوات القرآن'],
      'Qiroatni tinglang.': ['Listen to recitation.', 'Слушайте чтение.', 'استمع إلى التلاوة.'],
      'Qalbingizga taskin.': ['Find calm for your heart.', 'Покой для сердца.', 'طمأنينة لقلبك.'],
      'Mashhur qorilar ijrosidagi suralarni toping, tinglang va internet bo‘lmaganda eshitish uchun qurilmangizda saqlang.': ['Find and listen to recitations by renowned reciters, and save them on your device for offline listening.', 'Слушайте чтения известных чтецов и сохраняйте их на устройстве для прослушивания офлайн.', 'استمع إلى تلاوات مشاهير القراء واحفظها على جهازك للاستماع دون اتصال.'],
      'Qorilarni ko‘rish': ['Browse reciters', 'Смотреть чтецов', 'تصفح القراء'],
      'QIROAT KUTUBXONASI': ['RECITATION LIBRARY', 'БИБЛИОТЕКА ЧТЕНИЙ', 'مكتبة التلاوات'],
      'O‘zingizga yoqqan qorini tanlang': ['Choose a reciter', 'Выберите чтеца', 'اختر قارئاً'],
      'Qori nomidan izlash': ['Search reciters', 'Поиск чтеца', 'ابحث عن قارئ'],
      'Mashhur qorilar': ['Popular reciters', 'Популярные чтецы', 'القراء المشهورون'],
      'Yuklanmoqda…': ['Loading…', 'Загрузка…', 'جارٍ التحميل…'],
      'Qiroat manbasi topilmoqda…': ['Finding recitation…', 'Поиск чтения…', 'جارٍ البحث عن التلاوة…'],
      'Qiroat tayyor. Ijroni boshlash uchun tugmani bosing.': ['Recitation ready. Press play to begin.', 'Чтение готово. Нажмите для воспроизведения.', 'التلاوة جاهزة. اضغط للتشغيل.'],
      'Qiroat ijro etilmoqda. Ekran o‘chiqdagi ijro brauzer va qurilmaga bog‘liq.': ['Playing. Background playback depends on your browser and device.', 'Воспроизведение. Фоновый режим зависит от браузера и устройства.', 'قيد التشغيل. يعتمد التشغيل في الخلفية على المتصفح والجهاز.'],
      'Tanlangan sura ushbu qurilmada saqlanadi; serverga yuklanmaydi.': ['The selected surah is saved on this device and is not uploaded.', 'Выбранная сура сохраняется на устройстве и не загружается на сервер.', 'تُحفظ السورة المختارة على هذا الجهاز ولا تُرفع إلى الخادم.'],
      'Tinglash': ['Play', 'Воспроизвести', 'تشغيل'],
      'Oldingi sura': ['Previous surah', 'Предыдущая сура', 'السورة السابقة'],
      'Keyingi sura': ['Next surah', 'Следующая сура', 'السورة التالية'],
      'Oldingi': ['Previous', 'Назад', 'السابق'],
      'Keyingi': ['Next', 'Далее', 'التالي'],
      'Oflayn saqlash': ['Save offline', 'Сохранить офлайн', 'حفظ للاستماع دون اتصال'],
      'Saqlangan audioni o‘chirish': ['Remove saved audio', 'Удалить аудио', 'حذف الصوت المحفوظ'],
      'HOZIR TINGLANMOQDA': ['NOW PLAYING', 'СЕЙЧАС ИГРАЕТ', 'يُشغّل الآن'],
      'Surani tanlang': ['Choose a surah', 'Выберите суру', 'اختر سورة'],
      'Qori tanlang, so‘ng surani ijro eting.': ['Choose a reciter, then play a surah.', 'Выберите чтеца, затем включите суру.', 'اختر قارئاً ثم شغّل السورة.']
    },
    kids: {
      'ISLOMIY KICHKINTOYLAR OLAMI': ['ISLAMIC LEARNING FOR KIDS', 'ИСЛАМСКОЕ ОБУЧЕНИЕ ДЕТЕЙ', 'تعليم إسلامي للأطفال'],
      'Bilimlar o‘yini': ['Learning quiz', 'Викторина', 'مسابقة تعليمية'],
      'Kichik hikoyalar': ['Little stories', 'Короткие истории', 'قصص قصيرة'],
      'O‘RGANAMIZ VA BIRGA O‘SАMIZ': ['LEARN AND GROW TOGETHER', 'УЧИМСЯ И РАСТЁМ ВМЕТО', 'نتعلم وننمو معاً'],
      'Yaxshi odob,': ['Good manners,', 'Хорошие манеры,', 'الأخلاق الحسنة،'],
      'yorug‘ qalb.': ['a bright heart.', 'сердце светлее.', 'وقلب مشرق.'],
      'Bolalar uchun sodda savollar, mehribon hikoyalar va foydali bilimlar. Bu sahifada ism, rasm yoki shaxsiy ma’lumot so‘ralmaydi.': ['Simple questions, kind stories, and useful learning for children. No names, photos, or personal information are requested.', 'Простые вопросы, добрые истории и полезные знания для детей. Мы не запрашиваем имена, фото или личные данные.', 'أسئلة بسيطة وقصص لطيفة ومعارف مفيدة للأطفال. لا نطلب أسماء أو صوراً أو معلومات شخصية.'],
      'O‘yinni boshlash': ['Start the quiz', 'Начать викторину', 'ابدأ المسابقة'],
      'Assalomu alaykum, bilimdon!': ['Hello, curious learner!', 'Привет, юный знаток!', 'مرحباً أيها المتعلم!'],
      'Har bir saval — yangi narsa o‘rganish uchun imkon.': ['Every question is a chance to learn something new.', 'Каждый вопрос — возможность узнать новое.', 'كل سؤال فرصة لتعلم شيء جديد.'],
      'BILIMLAR O‘YINI': ['LEARNING QUIZ', 'ВИКТОРИНА', 'مسابقة المعرفة'],
      'Keling, bilimingizni sinaymiz': ['Let’s test what you know', 'Проверим ваши знания', 'هيا نختبر معلوماتك'],
      'To‘g‘ri javobni tanlang. Adashsangiz ham mayli — birgalikda o‘rganamiz.': ['Choose the correct answer. It’s okay to make mistakes—we learn together.', 'Выберите правильный ответ. Ошибаться можно — мы учимся вместе.', 'اختر الإجابة الصحيحة. لا بأس بالخطأ، فنحن نتعلم معاً.'],
      'Javobni tanlang': ['Choose an answer', 'Выберите ответ', 'اختر إجابة'],
      'Keyingi savol →': ['Next question →', 'Следующий вопрос →', 'السؤال التالي ←'],
      'Natijani ko‘rish': ['See your score', 'Посмотреть результат', 'اعرض النتيجة'],
      'Yana o‘ynash ↻': ['Play again ↻', 'Играть снова ↻', 'العب مجدداً ↻'],
      'ODОB VA GO‘ZAL XULQ': ['KINDNESS AND GOOD MANNERS', 'ДОБРОТА И ХОРОШИЕ МАНЕРЫ', 'الأخلاق الحسنة واللطف'],
      'Yaxshi odatlar haqida': ['About good habits', 'О хороших привычках', 'عن العادات الحسنة'],
      'Har kuni hayotda qo‘llash mumkin bo‘lgan kichik eslatmalar.': ['Small reminders to practice every day.', 'Небольшие напоминания на каждый день.', 'تذكيرات بسيطة للعمل بها كل يوم.'],
      'Yaxshi so‘z urug‘i': ['Planting kind words', 'Семена добрых слов', 'ازرع كلمة طيبة'],
      'Har kuni oz-ozdan': ['A little every day', 'Понемногу каждый день', 'قليلاً كل يوم'],
      'Yaxshilik ulashamiz': ['Share kindness', 'Делимся добром', 'نتشارك الخير'],
      'Ota-onalar uchun:': ['For parents:', 'Для родителей:', 'للآباء والأمهات:'],
      'Mehr bilan o‘rganamiz.': ['Learning with kindness.', 'Учимся с добротой.', 'نتعلم بلطف.'],
      'Qur’on o‘qish ↗': ['Read Qur’an ↗', 'Читать Коран ↗', 'قراءة القرآن ↗'],
      'Qur’oni Karim nechta suradan iborat?': ['How many surahs are in the Qur’an?', 'Сколько сур в Коране?', 'كم سورة في القرآن الكريم؟'],
      'Qaysi sura Qur’onning boshida keladi?': ['Which surah comes first in the Qur’an?', 'Какая сура стоит первой в Коране?', 'ما السورة الأولى في القرآن؟'],
      'Musulmonlar qaysi oyda ro‘za tutadilar?': ['In which month do Muslims fast?', 'В каком месяце мусульмане постятся?', 'في أي شهر يصوم المسلمون؟'],
      'Salomlashganda qanday chiroyli so‘z aytamiz?': ['What greeting do we say?', 'Какое приветствие мы произносим?', 'ماذا نقول عند التحية؟'],
      'Yaxshi ishni boshlashda nima deymiz?': ['What do we say before starting a good deed?', 'Что мы говорим, начиная доброе дело?', 'ماذا نقول عند بدء عمل صالح؟'],
      'Ka’ba qaysi shaharda joylashgan?': ['In which city is the Kaaba?', 'В каком городе находится Кааба?', 'في أي مدينة تقع الكعبة؟'],
      'Ota-onamizga qanday munosabatda bo‘lish chiroyli?': ['How should we treat our parents?', 'Как следует относиться к родителям?', 'كيف ينبغي أن نعامل والدينا؟'],
      'Payg‘ambarimiz Muhammad (s.a.v.)ga qaysi kitob nozil qilingan?': ['Which book was revealed to Prophet Muhammad (peace be upon him)?', 'Какое Писание было ниспослано пророку Мухаммаду ﷺ?', 'ما الكتاب الذي أُنزل على نبينا محمد ﷺ؟'],
      'Do‘stimizga yordam bersak, bu qanday ish bo‘ladi?': ['What is it when we help a friend?', 'Как называется помощь другу?', 'ماذا يسمى مساعدة صديق؟'],
      'Biror narsa uchun minnatdor bo‘lsak, nima deymiz?': ['What do we say when we are grateful?', 'Что мы говорим, когда благодарны?', 'ماذا نقول عندما نشكر؟'],
      '30 ta': ['30', '30', '٣٠'],
      '114 ta': ['114', '114', '١١٤'],
      '99 ta': ['99', '99', '٩٩'],
      'Al-Fotiha': ['Al-Fatihah', 'Аль-Фатиха', 'الفاتحة'],
      'Al-Ikhlos': ['Al-Ikhlas', 'Аль-Ихляс', 'الإخلاص'],
      'An-Nas': ['An-Nas', 'Ан-Нас', 'الناس'],
      'Ramazon oyida': ['In Ramadan', 'В Рамадан', 'في رمضان'],
      'Shavvol oyida': ['In Shawwal', 'В Шавваль', 'في شوال'],
      'Safar oyida': ['In Safar', 'В Сафар', 'في صفر'],
      'Assalomu alaykum': ['As-salamu alaykum', 'Ассаляму алейкум', 'السلام عليكم'],
      'Xayrli tong': ['Good morning', 'Доброе утро', 'صباح الخير'],
      'Marhamat': ['Please / You’re welcome', 'Пожалуйста', 'تفضل'],
      'Bismillah': ['Bismillah', 'Бисмиллях', 'بسم الله'],
      'Alvido': ['Goodbye', 'До свидания', 'وداعاً'],
      'Madinada': ['In Madinah', 'В Медине', 'في المدينة'],
      'Makkada': ['In Makkah', 'В Мекке', 'في مكة'],
      'Quddusda': ['In Jerusalem', 'В Иерусалиме', 'في القدس'],
      'Mehribon va hurmatli': ['Kind and respectful', 'Добрыми и уважительными', 'بلطف واحترام'],
      'E’tiborsiz': ['Careless', 'Безразличными', 'بلا اهتمام'],
      'Qo‘pol': ['Rude', 'Грубыми', 'بفظاظة'],
      'Tavrot': ['Torah', 'Таурат', 'التوراة'],
      'Zabur': ['Psalms', 'Забур', 'الزبور'],
      'Qur’on': ['Qur’an', 'Коран', 'القرآن'],
      'Yaxshi amal': ['A good deed', 'Доброе дело', 'عمل صالح'],
      'Bekorchi ish': ['A pointless act', 'Пустое занятие', 'عمل بلا فائدة'],
      'Yomon odat': ['A bad habit', 'Плохая привычка', 'عادة سيئة'],
      'Kechirasiz': ['Excuse me', 'Извините', 'عذراً'],
      'Rahmat': ['Thank you', 'Спасибо', 'شكراً'],
      'Xayr': ['Goodbye', 'Пока', 'مع السلامة'],
      'Yakunlandi': ['Complete', 'Завершено', 'اكتملت'],
      'Yengil': ['Easy', 'Лёгкий', 'سهل'],
      'O‘rta': ['Intermediate', 'Средний', 'متوسط'],
      'Qiyin': ['Hard', 'Сложный', 'صعب'],
      'Daraja': ['Difficulty', 'Уровень', 'المستوى'],
      'Yengil, o‘rta yoki qiyin darajani tanlang. Har safar savollar aralashtirib beriladi.': ['Choose easy, intermediate, or hard. Questions are shuffled each time.', 'Выберите лёгкий, средний или сложный уровень. Вопросы перемешиваются при каждом запуске.', 'اختر المستوى السهل أو المتوسط أو الصعب. يتم خلط الأسئلة في كل مرة.'],
      'Qur’onning birinchi surasi qaysi?': ['Which is the first surah of the Qur’an?', 'Какая сура первая в Коране?', 'ما أول سورة في القرآن؟'],
      'Qur’onning oxirgi surasi qaysi?': ['Which is the last surah of the Qur’an?', 'Какая сура последняя в Коране?', 'ما آخر سورة في القرآن؟'],
      'Ramazon oyidan oldin qaysi hijriy oy keladi?': ['Which Hijri month comes before Ramadan?', 'Какой месяц хиджры предшествует Рамадану?', 'أي شهر هجري يأتي قبل رمضان؟'],
      'Sha’bon': ['Sha’ban', 'Шаабан', 'شعبان'],
      'Shavvol': ['Shawwal', 'Шавваль', 'شوال'],
      'Zulqa’da': ['Dhul Qa’dah', 'Зуль-каада', 'ذو القعدة'],
      'Dovud (a.s.)ga qaysi kitob berilgan?': ['Which scripture was given to Prophet Dawud?', 'Какое Писание было дано пророку Дауду?', 'أي كتاب أُنزل على النبي داود؟'],
      'Muso (a.s.)ga qaysi kitob berilgan?': ['Which scripture was given to Prophet Musa?', 'Какое Писание было дано пророку Мусе?', 'أي كتاب أُنزل على النبي موسى؟'],
      'Iso (a.s.)ga qaysi kitob berilgan?': ['Which scripture was given to Prophet Isa?', 'Какое Писание было дано пророку Исе?', 'أي كتاب أُنزل على النبي عيسى؟'],
      'Islomiy ta’limotda Zabur Dovud (a.s.)ga berilgan.': ['In Islamic teaching, the Zabur was given to Prophet Dawud.', 'Согласно исламскому учению, Забур был дан пророку Дауду.', 'في التعليم الإسلامي أُنزل الزبور على النبي داود.'],
      'Islomiy ta’limotda Tavrot Muso (a.s.)ga berilgan.': ['In Islamic teaching, the Torah was given to Prophet Musa.', 'Согласно исламскому учению, Таурат был дан пророку Мусе.', 'في التعليم الإسلامي أُنزلت التوراة على النبي موسى.'],
      'Islomiy ta’limotda Injil Iso (a.s.)ga berilgan.': ['In Islamic teaching, the Injil was given to Prophet Isa.', 'Согласно исламскому учению, Инджиль был дан пророку Исе.', 'في التعليم الإسلامي أُنزل الإنجيل على النبي عيسى.'],
      'Hajning asosiy amallaridan biri Arafotda qaysi kuni ado etiladi?': ['On which day is standing at Arafat performed during Hajj?', 'В какой день совершается стояние на Арафате во время хаджа?', 'في أي يوم يكون الوقوف بعرفة في الحج؟'],
      'Zulhijjaning 9-kuni': ['The 9th of Dhul Hijjah', '9-й день Зуль-хиджа', 'اليوم التاسع من ذي الحجة'],
      'Ramazonning 1-kuni': ['The 1st of Ramadan', '1-й день Рамадана', 'اليوم الأول من رمضان'],
      'Muharramning 10-kuni': ['The 10th of Muharram', '10-й день Мухаррама', 'اليوم العاشر من محرم'],
      'Hajdagi Arafot kuni Zulhijjaning 9-kunidir.': ['The Day of Arafat during Hajj is the 9th of Dhul Hijjah.', 'День Арафа во время хаджа — 9-е Зуль-хиджа.', 'يوم عرفة في الحج هو التاسع من ذي الحجة.'],
      'Ro‘za tutgan kishi quyosh botgach qaysi paytda og‘iz ochadi?': ['When does a fasting person break the fast after sunset?', 'Когда постящийся разговляется после захода солнца?', 'متى يفطر الصائم بعد غروب الشمس؟'],
      'Shom vaqti': ['Maghrib time', 'Время магриба', 'وقت المغرب'],
      'Bomdod vaqti': ['Fajr time', 'Время фаджра', 'وقت الفجر'],
      'Peshin vaqti': ['Dhuhr time', 'Время зухра', 'وقت الظهر'],
      'Quyosh botib, shom vaqti kirgach iftor qilinadi.': ['The fast is broken after sunset when Maghrib begins.', 'Пост разговляются после захода солнца с наступлением магриба.', 'يكون الإفطار بعد غروب الشمس ودخول وقت المغرب.'],
      'Madinaga hijratdan keyin qurilgan ilk masjid qaysi?': ['Which mosque was built first after the migration to Madinah?', 'Какая мечеть была первой построена после переселения в Медину?', 'ما أول مسجد بُني بعد الهجرة إلى المدينة؟'],
      'Qubo masjidi': ['Quba Mosque', 'Мечеть Куба', 'مسجد قباء'],
      'Masjidul Harom': ['Al-Masjid al-Haram', 'Заповедная мечеть', 'المسجد الحرام'],
      'Masjidul Aqso': ['Al-Aqsa Mosque', 'Мечеть Аль-Акса', 'المسجد الأقصى'],
      'Qubo masjidi Payg‘ambarimiz (s.a.v.) Madinaga hijrat qilganlarida qurilgan.': ['Quba Mosque was built when the Prophet migrated to Madinah.', 'Мечеть Куба была построена во время переселения Пророка в Медину.', 'بُني مسجد قباء عند هجرة النبي إلى المدينة.'],
      'Islomning asosiy ruknlari nechta?': ['How many pillars of Islam are there?', 'Сколько столпов ислама?', 'كم عدد أركان الإسلام؟'],
      'Besh': ['Five', 'Пять', 'خمسة'],
      'Uch': ['Three', 'Три', 'ثلاثة'],
      'Yetti': ['Seven', 'Семь', 'سبعة'],
      'Islomning besh rukni bor.': ['Islam has five pillars.', 'У ислама пять столпов.', 'للإسلام خمسة أركان.'],
      'Qur’onda boshida “Bismillahir rohmanir rohiym” kelmaydigan sura qaysi?': ['Which surah does not begin with “In the name of Allah, the Most Compassionate, the Most Merciful”?', 'Какая сура не начинается со слов «Во имя Аллаха, Милостивого, Милосердного»?', 'أي سورة لا تبدأ بـ«بسم الله الرحمن الرحيم»؟'],
      'At-Tavba': ['At-Tawbah', 'Ат-Тауба', 'التوبة'],
      'An-Naml': ['An-Naml', 'Ан-Намль', 'النمل'],
      'At-Tavba surasi boshida basmala yozilmagan.': ['At-Tawbah does not have the basmala at its beginning.', 'В начале суры Ат-Тауба нет басмалы.', 'لا توجد البسملة في بداية سورة التوبة.'],
      'Qaysi surada basmala sura boshidan tashqari oyat ichida ham keladi?': ['In which surah does the basmala also appear within a verse?', 'В какой суре басмала встречается также внутри аята?', 'في أي سورة ترد البسملة أيضاً داخل آية؟'],
      'An-Naml surasining 30-oyatida basmala bor.': ['The basmala appears in verse 30 of An-Naml.', 'Басмала встречается в 30-м аяте суры Ан-Намль.', 'ترد البسملة في الآية 30 من سورة النمل.'],
      'Qur’ondagi eng uzun oyat qaysi surada?': ['In which surah is the Qur’an’s longest verse?', 'В какой суре находится самый длинный аят Корана?', 'في أي سورة توجد أطول آية في القرآن؟'],
      'Eng uzun oyat Baqara surasining 282-oyatidir.': ['The longest verse is Al-Baqarah 2:282.', 'Самый длинный аят — 2:282 суры Аль-Бакара.', 'أطول آية هي البقرة 2:282.'],
      'Laylatul Qadr qaysi surada nomi bilan zikr qilingan?': ['In which surah is Laylat al-Qadr named?', 'В какой суре упоминается Ночь предопределения?', 'في أي سورة ذُكرت ليلة القدر باسمها؟'],
      'Laylatul Qadr Al-Qadr surasida zikr qilinadi.': ['Laylat al-Qadr is mentioned in Surah Al-Qadr.', 'Ночь предопределения упоминается в суре Аль-Кадр.', 'ذُكرت ليلة القدر في سورة القدر.'],
      'Ibrohim (a.s.) Ka’baning poydevorini kim bilan ko‘targan?': ['With whom did Prophet Ibrahim raise the foundations of the Kaaba?', 'С кем пророк Ибрахим воздвиг основание Каабы?', 'مع من رفع النبي إبراهيم قواعد الكعبة؟'],
      'Ismoil (a.s.)': ['Prophet Ismail', 'Пророк Исмаил', 'النبي إسماعيل'],
      'Yunus (a.s.)': ['Prophet Yunus', 'Пророк Юнус', 'النبي يونس'],
      'Qur’onda Ibrohim va Ismoil (a.s.) Ka’baning poydevorini ko‘targanlari aytiladi.': ['The Qur’an says Ibrahim and Ismail raised the foundations of the Kaaba.', 'В Коране сказано, что Ибрахим и Исмаил воздвигли основание Каабы.', 'يذكر القرآن أن إبراهيم وإسماعيل رفعا قواعد الكعبة.'],
      '“Qul huvallohu ahad” qaysi suraning boshlanishidir?': ['Which surah begins with “Say: He is Allah, One”?', 'Какая сура начинается словами «Скажи: Он — Аллах Единый»?', 'أي سورة تبدأ بـ«قل هو الله أحد»؟'],
      'Bu Al-Ikhlos surasining boshlanishidir.': ['These are the opening words of Surah Al-Ikhlas.', 'Это начало суры Аль-Ихляс.', 'هذه بداية سورة الإخلاص.'],
      'Qur’onning 2-surasining nomi nima?': ['What is the name of the Qur’an’s second surah?', 'Как называется вторая сура Корана?', 'ما اسم السورة الثانية في القرآن؟'],
      'Oli Imron': ['Aal Imran', 'Аль Имран', 'آل عمران'],
      'An-Niso': ['An-Nisa', 'Ан-Ниса', 'النساء'],
      'Mushaf tartibidagi ikkinchi sura — Al-Baqara.': ['Al-Baqarah is the second surah in the mushaf order.', 'Аль-Бакара — вторая сура в порядке мусхафа.', 'البقرة هي السورة الثانية في ترتيب المصحف.'],
      'Qur’onda “As’hobul fil” voqeasi qaysi surada bayon qilingan?': ['Which surah tells the story of the People of the Elephant?', 'В какой суре рассказана история людей слона?', 'في أي سورة وردت قصة أصحاب الفيل؟'],
      'Al-Ma’un': ['Al-Ma’un', 'Аль-Маун', 'الماعون'],
      'Al-Humaza': ['Al-Humazah', 'Аль-Хумаза', 'الهمزة'],
      'Bu voqea Al-Fil surasida eslatiladi.': ['This event is mentioned in Surah Al-Fil.', 'Это событие упоминается в суре Аль-Филь.', 'ذُكرت هذه الحادثة في سورة الفيل.'],
      'Qur’onda “ikki dengiz orasidagi to‘siq” haqida qaysi surada so‘z boradi?': ['Which surah mentions the barrier between two seas?', 'В какой суре говорится о преграде между двумя морями?', 'في أي سورة ذُكر الحاجز بين البحرين؟'],
      'Ar-Rahmon': ['Ar-Rahman', 'Ар-Рахман', 'الرحمن'],
      'Ar-Rahmon surasida ikki dengiz va ular orasidagi to‘siq haqida aytiladi.': ['Surah Ar-Rahman mentions two seas and a barrier between them.', 'В суре Ар-Рахман говорится о двух морях и преграде между ними.', 'تذكر سورة الرحمن بحرين وحاجزاً بينهما.'],
      'Qur’onda chumoli haqidagi voqea qaysi payg‘ambar qissasida keladi?': ['In which prophet’s story does the Qur’an mention the ant?', 'В рассказе о каком пророке Коран упоминает муравья?', 'في قصة أي نبي ذكر القرآن النملة؟'],
      'Sulaymon (a.s.)': ['Prophet Sulayman', 'Пророк Сулейман', 'النبي سليمان'],
      'Yusuf (a.s.)': ['Prophet Yusuf', 'Пророк Юсуф', 'النبي يوسف'],
      'Ayyub (a.s.)': ['Prophet Ayyub', 'Пророк Айюб', 'النبي أيوب'],
      'Chumoli voqeasi Sulaymon (a.s.) qissasida, An-Naml surasida keladi.': ['The ant is mentioned in the story of Sulayman in Surah An-Naml.', 'Муравей упоминается в истории Сулеймана в суре Ан-Намль.', 'ذُكرت النملة في قصة سليمان في سورة النمل.'],
      'Payg‘ambarimiz Muhammad (s.a.v.)ga birinchi vahiy kelgan g‘or qaysi?': ['In which cave did Prophet Muhammad first receive revelation?', 'В какой пещере пророк Мухаммад получил первое откровение?', 'في أي غار نزل أول وحي على النبي محمد؟'],
      '“Al-Fotiha” nomi qanday ma’noni bildiradi?': ['What does the name “Al-Fatiha” mean?', 'Что означает название «Аль-Фатиха»?', 'ما معنى اسم «الفاتحة»؟'],
      'Ochuvchi': ['The opener', 'Открывающая', 'الفاتحة'],
      'Yordam': ['Help', 'Помощь', 'المساعدة'],
      'Tong': ['Dawn', 'Рассвет', 'الفجر'],
      'Al-Fotiha so‘zi “ochuvchi” ma’nosini bildiradi.': ['Al-Fatiha means “the opener”.', 'Аль-Фатиха означает «открывающая».', 'الفاتحة تعني «الفاتحة».'],
      'Qurbon hayiti hijriy taqvimning qaysi oyida bo‘ladi?': ['In which Hijri month is Eid al-Adha?', 'В каком месяце хиджры отмечают Ид аль-Адха?', 'في أي شهر هجري يأتي عيد الأضحى؟'],
      'Qurbon hayiti Zulhijja oyida bo‘ladi.': ['Eid al-Adha takes place in Dhul Hijjah.', 'Ид аль-Адха приходится на месяц Зуль-хиджа.', 'يكون عيد الأضحى في شهر ذي الحجة.'],
      'Qur’onda payg‘ambar Yusuf (a.s.) qissasi batafsil qaysi surada keladi?': ['In which surah is the story of Prophet Yusuf told in detail?', 'В какой суре подробно рассказана история пророка Юсуфа?', 'في أي سورة وردت قصة النبي يوسف بالتفصيل؟'],
      'Yusuf (a.s.) qissasi Yusuf surasida bayon qilingan.': ['The story of Prophet Yusuf is told in Surah Yusuf.', 'История пророка Юсуфа рассказана в суре Юсуф.', 'وردت قصة النبي يوسف في سورة يوسف.'],
      'Qur’onda 30-juz qaysi sura bilan tugaydi?': ['Which surah ends the 30th juz of the Qur’an?', 'Какая сура завершает 30-й джуз Корана?', 'بأي سورة ينتهي الجزء الثلاثون من القرآن؟'],
      'Qur’onning oxirgi surasi An-Nas bo‘lib, 30-juz shu sura bilan tugaydi.': ['An-Nas is the last surah of the Qur’an and ends the 30th juz.', 'Ан-Нас — последняя сура Корана и завершает 30-й джуз.', 'الناس آخر سورة في القرآن وبها ينتهي الجزء الثلاثون.'],
      'Qur’ondagi eng uzun sura qaysi?': ['Which is the longest surah in the Qur’an?', 'Какая сура самая длинная в Коране?', 'ما أطول سورة في القرآن؟'],
      'Qur’ondagi eng qisqa sura qaysi?': ['Which is the shortest surah in the Qur’an?', 'Какая сура самая короткая в Коране?', 'ما أقصر سورة في القرآن؟'],
      'Oyatul Kursiy qaysi surada keladi?': ['In which surah is Ayat al-Kursi?', 'В какой суре находится аят аль-Курси?', 'في أي سورة توجد آية الكرسي؟'],
      'Vahiy olib kelgan farishta kim?': ['Which angel brought revelation?', 'Какой ангел приносил откровение?', 'أي ملك نزل بالوحي؟'],
      'Hijratda Makka shahridan qaysi shaharga ko‘chilgan?': ['To which city did Muslims migrate from Mecca?', 'В какой город переселились из Мекки?', 'إلى أي مدينة هاجر المسلمون من مكة؟'],
      'Birinchi vahiy qaysi g‘orda nozil bo‘lgan?': ['In which cave did the first revelation come?', 'В какой пещере было ниспослано первое откровение?', 'في أي غار نزل الوحي أول مرة؟'],
      'Qur’on necha juzga bo‘lingan?': ['Into how many juz is the Qur’an divided?', 'На сколько джузов разделён Коран?', 'إلى كم جزءاً قُسّم القرآن؟'],
      'Ramazon tugagach qaysi hayit nishonlanadi?': ['Which Eid follows Ramadan?', 'Какой праздник следует после Рамадана?', 'أي عيد يأتي بعد رمضان؟'],
      'Qurbon hayiti qaysi hijriy oyda bo‘ladi?': ['In which Hijri month is Eid al-Adha?', 'В каком месяце хиджры отмечают Ид аль-Адха?', 'في أي شهر هجري يأتي عيد الأضحى؟'],
      'Fil voqeasi qaysi surada eslatiladi?': ['Which surah mentions the People of the Elephant?', 'В какой суре упоминаются люди слона?', 'أي سورة تذكر أصحاب الفيل؟'],
      'Bir kunda nechta farz namoz bor?': ['How many obligatory prayers are there each day?', 'Сколько обязательных молитв в день?', 'كم صلاة مفروضة في اليوم؟'],
      'Namozda musulmonlar qaysi tomonga yuzlanadilar?': ['Which direction do Muslims face in prayer?', 'В какую сторону обращаются мусульмане в молитве?', 'إلى أي جهة يتوجه المسلمون في الصلاة؟'],
      'Qaysi so‘z Allohni barcha nuqsonlardan pok deb ulug‘laydi?': ['Which phrase glorifies Allah as free from imperfection?', 'Какая фраза прославляет Аллаха как свободного от недостатков?', 'أي عبارة تنزّه الله عن كل نقص؟'],
      'Musulmonlar namozdan oldin odatda nima qiladilar?': ['What do Muslims usually do before prayer?', 'Что обычно делают мусульмане перед молитвой?', 'ماذا يفعل المسلمون عادة قبل الصلاة؟'],
      'Qaysi oyat-kitab musulmonlar uchun muqaddas kitob?': ['Which is the holy book of Muslims?', 'Какая священная книга у мусульман?', 'ما الكتاب المقدس عند المسلمين؟'],
      'Yaxshi gaplashish va rost so‘zlash qanday odat?': ['What kind of habits are kind and truthful speech?', 'Как называются добрые слова и правдивость?', 'ما صفة الكلام الطيب والصدق؟'],
      'Ka’bani ko‘rish uchun musulmonlar qaysi shaharga boradilar?': ['To which city do Muslims travel to visit the Kaaba?', 'В какой город едут мусульмане, чтобы увидеть Каабу?', 'إلى أي مدينة يسافر المسلمون لزيارة الكعبة؟'],
      'Qur’on suralari nimaga bo‘lingan?': ['What are Qur’anic surahs made up of?', 'Из чего состоят суры Корана?', 'مم تتكون سور القرآن؟'],
      'Birov xato qilsa, unga qanday munosabat yaxshi?': ['How should we respond when someone makes a mistake?', 'Как лучше отнестись к ошибке другого?', 'كيف نحسن التصرف إذا أخطأ أحد؟'],
      'Ramazon oyida musulmonlar qaysi ibodatni ado etadilar?': ['Which act of worship do Muslims observe in Ramadan?', 'Какое поклонение совершают мусульмане в Рамадан?', 'أي عبادة يؤديها المسلمون في رمضان؟'],
      'Al-Baqara': ['Al-Baqarah', 'Аль-Бакара', 'البقرة'],
      'Al-Kavsar': ['Al-Kawthar', 'Аль-Каусар', 'الكوثر'],
      'Al-Fil': ['Al-Fil', 'Аль-Филь', 'الفيل'],
      'Maryam': ['Maryam', 'Марьям', 'مريم'],
      'Jabroil': ['Jibril', 'Джибриль', 'جبريل'],
      'Mikoil': ['Mikail', 'Микаиль', 'ميكائيل'],
      'Isrofil': ['Israfil', 'Исрафиль', 'إسرافيل'],
      'Toifga': ['Ta’if', 'Таиф', 'الطائف'],
      'Madinaga': ['Madinah', 'Медину', 'المدينة'],
      'Quddusga': ['Jerusalem', 'Иерусалим', 'القدس'],
      'Hiro g‘orida': ['Cave Hira', 'Пещере Хира', 'غار حراء'],
      'Savr g‘orida': ['Cave Thawr', 'Пещере Саур', 'غار ثور'],
      'Uhud tog‘ida': ['Mount Uhud', 'Горе Ухуд', 'جبل أُحد'],
      '20 juz': ['20 juz', '20 джузов', '٢٠ جزءاً'],
      '30 juz': ['30 juz', '30 джузов', '٣٠ جزءاً'],
      '40 juz': ['40 juz', '40 джузов', '٤٠ جزءاً'],
      'Ramazon hayiti': ['Eid al-Fitr', 'Ид аль-Фитр', 'عيد الفطر'],
      'Qurbon hayiti': ['Eid al-Adha', 'Ид аль-Адха', 'عيد الأضحى'],
      'Zulhijja': ['Dhul Hijjah', 'Зуль-хиджа', 'ذو الحجة'],
      'Muharram': ['Muharram', 'Мухаррам', 'محرم'],
      'Al-Masad': ['Al-Masad', 'Аль-Масад', 'المسد'],
      'Al-Qadr': ['Al-Qadr', 'Аль-Кадр', 'القدر'],
      '5 ta': ['5', '5', '٥'],
      '3 ta': ['3', '3', '٣'],
      '7 ta': ['7', '7', '٧'],
      'Ka’ba tomonga': ['Toward the Kaaba', 'В сторону Каабы', 'نحو الكعبة'],
      'Quyosh tomonga': ['Toward the sun', 'В сторону солнца', 'نحو الشمس'],
      'Tog‘ tomonga': ['Toward a mountain', 'В сторону горы', 'نحو الجبل'],
      'Subhanalloh': ['SubhanAllah', 'Субханаллах', 'سبحان الله'],
      'Tahorat oladilar': ['They perform ablution', 'Совершить омовение', 'يتوضؤون'],
      'Ovqat pishiradilar': ['They cook food', 'Готовить еду', 'يطبخون الطعام'],
      'Sayr qiladilar': ['They go for a walk', 'Гулять', 'يتنزهون'],
      'Qur’oni Karim': ['The Noble Qur’an', 'Священный Коран', 'القرآن الكريم'],
      'Ertaklar kitobi': ['A storybook', 'Книга сказок', 'كتاب قصص'],
      'Lug‘at': ['A dictionary', 'Словарь', 'قاموس'],
      'Go‘zal odob': ['Good manners', 'Хорошая привычка', 'خلق حسن'],
      'Yomon odat': ['A bad habit', 'Плохая привычка', 'عادة سيئة'],
      'Bekorchi ish': ['A pointless act', 'Пустое занятие', 'عمل بلا فائدة'],
      'Makkaga': ['Makkah', 'Мекку', 'مكة'],
      'Toshkentga': ['Tashkent', 'Ташкент', 'طشقند'],
      'Qohiraga': ['Cairo', 'Каир', 'القاهرة'],
      'Oyatlar': ['Verses', 'Аяты', 'آيات'],
      'Boblar': ['Chapters', 'Главы', 'فصول'],
      'Sahna ko‘rinishlari': ['Scenes', 'Сцены', 'مشاهد'],
      'Muloyim tushuntirish': ['Explain kindly', 'Объяснить мягко', 'التوضيح بلطف'],
      'Masxara qilish': ['Make fun of them', 'Насмехаться', 'السخرية'],
      'Jahl bilan gapirish': ['Speak angrily', 'Говорить сердито', 'التحدث بغضب'],
      'Birinchi vahiy Hiro g‘orida nozil bo‘lgan.': ['The first revelation came in Cave Hira.', 'Первое откровение было ниспослано в пещере Хира.', 'نزل أول وحي في غار حراء.'],
      'Oyatul Kursiy Baqara surasining 255-oyatidir.': ['Ayat al-Kursi is verse 255 of Al-Baqarah.', 'Аят аль-Курси — 255-й аят суры Аль-Бакара.', 'آية الكرسي هي الآية 255 من سورة البقرة.'],
      'Al-Baqara Qur’ondagi eng uzun suradir.': ['Al-Baqarah is the longest surah in the Qur’an.', 'Аль-Бакара — самая длинная сура Корана.', 'سورة البقرة أطول سورة في القرآن.'],
      'Al-Kavsar surasi oyatlari soni jihatidan eng qisqa suradir.': ['Al-Kawthar is the shortest surah by number of verses.', 'Сура Аль-Каусар — самая короткая по числу аятов.', 'سورة الكوثر أقصر السور من حيث عدد الآيات.'],
      'Jabroil (a.s.) payg‘ambarlarga vahiy olib kelgan.': ['Jibril (peace be upon him) brought revelation to the prophets.', 'Джибриль (мир ему) приносил откровение пророкам.', 'كان جبريل عليه السلام ينزل بالوحي على الأنبياء.'],
      'Payg‘ambar Muhammad (s.a.v.) va sahobalar Madinaga hijrat qilganlar.': ['Prophet Muhammad and his companions migrated to Madinah.', 'Пророк Мухаммад и его сподвижники переселились в Медину.', 'هاجر النبي محمد وأصحابه إلى المدينة.'],
      'Qur’on o‘qishni rejalashda odatda 30 juzga bo‘lib o‘rganiladi.': ['The Qur’an is commonly divided into 30 juz for reading plans.', 'Для планирования чтения Коран обычно делят на 30 джузов.', 'يُقسم القرآن عادة إلى 30 جزءاً لتنظيم القراءة.'],
      'Ramazon oyi yakunida Ramazon hayiti nishonlanadi.': ['Eid al-Fitr is celebrated at the end of Ramadan.', 'В конце Рамадана отмечают Ид аль-Фитр.', 'يحتفل بعيد الفطر في نهاية رمضان.'],
      'Qurbon hayiti Zulhijja oyining 10-kunida bo‘ladi.': ['Eid al-Adha falls on the 10th of Dhul Hijjah.', 'Ид аль-Адха приходится на 10-е Зуль-хиджа.', 'يوافق عيد الأضحى اليوم العاشر من ذي الحجة.'],
      'Al-Fil surasida fil voqeasi haqida eslatiladi.': ['Surah Al-Fil tells of the People of the Elephant.', 'Сура Аль-Филь повествует о людях слона.', 'تذكر سورة الفيل قصة أصحاب الفيل.'],
      'Musulmonlar kuniga besh vaqt farz namoz o‘qiydilar.': ['Muslims perform five obligatory prayers each day.', 'Мусульмане совершают пять обязательных молитв в день.', 'يصلي المسلمون خمس صلوات مفروضة كل يوم.'],
      'Namozda qibla — Makkadagi Ka’ba tomonga yuzlaniladi.': ['The qibla in prayer is toward the Kaaba in Makkah.', 'Во время молитвы обращаются к Каабе в Мекке.', 'القبلة في الصلاة هي الكعبة في مكة.'],
      '“Subhanalloh” Allohni pok deb ulug‘lash iborasidir.': ['“SubhanAllah” glorifies Allah as free from imperfection.', '«Субханаллах» прославляет Аллаха как Пречистого.', '«سبحان الله» تنزيه لله عن كل نقص.'],
      'Namoz uchun tahorat olish poklanish amallaridan biridir.': ['Ablution is a form of purification before prayer.', 'Омовение — один из способов очищения перед молитвой.', 'الوضوء من الطهارة قبل الصلاة.'],
      'Qur’oni Karim musulmonlarning muqaddas kitobidir.': ['The Noble Qur’an is the holy book of Muslims.', 'Священный Коран — книга мусульман.', 'القرآن الكريم كتاب المسلمين المقدس.'],
      'Rostgo‘ylik va muloyim so‘zlash go‘zal odoblardandir.': ['Truthfulness and kind speech are good manners.', 'Правдивость и добрые слова — хорошие качества.', 'الصدق والكلام الطيب من حسن الخلق.'],
      'Ka’ba Makkai Mukarrama shahrida joylashgan.': ['The Kaaba is in the honored city of Makkah.', 'Кааба находится в благословенной Мекке.', 'تقع الكعبة في مكة المكرمة.'],
      'Suralar oyatlardan tashkil topadi.': ['Surahs are made up of verses.', 'Суры состоят из аятов.', 'تتكون السور من آيات.'],
      'Mehr bilan tushuntirish va kechirimli bo‘lish yaxshi odobdir.': ['Kind explanations and forgiveness are good manners.', 'Доброта в объяснениях и прощение — хорошие качества.', 'الشرح بلطف والعفو من حسن الخلق.'],
      'Ramazon oyida ro‘za tutish musulmonlar uchun muhim ibodatdir.': ['Fasting in Ramadan is an important act of worship for Muslims.', 'Пост в Рамадан — важное поклонение для мусульман.', 'صيام رمضان عبادة مهمة للمسلمين.'],
      'Ota-onalar uchun: bu viktorina uchun Google hisobiga kirish faqat natijani sinxronlash uchun; bola profili yoki chat yo‘q.': ['For parents: Google sign-in is only used to sync quiz scores; there is no child profile or chat.', 'Для родителей: вход через Google нужен только для синхронизации результатов; профиля ребёнка и чата нет.', 'للأهل: يُستخدم تسجيل الدخول عبر Google لمزامنة النتائج فقط؛ لا يوجد ملف شخصي للطفل أو محادثة.'],
      'bu o‘yin umumiy ma’rifiy mashqdir, diniy hukm bermaydi. Bolalar uchun mustaqil profil, chat yoki reklama yo‘q. Natijalar shu qurilmada saqlanadi; ota-ona Google hisobiga kirsa, faqat darajalar bo‘yicha eng yaxshi natijalar shaxsiy hisobga sinxronlanadi.': ['This is a general learning activity, not a religious ruling. There is no child profile, chat, or advertising. Scores stay on this device; if a parent signs in with Google, only best scores by difficulty sync to that private account.', 'Это учебная викторина, а не религиозное решение. Нет профиля ребёнка, чата и рекламы. Результаты хранятся на устройстве; при входе родителя через Google синхронизируются только лучшие результаты по уровням.', 'هذا نشاط تعليمي عام وليس حكماً دينياً. لا يوجد ملف للطفل أو محادثة أو إعلانات. تبقى النتائج على الجهاز؛ وعند دخول ولي الأمر عبر Google تتم مزامنة أفضل النتائج حسب المستوى فقط.'],
    },
    zikr: {
      'SMART ZIKR · TAQVIM': ['SMART DHIKR · CALENDAR', 'УМНЫЙ ЗИКР · КАЛЕНДАРЬ', 'ذكر ذكي · التقويم'],
      'Tasbeh': ['Tasbih', 'Тасбих', 'التسبيح'],
      'Zikrlar': ['Dhikr', 'Зикр', 'الأذكار'],
      'Hijriy taqvim': ['Hijri calendar', 'Хиджра календарь', 'التقويم الهجري'],
      'KUNLIK ZIKR VA TAQVIM': ['DAILY DHIKR AND CALENDAR', 'ЕЖЕДНЕВНЫЙ ЗИКР И КАЛЕНДАРЬ', 'الذكر اليومي والتقويم'],
      'Qalbni zikr bilan': ['Bring your heart peace', 'Наполните сердце зикром', 'أرح قلبك بالذكر'],
      'osoyishta qiling.': ['and tranquility.', 'والسكينة.', 'والطمأنينة.'],
      'Zikrlaringizni qulay sanang, foydali iboralarni tanlang va bugungi hijriy sanani ko‘ring. Ma’lumotlar shu qurilmada qoladi.': ['Count dhikr, choose phrases, and see today’s Hijri date. Your data stays on this device.', 'Считайте зикр, выбирайте фразы и смотрите дату хиджры. Данные остаются на устройстве.', 'أحصِ الأذكار واختر العبارات واعرف التاريخ الهجري. تبقى بياناتك على هذا الجهاز.'],
      'Zikrni boshlash': ['Start dhikr', 'Начать зикр', 'ابدأ الذكر'],
      'BUGUNGI SANA': ['TODAY', 'СЕГОДНЯ', 'تاريخ اليوم'],
      'Hijriy sana hisoblash usuliga ko‘ra 1 kungacha farq qilishi mumkin.': ['The Hijri date may vary by one day depending on the calculation method.', 'Дата хиджры может отличаться на один день в зависимости от метода расчёта.', 'قد يختلف التاريخ الهجري يوماً حسب طريقة الحساب.'],
      'SHAXSIY HISOBLAGICH': ['PERSONAL COUNTER', 'ЛИЧНЫЙ СЧЁТЧИК', 'عداد شخصي'],
      'Tasbeh sanagichi': ['Tasbih counter', 'Счётчик тасбиха', 'عداد التسبيح'],
      'Zikrni tanlang': ['Choose dhikr', 'Выберите зикр', 'اختر الذكر'],
      'Alloh barcha nuqsonlardan pokdir.': ['Allah is free from all imperfection.', 'Аллах пречист от всякого несовершенства.', 'سبحان الله عن كل نقص.'],
      'Hamd va shukr Allohgadir.': ['All praise and thanks belong to Allah.', 'Хвала и благодарность Аллаху.', 'الحمد والشكر لله.'],
      'Alloh ulug‘dir.': ['Allah is the Greatest.', 'Аллах Велик.', 'الله أكبر.'],
      'Allohdan mag‘firat so‘rayman.': ['I seek Allah’s forgiveness.', 'Прошу прощения у Аллаха.', 'أستغفر الله.'],
      'Shaxsiy maqsad': ['Personal target', 'Личная цель', 'الهدف الشخصي'],
      'Maqsadsiz sanash': ['No target', 'Без цели', 'بلا هدف'],
      'O‘zim kiritaman': ['Custom', 'Своё значение', 'مخصص'],
      'marta': ['times', 'раз', 'مرة'],
      'SANASH': ['COUNT', 'СЧЁТ', 'عدّ'],
      'Tebranish': ['Vibration', 'Вибрация', 'اهتزاز'],
      'Ovoz': ['Sound', 'Звук', 'صوت'],
      'Har bir bosish qurilmangizda saqlanadi.': ['Each count is saved on your device.', 'Каждый счёт сохраняется на устройстве.', 'يُحفظ كل عدّ على جهازك.'],
      'BUGUNGI FAОLLIGINGIZ': ['YOUR ACTIVITY TODAY', 'ВАША АКТИВНОСТЬ СЕГОДНЯ', 'نشاطك اليوم'],
      'Kichik qadam ham qadrli': ['Every small step matters', 'Каждый маленький шаг важен', 'كل خطوة صغيرة مهمة'],
      'Bugun sanalgan zikrlar': ['Dhikr counted today', 'Зикр сегодня', 'الأذكار اليوم'],
      'Tanlangan zikr': ['Selected dhikr', 'Выбранный зикр', 'الذكر المختار'],
      'MULOYIM ESLATMA': ['GENTLE REMINDER', 'МЯГКОЕ НАПОМИНАНИЕ', 'تذكير لطيف'],
      'O‘zingizga eslatma qo‘ying': ['Set a reminder', 'Установите напоминание', 'اضبط تذكيراً'],
      'Mahalliy vaqt': ['Local time', 'Местное время', 'الوقت المحلي'],
      'Eslatmani yoqish': ['Enable reminder', 'Включить напоминание', 'تفعيل التذكير'],
      'O‘chirish': ['Turn off', 'Выключить', 'إيقاف'],
      'ZIKR TANLOVLARI': ['DHIKR OPTIONS', 'ВАРИАНТЫ ЗИКРА', 'خيارات الذكر'],
      'Yodga olish uchun iboralar': ['Phrases to remember', 'Фразы для поминания', 'عبارات للذكر'],
      'Tanlash va sanash →': ['Select and count →', 'Выбрать и считать →', 'اختر وابدأ العد ←'],
      'HIJRIY VA MILODIY': ['HIJRI AND GREGORIAN', 'ХИДЖРА И ГРИГОРИАНСКИЙ', 'هجري وميلادي'],
      'Islomiy taqvim': ['Islamic calendar', 'Исламский календарь', 'التقويم الإسلامي'],
      'Yaqinlashayotgan sanalar': ['Upcoming dates', 'Ближайшие даты', 'المواعيد القادمة'],
      'Ramazon boshlanishi': ['Start of Ramadan', 'Начало Рамадана', 'بداية رمضان'],
      'Ramazon hayiti': ['Eid al-Fitr', 'Ид аль-Фитр', 'عيد الفطر'],
      'Qurbon hayiti': ['Eid al-Adha', 'Ид аль-Адха', 'عيد الأضحى'],
      'Subhanalloh': ['SubhanAllah', 'Субханаллах', 'سبحان الله'],
      'Alhamdulillah': ['Alhamdulillah', 'Альхамдулиллях', 'الحمد لله'],
      'Allohu akbar': ['Allahu Akbar', 'Аллаху Акбар', 'الله أكبر'],
      'Astag‘firulloh': ['Astaghfirullah', 'Астагфируллах', 'أستغفر الله'],
      'Shaxsiy zikr qo‘shish': ['Add a personal dhikr', 'Добавить личный зикр', 'أضف ذكراً شخصياً'],
      'Arabcha matn': ['Arabic text', 'Текст на арабском', 'النص العربي'],
      'O‘qilishi': ['Transliteration', 'Транслитерация', 'النطق'],
      'Ma’nosi': ['Meaning', 'Значение', 'المعنى'],
      'Zikrni ro‘yxatga qo‘shish': ['Add dhikr to list', 'Добавить зикр в список', 'أضف الذكر إلى القائمة'],
      'AI agent bilan ertangi zikr rejasini tuzish': ['Plan tomorrow’s dhikr with an AI agent', 'Составьте план зикра на завтра с ИИ', 'خطط لأذكار الغد بمساعدة الذكاء الاصطناعي'],
      'Agent faqat saytdagi zikr iboralaridan shaxsiy vaqt va sanoq rejasini tuzadi. Bu diniy hukm yoki manba tekshiruvi emas. So‘rovingiz xavfsiz AI serveriga yuboriladi; maxfiy API kaliti brauzerga berilmaydi.': ['The agent schedules only the dhikr phrases provided by the site. It does not issue religious rulings or verify sources. Your request is sent to a secure AI server; the private API key is never sent to your browser.', 'Агент составляет расписание только из фраз на сайте. Он не выносит религиозных решений и не проверяет источники. Запрос отправляется на защищённый сервер ИИ; секретный API-ключ не передаётся в браузер.', 'ينظم الوكيل العبارات الموجودة في الموقع فقط، ولا يصدر أحكاماً دينية ولا يتحقق من المصادر. يُرسل طلبك إلى خادم آمن؛ ولا يصل مفتاح API السري إلى متصفحك.'],
      'Zikr hisobi va shaxsiy zikrlar qurilmangizda saqlanadi; Google hisobiga kirsangiz, zikr ma’lumotlari shu hisobga ham sinxronlanadi. AI so‘rovi maxfiy kalit ko‘rsatilmaydigan server orqali Gemini xizmatiga yuboriladi. Zikr matnlari diniy hukm yoki maxsus fazilat da’vosi emas.': ['Dhikr counts and custom phrases stay on this device; sign in with Google to sync them to your private account. AI requests go to Gemini through a server that keeps the private key hidden. Dhikr content is not a religious ruling or claim of special virtue.', 'Счётчик и личные фразы хранятся на устройстве; войдите через Google для синхронизации с личным аккаунтом. Запросы ИИ отправляются в Gemini через сервер, скрывающий секретный ключ. Текст зикра не является религиозным решением или утверждением об особой награде.', 'تبقى الأذكار الشخصية والعداد على جهازك؛ سجّل الدخول عبر Google لمزامنتها مع حسابك الخاص. تُرسل طلبات الذكاء الاصطناعي إلى Gemini عبر خادم يخفي المفتاح السري. نص الذكر ليس حكماً دينياً أو ادعاء بفضيلة خاصة.'],
      'Masalan: ertangi tong va kechki zikrlarimni 33 martadan rejalashtir': ['Example: plan 33 repetitions of my morning and evening dhikr for tomorrow', 'Например: составь на завтра утренний и вечерний зикр по 33 раза', 'مثال: خطط لأذكار الصباح والمساء غداً 33 مرة لكل منها'],
      'Kalit faqat joriy brauzer sessiyasida saqlanadi, hisobga yoki serverga yuborilmaydi. Gemini kvotasi cheklangan; GPT API ChatGPT bepul akkauntidan alohida va haq olinishi mumkin. Hisob parolingizni bu yerga kiritmang.': ['The key stays only in this browser session and is not sent to the account or our server. Gemini quotas are limited; GPT API is separate from a free ChatGPT account and may cost money. Never enter your account password here.', 'Ключ хранится только в текущей сессии браузера и не отправляется в аккаунт или на наш сервер. Квота Gemini ограничена; GPT API отличается от бесплатного аккаунта ChatGPT и может быть платным. Не вводите здесь пароль.', 'يبقى المفتاح في جلسة المتصفح فقط ولا يُرسل إلى الحساب أو خادمنا. حصة Gemini محدودة؛ وواجهة GPT API منفصلة عن حساب ChatGPT المجاني وقد تكون مدفوعة. لا تدخل كلمة مرور حسابك هنا.'],
      'So‘rov va zikr rejalari tanlangan AI provayderiga yuboriladi.': ['Your prompt and dhikr plan are sent to the selected AI provider.', 'Ваш запрос и план зикра отправляются выбранному провайдеру ИИ.', 'يُرسل طلبك وخطة الذكر إلى مزود الذكاء الاصطناعي المختار.'],
      'Gemini · server orqali': ['Gemini · through the secure server', 'Gemini · через защищённый сервер', 'Gemini · عبر الخادم الآمن'],
      'AI server manzili hali ulanmagan. Sayt egasi uni bir marta sozlashi kerak.': ['The AI server URL is not connected yet. The site owner needs to configure it once.', 'Адрес сервера ИИ ещё не подключён. Владельцу сайта нужно настроить его один раз.', 'عنوان خادم الذكاء الاصطناعي غير متصل بعد. على مالك الموقع إعداده مرة واحدة.'],
      'AI server manzili noto‘g‘ri sozlangan.': ['The AI server URL is configured incorrectly.', 'Адрес сервера ИИ настроен неверно.', 'عنوان خادم الذكاء الاصطناعي غير مضبوط بشكل صحيح.'],
      'AI server manzili HTTPS bo‘lishi kerak.': ['The AI server URL must use HTTPS.', 'Адрес сервера ИИ должен использовать HTTPS.', 'يجب أن يستخدم عنوان خادم الذكاء الاصطناعي HTTPS.'],
      'AI server javobini o‘qib bo‘lmadi.': ['Could not read the AI server response.', 'Не удалось прочитать ответ сервера ИИ.', 'تعذرت قراءة رد خادم الذكاء الاصطناعي.'],
      'AI server reja formatini noto‘g‘ri qaytardi.': ['The AI server returned an invalid plan format.', 'Сервер ИИ вернул неверный формат плана.', 'أعاد خادم الذكاء الاصطناعي تنسيقاً غير صالح للخطة.'],
      'AI server hozircha sozlanmagan.': ['The AI server is not configured yet.', 'Сервер ИИ ещё не настроен.', 'لم يتم إعداد خادم الذكاء الاصطناعي بعد.'],
      'AI xizmatining bepul kvotasi vaqtincha tugadi. Keyinroq qayta urinib ko‘ring.': ['The AI free-tier quota is temporarily exhausted. Try again later.', 'Бесплатная квота ИИ временно исчерпана. Попробуйте позже.', 'انتهت الحصة المجانية للذكاء الاصطناعي مؤقتاً. حاول لاحقاً.'],
      'AI yaroqli reja tuza olmadi. Boshqacha so‘rov bilan qayta urinib ko‘ring.': ['AI could not create a valid plan. Try a different request.', 'ИИ не смог составить подходящий план. Попробуйте изменить запрос.', 'لم يتمكن الذكاء الاصطناعي من إنشاء خطة صالحة. جرّب طلباً آخر.'],
      'AI serverga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.': ['Could not connect to the AI server. Try again shortly.', 'Не удалось подключиться к серверу ИИ. Попробуйте позже.', 'تعذر الاتصال بخادم الذكاء الاصطناعي. حاول بعد قليل.'],
      'AI so‘rovining vaqti tugadi. Qayta urinib ko‘ring.': ['The AI request timed out. Try again.', 'Время ожидания ответа ИИ истекло. Попробуйте ещё раз.', 'انتهت مهلة طلب الذكاء الاصطناعي. حاول مجدداً.'],
      'AI javob bera olmadi. Birozdan keyin qayta urinib ko‘ring.': ['AI could not respond. Try again shortly.', 'ИИ не смог ответить. Попробуйте позже.', 'لم يتمكن الذكاء الاصطناعي من الرد. حاول بعد قليل.'],
      'AI dan reja javobi kelmadi.': ['AI did not return a schedule.', 'ИИ не вернул расписание.', 'لم يُرجع الذكاء الاصطناعي خطة.'],
      'So‘rovlar tez-tez yuborildi. Bir ozdan keyin qayta urinib ko‘ring.': ['Too many requests. Try again in a little while.', 'Слишком много запросов. Попробуйте немного позже.', 'طلبات كثيرة جداً. حاول مرة أخرى بعد قليل.'],
      'Rejani tuzish': ['Create plan', 'Составить план', 'أنشئ الخطة'],
      'Shaxsiy AI API kalitini sozlash': ['Configure a personal AI API key', 'Настроить личный API-ключ ИИ', 'إعداد مفتاح API شخصي'],
      'Provayder kaliti': ['Provider key', 'Ключ сервиса', 'مفتاح المزود'],
      'Kalitni shu sessiyada saqlash': ['Save key for this session', 'Сохранить ключ на эту сессию', 'احفظ المفتاح لهذه الجلسة'],
      'Shaxsiy API kaliti': ['Personal API key', 'Личный API-ключ', 'مفتاح API شخصي'],
      'AI kaliti topilmadi. Gemini yoki OpenAI kalitini sozlamadan kiriting.': ['No AI key found. Add a Gemini or OpenAI key in settings.', 'Ключ ИИ не найден. Добавьте ключ Gemini или OpenAI в настройках.', 'لم يتم العثور على مفتاح ذكاء اصطناعي. أضف مفتاح Gemini أو OpenAI في الإعدادات.'],
      'Oyatni tinglash': ['Play this verse', 'Слушать этот аят', 'استمع لهذه الآية']
    },
    finance: {
      'HALOL MOLIYA': ['HALAL FINANCE', 'ХАЛЯЛЬНЫЕ ФИНАНСЫ', 'التمويل الحلال'],
      'Zakot kalkulyatori': ['Zakat calculator', 'Калькулятор закята', 'حاسبة الزكاة'],
      'Kompaniya haqida': ['Company screening', 'Проверка компании', 'فحص الشركات'],
      'Cheklovlar': ['Limitations', 'Ограничения', 'القيود'],
      'Ochiq · qulay · siz kiritgan ma’lumot': ['Transparent · simple · your inputs', 'Прозрачно · просто · ваши данные', 'واضح · سهل · بياناتك'],
      'Moliyaviy ibodatni': ['Plan your financial worship', 'Планируйте финансовое поклонение', 'خطط لعبادتك المالية'],
      'aniqroq rejalang.': ['with clarity.', 'точнее.', 'بدقة.'],
      'Zakotga tegishli mol-mulkni jamlang, nisob bilan solishtiring va taxminiy miqdorni ko‘ring. Hisob-kitob ma’lumotlari qurilmangizdan chiqmaydi.': ['Add zakatable assets, compare them with nisab, and estimate the amount due. Your calculations stay on this device.', 'Сложите имущество для закята, сравните с нисабом и оцените сумму. Расчёты остаются на устройстве.', 'اجمع الأموال الزكوية وقارنها بالنصاب وقدّر المبلغ. تبقى الحسابات على جهازك.'],
      'Zakotni hisoblash': ['Calculate zakat', 'Рассчитать закят', 'احسب الزكاة'],
      'ZAKOT HISOBI': ['ZAKAT CALCULATION', 'РАСЧЁТ ЗАКЯТА', 'حساب الزكاة'],
      'O‘z ma’lumotlaringizni kiriting': ['Enter your information', 'Введите свои данные', 'أدخل بياناتك'],
      'Nisob qiymati va mol-mulk narxlarini ishonchli mahalliy manbadan o‘zingiz yangilang.': ['Update nisab and asset prices using a trusted local source.', 'Уточняйте нисаб и стоимость имущества по надёжным местным источникам.', 'حدّث النصاب وأسعار الأصول من مصدر محلي موثوق.'],
      'Hisob valyutasi': ['Calculation currency', 'Валюта расчёта', 'عملة الحساب'],
      'Nisob usuli': ['Nisab method', 'Метод нисаба', 'طريقة النصاب'],
      'Qiymatni o‘zim kiritaman': ['Enter value manually', 'Ввести значение вручную', 'أدخل القيمة يدوياً'],
      'Metallning 1 grammi narxi': ['Price per gram of metal', 'Цена металла за грамм', 'سعر غرام المعدن'],
      'Nisob qiymati': ['Nisab value', 'Значение нисаба', 'قيمة النصاب'],
      'Barcha summalarni tanlangan bitta valyutada kiriting. Valyutani tanlash summalarni konvertatsiya qilmaydi.': ['Enter all amounts in the selected currency. Changing currency does not convert amounts.', 'Введите все суммы в выбранной валюте. Смена валюты не конвертирует суммы.', 'أدخل جميع المبالغ بالعملة المختارة. تغيير العملة لا يحوّل المبالغ.'],
      'Naqd pul va bankdagi mablag‘': ['Cash and bank balances', 'Наличные и средства в банке', 'النقد والأرصدة البنكية'],
      'Zakotga tortiladigan oltin-kumush qiymati': ['Zakatable gold and silver value', 'Стоимость облагаемых золотых и серебряных изделий', 'قيمة الذهب والفضة الخاضعة للزكاة'],
      'Savdo uchun mo‘ljallangan tovarlar qiymati': ['Value of goods for trade', 'Стоимость товаров для торговли', 'قيمة البضائع المعدة للتجارة'],
      'Qaytishi kutilayotgan qarzlar': ['Receivables expected to be repaid', 'Ожидаемые к возврату долги', 'الديون المتوقع تحصيلها'],
      'Yaqin muddatda to‘lanadigan qarzlar': ['Debts due soon', 'Долги к ближайшей оплате', 'الديون المستحقة قريباً'],
      'Zakot stavkasi (%)': ['Zakat rate (%)', 'Ставка закята (%)', 'نسبة الزكاة (%)'],
      'Mulk nisobga yetganidan keyin zakot yili (qamariy yil) to‘ldi': ['A lunar year has passed since the assets reached nisab', 'Прошёл лунный год с момента достижения нисаба', 'مرّت سنة قمرية منذ بلوغه النصاب'],
      'Hisoblash': ['Calculate', 'Рассчитать', 'احسب'],
      'TAXMINIY NATIJA': ['ESTIMATED RESULT', 'ПРИМЕРНЫЙ РЕЗУЛЬТАТ', 'النتيجة التقديرية'],
      'Zakot xulosasi': ['Zakat summary', 'Итог закята', 'ملخص الزكاة'],
      'Jami hisobga olingan mol-mulk': ['Total eligible assets', 'Всего учитываемых активов', 'إجمالي الأموال المحتسبة'],
      'Nisob qiymati': ['Nisab value', 'Значение нисаба', 'قيمة النصاب'],
      'Taxminiy zakot': ['Estimated zakat', 'Примерный закят', 'الزكاة التقديرية'],
      'Ma’lumot kiriting': ['Enter your details', 'Введите данные', 'أدخل البيانات'],
      'HALOLLIKNI O‘RGANISH': ['LEARN ABOUT SCREENING', 'О ПРОВЕРКЕ СООТВЕТСТВИЯ', 'التعرّف على التوافق الشرعي'],
      'Kompaniya uchun tekshiruv ro‘yxati': ['Company research checklist', 'Список проверки компании', 'قائمة التحقق من الشركة']
    },
    meros: {
      'MEROS HISOBI': ['INHERITANCE ESTIMATE', 'РАСЧЁТ НАСЛЕДСТВА', 'حساب الميراث'],
      'Hisoblash': ['Calculate', 'Рассчитать', 'احسب'],
      'Muhim ma’lumot': ['Important information', 'Важная информация', 'معلومات مهمة'],
      'Tushunarli · ehtiyotkor · shaxsiy': ['Clear · careful · private', 'Понятно · осторожно · конфиденциально', 'واضح · حذر · خاص'],
      'Meros masalasini': ['Review inheritance', 'Рассмотрите наследство', 'رتّب مسألة الميراث'],
      'tartib bilan ko‘ring.': ['step by step.', 'по порядку.', 'بخطوات واضحة.'],
      'Qarzlar va vasiyatni hisobga olgandan keyingi sof qoldiqni kiriting. Asosiy yaqin qarindoshlar bo‘yicha namunaviy ulushlarni ko‘ring.': ['Enter the net estate after debts and valid bequests. View example shares for immediate relatives.', 'Введите остаток наследства после долгов и завещания. Посмотрите примерные доли ближайших родственников.', 'أدخل صافي التركة بعد الديون والوصية. اعرض حصصاً تقريبية للأقارب المباشرين.'],
      'Hisoblashni boshlash': ['Start calculation', 'Начать расчёт', 'ابدأ الحساب'],
      'SODDALASHTIRILGAN HISOB': ['SIMPLIFIED ESTIMATE', 'УПРОЩЁННЫЙ РАСЧЁТ', 'حساب مبسط'],
      'Vaziyatni kiriting': ['Enter the situation', 'Введите данные', 'أدخل الحالة'],
      'Taqsimlanadigan sof meros summasi': ['Net estate to distribute', 'Чистая сумма наследства', 'صافي التركة للتوزيع'],
      'Vafot etgan kishining tirik turmush o‘rtog‘i': ['Surviving spouse', 'Переживший супруг', 'الزوج أو الزوجة الباقي على قيد الحياة'],
      'Yo‘q': ['None', 'Нет', 'لا يوجد'],
      'Eri (vafot etgan ayol)': ['Husband (deceased woman)', 'Муж (умершая женщина)', 'الزوج (المتوفاة امرأة)'],
      'Xotini/xotinlari (vafot etgan erkak)': ['Wife/wives (deceased man)', 'Жена/жёны (умерший мужчина)', 'الزوجة أو الزوجات (المتوفى رجل)'],
      'Tirik xotinlar soni': ['Number of surviving wives', 'Число живых жён', 'عدد الزوجات الباقيات'],
      'Tirik otasi': ['Surviving father', 'Живой отец', 'الأب على قيد الحياة'],
      'Tirik onasi': ['Surviving mother', 'Живая мать', 'الأم على قيد الحياة'],
      'O‘g‘illari soni': ['Number of sons', 'Количество сыновей', 'عدد الأبناء'],
      'Qizlari soni': ['Number of daughters', 'Количество дочерей', 'عدد البنات'],
      'Aka-uka va opa-singillar soni': ['Number of siblings', 'Количество братьев и сестёр', 'عدد الإخوة والأخوات'],
      'Boshqa merosxo‘rlar ham bor (masalan: bobosi/buvisi yoki nabira)': ['There are other heirs (e.g. grandparents or grandchildren)', 'Есть другие наследники (например, дедушка/бабушка или внуки)', 'يوجد ورثة آخرون (مثل الأجداد أو الأحفاد)'],
      'Tasdiqlayman: yuqorida sanalganlardan tashqari merosxo‘r yo‘q': ['I confirm there are no heirs other than those listed above', 'Подтверждаю, что других наследников, кроме указанных, нет', 'أؤكد عدم وجود ورثة غير المذكورين أعلاه'],
      'Namunaviy ulushlarni hisoblash': ['Estimate example shares', 'Рассчитать примерные доли', 'احسب الحصص التقديرية'],
      'TAXMINIY NATIJA': ['ESTIMATED RESULT', 'ПРИМЕРНЫЙ РЕЗУЛЬТАТ', 'النتيجة التقديرية'],
      'Ulushlar taqsimoti': ['Share distribution', 'Распределение долей', 'توزيع الحصص'],
      'Natijani chop etish / PDF': ['Print result / PDF', 'Печать / PDF', 'طباعة النتيجة / PDF'],
      'Bu shar’iy fatvo yoki yakuniy taqsimot emas': ['This is not a religious ruling or final distribution', 'Это не фетва и не окончательное распределение', 'هذا ليس فتوى أو توزيعاً نهائياً'],
      'Zakot kalkulyatori ↗': ['Zakat calculator ↗', 'Калькулятор закята ↗', 'حاسبة الزكاة ↗']
    },
    quran: {
      'QUR’ONI KARIM': ['THE NOBLE QUR’AN', 'СВЯЩЕННЫЙ КОРАН', 'القرآن الكريم'],
      'Qur’onni o‘qish': ['Read Qur’an', 'Читать Коран', 'قراءة القرآن'],
      'Saqlangan oyatlar': ['Saved verses', 'Сохранённые аяты', 'الآيات المحفوظة'],
      'Asosiy sayt ↗': ['Main site ↗', 'Главный сайт ↗', 'الموقع الرئيسي ↗'],
      'To‘liq Qur’on · 114 sura · 30 juz': ['Complete Qur’an · 114 surahs · 30 juz', 'Полный Коран · 114 сур · 30 джузов', 'القرآن كاملاً · ١١٤ سورة · ٣٠ جزءاً'],
      'O‘zingizga qulay uslubda o‘qing: sura yoki juzni tanlang, sahifa ko‘rinishiga o‘ting va ko‘zingizga mos rang hamda matn o‘lchamini sozlang.': ['Read your way: choose a surah or juz, switch to page view, and adjust colors and text size for comfort.', 'Читайте удобно: выберите суру или джуз, включите постраничный вид и настройте цвет и размер текста.', 'اقرأ بالطريقة المناسبة: اختر سورة أو جزءاً، واستخدم عرض الصفحة واضبط اللون وحجم النص.'],
      'O‘qishni boshlash': ['Start reading', 'Начать чтение', 'ابدأ القراءة'],
      'QUR’ON O‘QUVCHISI': ['QUR’AN READER', 'ЧТЕНИЕ КОРАНА', 'قارئ القرآن'],
      'O‘qish joyingizni tanlang': ['Choose where to read', 'Выберите место чтения', 'اختر موضع القراءة'],
      'Oxirgi joydan davom etish': ['Continue where you left off', 'Продолжить чтение', 'تابع من حيث توقفت'],
      'Sura bo‘yicha': ['By surah', 'По суре', 'حسب السورة'],
      'Juz bo‘yicha': ['By juz', 'По джузу', 'حسب الجزء'],
      'O‘qish ko‘rinishi': ['Reading view', 'Режим чтения', 'طريقة العرض'],
      'Uzluksiz o‘qish': ['Continuous reading', 'Непрерывное чтение', 'قراءة متواصلة'],
      'Mushaf sahifasi · tekis satrlar': ['Mushaf page · aligned lines', 'Страница мусхафа · ровные строки', 'صفحة المصحف · أسطر متناسقة'],
      'Oyatma-oyat': ['Verse by verse', 'По аятам', 'آيةً آية'],
      'Ovoz bilan qidirish': ['Voice search', 'Голосовой поиск', 'البحث الصوتي'],
      'O‘qish qulayligi': ['Reading comfort', 'Удобство чтения', 'راحة القراءة'],
      '⚙ O‘qish sozlamalari': ['⚙ Reading settings', '⚙ Настройки чтения', '⚙ إعدادات القراءة'],
      'Saqlanganlar': ['Saved', 'Сохранённое', 'المحفوظات'],
      'Qori tanlang': ['Choose a reciter', 'Выберите чтеца', 'اختر قارئاً'],
      '▶ Surani tinglash': ['▶ Play surah', '▶ Слушать суру', '▶ استمع للسورة'],
      'Tarjimani ko‘rsatish': ['Show translation', 'Показать перевод', 'إظهار الترجمة'],
      'Tarjima tili': ['Translation language', 'Язык перевода', 'لغة الترجمة'],
      'Tezlik': ['Speed', 'Скорость', 'السرعة'],
      'Boshlang‘ich oyat': ['Start verse', 'Начальный аят', 'آية البداية'],
      'Yakuniy oyat': ['End verse', 'Конечный аят', 'آية النهاية'],
      'Tanlangan oraliq takrori': ['Repeat selected range', 'Повтор выбранного отрывка', 'تكرار المقطع المحدد'],
      'Har bir oyat takrori': ['Repeat each verse', 'Повтор каждого аята', 'تكرار كل آية'],
      'Cheksiz': ['Infinite', 'Бесконечно', 'بلا نهاية'],
      'Sozlamalarni yopish': ['Close settings', 'Закрыть настройки', 'إغلاق الإعدادات'],
      'Ko‘zga qulay sahifa rangi': ['Comfortable page color', 'Удобный цвет страницы', 'لون الصفحة المريح'],
      'Tajvid ko‘rinishi': ['Tajweed display', 'Отображение таджвида', 'عرض التجويد'],
      'Tajvidsiz': ['Without tajweed colors', 'Без цветов таджвида', 'بدون ألوان التجويد'],
      'Mushafdagi tajvid': ['Mushaf tajweed colors', 'Цвета таджвида мусхафа', 'ألوان التجويد في المصحف'],
      'Matn o‘lchami — ikki usul': ['Two text sizing modes', 'Два режима размера текста', 'طريقتان لحجم النص'],
      'Sahifa miqyosi': ['Page scale', 'Масштаб страницы', 'مقياس الصفحة'],
      'Matn o‘lchami': ['Text size', 'Размер текста', 'حجم النص'],
      'Qator oralig‘i': ['Line spacing', 'Межстрочный интервал', 'تباعد الأسطر'],
      'Oddiy': ['Normal', 'Обычный', 'عادي'],
      'Keng': ['Wide', 'Широкий', 'واسع'],
      'Juda keng': ['Extra wide', 'Очень широкий', 'واسع جداً'],
      'Tanlovlaringiz ushbu qurilmada saqlanadi.': ['Your settings are saved on this device.', 'Настройки сохраняются на этом устройстве.', 'تُحفظ إعداداتك على هذا الجهاز.'],
      'Tayyor': ['Done', 'Готово', 'تم'],
      'Gorizontal o‘qish': ['Landscape reading', 'Горизонтальное чтение', 'قراءة أفقية'],
      'Audio kutubxonasi ↗': ['Audio library ↗', 'Аудиотека ↗', 'مكتبة الصوتيات ↗'],
      'Tarjima topilmadi.': ['Translation unavailable.', 'Перевод недоступен.', 'الترجمة غير متوفرة.'],
      'Oyatni tinglash': ['Play this verse', 'Слушать этот аят', 'استمع لهذه الآية'],
      'Oyat yonidagi ▶ uni alohida tinglaydi; Mushaf sahifasi rejimida pastdagi tugmalar bilan sahifalab o‘qing.': ['Use ▶ beside a verse to play it alone; use the controls below to read Mushaf pages one by one.', 'Нажмите ▶ рядом с аятом, чтобы прослушать его отдельно; листайте страницы мусхафа кнопками ниже.', 'اضغط ▶ بجوار الآية للاستماع إليها منفردة، واستخدم الأزرار أدناه لتصفح صفحات المصحف.'],
      'Saqlangan oyatlar va oxirgi joy qurilmada turadi; Google hisobi bilan xohlasangiz shaxsiy hisobingizga sinxronlanadi.': ['Saved verses and reading position stay on this device; sign in with Google to sync them to your private account.', 'Сохранённые аяты и место чтения хранятся на устройстве; войдите через Google для синхронизации с личным аккаунтом.', 'تبقى الآيات المحفوظة وموضع القراءة على جهازك؛ سجّل الدخول عبر Google لمزامنتها مع حسابك الخاص.']
    },
    tools: {
      'Kundalik vositalar': ['Daily tools', 'Инструменты на каждый день', 'أدوات يومية'],
      'Namoz vaqtlari': ['Prayer times', 'Время намаза', 'أوقات الصلاة'],
      'Qibla': ['Qibla', 'Кибла', 'القبلة'],
      'Zikr': ['Dhikr', 'Зикр', 'الذكر'],
      'Zakot': ['Zakat', 'Закят', 'الزكاة']
    },
    ibodat: {
      'Ibodat rejasi': ['Worship planner', 'План поклонения', 'مخطط العبادة'],
      'Namozlarim': ['My prayers', 'Мои молитвы', 'صلواتي'],
      'Saqlash': ['Save', 'Сохранить', 'حفظ'],
      'Bugun': ['Today', 'Сегодня', 'اليوم']
    },
    books: {
      'PDF kitoblar': ['PDF books', 'Книги PDF', 'كتب PDF'],
      'Kitob qidirish': ['Search books', 'Поиск книг', 'ابحث عن الكتب'],
      'Qidiruv': ['Search', 'Поиск', 'بحث'],
      'Barchasi': ['All', 'Все', 'الكل']
    },
    catalog: {
      'Bosh sahifa': ['Home', 'Главная', 'الرئيسية'],
      'Maqolalar': ['Articles', 'Статьи', 'المقالات'],
      'Media': ['Media', 'Медиа', 'الإعلام'],
      'Ilova va web': ['Apps & web', 'Приложения и сайты', 'التطبيقات والويب'],
      'Yo‘nalishlar': ['Services', 'Разделы', 'الخدمات'],
      'Qo‘llanmalar': ['Guides', 'Руководства', 'الأدلة'],
      'Aloqa': ['Contact', 'Контакты', 'اتصل بنا'],
      'Rasmiy web va ilovalar': ['Official web services and apps', 'Официальные сайты и приложения', 'الخدمات والتطبيقات الرسمية'],
      'Web xizmatlarimiz, ilovalar va kanallar': ['Our web services, apps, and channels', 'Наши сайты, приложения и каналы', 'خدماتنا وتطبيقاتنا وقنواتنا'],
      'Kundalik islomiy vositalar, elektron PDF kutubxonasi, valyuta kurslari xizmati va mobil ilovalarimizga shu sahifadan tez o‘ting.': ['Quickly access Islamic tools, our PDF library, currency rates, and mobile apps from here.', 'Быстрый доступ к исламским инструментам, библиотеке PDF, курсам валют и приложениям.', 'انتقل بسهولة إلى الأدوات الإسلامية ومكتبة الكتب وأسعار العملات والتطبيقات.'],
      'Web xizmatlar': ['Web services', 'Веб-сервисы', 'خدمات الويب'],
      'Barchasi': ['All', 'Все', 'الكل'],
      'Audio': ['Audio', 'Аудио', 'الصوتيات'],
      'Tajvid': ['Tajweed', 'Таджвид', 'التجويد'],
      'Bolalar': ['Kids', 'Детям', 'للأطفال'],
      'Zakot va moliya': ['Zakat & finance', 'Закят и финансы', 'الزكاة والتمويل'],
      'Meros': ['Inheritance', 'Наследство', 'الميراث'],
      'Zikr va ibodat': ['Dhikr & worship', 'Зикр и поклонение', 'الذكر والعبادة'],
      'PDF kitoblar': ['PDF books', 'Книги PDF', 'كتب PDF'],
      'Valyuta': ['Currency', 'Валюта', 'العملات'],
      'Vositalar': ['Tools', 'Инструменты', 'الأدوات'],
      'Ilovalar': ['Apps', 'Приложения', 'التطبيقات'],
      'Kerakli xizmatni qidiring…': ['Search for a service…', 'Найти нужный сервис…', 'ابحث عن خدمة…'],
      'Barcha web va ilovalar': ['All web services and apps', 'Все сайты и приложения', 'جميع خدمات الويب والتطبيقات'],
      'ta xizmat': ['services', 'сервисов', 'خدمات'],
      'Qidiruv bo‘yicha xizmat topilmadi. Boshqa so‘z yoki guruhni tanlang.': ['No service matches your search. Try another word or category.', 'По вашему запросу ничего не найдено. Измените запрос или категорию.', 'لا توجد خدمة مطابقة. جرّب كلمة أو فئة أخرى.'],
      'PDF kitoblar kutubxonasi': ['PDF book library', 'Библиотека книг PDF', 'مكتبة كتب PDF'],
      'Valyuta kurslari va konvertor': ['Currency rates and converter', 'Курсы валют и конвертер', 'أسعار العملات والمحوّل'],
      'Kundalik islomiy vositalar': ['Daily Islamic tools', 'Исламские инструменты на каждый день', 'أدوات إسلامية يومية'],
      'Shaxsiy ibodat va qazo rejasi': ['Personal worship planner', 'Личный план поклонения', 'خطة العبادة الشخصية'],
      'Qur’oni Karim o‘quvchisi': ['Qur’an reader', 'Чтение Корана', 'قارئ القرآن'],
      'Qur’on tajvid mashqi': ['Qur’an tajweed practice', 'Практика таджвида Корана', 'تدريب تجويد القرآن'],
      'Zakot va islomiy moliya': ['Zakat and Islamic finance', 'Закят и исламские финансы', 'الزكاة والتمويل الإسلامي'],
      'Meros ulushi hisoblagichi': ['Inheritance share calculator', 'Калькулятор долей наследства', 'حاسبة أنصبة الميراث'],
      'Qur’on audio kutubxonasi': ['Qur’an audio library', 'Аудиотека Корана', 'مكتبة صوتيات القرآن'],
      'Mehrli bilimlar va o‘yinlar': ['Kind learning and games', 'Добрые знания и игры', 'تعلم وألعاب هادفة'],
      'Smart zikr va hijriy taqvim': ['Smart dhikr and Hijri calendar', 'Умный зикр и календарь хиджры', 'الذكر الذكي والتقويم الهجري'],
      'Qur’onni o‘qish': ['Read Qur’an', 'Читать Коран', 'قراءة القرآن'],
      'Tajvidni mashq qilish': ['Practice tajweed', 'Практиковать таджвид', 'تدرّب على التجويد'],
      'Audio tinglash': ['Listen to audio', 'Слушать аудио', 'استمع للصوتيات'],
      'O‘yinni boshlash': ['Start learning', 'Начать обучение', 'ابدأ التعلم'],
      'Barcha xizmatlarni topilmadi.': ['No services found.', 'Сервисы не найдены.', 'لم يتم العثور على خدمات.']
    }
  };
  const app = document.body.dataset.siteLocale || 'common';
  const dictionary = { ...common, ...(translations[app] || {}) };
  const textSources = new WeakMap();
  const attributeSources = new WeakMap();
  const sourceTitle = document.title;
  const supported = new Set(languages.map(language => language.code));
  let currentLanguage = 'uz';

  function localize(source) {
    if (currentLanguage === 'uz') return source;
    const languageIndex = ['en', 'ru', 'ar'].indexOf(currentLanguage);
    if (dictionary[source]) return dictionary[source][languageIndex] || source;
    return Object.entries(dictionary).reduce((text, [original, translationsForLanguage]) => {
      if (original.length < 8) return text;
      return text.replaceAll(original, translationsForLanguage[languageIndex] || original);
    }, source);
  }

  function translateTextNode(node) {
    if (!textSources.has(node)) textSources.set(node, node.nodeValue);
    const source = textSources.get(node);
    const trimmed = source.trim();
    if (!trimmed || !dictionary[trimmed]) return;
    const start = source.indexOf(trimmed);
    const translated = `${source.slice(0, start)}${localize(trimmed)}${source.slice(start + trimmed.length)}`;
    if (node.nodeValue !== translated) node.nodeValue = translated;
  }

  function translateAttributes(element) {
    ['placeholder', 'aria-label', 'title', 'alt'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      let sources = attributeSources.get(element);
      if (!sources) {
        sources = new Map();
        attributeSources.set(element, sources);
      }
      if (!sources.has(attribute)) sources.set(attribute, element.getAttribute(attribute));
      const source = sources.get(attribute);
      if (dictionary[source]) element.setAttribute(attribute, localize(source));
    });
  }

  function translateTree(root = document.body) {
    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body) return;
    if (root instanceof Element) translateAttributes(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: node => node.parentElement?.closest('script,style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
    });
    while (walker.nextNode()) translateTextNode(walker.currentNode);
    root.querySelectorAll?.('*').forEach(translateAttributes);
  }

  function setLanguage(language) {
    if (!supported.has(language)) return;
    currentLanguage = language;
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    translateTree();
    document.title = localize(sourceTitle);
    const selector = document.querySelector('.site-language-select');
    if (selector) selector.value = language;
    updateAccountLabel();
    try {
      localStorage.setItem('islamic-site-locale', language);
    } catch (error) {
      console.error('Could not save site language preference:', error);
    }
  }

  const header = document.querySelector('.topbar, .portal-navbar');
  const accountStatus = document.createElement('span');
  accountStatus.className = 'site-account-status';
  accountStatus.setAttribute('role', 'status');
  const accountButton = document.createElement('button');
  accountButton.className = 'site-account-button';
  accountButton.type = 'button';
  accountButton.textContent = 'Google bilan kirish';
  accountButton.setAttribute('aria-label', 'Google bilan kirish');
  function updateAccountLabel() {
    if (!accountButton.isConnected) return;
    const signedIn = Boolean(window.islamicSiteAccount?.user);
    accountButton.textContent = localize(signedIn ? 'Google hisobidan chiqish' : 'Google bilan kirish');
    accountButton.setAttribute('aria-label', accountButton.textContent);
    accountStatus.textContent = signedIn ? window.islamicSiteAccount.user.email || window.islamicSiteAccount.user.displayName || '' : '';
  }
  const accountControls = document.createElement('div');
  accountControls.className = 'site-account-controls';
  accountControls.append(accountButton, accountStatus);
  const hasExistingAccountControl = document.querySelector('#google-sign-in, #google-login-btn, #google-sign-out');
  if (header && !hasExistingAccountControl) header.append(accountControls);
  window.islamicSiteAccount = {
    user: null,
    async load(appId) {
      if (!this.user || !window.islamicFirestore) return null;
      const { doc, getDoc } = window.islamicFirestore;
      const snapshot = await getDoc(doc(window.islamicFirestore.db, 'userAppData', this.user.uid, 'apps', appId));
      return snapshot.exists() ? snapshot.data() : null;
    },
    async save(appId, data) {
      if (!this.user || !window.islamicFirestore) return;
      if (!/^[a-z0-9-]{2,24}$/.test(appId) || JSON.stringify(data).length > 60000) {
        throw new Error('Akkauntga saqlanadigan ma’lumot hajmi yoki turi yaroqsiz.');
      }
      const { doc, serverTimestamp, setDoc } = window.islamicFirestore;
      await setDoc(doc(window.islamicFirestore.db, 'userAppData', this.user.uid, 'apps', appId), {
        data,
        updatedAt: serverTimestamp()
      });
    }
  };
  accountButton.addEventListener('click', async () => {
    accountButton.disabled = true;
    accountStatus.textContent = localize('Akkaunt ulanmoqda…');
    try {
      const sdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const authSdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const storeSdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const config = {
        apiKey: 'AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY',
        authDomain: 'islamicofficial-9279f.firebaseapp.com',
        projectId: 'islamicofficial-9279f',
        storageBucket: 'islamicofficial-9279f.firebasestorage.app',
        messagingSenderId: '251823878076',
        appId: '1:251823878076:web:9eff3e9b8b01f6f827c5b9'
      };
      const app = sdk.getApps().find(item => item.options.projectId === config.projectId) || sdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      window.islamicFirestore = { db: storeSdk.getFirestore(app), ...storeSdk };
      if (window.islamicSiteAccount.user) {
        await authSdk.signOut(auth);
      } else {
        const provider = new authSdk.GoogleAuthProvider();
        provider.addScope('email');
        provider.setCustomParameters({ prompt: 'select_account' });
        await authSdk.signInWithPopup(auth, provider);
      }
      accountStatus.textContent = '';
    } catch (error) {
      console.error('Could not sign in to the personal account:', error);
      accountStatus.textContent = localize('Kirish amalga oshmadi. Firebase ruxsatlari va internetni tekshiring.');
    } finally {
      accountButton.disabled = false;
      updateAccountLabel();
    }
  });
  (async () => {
    try {
      const sdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js');
      const authSdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js');
      const storeSdk = await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const config = {
        apiKey: 'AIzaSyDy9LPiiHgeXY8B6dCu0x-No6Xf__CJIqY',
        authDomain: 'islamicofficial-9279f.firebaseapp.com',
        projectId: 'islamicofficial-9279f',
        storageBucket: 'islamicofficial-9279f.firebasestorage.app',
        messagingSenderId: '251823878076',
        appId: '1:251823878076:web:9eff3e9b8b01f6f827c5b9'
      };
      const app = sdk.getApps().find(item => item.options.projectId === config.projectId) || sdk.initializeApp(config);
      const auth = authSdk.getAuth(app);
      window.islamicFirestore = { db: storeSdk.getFirestore(app), ...storeSdk };
      authSdk.onAuthStateChanged(auth, user => {
        window.islamicSiteAccount.user = user;
        updateAccountLabel();
        window.dispatchEvent(new CustomEvent('islamic-account-changed', { detail: { user } }));
      }, error => {
        console.error('Could not observe personal account state:', error);
        accountStatus.textContent = localize('Akkaunt holatini tekshirib bo‘lmadi.');
      });
    } catch (error) {
      console.error('Could not initialize personal account:', error);
      accountButton.disabled = true;
      accountStatus.textContent = localize('Google hisobi hozircha mavjud emas.');
    }
  })();

  const selector = document.createElement('select');
  selector.className = 'site-language-select';
  selector.setAttribute('aria-label', 'Tilni tanlang');
  selector.title = 'Tilni tanlang';
  selector.innerHTML = languages.map(language => `<option value="${language.code}">${language.label}</option>`).join('');
  if (header) header.append(selector);
  const styles = document.createElement('style');
  styles.textContent = '.site-language-select{min-height:38px;max-width:142px;padding:.4rem .65rem;border:1px solid currentColor;border-radius:10px;background:transparent;color:inherit;font-family:inherit;font-size:.78rem;font-weight:600}.site-language-select option{background:#fff;color:#24362d}.site-account-controls{display:flex;align-items:center;gap:.4rem}.site-account-button{min-height:38px;max-width:190px;padding:.4rem .65rem;border:1px solid currentColor;border-radius:10px;background:transparent;color:inherit;font-family:inherit;font-size:.73rem;font-weight:600;cursor:pointer}.site-account-button:disabled{opacity:.55}.site-account-status{max-width:160px;overflow:hidden;font-size:.65rem;text-overflow:ellipsis;white-space:nowrap}@media(max-width:820px){.topbar .site-language-select{max-width:118px;margin-left:auto}.site-account-status{display:none}.site-account-button{max-width:145px;font-size:.65rem}}';
  document.head.append(styles);
  selector.addEventListener('change', () => setLanguage(selector.value));

  try {
    const saved = localStorage.getItem('islamic-site-locale');
    if (supported.has(saved)) currentLanguage = saved;
  } catch (error) {
    console.error('Could not read site language preference:', error);
  }
  selector.value = currentLanguage;
  translateTree();
  setLanguage(currentLanguage);
  new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateTextNode(record.target);
      else record.addedNodes.forEach(node => translateTree(node));
    });
  }).observe(document.body, { subtree: true, childList: true, characterData: true });
})();
