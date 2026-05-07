/**
 * @file
 * Config file for graphql-codegen.
 *
 * Will throw exceptions if the environment variables are not set.
 */
import type { CodegenConfig } from "@graphql-codegen/cli"
import { loadEnvConfig } from "@next/env"

import { getEnv } from "./lib/config/env"
import { getDplcmsGraphqlBasicAuthToken } from "./lib/graphql/fetchers/dpl-cms.fetcher"

loadEnvConfig(process.cwd())

const GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS = getEnv("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS")

if (!GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS) {
  throw new Error("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS is not set, cannot generate GraphQL code.")
}

const CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI = getEnv("CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI")

if (!CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI) {
  throw new Error("CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI is not set, cannot generate GraphQL code.")
}

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "lib/graphql/generated/dpl-cms/graphql.ts": {
      documents: "**/*.dpl-cms.graphql",
      // TODO: Make this configurable
      schema: {
        [GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS]: {
          headers: {
            Authorization: `Basic ${getDplcmsGraphqlBasicAuthToken()}`,
          },
        },
      },
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
        afterOneFileWrite: ["yarn post-process-dpl-cms-graphql", "yarn eslint --fix"],
      },
    },
    // "lib/graphql/generated/dpl-cms/graphql.schema.json": {
    //   // TODO: Make this configurable
    //   schema: "http://dpl-web.local/graphql",
    //   plugins: ["introspection"],
    // },
    "lib/graphql/generated/fbi/graphql.ts": {
      documents: "**/*.fbi.graphql",
      schema: [
        {
          [CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI]: {
            headers: {
              Authorization: `Bearer ${getEnv("CODEGEN_LIBRARY_TOKEN")}`,
            },
          },
        },
      ],
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
        afterOneFileWrite: ["yarn eslint --fix"],
      },
    },
  },
}

export default config
