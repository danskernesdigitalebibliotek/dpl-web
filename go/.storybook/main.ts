import type { StorybookConfig } from "@storybook/nextjs"
import webpack from "webpack"

const injectVars = Object.keys(process.env).reduce((c, key) => {
  if (/^NEXT_PUBLIC_/.test(key)) {
    c[`process.env.${key}`] = JSON.stringify(process.env[key])
  }
  return c
}, {})

function injectEnv(definitions) {
  const env = "process.env"

  if (!definitions[env]) {
    return {
      ...definitions,
      [env]: JSON.stringify(
        Object.fromEntries(
          Object.entries(definitions)
            .filter(([key]) => key.startsWith(env))
            .map(([key, value]) => [key.substring(env.length + 1), JSON.parse(value)])
        )
      ),
    }
  }
  return definitions
}

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

    config.plugins = config.plugins.reduce((c, plugin) => {
      if (plugin instanceof webpack.DefinePlugin) {
        return [
          ...c,
          new webpack.DefinePlugin(
            injectEnv({
              ...plugin.definitions,
              ...injectVars,
            })
          ),
        ]
      }

      return [...c, plugin]
    }, [])

    return config

    return config
  },
}

export default config
