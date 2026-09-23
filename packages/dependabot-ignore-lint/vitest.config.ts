import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    // Unit tests live in the source files they cover, behind import.meta.vitest.
    includeSource: ["src/**/*.ts"],
  },
})
