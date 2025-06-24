import { and, not } from "xstate"

import searchMachineSetup from "./search.machine.setup"

export const initialContext = {
  searchOffset: 0,
  searchPageSize: 0,
  facetLimit: 0,
  currentQuery: "",
  submittedQuery: "",
  searchData: undefined,
  facetData: undefined,
  selectedFilters: {},
  queryClient: null,
}

export default searchMachineSetup.createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6ARgPaEAusJ6qADgMQDKAogCoD6AigKoMBKAmiwGEAMgEkGAOSYBtAAwBdRKCqFYASxKrCAO0UgAHogC0AdgCMAZlwzrAFnNmbANgCcpgEzOANCACeiUzK4xjLGABweNm6hoa5uxuYAvgneKBg4BMRkFNT0zCyMAILcAgAS+UzcIuIA4rIKSCDKahraugYIhnZuuOamzm4ArG6OA0MDMjbefgh9A7gu5uaj-eEDziNJKWhYeESk5JS0jKxVIkwiBUIsAGIiQkw8dHW6TeqaOg3thgOONlYuMkWfRkjlMoym-hCuCc8VCNhsMmczmMMM2IFSOwy+2ytAAQgB5fFMOgVAoABRYABF8eIGM8Gq8Wh9QF9RqZcG5rMNzKEFqZTJNfEZzDJ2aFgYCRfFjMEBmiMek9llDjQCUSSdxyVSaXTTPUlCo3q1PkYBaFcGDevZzIM3GCZRCOqZQnNQmYBsYIsils5Esl0dt0qoIAAbMA0Jj46rVIQMG53B7cekG5rvNqIcw2OZuKJIkaOKKOR2c7oDJzRN3i0KLAvywN4YNhiNRmNx273HhSPUvQ1M9MIOLODnmZw2cIyN1DEaOgZgnqOT02YyON3rUyOOtpBuh8NMXhkqq1eQ91PGllGMvdVyRJGLZyzheO4yji1uEVchdl9ebzGN8OFYoSmTRpezTE0EB5Sw1hBTkbTtPpq0dRwR1wB9RxCZ1kNcH8gx3XIilKLt9RA09mX0DMZQtG91w9WcwnWR1nAnXBVw9HlfTfWccO3JshHxApKRYABZfFuDpY8GVAs9yJmVwOVHX1IjcBEZFnNxHX5JEWILBdenCexkW43A-xoMTjhYNViVJCkSQKB5gMZMDzydGQ7VwfoBnHNZeV+GdIncz1rHHCcwlCIyADNVBDEgwHQVQtCgAotAgOh63iqAaAgbQwFwchUBi3L61wSLoti9KkpStKEocqSyK+YFUNGVdeVUgUJj8qwPWUzyhicZSN39BU8BKmK4oSirUq3dKI33Q8atI-t10BC0LGU4wBh5Aswifc0xx+Z9OVcUEnAiqLRvK5LJp2aaAMIiSUyNOr-BdYxoQLQdImdO1HUMG0-lFe8bAQ8Vr1O0qxsSy6qoy26gO7SSFvAvoeU6idlNFKJlPMJ8wnc1z7CXda1kMwaipGsrxqhqaEsKrdaeuhLMuy4ytAAN0IABrHKhuKs6Kchyrqagen0iG9KEHi9nMHy946nmx7FtUxx3PWRF7AGYsx3cwYwncOVSbp8mIYm6GRbwMXGdi9BCHQXAqBDfLwptgBbM3efBi7BYZ4WeYtqAJbZwhpaZOX7pIhXwLhV6zDdTMUXcAIvCFWS-iYt87HWsHzspr2cHS93RoL-mma0HLJc57myb542qe9ovbaN8Xy+D2X5Hlvskdc5XIg9cVBhnYIWKYgt9a2Q3q89q685po36+mq2bbth2SCd9BXZ5xuc6n7B89nzf-ebmXtFD4jHOk9oo+hNqR5nddtJjzODcxENCFQCB0qEm2wG37g4AAV2irAM200sqlxZuzLmbsX5vw-l-H+-9AHAISgHKWR8tAnxPBHZyhg+jd0cBMX461fQ2mdIxTkHJRhAzzKsLMRloHvwSp-dA396y-1gAAsgSCMoL1tvbR2LsoGvwYVAJhLCtxsI4UAv2KCg5oIwQjLBMkcFRFfH3EIcQNrwg1sndwiwOR9X5GOXoQN9b+i0IQCAcBdBDUwR3bBAQXDa08pybyjhfLJ06PyVCfQ9rjG6oiIySoDjUFsU5JR0Q5hq3FMuHMxMk7TEMHac0NpkJOH6CMHMMojJ-lCefU03QIluPXFmBc1YVxIRBD0MISwwRMQRKOLO-MTZC1yU9BA0phwEMnBpIcaceTLijqpXojSa65x3jTGxCi7EyTCHMDas4fj9x0VCBEb5egIXWGOEZk9Ta+2hq0-s1YoI1MWdo6Ya1oT4wzqPAM48PZb12UVUBYADlIziOaWE6zlzrV1sWRxGTMzq22Q8oW9dXnOVmZ08s61HQ3nnIuEcL0EQ3I3hPEFdc95oqgOCmSRyoUrhhcnH4Q5zALmdI-MemJ97NIxdXXAzycXtHcAiVCMQ3SRE-L8olclQQPxRUVehsDmHwPYYAxlRgbBaQsGsRYmTNFZg0gKOYKJfgggmFjTMdChFCrETsCRiC-bio6Fmdk0riFyszAqnRaz9EFkMdWAUYIkhJCAA */
  id: "search",
  initial: "bootstrap",
  context: ({ input }) => ({
    searchOffset: input.initialOffset ?? initialContext.searchOffset,
    searchPageSize: input.searchPageSize ?? initialContext.searchPageSize,
    facetLimit: input.facetLimit ?? initialContext.facetLimit,
    currentQuery: input.q ?? initialContext.currentQuery,
    submittedQuery: initialContext.submittedQuery,
    searchData: initialContext.searchData,
    facetData: initialContext.facetData,
    selectedFilters: input.filters ?? initialContext.selectedFilters,
    queryClient: input.queryClient ?? initialContext.queryClient,
  }),
  states: {
    bootstrap: {
      on: {
        SET_QUERY_CLIENT: {
          actions: ["setQueryClientInContext"],
        },
        SET_SEARCH_STRING: {
          actions: ["setCurrentQueryInContext", "setSubmittedQueryInContext"],
        },
        SET_INITIAL_FILTERS: {
          actions: ["setInitialFiltersInContext"],
        },
        BOOTSTRAP_DONE: [
          {
            guard: and(["contextHasQueryClient", "contextHasSearchString"]),
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
        TYPING: [
          {
            actions: ["setCurrentQueryInContext"],
          },
        ],
      },
    },
    idle: {
      on: {
        TOGGLE_FILTER: [
          {
            guard: "contextHasSearchString",
            actions: [
              "resetSearchData",
              "resetOffset",
              "toggleFilterInContext",
              "emitFilterToggled",
            ],
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
        TYPING: [
          {
            actions: ["setCurrentQueryInContext"],
          },
        ],
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: [
              "resetSearchData",
              "resetFilters",
              "setSubmittedQueryInContext",
              "resetOffset",
            ],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
        LOAD_MORE: {
          guard: and(["contextHasSearchString", not("maxLimitReached")]),
          actions: ["setLoadMoreValuesInContext"],
          target: "loadingMoreSearchResults",
        },
        RESET_BOOTSTRAP_STATE: {
          actions: ["resetSearchData", "resetFilters", "setSubmittedQueryInContext", "resetOffset"],
          target: "bootstrap",
        },
        RESET_CURRENT_QUERY: {
          actions: ["resetCurrentQuery"],
          target: "idle",
        },
      },
    },
    filteringAndSearching: {
      type: "parallel",
      initial: "search",
      on: {
        TYPING: [
          {
            actions: ["setCurrentQueryInContext"],
          },
        ],
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: [
              "resetSearchData",
              "resetFilters",
              "resetOffset",
              "setSubmittedQueryInContext",
            ],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
        RESET_CURRENT_QUERY: {
          actions: ["resetCurrentQuery"],
          target: "idle",
        },
      },
      states: {
        search: {
          initial: "searching",
          guard: "contextHasQueryClient",
          states: {
            searching: {
              invoke: {
                src: "performSearch",
                input: ({ context }) => {
                  if (!context.queryClient) {
                    throw new Error("QueryClient is not set in context.")
                  }

                  return {
                    q: context.currentQuery,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
                    offset: context.searchOffset,
                    limit: context.searchPageSize,
                  }
                },
                onDone: {
                  actions: ["setSearchDataInContext"],
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
        filter: {
          initial: "filtering",
          states: {
            filtering: {
              invoke: {
                src: "getFacets",
                input: ({ context }) => {
                  if (!context.queryClient) {
                    throw new Error("QueryClient is not set in context.")
                  }
                  return {
                    q: context.currentQuery,
                    queryClient: context.queryClient,
                    filters: context.selectedFilters,
                    facetLimit: context.facetLimit,
                  }
                },
                onDone: {
                  actions: ["setFacetDataInContext"],
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
      },
      onDone: {
        target: "#search.idle",
      },
    },
    loadingMoreSearchResults: {
      initial: "searching",
      guard: "contextHasQueryClient",
      states: {
        searching: {
          invoke: {
            src: "performSearch",
            input: ({ context }) => {
              if (!context.queryClient) {
                throw new Error("QueryClient is not set in context.")
              }
              return {
                q: context.currentQuery,
                queryClient: context.queryClient,
                filters: context.selectedFilters,
                offset: context.searchOffset,
                limit: context.searchPageSize,
              }
            },
            onDone: {
              actions: ["addMoreDataInContext"],
              target: "#search.idle",
            },
            onError: {},
          },
        },
      },
    },
  },
})
