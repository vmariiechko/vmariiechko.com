const Image = require('@11ty/eleventy-img');
const path = require('path');

async function imageShortcode(src, alt, caption, sizes = '100vw', link = false) {
    if (!alt) {
        throw new Error(`Missing \`alt\` on image shortcode from: ${src}`);
    }

    let metadata = await Image(src, {
        widths: [400, 800, 1200, 2000],
        formats: ['avif', 'webp', 'jpeg'],
        outputDir: './_site/img/',
        urlPath: '/img/',
    });

    let imageAttributes = {
        alt,
        sizes,
        loading: 'lazy',
        decoding: 'async',
    };

    let imageHTML = Image.generateHTML(metadata, imageAttributes);

    if (link) {
        const formats = metadata.webp || metadata.jpeg || metadata.avif;
        const largestUrl = formats[formats.length - 1].url;
        imageHTML = imageHTML.replace(/(<img\s)/i, `$1data-zoom-src="${largestUrl}" `);
    }

    if (caption) {
        return `<figure class="captioned-figure">${imageHTML}<figcaption>${caption}</figcaption></figure>`;
    }
    return imageHTML;
}

const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

function escapeAttr(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function youtubeShortcode(videoId, caption = '', title = '') {
    if (!videoId || !YOUTUBE_ID_PATTERN.test(videoId)) {
        throw new Error(
            `Invalid YouTube videoId on youtube shortcode: "${videoId}". ` +
            `Expected the 11-character ID from a youtu.be/<id> or youtube.com/watch?v=<id> URL.`
        );
    }

    const iframeTitle = escapeAttr(title || caption || 'YouTube video player');
    const src = `https://www.youtube-nocookie.com/embed/${videoId}`;

    const iframe =
        `<div class="yt-embed">` +
            `<iframe src="${src}" title="${iframeTitle}" loading="lazy" ` +
                `referrerpolicy="strict-origin-when-cross-origin" ` +
                `allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ` +
                `allowfullscreen></iframe>` +
        `</div>`;

    if (caption) {
        return `<figure class="captioned-figure">${iframe}<figcaption>${caption}</figcaption></figure>`;
    }
    return `<figure class="captioned-figure">${iframe}</figure>`;
}

module.exports = {
    year: () => new Date().getFullYear().toString(),

    image: async function (src, alt, caption, sizes = '100vw', link = false) {
        return imageShortcode(src, alt, caption, sizes, link);
    },

    postImage: async function (src, alt, caption, link = false) {
        const postDirectory = path.dirname(this.page.inputPath);
        const fullSrc = path.join(postDirectory, src);
        const sizes = '(max-width: 768px) 100vw, 990px';
        return imageShortcode(fullSrc, alt, caption, sizes, link);
    },

    youtube: function (videoId, caption = '', title = '') {
        return youtubeShortcode(videoId, caption, title);
    },
};
