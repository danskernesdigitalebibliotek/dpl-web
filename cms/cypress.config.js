const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: true,
  e2e: {
    // baseUrl is set using environment variables because it differs between
    // development and CI setups.
    retries: {
      runMode: 3,
      openMode: 0,
    },
    setupNodeEvents(on, config) {
      require('cypress-terminal-report/src/installLogsPrinter')(on)
    }
  },
  env: {
    // This is intentionally left empty.
    // Environment variables for services are set in docker-compose.ci.yml for
    // CI and Taskfile.yml for local development.
  },
});
