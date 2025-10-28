import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// Convert language-mermaid code blocks to mermaid class
document.querySelectorAll('pre.language-mermaid, code.language-mermaid').forEach(el => {
  const pre = el.tagName === 'PRE' ? el : el.parentElement;
  const code = pre.querySelector('code') || el;

  // Extract the text content (remove prism spans if any)
  const mermaidCode = code.textContent;

  // Replace the code block with a mermaid div
  const mermaidDiv = document.createElement('div');
  mermaidDiv.className = 'mermaid';
  mermaidDiv.textContent = mermaidCode;
  // Store original code for theme switching
  mermaidDiv.setAttribute('data-mermaid-original', mermaidCode);
  pre.replaceWith(mermaidDiv);
});

// Initialize mermaid with theme support
const currentTheme = document.documentElement.getAttribute('data-theme');
mermaid.initialize({
  startOnLoad: true,
  theme: currentTheme === 'light' || currentTheme === 'light-blue' ? 'default' : 'dark'
});

// Re-render mermaid diagrams when theme changes
window.addEventListener('themeChanged', async (e) => {
  const newTheme = e.detail.theme === 'light' || e.detail.theme === 'light-blue' ? 'default' : 'dark';

  // Reinitialize mermaid with new theme
  mermaid.initialize({
    startOnLoad: false,
    theme: newTheme
  });

  // Re-render each diagram
  const diagrams = document.querySelectorAll('.mermaid');
  for (const el of diagrams) {
    const originalCode = el.getAttribute('data-mermaid-original');
    if (originalCode) {
      // Clear the element and restore original code
      el.innerHTML = '';
      el.textContent = originalCode;
      el.removeAttribute('data-processed');

      // Render with new theme
      try {
        await mermaid.run({ nodes: [el] });
      } catch (err) {
        console.error('Mermaid re-render error:', err);
      }
    }
  }
});