import type { StorybookConfig } from "@storybook/nextjs"

const config: StorybookConfig = {
  stories: ["../components/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  env: config => ({
    ...config,
    // Take all values in env that start with NEXT_PUBLIC_ and pass them to the storybook
    ...Object.keys(process.env)
      .filter(key => key.startsWith("NEXT_PUBLIC_"))
      .reduce((state, nextKey) => ({ ...state, [nextKey]: process.env[nextKey] }), {}),
  }),
  staticDirs: ["../public"],
  webpackFinal: async (config: any) => {
    // This modifies the existing image rule to exclude `.svg` files
    // since we handle those with `@svgr/webpack`.
    const imageRule = config.module.rules.find(rule => {
      if (typeof rule !== "string" && rule.test instanceof RegExp) {
        return rule.test.test(".svg")
      }
    })
    if (typeof imageRule !== "string") {
      imageRule.exclude = /\.svg$/
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    })

    return config
  },
}
export default config
