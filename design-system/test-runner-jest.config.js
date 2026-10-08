const { getJestConfig } = require("@storybook/test-runner");

const testRunnerConfig = getJestConfig();

// Grayscale antialiasing without hinting, as Argos recommends, so text
// renders the same from run to run.
const launchOptions = {
  args: ["--disable-lcd-text", "--font-render-hinting=none"],
};

// Set when the browser runs in the Playwright container, so screenshots
// taken on any machine render like CI's.
const playwrightServer = process.env.PLAYWRIGHT_SERVER;

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
module.exports = {
  ...testRunnerConfig,
  testEnvironmentOptions: {
    ...testRunnerConfig.testEnvironmentOptions,
    "jest-playwright": {
      ...testRunnerConfig.testEnvironmentOptions["jest-playwright"],
      ...(playwrightServer
        ? {
            connectOptions: {
              wsEndpoint: `${playwrightServer}?launch-options=${encodeURIComponent(
                JSON.stringify(launchOptions),
              )}`,
            },
          }
        : { launchOptions }),
    },
  },
};
