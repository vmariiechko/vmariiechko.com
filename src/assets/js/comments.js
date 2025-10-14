const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const giscusAttributes = {
    src: 'https://giscus.app/client.js',
    'data-repo': 'vmariiechko/vmariiechko.com',
    'data-repo-id': 'R_kgDOO_gduw',
    'data-category': 'Announcements',
    'data-category-id': 'DIC_kwDOO_gdu84Cwg6I',
    'data-mapping': 'pathname',
    'data-strict': '0',
    'data-reactions-enabled': '0',
    'data-emit-metadata': '0',
    'data-input-position': 'top',
    'data-theme': theme === 'dark' ? 'dark' : 'light',
    'data-lang': 'en',
    crossorigin: 'anonymous',
    async: '',
};

const giscusScript = document.createElement('script');
Object.entries(giscusAttributes).forEach(([key, value]) => giscusScript.setAttribute(key, value));

const commentsContainer = document.getElementById('comments');
if (commentsContainer) {
    commentsContainer.appendChild(giscusScript);
}
