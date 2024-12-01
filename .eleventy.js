// .eleventy.js
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  // Function to read all problem directories and generate pages
  eleventyConfig.addCollection("problems", function (collectionApi) {
    const problemsDir = path.join(__dirname, "problems");
    const problems = [];

    // Read all subdirectories in the problems directory
    fs.readdirSync(problemsDir).forEach((dirName) => {
      const problemDir = path.join(problemsDir, dirName);

      // Check if it's a directory
      if (fs.statSync(problemDir).isDirectory()) {
        const yamlPath = path.join(problemDir, "problem.yaml");

        try {
          const fileContents = fs.readFileSync(yamlPath, "utf8");
          const data = yaml.load(fileContents);

          // Add the directory name and problem data
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
