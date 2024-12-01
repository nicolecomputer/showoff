const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Set up markdown-it
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  // Add the markdown filter
  eleventyConfig.addFilter("markdown", function (content) {
    return markdownLibrary.render(content);
  });

  // CSS Processing
  eleventyConfig.addTemplateFormats("css");

  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (inputContent) {
      // Process CSS with PostCSS and Tailwind
      let output = await postcss([
        tailwindcss(require("./tailwind.config.js")),
        autoprefixer(),
      ]).process(inputContent);

      return async () => {
        return output.css;
      };
    },
  });

  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("./src/css/");

  eleventyConfig.addCollection("problems", function (collectionApi) {
    const problemsDir = path.join(__dirname, "problems");
    const problems = [];

    fs.readdirSync(problemsDir).forEach((dirName) => {
      const problemDir = path.join(problemsDir, dirName);

      if (fs.statSync(problemDir).isDirectory()) {
        const yamlPath = path.join(problemDir, "problem.yaml");
        const mdPath = path.join(problemDir, "description.md");

        try {
          const yamlContents = fs.readFileSync(yamlPath, "utf8");
          const yamlData = yaml.load(yamlContents);

          let description = "";
          try {
            description = fs.readFileSync(mdPath, "utf8");
          } catch (mdErr) {
            console.error(`Error reading ${mdPath}:`, mdErr);
            description = "Description not available.";
          }

          problems.push({
            data: {
              ...yamlData,
              description: description,
              page: {
                fileSlug: dirName,
                url: `/${dirName}/`,
              },
            },
          });
        } catch (err) {
          console.error(`Error processing ${yamlPath}:`, err);
        }
      }
    });

    return problems;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
