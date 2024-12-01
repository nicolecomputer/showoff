const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");

module.exports = function (eleventyConfig) {
  // Process CSS
  eleventyConfig.addTemplateFormats("css");

  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (content, path) {
      if (path.includes("style.css")) {
        return async () => {
          let output = await postcss([tailwindcss, autoprefixer]).process(
            content,
            { from: path }
          );
          return output.css;
        };
      }
      return async () => content;
    },
  });

  // Watch CSS files for changes
  eleventyConfig.addWatchTarget("./src/css/");

  // Pass through CSS files
  eleventyConfig.addPassthroughCopy("src/css");

  // Problems collection (keeping your existing code)
  eleventyConfig.addCollection("problems", function (collectionApi) {
    const problemsDir = path.join(__dirname, "problems");
    const problems = [];

    fs.readdirSync(problemsDir).forEach((dirName) => {
      const problemDir = path.join(problemsDir, dirName);

      if (fs.statSync(problemDir).isDirectory()) {
        const yamlPath = path.join(problemDir, "problem.yaml");

        try {
          const fileContents = fs.readFileSync(yamlPath, "utf8");
          const data = yaml.load(fileContents);

          problems.push({
            data: {
              ...data,
              page: {
                fileSlug: dirName,
                url: `/${dirName}/`,
              },
            },
          });
        } catch (err) {
          console.error(`Error reading ${yamlPath}:`, err);
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
