const themes = window.THEME_CONFIG || {};

const codeThemeLink = document.getElementById("code-theme");
const media = window.matchMedia("(prefers-color-scheme: dark)");

function getEffectiveTheme(themeName) {
  if (themeName === "system") {
    return media.matches ? "dark" : "light";
  }
  return themeName;
}

function applyTheme(themeName) {
  const effectiveTheme = getEffectiveTheme(themeName);
  const cfg = themes[effectiveTheme];

  document.documentElement.setAttribute("data-theme", effectiveTheme);

  if (codeThemeLink && cfg?.code) {
    codeThemeLink.href = `/assets/css/vendors/prism-${cfg.code}.css`;
  }

  // Update giscus theme
  const frame = document.querySelector("iframe.giscus-frame");
  if (frame) {
    frame.contentWindow?.postMessage(
      { giscus: { setConfig: { theme: cfg?.giscus || effectiveTheme } } },
      "https://giscus.app"
    );
  }

  // Mark active button in the palette (if present)
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.setAttribute("aria-checked", btn.dataset.themeChoice === themeName);
  });

  // Update toggle button state (if present)
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const isDark = getEffectiveTheme(themeName) === 'dark';
    toggle.querySelector('.sun').style.display = isDark ? 'none' : 'block';
    toggle.querySelector('.moon').style.display = isDark ? 'block' : 'none';
  }

  // Dispatch theme change event for external listeners (e.g., Mermaid)
  window.dispatchEvent(new CustomEvent('themeChanged', {
    detail: { theme: effectiveTheme }
  }));
}

function getInitialTheme() {
  const saved = localStorage.getItem("theme");
  if (saved && themes[saved]) return saved;
  // If no theme is saved, use the system preference as the initial theme
  return media.matches ? "dark" : "light";
}

function setTheme(themeName) {
  if (!themes[themeName]) return;
  localStorage.setItem("theme", themeName);
  applyTheme(themeName);
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || (media.matches ? "dark" : "light");
  const newTheme = getEffectiveTheme(currentTheme) === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
}

media.addEventListener?.("change", () => {
  // If the user hasn't made an explicit choice, follow the system
  if (!localStorage.getItem("theme")) {
    applyTheme(media.matches ? "dark" : "light");
  }
});

window.setTheme = setTheme;

document.addEventListener("DOMContentLoaded", () => {
  const initial = getInitialTheme();

  // Save to localStorage on first visit if not already saved
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", initial);
  }

  applyTheme(initial);

  // Add listener for the toggle button
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', toggleTheme);
  }

  // Also update the checked state in the UI for the dev picker
  document.querySelectorAll('[data-theme-choice]').forEach(btn => {
    btn.setAttribute("aria-checked", btn.dataset.themeChoice === initial);
  });
});
