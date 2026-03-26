import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';

// Convert language-mermaid code blocks to mermaid class
document.querySelectorAll('pre.language-mermaid, code.language-mermaid').forEach(el => {
  const pre = el.tagName === 'PRE' ? el : el.parentElement;
  const code = pre.querySelector('code') || el;

  const mermaidCode = code.textContent;
  const mermaidDiv = document.createElement('div');
  mermaidDiv.className = 'mermaid';
  mermaidDiv.textContent = mermaidCode;
  mermaidDiv.setAttribute('data-mermaid-original', mermaidCode);
  pre.replaceWith(mermaidDiv);
});

/**
 * Theme-specific Mermaid themeVariables.
 *
 * themeVariables only work with theme: 'base'. The base theme starts from a
 * neutral palette and applies only what we specify, giving full control over
 * node and diagram colors across all 4 site themes.
 *
 * primaryColor        → node fill background
 * primaryBorderColor  → node stroke
 * primaryTextColor    → node text and foreignObject label color
 * secondaryColor      → secondary node fill (same as primary for uniformity)
 * tertiaryColor       → tertiary node fill (same as primary for uniformity)
 * clusterBkg          → subgraph background
 * clusterBorder       → subgraph border
 * titleColor          → subgraph title text
 * lineColor           → edge/arrow color
 * edgeLabelBackground → edge label background pill
 */
const MERMAID_THEME_VARS = {
  dark: {
    primaryColor: '#2a2d35',
    primaryBorderColor: '#4a5568',
    primaryTextColor: '#e4e9f2',
    secondaryColor: '#2a2d35',
    tertiaryColor: '#2a2d35',
    clusterBkg: '#20242a',
    clusterBorder: '#3a404a',
    titleColor: '#b0bad0',
    lineColor: '#8b94a8',
    edgeLabelBackground: '#1b1b1f',
  },
  'dark-blue': {
    primaryColor: '#28282f',
    primaryBorderColor: '#4a4a55',
    primaryTextColor: '#e8eaf0',
    secondaryColor: '#28282f',
    tertiaryColor: '#28282f',
    clusterBkg: '#1e1e25',
    clusterBorder: '#35353f',
    titleColor: '#adb3bf',
    lineColor: '#8b94a8',
    edgeLabelBackground: '#1b1b1f',
  },
  light: {
    primaryColor: '#f7f7f7',
    primaryBorderColor: '#94a3b8',
    primaryTextColor: '#1a202c',
    secondaryColor: '#f7f7f7',
    tertiaryColor: '#f7f7f7',
    clusterBkg: '#eef2f7',
    clusterBorder: '#cbd5e0',
    titleColor: '#374151',
    lineColor: '#64748b',
    edgeLabelBackground: '#f5f8fb',
  },
  'light-blue': {
    primaryColor: '#f0f4f8',
    primaryBorderColor: '#94a3b8',
    primaryTextColor: '#0f172a',
    secondaryColor: '#f0f4f8',
    tertiaryColor: '#f0f4f8',
    clusterBkg: '#e8edf5',
    clusterBorder: '#c8d5e5',
    titleColor: '#374151',
    lineColor: '#64748b',
    edgeLabelBackground: '#f7f9fc',
  },
};

function getMermaidConfig(themeName) {
  return {
    startOnLoad: false,
    theme: 'base',
    themeVariables: MERMAID_THEME_VARS[themeName] ?? MERMAID_THEME_VARS.dark,
  };
}

// Initialize and render on page load
const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
mermaid.initialize(getMermaidConfig(currentTheme));

const diagramEls = document.querySelectorAll('.mermaid');
if (diagramEls.length > 0) {
  (async () => {
    for (const el of diagramEls) {
      try {
        await mermaid.run({ nodes: [el] });
      } catch (err) {
        console.error('Mermaid render error:', err);
      }
    }
  })();
}

// Re-render on theme switch
window.addEventListener('themeChanged', async (e) => {
  const newTheme = e.detail.theme || 'dark';
  mermaid.initialize(getMermaidConfig(newTheme));

  const diagrams = document.querySelectorAll('.mermaid');
  for (const el of diagrams) {
    const originalCode = el.getAttribute('data-mermaid-original');
    if (originalCode) {
      el.innerHTML = '';
      el.textContent = originalCode;
      el.removeAttribute('data-processed');
      try {
        await mermaid.run({ nodes: [el] });
      } catch (err) {
        console.error('Mermaid re-render error:', err);
      }
    }
  }
});
