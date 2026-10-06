import { defineConfig } from "orval"

export default defineConfig({
  fbs: {
    output: {
      mode: "split",
      target: "src/generated/fbs.ts",
      schemas: "src/generated/model",
      client: "fetch",
      formatter: "prettier",
    },
    input: {
      target: "../../../schemas/openapi/fbs-adapter.yaml",
    },
  },
})
