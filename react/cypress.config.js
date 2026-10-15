// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "cypress";
import plugins from "./cypress/plugins";
// https://github.com/bahmutov/cypress-split
import cypressSplit from "cypress-split";

export default defineConfig({
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

      // No-op without SPLIT / SPLIT_INDEX (CI only).
      cypressSplit(on, config);
      plugins(on, config);

      // cypress-split narrows specPattern here; else all specs run.
      return config;
    }
  }
});
