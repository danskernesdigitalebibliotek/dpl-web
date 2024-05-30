const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // baseUrl is set using environment variables because it differs between
    // development and CI setups.
  },
  env: {
    // This is intentionally left empty.
    // Environment variables for services are set in docker-compose.ci.yml for
    // CI and Taskfile.yml for local development.
  },
  retries: {
    runMode: 3,
    openMode: 0,
  },
});
