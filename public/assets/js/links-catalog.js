(() => {
  const grid = document.getElementById('web-services-grid');
  const search = document.getElementById('service-search');
  const categories = document.getElementById('service-categories');
  const count = document.getElementById('service-count');
  if (!grid || !search || !categories || !count) return;

  const categoryByUrl = [
    [/books\.islamicofficial\.com/i, 'pdf'],
    [/valyuta\.islamicofficial\.com/i, 'valyuta'],
    [/tools\.islamicofficial\.com/i, 'tools'],
    [/islamicofficial-ibadat\.web\.app/i, 'zikr'],
    [/islamicofficial-quran\.web\.app/i, 'quran'],
    [/islamicofficial-tajweed\.web\.app/i, 'tajweed'],
    [/islamicofficial-finance\.web\.app/i, 'zakat'],
    [/islamicofficial-meros\.web\.app/i, 'meros'],
    [/islamicofficial-audio\.web\.app/i, 'audio'],
    [/islamicofficial-kids\.web\.app/i, 'kids'],
    [/islamicofficial-zikr\.web\.app/i, 'zikr']
  ];
  let activeCategory = 'all';
  const cards = [...grid.querySelectorAll('.app-launch-card')].map(card => {
    const url = card.querySelector('.app-launch-actions a')?.href || '';
    const category = categoryByUrl.find(([pattern]) => pattern.test(url))?.[1] || 'apps';
    card.dataset.category = category;
    return card;
  });

  const empty = document.createElement('p');
  empty.className = 'service-empty';
  empty.hidden = true;
  empty.textContent = 'Qidiruv bo‘yicha xizmat topilmadi. Boshqa so‘z yoki guruhni tanlang.';
  grid.append(empty);

  function normalize(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[ʻʼ’‘`]/g, "'")
      .toLocaleLowerCase()
      .trim();
  }

  function filterServices() {
    const query = normalize(search.value);
    let visibleCount = 0;
    cards.forEach(card => {
      const matchesCategory = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matchesQuery = !query || normalize(card.textContent).includes(query);
      const visible = matchesCategory && matchesQuery;
      card.closest('.col-md-6').hidden = !visible;
      if (visible) visibleCount += 1;
    });
    count.textContent = `${visibleCount} ta xizmat`;
    empty.hidden = visibleCount > 0;
  }

  categories.addEventListener('click', event => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    categories.querySelectorAll('[data-category]').forEach(item => {
      item.setAttribute('aria-pressed', String(item === button));
    });
    filterServices();
  });
  search.addEventListener('input', filterServices);
  filterServices();
})();
