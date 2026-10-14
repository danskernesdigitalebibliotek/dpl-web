import { getJestConfig } from "@storybook/test-runner"
import { devices } from "playwright"

import { argosUserAgentToken } from "./user-agent.mjs"

const testRunnerConfig = getJestConfig()

// Grayscale antialiasing without hinting, as Argos recommends, so text
// renders the same from run to run.
const launchOptions = {
  args: ["--disable-lcd-text", "--font-render-hinting=none"],
}

// Set when the browser runs in the Playwright container.
const playwrightServer = process.env.PLAYWRIGHT_SERVER

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const config = {
  ...testRunnerConfig,
  // A file's first story also boots the preview and loads remote images.
  testTimeout: 60000,
  // Workers grow with every story file they screenshot; replace them before
  // they run out of heap, as on GitHub's 4-core runners.
  workerIdleMemoryLimit: "1GB",
  testEnvironmentOptions: {
    ...testRunnerConfig.testEnvironmentOptions,
    "jest-playwright": {
      ...testRunnerConfig.testEnvironmentOptions["jest-playwright"],
      ...(playwrightServer
        ? {
            connectOptions: {
              wsEndpoint: `${playwrightServer}?launch-options=${encodeURIComponent(
                JSON.stringify(launchOptions)
              )}`,
            },
          }
        : { launchOptions }),
      contextOptions: {
        // Playwright can only replace the user agent, so extend its Chrome one.
        userAgent: `${devices["Desktop Chrome"].userAgent} ${argosUserAgentToken}`,
      },
    },
  },
}

export default config
