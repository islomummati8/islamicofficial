(() => {
  const form = document.getElementById('inheritance-form');
  const spouseSelect = document.getElementById('spouse');
  const wivesWrap = document.getElementById('wives-wrap');
  const number = id => Number(document.getElementById(id).value || 0);
  const checked = id => document.getElementById(id).checked;
  const fraction = value => {
    const known = new Map([[0.5, '1/2'], [1 / 3, '1/3'], [1 / 4, '1/4'], [1 / 6, '1/6'], [1 / 8, '1/8'], [2 / 3, '2/3']]);
    return known.get(value) || `${(value * 100).toFixed(2)}%`;
  };
  const currencyFormat = value => new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: document.getElementById('currency').value,
    maximumFractionDigits: 2
  }).format(value);
  spouseSelect.addEventListener('change', () => {
    wivesWrap.hidden = spouseSelect.value !== 'wife';
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const error = document.getElementById('form-error');
    const summary = document.getElementById('result-summary');
    const list = document.getElementById('share-list');
    const unallocated = document.getElementById('unallocated');
    const print = document.getElementById('print-button');
    error.textContent = '';
    list.replaceChildren();
    unallocated.textContent = '';
    print.disabled = true;
    const estate = number('estate');
    const sons = number('sons');
    const daughters = number('daughters');
    const siblings = number('siblings');
    const wives = number('wives');
    if (!Number.isFinite(estate) || estate <= 0 || ![sons, daughters, siblings, wives].every(Number.isInteger)
      || [sons, daughters, siblings].some(value => value < 0 || value > 50)
      || (spouseSelect.value === 'wife' && (wives < 1 || wives > 4))) {
      error.textContent = 'Meros summasini musbat, qarindoshlar sonini esa to‘g‘ri butun sonda kiriting.';
      summary.textContent = 'Kiritilgan qiymatlarni tekshiring.';
      return;
    }
    const father = checked('father');
    const mother = checked('mother');
    const children = sons + daughters > 0;
    if (checked('other-heirs')) {
      error.textContent = 'Boshqa merosxo‘rlar borligi sababli bu soddalashtirilgan kalkulyator hisoblamaydi. Barcha qarindoshlarni sanab, faraiz mutaxassisiga murojaat qiling.';
      summary.textContent = 'Mutaxassis tekshiruvi zarur.';
      return;
    }
    if (!checked('confirm-core-heirs')) {
      error.textContent = 'Davom etishdan oldin yuqorida sanalganlardan boshqa merosxo‘r yo‘qligini tasdiqlang; aks holda mutaxassisga murojaat qiling.';
      summary.textContent = 'Merosxo‘rlar tarkibini tasdiqlash kerak.';
      return;
    }
    if (siblings > 0 && !father) {
      error.textContent = 'Ota tirik bo‘lmagan holatda aka-uka va opa-singillarning turi va holati ulushni o‘zgartirishi mumkin. Bu kalkulyatorda ushbu holat hisoblanmaydi.';
      summary.textContent = 'Mutaxassis tekshiruvi zarur.';
      return;
    }
    if (![father, mother, children, spouseSelect.value !== 'none'].some(Boolean)) {
      error.textContent = 'Kamida bitta merosxo‘r tirikligini belgilang; boshqa merosxo‘r bo‘lsa, yuqoridagi bandni tanlang.';
      summary.textContent = 'Merosxo‘r ko‘rsatilmagan.';
      return;
    }

    const spouse = spouseSelect.value;
    const spouseShare = spouse === 'husband' ? (children ? 1 / 4 : 1 / 2)
      : spouse === 'wife' ? (children ? 1 / 8 : 1 / 4) : 0;
    const fixed = [];
    if (spouseShare) fixed.push({ key: 'spouse', share: spouseShare });
    let motherShare = 0;
    if (mother) {
      const hasTwoSiblings = siblings >= 2;
      if (children || hasTwoSiblings) motherShare = 1 / 6;
      else if (father && spouse !== 'none') motherShare = (1 - spouseShare) / 3;
      else motherShare = 1 / 3;
      fixed.push({ key: 'mother', share: motherShare });
    }
    let fatherShare = 0;
    if (father && children) {
      fatherShare = 1 / 6;
      fixed.push({ key: 'father', share: fatherShare });
    }
    if (sons === 0 && daughters > 0) {
      fixed.push({ key: 'daughters', share: daughters === 1 ? 1 / 2 : 2 / 3 });
    }
    const fixedTotal = fixed.reduce((total, heir) => total + heir.share, 0);
    let shares;
    let remaining;
    if (fixedTotal > 1) {
      const scale = 1 / fixedTotal;
      shares = fixed.map(heir => ({ ...heir, share: heir.share * scale }));
      remaining = 0;
    } else {
      shares = fixed;
      remaining = 1 - fixedTotal;
      if (father && !sons) {
        const item = shares.find(heir => heir.key === 'father');
        if (item) item.share += remaining;
        else shares.push({ key: 'father', share: remaining });
        remaining = 0;
      } else if (sons > 0) {
        const childWeight = sons * 2 + daughters;
        shares.push({ key: 'sons', share: remaining * sons * 2 / childWeight });
        if (daughters > 0) shares.push({ key: 'daughters', share: remaining * daughters / childWeight });
        remaining = 0;
      } else if (daughters > 0) {
        const eligible = shares.filter(heir => heir.key !== 'spouse');
        const eligibleTotal = eligible.reduce((total, heir) => total + heir.share, 0);
        if (eligibleTotal > 0) {
          shares = shares.map(heir => ({
            ...heir,
            share: heir.key === 'spouse' ? heir.share : heir.share + remaining * heir.share / eligibleTotal
          }));
          remaining = 0;
        }
      } else if (mother && remaining > 0) {
        const item = shares.find(heir => heir.key === 'mother');
        item.share += remaining;
        remaining = 0;
      }
    }

    const labels = {
      spouse: spouse === 'husband' ? 'Eri' : 'Xotin(lar)',
      mother: 'Onasi',
      father: 'Otasi',
      sons: 'O‘g‘illari jami',
      daughters: 'Qizlari jami'
    };
    const rows = shares.filter(heir => heir.share > 0).map(heir => {
      const amount = estate * heir.share;
      let perPerson = '';
      if (heir.key === 'sons') perPerson = ` · har bir o‘g‘il: ${currencyFormat(amount / sons)}`;
      if (heir.key === 'daughters') perPerson = ` · har bir qiz: ${currencyFormat(amount / daughters)}`;
      if (heir.key === 'spouse' && spouse === 'wife' && wives > 1) perPerson = ` · har bir xotinga: ${currencyFormat(amount / wives)}`;
      return { title: labels[heir.key], share: heir.share, amount, perPerson };
    });
    for (const row of rows) {
      const line = document.createElement('div');
      line.className = 'share-row';
      const title = document.createElement('span');
      title.textContent = row.title;
      const amount = document.createElement('strong');
      amount.textContent = `${fraction(row.share)} · ${currencyFormat(row.amount)}`;
      const detail = document.createElement('small');
      detail.textContent = row.perPerson;
      amount.append(detail);
      line.append(title, amount);
      list.append(line);
    }
    summary.textContent = fixedTotal > 1
      ? 'Ulushlar yig‘indisi 1 dan oshgani uchun awl asosida mutanosib kamaytirildi. Mutaxassis bilan tekshiring.'
      : 'Soddalashtirilgan ulushlar hisoblandi. Natijani mutaxassis bilan tekshiring.';
    if (remaining > 1e-8) unallocated.textContent = `Ushbu hisob qamrab olmagan qoldiq: ${currencyFormat(estate * remaining)}. Uni kimga berishni kalkulyator belgilamaydi.`;
    print.disabled = false;
  });
  document.getElementById('print-button').addEventListener('click', () => window.print());
  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('meros-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
  if (localStorage.getItem('meros-theme') === 'dark') document.body.classList.add('dark');
})();
