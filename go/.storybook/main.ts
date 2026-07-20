/* eslint-disable no-restricted-properties */
import type { StorybookConfig } from "@storybook/nextjs"
import path from "path"
import { fileURLToPath } from "url"

// main.ts is loaded as ESM, where __dirname is not defined.
const dirname = path.dirname(fileURLToPath(import.meta.url))

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
  staticDirs: ["../public"],
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

    // Async server components can't render in Storybook's client-only
    // environment — swap them for client mocks. A module replacement (not a
    // resolve alias) so it wins over the tsconfig-paths resolution of "@/".
    // webpack is not a direct dependency, so reach it through the compiler.
    config.plugins.push({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apply: (compiler: any) => {
        new compiler.webpack.NormalModuleReplacementPlugin(
          /^@\/components\/shared\/image\/ImageBaseWithPlaceholder$/,
          path.resolve(dirname, "mocks/ImageBaseWithPlaceholder.tsx")
        ).apply(compiler)
        // The CMS config module is a server function; serve a fixture so
        // config-dependent UI (e.g. the payment link) renders in stories.
        new compiler.webpack.NormalModuleReplacementPlugin(
          /^@\/lib\/config\/dpl-cms\/dplCmsConfig$/,
          path.resolve(dirname, "mocks/dplCmsConfig.ts")
        ).apply(compiler)
      },
    })

    // Storybook's webpack doesn't honor Next.js's `transpilePackages` for
    // file:-installed workspace packages, so it tries to parse our raw
    // .ts/.tsx source from dpl-service-layer as plain JS and chokes on
    // TypeScript-only syntax (e.g. `export type {…}`). Transpile those
    // files explicitly. Remove once the monorepo moves to pnpm/workspaces.
    config.module.rules.push({
      test: /\.tsx?$/,
      include: /node_modules\/@danskernesdigitalebibliotek\/dpl-service-layer/,
      use: {
        loader: "babel-loader",
        options: {
          presets: [
            ["@babel/preset-env", { targets: { esmodules: true } }],
            ["@babel/preset-react", { runtime: "automatic" }],
            "@babel/preset-typescript",
          ],
        },
      },
    })

    return config
  },
}
export default config
