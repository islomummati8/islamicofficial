(() => {
  const catalog = [
    {
      id: 'subhanallah',
      category: 'dhikr',
      arabic: 'سُبْحَانَ اللهِ',
      latin: 'Subhanalloh',
      meaning: 'Alloh barcha nuqsonlardan pokdir.',
      source: 'Zikr iborasi'
    },
    {
      id: 'alhamdulillah',
      category: 'dhikr',
      arabic: 'الْحَمْدُ لِلَّهِ',
      latin: 'Alhamdulillah',
      meaning: 'Hamd va shukr Allohgadir.',
      source: 'Zikr iborasi'
    },
    {
      id: 'allahuakbar',
      category: 'dhikr',
      arabic: 'اللهُ أَكْبَرُ',
      latin: 'Allohu akbar',
      meaning: 'Alloh ulug‘dir.',
      source: 'Zikr iborasi'
    },
    {
      id: 'astaghfirullah',
      category: 'dhikr',
      arabic: 'أَسْتَغْفِرُ اللهَ',
      latin: 'Astag‘firulloh',
      meaning: 'Allohdan mag‘firat so‘rayman.',
      source: 'Zikr iborasi'
    },
    {
      id: 'rabbi-zidni-ilma',
      category: 'dua',
      arabic: 'رَبِّ زِدْنِي عِلْمًا',
      latin: 'Rabbi zidnī ʿilmā',
      meaning: 'Ey Rabbim, ilmimni ziyoda qil.',
      source: 'Qur’on, Toha surasi, 20:114'
    },
    {
      id: 'rabbi-ishrah-li-sadri',
      category: 'dua',
      arabic: 'رَبِّ ٱشْرَحْ لِي صَدْرِي ۝ وَيَسِّرْ لِيٓ أَمْرِي',
      latin: 'Rabbi-shraḥ lī ṣadrī, wa yassir lī amrī',
      meaning: 'Ey Rabbim, ko‘ksimni keng qil va ishimni oson qil.',
      source: 'Qur’on, Toha surasi, 20:25–26'
    },
    {
      id: 'rabbi-inni-lima-anzalta',
      category: 'dua',
      arabic: 'رَبِّ إِنِّي لِمَآ أَنزَلْتَ إِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
      latin: 'Rabbi innī limā anzalta ilayya min khayrin faqīr',
      meaning: 'Ey Rabbim, menga nozil qiladigan har qanday yaxshiligingga muhtojman.',
      source: 'Qur’on, Qasas surasi, 28:24'
    },
    {
      id: 'rabbana-atina',
      category: 'dua',
      arabic: 'رَبَّنَآ ءَاتِنَا فِي ٱلدُّنْيَا حَسَنَةً وَفِي ٱلْـَٔاخِرَةِ حَسَنَةً وَقِنَا عَذَابَ ٱلنَّارِ',
      latin: 'Rabbanā ātinā fid-dunyā ḥasanatan wa fil-ākhirati ḥasanatan wa qinā ʿadhāban-nār',
      meaning: 'Ey Rabbimiz, bizga dunyoda ham, oxiratda ham yaxshilik ato et va bizni do‘zax azobidan asra.',
      source: 'Qur’on, Baqara surasi, 2:201'
    },
    {
      id: 'rabbighfir-li-wa-liwalidayya',
      category: 'dua',
      arabic: 'رَبَّنَا ٱغْفِرْ لِي وَلِوَٰلِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ ٱلْحِسَابُ',
      latin: 'Rabbanā-ghfir lī wa li-wālidayya wa lil-mu’minīna yawma yaqūmul-ḥisāb',
      meaning: 'Ey Rabbimiz, hisob kuni meni, ota-onamni va mo‘minlarni mag‘firat qil.',
      source: 'Qur’on, Ibrohim surasi, 14:41'
    }
  ];

  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  if (typeof window !== 'undefined') window.ISLAMIC_ZIKR_CATALOG = catalog;
})();
