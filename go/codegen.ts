import type { CodegenConfig } from "@graphql-codegen/cli"
import { loadEnvConfig } from "@next/env"

import { getEnv } from "./lib/config/env"
import { getDplcmsGraphqlBasicAuthToken } from "./lib/graphql/fetchers/dpl-cms.fetcher"

loadEnvConfig(process.cwd())

// The visitor-plugin-common (v6+) emits `new TypedDocumentString(...)` in string
// document mode, but the typescript-react-query plugin does not include the class
// definition. We prepend it via the "add" plugin so codegen is self-sufficient.
const typedDocumentStringContent = `
import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";
/* eslint-disable @typescript-eslint/no-explicit-any, no-underscore-dangle */
export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any, no-underscore-dangle */
`

const config: CodegenConfig = {
  overwrite: true,
  generates: {
    "lib/graphql/generated/dpl-cms/graphql.ts": {
      documents: "**/*.dpl-cms.graphql",
      // TODO: Make this configurable
      schema: {
        [getEnv("GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS")]: {
          headers: {
            Authorization: `Basic ${getDplcmsGraphqlBasicAuthToken()}`,
          },
        },
      },
      plugins: [
        { add: { content: typedDocumentStringContent } },
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
    //   schema: "http://dapple-cms.docker/graphql",
    //   plugins: ["introspection"],
    // },
    "lib/graphql/generated/fbi/graphql.ts": {
      documents: "**/*.fbi.graphql",
      schema: [
        {
          // Needs a fallback if the environment variable is not set
          [getEnv("CODEGEN_GRAPHQL_SCHEMA_ENDPOINT_FBI") || ""]: {
            headers: {
              Authorization: `Bearer ${getEnv("CODEGEN_LIBRARY_TOKEN")}`,
            },
          },
        },
      ],
      plugins: [
        { add: { content: typedDocumentStringContent } },
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
