// Client-side tag filtering for list pages
document.addEventListener('DOMContentLoaded', () => {
  const filterBar = document.querySelector('.tag-filter-bar');
  if (!filterBar) return;

  const buttons = filterBar.querySelectorAll('.tag-filter-btn');
  const listItems = document.querySelectorAll('[data-tags]');
  const paginationNav = document.querySelector('.pagination-nav');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tag = btn.getAttribute('data-filter-tag');

      // Update active state
      buttons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Filter items
      if (tag === 'all') {
        listItems.forEach(item => { item.style.display = ''; });
        if (paginationNav) paginationNav.style.display = '';
      } else {
        listItems.forEach(item => {
          try {
            const tags = JSON.parse(item.getAttribute('data-tags'));
            item.style.display = tags.includes(tag) ? '' : 'none';
          } catch {
            item.style.display = 'none';
          }
        });
        // Hide pagination when filtering
        if (paginationNav) paginationNav.style.display = 'none';
      }
    });
  });
});
