document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  const iconOpen = toggle.querySelector('.nav-icon-open');
  const iconClose = toggle.querySelector('.nav-icon-close');

  function openMenu() {
    menu.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close menu');
    if (iconOpen) iconOpen.style.display = 'none';
    if (iconClose) iconClose.style.display = '';
    // Lock body scroll (matches search modal behavior)
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    if (iconOpen) iconOpen.style.display = '';
    if (iconClose) iconClose.style.display = 'none';
    // Restore body scroll
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  // Close on backdrop click (clicking outside the card)
  const backdrop = menu.querySelector('.nav-menu-backdrop');
  if (backdrop) {
    backdrop.addEventListener('click', () => closeMenu());
  }

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });
});
