// .eleventy.js
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwindcss = require("tailwindcss");
const autoprefixer = require("autoprefixer");
const markdownIt = require("markdown-it");

module.exports = function (eleventyConfig) {
  // Previous configuration remains the same
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
  });

  eleventyConfig.addFilter("markdown", function (content) {
    return markdownLibrary.render(content);
  });

  // Watch directories
  eleventyConfig.addWatchTarget("./problems/");
  eleventyConfig.addWatchTarget("./src/css/");

  // CSS Processing
  eleventyConfig.addTemplateFormats("css");

  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async function (inputContent) {
      let output = await postcss([
        tailwindcss(require("./tailwind.config.js")),
        autoprefixer(),
      ]).process(inputContent);

      return async () => {
        return output.css;
      };
    },
  });

  // Updated Problems collection to include source files
  eleventyConfig.addCollection("problems", function (collectionApi) {
    const problemsDir = path.join(__dirname, "problems");
    const problems = [];

    fs.readdirSync(problemsDir).forEach((dirName) => {
      const problemDir = path.join(problemsDir, dirName);

      if (fs.statSync(problemDir).isDirectory()) {
        const yamlPath = path.join(problemDir, "problem.yaml");
        const mdPath = path.join(problemDir, "description.md");

        try {
          // Read YAML data
          const yamlContents = fs.readFileSync(yamlPath, "utf8");
          const yamlData = yaml.load(yamlContents);

          // Read Markdown content
          let description = "";
          try {
            description = fs.readFileSync(mdPath, "utf8");
          } catch (mdErr) {
            console.error(`Error reading ${mdPath}:`, mdErr);
            description = "Description not available.";
          }

          // Read all source code files
          const sourceFiles = [];
          fs.readdirSync(problemDir).forEach((fileName) => {
            if (fileName.endsWith(".ts") || fileName.endsWith(".js")) {
              const filePath = path.join(problemDir, fileName);
              try {
                const sourceCode = fs.readFileSync(filePath, "utf8");
                sourceFiles.push({
                  name: fileName,
                  content: sourceCode,
                  language: path.extname(fileName).slice(1), // removes the dot
                });
              } catch (err) {
                console.error(`Error reading ${filePath}:`, err);
              }
            }
          });

          problems.push({
            data: {
              ...yamlData,
              description: description,
              sourceFiles: sourceFiles,
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
