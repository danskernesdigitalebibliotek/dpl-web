import { defineConfig } from "cypress"

import { e2eNodeEvents } from "./cypress/support/setupNodeEvents"

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents: e2eNodeEvents,
    experimentalInteractiveRunEvents: true,
  },
})
