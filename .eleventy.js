const { DateTime } = require('luxon');

const shortcodes = require('./_11ty/shortcodes.js');
const filters = require('./_11ty/filters.js');

module.exports = function (eleventyConfig) {
    // Don't process drafts in production
    if (process.env.NODE_ENV === 'production') {
        eleventyConfig.ignores.add('src/content/drafts/**/*.md');
    }

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
    eleventyConfig.addPassthroughCopy('src/robots.txt');
    eleventyConfig.addPassthroughCopy('src/manifest.webmanifest');
    eleventyConfig.addPassthroughCopy('src/content/posts/**/*.jpg');
    eleventyConfig.addPassthroughCopy('src/content/posts/**/*.png');

    // Add a filter for readable dates
    eleventyConfig.addFilter('readableDate', (dateObj) => {
        return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
            'dd LLL yyyy'
        );
    });

    // Create a collection of posts
    eleventyConfig.addCollection('posts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/posts/**/*.md').filter(post => !post.data.draft);
    });

    // Create a collection of drafts
    eleventyConfig.addCollection('drafts', (collectionApi) => {
        return collectionApi.getFilteredByGlob('src/content/drafts/**/*.md');
    });

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
