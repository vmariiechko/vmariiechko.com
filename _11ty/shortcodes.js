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
        imageHTML = `<a href="${largestUrl}" target="_blank" rel="noopener">${imageHTML}</a>`;
    }

    if (caption) {
        return `<figure class="captioned-figure">${imageHTML}<figcaption>${caption}</figcaption></figure>`;
    }
    return imageHTML;
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
};
