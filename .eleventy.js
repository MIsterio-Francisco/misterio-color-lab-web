const path = require("path");

module.exports = function (eleventyConfig) {
  // Use mapping object to copy files from src to the root of _site output
  eleventyConfig.addPassthroughCopy({
    "src/css": "css",
    "src/js": "js",
    "src/img": "img",
    "src/admin": "admin",
    "src/data/settings": "data/settings"
  });

  eleventyConfig.addCollection("projects", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/data/collections/projects/*.json");
  });

  eleventyConfig.addFilter("webImage", function (imagePath, width) {
    if (!imagePath) return "";
    if (/^https?:\/\//i.test(imagePath)) return imagePath;
    return `/img/projects/web/${path.basename(imagePath)}-${width}.webp`;
  });

  eleventyConfig.addFilter("projectAlt", function (item, lang = "en") {
    if (!item) return lang === "es" ? "Póster de proyecto" : "Project poster";
    if (item.alt && typeof item.alt === "object") return item.alt[lang] || item.alt.en;
    if (item.alt) return item.alt;
    const knownTitles = {
      "if_you_really_love_me_outlive_me.jpg": "If You Really Love Me, Outlive Me",
      "fiesta_pagana.jpg": "Fiesta Pagana",
      "dante.jpg": "Dante",
      "barrabrava_s2.jpg": "Barrabrava",
      "todos_los_colores.jpg": "Todos los Colores",
      "los_nadadores.jpg": "Los Nadadores",
      "VIZITA.jpg": "Vizita",
      "EL SANTO.png": "El Santo",
      "HBO_MUXES.webp": "Muxes",
      "LA_BODA.jpg": "La Boda",
      "KONVOI.jpg": "The Arctic Convoy",
      "LA_ESPERA.jpg": lang === "es" ? "La Espera" : "The Wait",
      "requiemforselina.jpg": "Requiem for Selina",
      "orca.jpeg": "Orca",
      "LA_ULTIMA.jpg": "La Última",
      "songsofearth.jpg": "Songs of Earth",
      "ANNE_EVERLASTING.jpg": "Anne Everlasting",
      "POSSESSION.jpg": "Possession",
      "pact.jpeg": "The Pact",
      "VAST_OF_NIGHT.jpg": "The Vast of Night",
      "cuentame-como-paso.jpg": "Cuéntame cómo pasó",
      "goldrun.jpg": "Gold Run"
    };
    const filename = path.basename(item.image || "");
    if (knownTitles[filename]) return `${knownTitles[filename]} — ${lang === "es" ? "póster" : "poster"}`;
    const fallback = path.basename(item.image || "", path.extname(item.image || ""))
      .replace(/^MV5B.*$/i, "Featured project")
      .replace(/[_-]+/g, " ")
      .trim();
    return `${fallback || (lang === "es" ? "Proyecto" : "Project")} — Misterio Color Lab`;
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
