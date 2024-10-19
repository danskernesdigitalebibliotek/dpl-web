import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    // Uncomment this when making these babies underneath work.
    // "lib/graphql/generated/dpl-cms/graphql.tsx": {
    //   documents: "**/*.dpl-cms.graphql",
    //   // TODO: Make this configurable
    //   schema: "http://dapple-cms.docker/graphql",
    //   plugins: ["typescript", "typescript-operations", "typescript-react-query"],
    //   config: {
    //     defaultScalarType: "unknown",
    //     reactQueryVersion: 5,
    //     exposeFetcher: true,
    //     exposeQueryKeys: true,
    //     addSuspenseQuery: true,
    //     fetcher: {
    //       // TODO: Make this configurable
    //       endpoint: "http://dapple-cms.docker/graphql",
    //       fetchParams: JSON.stringify({
    //         headers: {
    //           "Content-Type": "application/json",
    //         },
    //       }),
    //     },
    //   },
    //   hooks: {
    //     afterOneFileWrite: ["yarn eslint --fix"],
    //   },
    // },
    // "lib/graphql/generated/dpl-cms/graphql.schema.json": {
    //   // TODO: Make this configurable
    //   schema: "http://dapple-cms.docker/graphql",
    //   plugins: ["introspection"],
    // },
    "lib/graphql/generated/fbi/graphql.tsx": {
      documents: "**/*.fbi.graphql",
      schema: [
        {
          // TODO: Make this configurable
          "https://fbi-api.dbc.dk/ereolgo/graphql": {
            headers: {
              Authorization: `Bearer ${process.env.LIBRARY_TOKEN ?? ""}`,
            },
          },
        },
      ],
      plugins: ["typescript", "typescript-operations", "typescript-react-query"],
      config: {
        // futureProofEnums: true,
        // withHooks: true,
        defaultScalarType: "unknown",
        reactQueryVersion: 5,
        exposeFetcher: true,
        exposeQueryKeys: true,
        addSuspenseQuery: true,
        namingConvention: {
          typeNames: "change-case-all#pascalCase",
          transformUnderscore: true,
        },
        fetcher: "@/lib/graphql/fetchers/fbi.fetcher#fetchData",
      },
      hooks: {
        afterOneFileWrite: ["yarn eslint --fix"],
      },
    },
  },
}

export default config
