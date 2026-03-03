module.exports = function (eleventyConfig) {
  // Use mapping object to copy files from src to the root of _site output
  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/js": "js",
    "src/img": "img",
    "src/admin": "admin",
    "src/data": "data"
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
