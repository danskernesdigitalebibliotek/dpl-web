import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // The service layer is a workspace symlink with its own node_modules, so
    // without deduping it would get a second React and a second TanStack
    // Query - and a QueryClientProvider it cannot see.
    dedupe: ["react", "react-dom", "@tanstack/react-query"],
  },
})
