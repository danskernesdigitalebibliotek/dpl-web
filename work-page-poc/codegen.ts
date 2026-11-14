import type { CodegenConfig } from "@graphql-codegen/cli"

// Generates typed documents from the PoC's own FBI operations, against the
// repository's canonical FBI schema.
const config: CodegenConfig = {
  overwrite: true,
  schema: "../schemas/graphql/dbc-fbi.graphql",
  documents: "src/fbi/documents/*.graphql",
  generates: {
    "src/fbi/generated/": {
      preset: "client",
      config: {
        defaultScalarType: "unknown",
        onlyOperationTypes: true,
        useTypeImports: true,
        documentMode: "string",
      },
      presetConfig: {
        fragmentMasking: false,
      },
    },
  },
}

export default config
