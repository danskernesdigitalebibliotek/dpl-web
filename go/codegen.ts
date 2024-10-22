import type { CodegenConfig } from "@graphql-codegen/cli"

const config: CodegenConfig = {
  overwrite: true,
  generates: {
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
