const shortcodes = require('./_11ty/shortcodes.js');

module.exports = function (eleventyConfig) {
  // Register Shortcodes
  Object.keys(shortcodes).forEach((shortcodeName) => {
    eleventyConfig.addShortcode(shortcodeName, shortcodes[shortcodeName]);
  });

  // Passthrough copy for static assets and images
  eleventyConfig.addPassthroughCopy('src/static');
  eleventyConfig.addPassthroughCopy('src/assets/images');

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