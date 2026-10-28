/* eslint-disable no-restricted-properties */
import type { StorybookConfig } from "@storybook/nextjs"
import path from "path"
import { fileURLToPath } from "url"

// main.ts is loaded as ESM, where __dirname is not defined.
const dirname = path.dirname(fileURLToPath(import.meta.url))

// next/font/google reads its CSS from this module instead of Google Fonts.
process.env.NEXT_FONT_GOOGLE_MOCKED_RESPONSES = path.resolve(dirname, "google-fonts-mock.js")

const config: StorybookConfig = {
  stories: [
    "../components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../app/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@storybook/addon-links",
    "@chromatic-com/storybook",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
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
  staticDirs: ["../public", { from: "./fonts", to: "/storybook-fonts" }],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
