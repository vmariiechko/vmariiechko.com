const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const markdownIt = require('markdown-it');
const markdownItPrism = require('markdown-it-prism');
const markdownItContainer = require('markdown-it-container');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItTOC = require('markdown-it-table-of-contents');
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
    eleventyConfig.addPassthroughCopy({
        'node_modules/medium-zoom/dist/medium-zoom.min.js': 'assets/js/vendors/medium-zoom.min.js',
    });

    // Create a collection of posts
    eleventyConfig.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/posts/**/*.md')
                .filter(post => !post.data.draft);
    });

    // Create a collection of short bytes
    eleventyConfig.addCollection('shortBytes', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/short-bytes/**/*.md')
                .filter(shortByte => !shortByte.data.draft);
    });

    // Create a collection of drafts
    eleventyConfig.addCollection('drafts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/drafts/**/*.md');
    });

    // Create a collection of all content (posts + short bytes combined, sorted by date descending)
    eleventyConfig.addCollection('allContent', (collectionApi) => {
        const posts = collectionApi.getFilteredByGlob('src/content/posts/**/*.md')
            .filter(item => !item.data.draft);

        const shortBytes = collectionApi.getFilteredByGlob('src/content/short-bytes/**/*.md')
            .filter(item => !item.data.draft);

        // Add contentType to each item's data (avoids spread operator issues)
        posts.forEach(item => { item.data.contentType = 'post'; });
        shortBytes.forEach(item => { item.data.contentType = 'short-byte'; });

        return [...posts, ...shortBytes]
            .sort((a, b) => b.date - a.date);
    });

    // Create a collection of all tags (deduplicated, with types, slugs, and counts, alphabetical)
    eleventyConfig.addCollection('allTags', (collectionApi) => {
        const tagItems = {};
        const excludedTags = ['Post', 'Short Byte'];

        const items = [
            ...collectionApi.getFilteredByGlob('src/content/posts/**/*.md'),
            ...collectionApi.getFilteredByGlob('src/content/short-bytes/**/*.md')
        ];

        items.forEach((item) => {
            if (item.data.draft) return; // Skip drafts

            if (item.data.tags && Array.isArray(item.data.tags)) {
                item.data.tags.forEach((tag) => {
                    if (!excludedTags.includes(tag)) {
                        tagItems[tag] = {
                            type: 'tag',
                            slug: filters.slugify(tag),
                            count: (tagItems[tag]?.count || 0) + 1,
                        };
                    }
                });
            }

        });

        return Object.keys(tagItems)
            .sort((a, b) => a.localeCompare(b))
            .map((tag) => ({
                name: tag,
                type: tagItems[tag].type,
                slug: tagItems[tag].slug,
                count: tagItems[tag].count,
            }));
    });

    // Configure markdown-it
    const md = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
    });

    // Add anchor links to headings
    md.use(markdownItAnchor, {
        level: [2, 3, 4], // h2, h3, h4 only
        permalink: markdownItAnchor.permalink.linkAfterHeader({
            style: 'visually-hidden',
            assistiveText: title => `Permalink to "${title}"`,
            visuallyHiddenClass: 'sr-only',
            wrapper: ['<div class="heading-wrapper">', '</div>'],
            placement: 'after',
            class: 'heading-anchor',
        }),
    });

    // Add table of contents support
    md.use(markdownItTOC, {
        includeLevel: [2, 3, 4],
        containerClass: 'toc',
        listType: 'ul',
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
            // Fix bash parameter pattern to match hyphenated flags (e.g. --pipeline-id, --dry-run)
            // init() fires before languages are loaded on-demand, so bash must be pre-loaded here
            // Default \w+ stops at hyphens so only single-word flags like --flows get highlighted
            require('prismjs/components/prism-bash');
            if (Prism.languages.bash && Prism.languages.bash.parameter) {
                Prism.languages.bash.parameter.pattern = /(^|\s)-{1,2}(?:\w+:[+-]?)?\w[\w-]*(?:\.\w+)*(?=[=\s]|$)/;
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
