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
    'data-theme': 'light', // Default to light, will be updated by theme.js
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
