import { defineConfig } from "orval"

export default defineConfig({
  fbs: {
    output: {
      mode: "split",
      target: "generated/fbs.ts",
      schemas: "generated/model",
      client: "fetch",
      prettier: true,
    },
    input: {
      target: "fbs-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
