(() => {
  const form = document.getElementById('zakat-form');
  const method = document.getElementById('nisab-method');
  const currency = document.getElementById('currency');
  const price = document.getElementById('gram-price');
  const nisabInput = document.getElementById('nisab');
  const priceWrap = document.getElementById('gram-price-wrap');
  const help = document.getElementById('nisab-help');
  const format = value => new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 2 }).format(value);
  const nisabValue = () => {
    if (method.value === 'manual') return Number(nisabInput.value);
    const grams = method.value === 'gold' ? 85 : 595;
    return Number(price.value) * grams;
  };
  const updateNisab = () => {
    const metalMode = method.value !== 'manual';
    priceWrap.hidden = !metalMode;
    nisabInput.readOnly = metalMode;
    nisabInput.value = metalMode && Number(price.value) > 0 ? String(nisabValue()) : (metalMode ? '' : nisabInput.value);
    nisabInput.placeholder = metalMode ? 'Gram narxidan avtomatik hisoblanadi' : 'Mahalliy narx asosida kiriting';
    help.textContent = method.value === 'gold'
      ? 'Oltinning 1 gramm narxini kiriting. Nisob — 85 gramm oltin qiymati.'
      : method.value === 'silver'
        ? 'Kumushning 1 gramm narxini kiriting. Nisob — 595 gramm kumush qiymati.'
        : 'Tanlagan ishonchli manbangizdagi nisob qiymatini hisob valyutasida kiriting.';
    document.querySelectorAll('.currency-label').forEach(label => { label.textContent = currency.value; });
    calculate();
  };
  const calculate = () => {
    const values = Object.fromEntries(new FormData(form).entries());
    const amount = key => Number(values[key] || 0);
    const nisab = nisabValue();
    const enteredAmounts = ['cash', 'metals', 'trade', 'receivables', 'debts'].map(amount);
    const net = Math.max(0, enteredAmounts[0] + enteredAmounts[1] + enteredAmounts[2] + enteredAmounts[3] - enteredAmounts[4]);
    const rate = Number(document.getElementById('rate').value);
    document.getElementById('net-assets').textContent = `${format(net)} ${currency.value}`;
    document.getElementById('nisab-result').textContent = nisab > 0 ? `${format(nisab)} ${currency.value}` : 'Kiritilmagan';
    document.getElementById('form-error').textContent = '';
    if (!Number.isFinite(rate) || rate <= 0 || rate > 100 || enteredAmounts.some(value => !Number.isFinite(value) || value < 0)
      || !Number.isFinite(net) || !Number.isFinite(nisab) || nisab < 0 || (method.value !== 'manual' && Number(price.value) < 0)) {
      document.getElementById('form-error').textContent = 'Iltimos, barcha summalarni to‘g‘ri musbat sonlarda kiriting.';
      document.getElementById('zakat-due').textContent = 'Tekshirish kerak';
      document.getElementById('result-message').textContent = 'Kiritilgan qiymatlar yaroqsiz.';
      return;
    }
    if (nisab <= 0) {
      document.getElementById('zakat-due').textContent = 'Nisob kiriting';
      document.getElementById('result-message').textContent = 'Avval amaldagi nisob qiymati yoki metall narxini kiriting.';
    } else if (net < nisab) {
      document.getElementById('zakat-due').textContent = `0 ${currency.value}`;
      document.getElementById('result-message').textContent = 'Kiritilgan sof mol-mulk tanlangan nisob qiymatiga yetmadi.';
    } else if (!document.getElementById('haul').checked) {
      document.getElementById('zakat-due').textContent = `— ${currency.value}`;
      document.getElementById('result-message').textContent = 'Sof mol-mulk nisobga yetadi. Zakot yili va boshqa shartlarni olim bilan aniqlang; yillik shart tasdiqlanmaguncha miqdorni zakot deb belgilamaymiz.';
    } else {
      document.getElementById('zakat-due').textContent = `${format(net * rate / 100)} ${currency.value}`;
      document.getElementById('result-message').textContent = `Kiritilgan ${rate}% stavka bo‘yicha taxminiy miqdor.`;
    }
  };
  method.addEventListener('change', updateNisab);
  currency.addEventListener('change', updateNisab);
  price.addEventListener('input', updateNisab);
  form.addEventListener('input', calculate);
  form.addEventListener('submit', event => { event.preventDefault(); calculate(); });
  updateNisab();

  document.getElementById('theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('finance-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  });
  if (localStorage.getItem('finance-theme') === 'dark') document.body.classList.add('dark');
})();
