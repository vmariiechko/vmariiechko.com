const { DateTime } = require('luxon');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const markdownIt = require('markdown-it');
const markdownItPrism = require('markdown-it-prism');
const markdownItContainer = require('markdown-it-container');
const Image = require('@11ty/eleventy-img');
const path = require('path');
const phosphor = require('eleventy-plugin-phosphoricons');

const shortcodes = require('./_11ty/shortcodes.js');
const filters = require('./_11ty/filters.js');

module.exports = function (eleventyConfig) {
    eleventyConfig.addGlobalData('NODE_ENV', process.env.NODE_ENV);

    // Don't process drafts in production
    if (process.env.NODE_ENV === 'production') {
        eleventyConfig.ignores.add('src/content/drafts/**/*.md');
    }

    // Plugins
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(pluginRss);
    eleventyConfig.addPlugin(phosphor, { class: 'icon', size: 20 });

    // Register Shortcodes
    Object.keys(shortcodes).forEach((shortcodeName) => {
        eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName]);
    });

    // Register Filters
    Object.keys(filters).forEach((filterName) => {
        eleventyConfig.addFilter(filterName, filters[filterName]);
    });

    // Passthrough copy for static assets
    eleventyConfig.addPassthroughCopy({ 'src/static/favicons': 'favicons' });
    eleventyConfig.addPassthroughCopy('src/assets/images');
    eleventyConfig.addPassthroughCopy('src/assets/fonts');
    eleventyConfig.addPassthroughCopy('src/assets/js');
    eleventyConfig.addPassthroughCopy('src/assets/css/vendors');
    eleventyConfig.addPassthroughCopy('src/robots.txt');
    eleventyConfig.addPassthroughCopy('src/manifest.webmanifest');
    eleventyConfig.addPassthroughCopy('src/content/posts/**/*.jpg');
    eleventyConfig.addPassthroughCopy('src/content/posts/**/*.png');

    // Asynchronous image shortcode
    async function imageShortcode(src, alt, caption, sizes = '100vw') {
        if (!alt) {
            throw new Error(`Missing \`alt\` on image shortcode from: ${src}`);
        }

        let metadata = await Image(src, {
            widths: [400, 800, 1200],
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

        const imageHTML = Image.generateHTML(metadata, imageAttributes);

        if (caption) {
            return `<figure class="captioned-figure">${imageHTML}<figcaption>${caption}</figcaption></figure>`;
        }
        return imageHTML;
    }

    eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);

    eleventyConfig.addNunjucksAsyncShortcode('postImage', async function (src, alt, caption) {
        const postDirectory = path.dirname(this.page.inputPath);
        const fullSrc = path.join(postDirectory, src);
        const sizes = '(max-width: 768px) 100vw, 768px';
        return imageShortcode(fullSrc, alt, caption, sizes);
    });


    // Add a filter for readable dates
    eleventyConfig.addFilter('readableDate', (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
            'dd LLL yyyy'
        );
    });

    // Add a filter to limit an array
    eleventyConfig.addFilter('limit', (array, limit) => {
        return array.slice(0, limit);
    });

    // Create a collection of posts
    eleventyConfig.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/posts/**/*.md').filter(post => !post.data.draft);
    });

    // Create a collection of short bytes
    eleventyConfig.addCollection('shortBytes', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/short-bytes/**/*.md').filter(shortByte => !shortByte.data.draft);
    });

    // Create a collection of items grouped by topic
    eleventyConfig.addCollection('itemsByTopic', (collectionApi) => {
        const itemsByTopic = {};
        collectionApi.getAll().forEach((item) => {
            if (item.data.topics) {
                item.data.topics.forEach((topic) => {
                    if (!itemsByTopic[topic]) {
                        itemsByTopic[topic] = [];
                    }
                    itemsByTopic[topic].push(item);
                });
            }
        });
        return itemsByTopic;
    });

    // Create a collection of drafts
    eleventyConfig.addCollection('drafts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/drafts/**/*.md');
    });

    // Configure markdown-it
    const md = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });
    md.use(markdownItContainer, 'callout-info');
    md.use(markdownItContainer, 'callout-success');
    md.use(markdownItContainer, 'callout-warning');
    md.use(markdownItPrism, {
        defaultLanguage: "plaintext",
        // Prevent prism from processing mermaid blocks
        init: function(Prism) {
            // Mermaid blocks should not be syntax highlighted
            if (Prism.languages.mermaid) {
                delete Prism.languages.mermaid;
            }
        }
    });
    eleventyConfig.setLibrary('md', md);

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data",
        },
        templateFormats: ["md", "njk", "html"],
        markdownTemplateEngine: "njk",
        htmlTemplateEngine: "njk",
    };
};
