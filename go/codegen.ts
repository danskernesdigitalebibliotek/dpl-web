import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  documents: "**/*.graphql",
  generates: {
    "generated/graphql/dpl-cms/graphql.tsx": {
      // TODO: Make this configurable
      schema: "http://dapple-cms.docker/graphql",
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-query"
      ],
      config: {
        defaultScalarType: "unknown",
        reactQueryVersion: 5,
        fetcher: {
          // TODO: Make this configurable
          endpoint: "http://dapple-cms.docker/graphql",
          fetchParams: JSON.stringify({
            headers: {
              "Content-Type": "application/json"
            }
          })
        }
      }
    },
    "generated/graphql/dpl-cms/graphql.schema.json": {
      // TODO: Make this configurable
      schema: "http://dapple-cms.docker/graphql",
      plugins: ["introspection"]
    }
  }
};

export default config;
