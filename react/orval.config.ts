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
        },
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: "prettier"
    },
    input: {
      target:
        // This should come from a url that will be updated if there are any changes
        "https://raw.githubusercontent.com/danskernesdigitalebibliotek/ddb-material-list/develop/spec/material-list-2.0.0.yaml"
    }
  },
  coverService: {
    output: {
      mode: "split",
      target: "src/core/cover-service-api/cover-service.ts",
      schemas: "src/core/cover-service-api/model",
      client: "react-query",
      override: {
        mutator: {
          path: "src/core/cover-service-api/mutator/fetcher.ts",
          name: "fetcher"
        },
        query: {
          useQuery: true
        },
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: "prettier"
    },
    input: {
      target: "https://cover.dandigbib.org/spec.yaml"
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
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: "prettier"
    },
    input: {
      target: "src/core/fbs/fbs-adapter.yaml"
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
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: "prettier"
    },
    input: {
      target: "src/core/publizon/publizon-adapter.yaml"
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
        fetch: {
          includeHttpResponseReturnType: false
        }
      },
      formatter: "prettier"
    },
    input: {
      target: "../cms/openapi.json"
    }
  }
});
