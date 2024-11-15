const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    // baseUrl is set using environment variables because it differs between
    // development and CI setups.
    defaultCommandTimeout: 10000,
  },
  env: {
    // This is intentionally left empty.
    // Environment variables for services are set in docker-compose.ci.yml for
    // CI and Taskfile.yml for local development.
  },
});
