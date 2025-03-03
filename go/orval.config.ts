import { Options, defineConfig } from "orval"

import transformer from "./scripts/orval/add-operation-suffix.js"

const publizonConfig = (type: string): Options => ({
  output: {
    mode: "split",
    target: `lib/rest/publizon/${type}/generated/publizon.ts`,
    schemas: `lib/rest/publizon/${type}/generated/model`,
    client: "react-query",
    override: {
      mutator: {
        path: `lib/rest/publizon/${type}/mutator/fetcher.ts`,
        name: "fetcher",
      },
      query: {
        useQuery: true,
      },
    },
    prettier: true,
  },
  input: {
    target: "lib/rest/publizon/publizon-spec.yaml",
    converterOptions: {
      indent: 2,
    },
    override: {
      transformer: transformer(type),
    },
  },
})

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
  publizonAdapter: publizonConfig("adapter"),
  publizonLocalAdapter: publizonConfig("local-adapter"),
})
