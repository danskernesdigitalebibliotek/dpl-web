import { getJestConfig } from "@storybook/test-runner"

const testRunnerConfig = getJestConfig()

/**
 * @type {import('@jest/types').Config.InitialOptions}
 */
const config = {
  ...testRunnerConfig,
  // Runs before setupFilesAfterEnv, where @storybook/test-runner loads
  // .storybook/test-runner.ts. See the shim for why it is needed.
  setupFiles: [
    ...(testRunnerConfig.setupFiles ?? []),
    "<rootDir>/go/.storybook/patch-module-register.js",
  ],
}

export default config
