module.exports = function(eleventyConfig) {
  // Pass through copy for CSS, JS, Images, Admin
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("img");
  eleventyConfig.addPassthroughCopy("admin");

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
