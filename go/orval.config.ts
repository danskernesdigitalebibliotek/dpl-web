import { defineConfig } from "orval"

export default defineConfig({
  coverService: {
    output: {
      mode: "split",
      target: "lib/cover-service-api/cover-service.ts",
      schemas: "lib/cover-service-api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/cover-service-api/mutator/fetcher.ts",
          name: "fetcher",
        },
        query: {
          useQuery: true,
        },
      },
      prettier: true,
    },
    input: {
      target: "https://cover.dandigbib.org/spec.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
