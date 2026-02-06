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
      operations: {
        // The reason why we add this here is to be able to use "enabled" option in the
        // query. This lets us call it conditionally.
        getV1ProductsIdentifierLocalAdapter: {
          requestOptions: false,
        },
        getV1ProductsIdentifierAdapter: {
          requestOptions: false,
        },
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
  publizonAdapter: publizonConfig("adapter"),
  publizonLocalAdapter: publizonConfig("local-adapter"),
  fbs: {
    output: {
      mode: "split",
      target: "lib/rest/fbs/generated/fbs.ts",
      schemas: "lib/rest/fbs/generated/model",
      client: "react-query",
      override: {
        mutator: {
          path: "lib/rest/fbs/mutator/fetcher.ts",
          name: "fetcher",
        },
        query: {
          useQuery: true,
        },
        operations: {
          // The reason why we add this here is to be able to use "enabled" option in the
          // getPatronInformationByPatronIdV2 query. This lets us call it conditionally.
          getPatronInformationByPatronIdV2: {
            requestOptions: false,
          },
        },
      },
      prettier: true,
    },
    input: {
      target: "lib/rest/fbs/fbs-adapter.yaml",
      converterOptions: {
        indent: 2,
      },
    },
  },
})
