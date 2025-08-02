const shortcodes = require('./_11ty/shortcodes.js');
const { DateTime } = require('luxon');

module.exports = function (eleventyConfig) {
  // Register Shortcodes
  Object.keys(shortcodes).forEach((shortcodeName) => {
    eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName]);
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
    return collectionApi.getFilteredByGlob('src/content/posts/**/*.md');
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