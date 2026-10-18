document.querySelectorAll('[data-portal-menu-toggle]').forEach((button) => {
  const menu = document.getElementById(button.getAttribute('aria-controls'));
  if (!menu) return;

  button.addEventListener('click', () => {
    const isOpen = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!isOpen));
    button.setAttribute('aria-label', isOpen ? 'Menyuni ochish' : 'Menyuni yopish');
    menu.classList.toggle('is-open', !isOpen);
  });

  menu.addEventListener('click', (event) => {
    if (!event.target.closest('a')) return;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Menyuni ochish');
    menu.classList.remove('is-open');
  });
});
