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
  publizonAdapter: {
    output: {
      mode: "split",
      target: "lib/publizon-api/publizon.ts",
      schemas: "lib/publizon-api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/publizon-api/mutator/fetcher.ts",
          name: "fetcher",
        },
        query: {
          useQuery: true,
        },
        operations: {
          // The reason why we add this here is to be able to use "enabled" option in the
          // publizon adapter queries. This lets us call them conditionally.
          getV1LoanstatusIdentifier: {
            requestOptions: false,
          },
        },
      },
      prettier: true,
    },
    input: {
      target: "lib/publizon-api/publizon-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
