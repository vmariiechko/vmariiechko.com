const shortcodes = require('./_11ty/shortcodes.js');
const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  // Register Shortcodes
  Object.keys(shortcodes).forEach((shortcodeName) => {
    eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName]);
  });

  // Passthrough copy for co-located post assets and static files
  eleventyConfig.addPassthroughCopy('src/static');
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
    return collectionApi.getFilteredByGlob('src/content/posts/**/*.md');
  });

  return {
    // Set custom directories for input, output, includes, and data
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data',
    },
    // Define the template formats to be processed
    templateFormats: ['md', 'njk', 'html'],
    // Specify Nunjucks as the engine for Markdown files
    markdownTemplateEngine: 'njk',
    // Specify Nunjucks as the engine for HTML files
    htmlTemplateEngine: 'njk',
  };
};