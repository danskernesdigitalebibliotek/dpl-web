import { defineConfig } from "orval"

export default defineConfig({
  fbs: {
    output: {
      mode: "split",
      target: "src/generated/fbs.ts",
      schemas: "src/generated/model",
      client: "fetch",
      prettier: true,
    },
    input: {
      target: "src/fbs-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
