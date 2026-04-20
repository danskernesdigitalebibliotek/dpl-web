const { defineConfig } = require('cypress');
const { WireMockRestClient } = require('wiremock-rest-client');

const wiremock = () => new WireMockRestClient('http://wiremock');

module.exports = defineConfig({
  video: true,
  e2e: {
    // baseUrl is set using environment variables because it differs between
    // development and CI setups.
    retries: {
      runMode: 3,
      openMode: 0,
    },
    setupNodeEvents(on) {
      require('cypress-terminal-report/src/installLogsPrinter')(on);

      // wiremock-rest-client is a Node.js library that cannot be bundled
      // for the browser. All WireMock operations run here via cy.task().
      on('task', {
        createMapping(stub) {
          return wiremock()
            .mappings.createMapping(stub)
            .then(() => null);
        },
        resetMappings() {
          return wiremock()
            .mappings.resetAllMappings()
            .then(() => null);
        },
        getAllMappings() {
          return wiremock().mappings.getAllMappings();
        },
        getRequestCount(request) {
          return wiremock().requests.getCount(request);
        },
        resetRequests() {
          return wiremock()
            .requests.resetAllRequests()
            .then(() => null);
        },
        getAllRequests() {
          return wiremock().requests.getAllRequests();
        },
      });
    },
  },
  env: {
    // This is intentionally left empty.
    // Environment variables for services are set in docker-compose.ci.yml for
    // CI and Taskfile.yml for local development.
  },
});
