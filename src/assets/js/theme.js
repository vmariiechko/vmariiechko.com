const themes = {
  dark: {
    code: 'darcula',
    giscus: 'dark',
  },
  light: {
    code: 'one-light',
    giscus: 'light',
  },
};

const codeThemeLink = document.getElementById('code-theme');

function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);

  const themeConfig = themes[themeName];
  if (!themeConfig) return;

  // Update code block theme
  if (codeThemeLink && themeConfig.code) {
    codeThemeLink.href = `/assets/css/vendors/prism-${themeConfig.code}.css`;
  }

  // Update giscus theme
  const giscusIframe = document.querySelector('iframe.giscus-frame');
  if (giscusIframe && themeConfig.giscus) {
    giscusIframe.contentWindow.postMessage({ giscus: { setConfig: { theme: themeConfig.giscus } } }, 'https://giscus.app');
  }
}

function getInitialTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme && themes[savedTheme]) {
    return savedTheme;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function setTheme(themeName) {
  if (!themes[themeName]) {
    console.warn(`Theme "${themeName}" not found.`);
    return;
  }
  applyTheme(themeName);
  localStorage.setItem('theme', themeName);
}

// Make setTheme globally accessible for the UI
window.setTheme = setTheme;

// Apply initial theme without waiting for the full DOM to load
// This is handled by the inline script in <head> to prevent FOUC.
// The full script can handle more complex logic if needed later.
document.addEventListener('DOMContentLoaded', () => {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme);

  // Set the dropdown to the current theme
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    themeSelector.value = initialTheme;
  }
});
