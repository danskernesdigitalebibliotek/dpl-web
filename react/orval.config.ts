import { defineConfig } from "orval";

export default defineConfig({
  materialList: {
    output: {
      mode: "split",
      target: "src/core/material-list-api/material-list.ts",
      schemas: "src/core/material-list-api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/material-list-api/mutator/fetcher.ts",
          name: "fetcher"
        },
        query: {
          useQuery: true
        }
      },
      prettier: true
    },
    input: {
      target: "../schemas/openapi/material-list.yaml",
      converterOptions: {
        indent: 2
      }
    }
  },
  fbsAdapter: {
    output: {
      mode: "split",
      target: "src/core/fbs/fbs.ts",
      schemas: "src/core/fbs/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/fbs/mutator/fetcher.ts",
          name: "fetcher"
        },
        query: {
          useQuery: true
        },
        operations: {
          // The reason why we add this here is to be able to use "enabled" option in the
          // getPatronInformationByPatronIdV2 query. This lets us call it conditionally.
          getPatronInformationByPatronIdV4: {
            requestOptions: false
          }
        }
      },
      prettier: true
    },
    input: {
      target: "../schemas/openapi/fbs-adapter.yaml",
      converterOptions: {
        indent: 2
      }
    }
  },
  publizonAdapter: {
    output: {
      mode: "split",
      target: "src/core/publizon/publizon.ts",
      schemas: "src/core/publizon/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/publizon/mutator/fetcher.ts",
          name: "fetcher"
        },
        query: {
          useQuery: true
        },
        operations: {
          // The reason why we add this here is to be able to use "enabled" option in the
          // useGetV1LoanstatusIdentifier query. This lets us call it conditionally.
          getV1LoanstatusIdentifier: {
            requestOptions: false
          }
        }
      },
      prettier: true
    },
    input: {
      target: "../schemas/openapi/publizon-adapter.yaml",
      converterOptions: {
        indent: 2
      }
    }
  },
  dplCms: {
    output: {
      mode: "split",
      target: "src/core/dpl-cms/dpl-cms.ts",
      schemas: "src/core/dpl-cms/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/dpl-cms/mutator/fetcher.ts",
          name: "fetcher"
        },
        query: {
          useQuery: true
        },
        operations: {
          // The reason why we add this here is to be able to use "enabled" option in the
          // proxy-url:GET query. This lets us call it conditionally.
          "proxy-url:GET": {
            requestOptions: false
          },
          "dpl_opening_hours_list:GET": {
            requestOptions: false
          }
        }
      },
      prettier: true
    },
    input: {
      target:
        "../cms/openapi.json",
      converterOptions: {
        indent: 2
      }
    }
  }
});
