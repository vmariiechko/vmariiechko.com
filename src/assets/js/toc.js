// Table of Contents toggle functionality
// Note: Initial state is applied inline to prevent animation flash

document.addEventListener('DOMContentLoaded', () => {
  const tocSidebar = document.getElementById('toc-sidebar');
  const tocToggle = document.getElementById('toc-toggle');
  const tocShowButton = document.getElementById('toc-show-button');

  if (!tocSidebar || !tocToggle || !tocShowButton) return;

  // Set initial aria-expanded based on current state
  const isHidden = tocSidebar.classList.contains('toc-hidden');
  tocToggle.setAttribute('aria-expanded', !isHidden);

  // Hide toggle functionality
  tocToggle.addEventListener('click', () => {
    tocSidebar.classList.add('toc-hidden');
    tocToggle.setAttribute('aria-expanded', 'false');
    localStorage.setItem('tocHidden', 'true');
  });

  // Show toggle functionality
  tocShowButton.addEventListener('click', () => {
    tocSidebar.classList.remove('toc-hidden');
    tocToggle.setAttribute('aria-expanded', 'true');
    localStorage.setItem('tocHidden', 'false');
  });
});

