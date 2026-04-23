const StylelintPlugin = require("stylelint-webpack-plugin");

module.exports = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  staticDirs: ["../public"],

  addons: [
    "@storybook/addon-links",
    "@storybook/preset-create-react-app",
    "@whitespace/storybook-addon-html",
    "@storybook/addon-designs",
    "@storybook/addon-a11y",
    "@storybook/addon-docs"
  ],

  typescript: {
    check: true,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true,
    },
  },

  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
  core: {
    allowedHosts: ["localhost", ".local"],
  },

  webpackFinal: async (config) => {
    // Inject shared variables and mixins into every SCSS file so that
    // per-component SCSS imports compile independently.
    const rules = config.module.rules;
    for (const rule of rules) {
      if (rule.oneOf) {
        for (const oneOfRule of rule.oneOf) {
          if (oneOfRule.test && oneOfRule.test.toString().includes("scss")) {
            for (const loader of oneOfRule.use || []) {
              if (
                typeof loader === "object" &&
                loader.loader &&
                loader.loader.includes("/sass-loader/")
              ) {
                loader.options = {
                  ...loader.options,
                  additionalData: (content) => {
                    const useStatements = [];
                    const rest = [];
                    for (const line of content.split("\n")) {
                      if (line.startsWith("@use ")) {
                        useStatements.push(line);
                      } else {
                        rest.push(line);
                      }
                    }
                    return [
                      ...useStatements,
                      '@import "./src/styles/scss/tools";',
                      ...rest,
                    ].join("\n");
                  },
                };
              }
            }
          }
        }
      }
    }

    config.plugins.push(
      new StylelintPlugin({
        files: "src/**/*.scss",
      })
    );
    return config;
  },
};
