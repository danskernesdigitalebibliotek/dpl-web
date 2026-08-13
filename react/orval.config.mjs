import { defineConfig } from "orval";

export default defineConfig({
  materialList: {
    output: {
      clean: ['!**/mutator/*.*'],
      mode: "split",
      target: "src/core/material-list-api/material-list.ts",
      schemas: "src/core/material-list-api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/material-list-api/mutator/mutator.ts",
          name: "mutator"
        },
        fetch: {
          includeHttpResponseReturnType: false,
        }
      },
      formatter: 'prettier',
    },
    input: {
      target: "../schemas/openapi/material-list.yaml"
    }
  },
  fbsAdapter: {
    output: {
      clean: ['!**/mutator/*.*'],
      mode: "split",
      target: "src/core/fbs/fbs.ts",
      schemas: "src/core/fbs/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/fbs/mutator/mutator.ts",
          name: "mutator"
        },
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: 'prettier',
    },
    input: {
      target: "../schemas/openapi/fbs-adapter.yaml",
    }
  },
  publizonAdapter: {
    output: {
      clean: ['!**/mutator/*.*', '!**/productType.ts'],
      mode: "split",
      target: "src/core/publizon/publizon.ts",
      schemas: "src/core/publizon/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/publizon/mutator/mutator.ts",
          name: "mutator"
        },
        fetch: {
          includeHttpResponseReturnType: false,
        },
      },
      formatter: 'prettier',
    },
    input: {
      target: "../schemas/openapi/publizon-adapter.yaml"
    }
  },
  dplCms: {
    output: {
      clean: ['!**/mutator/*.*'],
      mode: "split",
      target: "src/core/dpl-cms/dpl-cms.ts",
      schemas: "src/core/dpl-cms/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/dpl-cms/mutator/mutator.ts",
          name: "mutator"
        },
        fetch: {
          includeHttpResponseReturnType: false
        },
      },
      formatter: 'prettier',
    },
    input: {
      target: "../cms/openapi.json",
      unsafeDisableValidation: true
    }
  }
});
