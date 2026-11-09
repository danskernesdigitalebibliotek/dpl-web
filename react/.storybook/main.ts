// Same singleton aliasing as webpack.config.js: without it the service layer
// resolves its own copy of react-query and its hooks cannot see the
// QueryClientProvider this project mounts.
import type { StorybookConfig } from "@storybook/react-webpack5";

const { moduleAliases } = require("../webpack.helpers");

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-queryparams",
    "@storybook/addon-webpack5-compiler-babel"
  ],

  typescript: {
    check: true,
    checkOptions: {},
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) =>
        prop.parent ? !/node_modules/.test(prop.parent.fileName) : true
    }
  },

  framework: {
    name: "@storybook/react-webpack5",
    options: {}
  },

  docs: {
    autodocs: "tag"
  },

  webpackFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      ...moduleAliases
    };
    return config;
  }
};

export default config;
