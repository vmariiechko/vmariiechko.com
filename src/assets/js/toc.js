// Table of Contents toggle functionality
// Note: Initial state is applied inline to prevent animation flash

document.addEventListener('DOMContentLoaded', () => {
  const tocSidebar = document.getElementById('toc-sidebar');
  const tocToggle = document.getElementById('toc-toggle');
  const tocShowButton = document.getElementById('toc-show-button');

  if (!tocSidebar || !tocToggle || !tocShowButton) return;

  const postContent = document.querySelector('.post-content');

  // Set initial aria-expanded based on current state
  const isHidden = tocSidebar.classList.contains('toc-hidden');
  tocToggle.setAttribute('aria-expanded', !isHidden);
  // Fallback: ensure toc-expanded matches toc-hidden on load
  if (isHidden && postContent) postContent.classList.add('toc-expanded');

  // Hide toggle functionality
  tocToggle.addEventListener('click', () => {
    tocSidebar.classList.add('toc-hidden');
    tocToggle.setAttribute('aria-expanded', 'false');
    localStorage.setItem('tocHidden', 'true');
    if (postContent) postContent.classList.add('toc-expanded');
  });

  // Show toggle functionality
  tocShowButton.addEventListener('click', () => {
    tocSidebar.classList.remove('toc-hidden');
    tocToggle.setAttribute('aria-expanded', 'true');
    localStorage.setItem('tocHidden', 'false');
    if (postContent) postContent.classList.remove('toc-expanded');
  });

  // Footer avoidance: adjust sidebar bottom when footer enters viewport
  const footer = document.querySelector('footer');
  if (footer) {
    function updateSidebarBottom() {
      if (tocSidebar.classList.contains('toc-hidden')) return;
      const footerTop = footer.getBoundingClientRect().top;
      const gap = 16; // px gap above footer
      if (footerTop < window.innerHeight) {
        tocSidebar.style.bottom = Math.max(0, window.innerHeight - footerTop + gap) + 'px';
      } else {
        tocSidebar.style.bottom = '';
      }
    }
    window.addEventListener('scroll', updateSidebarBottom, { passive: true });
    window.addEventListener('resize', updateSidebarBottom, { passive: true });
    updateSidebarBottom();
  }

  // Scroll-following highlight
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = document.querySelectorAll(
    '.post-content h2[id], .post-content h3[id], .post-content h4[id]',
  );

  if (tocLinks.length === 0 || headings.length === 0) return;

  const visibleHeadings = new Map();
  let lastActiveId = null;

  function activateLink(id) {
    if (id === lastActiveId) return;
    lastActiveId = id;

    tocLinks.forEach((link) => link.classList.remove('toc-link-active'));

    const activeLink = document.querySelector(
      '.toc-link[href="#' + CSS.escape(id) + '"]',
    );
    if (activeLink) {
      activeLink.classList.add('toc-link-active');
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          visibleHeadings.set(id, entry.boundingClientRect.top);
        } else {
          visibleHeadings.delete(id);
        }
      });

      if (visibleHeadings.size === 0) return;

      // Find the heading closest to the top of the viewport
      let activeId = null;
      let closestTop = Infinity;

      visibleHeadings.forEach((top, id) => {
        if (Math.abs(top) < Math.abs(closestTop)) {
          closestTop = top;
          activeId = id;
        }
      });

      if (activeId) {
        activateLink(activeId);
      }
    },
    {
      rootMargin: '-80px 0px -70% 0px',
      threshold: 0,
    },
  );

  headings.forEach((heading) => observer.observe(heading));

  // Handle page load with #hash
  if (location.hash) {
    const hashId = decodeURIComponent(location.hash.slice(1));
    const matchingHeading = document.getElementById(hashId);
    if (matchingHeading) {
      activateLink(hashId);
    }
  }
});
