/**
 * @file
 * Config file for graphql-codegen.
 */
import type { CodegenConfig } from "@graphql-codegen/cli"

// Refresh with `task dev:codegen:bnf-graphql` in cms/.
const DPL_CMS_SCHEMA_PATH = "../cms/dpl-cms.bnf.graphql"

// Refresh with `task schemas:refresh:dbc-fbi:fbcms-go`.
const FBI_SCHEMA_PATH = "../schemas/graphql/dbc-fbi.fbcms-go.graphql"

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "lib/graphql/generated/dpl-cms/graphql.ts": {
      documents: "**/*.dpl-cms.graphql",
      schema: DPL_CMS_SCHEMA_PATH,
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
        "named-operations-object",
      ],
      config: {
        enumsAsTypes: true,
        withHooks: true,
        defaultScalarType: "unknown",
        reactQueryVersion: 5,
        exposeFetcher: true,
        exposeQueryKeys: true,
        addSuspenseQuery: true,
        namingConvention: {
          typeNames: "change-case-all#pascalCase",
          transformUnderscore: true,
        },
        dedupeFragments: true,
        fetcher: "@/lib/graphql/fetchers/dpl-cms.fetcher#fetcher",
        identifierName: "operationNames",
      },
      hooks: {
        // Correcting the codegen output.
        // First off, we correct the type of the options for the fetcher.
        afterOneFileWrite: ["pnpm run post-process-dpl-cms-graphql", "pnpm run eslint --fix"],
      },
    },
    "lib/graphql/generated/fbi/graphql.ts": {
      documents: "**/*.fbi.graphql",
      schema: FBI_SCHEMA_PATH,
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query",
        "named-operations-object",
      ],
      config: {
        enumsAsTypes: true,
        withHooks: true,
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
        identifierName: "operationNames",
        useConsts: true,
      },
      hooks: {
        afterOneFileWrite: ["pnpm run eslint --fix"],
      },
    },
  },
}

export default config
