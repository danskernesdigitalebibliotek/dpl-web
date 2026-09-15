import { defineConfig } from "orval"

export default defineConfig({
  biblio: {
    output: {
      mode: "split",
      target: "src/generated/biblio.ts",
      schemas: "src/generated/model",
      client: "fetch",
      prettier: true,
    },
    input: {
      target: "../../../schemas/openapi/biblio-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
