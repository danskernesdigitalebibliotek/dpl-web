import env from "@next/env"
import react from "@vitejs/plugin-react"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

const { loadEnvConfig } = env

loadEnvConfig(process.cwd())

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    alias: {
      "@/": new URL("./", import.meta.url).pathname,
    },
  },
})
