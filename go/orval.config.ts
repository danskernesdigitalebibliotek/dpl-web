import { defineConfig } from "orval"

export default defineConfig({
  coverService: {
    output: {
      mode: "split",
      target: "lib/rest/cover-service-api/generated/cover-service.ts",
      schemas: "lib/rest/cover-service-api/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/rest/cover-service-api/mutator/fetcher.ts",
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
      target: "lib/rest/publizon-api/generated/publizon.ts",
      schemas: "lib/rest/publizon-api/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/rest/publizon-api/mutator/fetcher.ts",
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
      target: "lib/rest/publizon-api/publizon-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
