/// reference types="vitest" />
import env from "@next/env"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// @next/env is CJS — named imports fail at runtime even though TS allows them.
// eslint-disable-next-line import-x/no-named-as-default-member
const { loadEnvConfig } = env

loadEnvConfig(process.cwd())

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
})
