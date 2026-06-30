// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "cypress";
import plugins from "./cypress/plugins";

export default defineConfig({
  // Cypress 14's Test Replay caused a CI deadlock when running under pnpm.
  // Upgraded to Cypress 15 which fixes the underlying bug; keeping this
  // disabled as a precaution when Cloud recording is enabled.
  testReplayEnabled: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 10000,
  requestTimeout: 30000,
  retries: {
    runMode: 3,
    openMode: 0
  },
  e2e: {
    supportFile: "cypress/support/index.ts",
    specPattern: "./src/@(apps|components)/**/*.test.@(ts|tsx)",
    baseUrl: "http://localhost:57021",
    // testIsolation:true (default) resets browser state and Cypress intercept
    // handlers between every test, preventing cross-spec handler accumulation.
    // Specs that use a before() hook for one-time auth/clock setup must opt out
    // with { testIsolation: false } on their describe block.
    testIsolation: true,
    setupNodeEvents(on, config) {
      const terminalReportOptions = {
        printLogsToConsole: "onFail",
        printLogsToFile: "always",
        outputCompactLogs: 1,
        outputVerbose: false,
        includeSuccessfulHookLogs: false
      };
      require("cypress-terminal-report/src/installLogsPrinter")(
        on,
        terminalReportOptions
      );

      return plugins(on, config);
    }
  }
});
