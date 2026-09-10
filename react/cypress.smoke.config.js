// Cypress config for the production-bundle smoke test.
//
// Separate from cypress.config.js: the integration suite runs against the
// Storybook dev server (where `process` is shimmed), whereas this suite drives
// the real production webpack output served by cypress/smoke/server.mjs.
import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 30000,
  e2e: {
    supportFile: false,
    specPattern: "cypress/smoke/**/*.cy.ts",
    baseUrl: "http://localhost:57022"
  }
});
