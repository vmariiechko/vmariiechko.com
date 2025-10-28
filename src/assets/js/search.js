// Search modal functionality
let pagefindUI = null;

function openSearch() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;

  modal.setAttribute('aria-hidden', 'false');

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  document.body.style.paddingRight = (window.innerWidth - document.documentElement.clientWidth) + 'px';

  // Initialize Pagefind UI on first open
  if (!pagefindUI && window.PagefindUI) {
    pagefindUI = new PagefindUI({
      element: '#search-container',
      showSubResults: true,
      autofocus: true
    });
  }

  // Focus the search input after a brief delay
  setTimeout(() => {
    const searchInput = modal.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.focus();
    }
  }, 150);
}

function closeSearch() {
  const modal = document.getElementById('search-modal');
  if (!modal) return;

  modal.setAttribute('aria-hidden', 'true');

  // Restore body scroll
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

// Initialize event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('search-toggle');
  const backdrop = document.getElementById('search-backdrop');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeSearch);
  }

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('search-modal');
    if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') {
      closeSearch();
    }
  });
});

