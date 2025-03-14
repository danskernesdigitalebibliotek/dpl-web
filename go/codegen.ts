import type { CodegenConfig } from "@graphql-codegen/cli"
import { loadEnvConfig } from "@next/env"

import { getEnv } from "./lib/config/env"
import goConfig from "./lib/config/goConfig"

loadEnvConfig(process.cwd())

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "lib/graphql/generated/dpl-cms/graphql.tsx": {
      documents: "**/*.dpl-cms.graphql",
      // TODO: Make this configurable
      schema: {
        [getEnv("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS")]: {
          headers: {
            Authorization: `Basic ${getEnv("GRAPHQL_BASIC_TOKEN_DPL_CMS")}`,
          },
        },
      },
      plugins: ["typescript", "typescript-operations", "typescript-react-query"],
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
      },
      hooks: {
        // Correcting the codegen output.
        // First off, we correct the type of the options for the fetcher.
        afterOneFileWrite: ["yarn post-process-dpl-cms-graphql", "yarn eslint --fix"],
      },
    },
    // "lib/graphql/generated/dpl-cms/graphql.schema.json": {
    //   // TODO: Make this configurable
    //   schema: "http://dapple-cms.docker/graphql",
    //   plugins: ["introspection"],
    // },
    "lib/graphql/generated/fbi/graphql.tsx": {
      documents: "**/*.fbi.graphql",
      schema: [
        {
          [getEnv("GRAPHQL_SCHEMA_ENDPOINT_FBI")]: {
            headers: {
              Authorization: `Bearer ${getEnv("LIBRARY_TOKEN")}`,
            },
          },
        },
      ],
      plugins: ["typescript", "typescript-operations", "typescript-react-query"],
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
      },
      hooks: {
        afterOneFileWrite: ["yarn eslint --fix"],
      },
    },
  },
}

export default config
