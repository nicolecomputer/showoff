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

  const showoffPath = path.join(__dirname, "problems", "showoff.yml");
  let siteConfig = {};
  try {
    const showoffContent = fs.readFileSync(showoffPath, "utf8");
    siteConfig = yaml.load(showoffContent);
  } catch (err) {
    console.error("Error reading showoff.yml:", err);
    siteConfig = { title: "Problems" }; // Default title if file is missing
  }

  eleventyConfig.addCollection("problems", function (collectionApi) {
    const problemsDir = path.join(__dirname, "problems");
    const problems = [];

    fs.readdirSync(problemsDir).forEach((dirName) => {
      const problemDir = path.join(problemsDir, dirName);

      if (fs.statSync(problemDir).isDirectory()) {
        const yamlPath = path.join(problemDir, "problem.yml");
        const mdPath = path.join(problemDir, "problem.md");
        const inputPath = path.join(problemDir, "input.txt");
        const notesPath = path.join(problemDir, "notes.md");

        try {
          // Read YAML data
          const yamlContents = fs.readFileSync(yamlPath, "utf8");
          const yamlData = yaml.load(yamlContents);

          // Read Markdown content
          let description = { enabled: false, content: "" };
          try {
            description = {
              enabled: true,
              content: fs.readFileSync(mdPath, "utf8"),
            };
          } catch (mdErr) {
            console.error(`Error reading ${mdPath}:`, mdErr);
          }

          let notes = { enabled: false, content: "" };
          try {
            notes = {
              enabled: true,
              content: fs.readFileSync(notesPath, "utf8"),
            };
          } catch (mdErr) {
            console.error(`Error reading ${mdPath}:`, mdErr);
          }

          // Read input
          let input = { enabled: false, content: "" };
          try {
            input = {
              enabled: true,
              content: fs.readFileSync(inputPath, "utf8"),
            };
          } catch (mdErr) {
            console.error(`Error reading ${inputPath}:`, mdErr);
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
              tabs: {
                input: input,
                description: description,
                sourceFiles: sourceFiles,
                notes: notes,
              },
              siteConfig: siteConfig,
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

  eleventyConfig.addGlobalData("siteConfig", siteConfig);

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
