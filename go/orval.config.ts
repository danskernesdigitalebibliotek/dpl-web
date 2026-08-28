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
      fetch: {
        includeHttpResponseReturnType: false,
      },
    },
    formatter: "prettier",
  },
  input: {
    target: "../schemas/openapi/publizon-adapter.yaml",
    override: {
      transformer: transformer(type),
    },
  },
})

export default defineConfig({
  publizonAdapter: publizonConfig("adapter"),
  publizonLocalAdapter: publizonConfig("local-adapter"),
})
