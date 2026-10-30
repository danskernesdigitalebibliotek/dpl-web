import { defineConfig } from "vitest/config";

// Default to Danish time, like the integration tests, so date tests mean the
// same locally and in CI. Set here so the test workers inherit it.
process.env.TZ ??= "Europe/Copenhagen";

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined"
  },

  test: {
    environment: "happy-dom",
    include: ["./src/tests/unit/*.test.(ts|tsx)"],
    includeSource: ["src/**/*.{ts,tsx}"],
    coverage: {
      all: true,
      provider: "istanbul",
      reporter: ["clover"],
      include: ["src/**/*.{ts,tsx}"]
    }
  }
});

export {};
