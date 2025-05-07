import { loadEnvConfig } from "@next/env"
import { defineConfig } from "cypress"

import { e2eNodeEvents } from "./cypress/support/setupNodeEvents/index"

// Load environment variables from .env.test
const { combinedEnv } = loadEnvConfig(process.cwd(), true)

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      config.env = {
        ...combinedEnv,
        ...config.env,
      }
      return e2eNodeEvents?.(on, config) ?? config
    },
    experimentalInteractiveRunEvents: true,
  },
})
